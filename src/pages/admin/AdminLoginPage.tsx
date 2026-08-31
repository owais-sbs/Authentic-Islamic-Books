import { useState, FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth, ADMIN_EMAIL } from '@/contexts/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase';

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
    <div className="min-h-screen bg-[#0B1B2B] flex flex-col">
      <header className="px-6 py-5">
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 text-white/90 hover:text-white transition-colors"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#C9A646] text-[#0B1B2B]">
            <BookOpen size={18} strokeWidth={1.5} />
          </div>
          <span className="text-sm font-semibold tracking-tight">Islamic Digital Library</span>
        </Link>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#C9A646] text-[#0B1B2B] shadow-lg shadow-[#C9A646]/20">
              <BookOpen size={32} strokeWidth={1.5} />
            </div>
            <h1 className="text-[26px] font-bold text-white tracking-tight">Admin Login</h1>
            <p className="mt-2 text-[14px] text-white/50">
              Sign in to manage books, scholars, and library content.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-7 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3">
                  <AlertCircle size={16} className="shrink-0 text-red-400 mt-0.5" />
                  <p className="text-[13px] text-red-300">{error}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-[12px] font-semibold uppercase tracking-wider text-white/50"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                  />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@islamicdigitallibrary.com"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-[14px] text-white placeholder-white/25 outline-none transition-all focus:border-[#C9A646]/60 focus:bg-white/8 focus:ring-2 focus:ring-[#C9A646]/15"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-[12px] font-semibold uppercase tracking-wider text-white/50"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                  />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-12 text-[14px] text-white placeholder-white/25 outline-none transition-all focus:border-[#C9A646]/60 focus:bg-white/8 focus:ring-2 focus:ring-[#C9A646]/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-white/40 transition-colors hover:text-white/70"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-[#C9A646] py-3 text-[14px] font-semibold text-[#0B1B2B] transition-all hover:bg-[#b8933d] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Signing in…' : 'Sign In to Admin'}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-[12px] text-white/30">
            {isSupabaseConfigured()
              ? 'Secured with Supabase Authentication'
              : 'Configure Supabase in .env for cloud auth'}
          </p>

          <p className="mt-3 text-center">
            <Link to="/" className="text-[13px] text-white/40 hover:text-white/70 transition-colors">
              ← Back to public library
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
