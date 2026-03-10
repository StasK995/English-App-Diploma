// data/grammar/A2/01_past_simple.js

export default {
  id: 'past_simple',
  title: 'Past Simple',
  titleUa: 'Минулий простий час',
  level: 'A2',
  category: 'verb_tenses',
  order: 1,
  explanation: {
    intro: 'Past Simple використовується для опису завершених дій у минулому.',
    rules: [
      { rule: 'Правильні дієслова: verb + ed', explanation: 'Додаємо -ed до базової форми', example: 'I worked yesterday.' },
      { rule: 'Неправильні дієслова: друга форма', explanation: 'Спеціальна форма для кожного дієслова', example: 'I went to school. (go → went)' },
      { rule: "Заперечення: didn't + verb", explanation: 'did not + базова форма', example: "I didn't work yesterday." },
      { rule: 'Питання: Did + subject + verb?', explanation: 'did на початку речення', example: 'Did you work yesterday?' },
    ],
    tables: [
      {
        title: 'Утворення Past Simple',
        headers: ['', 'Стверджувальна', 'Заперечна', 'Питальна'],
        rows: [
          ['All subjects', 'worked', "didn't work", 'Did ... work?'],
        ],
      },
    ],
    tips: [
      'Маркери часу: yesterday, last week/month/year, ago, in 2020',
      'Неправильні дієслова треба вчити напам\'ять',
    ],
    commonMistakes: [
      { wrong: 'I did went there.', correct: 'I went there.', explanation: 'did + базова форма, не минула' },
      { wrong: "She didn't worked.", correct: "She didn't work.", explanation: "Після didn't — базова форма" },
    ],
  },
  examples: [
    { english: 'I visited my grandparents.', ukrainian: 'Я відвідав бабусю і дідуся.' },
    { english: 'She went to Paris last year.', ukrainian: 'Вона їздила до Парижа минулого року.' },
    { english: "We didn't watch TV.", ukrainian: 'Ми не дивились телевізор.' },
  ],
  exercises: [
    {
      type: 'fill_blank',
      instruction: 'Вставте дієслово у формі Past Simple',
      questions: [
        { sentence: 'She ___ (visit) London last summer.', answer: 'visited' },
        { sentence: 'They ___ (not go) to school yesterday.', answer: "didn't go" },
        { sentence: 'I ___ (see) a great movie.', answer: 'saw' },
      ],
    },
    {
      type: 'multiple_choice',
      instruction: 'Оберіть правильний варіант',
      questions: [
        { sentence: 'He ___ to work yesterday.', options: ['go', 'went', 'goes'], answer: 'went' },
        { sentence: '___ you call her?', options: ['Do', 'Did', 'Does'], answer: 'Did' },
      ],
    },
  ],
  relatedTopics: ['present_simple', 'present_continuous'],
};
