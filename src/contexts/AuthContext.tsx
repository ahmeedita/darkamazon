import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  username: string;
  auth_user_id: string;
  last_active_at: string;
  created_at: string;
  recovery_phrase_hash?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (username: string, password: string) => Promise<{ error: string | null; recoveryPhrase?: string }>;
  signIn: (username: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  recoverAccount: (recoveryPhrase: string, newPassword: string) => Promise<{ error: string | null; username?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Inactivity timeout in milliseconds (2 hours)
const INACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000;

// Simple hash function for recovery phrase (SHA-256)
const hashRecoveryPhrase = async (phrase: string): Promise<string> => {
  const normalized = phrase.toLowerCase().trim().replace(/\s+/g, ' ');
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Generate a random recovery phrase
const generateRecoveryPhrase = (): string => {
  const words = [
    'apple', 'banana', 'cherry', 'dragon', 'eagle', 'falcon', 'grape', 'honey',
    'iron', 'jungle', 'knight', 'lemon', 'mango', 'noble', 'ocean', 'pearl',
    'queen', 'river', 'storm', 'tiger', 'unity', 'violet', 'winter', 'xenon',
    'yellow', 'zebra', 'anchor', 'bridge', 'castle', 'dawn', 'ember', 'frost'
  ];
  const phrase: string[] = [];
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * words.length);
    phrase.push(words[randomIndex]);
  }
  return phrase.join(' ');
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const profileFetchInFlightRef = useRef<string | null>(null);

  const handleInactivityLogout = useCallback(async () => {
    if (user) {
      console.log('Logging out due to inactivity');
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
    }
  }, [user]);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (user) {
      inactivityTimerRef.current = setTimeout(handleInactivityLogout, INACTIVITY_TIMEOUT);
    }
  }, [user, handleInactivityLogout]);

  // Set up activity listeners
  useEffect(() => {
    if (!user) return;

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      resetInactivityTimer();
    };

    // Add listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Start the initial timer
    resetInactivityTimer();

    return () => {
      // Clean up listeners
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [user, resetInactivityTimer]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer profile fetch with setTimeout to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session?.user) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (authUserId: string) => {
    if (profileFetchInFlightRef.current === authUserId) return;
    profileFetchInFlightRef.current = authUserId;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, auth_user_id, last_active_at, created_at, recovery_phrase_hash')
        .eq('auth_user_id', authUserId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } else if (!data) {
        // Auto-create profile if missing (handles legacy accounts)
        const { data: authUser } = await supabase.auth.getUser();
        const email = authUser?.user?.email || '';
        const baseUsername = email.split('@')[0] || `user_${authUserId.slice(0, 8)}`;

        const createProfile = async (username: string) =>
          supabase
            .from('profiles')
            .upsert(
              {
                auth_user_id: authUserId,
                username,
              },
              {
                onConflict: 'auth_user_id',
              }
            )
            .select('id, username, auth_user_id, last_active_at, created_at, recovery_phrase_hash')
            .maybeSingle();

        let { data: createdProfile, error: createError } = await createProfile(baseUsername);

        // Username conflict with another account; retry with deterministic suffix.
        if (createError?.code === '23505') {
          const fallbackUsername = `${baseUsername}_${authUserId.slice(0, 6)}`;
          const retry = await createProfile(fallbackUsername);
          createdProfile = retry.data;
          createError = retry.error;
        }

        if (createError || !createdProfile) {
          console.error('Failed to auto-create profile:', createError);
          setProfile(null);
        } else {
          setProfile(createdProfile as UserProfile);
        }
      } else {
        setProfile(data as UserProfile);
        // Update last active time
        await supabase
          .from('profiles')
          .update({ last_active_at: new Date().toISOString() })
          .eq('auth_user_id', authUserId);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    } finally {
      if (profileFetchInFlightRef.current === authUserId) {
        profileFetchInFlightRef.current = null;
      }
      setLoading(false);
    }
  };

  const signUp = async (username: string, password: string): Promise<{ error: string | null; recoveryPhrase?: string }> => {
    const normalizedUsername = username.toLowerCase().trim();
    
    // Check if username already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', normalizedUsername)
      .maybeSingle();

    if (existingProfile) {
      return { error: 'Username already taken' };
    }

    // Generate recovery phrase
    const recoveryPhrase = generateRecoveryPhrase();
    const recoveryPhraseHash = await hashRecoveryPhrase(recoveryPhrase);

    // Create fake email from username for Supabase Auth
    const fakeEmail = `${normalizedUsername}@darkamazon.local`;
    
    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: fakeEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        return { error: 'Username already taken' };
      }
      return { error: authError.message };
    }

    if (!authData.user) {
      return { error: 'Failed to create account' };
    }

    // Create/update profile linked to auth user with recovery phrase hash
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(
        {
          auth_user_id: authData.user.id,
          username: normalizedUsername,
          recovery_phrase_hash: recoveryPhraseHash,
        },
        {
          onConflict: 'auth_user_id',
        }
      );

    if (profileError) {
      if (profileError.code === '23505') {
        return { error: 'Username already taken' };
      }
      return { error: profileError.message };
    }

    // Fetch the profile
    await fetchProfile(authData.user.id);

    return { error: null, recoveryPhrase };
  };

  const signIn = async (username: string, password: string): Promise<{ error: string | null }> => {
    const normalizedUsername = username.toLowerCase().trim();

    const domains = ['darkamazon.local', 'torbuy.local'];

    for (const domain of domains) {
      const fakeEmail = `${normalizedUsername}@${domain}`;
      const { error } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password,
      });

      if (!error) {
        return { error: null };
      }
    }

    return { error: 'Invalid username or password' };
  };

  const recoverAccount = async (recoveryPhrase: string, newPassword: string): Promise<{ error: string | null; username?: string }> => {
    try {
      const response = await supabase.functions.invoke('recover-account', {
        body: { recoveryPhrase }
      });

      if (response.error) {
        return { error: 'Recovery failed. Please try again.' };
      }

      const data = response.data;
      
      if (data.error) {
        return { error: data.error };
      }

      return { 
        error: null, 
        username: data.username 
      };
    } catch (error) {
      console.error('Recovery error:', error);
      return { error: 'Recovery failed. Please try again.' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signUp,
      signIn,
      signOut,
      recoverAccount,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
