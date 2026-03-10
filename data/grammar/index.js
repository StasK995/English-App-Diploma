// data/grammar/index.js
// Головний файл — збирає всі теми граматики
// Щоб додати тему: створи файл в потрібній папці та імпортуй тут

// ── A1 ──────────────────────────────────────
import A1_01 from './A1/01_to_be_present';
import A1_02 from './A1/02_present_simple';
import A1_03 from './A1/03_articles';
import A1_04 from './A1/04_personal_pronouns';

// ── A2 ──────────────────────────────────────
import A2_01 from './A2/01_past_simple';
import A2_02 from './A2/02_present_continuous';
import A2_03 from './A2/03_comparative';

// ============================================
// Всі теми в одному масиві (як було в GRAMMAR_TOPICS)
// ============================================
export const GRAMMAR_TOPICS = [
  A1_01, A1_02, A1_03, A1_04,
  A2_01, A2_02, A2_03,
];

// ============================================
// Хелпери (такі самі як були в grammar_topics.js)
// ============================================

export const getTopicById = (id) => {
  return GRAMMAR_TOPICS.find(topic => topic.id === id);
};

export const getAllTopics = () => {
  return GRAMMAR_TOPICS;
};

export default GRAMMAR_TOPICS;

// ============================================
// ШАБЛОН ДЛЯ НОВОЇ ТЕМИ:
// ============================================
/*
export default {
  id: 'unique_id',
  title: 'Topic Title',
  titleUa: 'Назва теми',
  level: 'A1',          // A1, A2, B1, B2, C1, C2
  category: 'verb_tenses',
  order: 1,
  explanation: {
    intro: 'Вступ...',
    rules: [
      { rule: 'Правило', explanation: 'Пояснення', example: 'Приклад' },
    ],
    tables: [],
    tips: [],
    commonMistakes: [],
  },
  examples: [
    { english: 'Example sentence.', ukrainian: 'Переклад.' },
  ],
  exercises: [
    {
      type: 'fill_blank',       // або 'multiple_choice', 'error_correction'
      instruction: 'Інструкція',
      questions: [
        { sentence: 'I ___ happy.', answer: 'am' },
      ],
    },
  ],
  relatedTopics: [],
};
*/
