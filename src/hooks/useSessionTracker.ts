import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

const HEARTBEAT_MS = 60_000;

export function useSessionTracker(userId: string | null) {
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userId) {
      sessionIdRef.current = null;
      return;
    }

    let active = true;
    const send = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken || !active) return;

      const { data, error } = await supabase.functions.invoke('track-session', {
        body: sessionIdRef.current ? { sessionId: sessionIdRef.current } : {},
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!error && data?.sessionId) sessionIdRef.current = data.sessionId;
    };

    void send();
    const interval = window.setInterval(() => void send(), HEARTBEAT_MS);
    const onPageHide = () => void send();
    window.addEventListener('pagehide', onPageHide);

    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, [userId]);
}
