import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ScrollToTop } from '@/components/layout/ScrollToTop';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';

// ─── Public pages ─────────────────────────────────────────────────────────────
const LibraryPage       = lazy(() => import('@/pages/LibraryPage').then((m)       => ({ default: m.LibraryPage })));
const ScholarsPage      = lazy(() => import('@/pages/ScholarsPage').then((m)      => ({ default: m.ScholarsPage })));
const ScholarDetailPage = lazy(() => import('@/pages/ScholarDetailPage').then((m) => ({ default: m.ScholarDetailPage })));
const BookDetailPage    = lazy(() => import('@/pages/BookDetailPage').then((m)    => ({ default: m.BookDetailPage })));
const ReaderPage        = lazy(() => import('@/pages/ReaderPage').then((m)        => ({ default: m.ReaderPage })));
const TimelinePage      = lazy(() => import('@/pages/TimelinePage').then((m)      => ({ default: m.TimelinePage })));
const CategoriesPage    = lazy(() => import('@/pages/CategoriesPage').then((m)    => ({ default: m.CategoriesPage })));
const AboutPage         = lazy(() => import('@/pages/AboutPage').then((m)         => ({ default: m.AboutPage })));
const BookmarksPage     = lazy(() => import('@/pages/BookmarksPage').then((m)     => ({ default: m.BookmarksPage })));

// ─── Admin pages ──────────────────────────────────────────────────────────────
const AdminDashboardPage = lazy(() =>
  import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);
const AdminBooksPage = lazy(() =>
  import('@/pages/admin/AdminBooksPage').then((m) => ({ default: m.AdminBooksPage }))
);
const AdminImportPage = lazy(() =>
  import('@/pages/admin/AdminImportPage').then((m) => ({ default: m.AdminImportPage }))
);
const AdminReviewPage = lazy(() =>
  import('@/pages/admin/AdminReviewPage').then((m) => ({ default: m.AdminReviewPage }))
);

// ─── Loading fallback ─────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-accent" />
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/"                   element={<HomePage />} />
          <Route path="/library"            element={<LibraryPage />} />
          <Route path="/scholars"           element={<ScholarsPage />} />
          <Route path="/scholars/:slug"     element={<ScholarDetailPage />} />
          <Route path="/books/:slug"        element={<BookDetailPage />} />
          <Route path="/books/:slug/read"   element={<ReaderPage />} />
          <Route path="/timeline"           element={<TimelinePage />} />
          <Route path="/categories"         element={<CategoriesPage />} />
          <Route path="/about"              element={<AboutPage />} />
          <Route path="/bookmarks"          element={<BookmarksPage />} />

          {/* Admin */}
          <Route path="/admin"                      element={<AdminDashboardPage />} />
          <Route path="/admin/books"                element={<AdminBooksPage />} />
          <Route path="/admin/books/import"         element={<AdminImportPage />} />
          <Route path="/admin/books/:bookId/review" element={<AdminReviewPage />} />

          {/* Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
