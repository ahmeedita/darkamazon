import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  username: string;
  auth_user_id: string;
  last_active_at: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (username: string, password: string) => Promise<{ error: string | null }>;
  signIn: (username: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (authUserId: string) => {
    try {
      // Only select non-sensitive columns
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, auth_user_id, last_active_at, created_at')
        .eq('auth_user_id', authUserId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
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
      setLoading(false);
    }
  };

  const signUp = async (username: string, password: string): Promise<{ error: string | null }> => {
    const normalizedUsername = username.toLowerCase().trim();
    
    // Check if username already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', normalizedUsername)
      .single();

    if (existingProfile) {
      return { error: 'Username already taken' };
    }

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

    // Create profile linked to auth user
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        auth_user_id: authData.user.id,
        username: normalizedUsername,
      });

    if (profileError) {
      // Clean up auth user if profile creation fails
      await supabase.auth.signOut();
      if (profileError.code === '23505') {
        return { error: 'Username already taken' };
      }
      return { error: profileError.message };
    }

    // Fetch the profile
    await fetchProfile(authData.user.id);

    return { error: null };
  };

  const signIn = async (username: string, password: string): Promise<{ error: string | null }> => {
    const normalizedUsername = username.toLowerCase().trim();
    const fakeEmail = `${normalizedUsername}@darkamazon.local`;
    
    const { error } = await supabase.auth.signInWithPassword({
      email: fakeEmail,
      password,
    });

    if (error) {
      return { error: 'Invalid username or password' };
    }

    return { error: null };
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
