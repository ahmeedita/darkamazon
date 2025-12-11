import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol, orderId, amount, deliveryEmail, recipientEmail } = await req.json();
    
    console.log(`Creating NoKYCPay payment for ${symbol}, order: ${orderId}, amount: $${amount}`);

    const cryptoSymbol = symbol.toLowerCase();
    const forwardAddress = WALLET_ADDRESSES[cryptoSymbol];

    if (!forwardAddress) {
      return new Response(
        JSON.stringify({ error: `Unsupported cryptocurrency: ${symbol}` }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const apiKey = Deno.env.get("NOKYCPAY_API_KEY");
    if (!apiKey) {
      console.error("NOKYCPAY_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Payment service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const webhookPayload = JSON.stringify({
      order_id: orderId,
      amount: amount,
      delivery_email: deliveryEmail,
      recipient_email: recipientEmail,
    });

    const nokycpayResponse = await fetch("https://nokycpay.me/api/createAddress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        crypto_currency: cryptoSymbol,
        forward_address: forwardAddress,
        webhook_payload: webhookPayload,
        api_key: apiKey,
      }),
    });

    if (!nokycpayResponse.ok) {
      const errorText = await nokycpayResponse.text();
      console.error("NoKYCPay API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to create payment address", details: errorText }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const nokycpayData = await nokycpayResponse.json();
    console.log("NoKYCPay response:", nokycpayData);

    return new Response(
      JSON.stringify({
        success: true,
        paymentAddress: nokycpayData.generated_address,
        symbol: cryptoSymbol.toUpperCase(),
        orderId,
        amount,
        expiresAt: nokycpayData.expires_at,
        uniqueId: nokycpayData.unique_id,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error in create-crypto-payment:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
