import { useState, FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
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
      setError(
        raw.toLowerCase().includes('invalid login credentials')
          ? 'Invalid email or password. If this persists, ask the project owner to create the admin user in Supabase.'
          : raw,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex transition-colors" style={{ background: '#F7F5F0' }}>

      {/* ── LEFT PANEL: decorative Islamic panel ── */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(155deg, #0B1929 0%, #0F2744 55%, #1B4F72 100%)' }}
      >
        {/* Background geometric ornament */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="star" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <polygon points="40,4 47,28 72,28 52,44 59,68 40,54 21,68 28,44 8,28 33,28"
                  fill="none" stroke="#C9A646" strokeWidth="0.8" />
                <circle cx="40" cy="40" r="6" fill="none" stroke="#C9A646" strokeWidth="0.6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#star)" />
          </svg>
        </div>

        {/* Top: brand */}
        <div className="relative z-10">
          <span className="text-white/80 text-base font-semibold tracking-wide">
            Authentic Islamic Books
          </span>
        </div>

        {/* Centre: headline */}
        <div className="relative z-10 space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A646] mb-3">
              Admin Portal
            </p>
            <h1 className="font-serif text-4xl font-bold text-white leading-[1.2]">
              Manage Your<br />
              <span style={{ color: '#C9A646' }}>Digital Library</span>
            </h1>
            <p className="mt-4 text-sm text-white/60 leading-relaxed max-w-xs">
              Import, create, and publish authentic Islamic scholarship — available to readers worldwide.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-3">
            {[
              'Import PDF books with Arabic & English extraction',
              'Manual book creation with rich content blocks',
              'Publish directly to the live library',
            ].map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-white/70">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#C9A646]/20 text-[#C9A646]">
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1.5 4L3 5.5L6.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom: nothing */}
        <div />
      </div>

      {/* ── RIGHT PANEL: login form ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 relative">
        <div className="w-full max-w-[380px]">

          {/* Mobile brand name (hidden on lg) */}
          <div className="lg:hidden mb-8 text-center">
            <span className="font-serif text-3xl font-bold text-ink-900 tracking-tight">
              <span className="font-normal">Authentic</span> Islamic Books
            </span>
          </div>

          {/* Card */}
          <div className="rounded-2xl bg-white border border-slate-200/80 shadow-[0_8px_40px_rgba(11,25,41,0.08)] p-8">

            {/* Card header */}
            <div className="mb-7">
              <h2 className="text-xl font-bold text-ink-900 tracking-tight">Sign in</h2>
              <p className="mt-1 text-sm text-[#64748B]">
                Admin dashboard access only.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5">
                  <AlertCircle size={15} className="shrink-0 text-red-500 mt-0.5" />
                  <p className="text-xs text-red-700 leading-relaxed">{error}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-xs font-semibold text-[#374151]">
                  Email address
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-ink-900 placeholder-neutral-400 outline-none transition-all focus:border-[#1B4F72] focus:bg-white focus:ring-2 focus:ring-[#1B4F72]/15"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-xs font-semibold text-[#374151]">
                  Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-11 text-sm text-ink-900 placeholder-neutral-400 outline-none transition-all focus:border-[#1B4F72] focus:bg-white focus:ring-2 focus:ring-[#1B4F72]/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-55 disabled:cursor-not-allowed"
                style={{ background: isSubmitting ? '#1B4F72' : 'linear-gradient(135deg, #0B1929 0%, #1B4F72 100%)' }}
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In to Dashboard
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer note */}
          {!isSupabaseConfigured() && (
            <p className="mt-5 text-center text-xs text-[#94A3B8]">
              Configure Supabase credentials in .env for cloud sync
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
