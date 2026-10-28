import { useState } from 'react';
import { Mail } from 'lucide-react';
import { Reveal } from '@/components/motion/Reveal';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'invalid' | 'pending'>('idle');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setStatus('invalid');
      return;
    }
    setStatus('pending');
  }

  return (
    <section className="bg-ivory pb-10 pt-4 dark:bg-black sm:pb-14 sm:pt-6">
      <div className="container-page">
        <Reveal>
          <div className="w-full rounded-2xl border border-line bg-white px-5 py-8 text-center shadow-soft dark:border-white/10 dark:bg-[#141414] sm:px-12 sm:py-10 lg:px-16 lg:py-12">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-islamic-green/10 text-islamic-green dark:bg-accent/15 dark:text-accent">
              <Mail size={22} />
            </div>
            <h2 className="font-sans text-2xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-3xl md:text-4xl">
              Make Time for Beneficial Knowledge
            </h2>
            <p className="mx-auto mt-3 max-w-2xl font-sans text-sm text-ink-500 dark:text-white/65 sm:text-base">
              Receive thoughtful reading recommendations, new additions, and beneficial resources in
              your inbox.
            </p>

            <form
              onSubmit={onSubmit}
              className="mx-auto mt-8 flex w-full max-w-2xl flex-col gap-3 sm:flex-row"
            >
              <label className="sr-only" htmlFor="newsletter-email">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status !== 'idle') setStatus('idle');
                }}
                placeholder="Your email address"
                className="w-full rounded-lg border border-line bg-ivory px-4 py-3.5 font-sans text-sm text-ink-900 placeholder:text-ink-400 focus:border-accent focus:outline-none dark:border-white/15 dark:bg-black dark:text-white dark:placeholder:text-white/40"
                autoComplete="email"
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-islamic-green px-8 py-3.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-[#0D3F31]"
              >
                Subscribe
              </button>
            </form>

            <p className="mt-3 font-sans text-xs text-ink-400 dark:text-white/45">
              We respect your privacy. Unsubscribe anytime. Newsletter delivery requires a mail
              service integration.
            </p>
            {status === 'invalid' && (
              <p className="mt-2 font-sans text-sm text-islamic-terracotta" role="alert">
                Please enter a valid email address.
              </p>
            )}
            {status === 'pending' && (
              <p className="mt-2 font-sans text-sm text-islamic-green" role="status">
                Thanks — newsletter signup will activate once the mailing service is connected.
              </p>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
