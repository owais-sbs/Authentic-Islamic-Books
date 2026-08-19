import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-5 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink-900/5">
        <BookOpen size={28} className="text-ink-300" />
      </div>
      <h1 className="mt-6 font-serif text-3xl font-semibold text-ink-900">Page Not Found</h1>
      <p className="mt-3 max-w-md text-ink-500">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-ink-900 px-5 py-2.5 text-sm font-medium text-cream transition-all hover:bg-ink-800"
      >
        <BookOpen size={16} /> Back to Home
      </Link>
    </div>
  );
}
