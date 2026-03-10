// data/grammar/A2/03_comparative.js

export default {
  id: 'comparative_superlative',
  title: 'Comparatives and Superlatives',
  titleUa: 'Ступені порівняння',
  level: 'A2',
  category: 'adjectives_adverbs',
  order: 3,
  explanation: {
    intro: 'Прикметники мають три ступені порівняння: звичайний, вищий та найвищий.',
    rules: [
      { rule: 'Короткі прикметники: +er / the +est', explanation: 'Додаємо закінчення', example: 'tall → taller → the tallest' },
      { rule: 'Довгі прикметники: more / the most', explanation: 'Використовуємо more/most', example: 'beautiful → more beautiful → the most beautiful' },
      { rule: 'Порівняння з than', explanation: 'Після вищого ступеня використовуємо than', example: 'She is taller than me.' },
    ],
    tables: [
      {
        title: 'Ступені порівняння',
        headers: ['Прикметник', 'Вищий', 'Найвищий'],
        rows: [
          ['tall', 'taller', 'the tallest'],
          ['big', 'bigger', 'the biggest'],
          ['happy', 'happier', 'the happiest'],
          ['beautiful', 'more beautiful', 'the most beautiful'],
          ['good', 'better', 'the best'],
          ['bad', 'worse', 'the worst'],
        ],
      },
    ],
    tips: [
      'Односкладові прикметники: +er/est',
      'Прикметники на -y: змінюємо y→i + er/est',
      'Нерегулярні: good-better-best, bad-worse-worst',
    ],
    commonMistakes: [
      { wrong: 'She is more tall than me.', correct: 'She is taller than me.', explanation: 'Короткі прикметники: +er, не more' },
    ],
  },
  examples: [
    { english: 'She is taller than me.', ukrainian: 'Вона вища за мене.' },
    { english: 'This is the best movie.', ukrainian: 'Це найкращий фільм.' },
    { english: 'Math is more difficult than English.', ukrainian: 'Математика складніша за англійську.' },
  ],
  exercises: [
    {
      type: 'fill_blank',
      instruction: 'Вставте правильну форму прикметника',
      questions: [
        { sentence: 'He is ___ (tall) than his brother.', answer: 'taller' },
        { sentence: 'This is the ___ (good) restaurant in the city.', answer: 'best' },
        { sentence: 'English is ___ (easy) than Chinese.', answer: 'easier' },
      ],
    },
    {
      type: 'multiple_choice',
      instruction: 'Оберіть правильний варіант',
      questions: [
        { sentence: 'London is ___ than my city.', options: ['big', 'bigger', 'biggest'], answer: 'bigger' },
        { sentence: 'She is the ___ student in the class.', options: ['smart', 'smarter', 'smartest'], answer: 'smartest' },
      ],
    },
  ],
  relatedTopics: [],
};
