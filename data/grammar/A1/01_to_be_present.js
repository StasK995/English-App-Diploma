// data/grammar/A1/01_to_be_present.js

export default {
  id: 'to_be_present',
  title: 'Verb "to be" (Present)',
  titleUa: 'Дієслово "to be" (Теперішній час)',
  level: 'A1',
  category: 'verb_tenses',
  order: 1,
  explanation: {
    intro: 'Дієслово "to be" (бути) — одне з найважливіших в англійській мові. Воно має три форми в теперішньому часі: am, is, are.',
    rules: [
      { rule: 'I + am', explanation: 'Використовується тільки з "I" (я)', example: 'I am a student. — Я студент.' },
      { rule: 'He/She/It + is', explanation: 'Для однини третьої особи', example: 'She is a teacher. — Вона вчителька.' },
      { rule: 'We/You/They + are', explanation: 'Для множини та "you"', example: 'They are friends. — Вони друзі.' },
    ],
    tables: [
      {
        title: 'Форми дієслова "to be"',
        headers: ['Особа', 'Стверджувальна', 'Заперечна', 'Скорочена'],
        rows: [
          ['I', 'I am', 'I am not', "I'm / I'm not"],
          ['You', 'You are', 'You are not', "You're / You aren't"],
          ['He/She/It', 'He is', 'He is not', "He's / He isn't"],
          ['We', 'We are', 'We are not', "We're / We aren't"],
          ['They', 'They are', 'They are not', "They're / They aren't"],
        ],
      },
    ],
    tips: [
      'Скорочені форми частіше використовуються в розмовній мові',
      "It's — для речей, тварин та погоди: It's cold. (Холодно)",
      'Питання утворюються перестановкою: Am I? Is he? Are they?',
    ],
    commonMistakes: [
      { wrong: 'I is happy.', correct: 'I am happy.', explanation: 'З "I" завжди використовується "am"' },
      { wrong: 'She are a doctor.', correct: 'She is a doctor.', explanation: 'З he/she/it завжди "is"' },
    ],
  },
  examples: [
    { english: 'I am from Ukraine.', ukrainian: 'Я з України.' },
    { english: 'He is 25 years old.', ukrainian: 'Йому 25 років.' },
    { english: 'We are happy.', ukrainian: 'Ми щасливі.' },
    { english: 'Is she your sister?', ukrainian: 'Вона твоя сестра?' },
    { english: "They aren't at home.", ukrainian: 'Їх немає вдома.' },
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
        { sentence: 'My name ___ Anna.', options: ['am', 'is', 'are'], answer: 'is' },
        { sentence: 'You ___ very kind.', options: ['am', 'is', 'are'], answer: 'are' },
        { sentence: '___ they at school?', options: ['Am', 'Is', 'Are'], answer: 'Are' },
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
};
