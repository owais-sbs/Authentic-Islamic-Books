import type { HijriPeriod } from '@/types';

export const hijriPeriods: HijriPeriod[] = [
  {
    id: '100-200',
    start: 100,
    end: 200,
    label: '100–200 AH',
    description: 'The era of the early Tabi‘un and the formation of the major schools of thought.',
  },
  {
    id: '201-300',
    start: 201,
    end: 300,
    label: '201–300 AH',
    description: 'The golden age of Hadith compilation and the codification of Islamic sciences.',
  },
  {
    id: '301-400',
    start: 301,
    end: 400,
    label: '301–400 AH',
    description: 'Expansion of jurisprudence and the rise of major reference works.',
  },
  {
    id: '401-500',
    start: 401,
    end: 500,
    label: '401–500 AH',
    description: 'A period of systematic theology and encyclopedic scholarship.',
  },
  {
    id: '501-600',
    start: 501,
    end: 600,
    label: '501–600 AH',
    description: 'The flourishing of spiritual writing and comparative jurisprudence.',
  },
  {
    id: '601-700',
    start: 601,
    end: 700,
    label: '601–700 AH',
    description: 'An age of synthesis — scholars systematizing earlier works into accessible forms.',
  },
  {
    id: '701-800',
    start: 701,
    end: 800,
    label: '701–800 AH',
    description: 'The encyclopedic era — comprehensive reference works across disciplines.',
  },
  {
    id: '801-900',
    start: 801,
    end: 900,
    label: '801–900 AH',
    description: 'A period of careful commentary and preservation of the classical heritage.',
  },
  {
    id: '901-1000',
    start: 901,
    end: 1000,
    label: '901–1000 AH',
    description: 'The consolidation of legal schools and the rise of late classical scholarship.',
  },
  {
    id: '1001-1100',
    start: 1001,
    end: 1100,
    label: '1001–1100 AH',
    description: 'Renewed attention to Hadith sciences and theological clarity.',
  },
  {
    id: '1101-1200',
    start: 1101,
    end: 1200,
    label: '1101–1200 AH',
    description: 'A reformist spirit emerges — calls to return to primary sources.',
  },
  {
    id: '1201-1300',
    start: 1201,
    end: 1300,
    label: '1201–1300 AH',
    description: 'Scholarly revival and the early beginnings of modern Islamic thought.',
  },
  {
    id: '1301-1400',
    start: 1301,
    end: 1400,
    label: '1301–1400 AH',
    description: 'The modern period — scholarship confronts new intellectual and social challenges.',
  },
  {
    id: '1401-1448',
    start: 1401,
    end: 1448,
    label: '1401–1448 AH',
    description: 'Contemporary scholarship in a globally connected age.',
  },
];

export function getPeriodByRange(start: number, end: number): HijriPeriod | undefined {
  return hijriPeriods.find((p) => p.start <= start && p.end >= end);
}

export function getPeriodForHijriYear(year: number): HijriPeriod | undefined {
  return hijriPeriods.find((p) => year >= p.start && year <= p.end);
}

export function getPeriodById(id: string): HijriPeriod | undefined {
  return hijriPeriods.find((p) => p.id === id);
}

export function formatHijriRange(start: number, end: number): string {
  return `${start}–${end} AH`;
}
