// SRS (Spaced Repetition System) - Система інтервального повторення

// Статуси слів
export const wordStatuses = {
  NEW: 'new',           // Нове слово - ще не вивчалось
  LEARNING: 'learning', // Вивчається - перші кроки
  REVIEWING: 'reviewing', // На повторенні - в процесі закріплення
  MASTERED: 'mastered', // Вивчено - довготривала пам'ять
};

// Назви статусів українською
export const statusNames = {
  new: 'Нове',
  learning: 'Вивчається',
  reviewing: 'Повторення',
  mastered: 'Вивчено',
};

// Кольори статусів
export const statusColors = {
  new: '#95A5A6',       // Сірий
  learning: '#3498DB',  // Синій
  reviewing: '#F39C12', // Жовтий/Помаранчевий
  mastered: '#27AE60',  // Зелений
};

// Інтервали повторення (в хвилинах)
// Конвертація: 1 день = 1440 хвилин
export const intervals = {
  LEARNING_STEPS: [1, 10],           // Кроки вивчення: 1 хв, 10 хв
  GRADUATING_INTERVAL: 1440,          // 1 день - перехід до reviewing
  EASY_INTERVAL: 4320,                // 3 дні - якщо натиснув "Легко"
  REVIEW_INTERVALS: [
    1440,    // 1 день
    4320,    // 3 дні  
    10080,   // 7 днів
    20160,   // 14 днів
    43200,   // 30 днів
    129600,  // 90 днів
  ],
};

// Множники складності
export const easeFactor = {
  DEFAULT: 2.5,
  MINIMUM: 1.3,
  AGAIN_PENALTY: 0.2,    // Віднімаємо при помилці
  HARD_PENALTY: 0.15,    // Віднімаємо при "Важко"
  EASY_BONUS: 0.15,      // Додаємо при "Легко"
};

// Кнопки відповідей
export const answerButtons = {
  AGAIN: 'again',   // Не знаю / Забув
  HARD: 'hard',     // Важко згадати
  GOOD: 'good',     // Нормально
  EASY: 'easy',     // Легко
};

// Назви кнопок
export const answerButtonNames = {
  again: 'Не знаю',
  hard: 'Важко',
  good: 'Добре',
  easy: 'Легко',
};

// Кольори кнопок
export const answerButtonColors = {
  again: '#E74C3C',  // Червоний
  hard: '#F39C12',   // Помаранчевий
  good: '#27AE60',   // Зелений
  easy: '#3498DB',   // Синій
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Створити початковий стан SRS для слова
 */
export const createInitialSRSState = (wordId) => {
  return {
    wordId,
    status: wordStatuses.NEW,
    interval: 0,
    easeFactor: easeFactor.DEFAULT,
    repetitions: 0,
    learningStep: 0,
    nextReview: null,
    lastReview: null,
  };
};

/**
 * Обчислити наступну дату повторення
 */
export const calculateNextReview = (intervalMinutes) => {
  const now = new Date();
  return new Date(now.getTime() + intervalMinutes * 60 * 1000).toISOString();
};

/**
 * Перевірити чи слово готове до повторення
 */
export const isWordDueForReview = (srsState) => {
  if (!srsState.nextReview) return true;
  return new Date(srsState.nextReview) <= new Date();
};

/**
 * Обробити відповідь користувача та оновити SRS стан
 */
export const processAnswer = (srsState, answer) => {
  const newState = { ...srsState };
  const now = new Date().toISOString();
  newState.lastReview = now;

  switch (srsState.status) {
    case wordStatuses.NEW:
    case wordStatuses.LEARNING:
      return processLearningAnswer(newState, answer);
    
    case wordStatuses.REVIEWING:
    case wordStatuses.MASTERED:
      return processReviewAnswer(newState, answer);
    
    default:
      return newState;
  }
};

/**
 * Обробка відповіді для нових слів та слів у вивченні
 */
const processLearningAnswer = (state, answer) => {
  const newState = { ...state };
  
  if (answer === answerButtons.AGAIN) {
    // Повернення на початок
    newState.learningStep = 0;
    newState.status = wordStatuses.LEARNING;
    newState.nextReview = calculateNextReview(intervals.LEARNING_STEPS[0]);
  } 
  else if (answer === answerButtons.EASY) {
    // Відразу переходить на повторення
    newState.status = wordStatuses.REVIEWING;
    newState.interval = intervals.EASY_INTERVAL;
    newState.nextReview = calculateNextReview(intervals.EASY_INTERVAL);
    newState.repetitions = 1;
    newState.learningStep = 0;
  }
  else {
    // GOOD або HARD - переходить до наступного кроку
    const nextStep = newState.learningStep + 1;
    
    if (nextStep >= intervals.LEARNING_STEPS.length) {
      // Закінчив етап вивчення - переходить на повторення
      newState.status = wordStatuses.REVIEWING;
      newState.interval = intervals.GRADUATING_INTERVAL;
      newState.nextReview = calculateNextReview(intervals.GRADUATING_INTERVAL);
      newState.repetitions = 1;
      newState.learningStep = 0;
    } else {
      // Наступний крок вивчення
      newState.status = wordStatuses.LEARNING;
      newState.learningStep = nextStep;
      newState.nextReview = calculateNextReview(intervals.LEARNING_STEPS[nextStep]);
    }
    
    // Якщо HARD - зменшуємо easeFactor
    if (answer === answerButtons.HARD) {
      newState.easeFactor = Math.max(
        easeFactor.MINIMUM,
        newState.easeFactor - easeFactor.HARD_PENALTY
      );
    }
  }
  
  return newState;
};

/**
 * Обробка відповіді для слів на повторенні
 */
const processReviewAnswer = (state, answer) => {
  const newState = { ...state };
  
  if (answer === answerButtons.AGAIN) {
    // Помилка - повертаємось до вивчення
    newState.status = wordStatuses.LEARNING;
    newState.learningStep = 0;
    newState.nextReview = calculateNextReview(intervals.LEARNING_STEPS[0]);
    newState.easeFactor = Math.max(
      easeFactor.MINIMUM,
      newState.easeFactor - easeFactor.AGAIN_PENALTY
    );
  }
  else {
    // Правильна відповідь
    newState.repetitions += 1;
    
    // Розрахунок нового інтервалу
    let newInterval;
    
    if (answer === answerButtons.HARD) {
      newInterval = newState.interval * 1.2;
      newState.easeFactor = Math.max(
        easeFactor.MINIMUM,
        newState.easeFactor - easeFactor.HARD_PENALTY
      );
    }
    else if (answer === answerButtons.EASY) {
      newInterval = newState.interval * newState.easeFactor * 1.3;
      newState.easeFactor += easeFactor.EASY_BONUS;
    }
    else {
      // GOOD
      newInterval = newState.interval * newState.easeFactor;
    }
    
    // Оновлення стану
    newState.interval = Math.round(newInterval);
    newState.nextReview = calculateNextReview(newInterval);
    
    // Перехід до mastered якщо інтервал > 21 днів
    if (newInterval >= 30240) { // 21 день
      newState.status = wordStatuses.MASTERED;
    }
  }
  
  return newState;
};

/**
 * Форматування інтервалу для відображення
 */
export const formatInterval = (minutes) => {
  if (minutes < 60) {
    return `${minutes} хв`;
  } else if (minutes < 1440) {
    const hours = Math.round(minutes / 60);
    return `${hours} год`;
  } else {
    const days = Math.round(minutes / 1440);
    if (days === 1) return '1 день';
    if (days < 5) return `${days} дні`;
    return `${days} днів`;
  }
};

/**
 * Отримати наступні інтервали для кожної кнопки
 */
export const getNextIntervals = (srsState) => {
  const isLearning = srsState.status === wordStatuses.NEW || 
                     srsState.status === wordStatuses.LEARNING;
  
  if (isLearning) {
    const nextStep = srsState.learningStep + 1;
    const goodInterval = nextStep >= intervals.LEARNING_STEPS.length
      ? intervals.GRADUATING_INTERVAL
      : intervals.LEARNING_STEPS[nextStep];
    
    return {
      again: formatInterval(intervals.LEARNING_STEPS[0]),
      hard: formatInterval(Math.round(goodInterval * 0.8)),
      good: formatInterval(goodInterval),
      easy: formatInterval(intervals.EASY_INTERVAL),
    };
  } else {
    const currentInterval = srsState.interval || intervals.GRADUATING_INTERVAL;
    const ef = srsState.easeFactor || easeFactor.DEFAULT;
    
    return {
      again: formatInterval(intervals.LEARNING_STEPS[0]),
      hard: formatInterval(Math.round(currentInterval * 1.2)),
      good: formatInterval(Math.round(currentInterval * ef)),
      easy: formatInterval(Math.round(currentInterval * ef * 1.3)),
    };
  }
};

/**
 * Підрахунок статистики SRS
 */
export const calculateSRSStats = (srsStates) => {
  const stats = {
    total: srsStates.length,
    new: 0,
    learning: 0,
    reviewing: 0,
    mastered: 0,
    dueToday: 0,
    dueNow: 0,
  };
  
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  
  srsStates.forEach(state => {
    // Підрахунок за статусами
    stats[state.status] = (stats[state.status] || 0) + 1;
    
    // Підрахунок до повторення
    if (state.nextReview) {
      const reviewDate = new Date(state.nextReview);
      if (reviewDate <= now) {
        stats.dueNow++;
      }
      if (reviewDate <= endOfDay) {
        stats.dueToday++;
      }
    } else if (state.status === wordStatuses.NEW) {
      stats.dueNow++;
    }
  });
  
  return stats;
};

export default {
  wordStatuses,
  statusNames,
  statusColors,
  intervals,
  easeFactor,
  answerButtons,
  answerButtonNames,
  answerButtonColors,
  createInitialSRSState,
  calculateNextReview,
  isWordDueForReview,
  processAnswer,
  formatInterval,
  getNextIntervals,
  calculateSRSStats,
};
