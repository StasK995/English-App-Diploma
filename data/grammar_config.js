// data/grammar_config.js
// Grammar System Configuration
// Конфігурація системи граматики для English Learning App

export const GRAMMAR_LEVELS = {
  A1: {
    id: 'A1',
    name: 'A1 - Початковий',
    description: 'Базова граматика для початківців',
    color: '#4CAF50',
    order: 1,
  },
  A2: {
    id: 'A2',
    name: 'A2 - Елементарний',
    description: 'Розширення базових конструкцій',
    color: '#8BC34A',
    order: 2,
  },
  B1: {
    id: 'B1',
    name: 'B1 - Середній',
    description: 'Складніші граматичні структури',
    color: '#FF9800',
    order: 3,
  },
  B2: {
    id: 'B2',
    name: 'B2 - Вище середнього',
    description: 'Просунута граматика',
    color: '#FF5722',
    order: 4,
  },
  C1: {
    id: 'C1',
    name: 'C1 - Просунутий',
    description: 'Складні конструкції та нюанси',
    color: '#9C27B0',
    order: 5,
  },
  C2: {
    id: 'C2',
    name: 'C2 - Досконалий',
    description: 'Майстерне володіння граматикою',
    color: '#673AB7',
    order: 6,
  },
};

export const GRAMMAR_CATEGORIES = {
  VERB_TENSES: {
    id: 'verb_tenses',
    name: 'Часи дієслів',
    icon: '⏰',
    description: 'Present, Past, Future та їх форми',
  },
  VERB_FORMS: {
    id: 'verb_forms',
    name: 'Форми дієслів',
    icon: '🔄',
    description: 'Інфінітив, герундій, дієприкметник',
  },
  NOUNS_ARTICLES: {
    id: 'nouns_articles',
    name: 'Іменники та артиклі',
    icon: '📦',
    description: 'Артиклі, множина, присвійний відмінок',
  },
  PRONOUNS: {
    id: 'pronouns',
    name: 'Займенники',
    icon: '👤',
    description: 'Особові, присвійні, вказівні',
  },
  ADJECTIVES_ADVERBS: {
    id: 'adjectives_adverbs',
    name: 'Прикметники та прислівники',
    icon: '🎨',
    description: 'Ступені порівняння, порядок слів',
  },
  PREPOSITIONS: {
    id: 'prepositions',
    name: 'Прийменники',
    icon: '📍',
    description: 'Прийменники місця, часу, руху',
  },
  SENTENCE_STRUCTURE: {
    id: 'sentence_structure',
    name: 'Структура речення',
    icon: '📝',
    description: 'Порядок слів, питання, заперечення',
  },
  CONDITIONALS: {
    id: 'conditionals',
    name: 'Умовні речення',
    icon: '🔀',
    description: 'Zero, First, Second, Third Conditionals',
  },
  PASSIVE_VOICE: {
    id: 'passive_voice',
    name: 'Пасивний стан',
    icon: '🔃',
    description: 'Passive Voice у різних часах',
  },
  MODAL_VERBS: {
    id: 'modal_verbs',
    name: 'Модальні дієслова',
    icon: '💪',
    description: 'Can, must, should, may та інші',
  },
  REPORTED_SPEECH: {
    id: 'reported_speech',
    name: 'Непряма мова',
    icon: '💬',
    description: 'Передача слів інших людей',
  },
  RELATIVE_CLAUSES: {
    id: 'relative_clauses',
    name: 'Відносні речення',
    icon: '🔗',
    description: 'Who, which, that, whose',
  },
};

// Типи вправ для граматики
export const EXERCISE_TYPES = {
  FILL_BLANK: {
    id: 'fill_blank',
    name: 'Заповни пропуск',
    description: 'Вставте правильне слово або форму',
    icon: '✏️',
  },
  MULTIPLE_CHOICE: {
    id: 'multiple_choice',
    name: 'Вибери правильну відповідь',
    description: 'Оберіть одну з варіантів',
    icon: '🔘',
  },
  TRANSFORM: {
    id: 'transform',
    name: 'Трансформація',
    description: 'Перетворіть речення',
    icon: '🔄',
  },
  ERROR_CORRECTION: {
    id: 'error_correction',
    name: 'Виправ помилку',
    description: 'Знайдіть та виправте помилку',
    icon: '❌',
  },
  MATCHING: {
    id: 'matching',
    name: 'З\'єднай пари',
    description: 'Поєднайте відповідні елементи',
    icon: '🔗',
  },
  WORD_ORDER: {
    id: 'word_order',
    name: 'Порядок слів',
    description: 'Розставте слова у правильному порядку',
    icon: '📊',
  },
};

// Функція отримання тем за рівнем
export const getTopicsByLevel = (topics, level) => {
  return topics.filter(topic => topic.level === level)
    .sort((a, b) => a.order - b.order);
};

// Функція отримання тем за категорією
export const getTopicsByCategory = (topics, categoryId) => {
  return topics.filter(topic => topic.category === categoryId);
};

// Функція пошуку тем
export const searchTopics = (topics, query) => {
  const lowerQuery = query.toLowerCase();
  return topics.filter(topic => 
    topic.title.toLowerCase().includes(lowerQuery) ||
    topic.titleUa.toLowerCase().includes(lowerQuery)
  );
};

// Отримання масиву рівнів для відображення
export const getLevelsArray = () => {
  return Object.values(GRAMMAR_LEVELS).sort((a, b) => a.order - b.order);
};

// Отримання масиву категорій
export const getCategoriesArray = () => {
  return Object.values(GRAMMAR_CATEGORIES);
};

export default {
  GRAMMAR_LEVELS,
  GRAMMAR_CATEGORIES,
  EXERCISE_TYPES,
  getTopicsByLevel,
  getTopicsByCategory,
  searchTopics,
  getLevelsArray,
  getCategoriesArray,
};
