import type { Book } from '@/types';
import { sampleBookChapters, sampleIntroduction } from './sampleContent';

export const books: Book[] = [
  {
    id: 'book-foundations-of-knowledge',
    slug: 'foundations-of-knowledge',
    title: 'Foundations of Knowledge',
    subtitle: 'An Introduction to the Islamic Intellectual Tradition',
    authorId: 'scholar-ibn-kathir',
    description:
      'A structured introduction to the sources, principles, and methods of the Islamic scholarly tradition, written for students and general readers.',
    longDescription:
      'This work offers a clear and organized overview of the Islamic intellectual tradition. Beginning with the historical context in which the Islamic sciences developed, it proceeds to examine the core principles that guide scholarly inquiry, the application of those principles in jurisprudence and theology, and the challenges facing scholarship in the contemporary world.',
    coverColor: '#18231F',
    hijriStart: 701,
    hijriEnd: 774,
    categoryIds: ['cat-aqeedah', 'cat-thought', 'cat-ethics'],
    chapters: [...sampleBookChapters],
    introduction: [...sampleIntroduction],
    featured: true,
    publishedYear: 'circa 760 AH',
    popularity: 95,
    addedDate: '2024-01-15',
  },
  {
    id: 'book-path-of-the-seeker',
    slug: 'path-of-the-seeker',
    title: 'The Path of the Seeker',
    subtitle: 'On the Cultivation of the Inner Life',
    authorId: 'scholar-al-ghazali',
    description:
      'A guide to the inner dimensions of faith, addressing the purification of the heart and the disciplines of spiritual practice.',
    longDescription:
      'Drawing on the insights of earlier spiritual masters, this work offers a practical and reflective guide to the cultivation of the inner life. It addresses the obstacles that confront the seeker, the virtues that must be acquired, and the relationship between outward practice and inward transformation.',
    coverColor: '#3A4A3F',
    hijriStart: 488,
    hijriEnd: 505,
    categoryIds: ['cat-spirituality', 'cat-ethics'],
    chapters: [
      {
        id: 'ch-1',
        number: '1',
        title: 'The Beginning of the Path',
        description: 'On the intention and the first steps of the seeker.',
        sections: [
          {
            id: 'sec-1-1',
            number: '1.1',
            title: 'The Intention',
            content: [
              {
                type: 'paragraph',
                text: 'Every journey begins with an intention. The seeker who sets out on the path must first clarify what is sought and why. Without a sincere intention, effort is scattered and progress is illusory.',
              },
              {
                type: 'paragraph',
                text: 'The intention is not a one-time act but a continuous orientation. It must be renewed at each stage, examined for sincerity, and corrected when it drifts toward lesser aims. The path is long, and the heart is prone to distraction; a clear intention is the compass that keeps the seeker oriented.',
              },
            ],
          },
          {
            id: 'sec-1-2',
            number: '1.2',
            title: 'The First Steps',
            content: [
              {
                type: 'paragraph',
                text: 'The first practical steps of the path involve establishing the obligations — the acts of worship and the ethical conduct that form the foundation of religious life. No spiritual progress is possible without this foundation.',
              },
              {
                type: 'paragraph',
                text: 'The seeker should not be hasty. The path is not a sprint but a lifelong journey. Steady, consistent effort is of greater value than intense but brief enthusiasm. The companions of the Prophet were praised not for the quantity of their worship but for its consistency.',
              },
            ],
          },
        ],
      },
    ],
    introduction: [
      {
        type: 'paragraph',
        text: 'This work is written for the one who has felt the stirring of the heart toward something beyond the surface of life — the one who senses that there is more to faith than the performance of duties, and who seeks a path toward that deeper reality.',
      },
      {
        type: 'paragraph',
        text: 'It is not a comprehensive treatise but a companion for the journey. It offers direction, encouragement, and reflection, drawing on the wisdom of those who have walked this path before. The reader is invited to read slowly, to reflect, and to return.',
      },
    ],
    featured: true,
    publishedYear: 'circa 495 AH',
    popularity: 88,
    addedDate: '2024-02-01',
  },
  {
    id: 'book-garden-of-the-people',
    slug: 'garden-of-the-people',
    title: 'Garden of the People',
    subtitle: 'A Collection of Prophetic Wisdom',
    authorId: 'scholar-al-nawawi',
    description:
      'A carefully curated collection of prophetic traditions on ethics, worship, and the path to God, with concise commentary.',
    longDescription:
      'This collection gathers some of the most meaningful prophetic traditions on the themes of character, worship, and spiritual aspiration. Each tradition is presented with a brief commentary designed to clarify its meaning and draw out its practical implications for the reader.',
    coverColor: '#5B4B3A',
    hijriStart: 660,
    hijriEnd: 676,
    categoryIds: ['cat-hadith', 'cat-ethics', 'cat-spirituality'],
    chapters: [
      {
        id: 'ch-1',
        number: '1',
        title: 'On Sincerity',
        description: 'Traditions concerning the intention and sincerity of action.',
        sections: [
          {
            id: 'sec-1-1',
            number: '1.1',
            title: 'Actions Are by Intentions',
            content: [
              {
                type: 'paragraph',
                text: 'The first tradition in this collection is among the most frequently cited in the entire corpus of Hadith. It establishes the principle that the value of an action depends on the intention behind it.',
              },
              {
                type: 'quote',
                text: 'Actions are but by intentions, and every person shall have only what he intended.',
                attribution: 'A well-known prophetic tradition',
              },
              {
                type: 'paragraph',
                text: 'This tradition is foundational. It means that two people may perform the same outward act, yet one is rewarded and the other is not, because of the difference in their intentions. It directs attention from the surface of action to its inner reality.',
              },
            ],
          },
        ],
      },
    ],
    introduction: [
      {
        type: 'paragraph',
        text: 'This collection is offered as a small garden — a place where the reader may wander among the words of the Prophet ﷺ and find in them guidance, comfort, and inspiration. It is not exhaustive; many excellent collections have been composed by earlier scholars. The aim here is to present a selection that is accessible, meaningful, and arranged for reflection.',
      },
    ],
    featured: true,
    publishedYear: 'circa 670 AH',
    popularity: 82,
    addedDate: '2024-01-20',
  },
  {
    id: 'book-commentary-on-faith',
    slug: 'commentary-on-faith',
    title: 'A Commentary on Faith',
    subtitle: 'Theological Foundations for the Student',
    authorId: 'scholar-ibn-taymiyyah',
    description:
      'A systematic treatment of the core doctrines of Islamic theology, addressing both foundational beliefs and common objections.',
    longDescription:
      'This work provides a structured exposition of the central doctrines of Islamic theology. It addresses the nature of faith, the attributes of God, the reality of prophethood, and the question of the afterlife, engaging with both the primary sources and the arguments of earlier theologians.',
    coverColor: '#2B2B2B',
    hijriStart: 710,
    hijriEnd: 728,
    categoryIds: ['cat-aqeedah', 'cat-thought'],
    chapters: [
      {
        id: 'ch-1',
        number: '1',
        title: 'The Meaning of Faith',
        description: 'On the definition and components of faith.',
        sections: [
          {
            id: 'sec-1-1',
            number: '1.1',
            title: 'Definition',
            content: [
              {
                type: 'paragraph',
                text: 'Faith, in the language of the Qur’an and the Sunnah, is not merely an intellectual assent. It is a composite reality involving the heart, the tongue, and the limbs. It includes belief in the heart, declaration with the tongue, and action with the limbs.',
              },
              {
                type: 'paragraph',
                text: 'This composite understanding of faith has important implications. It means that faith is not static but dynamic — it increases with obedience and decreases with neglect. It also means that faith and action are not separable in the way that some theological positions have suggested.',
              },
            ],
          },
        ],
      },
    ],
    introduction: [
      {
        type: 'paragraph',
        text: 'Theology, properly understood, is not an exercise in abstract reasoning but a discipline that serves the life of faith. Its purpose is to clarify what the believer is obligated to believe, to address the questions and doubts that arise in every generation, and to protect the community from error.',
      },
    ],
    featured: false,
    publishedYear: 'circa 720 AH',
    popularity: 75,
    addedDate: '2024-03-01',
  },
  {
    id: 'book-lights-of-understanding',
    slug: 'lights-of-understanding',
    title: 'Lights of Understanding',
    subtitle: 'Reflections on the Sciences of the Qur’an',
    authorId: 'scholar-al-suyuti',
    description:
      'An accessible introduction to the sciences of the Qur’an — its revelation, compilation, recitation, and interpretation.',
    longDescription:
      'This work introduces the reader to the many sciences associated with the Qur’an. From the circumstances of revelation to the rules of recitation, from the methods of interpretation to the rhetorical features of the text, it offers a comprehensive overview of the disciplines that have developed around the study of the Qur’an.',
    coverColor: '#4A5D4F',
    hijriStart: 870,
    hijriEnd: 911,
    categoryIds: ['cat-tafsir', 'cat-hadith'],
    chapters: [
      {
        id: 'ch-1',
        number: '1',
        title: 'The Revelation',
        description: 'On the beginning and process of revelation.',
        sections: [
          {
            id: 'sec-1-1',
            number: '1.1',
            title: 'The First Revelation',
            content: [
              {
                type: 'paragraph',
                text: 'The revelation of the Qur’an began during one of the final nights of the month of Ramadan, in the cave of Hira above the city of Mecca. The Prophet Muhammad ﷺ, who had retreated there for contemplation, received the first verses through the angel Gabriel.',
              },
              {
                type: 'paragraph',
                text: 'This event marked the beginning of a prophetic mission that would last twenty-three years and transform the Arabian Peninsula and, in time, much of the known world. The first words revealed set the tone for the entire message: an emphasis on reading, on knowledge, and on the generosity of the Creator.',
              },
            ],
          },
        ],
      },
    ],
    introduction: [
      {
        type: 'paragraph',
        text: 'The Qur’an is the central text of Islam and the primary source of guidance for the Muslim community. Over the centuries, a rich body of scholarship has developed around it — sciences dedicated to its recitation, its interpretation, its abrogation and specification, its rhetorical features, and much more. This work introduces the reader to these sciences.',
      },
    ],
    featured: true,
    publishedYear: 'circa 900 AH',
    popularity: 80,
    addedDate: '2024-02-15',
  },
  {
    id: 'book-the-preserver',
    slug: 'the-preserver',
    title: 'The Preserver',
    subtitle: 'On the Authentication of Prophetic Traditions',
    authorId: 'scholar-ibn-hajar',
    description:
      'A detailed study of the methods used by scholars to authenticate and classify prophetic traditions.',
    longDescription:
      'This work examines the sophisticated methods developed by Hadith scholars to evaluate the authenticity of prophetic traditions. It covers the science of narration, the evaluation of narrators, the classification of reports, and the criteria used to distinguish sound from weak traditions.',
    coverColor: '#1F2D3F',
    hijriStart: 800,
    hijriEnd: 852,
    categoryIds: ['cat-hadith'],
    chapters: [
      {
        id: 'ch-1',
        number: '1',
        title: 'The Science of Narration',
        description: 'On the methods and principles of Hadith transmission.',
        sections: [
          {
            id: 'sec-1-1',
            number: '1.1',
            title: 'The Chain of Narration',
            content: [
              {
                type: 'paragraph',
                text: 'The chain of narration, or isnad, is the distinctive feature of Islamic Hadith scholarship. It is a list of the individuals through whom a report has been transmitted from its origin to the scholar who records it. The scrutiny of these chains became one of the most rigorous scholarly endeavors in the Islamic tradition.',
              },
              {
                type: 'paragraph',
                text: 'A tradition is considered authentic only when its chain is unbroken, each narrator is known to be reliable, and there is no evidence of error or fabrication. The level of attention given to these criteria is remarkable by the standards of any historical discipline.',
              },
            ],
          },
        ],
      },
    ],
    introduction: [
      {
        type: 'paragraph',
        text: 'The preservation of the prophetic tradition is one of the great achievements of Islamic civilization. This work explores the methods by which scholars ensured the integrity of the traditions they transmitted, and the criteria by which they evaluated reports of varying quality.',
      },
    ],
    featured: false,
    publishedYear: 'circa 840 AH',
    popularity: 70,
    addedDate: '2024-03-10',
  },
  {
    id: 'book-foundations-of-jurisprudence',
    slug: 'foundations-of-jurisprudence',
    title: 'The Roots of Jurisprudence',
    subtitle: 'A Treatise on Usul al-Fiqh',
    authorId: 'scholar-al-ghazali',
    description:
      'A systematic treatment of the principles and methods of Islamic jurisprudence.',
    longDescription:
      'This treatise addresses the foundational principles of Islamic legal reasoning — the sources of law, the methods of derivation, the resolution of conflicts, and the qualifications of the jurist. It is written for students who have begun the study of law and seek a deeper understanding of its methodology.',
    coverColor: '#6B5B3F',
    hijriStart: 490,
    hijriEnd: 505,
    categoryIds: ['cat-fiqh', 'cat-thought'],
    chapters: [
      {
        id: 'ch-1',
        number: '1',
        title: 'The Sources of Law',
        description: 'On the four primary roots of jurisprudence.',
        sections: [
          {
            id: 'sec-1-1',
            number: '1.1',
            title: 'The Qur’an as Source',
            content: [
              {
                type: 'paragraph',
                text: 'The Qur’an is the first and most authoritative source of Islamic law. It contains legal rulings on matters of worship, family, commerce, and governance, though these rulings constitute a relatively small portion of the text as a whole.',
              },
              {
                type: 'paragraph',
                text: 'The jurist must understand both the explicit rulings of the Qur’an and its broader principles, which may be applied to cases not directly addressed. The science of interpreting the Qur’an for legal purposes is itself a developed discipline.',
              },
            ],
          },
        ],
      },
    ],
    introduction: [
      {
        type: 'paragraph',
        text: 'The science of the roots of jurisprudence (usul al-fiqh) is the methodology that governs the derivation of legal rulings from their sources. It is one of the most important and sophisticated disciplines of the Islamic intellectual tradition. This work offers a structured introduction to its principles.',
      },
    ],
    featured: false,
    publishedYear: 'circa 500 AH',
    popularity: 72,
    addedDate: '2024-02-20',
  },
  {
    id: 'book-letters-to-the-seeker',
    slug: 'letters-to-the-seeker',
    title: 'Letters to the Seeker',
    subtitle: 'On the Etiquette of Learning',
    authorId: 'scholar-ibn-kathir',
    description:
      'A collection of reflections on the manners and discipline appropriate to the student of knowledge.',
    longDescription:
      'Drawing on the example of earlier scholars, this work addresses the etiquette of learning — the relationship between student and teacher, the discipline of study, the humility required for genuine understanding, and the conduct that should accompany scholarly pursuit.',
    coverColor: '#4F3F3A',
    hijriStart: 740,
    hijriEnd: 774,
    categoryIds: ['cat-ethics', 'cat-spirituality'],
    chapters: [
      {
        id: 'ch-1',
        number: '1',
        title: 'The Manners of the Student',
        description: 'On the conduct appropriate to one seeking knowledge.',
        sections: [
          {
            id: 'sec-1-1',
            number: '1.1',
            title: 'Humility',
            content: [
              {
                type: 'paragraph',
                text: 'The first quality required of the student is humility. The one who approaches learning already believing that he knows will learn little. Knowledge is granted to those who recognize their need for it and approach it with reverence.',
              },
              {
                type: 'paragraph',
                text: 'Humility before the teacher, humility before the text, and humility before the subject matter — these are the foundations of genuine learning. The great scholars of the past were known for their humility, and it was said that knowledge flees from the arrogant as water flows downhill.',
              },
            ],
          },
        ],
      },
    ],
    introduction: [
      {
        type: 'paragraph',
        text: 'Knowledge is not merely a set of facts to be acquired but a transformation to be undergone. The manner in which one approaches learning is as important as what one learns. This work reflects on the etiquette, discipline, and character of the student.',
      },
    ],
    featured: false,
    publishedYear: 'circa 765 AH',
    popularity: 65,
    addedDate: '2024-03-15',
  },
  {
    id: 'book-the-noble-life',
    slug: 'the-noble-life',
    title: 'The Noble Life',
    subtitle: 'A Study of the Prophetic Biography',
    authorId: 'scholar-ibn-kathir',
    description:
      'An accessible account of the life of the Prophet Muhammad ﷺ, arranged for reflection and study.',
    longDescription:
      'This work presents the life of the Prophet Muhammad ﷺ in a structured and reflective format. Rather than a mere chronicle, it seeks to draw out the lessons and patterns of the prophetic life, making it accessible to the contemporary reader.',
    coverColor: '#3F4A5D',
    hijriStart: 730,
    hijriEnd: 774,
    categoryIds: ['cat-seerah', 'cat-biography', 'cat-history'],
    chapters: [
      {
        id: 'ch-1',
        number: '1',
        title: 'The Early Years',
        description: 'The birth, childhood, and early life of the Prophet ﷺ.',
        sections: [
          {
            id: 'sec-1-1',
            number: '1.1',
            title: 'Birth and Lineage',
            content: [
              {
                type: 'paragraph',
                text: 'The Prophet Muhammad ﷺ was born in Mecca in the Year of the Elephant, corresponding to approximately 570 CE. He was born into the Banu Hashim, a respected clan of the Quraysh tribe, and his lineage is traced to the Prophet Ibrahim through his son Isma‘il.',
              },
              {
                type: 'paragraph',
                text: 'His father, Abdullah, died before his birth, and his mother, Aminah, died when he was six years old. He was raised first by his grandfather, Abdul Muttalib, and then by his uncle, Abu Talib. These early experiences of loss shaped his character and his deep compassion for the orphaned and the vulnerable.',
              },
            ],
          },
        ],
      },
    ],
    introduction: [
      {
        type: 'paragraph',
        text: 'The life of the Prophet Muhammad ﷺ is the central narrative of Islam. It is the story through which the Muslim community understands the meaning of the revelation and the model for its own conduct. This work presents that story in a way intended for both study and reflection.',
      },
    ],
    featured: true,
    publishedYear: 'circa 770 AH',
    popularity: 90,
    addedDate: '2024-01-10',
  },
  {
    id: 'book-reflections-on-time',
    slug: 'reflections-on-time',
    title: 'Reflections on Time',
    subtitle: 'On the Value of Days and the Discipline of Hours',
    authorId: 'scholar-al-nawawi',
    description:
      'A brief but penetrating work on the importance of time, its wise use, and the spiritual dimensions of its passage.',
    longDescription:
      'This short work addresses one of the most fundamental aspects of human life: time. It reflects on the brevity of the human lifespan, the responsibility that accompanies each passing day, and the disciplines that allow the believer to use time well.',
    coverColor: '#5D5D5D',
    hijriStart: 665,
    hijriEnd: 676,
    categoryIds: ['cat-ethics', 'cat-spirituality'],
    chapters: [
      {
        id: 'ch-1',
        number: '1',
        title: 'The Nature of Time',
        description: 'On the fleeting nature of life and the value of each moment.',
        sections: [
          {
            id: 'sec-1-1',
            number: '1.1',
            title: 'The Brevity of Life',
            content: [
              {
                type: 'paragraph',
                text: 'The human lifespan, however long it may seem in the living, is brief. The days pass quickly, and the years accumulate with a swiftness that surprises the one who pauses to count them. The scholar who wishes to use time well must first reckon with its scarcity.',
              },
              {
                type: 'paragraph',
                text: 'It has been said that time is the most precious of possessions, because it is the one that cannot be recovered. A moment lost is lost forever. This should produce in the seeker not anxiety but resolve — a determination to make each hour count.',
              },
            ],
          },
        ],
      },
    ],
    introduction: [
      {
        type: 'paragraph',
        text: 'This brief work is offered as a reminder — to the author first, and then to the reader. It reflects on the nature of time, its value, and the disciplines that allow us to use it wisely. It is short by design, for the subject demands not lengthy reading but prompt action.',
      },
    ],
    featured: false,
    publishedYear: 'circa 672 AH',
    popularity: 60,
    addedDate: '2024-03-20',
  },
  {
    id: 'book-history-of-the-rightly-guided',
    slug: 'history-of-the-rightly-guided',
    title: 'Era of the Rightly Guided',
    subtitle: 'The Age of the First Caliphs',
    authorId: 'scholar-ibn-kathir',
    description:
      'A historical study of the era of the first four caliphs and the foundations they established for Islamic civilization.',
    longDescription:
      'This work examines the period of the first four caliphs — Abu Bakr, Umar, Uthman, and Ali — a formative era that established the political, legal, and social foundations of the Islamic civilization. It draws on early historical sources to present a balanced account of this pivotal period.',
    coverColor: '#3A3A5D',
    hijriStart: 750,
    hijriEnd: 774,
    categoryIds: ['cat-history', 'cat-biography'],
    chapters: [
      {
        id: 'ch-1',
        number: '1',
        title: 'The Accession of Abu Bakr',
        description: 'On the events following the death of the Prophet ﷺ.',
        sections: [
          {
            id: 'sec-1-1',
            number: '1.1',
            title: 'The Meeting at Saqifah',
            content: [
              {
                type: 'paragraph',
                text: 'Following the death of the Prophet Muhammad ﷺ, the Muslim community faced the question of leadership. The meeting at Saqifah of the Banu Sa‘idah resulted in the selection of Abu Bakr as the first caliph, a decision that shaped the future of the community.',
              },
              {
                type: 'paragraph',
                text: 'Abu Bakr’s first speech established the principles that would guide his leadership: that he was not the best among them, that obedience was conditional on his obedience to God, and that he welcomed correction. This speech set a tone of humility and accountability that would characterize the early caliphate.',
              },
            ],
          },
        ],
      },
    ],
    introduction: [
      {
        type: 'paragraph',
        text: 'The era of the first four caliphs is regarded by Sunni Muslims as a golden age — a period in which the community was led by individuals of exceptional character and closeness to the Prophet ﷺ. This work examines that era, its achievements, and the challenges it faced.',
      },
    ],
    featured: false,
    publishedYear: 'circa 770 AH',
    popularity: 78,
    addedDate: '2024-02-10',
  },

  // ── 100–200 AH ────────────────────────────────────────────────────────────
  {
    id: 'book-manners-of-scholars',
    slug: 'manners-of-scholars',
    title: 'The Manners of Scholars',
    subtitle: 'Conduct and Character of Early Islamic Scholars',
    authorId: 'scholar-al-nawawi',
    description: 'A concise guide to the etiquette and conduct expected of students and scholars in the early Islamic tradition.',
    longDescription: 'Drawing on reports from the earliest generations, this work outlines the manners, humility, and devotion that characterized the scholars of the first two centuries of Islam.',
    coverColor: '#1A2B3C',
    hijriStart: 120,
    hijriEnd: 180,
    categoryIds: ['cat-ethics', 'cat-hadith'],
    chapters: [
      {
        id: 'ch-1', number: '1', title: 'Humility and Reverence',
        description: 'On the inner qualities of the sincere scholar.',
        sections: [
          {
            id: 'sec-1-1', number: '1.1', title: 'The Value of Humility',
            content: [
              { type: 'paragraph', text: 'The scholars of the early generations were known above all for their humility. They considered themselves the least deserving of whatever knowledge Allah had bestowed upon them.' },
              { type: 'paragraph', text: 'It was reported of many of them that they would refuse to issue a legal opinion even when they were the most learned person in the gathering, out of fear of speaking without full certainty.' },
            ],
          },
        ],
      },
    ],
    introduction: [{ type: 'paragraph', text: 'This short collection gathers reports and sayings about the character of the scholars of the first two centuries, as a reminder for students of knowledge in every age.' }],
    featured: false,
    publishedYear: 'circa 160 AH',
    popularity: 58,
    addedDate: '2024-04-01',
  },
  {
    id: 'book-principles-of-recitation',
    slug: 'principles-of-recitation',
    title: 'Principles of Recitation',
    subtitle: 'The Science of Tajweed in the Early Period',
    authorId: 'scholar-ibn-kathir',
    description: 'An introduction to the rules and principles of Quranic recitation as established by the early transmitters.',
    longDescription: 'This work outlines the foundational rules of tajweed as they were codified in the second century of the Hijri calendar, tracing their origins to the Companions and Successors.',
    coverColor: '#2A3B1C',
    hijriStart: 140,
    hijriEnd: 195,
    categoryIds: ['cat-tafsir'],
    chapters: [
      {
        id: 'ch-1', number: '1', title: 'The Origins of Tajweed',
        description: 'How the rules of recitation were preserved and transmitted.',
        sections: [
          {
            id: 'sec-1-1', number: '1.1', title: 'Transmission from the Prophet ﷺ',
            content: [
              { type: 'paragraph', text: 'The rules of Quranic recitation were not invented by later scholars — they were transmitted directly from the Prophet ﷺ, who received the Quran with its proper pronunciation from Jibreel.' },
              { type: 'paragraph', text: 'The Companions memorized the Quran along with its recitation, and passed this on to the Successors with great care and precision.' },
            ],
          },
        ],
      },
    ],
    introduction: [{ type: 'paragraph', text: 'Understanding the rules of recitation requires tracing them back to their source. This work begins with that original transmission.' }],
    featured: false,
    publishedYear: 'circa 175 AH',
    popularity: 55,
    addedDate: '2024-04-02',
  },

  // ── 201–300 AH ────────────────────────────────────────────────────────────
  {
    id: 'book-hadith-transmission',
    slug: 'hadith-transmission',
    title: 'The Science of Hadith Transmission',
    subtitle: 'Principles of the Third Century Scholars',
    authorId: 'scholar-ibn-hajar',
    description: 'An exploration of how the scholars of the third Hijri century systematized the sciences of Hadith narration and verification.',
    longDescription: 'The third century AH was a golden age for Hadith scholarship. This work examines the methods, criteria, and contributions of the great collectors of that era.',
    coverColor: '#1F3040',
    hijriStart: 210,
    hijriEnd: 290,
    categoryIds: ['cat-hadith'],
    chapters: [
      {
        id: 'ch-1', number: '1', title: 'The Great Collectors',
        description: 'On the scholars who compiled the canonical Hadith collections.',
        sections: [
          {
            id: 'sec-1-1', number: '1.1', title: 'The Era of Compilation',
            content: [
              { type: 'paragraph', text: 'The third century AH witnessed an extraordinary effort of collection and systematization. Scholars traveled thousands of miles in pursuit of a single narration, subjecting every chain of transmission to careful scrutiny.' },
              { type: 'paragraph', text: 'This era produced the Six Books — the canonical collections that would become the primary reference for Islamic jurisprudence and practice for centuries to come.' },
            ],
          },
        ],
      },
    ],
    introduction: [{ type: 'paragraph', text: 'No science in Islam was developed with more rigor than the science of Hadith. This work examines how that science reached its height in the third century AH.' }],
    featured: false,
    publishedYear: 'circa 260 AH',
    popularity: 62,
    addedDate: '2024-04-03',
  },
  {
    id: 'book-early-jurisprudence',
    slug: 'early-jurisprudence',
    title: 'Early Islamic Jurisprudence',
    subtitle: 'The Formation of the Legal Schools',
    authorId: 'scholar-al-ghazali',
    description: 'A study of the development of the four major schools of Islamic law in the third century AH.',
    longDescription: 'By the third century AH, the major schools of Islamic jurisprudence had taken their definitive shape. This work traces that process and examines the methods that distinguished each school.',
    coverColor: '#3B2A1C',
    hijriStart: 220,
    hijriEnd: 280,
    categoryIds: ['cat-fiqh'],
    chapters: [
      {
        id: 'ch-1', number: '1', title: 'The Formation of the Schools',
        description: 'How the legal schools emerged from the work of the early jurists.',
        sections: [
          {
            id: 'sec-1-1', number: '1.1', title: 'From Companions to Schools',
            content: [
              { type: 'paragraph', text: 'The legal schools did not emerge fully formed. They developed gradually from the practice of the Companions, refined by the Successors, and systematized by the great jurists of the second and third centuries.' },
              { type: 'paragraph', text: 'Each school reflects the particular genius and method of its founder, shaped by the region, the available sources, and the intellectual context of his time.' },
            ],
          },
        ],
      },
    ],
    introduction: [{ type: 'paragraph', text: 'Understanding Islamic law requires understanding how its schools formed. This work traces that history from the Companions to the third century codification.' }],
    featured: false,
    publishedYear: 'circa 250 AH',
    popularity: 60,
    addedDate: '2024-04-04',
  },

  // ── 301–400 AH ────────────────────────────────────────────────────────────
  {
    id: 'book-theology-of-the-fourth-century',
    slug: 'theology-of-the-fourth-century',
    title: 'Theology in the Fourth Century',
    subtitle: 'Kalam and its Critics',
    authorId: 'scholar-ibn-taymiyyah',
    description: 'An examination of the theological debates and developments in Islamic thought during the fourth Hijri century.',
    longDescription: 'The fourth century AH was a period of intense theological debate. This work surveys the major schools of kalam, the responses of the traditionalists, and the lasting legacy of this period for Islamic thought.',
    coverColor: '#2B1C3A',
    hijriStart: 310,
    hijriEnd: 380,
    categoryIds: ['cat-aqeedah', 'cat-thought'],
    chapters: [
      {
        id: 'ch-1', number: '1', title: 'The Schools of Kalam',
        description: 'Rationalist theology and its place in Islamic intellectual life.',
        sections: [
          {
            id: 'sec-1-1', number: '1.1', title: 'The Mutazilite Legacy',
            content: [
              { type: 'paragraph', text: 'Though the Mutazilites had lost state patronage by the end of the third century, their methods and questions continued to shape Islamic theology. The Asharite school, founded in this century, engaged deeply with these questions while arriving at different conclusions.' },
              { type: 'paragraph', text: 'The fourth century thus produced a rich tradition of systematic theology that sought to defend orthodox belief using the tools of rational argument.' },
            ],
          },
        ],
      },
    ],
    introduction: [{ type: 'paragraph', text: 'The fourth century AH was a crucible for Islamic theology. Understanding its debates is essential for understanding what came after.' }],
    featured: false,
    publishedYear: 'circa 350 AH',
    popularity: 57,
    addedDate: '2024-04-05',
  },
  {
    id: 'book-sufi-path-early',
    slug: 'sufi-path-early',
    title: 'The Early Sufi Path',
    subtitle: 'Asceticism and Devotion in the Fourth Century',
    authorId: 'scholar-al-nawawi',
    description: 'A survey of the ascetic and spiritual movements that flourished during the fourth century AH.',
    longDescription: 'This work examines the lives, sayings, and practices of the early masters of the spiritual path, tracing the development of Sufi thought and practice in its formative period.',
    coverColor: '#1C2B1C',
    hijriStart: 320,
    hijriEnd: 395,
    categoryIds: ['cat-spirituality', 'cat-ethics'],
    chapters: [
      {
        id: 'ch-1', number: '1', title: 'The Masters of the Path',
        description: 'Lives and sayings of the great spiritual masters.',
        sections: [
          {
            id: 'sec-1-1', number: '1.1', title: 'Zuhd and Tawakkul',
            content: [
              { type: 'paragraph', text: 'The ascetics of the early centuries were not fleeing the world — they were oriented toward the next. Their renunciation of worldly comfort was an act of deep trust in the provision of Allah.' },
              { type: 'paragraph', text: 'Among the most celebrated of these masters was Junayd al-Baghdadi, who taught that the highest form of spiritual realization was a return to outward observance grounded in inward certainty.' },
            ],
          },
        ],
      },
    ],
    introduction: [{ type: 'paragraph', text: 'The fourth century produced some of the greatest masters of the inner life. Their words have guided seekers in every century since.' }],
    featured: false,
    publishedYear: 'circa 360 AH',
    popularity: 63,
    addedDate: '2024-04-06',
  },

  // ── 401–500 AH ────────────────────────────────────────────────────────────
  {
    id: 'book-systematic-theology',
    slug: 'systematic-theology',
    title: 'Systematic Theology',
    subtitle: 'The Asharite Tradition in the Fifth Century',
    authorId: 'scholar-al-ghazali',
    description: 'An exploration of the systematic theological tradition as it developed in the fifth Hijri century, with particular attention to the Asharite school.',
    longDescription: 'The fifth century AH saw Islamic theology reach a new level of systematization. Al-Ghazali and his contemporaries brought rigorous philosophical method to bear on the questions of faith, producing works that shaped theology for centuries.',
    coverColor: '#1C2A3A',
    hijriStart: 410,
    hijriEnd: 490,
    categoryIds: ['cat-aqeedah', 'cat-thought'],
    chapters: [
      {
        id: 'ch-1', number: '1', title: 'The Attributes of God',
        description: 'Theological reasoning on the divine names and attributes.',
        sections: [
          {
            id: 'sec-1-1', number: '1.1', title: 'The Problem of Attributes',
            content: [
              { type: 'paragraph', text: 'The question of divine attributes was among the most contested in early Islamic theology. How can God be described with attributes without compromising His absolute unity and transcendence?' },
              { type: 'paragraph', text: 'The Asharite solution was to affirm the attributes as real while insisting they are not identical to the divine essence, nor separate from it — a position that sought to honour both the text and the demands of reason.' },
            ],
          },
        ],
      },
    ],
    introduction: [{ type: 'paragraph', text: 'Systematic theology in Islam reached its maturity in the fifth century. This work introduces the reader to the key questions and approaches of that tradition.' }],
    featured: false,
    publishedYear: 'circa 450 AH',
    popularity: 66,
    addedDate: '2024-04-19',
  },
  {
    id: 'book-spiritual-stations',
    slug: 'spiritual-stations',
    title: 'The Spiritual Stations',
    subtitle: 'Maqamat and Ahwal on the Path to God',
    authorId: 'scholar-al-ghazali',
    description: 'A guide to the stations and states of the spiritual path as described by the masters of the fifth century.',
    longDescription: 'The concept of spiritual stations and states was refined in the fifth century into a sophisticated map of the inner life. This work presents that map with clarity and practical guidance.',
    coverColor: '#2A3A2A',
    hijriStart: 450,
    hijriEnd: 500,
    categoryIds: ['cat-spirituality', 'cat-ethics'],
    chapters: [
      {
        id: 'ch-1', number: '1', title: 'Stations and States',
        description: 'The distinction between acquired stations and received states.',
        sections: [
          {
            id: 'sec-1-1', number: '1.1', title: 'The Nature of Maqamat',
            content: [
              { type: 'paragraph', text: 'A station (maqam) is a level of spiritual attainment that is acquired through effort and discipline. It is contrasted with a state (hal), which is a transient experience that descends upon the heart without being sought.' },
              { type: 'paragraph', text: 'The masters distinguished between these two to prevent seekers from either over-relying on spiritual experiences or neglecting the sustained work that genuine stations require.' },
            ],
          },
        ],
      },
    ],
    introduction: [{ type: 'paragraph', text: 'The map of the spiritual journey was drawn with precision by the masters of the fifth century. This work follows that map from its starting point to its highest reaches.' }],
    featured: false,
    publishedYear: 'circa 470 AH',
    popularity: 68,
    addedDate: '2024-04-20',
  },

  // ── 801–900 AH ────────────────────────────────────────────────────────────
  {
    id: 'book-hadith-commentary-ninth',
    slug: 'hadith-commentary-ninth',
    title: 'Hadith Commentary in the Ninth Century',
    subtitle: 'The Tradition of Sharh and Explanation',
    authorId: 'scholar-ibn-hajar',
    description: 'A study of the rich tradition of Hadith commentary that flourished in the ninth Hijri century, with Ibn Hajar at its center.',
    longDescription: 'The ninth century AH produced some of the greatest Hadith commentaries in Islamic history. This work surveys that tradition and introduces readers to its major figures and contributions.',
    coverColor: '#1F2F3F',
    hijriStart: 810,
    hijriEnd: 885,
    categoryIds: ['cat-hadith'],
    chapters: [
      {
        id: 'ch-1', number: '1', title: 'The Art of Commentary',
        description: 'What Hadith commentary involves and why it matters.',
        sections: [
          {
            id: 'sec-1-1', number: '1.1', title: 'Layers of Meaning',
            content: [
              { type: 'paragraph', text: 'A great Hadith commentary does far more than explain the words of the text. It examines the chain of narration, evaluates each narrator, places the tradition in its historical context, derives legal rulings, and draws out its ethical and spiritual implications.' },
              { type: 'paragraph', text: 'Ibn Hajar\'s commentary on Sahih al-Bukhari — the Fath al-Bari — is the supreme example of this art. Running to many volumes, it remains the indispensable reference for scholars working with al-Bukhari\'s collection.' },
            ],
          },
        ],
      },
    ],
    introduction: [{ type: 'paragraph', text: 'To read the great Hadith commentaries is to enter into a conversation with the finest minds of Islamic scholarship. This work introduces that conversation.' }],
    featured: false,
    publishedYear: 'circa 840 AH',
    popularity: 71,
    addedDate: '2024-04-21',
  },
  {
    id: 'book-mamluk-scholars',
    slug: 'mamluk-scholars',
    title: 'Scholarship under the Mamluks',
    subtitle: 'Islamic Learning in Cairo and Damascus',
    authorId: 'scholar-al-suyuti',
    description: 'An account of the remarkable flowering of Islamic scholarship in Mamluk Cairo and Damascus during the ninth Hijri century.',
    longDescription: 'The Mamluk period was a golden age for Islamic scholarship in Egypt and the Levant. This work surveys the major scholars, institutions, and works of that era, from Ibn Hajar in Cairo to Ibn Khaldun whose legacy continued to shape the century.',
    coverColor: '#2F1F3F',
    hijriStart: 820,
    hijriEnd: 895,
    categoryIds: ['cat-history', 'cat-biography'],
    chapters: [
      {
        id: 'ch-1', number: '1', title: 'Cairo as Scholarly Center',
        description: 'How Cairo became the capital of Islamic learning.',
        sections: [
          {
            id: 'sec-1-1', number: '1.1', title: 'The Institutions of Learning',
            content: [
              { type: 'paragraph', text: 'The Mamluks were generous patrons of Islamic scholarship. They endowed dozens of madrasas in Cairo alone, each with its own library, teachers, and stipends for students. The result was an extraordinary concentration of scholarly talent in a single city.' },
              { type: 'paragraph', text: 'Al-Azhar, founded centuries earlier, continued to grow in prestige under Mamluk patronage. By the ninth century it had become not merely an institution but a symbol of Islamic learning itself.' },
            ],
          },
        ],
      },
    ],
    introduction: [{ type: 'paragraph', text: 'The Mamluk period is one of the most productive in the history of Islamic scholarship. This work brings its major figures and achievements to life.' }],
    featured: false,
    publishedYear: 'circa 860 AH',
    popularity: 64,
    addedDate: '2024-04-22',
  },

  // ── 901–1000 AH ──────────────────────────────────────────────────────────
  {
    id: 'book-suyuti-encyclopedia',
    slug: 'suyuti-encyclopedia',
    title: 'The Encyclopedic Tradition',
    subtitle: 'Al-Suyuti and the Tenth-Century Synthesis',
    authorId: 'scholar-al-suyuti',
    description: 'An introduction to the encyclopedic approach to Islamic scholarship exemplified by Al-Suyuti in the tenth Hijri century.',
    longDescription: 'Al-Suyuti authored hundreds of works across every discipline. This study examines his method, his sources, and the tradition of encyclopedic synthesis that characterized the tenth century AH.',
    coverColor: '#3F2F1F',
    hijriStart: 905,
    hijriEnd: 980,
    categoryIds: ['cat-tafsir', 'cat-hadith', 'cat-fiqh'],
    chapters: [
      {
        id: 'ch-1', number: '1', title: 'The Encyclopedic Method',
        description: 'How Al-Suyuti synthesized the classical tradition.',
        sections: [
          {
            id: 'sec-1-1', number: '1.1', title: 'Breadth and Depth',
            content: [
              { type: 'paragraph', text: 'Al-Suyuti\'s approach to scholarship was encyclopedic in the fullest sense. He sought to master every discipline and to produce works that would make the classical tradition accessible to students in every field.' },
              { type: 'paragraph', text: 'His method was one of compilation and synthesis rather than original argumentation — but this should not diminish our appreciation. The preservation and transmission of classical learning is itself a great scholarly achievement.' },
            ],
          },
        ],
      },
    ],
    introduction: [{ type: 'paragraph', text: 'Al-Suyuti is one of the most important scholars in Islamic history, if not always the most appreciated. This work introduces his method and his legacy.' }],
    featured: false,
    publishedYear: 'circa 900 AH',
    popularity: 69,
    addedDate: '2024-04-23',
  },
  {
    id: 'book-ottoman-early-scholars',
    slug: 'ottoman-early-scholars',
    title: 'Scholars of the Early Ottoman Period',
    subtitle: 'Islamic Learning in the Tenth Century AH',
    authorId: 'scholar-ibn-hajar',
    description: 'A survey of the major scholars and their contributions during the rise and early consolidation of the Ottoman Empire.',
    longDescription: 'The tenth century AH coincided with the rise of the Ottoman Empire to its greatest power. This work examines the scholars who served, advised, and sometimes challenged the Ottoman state, and their contributions to the tradition.',
    coverColor: '#1F3F3F',
    hijriStart: 920,
    hijriEnd: 995,
    categoryIds: ['cat-history', 'cat-fiqh'],
    chapters: [
      {
        id: 'ch-1', number: '1', title: 'The Scholar and the Sultan',
        description: 'The relationship between Islamic scholars and Ottoman power.',
        sections: [
          {
            id: 'sec-1-1', number: '1.1', title: 'The Role of the Chief Mufti',
            content: [
              { type: 'paragraph', text: 'The office of Şeyhülislam — the Chief Islamic Scholar of the Ottoman Empire — gave Islamic scholarship an unprecedented institutional presence at the highest levels of state. The holder of this office was consulted on all major state decisions that touched on religious law.' },
              { type: 'paragraph', text: 'This created both opportunities and constraints. Scholars had access to resources and influence that earlier generations could not have imagined, but this came at the cost of some independence from the state.' },
            ],
          },
        ],
      },
    ],
    introduction: [{ type: 'paragraph', text: 'The early Ottoman period produced scholars of great distinction. This work surveys their lives, methods, and contributions to the Islamic tradition.' }],
    featured: false,
    publishedYear: 'circa 950 AH',
    popularity: 61,
    addedDate: '2024-04-24',
  },
  {
    id: 'book-revival-of-sciences',
    slug: 'revival-of-sciences',
    title: 'The Revival of Religious Sciences',
    subtitle: 'An Introduction to Al-Ghazali\'s Ihya',
    authorId: 'scholar-al-ghazali',
    description: 'An accessible introduction to the major themes of Al-Ghazali\'s monumental work on the renewal of Islamic religious life.',
    longDescription: 'This work introduces readers to the structure and themes of the Ihya Ulum al-Din, widely regarded as the most important work of Islamic spirituality ever written.',
    coverColor: '#3A4A2A',
    hijriStart: 505,
    hijriEnd: 570,
    categoryIds: ['cat-spirituality', 'cat-fiqh', 'cat-ethics'],
    chapters: [
      {
        id: 'ch-1', number: '1', title: 'The Four Quarters',
        description: 'The structure of the Ihya and its organizing principles.',
        sections: [
          {
            id: 'sec-1-1', number: '1.1', title: 'Worship and Customs',
            content: [
              { type: 'paragraph', text: 'The Ihya opens with a detailed treatment of acts of worship, not merely describing their outward form but illuminating their inner dimensions. Each act of worship is examined for its spirit as well as its form.' },
              { type: 'paragraph', text: 'Al-Ghazali insisted that outward practice without inner presence was hollow, and inner aspiration without outward form was incomplete. The two must go together.' },
            ],
          },
        ],
      },
    ],
    introduction: [{ type: 'paragraph', text: 'The Ihya Ulum al-Din is a vast and multi-layered work. This introduction aims to make its key themes accessible to the general reader.' }],
    featured: false,
    publishedYear: 'circa 530 AH',
    popularity: 72,
    addedDate: '2024-04-07',
  },
  {
    id: 'book-legal-maxims',
    slug: 'legal-maxims',
    title: 'Legal Maxims of Islamic Law',
    subtitle: 'The Five Universal Principles',
    authorId: 'scholar-al-suyuti',
    description: 'An exploration of the five universal maxims that underpin all of Islamic jurisprudence.',
    longDescription: 'This work examines the five foundational legal maxims around which the whole of Islamic law is organized, tracing their origins and applications across the legal schools.',
    coverColor: '#2A1C3B',
    hijriStart: 540,
    hijriEnd: 590,
    categoryIds: ['cat-fiqh', 'cat-thought'],
    chapters: [
      {
        id: 'ch-1', number: '1', title: 'The Five Universal Maxims',
        description: 'The pillars on which the edifice of Islamic law rests.',
        sections: [
          {
            id: 'sec-1-1', number: '1.1', title: 'Matters Are Judged by Their Intentions',
            content: [
              { type: 'paragraph', text: 'The first of the five universal maxims is that matters are judged by their intentions. This maxim, derived from the famous hadith of intentions, pervades Islamic jurisprudence from personal worship to commercial transactions.' },
              { type: 'paragraph', text: 'Its application is broad: acts that appear identical may be judged differently depending on the intention behind them, while intentions alone without action may also carry legal consequences.' },
            ],
          },
        ],
      },
    ],
    introduction: [{ type: 'paragraph', text: 'The five universal maxims are not arbitrary rules — they are the distillation of centuries of juristic reasoning. Understanding them illuminates the whole of Islamic law.' }],
    featured: false,
    publishedYear: 'circa 560 AH',
    popularity: 65,
    addedDate: '2024-04-08',
  },

  // ── 1001–1100 AH ─────────────────────────────────────────────────────────
  {
    id: 'book-renewal-of-faith',
    slug: 'renewal-of-faith',
    title: 'The Renewal of Faith',
    subtitle: 'Scholarship and Reform in the Eleventh Century',
    authorId: 'scholar-al-suyuti',
    description: 'A study of the scholarly and spiritual renewal movements that characterized the eleventh Hijri century.',
    longDescription: 'This work surveys the major scholars and movements that sought to renew Islamic learning and practice in the eleventh century AH, with particular attention to Hadith scholarship and legal reform.',
    coverColor: '#1A2030',
    hijriStart: 1010,
    hijriEnd: 1090,
    categoryIds: ['cat-hadith', 'cat-thought'],
    chapters: [
      {
        id: 'ch-1', number: '1', title: 'The Renewal Impulse',
        description: 'What motivated scholars to seek renewal in every century.',
        sections: [
          {
            id: 'sec-1-1', number: '1.1', title: 'The Hadith on Renewal',
            content: [
              { type: 'paragraph', text: 'The Prophet ﷺ said: "Indeed Allah raises up for this community, at the beginning of every century, one who renews its religion for it." This hadith shaped how scholars understood their own role in history.' },
              { type: 'paragraph', text: 'In the eleventh century, several scholars were identified by contemporaries and later historians as candidates for this role, each representing a different aspect of renewal.' },
            ],
          },
        ],
      },
    ],
    introduction: [{ type: 'paragraph', text: 'Renewal is not innovation — it is the restoration of what has been neglected. This work examines how the scholars of the eleventh century understood and pursued that restoration.' }],
    featured: false,
    publishedYear: 'circa 1050 AH',
    popularity: 54,
    addedDate: '2024-04-09',
  },
  {
    id: 'book-ottoman-scholarship',
    slug: 'ottoman-scholarship',
    title: 'Scholarship in the Ottoman Era',
    subtitle: 'Islamic Learning Under the Ottomans',
    authorId: 'scholar-ibn-hajar',
    description: 'An overview of the major scholarly institutions, figures, and works produced during the height of the Ottoman period.',
    longDescription: 'The Ottoman period was a time of great institutional development for Islamic scholarship. This work surveys the major figures and contributions of this era.',
    coverColor: '#2A1A30',
    hijriStart: 1020,
    hijriEnd: 1095,
    categoryIds: ['cat-history', 'cat-fiqh'],
    chapters: [
      {
        id: 'ch-1', number: '1', title: 'The Ottoman Scholarly Network',
        description: 'How the Ottomans organized and supported Islamic learning.',
        sections: [
          {
            id: 'sec-1-1', number: '1.1', title: 'The Medrese System',
            content: [
              { type: 'paragraph', text: 'The Ottomans developed an elaborate system of scholarly education through the medrese network, which spread across the empire and produced generations of jurists, scholars, and administrators.' },
              { type: 'paragraph', text: 'At its height, this system connected scholars across an enormous geographic expanse, creating a shared intellectual culture that preserved and transmitted classical learning.' },
            ],
          },
        ],
      },
    ],
    introduction: [{ type: 'paragraph', text: 'The Ottoman era is often overlooked in the history of Islamic scholarship. This work argues for its central importance in preserving and transmitting the classical tradition.' }],
    featured: false,
    publishedYear: 'circa 1060 AH',
    popularity: 52,
    addedDate: '2024-04-10',
  },

  // ── 1101–1200 AH ─────────────────────────────────────────────────────────
  {
    id: 'book-return-to-sources',
    slug: 'return-to-sources',
    title: 'Return to the Sources',
    subtitle: 'The Reform Movement of the Twelfth Century',
    authorId: 'scholar-ibn-taymiyyah',
    description: 'An examination of the scholarly reform movements that arose in the twelfth century AH calling for a return to Quran and Sunnah.',
    longDescription: 'The twelfth century AH saw the emergence of powerful reform movements across the Islamic world. This work examines their arguments, methods, and lasting impact on Islamic thought.',
    coverColor: '#30201A',
    hijriStart: 1110,
    hijriEnd: 1190,
    categoryIds: ['cat-aqeedah', 'cat-thought'],
    chapters: [
      {
        id: 'ch-1', number: '1', title: 'The Reformist Vision',
        description: 'What the reformers sought and why.',
        sections: [
          {
            id: 'sec-1-1', number: '1.1', title: 'Critique of Innovation',
            content: [
              { type: 'paragraph', text: 'The reformers of the twelfth century were not hostile to scholarship — they were deeply learned in the tradition. Their critique was directed at specific innovations they believed had obscured the clarity of the original sources.' },
              { type: 'paragraph', text: 'Their call was simple in its essence: return to the Quran and authentic Sunnah as the primary sources of guidance, and evaluate later scholarship by that standard.' },
            ],
          },
        ],
      },
    ],
    introduction: [{ type: 'paragraph', text: 'The reform movements of the twelfth century AH transformed the landscape of Islamic thought and continue to shape debates in the Muslim world today.' }],
    featured: false,
    publishedYear: 'circa 1150 AH',
    popularity: 60,
    addedDate: '2024-04-11',
  },
  {
    id: 'book-pilgrimage-account',
    slug: 'pilgrimage-account',
    title: 'A Scholar\'s Pilgrimage',
    subtitle: 'Travel and Learning in the Twelfth Century',
    authorId: 'scholar-al-nawawi',
    description: 'A reflective account of scholarship, travel, and spiritual experience during the great age of Islamic pilgrimage routes.',
    longDescription: 'This work follows the journey of a scholar from the Maghrib to Mecca in the twelfth century, documenting the scholars encountered, the texts studied, and the spiritual insights gained along the way.',
    coverColor: '#1C302A',
    hijriStart: 1120,
    hijriEnd: 1185,
    categoryIds: ['cat-biography', 'cat-spirituality'],
    chapters: [
      {
        id: 'ch-1', number: '1', title: 'The Road to Mecca',
        description: 'Setting out on the great journey.',
        sections: [
          {
            id: 'sec-1-1', number: '1.1', title: 'Departure and Intention',
            content: [
              { type: 'paragraph', text: 'Every journey to Mecca begins long before the first step is taken. The preparation, the farewell, the purification of intention — all of these are part of the pilgrimage itself, and not merely its prelude.' },
              { type: 'paragraph', text: 'Our traveler set out with a small group of students, carrying a few essential books and a letter of introduction to scholars in Cairo, from whom he hoped to receive ijaza for the major Hadith collections.' },
            ],
          },
        ],
      },
    ],
    introduction: [{ type: 'paragraph', text: 'Travel in pursuit of knowledge was not merely a custom in the Islamic tradition — it was a religious duty. This account brings that tradition to life.' }],
    featured: false,
    publishedYear: 'circa 1155 AH',
    popularity: 58,
    addedDate: '2024-04-12',
  },

  // ── 1201–1300 AH ─────────────────────────────────────────────────────────
  {
    id: 'book-islamic-thought-modern',
    slug: 'islamic-thought-modern',
    title: 'Islamic Thought in the Modern Age',
    subtitle: 'Scholarship and the Challenge of Modernity',
    authorId: 'scholar-al-ghazali',
    description: 'An examination of how Islamic scholars responded to the intellectual and political challenges of the nineteenth century.',
    longDescription: 'The nineteenth century brought unprecedented challenges to the Islamic world. This work examines how scholars in different parts of the Muslim world engaged with these challenges while preserving the integrity of the tradition.',
    coverColor: '#1A202A',
    hijriStart: 1210,
    hijriEnd: 1290,
    categoryIds: ['cat-thought', 'cat-aqeedah'],
    chapters: [
      {
        id: 'ch-1', number: '1', title: 'The Encounter with Modernity',
        description: 'How the Islamic world met the modern age.',
        sections: [
          {
            id: 'sec-1-1', number: '1.1', title: 'The Colonial Context',
            content: [
              { type: 'paragraph', text: 'The nineteenth century saw most of the Islamic world come under European colonial domination. This created a profound crisis not only politically and economically, but intellectually and spiritually.' },
              { type: 'paragraph', text: 'Scholars were forced to ask difficult questions: What had led to this weakness? What was the relationship between Islamic teaching and the challenges of the modern world? How could the tradition speak to entirely new circumstances?' },
            ],
          },
        ],
      },
    ],
    introduction: [{ type: 'paragraph', text: 'The nineteenth century was a turning point for Islamic civilization. Understanding its intellectual history is essential for understanding the Muslim world today.' }],
    featured: false,
    publishedYear: 'circa 1260 AH',
    popularity: 65,
    addedDate: '2024-04-13',
  },
  {
    id: 'book-revival-movements',
    slug: 'revival-movements',
    title: 'Revival Movements in Islamic History',
    subtitle: 'From Ibn Idris to the Nineteenth Century',
    authorId: 'scholar-ibn-kathir',
    description: 'A comparative study of the major Islamic revival and reform movements from the eighteenth to nineteenth centuries.',
    longDescription: 'This work surveys the major figures and movements that sought to renew Islamic practice and thought across the Muslim world in the thirteenth century AH, from West Africa to Southeast Asia.',
    coverColor: '#2A1A20',
    hijriStart: 1220,
    hijriEnd: 1295,
    categoryIds: ['cat-history', 'cat-thought'],
    chapters: [
      {
        id: 'ch-1', number: '1', title: 'The Geography of Revival',
        description: 'Reform movements across the Islamic world.',
        sections: [
          {
            id: 'sec-1-1', number: '1.1', title: 'Common Themes',
            content: [
              { type: 'paragraph', text: 'Despite the enormous geographic diversity of these movements — from Sokoto to Sumatra, from Arabia to Central Asia — they shared a number of common themes: a return to primary sources, a critique of unexamined custom, and a concern for social and moral renewal.' },
              { type: 'paragraph', text: 'Each movement also reflected its particular context, responding to specific local conditions even as it drew on a shared tradition of Islamic scholarship.' },
            ],
          },
        ],
      },
    ],
    introduction: [{ type: 'paragraph', text: 'Revival is a constant thread in Islamic history. This work traces its most significant expressions in the century before the modern age.' }],
    featured: false,
    publishedYear: 'circa 1255 AH',
    popularity: 62,
    addedDate: '2024-04-14',
  },

  // ── 1301–1400 AH ─────────────────────────────────────────────────────────
  {
    id: 'book-contemporary-fiqh',
    slug: 'contemporary-fiqh',
    title: 'Contemporary Islamic Jurisprudence',
    subtitle: 'New Questions in the Modern Period',
    authorId: 'scholar-al-suyuti',
    description: 'An introduction to how Islamic jurisprudence addresses modern questions not directly covered in classical texts.',
    longDescription: 'This work examines the methodology that contemporary scholars use to derive Islamic legal rulings for questions that arose in the modern period, from medical ethics to financial transactions.',
    coverColor: '#203040',
    hijriStart: 1310,
    hijriEnd: 1390,
    categoryIds: ['cat-fiqh', 'cat-thought'],
    chapters: [
      {
        id: 'ch-1', number: '1', title: 'New Questions, Ancient Principles',
        description: 'How classical methodology meets modern problems.',
        sections: [
          {
            id: 'sec-1-1', number: '1.1', title: 'The Principle of Necessity',
            content: [
              { type: 'paragraph', text: 'Among the most important principles in addressing contemporary questions is the concept of necessity (darura). The Quran explicitly permits what is otherwise forbidden when genuine necessity demands it, and jurists have applied this principle carefully to new circumstances.' },
              { type: 'paragraph', text: 'Contemporary scholars have debated extensively where the line of genuine necessity lies, particularly in fields like medicine and finance where the stakes can be very high.' },
            ],
          },
        ],
      },
    ],
    introduction: [{ type: 'paragraph', text: 'Islamic law was never static. This work shows how its living methodology engages with the questions of every age.' }],
    featured: false,
    publishedYear: 'circa 1360 AH',
    popularity: 70,
    addedDate: '2024-04-15',
  },
  {
    id: 'book-islamic-education',
    slug: 'islamic-education',
    title: 'Islamic Education in the Modern World',
    subtitle: 'Tradition and Transformation',
    authorId: 'scholar-ibn-hajar',
    description: 'A study of Islamic educational institutions and methods in the twentieth century, examining how they adapted to modern conditions.',
    longDescription: 'This work examines the transformation of Islamic educational institutions — from traditional madrasa to modern university — in the fourteenth Hijri century, and the debates about curriculum, method, and purpose that accompanied this transformation.',
    coverColor: '#302030',
    hijriStart: 1320,
    hijriEnd: 1395,
    categoryIds: ['cat-history', 'cat-ethics'],
    chapters: [
      {
        id: 'ch-1', number: '1', title: 'The Madrasa in Crisis',
        description: 'Traditional Islamic education faces new pressures.',
        sections: [
          {
            id: 'sec-1-1', number: '1.1', title: 'Colonial Impact on Education',
            content: [
              { type: 'paragraph', text: 'The introduction of modern state education systems under colonial rule created a two-track educational system in many Muslim countries: a modern track for the new professions, and a traditional track for religious study.' },
              { type: 'paragraph', text: 'This division had profound consequences for the intellectual life of Muslim communities, separating religious knowledge from engagement with modern disciplines and creating a tension that persists to this day.' },
            ],
          },
        ],
      },
    ],
    introduction: [{ type: 'paragraph', text: 'The story of Islamic education in the modern world is a story of crisis and adaptation, of loss and resilience. This work tells that story with care and nuance.' }],
    featured: false,
    publishedYear: 'circa 1365 AH',
    popularity: 67,
    addedDate: '2024-04-16',
  },

  // ── 1401–1448 AH ─────────────────────────────────────────────────────────
  {
    id: 'book-digital-age-scholarship',
    slug: 'digital-age-scholarship',
    title: 'Scholarship in the Digital Age',
    subtitle: 'Islamic Learning in the Twenty-First Century',
    authorId: 'scholar-al-nawawi',
    description: 'A reflection on how Islamic scholarship adapts to the opportunities and challenges of the digital era.',
    longDescription: 'This work examines how the internet, digital libraries, and new media have transformed the transmission and accessibility of Islamic knowledge, and what this means for the tradition going forward.',
    coverColor: '#1A2830',
    hijriStart: 1420,
    hijriEnd: 1445,
    categoryIds: ['cat-thought', 'cat-ethics'],
    chapters: [
      {
        id: 'ch-1', number: '1', title: 'Knowledge Without Boundaries',
        description: 'How digital technology has changed access to Islamic learning.',
        sections: [
          {
            id: 'sec-1-1', number: '1.1', title: 'The Democratization of Texts',
            content: [
              { type: 'paragraph', text: 'For most of Islamic history, access to classical texts required either extraordinary personal libraries or residence near major scholarly centers. The digital revolution has changed this entirely — virtually the entire classical corpus is now accessible to anyone with an internet connection.' },
              { type: 'paragraph', text: 'This democratization of access has both extraordinary benefits and significant risks. The benefit is obvious; the risk lies in the separation of texts from the scholarly tradition of interpretation that has always accompanied them.' },
            ],
          },
        ],
      },
    ],
    introduction: [{ type: 'paragraph', text: 'Digital technology is the most significant change in the transmission of Islamic knowledge since the printing press. This work asks what it means for the tradition.' }],
    featured: false,
    publishedYear: 'circa 1430 AH',
    popularity: 75,
    addedDate: '2024-04-17',
  },
  {
    id: 'book-global-ummah',
    slug: 'global-ummah',
    title: 'The Global Ummah',
    subtitle: 'Islam in the Contemporary World',
    authorId: 'scholar-ibn-taymiyyah',
    description: 'A survey of the diverse forms of Islamic practice, scholarship, and community life across the world in the contemporary period.',
    longDescription: 'This work surveys the remarkable diversity of Islamic expression in the contemporary period, from traditional scholarly centers to diaspora communities, examining what unites the global Muslim community across its differences.',
    coverColor: '#203020',
    hijriStart: 1415,
    hijriEnd: 1448,
    categoryIds: ['cat-history', 'cat-thought'],
    chapters: [
      {
        id: 'ch-1', number: '1', title: 'Unity in Diversity',
        description: 'What holds the global Muslim community together.',
        sections: [
          {
            id: 'sec-1-1', number: '1.1', title: 'The Sources of Unity',
            content: [
              { type: 'paragraph', text: 'Despite the enormous diversity of the global Muslim community — in language, culture, practice, and interpretation — certain things remain constant: the Quran, the direction of prayer, the obligations of Ramadan and Hajj, and the deep sense of connection to a shared history and identity.' },
              { type: 'paragraph', text: 'This work argues that this unity is not merely formal but substantive — rooted in a shared scripture, a shared Prophet, and a shared vision of what it means to live according to the will of God.' },
            ],
          },
        ],
      },
    ],
    introduction: [{ type: 'paragraph', text: 'The global Muslim community is more diverse than ever before. This work asks what holds it together and what that unity means for its future.' }],
    featured: false,
    publishedYear: 'circa 1435 AH',
    popularity: 73,
    addedDate: '2024-04-18',
  },
];

export function getBookBySlug(slug: string): Book | undefined {
  return books.find((b) => b.slug === slug);
}

export function getBooksByAuthor(authorId: string): Book[] {
  return books.filter((b) => b.authorId === authorId);
}

export function getFeaturedBooks(): Book[] {
  return books.filter((b) => b.featured);
}

export function getBooksByPeriod(periodId: string): Book[] {
  return books.filter((b) => {
    const bookRange = `${b.hijriStart}-${b.hijriEnd}`;
    return bookRange === periodId;
  });
}

export function getBooksByCategory(categorySlug: string): Book[] {
  return books.filter((b) =>
    b.categoryIds.some((catId) => catId.includes(categorySlug))
  );
}

export function countAllSections(book: Book): number {
  let count = 0;
  for (const chapter of book.chapters) {
    for (const section of chapter.sections) {
      count++;
      if (section.subsections) {
        count += section.subsections.length;
      }
    }
  }
  return count;
}

export function estimateReadingTime(book: Book): string {
  let wordCount = 0;
  const countWords = (text: string) => text.split(/\s+/).length;

  if (book.introduction) {
    for (const block of book.introduction) {
      if (block.type === 'paragraph' || block.type === 'quote' || block.type === 'heading') {
        wordCount += countWords(block.text);
      } else if (block.type === 'list') {
        block.items.forEach((item) => (wordCount += countWords(item)));
      }
    }
  }

  for (const chapter of book.chapters) {
    if (chapter.description) wordCount += countWords(chapter.description);
    for (const section of chapter.sections) {
      if (section.content) {
        for (const block of section.content) {
          if (block.type === 'paragraph' || block.type === 'quote' || block.type === 'heading') {
            wordCount += countWords(block.text);
          } else if (block.type === 'list') {
            block.items.forEach((item) => (wordCount += countWords(item)));
          }
        }
      }
      if (section.subsections) {
        for (const sub of section.subsections) {
          if (sub.content) {
            for (const block of sub.content) {
              if (block.type === 'paragraph' || block.type === 'quote' || block.type === 'heading') {
                wordCount += countWords(block.text);
              } else if (block.type === 'list') {
                block.items.forEach((item) => (wordCount += countWords(item)));
              }
            }
          }
        }
      }
    }
  }

  const minutes = Math.ceil(wordCount / 200);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}
