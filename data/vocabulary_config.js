// Конфігурація словника - рівні та категорії

// Рівні CEFR
export const levels = [
  {
    code: 'A1',
    name: 'Початковий',
    description: 'Базові слова для щоденного спілкування',
    color: '#4CAF50', // зелений
  },
  {
    code: 'A2',
    name: 'Елементарний',
    description: 'Розширений базовий словник',
    color: '#8BC34A', // світло-зелений
  },
  {
    code: 'B1',
    name: 'Середній',
    description: 'Слова для повсякденних ситуацій',
    color: '#FFC107', // жовтий
  },
  {
    code: 'B2',
    name: 'Вище середнього',
    description: 'Складніша лексика для детальних обговорень',
    color: '#FF9800', // помаранчевий
  },
  {
    code: 'C1',
    name: 'Просунутий',
    description: 'Професійна та академічна лексика',
    color: '#F44336', // червоний
  },
  {
    code: 'C2',
    name: 'Вільне володіння',
    description: 'Рідкісні слова, ідіоми, нюанси',
    color: '#9C27B0', // фіолетовий
  },
];

// Категорії (20 тем)
export const categories = [
  {
    code: 'people',
    name: 'Люди і особистість',
    emoji: '👤',
  },
  {
    code: 'home',
    name: 'Дім і побут',
    emoji: '🏠',
  },
  {
    code: 'food',
    name: 'Їжа та напої',
    emoji: '🍎',
  },
  {
    code: 'health',
    name: "Здоров'я і тіло",
    emoji: '❤️',
  },
  {
    code: 'education',
    name: 'Освіта',
    emoji: '📚',
  },
  {
    code: 'work',
    name: 'Робота і професії',
    emoji: '💼',
  },
  {
    code: 'money',
    name: 'Гроші та економіка',
    emoji: '💰',
  },
  {
    code: 'travel',
    name: 'Подорожі та транспорт',
    emoji: '✈️',
  },
  {
    code: 'nature',
    name: 'Природа і довкілля',
    emoji: '🌿',
  },
  {
    code: 'technology',
    name: 'Технології та інтернет',
    emoji: '💻',
  },
  {
    code: 'art',
    name: 'Мистецтво і культура',
    emoji: '🎨',
  },
  {
    code: 'science',
    name: 'Наука і дослідження',
    emoji: '🔬',
  },
  {
    code: 'society',
    name: 'Держава і суспільство',
    emoji: '🏛️',
  },
  {
    code: 'law',
    name: 'Право і безпека',
    emoji: '⚖️',
  },
  {
    code: 'sport',
    name: 'Спорт і дозвілля',
    emoji: '⚽',
  },
  {
    code: 'media',
    name: 'Медіа та комунікації',
    emoji: '📱',
  },
  {
    code: 'time',
    name: 'Час і дати',
    emoji: '⏰',
  },
  {
    code: 'places',
    name: 'Місця і напрямки',
    emoji: '📍',
  },
  {
    code: 'materials',
    name: 'Матеріали, кольори, форми',
    emoji: '🔷',
  },
  {
    code: 'abstract',
    name: 'Абстрактні поняття',
    emoji: '💭',
  },
];

// Частини мови
export const partsOfSpeech = {
  noun: 'іменник',
  verb: 'дієслово',
  adjective: 'прикметник',
  adverb: 'прислівник',
  preposition: 'прийменник',
  conjunction: 'сполучник',
  pronoun: 'займенник',
  interjection: 'вигук',
  article: 'артикль',
  determiner: 'детермінатив',
  phrasal_verb: 'фразове дієслово',
  phrase: 'фраза',
};

// Хелпери для отримання даних
export const getLevelByCode = (code) => {
  return levels.find(level => level.code === code);
};

export const getCategoryByCode = (code) => {
  return categories.find(category => category.code === code);
};

export const getPartOfSpeechName = (code) => {
  return partsOfSpeech[code] || code;
};

export default {
  levels,
  categories,
  partsOfSpeech,
  getLevelByCode,
  getCategoryByCode,
  getPartOfSpeechName,
};
