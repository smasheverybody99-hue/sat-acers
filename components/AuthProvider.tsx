"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { cloudEnabled, getSupabase } from "@/lib/supabase";
import { pullAndMerge, push } from "@/lib/sync";

export type SyncStatus = "off" | "anon" | "syncing" | "synced" | "error";

export interface AppUser {
  id: string;
  email: string | null;
  name: string | null;
}

interface AuthCtx {
  user: AppUser | null;
  status: SyncStatus;
  ready: boolean;
  signInEmail: (email: string) => Promise<string | null>;
  signInGoogle: () => Promise<string | null>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  user: null,
  status: "off",
  ready: true,
  signInEmail: async () => "Sign-in is not configured",
  signInGoogle: async () => "Sign-in is not configured",
  signOut: async () => {},
});

export const useAuth = () => useContext(Ctx);

const redirectUrl = () => `${window.location.origin}/dashboard`;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [status, setStatus] = useState<SyncStatus>(cloudEnabled ? "anon" : "off");
  const [ready, setReady] = useState(!cloudEnabled);
  const syncedFor = useRef<string | null>(null);
  const timer = useRef<number | null>(null);

  // Sessiyani kuzatish
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;

    const handle = async (session: { user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> } } | null) => {
      setReady(true);
      if (!session?.user) {
        setUser(null);
        setStatus("anon");
        syncedFor.current = null;
        return;
      }
      const u = session.user;
      const meta = u.user_metadata ?? {};
      setUser({
        id: u.id,
        email: u.email ?? null,
        name: (meta.full_name as string) || (meta.name as string) || null,
      });
      if (syncedFor.current === u.id) return;
      syncedFor.current = u.id;
      setStatus("syncing");
      try {
        await pullAndMerge(sb, u.id);
        setStatus("synced");
      } catch (e) {
        console.error("[sync] pull failed", e);
        setStatus("error");
      }
    };

    sb.auth.getSession().then(({ data }) => handle(data.session));
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      handle(session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Push to the cloud 1.5 s after each change
  useEffect(() => {
    const sb = getSupabase();
    if (!sb || !user) return;
    const onChange = (e: Event) => {
      if ((e as CustomEvent<{ fromSync?: boolean }>).detail?.fromSync) return;
      if (timer.current) window.clearTimeout(timer.current);
      setStatus("syncing");
      timer.current = window.setTimeout(async () => {
        try {
          await push(sb, user.id);
          setStatus("synced");
        } catch (err) {
          console.error("[sync] push failed", err);
          setStatus("error");
        }
      }, 1500);
    };
    window.addEventListener("acers:progress", onChange);
    window.addEventListener("acers:history", onChange);
    return () => {
      window.removeEventListener("acers:progress", onChange);
      window.removeEventListener("acers:history", onChange);
    };
  }, [user]);

  const signInEmail = useCallback(async (email: string) => {
    const sb = getSupabase();
    if (!sb) return "Sign-in is not configured";
    const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectUrl() } });
    return error ? error.message : null;
  }, []);

  const signInGoogle = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) return "Sign-in is not configured";
    const { error } = await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: redirectUrl() } });
    return error ? error.message : null;
  }, []);

  const signOut = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) return;
    await sb.auth.signOut();
  }, []);

  return <Ctx.Provider value={{ user, status, ready, signInEmail, signInGoogle, signOut }}>{children}</Ctx.Provider>;
}
