interface BilingualTextProps {
  english: string[];
  arabic: string[];
  englishHeading?: string;
  arabicHeading?: string;
  fontSize: number;
}

/** Always shows English and Arabic together. */
export function BilingualText({
  english,
  arabic,
  englishHeading,
  arabicHeading,
  fontSize,
}: BilingualTextProps) {
  return (
    <div className="space-y-8">
      <section className="space-y-4" lang="en">
        {englishHeading && (
          <h2
            className="font-sans font-semibold leading-snug tracking-tight text-ink-900"
            style={{ fontSize: `${fontSize + 4}px` }}
          >
            {englishHeading}
          </h2>
        )}
        {english.map((para, i) => (
          <p
            key={`en-${i}`}
            className="font-serif leading-[1.85] text-ink-800"
            style={{ fontSize: `${fontSize}px` }}
          >
            {para}
          </p>
        ))}
      </section>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-line-strong to-transparent" />

      <section className="space-y-4" dir="rtl" lang="ar">
        {arabicHeading && (
          <h2
            className="font-arabic font-semibold leading-snug text-ink-900"
            style={{ fontSize: `${fontSize + 6}px` }}
          >
            {arabicHeading}
          </h2>
        )}
        {arabic.map((para, i) => (
          <p
            key={`ar-${i}`}
            className="font-arabic leading-[2] text-ink-800"
            style={{ fontSize: `${fontSize + 2}px` }}
          >
            {para}
          </p>
        ))}
      </section>
    </div>
  );
}
