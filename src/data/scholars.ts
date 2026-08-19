import type { Scholar } from '@/types';

export const scholars: Scholar[] = [
  {
    id: 'scholar-ibn-kathir',
    slug: 'ibn-kathir',
    name: 'Ibn Kathir',
    fullName: 'Imad al-Din Ismail ibn Umar ibn Kathir',
    bornHijri: 701,
    diedHijri: 774,
    bornPlace: 'Busra, Greater Syria',
    shortBio: 'A renowned historian, mufassir, and muhaddith of the 8th century AH.',
    fullBio:
      'Ibn Kathir was a scholar of the Shafi‘i school, known for his monumental works in history and Qur’anic exegesis. He studied under prominent scholars including Ibn Taymiyyah and al-Mizzi, and became one of the leading authorities of his era in Hadith and Tafsir. His historical work remains among the most widely referenced accounts of early Islamic history.',
    categories: ['cat-tafsir', 'cat-hadith', 'cat-history'],
    imageUrl:
      'https://learningmole.com/wp-content/uploads/2022/12/al-biruni.jpg',
    timelineEvents: [
      { year: 701, label: 'Birth', description: 'Born in Busra, Greater Syria.' },
      { year: 706, label: 'Moved to Damascus', description: 'Relocated to Damascus after his father’s death to pursue studies.' },
      { year: 740, label: 'Major Works Begin', description: 'Began composing his major works in Tafsir and history.' },
      { year: 774, label: 'Death', description: 'Passed away in Damascus.' },
    ],
  },
  {
    id: 'scholar-al-ghazali',
    slug: 'al-ghazali',
    name: 'Al-Ghazali',
    fullName: 'Abu Hamid Muhammad ibn Muhammad al-Ghazali',
    bornHijri: 450,
    diedHijri: 505,
    bornPlace: 'Tus, Persia',
    shortBio: 'A theologian, jurist, and mystic whose works shaped Islamic thought for centuries.',
    fullBio:
      'Al-Ghazali was a polymath whose writings bridged jurisprudence, theology, and spirituality. He served as head of the Nizamiyya school in Baghdad before a spiritual crisis led him to a decade of seclusion, travel, and writing. His magnum opus on the revival of the religious sciences became one of the most influential works in the Islamic intellectual tradition.',
    categories: ['cat-fiqh', 'cat-spirituality', 'cat-thought', 'cat-ethics'],
    imageUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-y5ye4hU5-Nm3wXhl7wcG5cbWQMHd2lOlUWKpBOxpYq3U21uE4forzPUY&s=10',
    timelineEvents: [
      { year: 450, label: 'Birth', description: 'Born in Tus, Persia.' },
      { year: 484, label: 'Professor at Nizamiyya', description: 'Appointed head of the prestigious Nizamiyya school in Baghdad.' },
      { year: 488, label: 'Spiritual Crisis', description: 'Left his post and entered a period of seclusion and spiritual seeking.' },
      { year: 505, label: 'Death', description: 'Died in his hometown of Tus.' },
    ],
  },
  {
    id: 'scholar-al-nawawi',
    slug: 'al-nawawi',
    name: 'Al-Nawawi',
    fullName: 'Yahya ibn Sharaf al-Nawawi',
    bornHijri: 631,
    diedHijri: 676,
    bornPlace: 'Nawa, Syria',
    shortBio: 'A master of Shafi‘i jurisprudence and Hadith, known for his devotion and precision.',
    fullBio:
      'Al-Nawawi was among the most celebrated scholars of Hadith and Shafi‘i law. Despite a relatively short life, he produced a remarkable body of concise, authoritative works that remain essential references for students and scholars. He was known for his asceticism, discipline, and unwavering commitment to scholarship.',
    categories: ['cat-hadith', 'cat-fiqh', 'cat-ethics', 'cat-spirituality'],
    imageUrl:
      'https://learningmole.com/wp-content/uploads/2022/12/al-biruni.jpg',
    timelineEvents: [
      { year: 631, label: 'Birth', description: 'Born in Nawa, a town in southern Syria.' },
      { year: 644, label: 'Studies in Damascus', description: 'Moved to Damascus to study at the ArRawahiyya school.' },
      { year: 660, label: 'Major Works', description: 'Composed his renowned compilations of Hadith and jurisprudence.' },
      { year: 676, label: 'Death', description: 'Died in Nawa at the age of 45.' },
    ],
  },
  {
    id: 'scholar-ibn-hajar',
    slug: 'ibn-hajar-al-asqalani',
    name: 'Ibn Hajar al-Asqalani',
    fullName: 'Ahmad ibn Ali ibn Hajar al-Asqalani',
    bornHijri: 773,
    diedHijri: 852,
    bornPlace: 'Cairo, Egypt',
    shortBio: 'The leading Hadith scholar of his era and author of the celebrated commentary on Sahih al-Bukhari.',
    fullBio:
      'Ibn Hajar al-Asqalani was a Shafi‘i jurist and the greatest Hadith master of the 9th century AH. His commentary on Sahih al-Bukhari is considered one of the most important works in Hadith literature. He served as chief judge (Qadi) of Egypt and taught thousands of students, leaving a lasting mark on the Hadith sciences.',
    categories: ['cat-hadith', 'cat-fiqh', 'cat-history'],
    imageUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-y5ye4hU5-Nm3wXhl7wcG5cbWQMHd2lOlUWKpBOxpYq3U21uE4forzPUY&s=10',
    timelineEvents: [
      { year: 773, label: 'Birth', description: 'Born in Cairo, Egypt.' },
      { year: 800, label: 'Studies in Hadith', description: 'Traveled extensively in pursuit of Hadith across the Islamic world.' },
      { year: 830, label: 'Chief Judge', description: 'Appointed as chief Qadi of Egypt.' },
      { year: 852, label: 'Death', description: 'Died in Cairo after a life of extraordinary scholarship.' },
    ],
  },
  {
    id: 'scholar-ibn-taymiyyah',
    slug: 'ibn-taymiyyah',
    name: 'Ibn Taymiyyah',
    fullName: 'Taqi al-Din Ahmad ibn Taymiyyah',
    bornHijri: 661,
    diedHijri: 728,
    bornPlace: 'Harran, Mesopotamia',
    shortBio: 'A prolific jurist, theologian, and reformer of the 7th–8th century AH.',
    fullBio:
      'Ibn Taymiyyah was a Hanbali jurist and theologian whose extensive writings addressed jurisprudence, theology, logic, and polemics. He was known for his rigorous engagement with primary sources and his critiques of later developments he considered departures from the teachings of the early generations. His works continue to be widely studied.',
    categories: ['cat-fiqh', 'cat-aqeedah', 'cat-thought'],
    imageUrl:
      'https://learningmole.com/wp-content/uploads/2022/12/al-biruni.jpg',
    timelineEvents: [
      { year: 661, label: 'Birth', description: 'Born in Harran; his family fled to Damascus during the Mongol invasions.' },
      { year: 682, label: 'Teaching Begins', description: 'Began teaching and issuing legal opinions at a young age.' },
      { year: 710, label: 'Prolific Writing', description: 'Produced major theological and legal works.' },
      { year: 728, label: 'Death', description: 'Died while imprisoned in Damascus.' },
    ],
  },
  {
    id: 'scholar-al-suyuti',
    slug: 'al-suyuti',
    name: 'Al-Suyuti',
    fullName: 'Jalal al-Din al-Suyuti',
    bornHijri: 849,
    diedHijri: 911,
    bornPlace: 'Cairo, Egypt',
    shortBio: 'A prolific polymath of the 9th century AH, excelling in Tafsir, Hadith, and history.',
    fullBio:
      'Al-Suyuti was one of the most prolific authors in Islamic history, writing on nearly every discipline of his time — Tafsir, Hadith, jurisprudence, history, grammar, and medicine. He claimed to have authored over 500 works. His Tafsir, co-authored with Jalal al-Din al-Mahalli, remains one of the most widely read commentaries on the Qur’an.',
    categories: ['cat-tafsir', 'cat-hadith', 'cat-fiqh', 'cat-history'],
    imageUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-y5ye4hU5-Nm3wXhl7wcG5cbWQMHd2lOlUWKpBOxpYq3U21uE4forzPUY&s=10',
    timelineEvents: [
      { year: 849, label: 'Birth', description: 'Born in Cairo, Egypt.' },
      { year: 870, label: 'Teaching', description: 'Began teaching at prominent institutions in Cairo.' },
      { year: 895, label: 'Seclusion for Writing', description: 'Withdrew from public posts to dedicate himself to writing.' },
      { year: 911, label: 'Death', description: 'Died in Cairo, leaving an enormous literary legacy.' },
    ],
  },
];

export function getScholarBySlug(slug: string): Scholar | undefined {
  return scholars.find((s) => s.slug === slug);
}

export function getScholarById(id: string): Scholar | undefined {
  return scholars.find((s) => s.id === id);
}
