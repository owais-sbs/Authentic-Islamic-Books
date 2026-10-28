/**
 * Static Kutub-inspired demo book — frontend only.
 * Sample educational content; not attributed to real scholars.
 */

export interface DemoBookPage {
  id: string;
  pageNumber: number;
  chapterId: string;
  englishHeading?: string;
  arabicHeading?: string;
  english: string[];
  arabic: string[];
}

export interface DemoBookChapter {
  id: string;
  number: number;
  titleEn: string;
  titleAr: string;
  startPage: number;
  endPage: number;
}

export interface DemoIslamicBook {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  author: string;
  description: string;
  language: string;
  contentType: string;
  status: string;
  coverColor: string;
  coverEdge: string;
  totalPages: number;
  chapters: DemoBookChapter[];
  pages: DemoBookPage[];
}

export const DEMO_BOOK_SLUG = 'demo-islamic-book';

export const demoIslamicBook: DemoIslamicBook = {
  id: 'demo-foundations-islamic-knowledge',
  slug: DEMO_BOOK_SLUG,
  titleEn: 'Foundations of Islamic Knowledge',
  titleAr: 'أصول العلم الإسلامي',
  author: 'Abdullah Ahmad (demo author)',
  description:
    'A short educational demonstration book presenting foundational ideas about faith, beneficial knowledge, worship, and good character. This is sample content created for the Authentic Islamic Books reading interface — not a historical or scholarly edition.',
  language: 'Arabic + English',
  contentType: 'Educational reading (demo)',
  status: 'Demo content',
  coverColor: '#104C3B',
  coverEdge: '#0A352A',
  totalPages: 10,
  chapters: [
    {
      id: 'ch-1',
      number: 1,
      titleEn: 'The Foundations of Faith',
      titleAr: 'أصول الإيمان',
      startPage: 1,
      endPage: 3,
    },
    {
      id: 'ch-2',
      number: 2,
      titleEn: 'Knowledge and Worship',
      titleAr: 'العلم والعبادة',
      startPage: 4,
      endPage: 6,
    },
    {
      id: 'ch-3',
      number: 3,
      titleEn: 'Character and Daily Life',
      titleAr: 'الأخلاق والحياة اليومية',
      startPage: 7,
      endPage: 10,
    },
  ],
  pages: [
    {
      id: 'p-1',
      pageNumber: 1,
      chapterId: 'ch-1',
      englishHeading: 'Chapter 1 — The Foundations of Faith',
      arabicHeading: 'الفصل الأول — أصول الإيمان',
      english: [
        'Faith begins with a sincere heart that turns to Allah with honesty and humility. It is not a slogan spoken by the tongue alone, but a living conviction that shapes intention, speech, and action.',
        'A student of knowledge starts by purifying intention: seeking Allah’s pleasure, not praise from people. When the intention is sound, even a small step of learning becomes beneficial.',
      ],
      arabic: [
        'يبدأ الإيمان بقلبٍ صادق يتوجه إلى الله بصدق وتواضع. وليس مجرد شعارٍ يُقال باللسان، بل قناعةٌ حية تُشكّل النية والقول والعمل.',
        'يبدأ طالب العلم بتطهير النية: طلب مرضاة الله لا ثناء الناس. فإذا صلحت النية، صار حتى الخطوة الصغيرة في التعلم نافعة.',
      ],
    },
    {
      id: 'p-2',
      pageNumber: 2,
      chapterId: 'ch-1',
      english: [
        'Beneficial knowledge clarifies what is true and what is false. It helps a person worship with understanding and avoid confusion that weakens certainty.',
        'Sincerity protects knowledge from becoming a tool of pride. The believer asks Allah for insight that softens the heart and guides daily choices.',
      ],
      arabic: [
        'العلم النافع يبيّن الحق من الباطل، ويعين المرء على العبادة بفهم، ويقيه من الالتباس الذي يضعف اليقين.',
        'والإخلاص يحفظ العلم من أن يصير وسيلةً للكبر. فالمؤمن يسأل الله فهماً يلين القلب ويهدي قراراته اليومية.',
      ],
    },
    {
      id: 'p-3',
      pageNumber: 3,
      chapterId: 'ch-1',
      english: [
        'Seeking knowledge is an act of worship when it is done for Allah. The path is gradual: learn, reflect, ask, and practice with patience.',
        'A strong foundation of faith prepares the heart for the next stage: connecting knowledge with worship and good character.',
      ],
      arabic: [
        'طلب العلم عبادة إذا كان لله. والطريق تدريجي: تعلم، وتأمل، واسأل، واعمل بصبر.',
        'وأساس الإيمان المتين يهيئ القلب للمرحلة التالية: ربط العلم بالعبادة وحسن الخلق.',
      ],
    },
    {
      id: 'p-4',
      pageNumber: 4,
      chapterId: 'ch-2',
      englishHeading: 'Chapter 2 — Knowledge and Worship',
      arabicHeading: 'الفصل الثاني — العلم والعبادة',
      english: [
        'Knowledge without practice is incomplete. Worship without understanding can become empty habit. The balanced path joins learning with sincere devotion.',
        'Prayer, remembrance, and gratitude become deeper when the heart knows why they matter. Knowledge lights the way; worship walks it.',
      ],
      arabic: [
        'العلم بلا عمل ناقص، والعبادة بلا فهم قد تصير عادة فارغة. والطريق المتوازن يجمع التعلم مع الإخلاص في التعبد.',
        'وتزداد الصلاة والذكر والشكر عمقاً حين يعرف القلب لماذا تهم. فالعلم يضيء الطريق، والعبادة تسير فيه.',
      ],
    },
    {
      id: 'p-5',
      pageNumber: 5,
      chapterId: 'ch-2',
      english: [
        'Applying what one learns is a sign of benefit. A student reviews lessons, corrects mistakes gently, and seeks company that encourages good deeds.',
        'Worship includes private acts known only to Allah and public manners that ease the lives of others. Both deserve careful attention.',
      ],
      arabic: [
        'العمل بما يتعلمه المرء علامة الانتفاع. فيراجع الطالب دروسه، ويصلح أخطاءه بلطف، ويطلب صحبة تعين على الخير.',
        'والعبادة تشمل أعمالاً سرّية لا يعلمها إلا الله، وآداباً ظاهرة تُيسّر حياة الناس. وكلاهما يستحق عناية دقيقة.',
      ],
    },
    {
      id: 'p-6',
      pageNumber: 6,
      chapterId: 'ch-2',
      english: [
        'Good character is the fruit of sound knowledge and sincere worship. Kind speech, honesty, and patience are part of living faith.',
        'With this foundation, the reader moves to daily life: how faith appears at home, at work, and among neighbours.',
      ],
      arabic: [
        'حسن الخلق ثمرة العلم الصحيح والعبادة الخالصة. فطلاقة الوجه والصدق والصبر من معالم الإيمان الحي.',
        'وبهذا الأساس ينتقل القارئ إلى الحياة اليومية: كيف يظهر الإيمان في البيت والعمل وبين الجيران.',
      ],
    },
    {
      id: 'p-7',
      pageNumber: 7,
      chapterId: 'ch-3',
      englishHeading: 'Chapter 3 — Character and Daily Life',
      arabicHeading: 'الفصل الثالث — الأخلاق والحياة اليومية',
      english: [
        'Honesty builds trust. A believer keeps promises, avoids deceit, and speaks truth even when it is difficult.',
        'Kindness softens hard moments. A gentle word, a helpful hand, and respect for elders are simple acts with lasting effect.',
      ],
      arabic: [
        'الصدق يبني الثقة. فالمؤمن يحفظ العهد، ويجتنب الغش، ويقول الحق ولو شق عليه.',
        'واللطف يلين المواقف الصعبة. فكلمة طيبة، ويدٌ مساعدة، وتوقير الكبار أعمال يسيرة بأثرٍ باقٍ.',
      ],
    },
    {
      id: 'p-8',
      pageNumber: 8,
      chapterId: 'ch-3',
      english: [
        'Patience is needed in learning, work, and family life. Anger may rise quickly, but restraint protects relationships and clears the mind.',
        'Family responsibilities are part of faith in practice: care, fairness, and mercy at home strengthen the whole community.',
      ],
      arabic: [
        'الصبر مطلوب في التعلم والعمل وحياة الأسرة. وقد يثور الغضب سريعاً، لكن ضبط النفس يحفظ العلاقات ويصفّي الذهن.',
        'ومسؤوليات الأسرة من الإيمان العملي: الرعاية والعدل والرحمة في البيت تقوّي المجتمع كله.',
      ],
    },
    {
      id: 'p-9',
      pageNumber: 9,
      chapterId: 'ch-3',
      english: [
        'Daily conduct includes how one spends time, treats neighbours, and responds to hardship. Small consistent habits often matter more than rare dramatic gestures.',
        'A student of knowledge reviews the day briefly: what was learned, what was practiced, and what needs improvement tomorrow.',
      ],
      arabic: [
        'يشمل السلوك اليومي كيف يُقضى الوقت، وكيف يُعامل الجيران، وكيف يُواجَه البلاء. والعادات الصغيرة المستمرة أهم غالباً من المواقف النادرة.',
        'ويراجع طالب العلم يومه بإيجاز: ماذا تعلم، وماذا عمل، وماذا يحتاج إلى إصلاح غداً.',
      ],
    },
    {
      id: 'p-10',
      pageNumber: 10,
      chapterId: 'ch-3',
      english: [
        'This demonstration book ends here. Its purpose is to show a clear Arabic–English reading experience with chapters, pages, and calm navigation.',
        'May the reader continue seeking beneficial knowledge with sincerity, and may every page encourage worship, good character, and practical daily excellence. This is sample educational content for interface demonstration only.',
      ],
      arabic: [
        'تنتهي هنا هذه الرسالة التجريبية. غايتها إظهار تجربة قراءة عربية–إنجليزية واضحة مع فصول وصفحات وتنقل هادئ.',
        'ولعل القارئ يواصل طلب العلم النافع بإخلاص، وأن تشجّع كل صفحة على العبادة وحسن الخلق والإحسان العملي اليومي. وهذا محتوى تعليمي نموذجي لعرض الواجهة فحسب.',
      ],
    },
  ],
};

export function getDemoBookPage(pageNumber: number): DemoBookPage | undefined {
  return demoIslamicBook.pages.find((p) => p.pageNumber === pageNumber);
}

export function getDemoBookChapterForPage(pageNumber: number): DemoBookChapter | undefined {
  return demoIslamicBook.chapters.find(
    (c) => pageNumber >= c.startPage && pageNumber <= c.endPage,
  );
}

export function getDemoBookChapter(chapterId: string): DemoBookChapter | undefined {
  return demoIslamicBook.chapters.find((c) => c.id === chapterId);
}

export function clampDemoPage(page: number): number {
  if (!Number.isFinite(page) || page < 1) return 1;
  if (page > demoIslamicBook.totalPages) return demoIslamicBook.totalPages;
  return Math.floor(page);
}
