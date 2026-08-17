import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Max seconds credited between two heartbeats. Heartbeats fire ~every 30s, so
// this caps inflation if a tab is backgrounded or a heartbeat is delayed.
const MAX_DELTA_SECONDS = 90;

function json(payload: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Pull the client IP out of the standard proxy headers.
function getClientIp(req: Request): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip");
}

// Best-effort geolocation via a free, keyless service. Never throws.
async function geolocate(ip: string): Promise<{ country: string | null; city: string | null }> {
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`);
    if (!res.ok) return { country: null, city: null };
    const data = await res.json();
    return {
      country: typeof data.country_name === "string" ? data.country_name : null,
      city: typeof data.city === "string" ? data.city : null,
    };
  } catch (_e) {
    return { country: null, city: null };
  }
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Authentication required" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await admin.auth.getUser(token);
    if (authError || !user) return json({ error: "Invalid authentication" }, 401);

    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();
    if (!profile) return json({ error: "Profile not found" }, 404);

    const body = await req.json().catch(() => ({}));
    const sessionId = typeof body.sessionId === "string" ? body.sessionId : null;
    const ip = getClientIp(req);
    const userAgent = req.headers.get("user-agent") ?? null;
    const now = Date.now();

    // Existing session heartbeat: credit the capped delta since last_seen_at.
    if (sessionId) {
      const { data: session } = await admin
        .from("user_sessions")
        .select("id, last_seen_at, duration_seconds")
        .eq("id", sessionId)
        .eq("user_id", profile.id)
        .maybeSingle();

      if (session) {
        const lastSeen = new Date(session.last_seen_at).getTime();
        const delta = Math.min(Math.max(Math.floor((now - lastSeen) / 1000), 0), MAX_DELTA_SECONDS);

        await admin
          .from("user_sessions")
          .update({
            last_seen_at: new Date(now).toISOString(),
            duration_seconds: (session.duration_seconds ?? 0) + delta,
          })
          .eq("id", session.id);

        // Increment the running total on the profile via RPC-free read+write.
        const { data: prof } = await admin
          .from("profiles")
          .select("total_time_seconds")
          .eq("id", profile.id)
          .single();

        await admin
          .from("profiles")
          .update({
            total_time_seconds: (prof?.total_time_seconds ?? 0) + delta,
            last_active_at: new Date(now).toISOString(),
          })
          .eq("id", profile.id);

        return json({ sessionId: session.id, credited: delta }, 200);
      }
    }

    // No valid session yet: geolocate and create one.
    const geo = ip ? await geolocate(ip) : { country: null, city: null };

    const { data: created, error: createError } = await admin
      .from("user_sessions")
      .insert({
        user_id: profile.id,
        ip,
        country: geo.country,
        city: geo.city,
        user_agent: userAgent,
        started_at: new Date(now).toISOString(),
        last_seen_at: new Date(now).toISOString(),
        duration_seconds: 0,
      })
      .select("id")
      .single();

    if (createError || !created) {
      console.error("Failed to create session:", createError);
      return json({ error: "Failed to start session" }, 500);
    }

    // Refresh the profile's latest IP/country snapshot.
    await admin
      .from("profiles")
      .update({
        last_ip: ip,
        country: geo.country,
        city: geo.city,
        last_active_at: new Date(now).toISOString(),
      })
      .eq("id", profile.id);

    return json({ sessionId: created.id, credited: 0 }, 200);
  } catch (error) {
    console.error("track-session error:", error);
    return json({ error: "Internal server error" }, 500);
  }
});
