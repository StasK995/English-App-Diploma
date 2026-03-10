// data/grammar/A1/02_present_simple.js

export default {
  id: 'present_simple',
  title: 'Present Simple',
  titleUa: 'Теперішній простий час',
  level: 'A1',
  category: 'verb_tenses',
  order: 2,
  explanation: {
    intro: 'Present Simple використовується для опису регулярних дій, звичок, фактів та загальних істин.',
    rules: [
      { rule: 'I/You/We/They + verb', explanation: 'Базова форма дієслова без змін', example: 'I work every day. — Я працюю щодня.' },
      { rule: 'He/She/It + verb + s/es', explanation: 'Додаємо -s або -es до дієслова', example: 'She works in a bank. — Вона працює в банку.' },
      { rule: "Заперечення: do not / does not + verb", explanation: 'Використовуємо допоміжне дієслово', example: "I don't like coffee. — Я не люблю каву." },
      { rule: 'Питання: Do/Does + subject + verb?', explanation: 'Допоміжне дієслово на початку', example: 'Do you speak English? — Ти говориш англійською?' },
    ],
    tables: [
      {
        title: 'Утворення Present Simple',
        headers: ['', 'Стверджувальна', 'Заперечна', 'Питальна'],
        rows: [
          ['I/You/We/They', 'work', "don't work", 'Do ... work?'],
          ['He/She/It', 'works', "doesn't work", 'Does ... work?'],
        ],
      },
    ],
    tips: [
      'Маркери часу: always, usually, often, sometimes, never, every day/week',
      'Does/do забирають -s у дієслова',
    ],
    commonMistakes: [
      { wrong: 'She work in a school.', correct: 'She works in a school.', explanation: 'He/She/It потребує -s' },
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
        { sentence: "They ___ (not work) on Sundays.", answer: "don't work" },
      ],
    },
  ],
  relatedTopics: ['present_continuous'],
};
