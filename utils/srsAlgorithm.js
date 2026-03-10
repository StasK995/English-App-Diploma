// utils/srsAlgorithm.js
// Реалізація алгоритму SM-2 (SuperMemo 2)
// Джерело: https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-super-memo-method

// Оцінки користувача
export const RATING = {
  BLACKOUT:   0, // Повний провал, не пам'ятаю
  WRONG:      1, // Неправильно
  HARD:       2, // Правильно, але важко згадав
  GOOD:       3, // Правильно з невеликими труднощами
  EASY:       4, // Правильно, легко
  PERFECT:    5, // Ідеально, без вагань
};

// Назви оцінок для UI (показуємо спрощені 3 кнопки)
export const RATING_LABELS = {
  [RATING.WRONG]: { label: 'Не знаю', emoji: '❌', color: '#E74C3C' },
  [RATING.HARD]:  { label: 'Важко',   emoji: '😅', color: '#F39C12' },
  [RATING.EASY]:  { label: 'Легко',   emoji: '✅', color: '#50C878' },
};

/**
 * Початковий стан нового слова
 */
export const createInitialSRSState = (wordId) => ({
  wordId,
  interval: 0,        // днів до наступного повторення
  easeFactor: 2.5,    // коефіцієнт легкості (2.5 = стандарт)
  repetitions: 0,     // кількість правильних відповідей підряд
  nextReview: new Date().toISOString(), // показуємо одразу
  lastReview: null,
  status: 'new',      // new | learning | reviewing | mastered
});

/**
 * Основна функція алгоритму SM-2
 * Приймає поточний стан слова і оцінку користувача
 * Повертає новий стан
 */
export const calculateNextReview = (state, rating) => {
  let { interval, easeFactor, repetitions } = state;

  // Оновлюємо easeFactor (не може бути менше 1.3)
  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02))
  );

  if (rating < RATING.HARD) {
    // Неправильна відповідь — починаємо заново
    repetitions = 0;
    interval = 1;
  } else {
    // Правильна відповідь
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  // Обмежуємо максимальний інтервал 365 днями
  interval = Math.min(interval, 365);

  // Визначаємо статус слова
  let status;
  if (repetitions === 0) {
    status = 'learning';
  } else if (interval >= 21) {
    status = 'mastered';
  } else {
    status = 'reviewing';
  }

  // Розраховуємо дату наступного повторення
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);
  // Ставимо на початок дня щоб не було проблем з часовими поясами
  nextReview.setHours(0, 0, 0, 0);

  return {
    ...state,
    interval,
    easeFactor,
    repetitions,
    nextReview: nextReview.toISOString(),
    lastReview: new Date().toISOString(),
    status,
  };
};

/**
 * Перевірити чи слово потрібно повторити сьогодні
 */
export const isDueForReview = (srsState) => {
  if (!srsState?.nextReview) return true;
  const now = new Date();
  const reviewDate = new Date(srsState.nextReview);
  return reviewDate <= now;
};

/**
 * Скільки днів до наступного повторення
 */
export const getDaysUntilReview = (srsState) => {
  if (!srsState?.nextReview) return 0;
  const now = new Date();
  const reviewDate = new Date(srsState.nextReview);
  const diff = reviewDate - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

/**
 * Текстовий опис наступного повторення для UI
 */
export const getNextReviewText = (srsState) => {
  const days = getDaysUntilReview(srsState);
  if (days === 0) return 'Сьогодні';
  if (days === 1) return 'Завтра';
  if (days < 7) return `Через ${days} дні`;
  if (days < 30) return `Через ${Math.round(days / 7)} тижні`;
  return `Через ${Math.round(days / 30)} місяці`;
};
