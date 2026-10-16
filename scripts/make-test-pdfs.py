"""
Generate realistic sample book PDFs for the PDF → book conversion tests.

Each book mimics layouts that broke chapter detection:
title page, contents page with dot leaders, running headers + page numbers,
two-line chapter headings, numbered sections, numbered lists, superscript
footnote markers with footnotes at the page bottom, hyphenated line ends,
ALL-CAPS source lines and right-to-left Arabic lines.

Usage:  python scripts/make-test-pdfs.py   (needs PyMuPDF: pip install pymupdf)
Output: src/services/pdf/__fixtures__/*.pdf
"""
import os
import pymupdf as fitz

OUT = os.path.join(os.path.dirname(__file__), '..', 'src', 'services', 'pdf', '__fixtures__')
ARABIC_FONT = 'C:/Windows/Fonts/arial.ttf'

W, H = 432, 648          # 6x9in book page
LEFT, RIGHT = 54, W - 54
TOP, BOTTOM = 72, H - 80
BODY = 11
LEAD = 15


class Book:
    def __init__(self, running_header):
        self.doc = fitz.open()
        self.running = running_header
        self.page = None
        self.y = TOP
        self.footnotes = []
        self.page_no = 0

    # ── page handling ──────────────────────────────────────────────────────
    def new_page(self, header=True):
        self.finish_page()
        self.page = self.doc.new_page(width=W, height=H)
        self.page_no += 1
        self.y = TOP
        self.has_header = header
        if header and self.running:
            hdr = self.running if self.page_no % 2 else self.running_right
            self.page.insert_text((LEFT, 44), hdr.upper(), fontname='helv', fontsize=8)
        return self.page

    def finish_page(self):
        if self.page is None:
            return
        fy = BOTTOM + 8
        if self.footnotes:
            self.page.draw_line((LEFT, fy - 6), (LEFT + 80, fy - 6), width=0.5)
            for num, text in self.footnotes:
                self.page.insert_text((LEFT, fy + 4), str(num), fontname='helv', fontsize=6)
                self.page.insert_text((LEFT + 6, fy + 7), text, fontname='helv', fontsize=8)
                fy += 11
            self.footnotes = []
        if self.has_header:
            num = str(self.page_no)
            tw = fitz.get_text_length(num, 'helv', 9)
            self.page.insert_text(((W - tw) / 2, H - 36), num, fontname='helv', fontsize=9)

    def ensure(self, need):
        limit = BOTTOM - 14 * (len(self.footnotes) + 1)
        if self.y + need > limit:
            self.new_page()

    # ── text helpers ───────────────────────────────────────────────────────
    def heading(self, text, size, bold=True, center=False, space_before=18, space_after=10):
        self.ensure(size * 2 + space_before)
        self.y += space_before
        font = 'hebo' if bold else 'helv'
        x = LEFT
        if center:
            x = (W - fitz.get_text_length(text, font, size)) / 2
        self.page.insert_text((x, self.y), text, fontname=font, fontsize=size)
        self.y += size + space_after - 10

    def paragraph(self, text, indent=True, footnote=None, size=BODY, lead=LEAD, left=LEFT):
        """Word-wrap `text`; '¹' marks where the footnote marker goes."""
        words = text.split(' ')
        lines, cur = [], ''
        width = RIGHT - left
        first = True
        for w in words:
            avail = width - (18 if first and indent else 0)
            trial = (cur + ' ' + w).strip()
            if fitz.get_text_length(trial.replace('¹', ''), 'helv', size) > avail and cur:
                # hyphenate long words at line end occasionally
                if len(w) > 9 and w.isalpha():
                    head, tail = w[: len(w) // 2], w[len(w) // 2 :]
                    if fitz.get_text_length((cur + ' ' + head + '-'), 'helv', size) <= avail:
                        lines.append((cur + ' ' + head + '-', first))
                        cur, first = tail, False
                        continue
                lines.append((cur, first))
                cur, first = w, False
            else:
                cur = trial
        if cur:
            lines.append((cur, first))

        self.y += 4
        for line, is_first in lines:
            self.ensure(lead)
            x = left + (18 if is_first and indent else 0)
            if '¹' in line and footnote:
                before, after = line.split('¹', 1)
                self.page.insert_text((x, self.y), before, fontname='helv', fontsize=size)
                x += fitz.get_text_length(before, 'helv', size)
                n = len(self.footnotes) + 1
                self.page.insert_text((x + 0.5, self.y - 4), str(n), fontname='helv', fontsize=6.5)
                x += fitz.get_text_length(str(n), 'helv', 6.5) + 1
                self.page.insert_text((x, self.y), after, fontname='helv', fontsize=size)
                self.footnotes.append((n, footnote))
            else:
                self.page.insert_text((x, self.y), line, fontname='helv', fontsize=size)
            self.y += lead
        self.y += 2

    def arabic(self, words):
        """Right-to-left line: words placed from the right margin leftwards (visual order)."""
        self.ensure(26)
        self.y += 10
        x = RIGHT
        for w in words:
            tw = len(w) * 7.5
            x -= tw
            # PDFs store Arabic glyphs in visual (reversed) order; PDF.js restores logical order
            self.page.insert_text((x, self.y), w[::-1], fontname='arab', fontfile=ARABIC_FONT, fontsize=14)
            x -= 6
        self.y += 16

    def toc(self, entries):
        self.heading('Contents', 18, center=True, space_before=10, space_after=18)
        for title, page, level in entries:
            x = LEFT + (16 if level > 1 else 0)
            num = str(page)
            nw = fitz.get_text_length(num, 'helv', BODY)
            tw = fitz.get_text_length(title, 'helv', BODY)
            dots = ''
            while fitz.get_text_length(dots + ' .', 'helv', BODY) < (RIGHT - nw - 6) - (x + tw + 6):
                dots += ' .'
            self.page.insert_text((x, self.y), title, fontname='helv', fontsize=BODY)
            self.page.insert_text((x + tw + 4, self.y), dots, fontname='helv', fontsize=BODY)
            self.page.insert_text((RIGHT - nw, self.y), num, fontname='helv', fontsize=BODY)
            self.y += LEAD + 2

    def save(self, name):
        self.finish_page()
        os.makedirs(OUT, exist_ok=True)
        self.doc.save(os.path.join(OUT, name))


LOREM = [
    'The scholars of this nation have agreed that seeking knowledge is an obligation upon every Muslim, and that '
    'the foundation of all knowledge is the knowledge of Allah, His names and His attributes.',
    'Whoever reflects upon the condition of the early generations will find that they were the most eager of people '
    'in following the Sunnah and the furthest of people from innovations in the religion.',
    'It is therefore necessary for the student to begin with the most important matters, then those which follow '
    'them in importance, without neglecting the etiquette of learning and acting upon what he learns.',
    'This is the methodology that the righteous predecessors followed, and it is the methodology of the people of '
    'the Sunnah in every era, as the author explains in detail in the following pages of this treatise.',
]


def para(i, extra=''):
    return (LOREM[i % len(LOREM)] + ' ' + extra).strip()


def book_numbered_chapters():
    b = Book('The Foundations of Faith')
    b.running_right = 'Shaykh Abdullah ibn Ahmad'
    # Title page (no header)
    b.new_page(header=False)
    b.y = 220
    b.heading('The Foundations of Faith', 24, center=True)
    b.heading('Explained for the Beginner', 14, bold=False, center=True, space_before=8)
    b.heading('Shaykh Abdullah ibn Ahmad', 12, bold=False, center=True, space_before=60)

    b.new_page(header=False)
    b.toc([
        ('Introduction', 3, 1),
        ('Chapter 1: The Pillars of Faith', 4, 1),
        ('1.1 Belief in Allah', 4, 2),
        ('1.2 Belief in the Angels', 5, 2),
        ('Chapter 2: The Pillars of Islam', 6, 1),
        ('2.1 The Prayer', 6, 2),
        ('2.2 The Fast', 7, 2),
        ('Conclusion', 8, 1),
    ])

    b.new_page()
    b.heading('Introduction', 18, center=True, space_before=10)
    b.paragraph(para(0, 'All praise is due to Allah, the Lord of the worlds.'))
    b.paragraph(para(1))
    b.paragraph('The Messenger of Allah said: "Seeking knowledge is an obligation upon every Muslim."¹ This '
                'narration has been graded authentic by the scholars.', footnote='Ibn Majah, no. 224.')
    b.paragraph(para(2))

    b.new_page()
    b.heading('Chapter 1', 18, center=True, space_before=10, space_after=6)
    b.heading('The Pillars of Faith', 16, center=True, space_before=4)
    b.paragraph(para(3, 'Faith consists of belief in the heart, statement upon the tongue and action of the limbs.'))
    b.heading('1.1 Belief in Allah', 13)
    b.paragraph(para(0, 'Belief in Allah includes four matters, which the scholars have listed as follows:'))
    b.paragraph('1. Belief in His existence, which is established by the natural disposition and by reason.', indent=False)
    b.paragraph('2. Belief in His lordship, that He alone is the Creator, the Sovereign and the Disposer of affairs.', indent=False)
    b.paragraph('3. Belief in His sole right to be worshipped, without any partner.', indent=False)
    b.arabic(['قل', 'هو', 'الله', 'أحد'])
    b.paragraph('"Say: He is Allah, the One." (Qur\'an 112:1)', indent=False)
    b.heading('1.2 Belief in the Angels', 13)
    b.paragraph(para(1, 'The angels are a creation of Allah, created from light, and they do not disobey Him.¹'),
                footnote='Sahih Muslim, no. 2996.')
    b.paragraph('SAHIH AL-BUKHARI', indent=False)
    b.paragraph(para(2, 'Among them is Jibril, who is entrusted with the revelation, and Mika\'il, who is entrusted with the rain.'))
    b.paragraph(para(3))

    b.new_page()
    b.heading('Chapter 2', 18, center=True, space_before=10, space_after=6)
    b.heading('The Pillars of Islam', 16, center=True, space_before=4)
    b.paragraph(para(2, 'Islam is built upon five pillars, as reported in the well-known narration of Ibn \'Umar.'))
    b.heading('2.1 The Prayer', 13)
    b.paragraph(para(0, 'The prayer is the second pillar of Islam and the first matter for which the servant will be held to account.'))
    b.paragraph(para(1))
    b.heading('2.2 The Fast', 13)
    b.paragraph(para(3, 'Fasting the month of Ramadan is obligatory upon every adult, sane Muslim who is able to fast.'))
    b.paragraph(para(2))

    b.new_page()
    b.heading('Conclusion', 18, center=True, space_before=10)
    b.paragraph(para(1, 'We ask Allah to make this treatise beneficial for whoever reads it.'))
    b.save('numbered-chapters.pdf')


def book_titled_chapters():
    """Chapters are only larger-font titles ("The Book of Purification"), no "Chapter N"."""
    b = Book('Selected Rulings')
    b.running_right = 'Selected Rulings'
    b.new_page(header=False)
    b.y = 220
    b.heading('Selected Rulings of Worship', 22, center=True)
    b.heading('Translated with notes', 12, bold=False, center=True, space_before=10)

    b.new_page()
    b.heading('The Book of Purification', 18, space_before=10)
    b.paragraph(para(0, 'Purification is the key to the prayer and half of faith.'))
    b.heading('Water and its Types', 13)
    b.paragraph(para(1, 'Water is of two types: pure water that purifies, and impure water.'))
    b.paragraph(para(2))
    b.heading('The Description of Ablution', 13)
    b.paragraph(para(3, 'The ablution begins with the intention, then saying the name of Allah, then washing the hands three times.'))
    b.paragraph(para(0))
    b.paragraph(para(1))

    b.new_page()
    b.heading('The Book of Prayer', 18, space_before=10)
    b.paragraph(para(2, 'The prayer is obligatory five times in the day and night.'))
    b.heading('The Times of Prayer', 13)
    b.paragraph(para(3))
    b.paragraph(para(0))
    b.heading('The Conditions of Prayer', 13)
    b.paragraph(para(1, 'Among the conditions of the prayer are purification, covering the private parts and facing the qiblah.'))
    b.save('titled-chapters.pdf')


def book_no_contents():
    """No contents page; "CHAPTER ONE" word numbering, hadith-style "Chapter: …" baabs, ALL-CAPS sources."""
    b = Book('Forty Hadith on Character')
    b.running_right = 'Imam an-Nawawi'
    b.new_page(header=False)
    b.y = 220
    b.heading('Forty Hadith on Character', 22, center=True)

    for num, word, title, baabs in [
        (1, 'ONE', 'Truthfulness', ['What has come regarding truthfulness', 'The reward of the truthful']),
        (2, 'TWO', 'Patience', ['Patience at the first strike', 'The patience of the Prophets']),
    ]:
        b.new_page()
        b.heading(f'CHAPTER {word}', 16, center=True, space_before=10, space_after=6)
        b.heading(title, 18, center=True, space_before=4)
        b.paragraph(para(num, f'This chapter gathers narrations about {title.lower()}.'))
        for baab in baabs:
            b.heading(f'Chapter: {baab}', 12)
            b.paragraph('Narrated Abu Hurairah: The Prophet said: "Truthfulness leads to righteousness, and '
                        'righteousness leads to Paradise."', indent=False)
            b.paragraph('SAHIH AL-BUKHARI', indent=False)
            b.paragraph(para(num + 1))
            b.paragraph('1. The first benefit of this narration is that it encourages the believer, and it '
                        'shows the virtue of the deed mentioned.', indent=False)
            b.paragraph('2. The second benefit is that the reward is from Allah alone.', indent=False)
    b.save('no-contents.pdf')


if __name__ == '__main__':
    book_numbered_chapters()
    book_titled_chapters()
    book_no_contents()
    print('written to', os.path.abspath(OUT))
