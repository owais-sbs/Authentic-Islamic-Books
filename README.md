# Islamic Digital Library

A modern, polished digital library for exploring centuries of Islamic scholarship. Every book is presented in a clean, structured reading experience — not as a PDF, but as carefully typeset web content organized by chapters, sections, and subsections.

## Features

- **Structured Book Reader** — Custom-built reading interface with hierarchical table of contents, smooth section navigation, reading progress tracking, and deep linking to specific sections 
- **Three Reading Themes** — Light, Sepia, and Dark modes with adjustable font size, line spacing, and reading width
- **Search** — Global search across books, scholars, and topics, plus in-book search with result highlighting (Ctrl+K or `/`)
- **Bookmarks** — Save sections for later; stored per book with quick navigation
- **Hijri Timeline** — Explore books across 14 Hijri periods from 100 AH to 1448 AH
- **Library Filters** — Filter by Hijri period, scholar, and category with URL-synced state for sharing and bookmarking
- **Scholar Profiles** — Detailed scholar pages with biographies, timelines, and book listings
- **Responsive Design** — Optimized for desktop, tablet, and mobile with adaptive layouts (desktop sidebars become mobile drawers)
- **Accessibility** — Semantic HTML, keyboard navigation, ARIA labels, and `prefers-reduced-motion` support

## Technology Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion (animations)
- React Router (routing)
- Lucide React (icons)

## Folder Structure

```
src/
  components/
    ui/          — Reusable UI primitives (Button, Input, Badge, Drawer, etc.)
    layout/      — Navbar, Footer, PageContainer, ScrollToTop
    library/     — BookCard, BookGrid, LibraryFilters
    scholar/     — ScholarCard
    book/        — BookCover
    reader/      — ReaderHeader, TableOfContents, ContentRenderer, ReaderSearch,
                    ReadingProgress, ReadingSettings, ReaderNavigation
  pages/         — Route pages (Home, Library, Reader, etc.)
  hooks/         — Custom hooks (useLibraryFilters, useBookmarks, useReaderSettings, etc.)
  data/          — Sample data (books, scholars, categories, periods)
  types/         — TypeScript interfaces
  lib/           — Utility functions
```

## Installation

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## How the Reader Works

The reader renders book content using custom React components — no PDFs, iframes, or document viewers. Each book's content is structured as `ContentBlock` objects (paragraphs, headings, quotes, lists, footnotes, references) that are rendered by a `ContentRenderer` component with configurable typography.

The table of contents is a hierarchical, expandable navigation tree. Clicking any section smooth-scrolls to it, and an `IntersectionObserver` tracks which section is currently active. Reading progress, bookmarks, and settings are persisted to `localStorage`.

## How Filtering Works

Library filters are managed by the `useLibraryFilters` hook, which syncs filter state to URL query parameters (`?period=701-800&category=hadith&scholar=ibn-kathir`). This enables shareable filtered views and browser back/forward navigation.

## How to Add Demo Books

1. Add a new scholar to `src/data/scholars.ts`
2. Add a new book to `src/data/books.ts` with chapters, sections, and content blocks
3. The book automatically appears in the library, search, and filters

## Replacing Demo Data with Supabase

The frontend is designed to work with a backend. To replace the static data:

1. Create tables: `authors`, `books`, `categories`, `chapters`, `sections`, `content_blocks`
2. Replace the imports in `src/data/` with Supabase queries
3. The TypeScript interfaces in `src/types/index.ts` map directly to table schemas
4. Reading progress and bookmarks can move from `localStorage` to authenticated Supabase rows

## Sample Content Disclaimer

All books and scholarly content in this library are demo/sample material created to demonstrate the platform's reading experience. They are not historical editions and should not be cited as primary sources.
