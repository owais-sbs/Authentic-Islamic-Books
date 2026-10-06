/**
 * Static demonstration content for the /library page.
 * Frontend-only mock data — not fetched from Supabase.
 */

export interface ArabicRef {
  arabic: string;
  translation: string;
  attribution: string;
  referenceNumber?: string;
}

export interface FootnoteItem {
  number: string;
  text: string;
}

export interface ReferenceItem {
  number: string;
  text: string;
}

export type DemoFormatId =
  | 'classic-book'
  | 'research-article'
  | 'numbered-refutation'
  | 'quote-reader'
  | 'audio-pdf'
  | 'combined-edition'
  | 'quiet-reading-room';

export interface DemoCatalogItem {
  id: DemoFormatId;
  slug: string;
  number: string;
  formatName: string;
  title: string;
  author: string;
  category: string;
  excerpt: string;
  features: string[];
  coverGradient: string;
  /** Hardcover face color for catalog book mockup */
  coverColor: string;
  /** Darker cover edge / spine blend */
  coverEdge: string;
  coverArabic?: string;
  coverSubtitle?: string;
  accentLabel: string;
}

export const libraryStats = [
  { label: 'Featured Works', value: '7' },
  { label: 'Scholarly Articles', value: '18' },
  { label: 'References', value: '96' },
  { label: 'Digital Resources', value: '14' },
] as const;

export const demoCatalog: DemoCatalogItem[] = [
  {
    id: 'classic-book',
    slug: 'foundations-of-sound-creed',
    number: '01',
    formatName: 'Classic Digital Book',
    title: 'Foundations of Sound Creed',
    author: 'Shaykh Ṣāliḥ ibn Fawzān al-Fawzān',
    category: 'ʿAqīdah · Creed',
    excerpt:
      'A traditional three-column book reader: cover and metadata, centred English text, and Arabic sources along the right.',
    features: ['Book cover', 'Chapters', 'Arabic column', 'Footnotes'],
    coverGradient: 'linear-gradient(165deg, #1A3A2A 0%, #0B1929 55%, #162A42 100%)',
    coverColor: '#1A3A2A',
    coverEdge: '#0B1929',
    coverArabic: 'أُصُولُ الْعَقِيدَةِ الصَّحِيحَةِ',
    coverSubtitle: 'Classic digital book reader',
    accentLabel: 'BOOK READER',
  },
  {
    id: 'research-article',
    slug: 'muhammad-semitic-prophet',
    number: '02',
    formatName: 'Scholarly Research Article',
    title: 'Muhammad ﷺ as a Semitic Prophet',
    author: 'Abū Iyaḍ Amjad Rafīq',
    category: 'Prophethood · Theology',
    excerpt:
      'Editorial article layout with drop-cap opening, numbered citations, formal references, and Arabic source notes.',
    features: ['Drop cap', 'Inline [n] cites', 'References', 'Arabic notes'],
    coverGradient: 'linear-gradient(165deg, #0F1D2F 0%, #1E3654 60%, #0B1929 100%)',
    coverColor: '#162A42',
    coverEdge: '#0B1929',
    coverArabic: 'مُحَمَّدٌ نَبِيٌّ سَامِيٌّ',
    coverSubtitle: 'Scholarly research article',
    accentLabel: 'RESEARCH',
  },
  {
    id: 'numbered-refutation',
    slug: 'clarifying-durar-saniyyah',
    number: '03',
    formatName: 'Numbered Refutation',
    title: 'Clarifying Claims on al-Durar al-Saniyyah',
    author: 'Editorial Clarification Series',
    category: 'Methodology · Clarification',
    excerpt:
      'Claim-and-response blocks with prominent numbering, burgundy dividers, and highlighted scholarly callouts.',
    features: ['Numbered claims', 'Red dividers', 'Callouts', 'Arabic sources'],
    coverGradient: 'linear-gradient(165deg, #3B1515 0%, #8B2E2E 45%, #0B1929 100%)',
    coverColor: '#6B2424',
    coverEdge: '#2A1010',
    coverArabic: 'تَوْضِيحُ الدُّرَرِ السَّنِيَّةِ',
    coverSubtitle: 'Numbered claim & response',
    accentLabel: 'REFUTATION',
  },
  {
    id: 'quote-reader',
    slug: 'manners-of-the-student',
    number: '04',
    formatName: 'Quote-Centered Reading',
    title: 'On the Manners of the Student of Knowledge',
    author: 'Imām al-Khaṭīb al-Baghdādī',
    category: 'Adab · Knowledge',
    excerpt:
      'Quotation-led scholarship: Arabic text first, English translation, attribution, then brief explanation.',
    features: ['Arabic quotes', 'Translations', 'Attributions', 'Citations'],
    coverGradient: 'linear-gradient(165deg, #1A3A2A 0%, #2D5A42 50%, #0B1929 100%)',
    coverColor: '#2D5A42',
    coverEdge: '#14281E',
    coverArabic: 'آدَابُ طَالِبِ الْعِلْمِ',
    coverSubtitle: 'Quote-centered reading',
    accentLabel: 'QUOTATIONS',
  },
  {
    id: 'audio-pdf',
    slug: 'path-of-the-traveller',
    number: '05',
    formatName: 'Audio + PDF Resource',
    title: 'The Path of the Traveller',
    author: 'Demo Scholarly Series',
    category: 'Tazkiyah · Spirituality',
    excerpt:
      'Modern digital resource: long-form article with demo audio player and PDF / read-online actions.',
    features: ['Audio player', 'PDF actions', 'References', 'Related reading'],
    coverGradient: 'linear-gradient(165deg, #162A42 0%, #C9A84C33 40%, #0B1929 100%)',
    coverColor: '#1E3654',
    coverEdge: '#0F1D2F',
    coverArabic: 'طَرِيقُ السَّالِكِ',
    coverSubtitle: 'Audio and PDF resource',
    accentLabel: 'MULTIMEDIA',
  },
  {
    id: 'combined-edition',
    slug: 'complete-scholarly-edition',
    number: '06',
    formatName: 'Complete Scholarly Edition',
    title: 'The Complete Scholarly Edition',
    author: 'Islamic Digital Library · Combined Demo',
    category: 'All Formats Combined',
    excerpt:
      'One work uniting book layout, research citations, numbered clarification, quotations, audio, and PDF resources.',
    features: [
      'Book layout',
      'Citations',
      'Red highlights',
      'Quotes',
      'Audio',
      'PDF',
      'Arabic',
      'Footnotes',
    ],
    coverGradient:
      'linear-gradient(155deg, #0B1929 0%, #1A3A2A 35%, #8B2E2E 70%, #C9A84C55 100%)',
    coverColor: '#243B2E',
    coverEdge: '#0B1929',
    coverArabic: 'الطَّبْعَةُ الْعِلْمِيَّةُ الْكَامِلَةُ',
    coverSubtitle: 'All formats combined',
    accentLabel: 'ALL-IN-ONE',
  },
  {
    id: 'quiet-reading-room',
    slug: 'quiet-reading-room',
    number: '07',
    formatName: 'Quiet Reading Room',
    title: 'Foundations of the Straight Path',
    author: 'Demo Scholarly Edition',
    category: 'ʿAqīdah · Immersive Open Book',
    excerpt:
      'An open hardcover book experience — contents on the left leaf, chapter reading on the right — matching a quiet physical reading room.',
    features: [
      'Open book',
      'Page turn',
      'Arabic sources',
      'Aa settings',
      'Night mode',
      'Bookmarks',
    ],
    coverGradient: 'linear-gradient(165deg, #F5F0E6 0%, #E8DFD0 40%, #2D5A42 100%)',
    coverColor: '#1A3A2A',
    coverEdge: '#0F2418',
    coverArabic: 'أُصُولُ الصِّرَاطِ الْمُسْتَقِيمِ',
    coverSubtitle: 'A Study of Creed, Worship and the Call to Tawḥīd',
    accentLabel: 'IMMERSIVE',
  },
];

export function getDemoBySlug(slug: string): DemoCatalogItem | undefined {
  return demoCatalog.find((d) => d.slug === slug);
}

/* ─── FORMAT 01: Classic Digital Book Reader ─────────────────────────────── */

export const classicBook = {
  label: 'BOOK 01',
  formatName: 'Classic Digital Book Reader',
  title: 'Foundations of Sound Creed',
  author: 'Shaykh Ṣāliḥ ibn Fawzān al-Fawzān',
  scholarInfo: 'Member of the Permanent Committee for Scholarly Research and Iftāʾ',
  year: '1423 AH / 2002 CE',
  category: 'ʿAqīdah · Creed',
  coverTitle: 'أسس العقيدة الصحيحة',
  coverSubtitle: 'Foundations of Sound Creed',
  introduction:
    'This demonstration presents creed in the form of a digital scholarly book: a quiet left column for the work’s identity, a centred English reading column, and Arabic source notes along the right — the pattern many readers expect from a serious Islamic library.',
  chapterHeading: 'Chapter One — The Meaning of Tawḥīd',
  paragraphs: [
    'Tawḥīd is the foundation upon which the religion stands. It is to single out Allāh in His lordship, His worship, and His names and attributes, according to what has come in the Book and the authentic Sunnah, upon the understanding of the Salaf of this ummah.',
    'The scholars have explained that knowledge of tawḥīd is not a matter of slogans alone. It requires clarity regarding what is affirmed for Allāh, what is negated from Him, and how the servant’s worship is directed solely to Him without partner.',
    'In this chapter we summarise the classical threefold division that later scholars used for teaching: tawḥīd al-rubūbiyyah, tawḥīd al-ulūhiyyah, and tawḥīd al-asmāʾ wa’l-ṣifāt. Each category protects a distinct aspect of the servant’s relationship with his Lord.',
    'Tawḥīd al-rubūbiyyah is to affirm that Allāh alone is the Creator, Sustainer, and Controller of all affairs. The polytheists of Makkah largely affirmed this in a general sense, yet that affirmation alone did not enter them into Islam until they singled Him out in worship.',
    'Tawḥīd al-ulūhiyyah is the heart of the prophetic call: that prayer, sacrifice, vow, hope, fear, and reliance are directed only to Allāh. Every messenger began with this call, as the Qurʾān repeatedly emphasises.',
    'Tawḥīd al-asmāʾ wa’l-ṣifāt is to affirm for Allāh what He affirmed for Himself, and what His Messenger ﷺ affirmed for Him, without distortion, denial, questioning how, or likening Him to the creation. This path preserves both transcendence and the meanings revealed in the texts.',
  ],
  sectionTwoHeading: 'Chapter Two — The Fruits of Sound Creed',
  sectionTwoParagraphs: [
    'When creed is sound, worship becomes ordered, character is refined, and the heart finds stability in times of trial. The early scholars therefore began their teaching with belief before branching into detailed rulings.',
    'Sound creed also protects the community from extremes: from despair that denies hope in Allāh’s mercy, and from presumption that ignores His justice and commands. Between these extremes stands the balanced path of the people of the Sunnah.',
  ],
  arabicRefs: [
    {
      arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ',
      translation: 'Say: He is Allāh, the One. Allāh, the Eternal Refuge.',
      attribution: 'Qurʾān 112:1–2',
      referenceNumber: '1',
    },
    {
      arabic: 'وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ',
      translation: 'And I did not create the jinn and mankind except to worship Me.',
      attribution: 'Qurʾān 51:56',
      referenceNumber: '2',
    },
    {
      arabic: 'قَالَ الشَّيْخُ: التَّوْحِيدُ أَصْلُ الدِّينِ وَأَسَاسُهُ',
      translation: 'The Shaykh said: Tawḥīd is the root of the religion and its foundation.',
      attribution: 'Demo attribution — scholarly paraphrase',
      referenceNumber: '3',
    },
    {
      arabic: 'لَيْسَ كَمِثْلِهِ شَيْءٌ وَهُوَ السَّمِيعُ الْبَصِيرُ',
      translation: 'There is nothing like unto Him, and He is the Hearing, the Seeing.',
      attribution: 'Qurʾān 42:11',
      referenceNumber: '4',
    },
  ] as ArabicRef[],
  footnotes: [
    {
      number: '1',
      text: 'Sūrat al-Ikhlāṣ establishes Allāh’s absolute oneness and self-sufficiency — a cornerstone text in creed instruction.',
    },
    {
      number: '2',
      text: 'The purpose of creation is framed around worship (ʿibādah), which the scholars explain as comprehensive obedience with love and humility.',
    },
    {
      number: '3',
      text: 'Sample footnote for demonstration. In a published edition this would cite the precise page of the Arabic source.',
    },
    {
      number: '4',
      text: 'A key verse for the methodology of names and attributes: affirmation without likening, and transcendence without negation of meaning.',
    },
    {
      number: '5',
      text: 'See also related discussions in classical primers on ʿaqīdah used in study circles (demo cross-reference).',
    },
  ] as FootnoteItem[],
  references: [
    { number: '1', text: 'Qurʾān — Sūrat al-Ikhlāṣ (112) and Sūrat al-Dhāriyāt (51:56).' },
    { number: '2', text: 'Demo edition notes modelled on teaching primers in tawḥīd.' },
    { number: '3', text: 'Qurʾān 42:11 — foundational for asmāʾ wa ṣifāt methodology.' },
    { number: '4', text: 'Classical summaries of the threefold teaching division of tawḥīd (demo citation).' },
  ] as ReferenceItem[],
};

/* ─── FORMAT 02: Scholarly Article / Research Paper ──────────────────────── */

export const scholarlyArticle = {
  label: 'BOOK / ARTICLE 02',
  formatName: 'Scholarly Research Article',
  title: 'Muhammad ﷺ as a Semitic Prophet: Continuity and Distinctiveness',
  author: 'Abū Iyaḍ Amjad Rafīq',
  date: '15 Dhū al-Ḥijjah 1445',
  category: 'Prophethood · Comparative Theology',
  readingTime: '22 min read',
  introduction:
    'This demonstration models a research-article layout: editorial metadata beneath the title, a drop-cap opening, numbered inline citations, and a formal references list — suited to long-form analysis rather than chapter-by-chapter book reading.',
  leadParagraph:
    's Islamic scholarship developed across the centuries, writers devoted careful attention to situating the Prophet Muḥammad ﷺ within the broader lineage of Semitic prophecy. The aim was never novelty for its own sake, but clarity: to show how revelation confirms what came before while establishing a final, preserved message for mankind.',
  sections: [
    {
      heading: 'Continuity with Earlier Prophets',
      paragraphs: [
        'Classical authors emphasise that the Prophet ﷺ did not introduce a break from the prophetic path of Nūḥ, Ibrāhīm, Mūsā and ʿĪsā — peace be upon them all. Rather, he restored pure monotheism where it had been altered and completed the law for the final community.[1]',
        'This continuity appears in creed, ethics, and the call to worship Allāh alone. Distinctions arise in legislation appropriate to each community’s time, culminating in a message meant for all peoples until the Last Day.[2]',
        'The Qurʾān repeatedly narrates earlier prophets not as distant folklore, but as a living moral and theological curriculum for the final ummah — inviting reflection, warning, and hope.[3]',
      ],
      arabicRef: {
        arabic: 'شَرَعَ لَكُم مِّنَ الدِّينِ مَا وَصَّىٰ بِهِ نُوحًا',
        translation: 'He has ordained for you of religion what He enjoined upon Noah…',
        attribution: 'Qurʾān 42:13',
        referenceNumber: '1',
      } as ArabicRef,
    },
    {
      heading: 'Distinctiveness of the Final Message',
      paragraphs: [
        'Scholars also stress what is unique: a preserved Book, a universal address, and a Sunnah transmitted with unprecedented care. These features shape how later generations verify belief and practice.[4]',
        'For a digital library, presenting such analysis with citations and Arabic source columns helps readers move between explanation and evidence without losing scholarly tone.[5]',
        'The finality of prophethood (khatm al-nubuwwah) is therefore not a rhetorical flourish; it is a doctrinal boundary that organises how Muslims read history, scripture, and claims of later authority.[6]',
      ],
      arabicRef: {
        arabic: 'مَّا كَانَ مُحَمَّدٌ أَبَا أَحَدٍ مِّن رِّجَالِكُمْ وَلَٰكِن رَّسُولَ اللَّهِ وَخَاتَمَ النَّبِيِّينَ',
        translation:
          'Muḥammad is not the father of any of your men, but the Messenger of Allāh and the Seal of the Prophets.',
        attribution: 'Qurʾān 33:40',
        referenceNumber: '4',
      } as ArabicRef,
    },
    {
      heading: 'Implications for Digital Scholarship',
      paragraphs: [
        'A research library must make continuity and distinctiveness readable: footnotes that can be checked, Arabic that can be compared, and structure that does not flatten argument into marketing cards.[7]',
        'This article format is therefore offered as one presentation option among several — chosen when the work is analytical rather than chapter-bound.',
      ],
    },
  ],
  references: [
    {
      number: '1',
      text: 'Ibn Kathīr, Tafsīr al-Qurʾān al-ʿAẓīm, commentary on related verses concerning prophetic continuity (demo citation).',
    },
    {
      number: '2',
      text: 'Ibn Taymiyyah, Majmūʿ al-Fatāwā — discussions on the universality of the final message (demo citation).',
    },
    {
      number: '3',
      text: 'Qurʾān — narrative sūrahs treating earlier prophets as instructional history.',
    },
    {
      number: '4',
      text: 'al-Bukhārī & Muslim — collections illustrating the care given to prophetic report authentication (demo citation).',
    },
    {
      number: '5',
      text: 'Method notes for bilingual scholarly presentation in digital libraries (demo note).',
    },
    {
      number: '6',
      text: 'Qurʾān 33:40 — textual basis for the doctrine of the Seal of the Prophets.',
    },
    {
      number: '7',
      text: 'Editorial standards for citation density in long-form Islamic research pages (demo).',
    },
  ] as ReferenceItem[],
};

/* ─── FORMAT 03: Numbered Refutation / Argument ──────────────────────────── */

export const numberedRefutation = {
  label: 'BOOK / ARTICLE 03',
  formatName: 'Numbered Refutation',
  title: 'Clarifying Claims Surrounding al-Durar al-Saniyyah and Political Violence',
  introduction:
    'This demonstration shows a numbered claim-and-response structure used in scholarly clarifications. Each block isolates a claim, answers it with evidence, and separates major turns with a refined burgundy rule — so argument structure is visible at a glance.',
  blocks: [
    {
      number: '01',
      kind: 'CLAIM' as const,
      title: 'The claim that classical Najdī writings endorse indiscriminate bombing',
      content:
        'Some contemporary polemics assert that citations from al-Durar al-Saniyyah and related works amount to a licence for targeting civilians. The claim collapses distinct genres — creed, jihād jurisprudence, and later political commentary — into a single accusation.',
    },
    {
      number: '02',
      kind: 'RESPONSE' as const,
      title: 'Distinguishing creed texts from political misuse',
      content:
        'Responsible reading separates (a) statements about tawḥīd and shirk, (b) classical discussions of warfare under a legitimate authority, and (c) modern extremist appropriations. Conflating these layers produces a false genealogy. Senior scholars of the same tradition have repeatedly condemned bombings and the killing of innocents.',
      callout: {
        arabic: 'وَلَا تَزِرُ وَازِرَةٌ وِزْرَ أُخْرَىٰ',
        translation: 'And no bearer of burdens will bear the burden of another.',
        attribution: 'Qurʾān 6:164 — principle against collective punishment',
        referenceNumber: '1',
      } as ArabicRef,
    },
    {
      number: '03',
      kind: 'CLAIM' as const,
      title: 'The claim that any citation of those works implies endorsement of terrorism',
      content:
        'A further claim treats mere quotation of nineteenth-century Arabian scholars as proof of violent intent. Quotation without context is not endorsement; scholarly libraries routinely preserve contested or historically situated texts for study, critique, and accurate attribution.',
    },
    {
      number: '04',
      kind: 'RESPONSE' as const,
      title: 'Method: context, genre, and living scholarly judgment',
      content:
        'A sound method asks: Who wrote the passage? In what genre? Against what opponent? How have recognised scholars of the school applied or restricted it today? When those questions are answered honestly, the gulf between archival study and terrorist propaganda becomes clear.',
      callout: {
        arabic: 'قَالَ الشَّيْخُ الفَوْزَان: الإِرْهَابُ وَالتَّفْجِيرَاتُ مُحَرَّمَةٌ',
        translation:
          'Shaykh al-Fawzān stated that terrorism and bombings are forbidden (demo paraphrase for UI).',
        attribution: 'Demo scholarly attribution — illustrative only',
        referenceNumber: '2',
      } as ArabicRef,
    },
    {
      number: '05',
      kind: 'CLAIM' as const,
      title: 'The claim that digital libraries should hide difficult historical texts',
      content:
        'Some argue that any archival presence of contested writings normalises harm. This confuses accessibility for research with uncritical promotion. Libraries can present texts with context, scholarly notes, and clear ethical framing.',
    },
    {
      number: '06',
      kind: 'RESPONSE' as const,
      title: 'Transparency with responsibility',
      content:
        'A professional Islamic library shows sources, marks demo content clearly, and points readers to living scholarly judgments that forbid targeting innocents. Suppression without explanation often fuels worse rumour; careful presentation serves truth.',
      callout: {
        arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا إِن جَاءَكُمْ فَاسِقٌ بِنَبَإٍ فَتَبَيَّنُوا',
        translation:
          'O you who believe, if there comes to you a disobedient one with information, investigate…',
        attribution: 'Qurʾān 49:6',
        referenceNumber: '3',
      } as ArabicRef,
    },
  ],
  footnotes: [
    {
      number: '1',
      text: 'The verse is frequently cited in discussions of individual moral responsibility and against unjust collective targeting.',
    },
    {
      number: '2',
      text: 'Demonstration footnote. A production edition would link to a dated fatwā or recorded statement with a stable reference.',
    },
    {
      number: '3',
      text: 'Establishes the principle of verification before acting upon reports — relevant to media claims about texts.',
    },
    {
      number: '4',
      text: 'Additional demo note: genre analysis (creed vs. political tract) should precede moral accusation.',
    },
  ] as FootnoteItem[],
  references: [
    { number: '1', text: 'Qurʾān 6:164; 49:6 — principles of individual burden and verification.' },
    { number: '2', text: 'Demo citations of contemporary scholarly condemnations of terrorism.' },
    { number: '3', text: 'Notes on reading historically situated Arabian scholarly corpora (demo).' },
  ] as ReferenceItem[],
};

/* ─── FORMAT 04: Quotation-Centered Reading ──────────────────────────────── */

export const quoteReader = {
  label: 'BOOK / ARTICLE 04',
  formatName: 'Quote-Centered Scholarship',
  title: 'On the Manners of the Student of Knowledge',
  author: 'Imām Abū Bakr al-Khaṭīb al-Baghdādī',
  scholarNote: 'Demonstrating quotation-led reading of classical adab literature',
  introduction:
    'Some works are best encountered through the scholar’s own words. This format places Arabic quotations and their translations at the centre of the page, then returns to brief explanation — so the reader hears the source before the commentary.',
  leadText:
    'The classical manuals of scholarly etiquette insist that knowledge is inseparable from character. Before expanding curricula or debating fine points of law, the student is taught how to sit, how to listen, and how to honour teachers and texts.',
  midText:
    'Between these quotations, notice how the page keeps the scholar’s voice visually primary. Commentary remains secondary — a guide, not a replacement for the words themselves.',
  quotes: [
    {
      style: 'arabic-primary' as const,
      arabic: 'الْعِلْمُ لَا يُعْطِيكَ بَعْضَهُ حَتَّى تُعْطِيَهُ كُلَّكَ',
      translation:
        'Knowledge will not give you part of itself until you give it all of yourself.',
      attribution: 'Attributed in adab literature — demo presentation',
      referenceNumber: '1',
    },
    {
      style: 'english-emphasis' as const,
      english:
        'Let the student purify his intention, for deeds are only by intentions, and every person shall have what he intended.',
      attribution: 'Prophetic principle applied to seeking knowledge',
      referenceNumber: '2',
    },
    {
      style: 'short-statement' as const,
      english: 'Respect for the teacher is respect for the knowledge he carries.',
      attribution: 'Classical adab maxim (demo)',
      referenceNumber: '3',
    },
    {
      style: 'arabic-primary' as const,
      arabic: 'وَمَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ',
      translation:
        'Whoever travels a path seeking knowledge, Allāh makes easy for him a path to Paradise.',
      attribution: 'Prophetic tradition — widely cited in adab works (demo)',
      referenceNumber: '4',
    },
  ],
  afterQuotes:
    'Between quotations, a library page can resume narrative explanation: why the maxim matters, how later scholars applied it, and where the reader should look next. The visual rhythm — quote, attribution, explanation — keeps the scholar’s voice primary.',
  closingArabic: {
    arabic: 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
    translation: 'And say: My Lord, increase me in knowledge.',
    attribution: 'Qurʾān 20:114',
    referenceNumber: '5',
  } as ArabicRef,
  footnotes: [
    { number: '1', text: 'Widely cited maxim in works on the etiquette of seeking knowledge.' },
    { number: '2', text: 'Draws on the well-known ḥadīth of intentions (demo cross-reference).' },
    { number: '3', text: 'Short maxims are common in adab collections; wording varies by transmitter.' },
    { number: '4', text: 'Reported in major collections; presented here for UI demonstration.' },
    { number: '5', text: 'A verse frequently placed at the opening of study sessions and books.' },
  ] as FootnoteItem[],
  references: [
    { number: '1', text: 'Adab al-ṭālib literature — classical etiquette manuals (demo corpus).' },
    { number: '2', text: 'Qurʾān 20:114 — prayer for increase in knowledge.' },
    { number: '3', text: 'Prophetic traditions on the path of seeking knowledge (demo cites).' },
  ] as ReferenceItem[],
};

/* ─── FORMAT 05: Audio + PDF Digital Resource ────────────────────────────── */

export const audioPdfResource = {
  label: 'BOOK / ARTICLE 05',
  formatName: 'Audio + PDF Digital Resource',
  title: 'The Path of the Traveller: An Introduction to Spiritual Discipline',
  author: 'Demo Scholarly Series — Editorial Board',
  category: 'Tazkiyah · Spirituality',
  description:
    'This fifth demonstration shows how one work can offer reading, listening, and downloadable study materials side by side — without requiring a live backend connection for the client preview.',
  paragraphsBeforeAudio: [
    'Spiritual discipline in the Islamic tradition is grounded in revelation and prophetic practice: remembrance, prayer, lawful earning, and refinement of character. Later writers organised these themes into accessible manuals for students.',
    'A modern digital library can present the same chapter as text, as recited audio for review, and as a printable PDF for annotation — three entry points into one scholarly resource.',
    'The traveller’s path is not a departure from law and creed; it is their inward fruit. Without sound belief and lawful practice, spiritual language becomes empty ornament.',
  ],
  audioLabel: 'Listen to this section',
  audioDuration: '04:32',
  paragraphsAfterAudio: [
    'After listening, the reader returns to the written exposition. In a production system these players would stream authenticated media; here the controls are a faithful UI demonstration only.',
    'The closing resources block shows how libraries surface “Read online”, “View PDF”, and “Download PDF” without turning the page into an ecommerce shelf.',
    'Related reading then points the student onward — to creed, etiquette, and further works — so a single resource becomes a doorway rather than a dead end.',
  ],
  arabicRef: {
    arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    translation: 'Unquestionably, by the remembrance of Allāh hearts are assured.',
    attribution: 'Qurʾān 13:28',
    referenceNumber: '1',
  } as ArabicRef,
  resources: [
    { id: 'read', label: 'Read Online', hint: 'Demo — opens in-page scroll' },
    { id: 'view-pdf', label: 'View PDF', hint: 'Demo placeholder' },
    { id: 'download-pdf', label: 'Download PDF', hint: 'Demo placeholder' },
  ],
  references: [
    {
      number: '1',
      text: 'Qurʾān 13:28 — commonly cited in discussions of dhikr and tranquillity of the heart.',
    },
    {
      number: '2',
      text: 'Ibn Qayyim, Madārij al-Sālikīn — classical map of spiritual stations (demo citation).',
    },
    {
      number: '3',
      text: 'Prophetic traditions on remembrance and character refinement (demo citation).',
    },
    {
      number: '4',
      text: 'Editorial note on multimedia presentation of tazkiyah texts (demo).',
    },
  ] as ReferenceItem[],
  footnotes: [
    {
      number: '1',
      text: 'Audio duration and player state are simulated for this client demonstration.',
    },
    {
      number: '2',
      text: 'PDF actions are non-functional placeholders; no files are fetched from storage.',
    },
    {
      number: '3',
      text: 'Related reading links are illustrative titles within this demo library.',
    },
  ] as FootnoteItem[],
  relatedReading: [
    'Foundations of Sound Creed — Chapter on purification of intention',
    'On the Manners of the Student of Knowledge — Quotation series',
    'Introductory essays on dhikr in the Prophetic Sunnah',
    'The Complete Scholarly Edition — combined format demonstration',
  ],
};

/* ─── FORMAT 06: Combined Scholarly Edition ──────────────────────────────── */

export const combinedEdition = {
  label: 'BOOK 06',
  formatName: 'Complete Scholarly Edition',
  title: 'The Complete Scholarly Edition',
  subtitle: 'A single work combining every demonstration format',
  author: 'Islamic Digital Library · Combined Demo',
  scholarInfo: 'Editorial synthesis for client presentation',
  year: '1447 AH · Demonstration',
  category: 'Methodology · Digital Scholarship',
  coverTitle: 'الطبعة العلمية الكاملة',
  coverSubtitle: 'Complete Scholarly Edition',
  introduction:
    'This sixth demonstration unites the previous five concepts in one reading experience: book metadata and Arabic columns, research-style citations, numbered clarification with burgundy emphasis, prominent quotations, and audio plus PDF resource actions — so the client can evaluate a full hybrid layout.',
  chapterHeading: 'Part I — Reading as a Digital Book',
  paragraphs: [
    'Open any serious Islamic work and you will find layers: a title page, an introduction, chapters, Arabic proofs, and notes. A digital library should preserve that hierarchy rather than flattening it into a product grid.',
    'In this combined edition, the left column still carries the book’s identity. The centre carries continuous English prose. The right carries Arabic evidence — the pattern from Format 01.',
  ],
  researchHeading: 'Part II — Research Voice with Citations',
  researchLead:
    ' digital research page must make arguments checkable. Inline markers point to a reference list; Arabic witnesses sit beside explanation; footnotes catch fine distinctions without interrupting the main line of thought.',
  researchParagraphs: [
    'Continuity with earlier scholarship is shown by citation, not by vague appeal to “tradition.”[1] Distinctiveness is shown by specifying what is unique to a text, school, or period.[2]',
    'When a claim is contested, the page should not shout. It should number the claim, answer it, and show the source — which leads to the next part.[3]',
  ],
  refutationIntro:
    'Part III adopts the numbered clarification style. Burgundy rules separate major turns so the eye can follow claim and response.',
  blocks: [
    {
      number: '01',
      kind: 'CLAIM' as const,
      title: 'That digital libraries cannot host serious scholarship',
      content:
        'Critics sometimes assume screens only suit short posts. This claim ignores decades of academic publishing online and the needs of students who require searchable, citable, bilingual pages.',
    },
    {
      number: '02',
      kind: 'RESPONSE' as const,
      title: 'Serious layout is a design choice, not a platform limit',
      content:
        'With disciplined typography, RTL Arabic, footnotes, and resource links, a browser can feel archival. The constraint is editorial care — not the medium itself.',
      callout: {
        arabic: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ',
        translation: 'Read in the name of your Lord who created.',
        attribution: 'Qurʾān 96:1',
        referenceNumber: '4',
      } as ArabicRef,
    },
  ],
  quoteIntro:
    'Part IV returns the scholar’s own words to the centre of the page — Arabic first, then translation and attribution.',
  quotes: [
    {
      style: 'arabic-primary' as const,
      arabic: 'طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ',
      translation: 'Seeking knowledge is an obligation upon every Muslim.',
      attribution: 'Well-known prophetic tradition — demo presentation',
      referenceNumber: '5',
    },
    {
      style: 'english-emphasis' as const,
      english:
        'Present the proof before the persuasion; let the reader see the source, then the explanation.',
      attribution: 'Editorial principle for this combined demo',
      referenceNumber: '6',
    },
  ],
  audioIntro:
    'Part V demonstrates multimedia study aids for the same chapter: listen, read, and export.',
  audioLabel: 'Listen to the combined edition preface',
  audioDuration: '06:10',
  paragraphsAfterAudio: [
    'Audio supports revision and accessibility. PDF supports annotation and offline study. Neither replaces the structured reading page; both extend it.',
  ],
  arabicRefs: [
    {
      arabic: 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
      translation: 'And say: My Lord, increase me in knowledge.',
      attribution: 'Qurʾān 20:114',
      referenceNumber: '7',
    },
    {
      arabic: 'يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ',
      translation:
        'Allāh will raise those who have believed among you and those who were given knowledge, by degrees.',
      attribution: 'Qurʾān 58:11',
      referenceNumber: '8',
    },
  ] as ArabicRef[],
  resources: [
    { id: 'read', label: 'Read Online', hint: 'Demo — in-page' },
    { id: 'view-pdf', label: 'View PDF', hint: 'Demo placeholder' },
    { id: 'download-pdf', label: 'Download PDF', hint: 'Demo placeholder' },
  ],
  references: [
    { number: '1', text: 'Demo citation — continuity of prophetic teaching across revelations.' },
    { number: '2', text: 'Demo citation — distinct features of final-message scholarship.' },
    { number: '3', text: 'Method note — numbered claim/response for contested topics.' },
    { number: '4', text: 'Qurʾān 96:1 — opening imperative of reading.' },
    { number: '5', text: 'Prophetic tradition on seeking knowledge (demo presentation).' },
    { number: '6', text: 'Editorial principle for source-first layout.' },
    { number: '7', text: 'Qurʾān 20:114.' },
    { number: '8', text: 'Qurʾān 58:11.' },
    { number: '9', text: 'Combined-edition production notes for client review (demo).' },
  ] as ReferenceItem[],
  footnotes: [
    { number: '1', text: 'Inline research citations mirror Format 02.' },
    { number: '2', text: 'Burgundy callouts mirror Format 03.' },
    { number: '3', text: 'Quotation blocks mirror Format 04.' },
    { number: '4', text: 'Audio/PDF controls mirror Format 05 and are non-functional demos.' },
    { number: '5', text: 'Arabic column pattern mirrors Format 01.' },
  ] as FootnoteItem[],
  relatedReading: [
    'Foundations of Sound Creed — Classic book reader',
    'Muhammad ﷺ as a Semitic Prophet — Research article',
    'Clarifying Claims on al-Durar al-Saniyyah — Refutation',
    'On the Manners of the Student — Quote-centered',
    'The Path of the Traveller — Audio + PDF',
  ],
};
