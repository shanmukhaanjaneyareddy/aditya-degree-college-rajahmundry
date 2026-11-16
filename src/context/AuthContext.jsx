import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../config/firebase';

const AuthContext = createContext(null);

const ADMIN_EMAIL = 'adityaadmin@aditya.ac.in';
const ADMIN_PASS = 'Adityaadmin@1';
const SESSION_KEY = 'aditya_admin_session_active';

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionExpiredRedirect, setSessionExpiredRedirect] = useState(false);
  const logoutInProgressRef = useRef(false);

  const logoutAdmin = useCallback(async ({ redirectToHome = false } = {}) => {
    if (logoutInProgressRef.current) return;
    logoutInProgressRef.current = true;

    try {
      sessionStorage.removeItem(SESSION_KEY);
      setIsAdmin(false);
      if (redirectToHome) {
        setSessionExpiredRedirect(true);
      }

      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
    } finally {
      logoutInProgressRef.current = false;
    }
  }, []);

  // Initial session check: if tab was closed (sessionStorage cleared), sign out & redirect to Home
  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      const hasTabSession = sessionStorage.getItem(SESSION_KEY) === 'true';

      if (isSupabaseConfigured && supabase) {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session?.user?.email === ADMIN_EMAIL) {
          if (!hasTabSession) {
            // Admin tab was closed and reopened
            await logoutAdmin({ redirectToHome: true });
          } else {
            setIsAdmin(true);
          }
        } else {
          sessionStorage.removeItem(SESSION_KEY);
          setIsAdmin(false);
        }
        setLoading(false);
      } else {
        setIsAdmin(hasTabSession);
        setLoading(false);
      }
    };

    initSession();

    if (isSupabaseConfigured && supabase) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
          sessionStorage.removeItem(SESSION_KEY);
          setIsAdmin(false);
          setLoading(false);
        } else if (session?.user?.email === ADMIN_EMAIL) {
          const hasTabSession = sessionStorage.getItem(SESSION_KEY) === 'true';
          if (hasTabSession) {
            setIsAdmin(true);
          }
          setLoading(false);
        }
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, [logoutAdmin]);

  const loginAdmin = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();

    if (cleanEmail !== ADMIN_EMAIL) {
      throw new Error('Unauthorized admin credentials.');
    }

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (error) {
        throw new Error(error.message);
      }
      sessionStorage.setItem(SESSION_KEY, 'true');
      setSessionExpiredRedirect(false);
      setIsAdmin(true);
      return true;
    }

    if (password === ADMIN_PASS) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setSessionExpiredRedirect(false);
      setIsAdmin(true);
      return true;
    }
    throw new Error('Invalid Admin ID or Password.');
  };

  const clearRedirectFlag = useCallback(() => {
    setSessionExpiredRedirect(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAdmin,
        loading,
        sessionExpiredRedirect,
        clearRedirectFlag,
        loginAdmin,
        logoutAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}