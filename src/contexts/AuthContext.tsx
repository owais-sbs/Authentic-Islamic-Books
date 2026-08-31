import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

export const ADMIN_EMAIL = 'admin@islamicdigitallibrary.com';
export const ADMIN_PASSWORD = 'Admin@12345';

const LOCAL_SESSION_KEY = 'idl_admin_session';

interface LocalSession {
  email: string;
  expiresAt: number;
}

export interface AuthUser {
  email: string;
  mode: 'supabase' | 'local';
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readLocalSession(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(LOCAL_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LocalSession;
    if (parsed.expiresAt < Date.now()) {
      sessionStorage.removeItem(LOCAL_SESSION_KEY);
      return null;
    }
    return { email: parsed.email, mode: 'local' };
  } catch {
    return null;
  }
}

function writeLocalSession(email: string): void {
  const session: LocalSession = {
    email,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7,
  };
  sessionStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
}

function supabaseUserToAuthUser(user: User): AuthUser {
  return {
    email: user.email ?? ADMIN_EMAIL,
    mode: 'supabase',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    async function init() {
      const local = readLocalSession();
      if (local) {
        if (!cancelled) {
          setUser(local);
          setLoading(false);
        }
        return;
      }

      if (!isSupabaseConfigured()) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const supabase = getSupabase();
        const { data } = await supabase.auth.getSession();
        if (!cancelled) {
          setUser(data.session?.user ? supabaseUserToAuthUser(data.session.user) : null);
        }

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            sessionStorage.removeItem(LOCAL_SESSION_KEY);
            setUser(supabaseUserToAuthUser(session.user));
          } else if (!readLocalSession()) {
            setUser(null);
          }
        });

        unsubscribe = () => listener.subscription.unsubscribe();
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void init();
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();
    const isAdminCredentials =
      normalizedEmail === ADMIN_EMAIL.toLowerCase() &&
      normalizedPassword === ADMIN_PASSWORD;

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: normalizedPassword,
        });

        if (!error && data.user) {
          sessionStorage.removeItem(LOCAL_SESSION_KEY);
          setUser(supabaseUserToAuthUser(data.user));
          return;
        }

        const message = error?.message?.toLowerCase() ?? '';
        const isKeyError = message.includes('invalid api key');
        const isInvalidCredentials =
          message.includes('invalid login credentials') ||
          message.includes('invalid email or password');

        // Supabase configured but this user is not in Auth yet.
        // Local UI access is allowed, but cloud book sync requires a real Supabase session.
        if (isInvalidCredentials && isAdminCredentials) {
          writeLocalSession(normalizedEmail);
          setUser({ email: normalizedEmail, mode: 'local' });
          console.warn(
            '[Auth] Signed in locally only. Create the admin user in Supabase (Authentication → Users) so books sync for the whole team.'
          );
          return;
        }

        if (!isKeyError) {
          throw new Error(
            isInvalidCredentials
              ? 'Invalid email or password. Ask your team lead to run: npm run setup:admin'
              : (error?.message ?? 'Login failed'),
          );
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message.toLowerCase() : '';
        if (isAdminCredentials && !msg.includes('invalid api key')) {
          if (msg.includes('invalid login credentials') || msg.includes('invalid email or password')) {
            writeLocalSession(normalizedEmail);
            setUser({ email: normalizedEmail, mode: 'local' });
            return;
          }
        }
        if (!msg.includes('invalid api key')) {
          throw err instanceof Error ? err : new Error('Login failed');
        }
      }
    }

    if (isAdminCredentials) {
      writeLocalSession(normalizedEmail);
      setUser({ email: normalizedEmail, mode: 'local' });
      return;
    }

    throw new Error('Invalid email or password');
  }, []);

  const signOut = useCallback(async () => {
    sessionStorage.removeItem(LOCAL_SESSION_KEY);
    setUser(null);
    if (isSupabaseConfigured()) {
      try {
        await getSupabase().auth.signOut();
      } catch {
        // ignore
      }
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, signIn, signOut }),
    [user, loading, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
