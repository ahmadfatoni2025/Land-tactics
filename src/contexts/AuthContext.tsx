import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/types';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: 'user' | 'admin' | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Failed to fetch profile:', error);
      return null;
    }
    return data as Profile;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const p = await fetchProfile(user.id);
    if (p) setProfile(p);
  }, [user, fetchProfile]);

  useEffect(() => {
    let mounted = true;

    // Load cached profile for instant UI
    const cachedProfile = localStorage.getItem('geoagri_profile');
    if (cachedProfile) {
      try {
        setProfile(JSON.parse(cachedProfile));
        setLoading(false); // Show UI immediately if cache exists
      } catch (e) {
        localStorage.removeItem('geoagri_profile');
      }
    }

    // Safety timeout: force loading to false after 3 seconds (reduced from 5s)
    const timeout = setTimeout(() => {
      if (mounted && loading) {
        setLoading(false);
      }
    }, 3000);

    const initAuth = async () => {
      try {
        const { data: { session: s } } = await supabase.auth.getSession();
        if (!mounted) return;

        setSession(s);
        setUser(s?.user ?? null);
        
        if (s?.user) {
          const p = await fetchProfile(s.user.id);
          if (mounted) {
            setProfile(p);
            if (p) localStorage.setItem('geoagri_profile', JSON.stringify(p));
          }
        } else {
          localStorage.removeItem('geoagri_profile');
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        if (mounted) {
          setLoading(false);
          clearTimeout(timeout);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, s) => {
        if (!mounted) return;
        
        setSession(s);
        setUser(s?.user ?? null);
        
        if (s?.user) {
          const p = await fetchProfile(s.user.id);
          setProfile(p);
          if (p) localStorage.setItem('geoagri_profile', JSON.stringify(p));
        } else {
          setProfile(null);
          localStorage.removeItem('geoagri_profile');
        }

        if (event === 'SIGNED_OUT') {
           window.location.href = '/login'; 
        }
        
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    try {
      setLoading(true);
      localStorage.removeItem('geoagri_profile');
      await supabase.auth.signOut();
      // Force reload to clean all states
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout error:', err);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      role: user?.email === 'admin@web.com' ? 'admin' : (profile?.role ?? null),
      loading,
      signIn,
      signOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// ... (keep the rest)

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
