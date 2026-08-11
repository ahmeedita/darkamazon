import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-nowpayments-sig",
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

// Recursively sort object keys, matching NOWPayments' documented signing scheme.
function sortObject(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(sortObject);
  }
  if (obj !== null && typeof obj === "object") {
    return Object.keys(obj as Record<string, unknown>)
      .sort()
      .reduce((result: Record<string, unknown>, key) => {
        result[key] = sortObject((obj as Record<string, unknown>)[key]);
        return result;
      }, {});
  }
  return obj;
}

async function hmacSha512Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Payment statuses that indicate the funds have actually arrived and settled.
const FINAL_SUCCESS_STATUSES = ["finished", "confirmed"];
const FAILURE_STATUSES = ["failed", "expired", "refunded"];

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const ipnSecret = await getSecret(supabaseAdmin, "NOWPAYMENTS_IPN_SECRET");
    if (!ipnSecret) {
      console.error("NOWPAYMENTS_IPN_SECRET not configured");
      return new Response(
        JSON.stringify({ error: "IPN verification unavailable" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const signatureHeader = req.headers.get("x-nowpayments-sig");
    if (!signatureHeader) {
      console.log("IPN rejected: missing x-nowpayments-sig header");
      return new Response(
        JSON.stringify({ error: "Missing signature" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const rawBody = await req.text();
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      console.log("IPN rejected: invalid JSON body");
      return new Response(
        JSON.stringify({ error: "Invalid JSON" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const sortedPayload = sortObject(payload);
    const signedString = JSON.stringify(sortedPayload);
    const expectedSignature = await hmacSha512Hex(ipnSecret, signedString);

    if (expectedSignature !== signatureHeader) {
      console.log("IPN rejected: signature mismatch");
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const orderId = payload.order_id;
    const paymentStatus = payload.payment_status;
    const paymentId = payload.payment_id;

    if (!orderId || typeof orderId !== "string") {
      console.log("IPN rejected: missing order_id in payload");
      return new Response(
        JSON.stringify({ error: "Missing order_id" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`IPN verified for order ${orderId}, payment ${paymentId}, status: ${paymentStatus}`);

    const { data: order, error: fetchError } = await supabaseAdmin
      .from("orders")
      .select("id, status, order_id")
      .eq("order_id", orderId)
      .single();

    if (fetchError || !order) {
      console.error(`IPN: order ${orderId} not found`);
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Never downgrade an already-completed or canceled order.
    if (order.status !== "pending") {
      console.log(`IPN: order ${orderId} already in terminal state (${order.status}), ignoring`);
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const statusStr = typeof paymentStatus === "string" ? paymentStatus : "";
    let newStatus: "pending" | "completed" | "canceled" = "pending";
    if (FINAL_SUCCESS_STATUSES.includes(statusStr)) {
      newStatus = "completed";
    } else if (FAILURE_STATUSES.includes(statusStr)) {
      newStatus = "canceled";
    }

    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        payment_status: statusStr || null,
        status: newStatus,
      })
      .eq("order_id", orderId);

    if (updateError) {
      console.error(`IPN: failed to update order ${orderId}: ${updateError.message}`);
      return new Response(
        JSON.stringify({ error: "Failed to update order" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Order ${orderId} updated to status: ${newStatus} (payment_status: ${statusStr})`);

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error(`IPN processing failed: ${detail}`);
    return new Response(
      JSON.stringify({ error: "IPN processing failed" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
