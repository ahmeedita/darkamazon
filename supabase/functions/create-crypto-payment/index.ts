import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Wallet addresses for receiving payments (forward addresses)
const WALLET_ADDRESSES: Record<string, string> = {
  btc: "1PcxUzNDBv5WgmLnYNoAdC5qQBdaGuFhUR",
  ltc: "LYPP7kKneHqaVXjQvedQf9fqsu5zfHSgzS",
  xmr: "4ADuT2s1u6sctreg5Tm1Ce5jir9gpeNRAZhHGWs2LK1cLobktsBw3iDWb4KDzPoHwhV4cX8EDMwZ7EQP4RcWu1Y2Dg8WeJB",
  eth: "0x4f1ab5d41e31c9f13968a65bfb04b97528b32c2a",
};

// Valid crypto symbols
const VALID_SYMBOLS = ['btc', 'ltc', 'xmr', 'eth'];

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log("Unauthorized: No auth header");
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client with service role to verify user
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Extract token from Bearer header
    const token = authHeader.replace('Bearer ', '');
    
    // Create admin client to verify the JWT
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      console.log("Unauthorized: Invalid token", authError?.message);
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { symbol, orderId, amount, deliveryEmail, recipientEmail } = await req.json();
    
    // Input validation
    if (!symbol || typeof symbol !== 'string') {
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

    if (!orderId || typeof orderId !== 'string' || orderId.length > 100) {
      return new Response(
        JSON.stringify({ error: "Invalid order ID" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!amount || typeof amount !== 'number' || amount <= 0 || amount > 100000) {
      return new Response(
        JSON.stringify({ error: "Invalid amount" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate email formats if provided
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (deliveryEmail && (typeof deliveryEmail !== 'string' || !emailRegex.test(deliveryEmail))) {
      return new Response(
        JSON.stringify({ error: "Invalid delivery email" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (recipientEmail && (typeof recipientEmail !== 'string' || recipientEmail.length > 255)) {
      return new Response(
        JSON.stringify({ error: "Invalid recipient email" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Creating payment for user ${user.id}, order: ${orderId}, amount: $${amount}`);

    const forwardAddress = WALLET_ADDRESSES[cryptoSymbol];

    const apiKey = Deno.env.get("NOKYCPAY_API_KEY");
    if (!apiKey) {
      console.error("NOKYCPAY_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Payment service unavailable" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch crypto price from CoinGecko
    const coinIds: Record<string, string> = {
      btc: 'bitcoin',
      eth: 'ethereum',
      ltc: 'litecoin',
      xmr: 'monero',
    };
    
    let cryptoAmount = 0;
    try {
      const priceRes = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds[cryptoSymbol]}&vs_currencies=usd`
      );
      const priceData = await priceRes.json();
      const cryptoPrice = priceData[coinIds[cryptoSymbol]]?.usd;
      if (cryptoPrice) {
        cryptoAmount = amount / cryptoPrice;
      }
    } catch (priceError) {
      console.error("Error fetching crypto price");
    }

    const webhookPayload = JSON.stringify({
      order_id: orderId,
      amount,
      delivery_email: deliveryEmail ?? null,
      recipient_email: recipientEmail ?? null,
    });

    if (webhookPayload.length > 500) {
      return new Response(
        JSON.stringify({ error: "Payment metadata is too long" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Calling NoKYCPay API for ${cryptoSymbol} payment...`);
    
    const requestBody = {
      crypto_currency: cryptoSymbol,
      forward_address: forwardAddress,
      webhook_payload: webhookPayload,
      api_key: apiKey,
    };
    
    console.log(`Request body (without api_key): ${JSON.stringify({ ...requestBody, api_key: '[REDACTED]' })}`);

    let nokycpayResponse: Response;
    try {
      nokycpayResponse = await fetch("https://nokycpay.me/api/createAddress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
    } catch (fetchError) {
      console.error(`NoKYCPay fetch failed: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
      return new Response(
        JSON.stringify({ error: "Unable to reach payment provider. Please try again." }),
        { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const responseText = await nokycpayResponse.text();
    console.log(`NoKYCPay response status: ${nokycpayResponse.status}`);
    console.log(`NoKYCPay response body: ${responseText}`);

    let nokycpayData: Record<string, unknown>;
    try {
      nokycpayData = JSON.parse(responseText);
    } catch {
      console.error(`Failed to parse NoKYCPay response: ${responseText}`);
      return new Response(
        JSON.stringify({ error: "Invalid response from payment service" }),
        { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!nokycpayResponse.ok || typeof nokycpayData.generated_address !== 'string') {
      const message = typeof nokycpayData.message === 'string' ? nokycpayData.message : 'Failed to create payment address';
      console.error(`Payment API error: ${nokycpayResponse.status} - ${message}`);
      return new Response(
        JSON.stringify({ error: message }),
        { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    console.log(`Payment created successfully: ${nokycpayData.generated_address}`);

    return new Response(
      JSON.stringify({
        success: true,
        paymentAddress: nokycpayData.generated_address,
        symbol: cryptoSymbol.toUpperCase(),
        orderId,
        amount,
        cryptoAmount: cryptoAmount.toFixed(8),
        expiresAt: nokycpayData.expires_at,
        uniqueId: nokycpayData.unique_id,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error(`Payment creation failed: ${error instanceof Error ? error.message : String(error)}`);
    return new Response(
      JSON.stringify({ error: "Payment processing failed" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
