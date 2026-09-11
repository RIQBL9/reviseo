-- Reviseo demo/development seed data.
--
-- IMPORTANT: this is placeholder demo content used to exercise the UI during
-- development. Topic names loosely follow public GCSE subject areas but are
-- NOT verified against official exam board specifications. Before any real
-- launch, replace this with content reviewed against the actual AQA / Edexcel
-- / OCR / WJEC Eduqas specifications.
--
-- Safe to re-run: every insert is keyed off a natural unique slug/constraint
-- and uses ON CONFLICT DO NOTHING.

-- =========================================================================
-- SUBJECTS
-- =========================================================================

insert into subjects (slug, name, description, icon, color_theme, sort_order) values
  ('mathematics', 'Mathematics', 'Number, algebra, geometry, statistics and problem solving.', 'Sigma', 'maths', 1),
  ('english-language', 'English Language', 'Reading, writing and spoken language skills.', 'PenLine', 'english', 2),
  ('english-literature', 'English Literature', 'Novels, poetry and plays studied in depth.', 'BookOpen', 'english', 3),
  ('biology', 'Biology', 'The study of living organisms and life processes.', 'Dna', 'biology', 4),
  ('chemistry', 'Chemistry', 'Matter, reactions and the substances that make up our world.', 'FlaskConical', 'chemistry', 5),
  ('physics', 'Physics', 'Forces, energy, waves and the fundamental laws of nature.', 'Atom', 'physics', 6),
  ('combined-science', 'Combined Science', 'Biology, Chemistry and Physics combined into one award.', 'Microscope', 'science', 7),
  ('computer-science', 'Computer Science', 'Programming, algorithms and how computers really work.', 'Cpu', 'computer-science', 8),
  ('geography', 'Geography', 'Physical and human landscapes, and our changing planet.', 'Globe2', 'geography', 9),
  ('history', 'History', 'Key events, people and periods that shaped the modern world.', 'Landmark', 'history', 10),
  ('religious-studies', 'Religious Studies', 'Beliefs, ethics and philosophy across world religions.', 'BookMarked', 'religious-studies', 11),
  ('business', 'Business', 'How businesses start, operate, market and grow.', 'Briefcase', 'business', 12),
  ('french', 'French', 'Listening, speaking, reading and writing in French.', 'MessageCircle', 'languages', 13),
  ('spanish', 'Spanish', 'Listening, speaking, reading and writing in Spanish.', 'MessageCircle', 'languages', 14)
on conflict (slug) do nothing;

-- =========================================================================
-- EXAM BOARDS
-- =========================================================================

insert into exam_boards (slug, name) values
  ('aqa', 'AQA'),
  ('edexcel', 'Pearson Edexcel'),
  ('ocr', 'OCR'),
  ('wjec-eduqas', 'WJEC / Eduqas')
on conflict (slug) do nothing;

-- =========================================================================
-- SUBJECT <-> EXAM BOARD SPECIFICATIONS
-- Only combinations inserted here are ever offered during onboarding.
-- =========================================================================

insert into subject_exam_boards (subject_id, exam_board_id, specification_code)
select s.id, b.id, spec.code
from (values
  ('mathematics', 'aqa', '8300'),
  ('mathematics', 'edexcel', '1MA1'),
  ('mathematics', 'ocr', 'J560'),
  ('mathematics', 'wjec-eduqas', 'C300QS'),
  ('english-language', 'aqa', '8700'),
  ('english-language', 'edexcel', '1EN0'),
  ('english-language', 'ocr', 'J351'),
  ('english-literature', 'aqa', '8702'),
  ('english-literature', 'edexcel', '1ET0'),
  ('english-literature', 'ocr', 'J352'),
  ('biology', 'aqa', '8461'),
  ('biology', 'edexcel', '1BI0'),
  ('biology', 'ocr', 'J247'),
  ('chemistry', 'aqa', '8462'),
  ('chemistry', 'edexcel', '1CH0'),
  ('chemistry', 'ocr', 'J248'),
  ('physics', 'aqa', '8463'),
  ('physics', 'edexcel', '1PH0'),
  ('physics', 'ocr', 'J249'),
  ('combined-science', 'aqa', '8464'),
  ('combined-science', 'edexcel', '1SC0'),
  ('combined-science', 'ocr', 'J250'),
  ('computer-science', 'aqa', '8525'),
  ('computer-science', 'ocr', 'J277'),
  ('geography', 'aqa', '8035'),
  ('geography', 'edexcel', '1GA0'),
  ('geography', 'ocr', 'J383'),
  ('history', 'aqa', '8145'),
  ('history', 'edexcel', '1HI0'),
  ('history', 'ocr', 'J411'),
  ('religious-studies', 'aqa', '8062'),
  ('religious-studies', 'edexcel', '1RB0'),
  ('business', 'aqa', '8132'),
  ('business', 'edexcel', '1BS0'),
  ('french', 'aqa', '8658'),
  ('french', 'edexcel', '1FR0'),
  ('spanish', 'aqa', '8698'),
  ('spanish', 'edexcel', '1SP0')
) as spec(subject_slug, board_slug, code)
join subjects s on s.slug = spec.subject_slug
join exam_boards b on b.slug = spec.board_slug
on conflict (subject_id, exam_board_id) do nothing;

-- =========================================================================
-- TOPICS: full demo tree for AQA Biology (used throughout the dashboard demo)
-- =========================================================================

with spec as (
  select seb.id from subject_exam_boards seb
  join subjects s on s.id = seb.subject_id and s.slug = 'biology'
  join exam_boards b on b.id = seb.exam_board_id and b.slug = 'aqa'
),
top_level as (
  insert into topics (subject_exam_board_id, slug, name, sort_order)
  select spec.id, t.slug, t.name, t.sort_order
  from spec, (values
    ('cell-biology', 'Cell Biology', 1),
    ('organisation', 'Organisation', 2),
    ('infection-and-response', 'Infection and Response', 3),
    ('bioenergetics', 'Bioenergetics', 4),
    ('homeostasis-and-response', 'Homeostasis and Response', 5),
    ('inheritance-variation-evolution', 'Inheritance, Variation and Evolution', 6),
    ('ecology', 'Ecology', 7)
  ) as t(slug, name, sort_order)
  on conflict (subject_exam_board_id, slug) do nothing
  returning id, slug
)
insert into topics (subject_exam_board_id, parent_topic_id, slug, name, sort_order)
select spec.id, parent.id, sub.slug, sub.name, sub.sort_order
from spec
join top_level parent on parent.slug = 'cell-biology'
cross join (values
  ('cell-structure', 'Cell Structure', 1),
  ('microscopy', 'Microscopy', 2),
  ('cell-division', 'Cell Division', 3),
  ('transport-in-cells', 'Transport in Cells', 4)
) as sub(slug, name, sort_order)
on conflict (subject_exam_board_id, slug) do nothing;

-- Subtopics for Bioenergetics (used by the "recommended for you" demo card)
with spec as (
  select seb.id from subject_exam_boards seb
  join subjects s on s.id = seb.subject_id and s.slug = 'biology'
  join exam_boards b on b.id = seb.exam_board_id and b.slug = 'aqa'
),
parent as (
  select t.id from topics t, spec where t.subject_exam_board_id = spec.id and t.slug = 'bioenergetics'
)
insert into topics (subject_exam_board_id, parent_topic_id, slug, name, sort_order)
select spec.id, parent.id, sub.slug, sub.name, sub.sort_order
from spec, parent
cross join (values
  ('photosynthesis', 'Photosynthesis', 1),
  ('respiration', 'Respiration', 2)
) as sub(slug, name, sort_order)
on conflict (subject_exam_board_id, slug) do nothing;

-- =========================================================================
-- FLASHCARDS: Cell Structure (AQA Biology)
-- =========================================================================

with topic as (
  select t.id from topics t
  join subject_exam_boards seb on seb.id = t.subject_exam_board_id
  join subjects s on s.id = seb.subject_id and s.slug = 'biology'
  join exam_boards b on b.id = seb.exam_board_id and b.slug = 'aqa'
  where t.slug = 'cell-structure'
)
insert into flashcards (topic_id, question, answer, sort_order)
select topic.id, c.question, c.answer, c.sort_order
from topic
cross join (values
  ('What is the function of the nucleus?', 'It contains genetic material (DNA) and controls the cell''s activities.', 1),
  ('What is the function of mitochondria?', 'They are the site of aerobic respiration, releasing energy the cell needs.', 2),
  ('What is the function of ribosomes?', 'They are where protein synthesis takes place.', 3),
  ('Name two features a plant cell has that an animal cell does not.', 'A cell wall (made of cellulose) and chloroplasts (in green parts).', 4),
  ('What is the function of the cell membrane?', 'It controls the movement of substances in and out of the cell.', 5),
  ('What is a chloroplast and what is its function?', 'An organelle found in plant cells that absorbs light to carry out photosynthesis.', 6),
  ('What is the difference between a prokaryotic and eukaryotic cell?', 'Eukaryotic cells have a nucleus and are generally larger; prokaryotic cells (e.g. bacteria) have no nucleus, just a single loop of DNA.', 7),
  ('What is the function of a vacuole in a plant cell?', 'It contains cell sap and helps keep the cell rigid to support the plant.', 8)
) as c(question, answer, sort_order)
on conflict do nothing;

-- =========================================================================
-- QUESTIONS: Cell Structure (AQA Biology)
-- =========================================================================

with topic as (
  select t.id from topics t
  join subject_exam_boards seb on seb.id = t.subject_exam_board_id
  join subjects s on s.id = seb.subject_id and s.slug = 'biology'
  join exam_boards b on b.id = seb.exam_board_id and b.slug = 'aqa'
  where t.slug = 'cell-structure'
)
insert into questions (topic_id, question_type, prompt, options, correct_answer, explanation, difficulty)
select topic.id, 'multiple_choice', q.prompt, q.options::jsonb, q.correct_answer, q.explanation, q.difficulty
from topic
cross join (values
  (
    'Which organelle is the site of aerobic respiration?',
    '[{"id":"a","text":"Nucleus"},{"id":"b","text":"Mitochondria"},{"id":"c","text":"Ribosome"},{"id":"d","text":"Chloroplast"}]',
    'b',
    'Mitochondria carry out aerobic respiration, releasing energy for the cell to use.',
    1
  ),
  (
    'Which structure is found in plant cells but NOT animal cells?',
    '[{"id":"a","text":"Cell membrane"},{"id":"b","text":"Cytoplasm"},{"id":"c","text":"Cell wall"},{"id":"d","text":"Mitochondria"}]',
    'c',
    'Plant cells have a rigid cell wall made of cellulose for structural support; animal cells do not.',
    1
  ),
  (
    'What is the main function of ribosomes?',
    '[{"id":"a","text":"Protein synthesis"},{"id":"b","text":"Photosynthesis"},{"id":"c","text":"Storing genetic material"},{"id":"d","text":"Controlling substances entering the cell"}]',
    'a',
    'Ribosomes translate genetic instructions into proteins.',
    2
  ),
  (
    'A bacterial cell has no nucleus. What term describes this type of cell?',
    '[{"id":"a","text":"Eukaryotic"},{"id":"b","text":"Prokaryotic"},{"id":"c","text":"Multicellular"},{"id":"d","text":"Specialised"}]',
    'b',
    'Prokaryotic cells (like bacteria) do not have a nucleus; their DNA floats free in the cytoplasm.',
    2
  ),
  (
    'Which organelle controls what substances enter and leave a cell?',
    '[{"id":"a","text":"Cell wall"},{"id":"b","text":"Vacuole"},{"id":"c","text":"Cell membrane"},{"id":"d","text":"Nucleus"}]',
    'c',
    'The (partially permeable) cell membrane regulates the movement of substances in and out of the cell.',
    1
  ),
  (
    'Chloroplasts contain a green pigment used to absorb light energy. What is this pigment called?',
    '[{"id":"a","text":"Chlorophyll"},{"id":"b","text":"Cellulose"},{"id":"c","text":"Chitin"},{"id":"d","text":"Haemoglobin"}]',
    'a',
    'Chlorophyll absorbs light energy for photosynthesis and gives chloroplasts (and most plants) their green colour.',
    2
  )
) as q(prompt, options, correct_answer, explanation, difficulty)
on conflict do nothing;

-- =========================================================================
-- LIGHTER TOPIC TREES for a few more subject/board combos, so the app
-- doesn't feel empty outside of Biology. No flashcards/questions yet —
-- these are ready for content to be added later.
-- =========================================================================

with spec as (
  select seb.id from subject_exam_boards seb
  join subjects s on s.id = seb.subject_id and s.slug = 'mathematics'
  join exam_boards b on b.id = seb.exam_board_id and b.slug = 'aqa'
)
insert into topics (subject_exam_board_id, slug, name, sort_order)
select spec.id, t.slug, t.name, t.sort_order
from spec, (values
  ('number', 'Number', 1),
  ('algebra', 'Algebra', 2),
  ('ratio-proportion-rates-of-change', 'Ratio, Proportion and Rates of Change', 3),
  ('geometry-and-measures', 'Geometry and Measures', 4),
  ('probability', 'Probability', 5),
  ('statistics', 'Statistics', 6)
) as t(slug, name, sort_order)
on conflict (subject_exam_board_id, slug) do nothing;

with spec as (
  select seb.id from subject_exam_boards seb
  join subjects s on s.id = seb.subject_id and s.slug = 'chemistry'
  join exam_boards b on b.id = seb.exam_board_id and b.slug = 'aqa'
)
insert into topics (subject_exam_board_id, slug, name, sort_order)
select spec.id, t.slug, t.name, t.sort_order
from spec, (values
  ('atomic-structure-and-the-periodic-table', 'Atomic Structure and the Periodic Table', 1),
  ('bonding-structure-and-properties', 'Bonding, Structure and Properties of Matter', 2),
  ('quantitative-chemistry', 'Quantitative Chemistry', 3),
  ('chemical-changes', 'Chemical Changes', 4),
  ('energy-changes', 'Energy Changes', 5),
  ('the-rate-and-extent-of-chemical-change', 'The Rate and Extent of Chemical Change', 6),
  ('organic-chemistry', 'Organic Chemistry', 7),
  ('chemical-analysis', 'Chemical Analysis', 8),
  ('chemistry-of-the-atmosphere', 'Chemistry of the Atmosphere', 9),
  ('using-resources', 'Using Resources', 10)
) as t(slug, name, sort_order)
on conflict (subject_exam_board_id, slug) do nothing;

with spec as (
  select seb.id from subject_exam_boards seb
  join subjects s on s.id = seb.subject_id and s.slug = 'physics'
  join exam_boards b on b.id = seb.exam_board_id and b.slug = 'aqa'
)
insert into topics (subject_exam_board_id, slug, name, sort_order)
select spec.id, t.slug, t.name, t.sort_order
from spec, (values
  ('energy', 'Energy', 1),
  ('electricity', 'Electricity', 2),
  ('particle-model-of-matter', 'Particle Model of Matter', 3),
  ('atomic-structure', 'Atomic Structure', 4),
  ('forces', 'Forces', 5),
  ('waves', 'Waves', 6),
  ('magnetism-and-electromagnetism', 'Magnetism and Electromagnetism', 7)
) as t(slug, name, sort_order)
on conflict (subject_exam_board_id, slug) do nothing;

with spec as (
  select seb.id from subject_exam_boards seb
  join subjects s on s.id = seb.subject_id and s.slug = 'computer-science'
  join exam_boards b on b.id = seb.exam_board_id and b.slug = 'ocr'
)
insert into topics (subject_exam_board_id, slug, name, sort_order)
select spec.id, t.slug, t.name, t.sort_order
from spec, (values
  ('algorithms', 'Algorithms', 1),
  ('programming-fundamentals', 'Programming Fundamentals', 2),
  ('data-representation', 'Data Representation', 3),
  ('computer-systems', 'Computer Systems', 4),
  ('networks', 'Networks', 5),
  ('cyber-security', 'Cyber Security', 6)
) as t(slug, name, sort_order)
on conflict (subject_exam_board_id, slug) do nothing;

with spec as (
  select seb.id from subject_exam_boards seb
  join subjects s on s.id = seb.subject_id and s.slug = 'geography'
  join exam_boards b on b.id = seb.exam_board_id and b.slug = 'aqa'
)
insert into topics (subject_exam_board_id, slug, name, sort_order)
select spec.id, t.slug, t.name, t.sort_order
from spec, (values
  ('the-challenge-of-natural-hazards', 'The Challenge of Natural Hazards', 1),
  ('the-living-world', 'The Living World', 2),
  ('physical-landscapes-in-the-uk', 'Physical Landscapes in the UK', 3),
  ('urban-issues-and-challenges', 'Urban Issues and Challenges', 4),
  ('the-changing-economic-world', 'The Changing Economic World', 5),
  ('the-challenge-of-resource-management', 'The Challenge of Resource Management', 6)
) as t(slug, name, sort_order)
on conflict (subject_exam_board_id, slug) do nothing;
