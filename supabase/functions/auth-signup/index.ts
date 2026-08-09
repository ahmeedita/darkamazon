import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Canonical synthetic email domain for username-based accounts.
// Must be a valid TLD — Supabase rejects .local as email_address_invalid.
const EMAIL_DOMAIN = "darkamazon.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const body = await req.json().catch(() => ({}));
    const rawUsername = typeof body.username === "string" ? body.username : "";
    const password = typeof body.password === "string" ? body.password : "";
    const recoveryPhraseHash =
      typeof body.recoveryPhraseHash === "string" ? body.recoveryPhraseHash : null;

    const username = rawUsername.toLowerCase().trim();

    // --- validation ---
    if (!/^[a-z0-9_]{3,30}$/.test(username)) {
      return json({ error: "Username must be 3-30 characters (letters, numbers, underscore)." }, 400);
    }
    if (password.length < 6) {
      return json({ error: "Password must be at least 6 characters." }, 400);
    }

    // --- uniqueness check ---
    const { data: existing, error: existingError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (existingError) {
      console.error("uniqueness check failed:", existingError);
      return json({ error: "Signup failed. Please try again." }, 500);
    }
    if (existing) {
      return json({ error: "Username already taken" }, 409);
    }

    // --- create a confirmed auth user (no email sent) ---
    const email = `${username}@${EMAIL_DOMAIN}`;
    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username },
    });

    if (createError || !created?.user) {
      console.error("createUser failed:", createError);
      if (createError?.message?.toLowerCase().includes("already")) {
        return json({ error: "Username already taken" }, 409);
      }
      return json({ error: "Signup failed. Please try again." }, 500);
    }

    const authUserId = created.user.id;

    // --- create the linked profile (service role bypasses RLS) ---
    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      auth_user_id: authUserId,
      username,
      recovery_phrase_hash: recoveryPhraseHash,
    });

    if (profileError) {
      // roll back the auth user so the username stays free
      await supabaseAdmin.auth.admin.deleteUser(authUserId).catch(() => {});
      console.error("profile insert failed:", profileError);
      if (profileError.code === "23505") {
        return json({ error: "Username already taken" }, 409);
      }
      return json({ error: "Signup failed. Please try again." }, 500);
    }

    return json({ success: true }, 200);
  } catch (error) {
    console.error("auth-signup error:", error);
    return json({ error: "Internal server error" }, 500);
  }
});

function json(payload: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
