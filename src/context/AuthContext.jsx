import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../config/firebase';

const AuthContext = createContext(null);

const ADMIN_EMAIL = 'adityaadmin@aditya.ac.in';
const ADMIN_PASS = 'Adityaadmin@1';
const SESSION_KEY = 'aditya_admin_session_active';

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setIsAdmin(Boolean(session?.user?.email === ADMIN_EMAIL));
        setLoading(false);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsAdmin(Boolean(session?.user?.email === ADMIN_EMAIL));
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      const saved = sessionStorage.getItem(SESSION_KEY) === 'true';
      setIsAdmin(saved);
      setLoading(false);
    }
  }, []);

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
      setIsAdmin(true);
      return true;
    }

    if (password === ADMIN_PASS) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setIsAdmin(true);
      return true;
    }
    throw new Error('Invalid Admin ID or Password.');
  };

  const logoutAdmin = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    sessionStorage.removeItem(SESSION_KEY);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ isAdmin, loading, loginAdmin, logoutAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}