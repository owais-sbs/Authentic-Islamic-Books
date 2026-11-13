import { useState, FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth, ADMIN_EMAIL } from '@/contexts/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase';
import { BrandLogo } from '@/components/brand/BrandLogo';

export function AdminLoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/admin';

  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      const raw = err instanceof Error ? err.message : 'Login failed. Please try again.';
      const friendly =
        raw.toLowerCase().includes('invalid login credentials')
          ? 'Invalid email or password. If this persists, ask the project owner to create the admin user in Supabase (see DEPLOY.md).'
          : raw;
      setError(friendly);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-black flex flex-col transition-colors">
      <header className="px-6 py-5 flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-black/60 backdrop-blur-md">
        <BrandLogo />
        <Link
          to="/"
          className="text-xs font-semibold text-[#1B4F72] hover:text-[#154060] dark:text-blue-400 transition-colors"
        >
          ← Back to Library
        </Link>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-[420px]">
          {/* Top Info */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-white/5 border border-blue-100 dark:border-white/10 text-[#1B4F72] dark:text-blue-300 shadow-sm">
              <ShieldCheck size={28} strokeWidth={2} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink-900 dark:text-white tracking-tight">
              Admin Portal
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-[#64748B] dark:text-neutral-400">
              Sign in to manage books, scholars, and library collections.
            </p>
          </div>

          {/* Login Card with Glossy Border */}
          <div className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#141414] p-7 sm:p-8 shadow-[0_20px_50px_rgba(27,79,114,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] glossy-card">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 p-3.5">
                  <AlertCircle size={16} className="shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                  <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-neutral-400"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                  />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@authenticislamicbooks.com"
                    className="w-full rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50/60 dark:bg-neutral-900/60 py-3 pl-10 pr-4 text-sm text-ink-900 dark:text-white placeholder-neutral-400 outline-none transition-all focus:border-[#1B4F72] focus:bg-white dark:focus:bg-black focus:ring-2 focus:ring-[#1B4F72]/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-neutral-400"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                  />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50/60 dark:bg-neutral-900/60 py-3 pl-10 pr-12 text-sm text-ink-900 dark:text-white placeholder-neutral-400 outline-none transition-all focus:border-[#1B4F72] focus:bg-white dark:focus:bg-black focus:ring-2 focus:ring-[#1B4F72]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-[#1B4F72] hover:bg-[#154060] py-3 text-sm font-semibold text-white shadow-md shadow-[#1B4F72]/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Signing in…' : 'Sign In to Dashboard'}
                </button>
              </div>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-[#64748B] dark:text-neutral-500">
            {isSupabaseConfigured()
              ? 'Secured with Supabase Authentication — published books sync live across the library'
              : 'Configure Supabase credentials in .env for cloud auth and database synchronization'}
          </p>
        </div>
      </div>
    </div>
  );
}
