/**
 * Static demo content for Format 07 — Quiet Reading Room.
 * Frontend-only. Not connected to Supabase.
 */

export type QuietTheme = 'light' | 'sepia' | 'dark';
export type QuietFont = 'serif' | 'sans';

export interface QuietTocEntry {
  id: string;
  label: string;
  page: number;
  isChapter?: boolean;
  chapterTitle?: string;
}

export type QuietBlock =
  | { type: 'paragraph'; text: string }
  | {
      type: 'arabic';
      arabic: string;
      translation: string;
      source: string;
    }
  | { type: 'scholar-note'; title?: string; text: string }
  | {
      type: 'quote';
      arabic?: string;
      english: string;
      attribution: string;
    }
  | { type: 'footnotes'; items: { number: string; text: string }[] };

export interface QuietPage {
  id: string;
  pageNumber: number;
  chapterId: string;
  chapterLabel: string;
  chapterTitle: string;
  isChapterOpening?: boolean;
  openingQuote?: { text: string; attribution: string };
  blocks: QuietBlock[];
}

export const quietBook = {
  formatNumber: '07',
  formatName: 'Quiet Reading Room',
  formatTagline: 'An immersive digital reading experience for Islamic scholarship.',
  formatDescription: 'Designed for uninterrupted reading, scholarly study and reflection.',
  title: 'Foundations of the Straight Path',
  arabicTitle: 'أُصُولُ الصِّرَاطِ الْمُسْتَقِيمِ',
  subtitle: 'A Study of Creed, Worship and the Call to Tawḥīd',
  author: 'Demo Scholarly Edition',
  translator: 'Islamic Digital Library Translation Board',
  edition: 'English Translation Edition',
  publisher: 'Islamic Digital Library Press',
  originalLanguage: 'Arabic',
  translation: 'English',
  subject: 'ʿAqīdah · Tawḥīd · Worship',
  publication: 'Demonstration Digital Edition · 1447 AH / 2026 CE',
  isbn: 'DEMO-IDL-0007',
  pages: 348,
  readingTime: 'Approx. 6 hours',
  continueChapter: 'Chapter 3',
  continuePage: 87,
  continueProgress: 63,
  audioChapter: 'Chapter 3',
  audioTitle: 'The Call to Tawḥīd',
  audioDuration: '12:43',
  toc: [
    { id: 'intro', label: 'Introduction', page: 5 },
    {
      id: 'ch1',
      label: 'Chapter 1 — The Meaning of Worship',
      page: 12,
      isChapter: true,
      chapterTitle: 'Chapter 1',
    },
    {
      id: 'ch2',
      label: 'Chapter 2 — The Foundations of Faith',
      page: 41,
      isChapter: true,
      chapterTitle: 'Chapter 2',
    },
    {
      id: 'ch3',
      label: 'Chapter 3 — The Call to Tawheed',
      page: 87,
      isChapter: true,
      chapterTitle: 'Chapter 3',
    },
    {
      id: 'ch4',
      label: 'Chapter 4 — Clarifying Common Doubts',
      page: 132,
      isChapter: true,
      chapterTitle: 'Chapter 4',
    },
    {
      id: 'ch5',
      label: 'Chapter 5 — Living Upon Sound Creed',
      page: 198,
      isChapter: true,
      chapterTitle: 'Chapter 5',
    },
    { id: 'conclusion', label: 'Conclusion', page: 284 },
    { id: 'references', label: 'References & Notes', page: 301 },
  ] as QuietTocEntry[],
  bibliography: [
    'Qurʾān 51:56 — purpose of creation and worship.',
    'Qurʾān 1:5; 112:1 — foundational verses of worship and oneness.',
    'Classical primers on tawḥīd and the meaning of ʿibādah (demo citations).',
    'Prophetic traditions on sincerity and knowledge (demo presentation).',
    'Editorial notes for the Quiet Reading Room demonstration edition.',
    'Translator’s preface — principles of rendering scholarly Arabic (demo).',
  ],
  related: [
    {
      title: 'Foundations of Sound Creed',
      scholar: 'Shaykh Ṣāliḥ al-Fawzān',
      description: 'A clear primer on tawḥīd for structured study.',
      href: '/library/foundations-of-sound-creed',
    },
    {
      title: 'On the Manners of the Student of Knowledge',
      scholar: 'al-Khaṭīb al-Baghdādī',
      description: 'Quotation-led reading of classical scholarly etiquette.',
      href: '/library/manners-of-the-student',
    },
    {
      title: 'The Path of the Traveller',
      scholar: 'Demo Scholarly Series',
      description: 'Spiritual discipline with audio and PDF study aids.',
      href: '/library/path-of-the-traveller',
    },
  ],
};

/** Chapter reading pages (after title + TOC). */
export const quietPages: QuietPage[] = [
  {
    id: 'p-ch1-open',
    pageNumber: 12,
    chapterId: 'ch1',
    chapterLabel: 'CHAPTER 1',
    chapterTitle: 'The Meaning of Worship',
    isChapterOpening: true,
    openingQuote: {
      text: 'It is You we worship and You we ask for help.',
      attribution: "Qur'an 1:5",
    },
    blocks: [
      {
        type: 'paragraph',
        text: 'Worship (ʿibādah) in the Islamic tradition is not limited to ritual movements. It is a comprehensive term for every word and deed that Allāh loves — outward and inward — performed with sincerity and in accordance with the prophetic guidance.[1]',
      },
      {
        type: 'paragraph',
        text: 'The scholars therefore begin many works by clarifying this meaning. Without it, a student may pray diligently while still directing hope, fear, or vows elsewhere — and that is precisely what the call to tawḥīd came to correct.',
      },
      {
        type: 'arabic',
        arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
        translation: 'It is You we worship and You we ask for help.',
        source: 'Qurʾān 1:5',
      },
      {
        type: 'footnotes',
        items: [
          {
            number: '1',
            text: 'Demo footnote — classical definitions of ʿibādah in creed primers.',
          },
        ],
      },
    ],
  },
  {
    id: 'p-ch1-2',
    pageNumber: 13,
    chapterId: 'ch1',
    chapterLabel: 'CHAPTER 1',
    chapterTitle: 'The Meaning of Worship',
    blocks: [
      {
        type: 'paragraph',
        text: 'Sincerity (ikhlāṣ) and conformity to the Sunnah are the two wings of accepted worship. One without the other leaves the deed incomplete. This chapter prepares the reader for the later call to tawḥīd by fixing these foundations first.[2]',
      },
      {
        type: 'scholar-note',
        title: "Scholar's Note",
        text: 'A digital edition should preserve this order: define worship, then call to pure monotheism, then address doubts — the rhythm of classical teaching.',
      },
      {
        type: 'footnotes',
        items: [
          {
            number: '2',
            text: 'Demo citation — discussions of ikhlāṣ and mutābaʿah in worship manuals.',
          },
        ],
      },
    ],
  },
  {
    id: 'p-ch2-open',
    pageNumber: 41,
    chapterId: 'ch2',
    chapterLabel: 'CHAPTER 2',
    chapterTitle: 'The Foundations of Faith',
    isChapterOpening: true,
    openingQuote: {
      text: 'Faith is belief in the heart, speech on the tongue, and action upon the limbs.',
      attribution: 'A summary widely cited among the people of the Sunnah — demo',
    },
    blocks: [
      {
        type: 'paragraph',
        text: 'Faith (īmān) rests upon belief, speech, and action. The early scholars defended this completeness against those who reduced faith to a private claim without obedience, and against those who expelled people from Islam without evidence.[3]',
      },
      {
        type: 'arabic',
        arabic: 'آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ',
        translation: 'The Messenger has believed in what was revealed to him from his Lord, and so have the believers…',
        source: 'Qurʾān 2:285',
      },
      {
        type: 'footnotes',
        items: [
          {
            number: '3',
            text: 'Demo footnote — classical debates on the definition of īmān.',
          },
        ],
      },
    ],
  },
  {
    id: 'p-ch2-2',
    pageNumber: 42,
    chapterId: 'ch2',
    chapterLabel: 'CHAPTER 2',
    chapterTitle: 'The Foundations of Faith',
    blocks: [
      {
        type: 'paragraph',
        text: 'This foundation chapter sits between worship and the call to tawḥīd so the reader sees continuity: creed is not abstract theory; it shapes how the servant stands before his Lord.',
      },
      {
        type: 'quote',
        english: 'Knowledge without action is a burden; action without knowledge is misguidance.',
        attribution: 'Adab maxim — demo presentation',
      },
    ],
  },
  {
    id: 'p-ch3-open',
    pageNumber: 87,
    chapterId: 'ch3',
    chapterLabel: 'CHAPTER 3',
    chapterTitle: 'The Call to Tawheed',
    isChapterOpening: true,
    openingQuote: {
      text: 'And I have not created the jinn and mankind except that they worship Me.',
      attribution: "Qur'an 51:56",
    },
    blocks: [
      {
        type: 'paragraph',
        text: 'The call of every Prophet ﷺ began with tawḥīd — singling out Allāh in worship. Before laws were detailed and communities organised, the messengers directed hearts to the One who alone deserves devotion, love, fear, and hope.[4]',
      },
      {
        type: 'paragraph',
        text: 'In this chapter we explain what the scholars meant by the call to tawḥīd: not a slogan, but a complete reorientation of life around sincere worship, purified from partners and from innovations that obscure the prophetic path.',
      },
      {
        type: 'arabic',
        arabic: 'وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ',
        translation: 'And I did not create the jinn and mankind except to worship Me.',
        source: 'Qurʾān 51:56',
      },
      {
        type: 'footnotes',
        items: [
          {
            number: '4',
            text: 'Demo footnote — biographies of the Prophets emphasise tawḥīd as the first message.',
          },
        ],
      },
    ],
  },
  {
    id: 'p-ch3-2',
    pageNumber: 88,
    chapterId: 'ch3',
    chapterLabel: 'CHAPTER 3',
    chapterTitle: 'The Call to Tawheed',
    blocks: [
      {
        type: 'paragraph',
        text: 'Worship in the Islamic sense is broader than ritual alone. It includes prayer and fasting, and also sincerity in speech, lawful earning, good character, and reliance upon Allāh in times of ease and hardship.[5]',
      },
      {
        type: 'scholar-note',
        title: "Scholar's Note",
        text: 'When the scholars say “the call to tawḥīd,” they mean inviting people to worship Allāh alone as He legislated — with knowledge, sincerity, and adherence to the prophetic example.',
      },
      {
        type: 'paragraph',
        text: 'Use the audio control below to hear a demonstration reading of this section, then continue turning pages for Arabic sources and further explanation.',
      },
      {
        type: 'footnotes',
        items: [
          {
            number: '5',
            text: 'Demo citation — comprehensive definitions of ʿibādah in creed manuals.',
          },
        ],
      },
    ],
  },
  {
    id: 'p-ch3-3',
    pageNumber: 89,
    chapterId: 'ch3',
    chapterLabel: 'CHAPTER 3',
    chapterTitle: 'The Call to Tawheed',
    blocks: [
      {
        type: 'paragraph',
        text: 'Students often ask how tawḥīd relates to daily life. The answer of the tradition is practical: correct belief produces correct worship; correct worship reforms the heart; and a reformed heart seeks knowledge with humility rather than argument for its own sake.[6]',
      },
      {
        type: 'quote',
        arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
        english: 'Say: He is Allāh, the One.',
        attribution: 'Qurʾān 112:1',
      },
      {
        type: 'footnotes',
        items: [
          {
            number: '6',
            text: 'Demo note — adab of knowledge is inseparable from sound creed in classical teaching.',
          },
        ],
      },
    ],
  },
  {
    id: 'p-ch3-4',
    pageNumber: 90,
    chapterId: 'ch3',
    chapterLabel: 'CHAPTER 3',
    chapterTitle: 'The Call to Tawheed',
    blocks: [
      {
        type: 'paragraph',
        text: 'Arabic references on these pages are not decoration. They are the evidence. English explanation leads; Arabic witnesses; footnotes record the scholarly trail.',
      },
      {
        type: 'arabic',
        arabic: 'اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ',
        translation: 'Allāh, the Eternal Refuge. He neither begets nor is born.',
        source: 'Qurʾān 112:2–3',
      },
    ],
  },
  {
    id: 'p-ch4-open',
    pageNumber: 132,
    chapterId: 'ch4',
    chapterLabel: 'CHAPTER 4',
    chapterTitle: 'Clarifying Common Doubts',
    isChapterOpening: true,
    openingQuote: {
      text: 'Ask with the intention to understand, not with the intention to win.',
      attribution: 'Adab of questioning — demo presentation',
    },
    blocks: [
      {
        type: 'paragraph',
        text: 'Doubts are answered with evidence, patience, and clear definitions. This chapter models how a digital book can hold claim, response, and source on facing pages without visual noise.[7]',
      },
      {
        type: 'footnotes',
        items: [
          {
            number: '7',
            text: 'Demo footnote — method of clarification in scholarly writing.',
          },
        ],
      },
    ],
  },
  {
    id: 'p-ch4-2',
    pageNumber: 133,
    chapterId: 'ch4',
    chapterLabel: 'CHAPTER 4',
    chapterTitle: 'Clarifying Common Doubts',
    blocks: [
      {
        type: 'paragraph',
        text: 'When a doubt is raised, name it fairly, answer it with the relevant texts, and leave the reader with a citation they can verify. That is the etiquette of a trustworthy library edition.',
      },
      {
        type: 'scholar-note',
        text: 'This Quiet Reading Room is a frontend demonstration. Production books would load verified editions; here the layout itself is the lesson.',
      },
    ],
  },
  {
    id: 'p-ch5-open',
    pageNumber: 198,
    chapterId: 'ch5',
    chapterLabel: 'CHAPTER 5',
    chapterTitle: 'Living Upon Sound Creed',
    isChapterOpening: true,
    openingQuote: {
      text: 'Whoever travels a path seeking knowledge, Allāh makes easy for him a path to Paradise.',
      attribution: 'Prophetic tradition — demo presentation',
    },
    blocks: [
      {
        type: 'paragraph',
        text: 'Sound creed is lived: in prayer, character, family, and public life. This closing chapter returns the reader from theory to practice, and prepares the end matter — references, audio, and the PDF study edition.[8]',
      },
      {
        type: 'arabic',
        arabic: 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
        translation: 'And say: My Lord, increase me in knowledge.',
        source: 'Qurʾān 20:114',
      },
      {
        type: 'footnotes',
        items: [
          {
            number: '8',
            text: 'Demo note — end matter in scholarly books commonly gathers references and study aids.',
          },
        ],
      },
    ],
  },
  {
    id: 'p-ch5-2',
    pageNumber: 199,
    chapterId: 'ch5',
    chapterLabel: 'CHAPTER 5',
    chapterTitle: 'Living Upon Sound Creed',
    blocks: [
      {
        type: 'paragraph',
        text: 'Turn once more to reach the closing resources: bibliography, PDF download demonstration, and related reading — still inside the same quiet book experience.',
      },
      {
        type: 'quote',
        english: 'Make the book the interface; let the website disappear while you read.',
        attribution: 'Quiet Reading Room · design principle',
      },
    ],
  },
];
