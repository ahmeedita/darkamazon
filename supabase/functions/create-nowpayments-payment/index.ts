import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Resolve a secret: prefer an edge-function env var if one is set, otherwise
// fall back to the locked-down integration_secrets table (service-role only).
async function getSecret(admin: SupabaseClient, key: string): Promise<string | null> {
  const fromEnv = Deno.env.get(key);
  if (fromEnv) return fromEnv;

  const { data, error } = await admin
    .from("integration_secrets")
    .select("value")
    .eq("key", key)
    .single();

  if (error || !data?.value) {
    console.error(`Secret ${key} not found in env or integration_secrets: ${error?.message ?? "missing"}`);
    return null;
  }
  return data.value as string;
}

// Supported NOWPayments pay_currency tickers (must match the coins enabled on
// the merchant account). Funds settle to the NOWPayments Custody balance and
// are withdrawn from the dashboard, so no per-currency payout wallet is needed.
const VALID_SYMBOLS = [
  "btc",
  "ltc",
  "usdtbsc",   // USDT BEP20 (BNB Smart Chain)
  "usdttrc20", // USDT TRC20 (Tron)
  "usdterc20", // USDT ERC20 (Ethereum)
  "xmr",
  "bnbbsc",    // BNB (BNB Smart Chain)
  "eth",
];

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const token = authHeader.replace("Bearer ", "");
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { symbol, orderId, amount } = await req.json();

    if (!symbol || typeof symbol !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid symbol" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const cryptoSymbol = symbol.toLowerCase();
    if (!VALID_SYMBOLS.includes(cryptoSymbol)) {
      return new Response(
        JSON.stringify({ error: "Unsupported cryptocurrency" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!orderId || typeof orderId !== "string" || orderId.length > 100) {
      return new Response(
        JSON.stringify({ error: "Invalid order ID" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!amount || typeof amount !== "number" || amount <= 0 || amount > 100000) {
      return new Response(
        JSON.stringify({ error: "Invalid amount" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Confirm the order belongs to this user and is still pending before creating a payment.
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id, status, user_id")
      .eq("order_id", orderId)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    if (!profile || order.user_id !== profile.id) {
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (order.status !== "pending") {
      return new Response(
        JSON.stringify({ error: "Order is no longer pending" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const apiKey = await getSecret(supabaseAdmin, "NOWPAYMENTS_API_KEY");
    if (!apiKey) {
      console.error("NOWPAYMENTS_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Payment service unavailable" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const ipnCallbackUrl = `${supabaseUrl}/functions/v1/nowpayments-ipn-callback`;

    const requestBody = {
      price_amount: amount,
      price_currency: "usd",
      pay_currency: cryptoSymbol,
      order_id: orderId,
      order_description: `Order ${orderId}`,
      ipn_callback_url: ipnCallbackUrl,
    };

    console.log(`Calling NOWPayments API for ${cryptoSymbol} payment, order ${orderId}...`);

    let nowResponse: Response;
    try {
      nowResponse = await fetch("https://api.nowpayments.io/v1/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify(requestBody),
      });
    } catch (fetchError) {
      const detail = fetchError instanceof Error ? fetchError.message : String(fetchError);
      console.error(`NOWPayments fetch failed: ${detail}`);
      return new Response(
        JSON.stringify({ error: `Unable to reach payment provider: ${detail}` }),
        { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const responseText = await nowResponse.text();
    console.log(`NOWPayments response status: ${nowResponse.status}`);
    console.log(`NOWPayments response body: ${responseText}`);

    let nowData: Record<string, unknown>;
    try {
      nowData = JSON.parse(responseText);
    } catch {
      console.error(`Failed to parse NOWPayments response: ${responseText}`);
      return new Response(
        JSON.stringify({ error: `Invalid response from payment service: ${responseText.slice(0, 200)}` }),
        { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!nowResponse.ok || typeof nowData.pay_address !== "string") {
      const message = typeof nowData.message === "string"
        ? nowData.message
        : (typeof nowData.error === "string" ? nowData.error : "Failed to create payment address");
      console.error(`Payment API error: ${nowResponse.status} - ${message}`);
      return new Response(
        JSON.stringify({ error: message }),
        { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Persist payment details so the IPN callback can find this order and the UI can resume.
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        payment_address: nowData.pay_address as string,
        payment_currency: cryptoSymbol.toUpperCase(),
        payment_provider: "nowpayments",
        payment_id: String(nowData.payment_id),
        pay_amount: typeof nowData.pay_amount === "number" ? nowData.pay_amount : null,
        payment_status: typeof nowData.payment_status === "string" ? nowData.payment_status : "waiting",
      })
      .eq("order_id", orderId);

    if (updateError) {
      console.error(`Failed to persist payment details: ${updateError.message}`);
    }

    console.log(`Payment created successfully: ${nowData.pay_address}`);

    return new Response(
      JSON.stringify({
        success: true,
        paymentAddress: nowData.pay_address,
        symbol: cryptoSymbol.toUpperCase(),
        orderId,
        amount,
        cryptoAmount: typeof nowData.pay_amount === "number" ? nowData.pay_amount.toFixed(8) : null,
        expiresAt,
        paymentId: nowData.payment_id,
        paymentStatus: nowData.payment_status,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error(`Payment creation failed: ${detail}`);
    return new Response(
      JSON.stringify({ error: `Payment processing failed: ${detail}` }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
