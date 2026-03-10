// utils/database.js
import * as SQLite from 'expo-sqlite';

let db = null;

// ==========================================
// ІНІЦІАЛІЗАЦІЯ
// ==========================================

export const initDatabase = async () => {
  db = await SQLite.openDatabaseAsync('english_app.db');
  await db.execAsync(`PRAGMA journal_mode = WAL;`);
  await db.execAsync(`PRAGMA foreign_keys = ON;`);
  await createTables();
  console.log('✅ Database initialized');
  return db;
};

const createTables = async () => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS words_progress (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      word_id     INTEGER NOT NULL UNIQUE,
      learned_at  TEXT NOT NULL,
      review_count INTEGER DEFAULT 0
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS srs_progress (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      word_id      INTEGER NOT NULL UNIQUE,
      status       TEXT DEFAULT 'new',
      interval     INTEGER DEFAULT 0,
      ease_factor  REAL DEFAULT 2.5,
      repetitions  INTEGER DEFAULT 0,
      learning_step INTEGER DEFAULT 0,
      next_review  TEXT,
      last_review  TEXT
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS grammar_progress (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      topic_id     TEXT NOT NULL UNIQUE,
      completed    INTEGER DEFAULT 0,
      score        INTEGER DEFAULT 0,
      last_studied TEXT
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS completed_exercises (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      topic_id      TEXT NOT NULL,
      exercise_type TEXT,
      score         INTEGER,
      total_questions INTEGER,
      completed_at  TEXT NOT NULL
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS quiz_history (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      levels      TEXT NOT NULL,
      categories  TEXT NOT NULL,
      score       INTEGER NOT NULL,
      total       INTEGER NOT NULL,
      percentage  INTEGER NOT NULL,
      played_at   TEXT NOT NULL
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS user_stats (
      id              INTEGER PRIMARY KEY CHECK (id = 1),
      current_streak  INTEGER DEFAULT 0,
      longest_streak  INTEGER DEFAULT 0,
      today_words     INTEGER DEFAULT 0,
      last_active_date TEXT DEFAULT '',
      last_today_reset TEXT DEFAULT ''
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS listening_progress (
      lesson_id    TEXT PRIMARY KEY,
      score        INTEGER NOT NULL,
      total        INTEGER NOT NULL,
      percentage   INTEGER NOT NULL,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.execAsync(`INSERT OR IGNORE INTO user_stats (id) VALUES (1);`);
};

export const getDb = () => {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.');
  return db;
};


// ==========================================
// WORDS PROGRESS
// ==========================================

export const getKnownWordIds = async () => {
  const rows = await db.getAllAsync(`SELECT word_id FROM words_progress;`);
  return rows.map(r => r.word_id);
};

export const isWordKnown = async (wordId) => {
  const row = await db.getFirstAsync(
    `SELECT id FROM words_progress WHERE word_id = ?;`, [wordId]
  );
  return !!row;
};

export const markWordAsKnown = async (wordId) => {
  await db.runAsync(
    `INSERT OR IGNORE INTO words_progress (word_id, learned_at) VALUES (?, ?);`,
    [wordId, new Date().toISOString()]
  );
  await updateTodayWords();
  await updateStreak();
};

export const unmarkWordAsKnown = async (wordId) => {
  await db.runAsync(`DELETE FROM words_progress WHERE word_id = ?;`, [wordId]);
};

export const getLearnedWordsCount = async () => {
  const row = await db.getFirstAsync(`SELECT COUNT(*) as count FROM words_progress;`);
  return row?.count || 0;
};

// ✅ Рахує і вивчені (words_progress) і в процесі (srs_progress)
export const getLearnedCountForWordIds = async (wordIds) => {
  if (wordIds.length === 0) return 0;
  const placeholders = wordIds.map(() => '?').join(',');
  const learned = await db.getFirstAsync(
    `SELECT COUNT(*) as count FROM words_progress WHERE word_id IN (${placeholders});`,
    wordIds
  );
  const inProgress = await db.getFirstAsync(
    `SELECT COUNT(*) as count FROM srs_progress WHERE word_id IN (${placeholders});`,
    wordIds
  );
  return (learned?.count || 0) + (inProgress?.count || 0);
};

export const getProgressByDay = async (days = 7) => {
  const rows = await db.getAllAsync(`
    SELECT DATE(learned_at) as date, COUNT(*) as count
    FROM words_progress
    WHERE learned_at >= DATE('now', '-${days} days')
    GROUP BY DATE(learned_at)
    ORDER BY date ASC;
  `);
  return rows;
};


// ==========================================
// SRS PROGRESS
// ==========================================

export const getSRSState = async (wordId) => {
  return await db.getFirstAsync(
    `SELECT * FROM srs_progress WHERE word_id = ?;`, [wordId]
  );
};

export const saveSRSState = async (srsState) => {
  await db.runAsync(`
    INSERT INTO srs_progress
      (word_id, status, interval, ease_factor, repetitions, learning_step, next_review, last_review)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(word_id) DO UPDATE SET
      status        = excluded.status,
      interval      = excluded.interval,
      ease_factor   = excluded.ease_factor,
      repetitions   = excluded.repetitions,
      learning_step = excluded.learning_step,
      next_review   = excluded.next_review,
      last_review   = excluded.last_review;
  `, [
    srsState.wordId, srsState.status, srsState.interval,
    srsState.easeFactor, srsState.repetitions, srsState.learningStep,
    srsState.nextReview, srsState.lastReview,
  ]);
};

export const getWordsDueForReview = async () => {
  const now = new Date().toISOString();
  return await db.getAllAsync(`
    SELECT word_id FROM srs_progress
    WHERE next_review <= ? OR next_review IS NULL
    ORDER BY next_review ASC;
  `, [now]);
};

export const getSRSStats = async () => {
  const rows = await db.getAllAsync(`
    SELECT status, COUNT(*) as count FROM srs_progress GROUP BY status;
  `);
  const stats = { new: 0, learning: 0, reviewing: 0, mastered: 0 };
  rows.forEach(r => { stats[r.status] = r.count; });
  return stats;
};

export const getSRSStatesForWords = async (wordIds) => {
  if (!wordIds || wordIds.length === 0) return {};
  const placeholders = wordIds.map(() => '?').join(',');
  const rows = await db.getAllAsync(
    `SELECT * FROM srs_progress WHERE word_id IN (${placeholders});`,
    wordIds
  );
  const result = {};
  rows.forEach(r => { result[r.word_id] = r; });
  return result;
};

export const getWordsForSRSSession = async (allLevelWords, maxCount = 20) => {
  const wordIds = allLevelWords.map(w => w.id);
  if (wordIds.length === 0) return { dueWords: [], newWords: [], sessionWords: [] };

  const placeholders = wordIds.map(() => '?').join(',');
  const now = new Date().toISOString();

  const dueRows = await db.getAllAsync(`
    SELECT word_id FROM srs_progress
    WHERE word_id IN (${placeholders}) AND next_review <= ?
    ORDER BY next_review ASC;
  `, [...wordIds, now]);

  const dueIds = new Set(dueRows.map(r => r.word_id));

  const existingRows = await db.getAllAsync(`
    SELECT word_id FROM srs_progress WHERE word_id IN (${placeholders});
  `, wordIds);

  const existingIds = new Set(existingRows.map(r => r.word_id));
  const newIds = wordIds.filter(id => !existingIds.has(id));

  const dueWords = allLevelWords.filter(w => dueIds.has(w.id));
  const newWords = allLevelWords.filter(w => newIds.includes(w.id));

  const result = [
    ...dueWords,
    ...newWords.slice(0, Math.max(0, maxCount - dueWords.length)),
  ].slice(0, maxCount);

  return {
    dueWords,
    newWords: newWords.slice(0, Math.max(0, maxCount - dueWords.length)),
    sessionWords: result,
  };
};

export const saveSRSResult = async (srsState) => {
  await db.runAsync(`
    INSERT INTO srs_progress
      (word_id, status, interval, ease_factor, repetitions, next_review, last_review)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(word_id) DO UPDATE SET
      status      = excluded.status,
      interval    = excluded.interval,
      ease_factor = excluded.ease_factor,
      repetitions = excluded.repetitions,
      next_review = excluded.next_review,
      last_review = excluded.last_review;
  `, [
    srsState.wordId, srsState.status, srsState.interval,
    srsState.easeFactor, srsState.repetitions,
    srsState.nextReview, srsState.lastReview,
  ]);

  if (srsState.status === 'mastered') {
    await db.runAsync(
      `INSERT OR IGNORE INTO words_progress (word_id, learned_at) VALUES (?, ?);`,
      [srsState.wordId, new Date().toISOString()]
    );
  }
};

export const getSRSStatsByLevel = async (levelWordIds) => {
  if (!levelWordIds || levelWordIds.length === 0) {
    return { new: 0, learning: 0, reviewing: 0, mastered: 0, due: 0 };
  }

  const placeholders = levelWordIds.map(() => '?').join(',');
  const now = new Date().toISOString();

  const statusRows = await db.getAllAsync(`
    SELECT status, COUNT(*) as count
    FROM srs_progress
    WHERE word_id IN (${placeholders})
    GROUP BY status;
  `, levelWordIds);

  const dueRow = await db.getFirstAsync(`
    SELECT COUNT(*) as count FROM srs_progress
    WHERE word_id IN (${placeholders}) AND next_review <= ?;
  `, [...levelWordIds, now]);

  const stats = { new: 0, learning: 0, reviewing: 0, mastered: 0, due: dueRow?.count || 0 };
  statusRows.forEach(r => { stats[r.status] = r.count; });

  const existingRow = await db.getFirstAsync(`
    SELECT COUNT(*) as count FROM srs_progress WHERE word_id IN (${placeholders});
  `, levelWordIds);

  stats.new = levelWordIds.length - (existingRow?.count || 0);
  return stats;
};

export const getSRSReviewsByDay = async (days = 7) => {
  const rows = await db.getAllAsync(`
    SELECT DATE(last_review) as date, COUNT(*) as count
    FROM srs_progress
    WHERE last_review >= DATE('now', '-${days} days')
    GROUP BY DATE(last_review)
    ORDER BY date ASC;
  `);
  return rows;
};

export const getTodaySRSCount = async () => {
  const today = new Date().toISOString().split('T')[0];
  const row = await db.getFirstAsync(`
    SELECT COUNT(*) as count FROM srs_progress WHERE DATE(last_review) = ?;
  `, [today]);
  return row?.count || 0;
};

export const getBestQuizScore = async () => {
  const row = await db.getFirstAsync(`
    SELECT MAX(percentage) as best FROM quiz_history;
  `);
  return row?.best || 0;
};


// ==========================================
// GRAMMAR PROGRESS
// ==========================================

export const getGrammarProgress = async () => {
  const rows = await db.getAllAsync(`SELECT * FROM grammar_progress;`);
  const result = {};
  rows.forEach(r => {
    result[r.topic_id] = {
      completed: !!r.completed,
      score: r.score,
      lastStudied: r.last_studied,
    };
  });
  return result;
};

export const getTopicProgress = async (topicId) => {
  return await db.getFirstAsync(
    `SELECT * FROM grammar_progress WHERE topic_id = ?;`, [topicId]
  );
};

export const saveTopicProgress = async (topicId, completed, score) => {
  await db.runAsync(`
    INSERT INTO grammar_progress (topic_id, completed, score, last_studied)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(topic_id) DO UPDATE SET
      completed    = excluded.completed,
      score        = excluded.score,
      last_studied = excluded.last_studied;
  `, [topicId, completed ? 1 : 0, score, new Date().toISOString()]);
};

export const markTopicAsCompleted = async (topicId, score) => {
  await saveTopicProgress(topicId, true, score);
};

export const addCompletedExercise = async (topicId, exerciseType, score, totalQuestions) => {
  await db.runAsync(`
    INSERT INTO completed_exercises (topic_id, exercise_type, score, total_questions, completed_at)
    VALUES (?, ?, ?, ?, ?);
  `, [topicId, exerciseType, score, totalQuestions, new Date().toISOString()]);
};

export const getGrammarStats = async () => {
  const topicsStudied = await db.getFirstAsync(
    `SELECT COUNT(*) as count FROM grammar_progress;`
  );
  const topicsCompleted = await db.getFirstAsync(
    `SELECT COUNT(*) as count FROM grammar_progress WHERE completed = 1;`
  );
  const exercisesCompleted = await db.getFirstAsync(
    `SELECT COUNT(*) as count FROM completed_exercises;`
  );
  const avgScore = await db.getFirstAsync(
    `SELECT AVG(score) as avg FROM grammar_progress WHERE score > 0;`
  );
  return {
    totalTopicsStudied: topicsStudied?.count || 0,
    topicsCompleted: topicsCompleted?.count || 0,
    totalExercisesCompleted: exercisesCompleted?.count || 0,
    averageScore: Math.round(avgScore?.avg || 0),
  };
};

export const getGrammarProgressByLevel = async (topics) => {
  const progress = await getGrammarProgress();
  const levelStats = {};
  topics.forEach(topic => {
    if (!levelStats[topic.level]) {
      levelStats[topic.level] = { total: 0, studied: 0, completed: 0 };
    }
    levelStats[topic.level].total++;
    if (progress[topic.id]) {
      levelStats[topic.level].studied++;
      if (progress[topic.id].completed) {
        levelStats[topic.level].completed++;
      }
    }
  });
  return levelStats;
};

export const resetGrammarProgress = async () => {
  await db.execAsync(`DELETE FROM grammar_progress;`);
  await db.execAsync(`DELETE FROM completed_exercises;`);
};


// ==========================================
// QUIZ HISTORY
// ==========================================

export const saveQuizResult = async (levels, categories, score, total) => {
  const percentage = Math.round((score / total) * 100);
  await db.runAsync(`
    INSERT INTO quiz_history (levels, categories, score, total, percentage, played_at)
    VALUES (?, ?, ?, ?, ?, ?);
  `, [
    JSON.stringify(levels), JSON.stringify(categories),
    score, total, percentage, new Date().toISOString(),
  ]);
  await db.execAsync(`
    DELETE FROM quiz_history WHERE id NOT IN (
      SELECT id FROM quiz_history ORDER BY played_at DESC LIMIT 100
    );
  `);
};

export const getQuizHistory = async (limit = 50) => {
  const rows = await db.getAllAsync(`
    SELECT * FROM quiz_history ORDER BY played_at DESC LIMIT ?;
  `, [limit]);
  return rows.map(r => ({
    ...r,
    levels: JSON.parse(r.levels),
    categories: JSON.parse(r.categories),
  }));
};

export const getQuizStats = async () => {
  const row = await db.getFirstAsync(`
    SELECT COUNT(*) as total, AVG(percentage) as avg_score FROM quiz_history;
  `);
  return {
    total: row?.total || 0,
    averageScore: Math.round(row?.avg_score || 0),
  };
};


// ==========================================
// USER STATS
// ==========================================

export const getUserStats = async () => {
  return await db.getFirstAsync(`SELECT * FROM user_stats WHERE id = 1;`);
};

export const updateTodayWords = async () => {
  const today = new Date().toDateString();
  const stats = await getUserStats();
  if (stats?.last_today_reset !== today) {
    await db.runAsync(`
      UPDATE user_stats SET today_words = 1, last_today_reset = ? WHERE id = 1;
    `, [today]);
  } else {
    await db.runAsync(`UPDATE user_stats SET today_words = today_words + 1 WHERE id = 1;`);
  }
};

export const updateStreak = async () => {
  const today = new Date().toDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  const stats = await getUserStats();
  if (!stats) return;
  if (stats.last_active_date === today) return;

  const newStreak = stats.last_active_date === yesterdayStr
    ? stats.current_streak + 1
    : 1;
  const longestStreak = Math.max(newStreak, stats.longest_streak || 0);

  await db.runAsync(`
    UPDATE user_stats
    SET current_streak = ?, longest_streak = ?, last_active_date = ?
    WHERE id = 1;
  `, [newStreak, longestStreak, today]);
};

export const resetAllProgress = async () => {
  await db.execAsync(`DELETE FROM words_progress;`);
  await db.execAsync(`DELETE FROM srs_progress;`);
  await db.execAsync(`DELETE FROM grammar_progress;`);
  await db.execAsync(`DELETE FROM completed_exercises;`);
  await db.execAsync(`DELETE FROM quiz_history;`);
  await db.execAsync(`DELETE FROM listening_progress;`);
  await db.runAsync(`
    UPDATE user_stats SET
      current_streak = 0, longest_streak = 0, today_words = 0,
      last_active_date = '', last_today_reset = ''
    WHERE id = 1;
  `);
};


// ==========================================
// LISTENING PROGRESS
// ==========================================

export const saveListeningResult = async (lessonId, score, total) => {
  const percentage = Math.round((score / total) * 100);
  await db.runAsync(`
    INSERT INTO listening_progress (lesson_id, score, total, percentage, completed_at)
    VALUES (?, ?, ?, ?, datetime('now'))
    ON CONFLICT(lesson_id) DO UPDATE SET
      score        = excluded.score,
      total        = excluded.total,
      percentage   = excluded.percentage,
      completed_at = excluded.completed_at;
  `, [lessonId, score, total, percentage]);
};

export const getListeningProgress = async () => {
  const rows = await db.getAllAsync(`SELECT * FROM listening_progress;`);
  const result = {};
  for (const row of rows) {
    result[row.lesson_id] = row;
  }
  return result;
};

export const getListeningStats = async () => {
  const row = await db.getFirstAsync(`
    SELECT COUNT(*) as completed, AVG(percentage) as avgScore
    FROM listening_progress;
  `);
  return {
    completed: row?.completed || 0,
    avgScore: Math.round(row?.avgScore || 0),
  };
};