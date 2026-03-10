// data/grammar/A1/03_articles.js

export default {
  id: 'articles_basic',
  title: 'Articles: a, an, the',
  titleUa: 'Артиклі: a, an, the',
  level: 'A1',
  category: 'nouns_articles',
  order: 3,
  explanation: {
    intro: 'В англійській мові є два типи артиклів: неозначений (a/an) та означений (the).',
    rules: [
      { rule: 'A + слово на приголосний звук', explanation: 'Перед словами, що починаються з приголосного звуку', example: 'a book, a car' },
      { rule: 'AN + слово на голосний звук', explanation: 'Перед словами, що починаються з голосного звуку', example: 'an apple, an hour' },
    ],
    tables: [],
    tips: ["THE + унікальні об'єкти: the sun, the moon"],
    commonMistakes: [
      { wrong: 'I am student.', correct: 'I am a student.', explanation: 'Перед професіями потрібен артикль' },
    ],
  },
  examples: [
    { english: 'I have a dog.', ukrainian: 'У мене є собака.' },
    { english: 'The dog is big.', ukrainian: 'Собака великий.' },
  ],
  exercises: [],
  relatedTopics: ['plural_nouns'],
};
