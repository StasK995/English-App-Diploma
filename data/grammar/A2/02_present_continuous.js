// data/grammar/A2/02_present_continuous.js

export default {
  id: 'present_continuous',
  title: 'Present Continuous',
  titleUa: 'Теперішній тривалий час',
  level: 'A2',
  category: 'verb_tenses',
  order: 2,
  explanation: {
    intro: 'Present Continuous описує дії, що відбуваються прямо зараз або тимчасові ситуації.',
    rules: [
      { rule: 'am/is/are + verb + ing', explanation: 'Форма to be + дієслово з закінченням -ing', example: 'I am working now.' },
      { rule: "Заперечення: am/is/are + not + verb + ing", explanation: 'Додаємо not після to be', example: "She isn't sleeping." },
      { rule: 'Питання: Am/Is/Are + subject + verb + ing?', explanation: 'to be на початку речення', example: 'Are you listening?' },
    ],
    tables: [
      {
        title: 'Утворення Present Continuous',
        headers: ['Особа', 'Стверджувальна', 'Заперечна', 'Питальна'],
        rows: [
          ['I', 'am working', "am not working", 'Am I working?'],
          ['He/She/It', 'is working', "isn't working", 'Is he working?'],
          ['We/You/They', 'are working', "aren't working", 'Are they working?'],
        ],
      },
    ],
    tips: [
      'Маркери: now, right now, at the moment, currently',
      'Деякі дієслова не вживаються в Continuous: know, like, want, need',
    ],
    commonMistakes: [
      { wrong: 'I am know the answer.', correct: 'I know the answer.', explanation: 'know — стативне дієслово, не вживається в Continuous' },
    ],
  },
  examples: [
    { english: "I'm reading a book.", ukrainian: 'Я зараз читаю книгу.' },
    { english: 'She is studying English.', ukrainian: 'Вона вивчає англійську.' },
    { english: 'Are they watching TV?', ukrainian: 'Вони дивляться телевізор?' },
  ],
  exercises: [
    {
      type: 'fill_blank',
      instruction: 'Вставте дієслово у формі Present Continuous',
      questions: [
        { sentence: 'She ___ (study) right now.', answer: 'is studying' },
        { sentence: 'They ___ (not sleep) at the moment.', answer: "aren't sleeping" },
        { sentence: 'I ___ (listen) to music.', answer: 'am listening' },
      ],
    },
  ],
  relatedTopics: ['present_simple'],
};
