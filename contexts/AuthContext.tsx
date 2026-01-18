
import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient, Session, User } from '@supabase/supabase-js';

// Safe environment variable access
const getEnv = (key: string): string | undefined => {
  try {
    return (process?.env as any)?.[key];
  } catch {
    return undefined;
  }
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || 'https://your-project-url.supabase.co';
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY') || 'your-anon-key';

// Initialize client only if URL is valid to avoid immediate 'Failed to fetch'
export const supabase = createClient(supabaseUrl, supabaseKey);

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If using placeholder keys, we should skip initialization to prevent errors
    if (supabaseUrl.includes('your-project-url')) {
      console.warn('Supabase URL is not configured. Please set VITE_SUPABASE_URL.');
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
