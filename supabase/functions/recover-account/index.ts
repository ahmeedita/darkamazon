import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple hash function matching the frontend
async function hashRecoveryPhrase(phrase: string): Promise<string> {
  const normalized = phrase.toLowerCase().trim().replace(/\s+/g, ' ');
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { recoveryPhrase }: { recoveryPhrase: string } = await req.json();

    if (!recoveryPhrase || typeof recoveryPhrase !== 'string') {
      return new Response(
        JSON.stringify({ error: "Recovery phrase is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate recovery phrase format (6 words)
    const words = recoveryPhrase.trim().split(/\s+/);
    if (words.length !== 6) {
      return new Response(
        JSON.stringify({ error: "Invalid recovery phrase format. Must be 6 words." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Hash the recovery phrase
    const phraseHash = await hashRecoveryPhrase(recoveryPhrase);

    // Find profile with matching recovery phrase hash
    const { data: profiles, error: searchError } = await supabaseAdmin
      .from('profiles')
      .select('id, username, auth_user_id')
      .eq('recovery_phrase_hash', phraseHash)
      .limit(1);

    if (searchError) {
      console.error('Search error:', searchError);
      return new Response(
        JSON.stringify({ error: "Recovery failed. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid recovery phrase. Please check and try again." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const matchedProfile = profiles[0];

    return new Response(
      JSON.stringify({ 
        success: true,
        username: matchedProfile.username 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});