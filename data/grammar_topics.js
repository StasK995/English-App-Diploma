// data/grammar_topics.js
// Grammar Topics  - ВИПРАВЛЕНА ВЕРСІЯ

export const GRAMMAR_TOPICS = [
  // ==================== A1 LEVEL ====================
  {
    id: 'to_be_present',
    title: 'Verb "to be" (Present)',
    titleUa: 'Дієслово "to be" (Теперішній час)',
    level: 'A1',
    category: 'verb_tenses',
    order: 1,
    explanation: {
      intro: 'Дієслово "to be" (бути) — одне з найважливіших в англійській мові. Воно має три форми в теперішньому часі: am, is, are.',
      rules: [
        {
          rule: 'I + am',
          explanation: 'Використовується тільки з "I" (я)',
          example: 'I am a student. — Я студент.',
        },
        {
          rule: 'He/She/It + is',
          explanation: 'Для однини третьої особи',
          example: 'She is a teacher. — Вона вчителька.',
        },
        {
          rule: 'We/You/They + are',
          explanation: 'Для множини та "you"',
          example: 'They are friends. — Вони друзі.',
        },
      ],
      tables: [
        {
          title: 'Форми дієслова "to be"',
          headers: ['Особа', 'Стверджувальна', 'Заперечна', 'Скорочена'],
          rows: [
            ['I', 'I am', 'I am not', 'I\'m / I\'m not'],
            ['You', 'You are', 'You are not', 'You\'re / You aren\'t'],
            ['He/She/It', 'He is', 'He is not', 'He\'s / He isn\'t'],
            ['We', 'We are', 'We are not', 'We\'re / We aren\'t'],
            ['They', 'They are', 'They are not', 'They\'re / They aren\'t'],
          ],
        },
      ],
      tips: [
        'Скорочені форми частіше використовуються в розмовній мові',
        'It\'s — для речей, тварин та погоди: It\'s cold. (Холодно)',
        'Питання утворюються перестановкою: Am I? Is he? Are they?',
      ],
      commonMistakes: [
        {
          wrong: 'I is happy.',
          correct: 'I am happy.',
          explanation: 'З "I" завжди використовується "am"',
        },
        {
          wrong: 'She are a doctor.',
          correct: 'She is a doctor.',
          explanation: 'З he/she/it завжди "is"',
        },
      ],
    },
    examples: [
      { english: 'I am from Ukraine.', ukrainian: 'Я з України.' },
      { english: 'He is 25 years old.', ukrainian: 'Йому 25 років.' },
      { english: 'We are happy.', ukrainian: 'Ми щасливі.' },
      { english: 'Is she your sister?', ukrainian: 'Вона твоя сестра?' },
      { english: 'They aren\'t at home.', ukrainian: 'Їх немає вдома.' },
    ],
    exercises: [
      {
        type: 'fill_blank',
        instruction: 'Вставте am, is або are',
        questions: [
          { sentence: 'I ___ a teacher.', answer: 'am' },
          { sentence: 'She ___ from Kyiv.', answer: 'is' },
          { sentence: 'They ___ students.', answer: 'are' },
          { sentence: 'It ___ cold today.', answer: 'is' },
          { sentence: 'We ___ friends.', answer: 'are' },
        ],
      },
      {
        type: 'multiple_choice',
        instruction: 'Оберіть правильний варіант',
        questions: [
          {
            sentence: 'My name ___ Anna.',
            options: ['am', 'is', 'are'],
            answer: 'is',
          },
          {
            sentence: 'You ___ very kind.',
            options: ['am', 'is', 'are'],
            answer: 'are',
          },
          {
            sentence: '___ they at school?',
            options: ['Am', 'Is', 'Are'],
            answer: 'Are',
          },
        ],
      },
      {
        type: 'error_correction',
        instruction: 'Знайдіть та виправте помилку',
        questions: [
          { sentence: 'He are my brother.', answer: 'He is my brother.' },
          { sentence: 'I is hungry.', answer: 'I am hungry.' },
          { sentence: 'They is happy.', answer: 'They are happy.' },
        ],
      },
    ],
    relatedTopics: ['to_be_past', 'there_is_are'],
  },

  {
    id: 'present_simple',
    title: 'Present Simple',
    titleUa: 'Теперішній простий час',
    level: 'A1',
    category: 'verb_tenses',
    order: 2,
    explanation: {
      intro: 'Present Simple використовується для опису регулярних дій, звичок, фактів та загальних істин.',
      rules: [
        {
          rule: 'I/You/We/They + verb',
          explanation: 'Базова форма дієслова без змін',
          example: 'I work every day. — Я працюю щодня.',
        },
        {
          rule: 'He/She/It + verb + s/es',
          explanation: 'Додаємо -s або -es до дієслова',
          example: 'She works in a bank. — Вона працює в банку.',
        },
        {
          rule: 'Заперечення: do not / does not + verb',
          explanation: 'Використовуємо допоміжне дієслово',
          example: 'I don\'t like coffee. — Я не люблю каву.',
        },
        {
          rule: 'Питання: Do/Does + subject + verb?',
          explanation: 'Допоміжне дієслово на початку',
          example: 'Do you speak English? — Ти говориш англійською?',
        },
      ],
      tables: [
        {
          title: 'Утворення Present Simple',
          headers: ['', 'Стверджувальна', 'Заперечна', 'Питальна'],
          rows: [
            ['I/You/We/They', 'work', 'don\'t work', 'Do ... work?'],
            ['He/She/It', 'works', 'doesn\'t work', 'Does ... work?'],
          ],
        },
      ],
      tips: [
        'Маркери часу: always, usually, often, sometimes, never, every day/week',
        'Does/do забирають -s у дієслова',
      ],
      commonMistakes: [
        {
          wrong: 'She work in a school.',
          correct: 'She works in a school.',
          explanation: 'He/She/It потребує -s',
        },
      ],
    },
    examples: [
      { english: 'I usually wake up at 7 AM.', ukrainian: 'Зазвичай я прокидаюся о 7 ранку.' },
      { english: 'She speaks three languages.', ukrainian: 'Вона говорить трьома мовами.' },
      { english: 'Do you like pizza?', ukrainian: 'Тобі подобається піца?' },
    ],
    exercises: [
      {
        type: 'fill_blank',
        instruction: 'Вставте дієслово у правильній формі',
        questions: [
          { sentence: 'She ___ (live) in London.', answer: 'lives' },
          { sentence: 'They ___ (not work) on Sundays.', answer: 'don\'t work' },
        ],
      },
    ],
    relatedTopics: ['present_continuous'],
  },

  {
    id: 'articles_basic',
    title: 'Articles: a, an, the',
    titleUa: 'Артиклі: a, an, the',
    level: 'A1',
    category: 'nouns_articles',
    order: 3,
    explanation: {
      intro: 'В англійській мові є два типи артиклів: неозначений (a/an) та означений (the).',
      rules: [
        {
          rule: 'A + слово на приголосний звук',
          explanation: 'Перед словами, що починаються з приголосного звуку',
          example: 'a book, a car',
        },
        {
          rule: 'AN + слово на голосний звук',
          explanation: 'Перед словами, що починаються з голосного звуку',
          example: 'an apple, an hour',
        },
      ],
      tables: [],
      tips: ['THE + унікальні об\'єкти: the sun, the moon'],
      commonMistakes: [
        {
          wrong: 'I am student.',
          correct: 'I am a student.',
          explanation: 'Перед професіями потрібен артикль',
        },
      ],
    },
    examples: [
      { english: 'I have a dog.', ukrainian: 'У мене є собака.' },
      { english: 'The dog is big.', ukrainian: 'Собака великий.' },
    ],
    exercises: [],
    relatedTopics: ['plural_nouns'],
  },

  {
    id: 'personal_pronouns',
    title: 'Personal Pronouns',
    titleUa: 'Особові займенники',
    level: 'A1',
    category: 'pronouns',
    order: 4,
    explanation: {
      intro: 'Особові займенники замінюють іменники.',
      rules: [
        {
          rule: 'Subject pronouns',
          explanation: 'Хто виконує дію (I, you, he, she, it, we, they)',
          example: 'She works here.',
        },
      ],
      tables: [],
      tips: ['I завжди пишеться з великої літери'],
      commonMistakes: [],
    },
    examples: [
      { english: 'I love you.', ukrainian: 'Я кохаю тебе.' },
    ],
    exercises: [],
    relatedTopics: ['possessive_pronouns'],
  },

  // ==================== A2 LEVEL ====================
  {
    id: 'past_simple',
    title: 'Past Simple',
    titleUa: 'Минулий простий час',
    level: 'A2',
    category: 'verb_tenses',
    order: 1,
    explanation: {
      intro: 'Past Simple використовується для опису завершених дій у минулому.',
      rules: [
        {
          rule: 'Правильні дієслова: verb + ed',
          explanation: 'Додаємо -ed до базової форми',
          example: 'I worked yesterday.',
        },
      ],
      tables: [],
      tips: ['Маркери часу: yesterday, last week, ago'],
      commonMistakes: [],
    },
    examples: [
      { english: 'I visited my grandparents.', ukrainian: 'Я відвідав бабусю.' },
    ],
    exercises: [],
    relatedTopics: ['present_simple'],
  },

  {
    id: 'present_continuous',
    title: 'Present Continuous',
    titleUa: 'Теперішній тривалий час',
    level: 'A2',
    category: 'verb_tenses',
    order: 2,
    explanation: {
      intro: 'Present Continuous описує дії, що відбуваються прямо зараз.',
      rules: [
        {
          rule: 'am/is/are + verb + ing',
          explanation: 'Форма to be + дієслово з закінченням -ing',
          example: 'I am working now.',
        },
      ],
      tables: [],
      tips: ['Маркери: now, right now, at the moment'],
      commonMistakes: [],
    },
    examples: [
      { english: 'I\'m reading a book.', ukrainian: 'Я зараз читаю книгу.' },
    ],
    exercises: [],
    relatedTopics: ['present_simple'],
  },

  {
    id: 'comparative_superlative',
    title: 'Comparatives and Superlatives',
    titleUa: 'Ступені порівняння',
    level: 'A2',
    category: 'adjectives_adverbs',
    order: 3,
    explanation: {
      intro: 'Прикметники мають три ступені.',
      rules: [
        {
          rule: 'Короткі: +er / +est',
          explanation: 'Додаємо закінчення',
          example: 'tall → taller → the tallest',
        },
      ],
      tables: [],
      tips: [],
      commonMistakes: [],
    },
    examples: [
      { english: 'She is taller than me.', ukrainian: 'Вона вища за мене.' },
    ],
    exercises: [],
    relatedTopics: [],
  },
];

export const getTopicById = (id) => {
  return GRAMMAR_TOPICS.find(topic => topic.id === id);
};

export const getAllTopics = () => {
  return GRAMMAR_TOPICS;
};

export default GRAMMAR_TOPICS;