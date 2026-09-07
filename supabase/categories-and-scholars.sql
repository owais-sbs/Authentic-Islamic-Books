-- ═══════════════════════════════════════════════════════════════════════════
-- CATEGORIES & SCHOLARS TABLES SETUP FOR SUPABASE
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id          TEXT PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create Scholars Table
CREATE TABLE IF NOT EXISTS scholars (
  id              TEXT PRIMARY KEY,
  slug            TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  full_name       TEXT,
  born_hijri      INTEGER,
  died_hijri      INTEGER,
  born_place      TEXT,
  short_bio       TEXT,
  full_bio        TEXT,
  categories      TEXT[] NOT NULL DEFAULT '{}',
  image_url       TEXT,
  timeline_events JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholars ENABLE ROW LEVEL SECURITY;

-- Select policies (Public read access)
DROP POLICY IF EXISTS "categories_select_public" ON categories;
CREATE POLICY "categories_select_public" ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "scholars_select_public" ON scholars;
CREATE POLICY "scholars_select_public" ON scholars FOR SELECT USING (true);

-- Insert/Update/Delete policies (Public & Auth full access for admin management)
DROP POLICY IF EXISTS "categories_all_access" ON categories;
CREATE POLICY "categories_all_access" ON categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "scholars_all_access" ON scholars;
CREATE POLICY "scholars_all_access" ON scholars FOR ALL USING (true) WITH CHECK (true);

-- 3. Seed Default Categories
INSERT INTO categories (id, slug, name, description) VALUES
  ('cat-aqeedah', 'aqeedah', 'Aqeedah', 'Theological foundations and creed — the study of beliefs and doctrine in Islam.'),
  ('cat-hadith', 'hadith', 'Hadith', 'Prophetic traditions, their collection, authentication, and sciences.'),
  ('cat-tafsir', 'tafsir', 'Tafsir', 'Exegesis and commentary on the meanings of the Qur’an.'),
  ('cat-fiqh', 'fiqh', 'Fiqh', 'Jurisprudence — the practical application of Islamic law to worship and conduct.'),
  ('cat-seerah', 'seerah', 'Seerah', 'The life and biography of the Prophet Muhammad ﷺ.'),
  ('cat-history', 'history', 'History', 'Historical accounts of Islamic civilization, caliphates, and societies.'),
  ('cat-ethics', 'ethics', 'Ethics', 'Moral character, virtues, and ethical conduct in daily life.'),
  ('cat-spirituality', 'spirituality', 'Spirituality', 'Inner purification, devotion, and the spiritual dimensions of faith.'),
  ('cat-thought', 'islamic-thought', 'Islamic Thought', 'Philosophy, theology, and intellectual traditions within Islamic scholarship.'),
  ('cat-biography', 'biography', 'Biography', 'Lives of scholars, companions, and notable figures in Islamic history.')
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Default Scholars
INSERT INTO scholars (id, slug, name, full_name, born_hijri, died_hijri, born_place, short_bio, full_bio, categories, image_url, timeline_events) VALUES
  (
    'scholar-ibn-kathir',
    'ibn-kathir',
    'Ibn Kathir',
    'Imad al-Din Ismail ibn Umar ibn Kathir',
    701, 774,
    'Busra, Greater Syria',
    'A renowned historian, mufassir, and muhaddith of the 8th century AH.',
    'Ibn Kathir was a scholar of the Shafi‘i school, known for his monumental works in history and Qur’anic exegesis. He studied under prominent scholars including Ibn Taymiyyah and al-Mizzi, and became one of the leading authorities of his era in Hadith and Tafsir.',
    ARRAY['cat-tafsir', 'cat-hadith', 'cat-history'],
    'https://learningmole.com/wp-content/uploads/2022/12/al-biruni.jpg',
    '[{"year": 701, "label": "Birth", "description": "Born in Busra, Greater Syria."}, {"year": 774, "label": "Death", "description": "Passed away in Damascus."}]'::jsonb
  ),
  (
    'scholar-al-ghazali',
    'al-ghazali',
    'Al-Ghazali',
    'Abu Hamid Muhammad ibn Muhammad al-Ghazali',
    450, 505,
    'Tus, Persia',
    'A theologian, jurist, and mystic whose works shaped Islamic thought for centuries.',
    'Al-Ghazali was a polymath whose writings bridged jurisprudence, theology, and spirituality. He served as head of the Nizamiyya school in Baghdad before a spiritual crisis led him to a decade of seclusion.',
    ARRAY['cat-fiqh', 'cat-spirituality', 'cat-thought', 'cat-ethics'],
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-y5ye4hU5-Nm3wXhl7wcG5cbWQMHd2lOlUWKpBOxpYq3U21uE4forzPUY&s=10',
    '[{"year": 450, "label": "Birth", "description": "Born in Tus, Persia."}, {"year": 505, "label": "Death", "description": "Died in Tus."}]'::jsonb
  ),
  (
    'scholar-al-nawawi',
    'al-nawawi',
    'Al-Nawawi',
    'Yahya ibn Sharaf al-Nawawi',
    631, 676,
    'Nawa, Syria',
    'A master of Shafi‘i jurisprudence and Hadith, known for his devotion and precision.',
    'Al-Nawawi was among the most celebrated scholars of Hadith and Shafi‘i law. Despite a relatively short life, he produced a remarkable body of concise, authoritative works.',
    ARRAY['cat-hadith', 'cat-fiqh', 'cat-ethics', 'cat-spirituality'],
    'https://learningmole.com/wp-content/uploads/2022/12/al-biruni.jpg',
    '[{"year": 631, "label": "Birth", "description": "Born in Nawa."}, {"year": 676, "label": "Death", "description": "Died in Nawa."}]'::jsonb
  ),
  (
    'scholar-ibn-hajar',
    'ibn-hajar-al-asqalani',
    'Ibn Hajar al-Asqalani',
    'Ahmad ibn Ali ibn Hajar al-Asqalani',
    773, 852,
    'Cairo, Egypt',
    'The leading Hadith scholar of his era and author of the celebrated commentary on Sahih al-Bukhari.',
    'Ibn Hajar al-Asqalani was a Shafi‘i jurist and the greatest Hadith master of the 9th century AH. His commentary on Sahih al-Bukhari is considered one of the most important works in Hadith literature.',
    ARRAY['cat-hadith', 'cat-fiqh', 'cat-history'],
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-y5ye4hU5-Nm3wXhl7wcG5cbWQMHd2lOlUWKpBOxpYq3U21uE4forzPUY&s=10',
    '[{"year": 773, "label": "Birth", "description": "Born in Cairo."}, {"year": 852, "label": "Death", "description": "Died in Cairo."}]'::jsonb
  ),
  (
    'scholar-ibn-taymiyyah',
    'ibn-taymiyyah',
    'Ibn Taymiyyah',
    'Taqi al-Din Ahmad ibn Taymiyyah',
    661, 728,
    'Harran, Mesopotamia',
    'A prolific jurist, theologian, and reformer of the 7th–8th century AH.',
    'Ibn Taymiyyah was a Hanbali jurist and theologian whose extensive writings addressed jurisprudence, theology, logic, and polemics.',
    ARRAY['cat-fiqh', 'cat-aqeedah', 'cat-thought'],
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-y5ye4hU5-Nm3wXhl7wcG5cbWQMHd2lOlUWKpBOxpYq3U21uE4forzPUY&s=10',
    '[{"year": 661, "label": "Birth", "description": "Born in Harran."}, {"year": 728, "label": "Death", "description": "Died in Damascus."}]'::jsonb
  )
ON CONFLICT (id) DO NOTHING;
