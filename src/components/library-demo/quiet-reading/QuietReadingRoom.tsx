import { useMemo, useState, useRef, useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Type,
  Bookmark,
  Moon,
  Sun,
  Headphones,
  Play,
  Pause,
} from 'lucide-react';
import { quietBook, quietPages, type QuietBlock, type QuietTheme } from '@/data/quietReadingRoom';
import { BookOrnament, PageFooterMark } from './BookOrnaments';
import { ReadingSettingsPanel } from './ReadingSettingsPanel';
import { cn } from '@/lib/utils';

/** Reading journey: closed cover → title → TOC → chapters → end resources */
type Stage = 'closed' | 'title' | 'toc' | 'reading' | 'end';

type MobileLeaf =
  | { key: string; kind: 'half-title'; footer: string; roman: true }
  | { key: string; kind: 'title'; footer: string; roman: true }
  | { key: string; kind: 'toc'; footer: string; roman: true }
  | { key: string; kind: 'edition'; footer: string; roman: true }
  | { key: string; kind: 'chapter'; pageIndex: number; footer: number; roman: false }
  | { key: string; kind: 'references'; footer: number; roman: false }
  | { key: string; kind: 'resources'; footer: number; roman: false };

const MOBILE_MQ = '(max-width: 900px)';

function useIsMobileBook() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(MOBILE_MQ).matches : false
  );
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return isMobile;
}

/**
 * Format 07 — Quiet Reading Room
 * Desktop: two-page spread with gutter flip.
 * Mobile: one page at a time with a full-width page turn.
 */
export function QuietReadingRoom() {
  const isMobile = useIsMobileBook();
  const [stage, setStage] = useState<Stage>('closed');
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [mobileIndex, setMobileIndex] = useState(0);
  const [activeTocId, setActiveTocId] = useState('ch1');
  const [theme, setTheme] = useState<QuietTheme>('light');
  const [fontSize, setFontSize] = useState(17);
  const [lineHeight, setLineHeight] = useState(1.85);
  const [showArabic, setShowArabic] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [activeRef, setActiveRef] = useState<string | null>(null);
  const [turnDir, setTurnDir] = useState<1 | -1>(1);
  const [paperFlip, setPaperFlip] = useState(false);
  /** Stable id for the active flip — must NOT change when page content swaps mid-turn. */
  const [turnId, setTurnId] = useState(0);
  const turningRef = useRef(false);
  const midSwapRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endFlipRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMobileRef = useRef(isMobile);
  isMobileRef.current = isMobile;

  const contentSpreads = useMemo(() => {
    const pairs: { left: (typeof quietPages)[0] | null; right: (typeof quietPages)[0] }[] = [];
    for (let i = 0; i < quietPages.length; i += 2) {
      pairs.push({
        left: quietPages[i] ?? null,
        right: quietPages[i + 1] ?? quietPages[i],
      });
    }
    return pairs;
  }, []);

  const mobileLeaves = useMemo<MobileLeaf[]>(
    () => [
      { key: 'half-title', kind: 'half-title', footer: 'i', roman: true },
      { key: 'title', kind: 'title', footer: 'ii', roman: true },
      { key: 'toc', kind: 'toc', footer: 'iii', roman: true },
      { key: 'edition', kind: 'edition', footer: 'iv', roman: true },
      ...quietPages.map(
        (p, i): MobileLeaf => ({
          key: p.id,
          kind: 'chapter',
          pageIndex: i,
          footer: p.pageNumber,
          roman: false,
        })
      ),
      { key: 'references', kind: 'references', footer: 301, roman: false },
      { key: 'resources', kind: 'resources', footer: 302, roman: false },
    ],
    []
  );

  /** When resizing into mobile, map the current desktop spread onto a single leaf. */
  const wasMobileRef = useRef(isMobile);
  useEffect(() => {
    const crossedToMobile = isMobile && !wasMobileRef.current;
    wasMobileRef.current = isMobile;
    if (!crossedToMobile || stage === 'closed') return;
    if (stage === 'title') {
      setMobileIndex(0);
      return;
    }
    if (stage === 'toc') {
      setMobileIndex(2);
      return;
    }
    if (stage === 'reading') {
      const pageIdx = spreadIndex * 2;
      const leafIdx = mobileLeaves.findIndex(
        (l) => l.kind === 'chapter' && l.pageIndex === pageIdx
      );
      if (leafIdx >= 0) setMobileIndex(leafIdx);
      return;
    }
    if (stage === 'end') {
      const leafIdx = mobileLeaves.findIndex((l) => l.kind === 'references');
      if (leafIdx >= 0) setMobileIndex(leafIdx);
    }
  }, [isMobile, stage, spreadIndex, mobileLeaves]);

  const themeClass =
    theme === 'dark' ? 'qob-dark' : theme === 'sepia' ? 'qob-sepia' : 'qob-light';

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const clearFlipTimers = () => {
    if (midSwapRef.current) clearTimeout(midSwapRef.current);
    if (endFlipRef.current) clearTimeout(endFlipRef.current);
    midSwapRef.current = null;
    endFlipRef.current = null;
  };

  const syncStageFromMobile = (idx: number) => {
    const leaf = mobileLeaves[idx];
    if (!leaf) return;
    if (leaf.kind === 'half-title' || leaf.kind === 'title') setStage('title');
    else if (leaf.kind === 'toc' || leaf.kind === 'edition') setStage('toc');
    else if (leaf.kind === 'chapter') {
      setStage('reading');
      setSpreadIndex(Math.floor(leaf.pageIndex / 2));
      setActiveTocId(quietPages[leaf.pageIndex]?.chapterId ?? 'ch1');
    } else setStage('end');
  };

  /** One paper turn only — content swaps mid-turn; paper key stays stable for the whole flip. */
  const runPaperTurn = (dir: 1 | -1, apply: () => void) => {
    if (turningRef.current) return;
    turningRef.current = true;
    setTurnDir(dir);
    setTurnId((n) => n + 1);
    setPaperFlip(true);
    clearFlipTimers();
    const mobile = isMobileRef.current;
    midSwapRef.current = setTimeout(() => apply(), mobile ? 220 : 390);
    endFlipRef.current = setTimeout(() => {
      setPaperFlip(false);
      turningRef.current = false;
    }, mobile ? 560 : 820);
  };

  const openBook = () => {
    if (turningRef.current) return;
    turningRef.current = true;
    setTurnDir(1);
    setMobileIndex(0);
    setStage('title');
    window.setTimeout(() => {
      turningRef.current = false;
    }, 420);
  };

  const goNext = () => {
    if (stage === 'closed') {
      openBook();
      return;
    }
    if (isMobile) {
      if (mobileIndex >= mobileLeaves.length - 1) return;
      runPaperTurn(1, () => {
        const next = mobileIndex + 1;
        setMobileIndex(next);
        syncStageFromMobile(next);
      });
      return;
    }
    runPaperTurn(1, () => {
      if (stage === 'title') setStage('toc');
      else if (stage === 'toc') {
        setSpreadIndex(0);
        setActiveTocId(quietPages[0]?.chapterId ?? 'ch1');
        setStage('reading');
      } else if (stage === 'reading') {
        if (spreadIndex >= contentSpreads.length - 1) setStage('end');
        else {
          const next = spreadIndex + 1;
          setSpreadIndex(next);
          const ch = contentSpreads[next]?.right?.chapterId || contentSpreads[next]?.left?.chapterId;
          if (ch) setActiveTocId(ch);
        }
      }
    });
  };

  const goPrev = () => {
    if (stage === 'closed') return;
    if (isMobile) {
      if (mobileIndex <= 0) {
        if (turningRef.current) return;
        turningRef.current = true;
        setStage('closed');
        window.setTimeout(() => {
          turningRef.current = false;
        }, 500);
        return;
      }
      runPaperTurn(-1, () => {
        const next = mobileIndex - 1;
        setMobileIndex(next);
        syncStageFromMobile(next);
      });
      return;
    }
    if (stage === 'title') {
      if (turningRef.current) return;
      turningRef.current = true;
      setStage('closed');
      window.setTimeout(() => {
        turningRef.current = false;
      }, 400);
      return;
    }
    runPaperTurn(-1, () => {
      if (stage === 'end') {
        setSpreadIndex(contentSpreads.length - 1);
        setStage('reading');
      } else if (stage === 'reading') {
        if (spreadIndex <= 0) setStage('toc');
        else {
          const next = spreadIndex - 1;
          setSpreadIndex(next);
          const ch = contentSpreads[next]?.right?.chapterId || contentSpreads[next]?.left?.chapterId;
          if (ch) setActiveTocId(ch);
        }
      } else if (stage === 'toc') setStage('title');
    });
  };

  const selectToc = (id: string, page: number) => {
    runPaperTurn(1, () => {
      setActiveTocId(id);
      let idx = quietPages.findIndex((p) => p.chapterId === id);
      if (idx < 0) idx = quietPages.findIndex((p) => p.pageNumber >= page);
      if (idx < 0) idx = 0;
      setSpreadIndex(Math.floor(idx / 2));
      setStage('reading');
      if (isMobileRef.current) {
        const leafIdx = mobileLeaves.findIndex(
          (l) => l.kind === 'chapter' && l.pageIndex === idx
        );
        if (leafIdx >= 0) setMobileIndex(leafIdx);
      }
    });
  };

  const mobileLeaf = mobileLeaves[mobileIndex];
  const atMobileEnd = isMobile && mobileIndex >= mobileLeaves.length - 1;
  const atDesktopEnd = !isMobile && stage === 'end';

  const stageLabel = (() => {
    if (stage === 'closed') return 'Cover';
    if (isMobile && mobileLeaf) {
      if (mobileLeaf.kind === 'half-title') return 'Title · i';
      if (mobileLeaf.kind === 'title') return 'Title · ii';
      if (mobileLeaf.kind === 'toc') return 'Contents · iii';
      if (mobileLeaf.kind === 'edition') return 'Edition notes · iv';
      if (mobileLeaf.kind === 'chapter') {
        const p = quietPages[mobileLeaf.pageIndex];
        return `${p?.chapterLabel ?? 'Chapter'} · p.${mobileLeaf.footer}`;
      }
      if (mobileLeaf.kind === 'references') return 'References';
      return 'Resources';
    }
    if (stage === 'title') return 'Title page';
    if (stage === 'toc') return 'Contents';
    if (stage === 'reading') return `Chapter · Spread ${spreadIndex + 1}/${contentSpreads.length}`;
    return 'Closing';
  })();

  const renderMobileLeaf = (leaf: MobileLeaf) => {
    if (leaf.kind === 'half-title') return <HalfTitleLeaf />;
    if (leaf.kind === 'title') return <TitleLeaf />;
    if (leaf.kind === 'toc') return <TocLeaf activeId={activeTocId} onSelect={selectToc} />;
    if (leaf.kind === 'edition') return <EditionNotesLeaf />;
    if (leaf.kind === 'chapter') {
      const page = quietPages[leaf.pageIndex];
      if (!page) return <div className="qob-leaf" />;
      return (
        <ChapterLeaf
          page={page}
          showArabic={showArabic}
          fontSize={fontSize}
          lineHeight={lineHeight}
          activeRef={activeRef}
          onActiveRef={setActiveRef}
          showAudio={page.pageNumber === 88}
          audioPlaying={audioPlaying}
          onToggleAudio={() => setAudioPlaying((p) => !p)}
        />
      );
    }
    if (leaf.kind === 'references') return <ReferencesLeaf />;
    return (
      <ResourcesLeaf
        audioPlaying={audioPlaying}
        onToggleAudio={() => setAudioPlaying((p) => !p)}
      />
    );
  };

  const renderOpenSpread = () => {
    if (isMobile && mobileLeaf) {
      return (
        <BookPage side="right" key={mobileLeaf.key}>
          {renderMobileLeaf(mobileLeaf)}
          <PageFooterMark label={mobileLeaf.footer} roman={mobileLeaf.roman} />
        </BookPage>
      );
    }
    if (stage === 'title') {
      return (
        <>
          <BookPage side="left">
            <HalfTitleLeaf />
            <PageFooterMark label="i" roman />
          </BookPage>
          <BookPage side="right">
            <TitleLeaf />
            <PageFooterMark label="ii" roman />
          </BookPage>
        </>
      );
    }
    if (stage === 'toc') {
      return (
        <>
          <BookPage side="left">
            <TocLeaf activeId={activeTocId} onSelect={selectToc} />
            <PageFooterMark label="iii" roman />
          </BookPage>
          <BookPage side="right">
            <EditionNotesLeaf />
            <PageFooterMark label="iv" roman />
          </BookPage>
        </>
      );
    }
    if (stage === 'reading' && contentSpreads[spreadIndex]) {
      const spread = contentSpreads[spreadIndex];
      return (
        <>
          <BookPage side="left">
            {spread.left ? (
              <ChapterLeaf
                page={spread.left}
                showArabic={showArabic}
                fontSize={fontSize}
                lineHeight={lineHeight}
                activeRef={activeRef}
                onActiveRef={setActiveRef}
              />
            ) : (
              <div className="qob-leaf" />
            )}
            <PageFooterMark label={spread.left?.pageNumber ?? '—'} />
          </BookPage>
          <BookPage side="right">
            <ChapterLeaf
              page={spread.right}
              showArabic={showArabic}
              fontSize={fontSize}
              lineHeight={lineHeight}
              activeRef={activeRef}
              onActiveRef={setActiveRef}
              showAudio={spread.right.pageNumber === 88}
              audioPlaying={audioPlaying}
              onToggleAudio={() => setAudioPlaying((p) => !p)}
            />
            <PageFooterMark label={spread.right.pageNumber} />
          </BookPage>
        </>
      );
    }
    if (stage === 'end') {
      return (
        <>
          <BookPage side="left">
            <ReferencesLeaf />
            <PageFooterMark label={301} />
          </BookPage>
          <BookPage side="right">
            <ResourcesLeaf
              audioPlaying={audioPlaying}
              onToggleAudio={() => setAudioPlaying((p) => !p)}
            />
            <PageFooterMark label={302} />
          </BookPage>
        </>
      );
    }
    return null;
  };

  return (
    <div
      className={cn(
        'qob-root',
        themeClass,
        isMobile && 'qob-mobile',
        paperFlip && 'qob-turning'
      )}
    >
      <style>{bookStyles}</style>

      <div className="qob-toolbar">
        <div className="qob-toolbar-inner">
          <div className="min-w-0">
            <p className="truncate font-serif text-[13px] font-semibold text-[var(--qob-ink)]">
              {quietBook.title}
            </p>
            <p className="truncate font-sans text-[11px] text-[var(--qob-muted)]">
              Format 07 · {stageLabel}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <ToolBtn label="Settings" onClick={() => setSettingsOpen(true)}>
              <Type size={15} />
            </ToolBtn>
            <ToolBtn
              label="Bookmark"
              active={bookmarked}
              onClick={() => {
                setBookmarked((b) => !b);
                flash(bookmarked ? 'Bookmark removed' : 'Page bookmarked');
              }}
            >
              <Bookmark size={15} fill={bookmarked ? 'currentColor' : 'none'} />
            </ToolBtn>
            <ToolBtn
              label="Theme"
              onClick={() =>
                setTheme((t) => (t === 'light' ? 'sepia' : t === 'sepia' ? 'dark' : 'light'))
              }
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </ToolBtn>
          </div>
        </div>
      </div>

      <ReadingSettingsPanel
        open={settingsOpen}
        theme={theme}
        font="serif"
        fontSize={fontSize}
        lineHeight={lineHeight}
        width={720}
        showArabic={showArabic}
        onClose={() => setSettingsOpen(false)}
        onTheme={setTheme}
        onFont={() => undefined}
        onFontSize={setFontSize}
        onLineHeight={setLineHeight}
        onWidth={() => undefined}
        onShowArabic={setShowArabic}
      />

      {toast && <div className="qob-toast">{toast}</div>}

      <div className="qob-stage">
        <div className="qob-book-wrap">
          {stage === 'closed' ? (
            <div className="qob-closed-motion">
              <ClosedCover onOpen={openBook} />
            </div>
          ) : (
            <motion.div
              key="open-shell"
              className="qob-open-shell"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                className={cn(
                  'qob-hardcover',
                  paperFlip && !isMobile && 'qob-hardcover-turning'
                )}
              >
                <div
                  className={cn(
                    'qob-pages',
                    paperFlip && !isMobile && 'qob-pages-turning'
                  )}
                >
                  {isMobile ? (
                    <div className="qob-page-layer">{renderOpenSpread()}</div>
                  ) : (
                    renderOpenSpread()
                  )}

                  {paperFlip && !isMobile && <div className="qob-turn-shade" aria-hidden />}

                  {paperFlip &&
                    (isMobile ? (
                      /* Mobile: slide peel inside the clip — no rotateY (avoids left-corner shrink) */
                      <motion.div
                        key={`paper-m-${turnId}`}
                        className={cn(
                          'qob-paper',
                          'qob-paper-mobile',
                          turnDir > 0 ? 'qob-paper-fwd' : 'qob-paper-back'
                        )}
                        initial={{ x: '0%', opacity: 1 }}
                        animate={{
                          x: turnDir > 0 ? '-102%' : '102%',
                          opacity: 1,
                        }}
                        transition={{
                          duration: 0.55,
                          ease: [0.4, 0, 0.2, 1],
                        }}
                      >
                        <div className="qob-paper-face qob-paper-face-front qob-paper-face-mobile">
                          <span className="qob-paper-edge" aria-hidden />
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key={`paper-${turnId}`}
                        className={cn(
                          'qob-paper',
                          turnDir > 0 ? 'qob-paper-fwd' : 'qob-paper-back'
                        )}
                        initial={{ rotateY: 0 }}
                        animate={{ rotateY: turnDir > 0 ? -180 : 180 }}
                        transition={{
                          duration: 0.78,
                          ease: [0.645, 0.045, 0.355, 1],
                        }}
                        style={{
                          transformStyle: 'preserve-3d',
                          transformPerspective: 2400,
                        }}
                      >
                        <div className="qob-paper-face qob-paper-face-front">
                          <span className="qob-paper-curl" aria-hidden />
                        </div>
                        <div className="qob-paper-face qob-paper-face-rear">
                          <span className="qob-paper-curl qob-paper-curl-rear" aria-hidden />
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="qob-nav">
          <button
            type="button"
            className="qob-nav-btn"
            disabled={stage === 'closed'}
            onClick={goPrev}
          >
            <ChevronLeft size={16} /> {isMobile && stage !== 'closed' && mobileIndex <= 0 ? 'Cover' : 'Previous'}
          </button>
          <p className="font-serif text-[13px] text-[var(--qob-muted)] text-center leading-snug">
            {stageLabel}
            {isMobile && stage !== 'closed' && (
              <span className="block font-sans text-[10px] tracking-wide opacity-70">
                {mobileIndex + 1} / {mobileLeaves.length}
              </span>
            )}
          </p>
          <button
            type="button"
            className="qob-nav-btn"
            disabled={atMobileEnd || atDesktopEnd}
            onClick={goNext}
          >
            {stage === 'closed'
              ? 'Open book'
              : isMobile
                ? atMobileEnd
                  ? 'End'
                  : 'Next'
                : stage === 'title'
                  ? 'Contents'
                  : stage === 'toc'
                    ? 'Begin chapters'
                    : stage === 'reading' && spreadIndex >= contentSpreads.length - 1
                      ? 'Closing'
                      : 'Next'}{' '}
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Closed cover ───────────────────────────────────────────────────────── */

function ClosedCover({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="qob-closed-wrap">
      <button type="button" className="qob-closed-book" onClick={onOpen} aria-label="Open book">
        <div className="qob-closed-spine" />
        <div className="qob-closed-front">
          <div className="qob-closed-inner">
            <BookOrnament />
            <p className="qob-closed-eyebrow">Islamic Digital Library</p>
            <h1 className="qob-closed-title">{quietBook.title}</h1>
            <div className="qob-closed-rule" />
            <p
              dir="rtl"
              lang="ar"
              className="qob-closed-arabic"
            >
              {quietBook.arabicTitle}
            </p>
            <p className="qob-closed-sub">{quietBook.subtitle}</p>
            <div className="qob-closed-rule" />
            <p className="qob-closed-author">{quietBook.author}</p>
            <p className="qob-closed-meta">{quietBook.edition}</p>
            <p className="qob-closed-meta">{quietBook.publication}</p>
            <span className="qob-closed-cta">Tap or click to open →</span>
          </div>
        </div>
        <div className="qob-closed-pages-edge" aria-hidden />
      </button>
      <p className="mt-5 text-center font-serif text-[14px] text-[var(--qob-muted)]">
        Closed hardcover · Open to begin the title page
      </p>
    </div>
  );
}

/* ─── Open book chrome ───────────────────────────────────────────────────── */

function BookPage({ side, children }: { side: 'left' | 'right'; children: ReactNode }) {
  return (
    <div className={cn('qob-page', side === 'left' ? 'qob-page-left' : 'qob-page-right')}>
      {children}
    </div>
  );
}

function HalfTitleLeaf() {
  return (
    <div className="qob-leaf qob-leaf-center">
      <div className="qob-leaf-center-inner">
        <BookOrnament />
        <p className="mt-8 font-serif text-[1.15rem] font-semibold tracking-wide text-[var(--qob-ink)]">
          {quietBook.title}
        </p>
        <p className="mt-4 font-serif text-[13px] italic text-[var(--qob-muted)]">
          {quietBook.subtitle}
        </p>
      </div>
    </div>
  );
}

function TitleLeaf() {
  return (
    <div className="qob-leaf qob-leaf-center">
      <div className="qob-leaf-center-inner">
        <BookOrnament />
        <p className="qob-chapter-label mt-4">English Translation Edition</p>
        <h1 className="mt-4 font-cinzel text-[1.45rem] font-semibold leading-snug tracking-[0.04em] text-[var(--qob-ink)] sm:text-[1.75rem]">
          {quietBook.title}
        </h1>
        <p
          dir="rtl"
          lang="ar"
          className="mt-3 font-arabic text-[1.3rem] leading-relaxed text-[var(--qob-ink)]"
        >
          {quietBook.arabicTitle}
        </p>
        <p className="mt-4 max-w-sm font-serif text-[14px] italic text-[var(--qob-muted)]">
          {quietBook.subtitle}
        </p>
        <div className="qob-divider mt-6">
          <span />
          <BookOrnament />
          <span />
        </div>
        <p className="mt-5 font-serif text-[15px] text-[var(--qob-ink)]">{quietBook.author}</p>
        <p className="mt-4 font-sans text-[10px] uppercase tracking-[0.16em] text-[var(--qob-muted)]">
          Translated by
        </p>
        <p className="mt-1 font-serif text-[14px] text-[var(--qob-ink)]">{quietBook.translator}</p>
        <div className="qob-divider mt-6">
          <span />
          <BookOrnament />
          <span />
        </div>
        <dl className="mx-auto mt-5 grid w-full max-w-xs gap-2 text-left text-[12px]">
          {[
            ['Publisher', quietBook.publisher],
            ['Subject', quietBook.subject],
            ['Pages', String(quietBook.pages)],
            ['Published', quietBook.publication],
            ['ISBN', quietBook.isbn],
          ].map(([k, v]) => (
            <div
              key={k}
              className="flex justify-between gap-3 border-b border-[var(--qob-line)] pb-1.5"
            >
              <dt className="text-[var(--qob-muted)]">{k}</dt>
              <dd className="text-right font-medium text-[var(--qob-ink)]">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

function TocLeaf({
  activeId,
  onSelect,
}: {
  activeId: string;
  onSelect: (id: string, page: number) => void;
}) {
  return (
    <div className="qob-leaf qob-toc">
      <div className="qob-leaf-head">
        <BookOrnament />
        <h2 className="qob-leaf-title">CONTENTS</h2>
      </div>
      <ul className="qob-toc-list">
        {quietBook.toc.map((entry) => {
          const active = entry.id === activeId;
          return (
            <li key={entry.id}>
              <button
                type="button"
                onClick={() => onSelect(entry.id, entry.page)}
                className={cn('qob-toc-row', active && 'qob-toc-active')}
              >
                <span className="qob-toc-label">{entry.label}</span>
                <span className="qob-toc-dots" aria-hidden />
                <span className="qob-toc-page">
                  {entry.page}
                  {active && <span className="qob-toc-arrow">›</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function EditionNotesLeaf() {
  return (
    <div className="qob-leaf">
      <div className="qob-leaf-head">
        <BookOrnament />
        <h2 className="qob-leaf-title">EDITION NOTES</h2>
      </div>
      <div className="qob-body text-[0.95em]">
        <p className="qob-para">
          This demonstration edition presents a quiet digital reading room: a closed cover,
          a formal title page, a table of contents, and chapter spreads with Arabic sources,
          footnotes, audio, and PDF study aids.
        </p>
        <aside className="qob-note mt-4">
          <p className="qob-note-label">How to read</p>
          <p>
            Use Next to move: Cover → Title → Contents → Chapters → Resources. Click any
            contents row to jump to that chapter.
          </p>
        </aside>
        <p className="qob-para mt-4">
          Static frontend sample only — not connected to Supabase storage.
        </p>
      </div>
    </div>
  );
}

function ChapterLeaf({
  page,
  showArabic,
  fontSize,
  lineHeight,
  activeRef,
  onActiveRef,
  showAudio,
  audioPlaying,
  onToggleAudio,
}: {
  page: (typeof quietPages)[0];
  showArabic: boolean;
  fontSize: number;
  lineHeight: number;
  activeRef: string | null;
  onActiveRef: (n: string | null) => void;
  showAudio?: boolean;
  audioPlaying?: boolean;
  onToggleAudio?: () => void;
}) {
  return (
    <div className="qob-leaf" style={{ fontSize: `${fontSize}px`, lineHeight }}>
      {page.isChapterOpening ? (
        <header className="qob-chapter-open">
          <BookOrnament />
          <p className="qob-chapter-label">{page.chapterLabel}</p>
          <h2 className="qob-chapter-title">{page.chapterTitle}</h2>
          {page.openingQuote && (
            <blockquote className="qob-epigraph">
              <p>“{page.openingQuote.text}”</p>
              <footer>— {page.openingQuote.attribution}</footer>
            </blockquote>
          )}
          <div className="qob-divider">
            <span />
            <BookOrnament />
            <span />
          </div>
        </header>
      ) : (
        <p className="qob-running-head">
          {page.chapterLabel} · {page.chapterTitle}
        </p>
      )}

      <div className="qob-body">
        {page.blocks.map((block, i) => (
          <BlockView
            key={i}
            block={block}
            showArabic={showArabic}
            activeRef={activeRef}
            onActiveRef={onActiveRef}
          />
        ))}
      </div>

      {showAudio && (
        <div className="qob-audio">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--qob-accent)]">
            <Headphones size={12} /> Listen to this chapter
          </p>
          <p className="mt-1 font-serif text-[14px] text-[var(--qob-ink)]">
            {quietBook.audioChapter} · {quietBook.audioTitle}
          </p>
          <div className="mt-3 flex items-center gap-2.5">
            <button type="button" className="qob-audio-btn" onClick={onToggleAudio}>
              {audioPlaying ? (
                <Pause size={12} fill="currentColor" />
              ) : (
                <Play size={12} fill="currentColor" />
              )}
            </button>
            <div className="h-1 flex-1 rounded-full bg-[var(--qob-line)]">
              <div className="h-full w-[30%] rounded-full bg-[var(--qob-gold)]" />
            </div>
            <span className="text-[11px] text-[var(--qob-muted)]">{quietBook.audioDuration}</span>
          </div>
          <p className="mt-2 text-[11px] italic text-[var(--qob-muted)]">Demo player only</p>
        </div>
      )}
    </div>
  );
}

function ReferencesLeaf() {
  return (
    <div className="qob-leaf">
      <div className="qob-leaf-head">
        <BookOrnament />
        <h2 className="qob-leaf-title">REFERENCES</h2>
      </div>
      <ol className="space-y-3">
        {quietBook.bibliography.map((b, i) => (
          <li key={i} className="flex gap-2 font-serif text-[14px] leading-relaxed text-[var(--qob-ink)]">
            <span className="shrink-0 font-semibold text-[var(--qob-accent)]">{i + 1}.</span>
            <span>{b}</span>
          </li>
        ))}
      </ol>
      <aside className="qob-arabic mt-6">
        <p className="qob-arabic-label">Closing Arabic</p>
        <p dir="rtl" lang="ar" className="qob-arabic-text">
          وَقُل رَّبِّ زِدْنِي عِلْمًا
        </p>
        <p className="qob-arabic-tr">And say: My Lord, increase me in knowledge.</p>
        <p className="qob-arabic-src">Qurʾān 20:114</p>
      </aside>
    </div>
  );
}

function ResourcesLeaf({
  audioPlaying,
  onToggleAudio,
}: {
  audioPlaying: boolean;
  onToggleAudio: () => void;
}) {
  return (
    <div className="qob-leaf">
      <div className="qob-leaf-head">
        <BookOrnament />
        <h2 className="qob-leaf-title">CLOSING NOTE</h2>
      </div>

      <div className="qob-body text-[0.95em]">
        <p className="qob-para">
          This demonstration edition ends with audio for review and a short list of related
          works within the library. May the reader benefit, and may Allāh increase us in
          beneficial knowledge.
        </p>
      </div>

      <div className="qob-audio mt-5">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--qob-accent)]">
          <Headphones size={12} /> Chapter audio
        </p>
        <p className="mt-1 font-serif text-[14px]">{quietBook.audioTitle}</p>
        <div className="mt-3 flex items-center gap-2.5">
          <button type="button" className="qob-audio-btn" onClick={onToggleAudio}>
            {audioPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
          </button>
          <div className="h-1 flex-1 rounded-full bg-[var(--qob-line)]">
            <div className="h-full w-[18%] rounded-full bg-[var(--qob-gold)]" />
          </div>
          <span className="text-[11px] text-[var(--qob-muted)]">{quietBook.audioDuration}</span>
        </div>
      </div>

      <p className="mt-6 font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--qob-accent)]">
        Related works
      </p>
      <ul className="mt-3 space-y-2">
        {quietBook.related.map((r) => (
          <li key={r.href}>
            <Link
              to={r.href}
              className="font-serif text-[14px] text-[var(--qob-ink)] hover:text-[var(--qob-accent)]"
            >
              {r.title}
              <span className="mt-0.5 block text-[12px] text-[var(--qob-muted)]">{r.scholar}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BlockView({
  block,
  showArabic,
  activeRef,
  onActiveRef,
}: {
  block: QuietBlock;
  showArabic: boolean;
  activeRef: string | null;
  onActiveRef: (n: string | null) => void;
}) {
  if (block.type === 'paragraph') {
    return <p className="qob-para">{renderRefs(block.text, activeRef, onActiveRef)}</p>;
  }
  if (block.type === 'arabic' && showArabic) {
    return (
      <aside className="qob-arabic">
        <p className="qob-arabic-label">Arabic Source</p>
        <p dir="rtl" lang="ar" className="qob-arabic-text">
          {block.arabic}
        </p>
        <p className="qob-arabic-tr">{block.translation}</p>
        <p className="qob-arabic-src">{block.source}</p>
      </aside>
    );
  }
  if (block.type === 'scholar-note') {
    return (
      <aside className="qob-note">
        <p className="qob-note-label">{block.title ?? "Scholar's Note"}</p>
        <p>{block.text}</p>
      </aside>
    );
  }
  if (block.type === 'quote') {
    return (
      <blockquote className="qob-quote">
        {block.arabic && showArabic && (
          <p dir="rtl" lang="ar" className="qob-arabic-text mb-3">
            {block.arabic}
          </p>
        )}
        <p>“{block.english}”</p>
        <footer>— {block.attribution}</footer>
      </blockquote>
    );
  }
  if (block.type === 'footnotes') {
    return (
      <div className="qob-footnotes">
        {block.items.map((fn) => (
          <p
            key={fn.number}
            id={`qob-fn-${fn.number}`}
            className={cn(activeRef === fn.number && 'qob-fn-active')}
          >
            <sup>{fn.number}</sup> {fn.text}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

function renderRefs(
  text: string,
  activeRef: string | null,
  onActiveRef: (n: string | null) => void
) {
  return text.split(/(\[\d+\])/g).map((part, i) => {
    const m = part.match(/^\[(\d+)\]$/);
    if (!m) return <span key={i}>{part}</span>;
    const n = m[1];
    return (
      <button
        key={i}
        type="button"
        className={cn('qob-ref', activeRef === n && 'qob-ref-on')}
        onClick={() => {
          onActiveRef(activeRef === n ? null : n);
          document
            .getElementById(`qob-fn-${n}`)
            ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }}
      >
        [{n}]
      </button>
    );
  });
}

function ToolBtn({
  children,
  label,
  onClick,
  active,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn('qob-tool-btn', active && 'qob-tool-active')}
    >
      {children}
    </button>
  );
}

const bookStyles = `
.qob-root {
  --qob-desk: #F4F1EA;
  --qob-cover: #1A3A2A;
  --qob-cover-edge: #0F2418;
  --qob-page: #FBF7F0;
  --qob-ink: #2A2A2A;
  --qob-muted: #5A5A5A;
  --qob-accent: #2D5A42;
  --qob-gold: #C4A35A;
  --qob-highlight: #E7EFE9;
  --qob-line: rgba(42,42,42,0.12);
  --qob-gutter: rgba(42,42,42,0.14);
  background: var(--qob-desk);
  color: var(--qob-ink);
  padding-bottom: 3rem;
}
.qob-sepia {
  --qob-desk: #E8DCC4;
  --qob-page: #F7EEDC;
  --qob-ink: #3A2E1F;
  --qob-muted: #5C4D38;
  --qob-accent: #6B5210;
  --qob-gold: #A88836;
  --qob-highlight: #EFE4CF;
  --qob-cover: #3D3224;
  --qob-cover-edge: #2A2218;
}
.qob-dark {
  --qob-desk: #2F3844;
  --qob-page: #3D4654;
  --qob-ink: #F0EBE3;
  --qob-muted: #C2B8AA;
  --qob-accent: #D4B45A;
  --qob-gold: #D4B45A;
  --qob-highlight: rgba(212,180,90,0.14);
  --qob-cover: #1A222C;
  --qob-cover-edge: #0E1318;
  --qob-line: rgba(240,235,227,0.12);
  --qob-gutter: rgba(0,0,0,0.35);
}
.qob-toolbar {
  border-bottom: 1px solid var(--qob-line);
  background: color-mix(in srgb, var(--qob-page) 85%, transparent);
  backdrop-filter: blur(8px);
}
.qob-toolbar-inner {
  max-width: 1180px;
  margin: 0 auto;
  padding: 0.7rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.qob-tool-btn {
  display: inline-flex;
  height: 2.1rem;
  width: 2.1rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  color: var(--qob-ink);
  opacity: 0.75;
}
.qob-tool-btn:hover { opacity: 1; background: color-mix(in srgb, var(--qob-ink) 6%, transparent); }
.qob-tool-active { opacity: 1; color: var(--qob-accent); background: var(--qob-highlight); }
.qob-stage {
  --qob-spread-h: min(92vh, 1040px);
  max-width: 1180px;
  margin: 0 auto;
  padding: 1.75rem 1rem 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.qob-book-wrap {
  perspective: 2200px;
  width: 100%;
  display: flex;
  justify-content: center;
  transform-style: preserve-3d;
}
.qob-closed-motion,
.qob-open-shell {
  width: 100%;
  display: flex;
  justify-content: center;
}

/* Closed hardcover mockup */
.qob-closed-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0 0.5rem;
  width: 100%;
}
.qob-closed-book {
  position: relative;
  width: min(92vw, 380px);
  height: min(78vh, 620px);
  border: none;
  padding: 0;
  cursor: pointer;
  text-align: left;
  filter: drop-shadow(0 22px 40px rgba(20,30,24,0.28));
  transition: transform .25s ease;
}
.qob-closed-book:hover { transform: translateY(-4px) scale(1.01); }
.qob-closed-spine {
  position: absolute;
  inset: 0 auto 0 0;
  width: 22px;
  border-radius: 4px 0 0 4px;
  background: linear-gradient(90deg, #0A1A10, var(--qob-cover) 40%, #244C36);
  box-shadow: inset -2px 0 4px rgba(0,0,0,0.35);
}
.qob-closed-front {
  position: absolute;
  inset: 0 10px 0 18px;
  border-radius: 0 8px 8px 0;
  background:
    linear-gradient(145deg, rgba(255,255,255,0.06), transparent 40%),
    linear-gradient(180deg, var(--qob-cover), var(--qob-cover-edge));
  border: 1px solid rgba(255,255,255,0.08);
}
.qob-closed-inner {
  height: 100%;
  margin: 18px;
  padding: 1.75rem 1.35rem;
  border: 1px solid rgba(196,163,90,0.45);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: #F7F1E4;
}
.qob-closed-eyebrow {
  margin-top: 1rem;
  font-family: Inter, system-ui, sans-serif;
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  opacity: 0.7;
}
.qob-closed-title {
  margin-top: 1.25rem;
  font-family: Cinzel, Georgia, serif;
  font-size: clamp(1.25rem, 3.5vw, 1.55rem);
  font-weight: 600;
  letter-spacing: 0.04em;
  line-height: 1.3;
}
.qob-closed-rule {
  width: 3rem;
  height: 1px;
  margin: 1.1rem 0;
  background: linear-gradient(90deg, transparent, var(--qob-gold), transparent);
}
.qob-closed-arabic {
  font-family: Amiri, serif;
  font-size: 1.35rem;
  line-height: 1.8;
  opacity: 0.92;
}
.qob-closed-sub {
  margin-top: 0.75rem;
  font-family: 'Source Serif 4', Georgia, serif;
  font-size: 0.88rem;
  font-style: italic;
  opacity: 0.75;
  max-width: 16rem;
  line-height: 1.45;
}
.qob-closed-author {
  margin-top: 0.35rem;
  font-family: 'Source Serif 4', Georgia, serif;
  font-size: 0.95rem;
}
.qob-closed-meta {
  margin-top: 0.35rem;
  font-family: Inter, system-ui, sans-serif;
  font-size: 0.68rem;
  letter-spacing: 0.06em;
  opacity: 0.65;
}
.qob-closed-cta {
  margin-top: auto;
  font-family: Inter, system-ui, sans-serif;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--qob-gold);
}
.qob-closed-pages-edge {
  position: absolute;
  top: 10px;
  right: 0;
  bottom: 10px;
  width: 10px;
  border-radius: 0 3px 3px 0;
  background: repeating-linear-gradient(
    to right,
    #EDE6DA 0px,
    #EDE6DA 1px,
    #D9D0C0 1px,
    #D9D0C0 2px
  );
  box-shadow: 2px 0 6px rgba(0,0,0,0.15);
}

/* Open hardcover — tall equal pages */
.qob-hardcover {
  position: relative;
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 16px 18px 18px;
  border-radius: 4px 12px 12px 4px;
  background: linear-gradient(180deg, var(--qob-cover) 0%, var(--qob-cover-edge) 100%);
  box-shadow:
    0 22px 55px rgba(20, 30, 24, 0.24),
    0 2px 0 rgba(255,255,255,0.08) inset;
  overflow: hidden;
  transform-style: preserve-3d;
}
.qob-pages {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: stretch;
  height: var(--qob-spread-h);
  min-height: var(--qob-spread-h);
  background: var(--qob-page);
  border-radius: 2px;
  box-shadow: 0 1px 0 rgba(255,255,255,0.5) inset;
  overflow: hidden;
  perspective: 2400px;
  transform-style: preserve-3d;
}
.qob-page-layer {
  display: contents;
}
.qob-page {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  max-height: 100%;
  background: var(--qob-page);
  z-index: 1;
  overflow: hidden;
}
.qob-page-left {
  box-shadow: inset -22px 0 32px -20px var(--qob-gutter);
  border-right: 1px solid color-mix(in srgb, var(--qob-gutter) 50%, transparent);
}
.qob-page-right {
  box-shadow: inset 22px 0 32px -20px var(--qob-gutter);
}

/* Physical paper sheet — flips from the book gutter (half width on desktop) */
.qob-paper {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50%;
  z-index: 30;
  pointer-events: none;
  transform-style: preserve-3d;
  -webkit-transform-style: preserve-3d;
  will-change: transform;
}
.qob-paper-fwd {
  right: 0;
  transform-origin: left center;
}
.qob-paper-back {
  left: 0;
  transform-origin: right center;
}
.qob-paper-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  background:
    linear-gradient(90deg, rgba(42,42,42,0.07), transparent 14%),
    linear-gradient(180deg, #FFFCF0 0%, var(--qob-page) 40%, #F3EDE3 100%);
  box-shadow: 0 8px 28px rgba(20, 30, 24, 0.18);
  overflow: hidden;
}
.qob-paper-face-front {
  background:
    linear-gradient(90deg, rgba(42,42,42,0.1) 0%, transparent 18%),
    var(--qob-page);
}
.qob-paper-face-rear {
  transform: rotateY(180deg);
  background:
    linear-gradient(270deg, rgba(42,42,42,0.12) 0%, transparent 22%),
    linear-gradient(180deg, #EDE6DA, #F7F1E6 55%, #E8E0D2);
}
.qob-paper-fwd .qob-paper-face-front {
  border-left: 1px solid rgba(42,42,42,0.08);
}
.qob-paper-back .qob-paper-face-front {
  border-right: 1px solid rgba(42,42,42,0.08);
}
.qob-paper-curl {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    105deg,
    transparent 0%,
    transparent 62%,
    rgba(0,0,0,0.06) 78%,
    rgba(255,255,255,0.35) 88%,
    rgba(0,0,0,0.12) 100%
  );
}
.qob-paper-curl-rear {
  background: linear-gradient(
    255deg,
    transparent 0%,
    transparent 55%,
    rgba(0,0,0,0.1) 75%,
    rgba(255,255,255,0.2) 90%,
    rgba(0,0,0,0.14) 100%
  );
}
.qob-turn-shade {
  position: absolute;
  inset: 0;
  z-index: 15;
  pointer-events: none;
  background: linear-gradient(
    90deg,
    rgba(20, 30, 24, 0.08),
    rgba(20, 30, 24, 0.02) 45%,
    rgba(20, 30, 24, 0.14)
  );
}
/* While turning, do not clip the 3D sheet */
.qob-hardcover-turning,
.qob-pages-turning {
  overflow: visible !important;
}
.qob-turning .qob-book-wrap {
  z-index: 4;
}
.qob-leaf {
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
  padding: 1.75rem 2rem 3.25rem;
  font-family: 'Source Serif 4', Georgia, serif;
  color: var(--qob-ink);
  overflow: hidden;
}
.qob-leaf-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
  height: 100%;
  min-height: 0;
  padding-top: 1rem;
  padding-bottom: 0.5rem;
}
.qob-leaf-center-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
  max-width: 26rem;
  margin: 0 auto;
}
.qob-leaf-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.65rem;
  margin-bottom: 1.75rem;
}
.qob-leaf-title {
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}
.qob-toc-list { list-style: none; padding: 0; margin: 0; }
.qob-toc-row {
  width: 100%;
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  padding: 0.58rem 0.7rem;
  border-radius: 999px;
  text-align: left;
  color: var(--qob-ink);
  font-size: 0.95rem;
  line-height: 1.35;
}
.qob-toc-row:hover { background: color-mix(in srgb, var(--qob-highlight) 70%, transparent); }
.qob-toc-active { background: var(--qob-highlight) !important; font-weight: 600; }
.qob-toc-label { flex: 0 1 auto; max-width: 72%; }
.qob-toc-dots {
  flex: 1 1 auto;
  border-bottom: 1px dotted color-mix(in srgb, var(--qob-ink) 35%, transparent);
  min-width: 1.25rem;
  transform: translateY(-0.25rem);
}
.qob-toc-page {
  flex: 0 0 auto;
  font-variant-numeric: tabular-nums;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}
.qob-toc-arrow { color: var(--qob-accent); font-weight: 700; }
.qob-chapter-open { text-align: center; margin-bottom: 1.35rem; }
.qob-chapter-label {
  margin-top: 0.55rem;
  font-size: 0.78rem;
  letter-spacing: 0.2em;
  font-weight: 600;
  text-transform: uppercase;
}
.qob-chapter-title {
  margin-top: 0.65rem;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.25;
}
.qob-epigraph {
  margin: 1rem auto 0;
  max-width: 22rem;
  font-style: italic;
  font-size: 0.95em;
  color: var(--qob-muted);
  line-height: 1.55;
}
.qob-epigraph footer {
  margin-top: 0.5rem;
  font-style: normal;
  font-size: 0.82em;
}
.qob-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  margin: 1.1rem 0 0.25rem;
}
.qob-divider span {
  width: 2.75rem;
  height: 1px;
  background: var(--qob-gold);
  opacity: 0.7;
}
.qob-running-head {
  text-align: center;
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--qob-muted);
  margin-bottom: 1.15rem;
}
.qob-body { display: flex; flex-direction: column; gap: 0.95em; }
.qob-para { text-align: justify; hyphens: auto; color: var(--qob-ink); }
.qob-arabic {
  margin: 0.35rem 0;
  padding: 0.85rem 0.85rem 0.85rem 0.95rem;
  border-left: 2px solid var(--qob-gold);
  background: color-mix(in srgb, var(--qob-highlight) 55%, transparent);
  border-radius: 0 6px 6px 0;
}
.qob-arabic-label {
  font-family: Inter, system-ui, sans-serif;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--qob-accent);
}
.qob-arabic-text {
  margin-top: 0.45rem;
  font-family: Amiri, 'Traditional Arabic', serif;
  font-size: 1.28em;
  line-height: 2.05;
  direction: rtl;
  text-align: right;
  color: var(--qob-ink);
}
.qob-arabic-tr {
  margin-top: 0.55rem;
  font-style: italic;
  font-size: 0.9em;
  color: var(--qob-muted);
}
.qob-arabic-src {
  margin-top: 0.35rem;
  font-family: Inter, system-ui, sans-serif;
  font-size: 0.72rem;
  color: var(--qob-accent);
}
.qob-note {
  padding: 0.8rem 0.9rem;
  border-radius: 8px;
  background: var(--qob-highlight);
  border: 1px solid color-mix(in srgb, var(--qob-accent) 18%, transparent);
  font-size: 0.9em;
}
.qob-note-label {
  font-family: Inter, system-ui, sans-serif;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--qob-accent);
  margin-bottom: 0.35rem;
}
.qob-quote {
  margin: 0.25rem 0;
  padding: 0.9rem 0;
  border-top: 1px solid var(--qob-line);
  border-bottom: 1px solid var(--qob-line);
  text-align: center;
  font-style: italic;
}
.qob-quote footer {
  margin-top: 0.45rem;
  font-style: normal;
  font-size: 0.78em;
  color: var(--qob-accent);
}
.qob-footnotes {
  margin-top: 1.15rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--qob-line);
  font-size: 0.78em;
  color: var(--qob-muted);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.qob-fn-active { color: var(--qob-ink); }
.qob-ref {
  font-family: Inter, system-ui, sans-serif;
  font-size: 0.7em;
  font-weight: 700;
  vertical-align: super;
  color: var(--qob-accent);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 0.1em;
}
.qob-ref-on { color: var(--qob-gold); text-decoration: underline; }
.qob-page-footer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.55rem 1rem 1rem;
  color: var(--qob-gold);
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--qob-page) 0%, transparent) 0%,
    var(--qob-page) 35%,
    var(--qob-page) 100%
  );
  pointer-events: none;
}
.qob-footer-rule {
  width: 1.6rem;
  height: 1px;
  background: var(--qob-gold);
  opacity: 0.75;
}
.qob-page-num {
  font-family: 'Source Serif 4', Georgia, serif;
  font-size: 0.85rem;
  color: var(--qob-ink);
  min-width: 1.5rem;
  text-align: center;
}
.qob-page-num-roman { font-style: italic; }
.qob-audio {
  margin-top: 1.15rem;
  padding: 0.85rem;
  border-radius: 8px;
  border: 1px solid var(--qob-line);
  background: color-mix(in srgb, var(--qob-highlight) 60%, transparent);
}
.qob-audio-btn {
  display: inline-flex;
  height: 1.85rem;
  width: 1.85rem;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: none;
  background: var(--qob-accent);
  color: #fff;
  cursor: pointer;
}
.qob-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 1.35rem;
  padding: 0 0.25rem;
  width: 100%;
  max-width: 1180px;
  margin-left: auto;
  margin-right: auto;
}
.qob-nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.55rem 0.95rem;
  border-radius: 8px;
  border: 1px solid var(--qob-line);
  background: var(--qob-page);
  color: var(--qob-ink);
  font-size: 13px;
  font-family: Inter, system-ui, sans-serif;
  cursor: pointer;
  white-space: nowrap;
}
.qob-nav-btn:disabled { opacity: 0.35; cursor: default; }
.qob-nav-btn:hover:not(:disabled) { border-color: var(--qob-accent); color: var(--qob-accent); }
.qob-toast {
  position: fixed;
  bottom: 1.25rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  padding: 0.55rem 1rem;
  border-radius: 999px;
  background: var(--qob-cover);
  color: #FBF7F0;
  font-size: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.18);
}
.font-arabic { font-family: Amiri, 'Traditional Arabic', serif; }

/* Mobile — one page at a time; same gutter-style paper turn as desktop */
@media (max-width: 900px) {
  .qob-stage {
    --qob-spread-h: min(76vh, 780px);
    padding: 1rem 0.65rem 0;
  }
  .qob-toolbar-inner { padding: 0.55rem 0.85rem; }
  .qob-book-wrap {
    perspective: 1800px;
    -webkit-perspective: 1800px;
    overflow: visible;
  }
  .qob-closed-motion,
  .qob-open-shell {
    transform-style: preserve-3d;
    -webkit-transform-style: preserve-3d;
  }
  .qob-hardcover {
    padding: 10px 10px 12px;
    border-radius: 6px 12px 12px 6px;
    max-width: min(100%, 440px);
    margin-left: auto;
    margin-right: auto;
    overflow: hidden;
  }
  .qob-pages {
    grid-template-columns: 1fr;
    height: var(--qob-spread-h);
    min-height: var(--qob-spread-h);
    overflow: hidden; /* keep clipped — prevents left-corner shrink on turn */
    perspective: none;
    transform-style: flat;
  }
  .qob-page-layer {
    display: block;
    position: relative;
    height: 100%;
    min-height: 0;
    width: 100%;
    grid-column: 1;
    grid-row: 1;
  }
  .qob-page-layer > .qob-page {
    height: 100%;
    width: 100%;
  }
  .qob-page {
    height: 100%;
    min-height: 0;
    max-height: 100%;
    overflow: hidden;
  }
  .qob-page-left,
  .qob-page-right {
    border: none;
    box-shadow: inset 0 0 30px -16px var(--qob-gutter);
  }
  /* Mobile page peel — slides inside the frame, no 3D foreshortening */
  .qob-paper-mobile {
    display: block !important;
    width: 100%;
    left: 0;
    right: 0;
    z-index: 40;
    transform-origin: center center !important;
    filter: none;
    will-change: transform;
  }
  .qob-paper-mobile.qob-paper-fwd,
  .qob-paper-mobile.qob-paper-back {
    left: 0;
    right: 0;
    transform-origin: center center;
  }
  .qob-paper-face-mobile {
    border-radius: 0;
    box-shadow: none;
    background:
      linear-gradient(90deg, rgba(42,42,42,0.04), transparent 18%),
      linear-gradient(180deg, #FFFCF0 0%, var(--qob-page) 50%, #F0E9DC 100%);
  }
  .qob-paper-edge {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 18px;
    pointer-events: none;
  }
  .qob-paper-mobile.qob-paper-fwd .qob-paper-edge {
    right: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(20, 30, 24, 0.08) 40%,
      rgba(20, 30, 24, 0.22)
    );
  }
  .qob-paper-mobile.qob-paper-back .qob-paper-edge {
    left: 0;
    background: linear-gradient(
      270deg,
      transparent,
      rgba(20, 30, 24, 0.08) 40%,
      rgba(20, 30, 24, 0.22)
    );
  }
  .qob-leaf {
    padding: 1.2rem 1.1rem 3rem;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
  .qob-page-footer { padding: 0.5rem 0.85rem 0.95rem; }
  .qob-chapter-title { font-size: 1.2rem; }
  .qob-closed-book {
    width: min(78vw, 320px);
    height: min(68vh, 540px);
  }
  .qob-closed-inner { margin: 14px; padding: 1.25rem 1rem; }
  .qob-nav {
    max-width: min(100%, 440px);
    margin-top: 1rem;
    gap: 0.4rem;
  }
  .qob-nav-btn { padding: 0.55rem 0.7rem; font-size: 12px; }
}

@media (max-width: 480px) {
  .qob-stage { --qob-spread-h: min(72vh, 700px); padding: 0.75rem 0.4rem 0; }
  .qob-hardcover { padding: 8px 8px 10px; max-width: 100%; }
  .qob-leaf { padding: 1rem 0.9rem 2.85rem; }
  .qob-nav { max-width: 100%; }
  .qob-nav p { font-size: 11px; }
  .qob-closed-cta { font-size: 0.7rem; }
  .qob-book-wrap {
    perspective: 1400px;
    -webkit-perspective: 1400px;
  }
}
`;
