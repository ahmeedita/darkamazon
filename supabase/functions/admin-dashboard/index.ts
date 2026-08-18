import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function response(payload: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return response({ error: "Method not allowed" }, 405);

  try {
    const authorization = req.headers.get("Authorization");
    if (!authorization) return response({ error: "Authentication required" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const token = authorization.replace(/^Bearer\s+/i, "");
    const { data: authData, error: authError } = await admin.auth.getUser(token);
    if (authError || !authData.user) return response({ error: "Invalid session" }, 401);

    const body = await req.json().catch(() => ({}));
    const passcode = typeof body.passcode === "string" ? body.passcode : "";
    if (!passcode || passcode.length > 128) return response({ error: "Invalid credentials" }, 403);

    const { data: secrets, error: secretError } = await admin
      .from("integration_secrets")
      .select("key, value")
      .in("key", ["ADMIN_USERNAME", "ADMIN_PASSCODE_SHA256"]);
    if (secretError) return response({ error: "Admin service unavailable" }, 503);

    const secretMap = Object.fromEntries((secrets ?? []).map((secret) => [secret.key, secret.value]));
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id, username, auth_user_id")
      .eq("auth_user_id", authData.user.id)
      .maybeSingle();

    const passcodeHash = await sha256(passcode);
    if (
      profileError ||
      !profile ||
      profile.username !== secretMap.ADMIN_USERNAME ||
      passcodeHash !== secretMap.ADMIN_PASSCODE_SHA256
    ) {
      return response({ error: "Invalid credentials" }, 403);
    }

    const [{ data: profiles, error: profilesError }, { data: carts, error: cartsError }, { data: orders, error: ordersError }, { data: sessions, error: sessionsError }] = await Promise.all([
      admin.from("profiles").select("id, username, auth_user_id, created_at, first_seen_at, last_active_at, last_ip, country, city, total_time_seconds").order("last_active_at", { ascending: false }),
      admin.from("cart_items").select("user_id, product_id, product_type, name, price, details, created_at").order("created_at", { ascending: false }),
      admin.from("orders").select("user_id, order_id, items, total, status, created_at, expires_at, delivery_email, recipient_email, payment_currency, payment_address").order("created_at", { ascending: false }),
      admin.from("user_sessions").select("user_id, ip, country, city, user_agent, started_at, last_seen_at, duration_seconds").order("last_seen_at", { ascending: false }).limit(1000),
    ]);

    if (profilesError || cartsError || ordersError || sessionsError) {
      console.error("admin-dashboard query failed", { profilesError, cartsError, ordersError, sessionsError });
      return response({ error: "Dashboard data unavailable" }, 503);
    }

    return response({
      generatedAt: new Date().toISOString(),
      profiles: profiles ?? [],
      carts: carts ?? [],
      orders: orders ?? [],
      sessions: sessions ?? [],
    });
  } catch (error) {
    console.error("admin-dashboard error", error);
    return response({ error: "Admin service unavailable" }, 500);
  }
});
