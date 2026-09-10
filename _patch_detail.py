from pathlib import Path

p = Path(r"d:\Sufiyan\Authentic-Islamic-Books\src\pages\BookDetailPage.tsx")
text = p.read_text(encoding="utf-8")

old = """            <div className=\"mt-6\">
              <BookBookmarkButton
                slug={book.slug}
                title={book.title}
                coverColor={book.coverColor}
                coverUrl={book.coverUrl}
                size=\"lg\"
                showLabel
                className=\"w-full sm:w-auto\"
              />
            </div>"""

new = """            <div className=\"mt-6 flex flex-wrap gap-3\">
              <Link
                to={`/books/${book.slug}/read`}
                className=\"inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink-800 sm:w-auto\"
              >
                Start Reading
              </Link>
              <BookBookmarkButton
                slug={book.slug}
                title={book.title}
                coverColor={book.coverColor}
                coverUrl={book.coverUrl}
                size=\"lg\"
                showLabel
                className=\"w-full sm:w-auto\"
              />
            </div>"""

if old not in text:
    raise SystemExit("OLD NOT FOUND")

p.write_text(text.replace(old, new, 1), encoding="utf-8")
print("OK")
