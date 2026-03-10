// data/listening/index.js
// Головний файл — збирає всі уроки з папок рівнів
// Щоб додати урок: створи файл в потрібній папці та імпортуй тут

// ── A1 ──────────────────────────────────────
import A1_01 from './A1/01_greetings';
import A1_02 from './A1/02_numbers';
import A1_03 from './A1/03_colors';

// ── A2 ──────────────────────────────────────
import A2_01 from './A2/01_daily_routines';
import A2_02 from './A2/02_shopping';
import A2_03 from './A2/03_describing_people';

// ── B1 ──────────────────────────────────────
import B1_01 from './B1/01_travel';
import B1_02 from './B1/02_work';
import B1_03 from './B1/03_health';

// ── B2 ──────────────────────────────────────
import B2_01 from './B2/01_environment';
import B2_02 from './B2/02_technology';
import B2_03 from './B2/03_education';

// ── C1 ──────────────────────────────────────
import C1_01 from './C1/01_economics';
import C1_02 from './C1/02_psychology';
import C1_03 from './C1/03_media';

// ── C2 ──────────────────────────────────────
import C2_01 from './C2/01_philosophy';
import C2_02 from './C2/02_academic';
import C2_03 from './C2/03_world_issues';

// ============================================
// Конфіг рівнів
// ============================================
export const LISTENING_LEVELS = [
  { code: 'A1', name: 'Початковий',       color: '#4CAF50', emoji: '🌱' },
  { code: 'A2', name: 'Елементарний',     color: '#8BC34A', emoji: '🌿' },
  { code: 'B1', name: 'Середній',         color: '#FFC107', emoji: '🌟' },
  { code: 'B2', name: 'Вище середнього',  color: '#FF9800', emoji: '🔥' },
  { code: 'C1', name: 'Просунутий',       color: '#F44336', emoji: '💎' },
  { code: 'C2', name: 'Майстерність',     color: '#9C27B0', emoji: '👑' },
];

// ============================================
// Уроки згруповані по рівнях
// Щоб додати урок — імпортуй вище і додай сюди
// ============================================
export const LISTENING_LESSONS = {
  A1: [A1_01, A1_02, A1_03],
  A2: [A2_01, A2_02, A2_03],
  B1: [B1_01, B1_02, B1_03],
  B2: [B2_01, B2_02, B2_03],
  C1: [C1_01, C1_02, C1_03],
  C2: [C2_01, C2_02, C2_03],
};

// ============================================
// Хелпери
// ============================================

// Отримати уроки для конкретного рівня
export const getListeningLessonsForLevel = (level) => {
  return LISTENING_LESSONS[level] || [];
};

// Отримати загальну кількість уроків
export const getTotalLessonsCount = () => {
  return Object.values(LISTENING_LESSONS).reduce((acc, lessons) => acc + lessons.length, 0);
};

// Знайти урок по id
export const getLessonById = (id) => {
  for (const lessons of Object.values(LISTENING_LESSONS)) {
    const found = lessons.find(l => l.id === id);
    if (found) return found;
  }
  return null;
};

// ============================================
// ШАБЛОН ДЛЯ НОВОГО УРОКУ:
// ============================================
/*
export default {
  id: 'a1_04',           // унікальний id: рівень_номер
  level: 'A1',           // рівень
  order: 4,              // порядок в рівні
  title: 'Назва уроку',
  description: 'Короткий опис теми',
  youtubeId: 'YOUTUBE_ID', // id відео з YouTube URL
  duration: '5:00',
  questions: [
    {
      id: 'q1',
      text: 'Питання?',
      options: ['Варіант A', 'Варіант B', 'Варіант C', 'Варіант D'],
      correct: 0, // індекс правильної відповіді (0=A, 1=B, 2=C, 3=D)
    },
  ],
};
*/
