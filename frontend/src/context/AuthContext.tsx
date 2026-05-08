/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { Profile } from "../types";
import {
  DEMO_STORAGE_KEY,
  bundleFromPayload,
  isDemoAuthEnabled,
  matchDemoLogin,
  payloadFromBundle,
  type DemoAuthPayload,
} from "../lib/demoAuth";

interface SignInResult {
  error: Error | null;
  profile: Profile | null;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  /** True when using in-browser demo users (no Supabase session). */
  demoAuthActive: boolean;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  demoAuthAvailable: boolean;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

function readStoredDemo(): DemoAuthPayload | null {
  try {
    const raw = sessionStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as DemoAuthPayload;
    if (p?.v !== 1 || typeof p.userId !== "string") return null;
    return p;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const demoActiveRef = useRef(false);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    const next = data ?? null;
    setProfile(next);
    return next;
  }, []);

  const clearDemoSession = useCallback(() => {
    demoActiveRef.current = false;
    try {
      sessionStorage.removeItem(DEMO_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const stored = readStoredDemo();
    if (stored && isDemoAuthEnabled()) {
      try {
        const bundle = bundleFromPayload(stored);
        demoActiveRef.current = true;
        setUser(bundle.user);
        setProfile(bundle.profile);
        setSession(null);
      } catch {
        clearDemoSession();
      }
      setLoading(false);
    } else {
      if (stored) clearDemoSession();
      void supabase.auth.getSession().then(({ data: { session: s } }) => {
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) {
          void fetchProfile(s.user.id);
        }
        setLoading(false);
      });
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      if (demoActiveRef.current && !s?.user) {
        setLoading(false);
        return;
      }
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        void fetchProfile(s.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, clearDemoSession]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<SignInResult> => {
      const trimmed = email.trim();

      const demoTry = matchDemoLogin(trimmed, password);
      if (demoTry) {
        clearDemoSession();
        demoActiveRef.current = true;
        setUser(demoTry.user);
        setProfile(demoTry.profile);
        setSession(null);
        try {
          sessionStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(payloadFromBundle(demoTry.profile)));
        } catch {
          /* ignore */
        }
        await supabase.auth.signOut().catch(() => {});
        setLoading(false);
        return { error: null, profile: demoTry.profile };
      }

      clearDemoSession();
      const { data, error } = await supabase.auth.signInWithPassword({ email: trimmed, password });
      if (error) {
        return { error: error as Error, profile: null };
      }

      setSession(data.session);
      setUser(data.user);
      const p = await fetchProfile(data.user.id);
      return { error: null, profile: p };
    },
    [fetchProfile, clearDemoSession],
  );

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    clearDemoSession();
    await supabase.auth.signOut();
    setProfile(null);
    setUser(null);
    setSession(null);
  };

  const isAdmin = profile?.role === "admin";
  const demoAuthActive = Boolean(user && !session);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        demoAuthActive,
        signIn,
        signUp,
        signOut,
        isAdmin,
        demoAuthAvailable: isDemoAuthEnabled(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
