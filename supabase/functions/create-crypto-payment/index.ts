import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Wallet addresses for receiving payments
const WALLET_ADDRESSES: Record<string, string> = {
  btc: "1PcxUzNDBv5WgmLnYNoAdC5qQBdaGuFhUR",
  bnb: "0x4f1ab5d41e31c9f13968a65bfb04b97528b32c2a",
  sol: "59Levrr2hfKX6LRcbCUvkXeQG7xuNGYdapz8R4xi128Q",
  eth: "0x4f1ab5d41e31c9f13968a65bfb04b97528b32c2a",
};

interface PaymentRequest {
  symbol: string;
  orderId: string;
  amount: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol, orderId, amount }: PaymentRequest = await req.json();
    
    console.log(`Creating payment for ${symbol}, order: ${orderId}, amount: $${amount}`);

    const cryptoSymbol = symbol.toLowerCase();
    const destinationAddress = WALLET_ADDRESSES[cryptoSymbol];

    if (!destinationAddress) {
      return new Response(
        JSON.stringify({ error: `Unsupported cryptocurrency: ${symbol}` }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Call Cryptway API to create payment address
    const cryptwayResponse = await fetch(
      `https://api.cryptway.io/v1/payments/cryptos/${cryptoSymbol}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: destinationAddress,
          confirmations: 2,
        }),
      }
    );

    if (!cryptwayResponse.ok) {
      const errorText = await cryptwayResponse.text();
      console.error("Cryptway API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to create payment address", details: errorText }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const cryptwayData = await cryptwayResponse.json();
    console.log("Cryptway response:", cryptwayData);

    return new Response(
      JSON.stringify({
        success: true,
        paymentAddress: cryptwayData.address || destinationAddress,
        symbol: cryptoSymbol.toUpperCase(),
        orderId,
        amount,
        data: cryptwayData,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in create-crypto-payment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
