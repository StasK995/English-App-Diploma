// utils/grammarStorage.js
// Утиліти для роботи з прогресом граматики в AsyncStorage

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  GRAMMAR_PROGRESS: 'grammarProgress', // { topicId: { completed: bool, score: number, lastStudied: date } }
  COMPLETED_EXERCISES: 'completedExercises', // [{ topicId, exerciseType, score, date }]
  GRAMMAR_STATS: 'grammarStats', // { totalTopicsStudied, totalExercisesCompleted, averageScore }
};

// ==================== Прогрес тем ====================

// Отримати прогрес всіх тем
export const getGrammarProgress = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.GRAMMAR_PROGRESS);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error getting grammar progress:', error);
    return {};
  }
};

// Отримати прогрес конкретної теми
export const getTopicProgress = async (topicId) => {
  try {
    const progress = await getGrammarProgress();
    return progress[topicId] || null;
  } catch (error) {
    console.error('Error getting topic progress:', error);
    return null;
  }
};

// Зберегти прогрес теми
export const saveTopicProgress = async (topicId, data) => {
  try {
    const progress = await getGrammarProgress();
    progress[topicId] = {
      ...progress[topicId],
      ...data,
      lastStudied: new Date().toISOString(),
    };
    await AsyncStorage.setItem(KEYS.GRAMMAR_PROGRESS, JSON.stringify(progress));
    return true;
  } catch (error) {
    console.error('Error saving topic progress:', error);
    return false;
  }
};

// Позначити тему як завершену
export const markTopicAsCompleted = async (topicId, score) => {
  return await saveTopicProgress(topicId, {
    completed: true,
    score: score,
  });
};

// ==================== Історія вправ ====================

// Отримати історію всіх вправ
export const getCompletedExercises = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.COMPLETED_EXERCISES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting completed exercises:', error);
    return [];
  }
};

// Додати запис про виконану вправу
export const addCompletedExercise = async (exerciseData) => {
  try {
    const exercises = await getCompletedExercises();
    const newExercise = {
      ...exerciseData,
      date: new Date().toISOString(),
      id: Date.now(), // Унікальний ID
    };
    exercises.push(newExercise);
    await AsyncStorage.setItem(KEYS.COMPLETED_EXERCISES, JSON.stringify(exercises));
    
    // Оновити статистику
    await updateGrammarStats();
    
    return true;
  } catch (error) {
    console.error('Error adding completed exercise:', error);
    return false;
  }
};

// ==================== Статистика граматики ====================

// Отримати статистику
export const getGrammarStats = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.GRAMMAR_STATS);
    if (data) return JSON.parse(data);

    // Якщо немає статистики - обчислити з нуля
    return await calculateGrammarStats();
  } catch (error) {
    console.error('Error getting grammar stats:', error);
    return {
      totalTopicsStudied: 0,
      totalExercisesCompleted: 0,
      averageScore: 0,
      topicsCompleted: 0,
    };
  }
};

// Обчислити статистику з історії
const calculateGrammarStats = async () => {
  try {
    const progress = await getGrammarProgress();
    const exercises = await getCompletedExercises();

    const topicsStudied = Object.keys(progress).length;
    const topicsCompleted = Object.values(progress).filter(p => p.completed).length;
    const totalExercises = exercises.length;
    
    let totalScore = 0;
    let scoreCount = 0;
    
    // Підрахунок середнього балу
    Object.values(progress).forEach(topic => {
      if (topic.score !== undefined) {
        totalScore += topic.score;
        scoreCount++;
      }
    });

    const averageScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

    const stats = {
      totalTopicsStudied: topicsStudied,
      totalExercisesCompleted: totalExercises,
      averageScore: averageScore,
      topicsCompleted: topicsCompleted,
    };

    await AsyncStorage.setItem(KEYS.GRAMMAR_STATS, JSON.stringify(stats));
    return stats;
  } catch (error) {
    console.error('Error calculating grammar stats:', error);
    return {
      totalTopicsStudied: 0,
      totalExercisesCompleted: 0,
      averageScore: 0,
      topicsCompleted: 0,
    };
  }
};

// Оновити статистику
export const updateGrammarStats = async () => {
  return await calculateGrammarStats();
};

// ==================== Статистика за рівнями ====================

// Отримати прогрес за рівнями
export const getProgressByLevel = async (topics) => {
  try {
    const progress = await getGrammarProgress();
    const levelStats = {};

    // Групуємо теми за рівнями
    topics.forEach(topic => {
      if (!levelStats[topic.level]) {
        levelStats[topic.level] = {
          total: 0,
          studied: 0,
          completed: 0,
        };
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
  } catch (error) {
    console.error('Error getting progress by level:', error);
    return {};
  }
};

// ==================== Скидання прогресу ====================

// Скинути весь прогрес граматики
export const resetGrammarProgress = async () => {
  try {
    await AsyncStorage.setItem(KEYS.GRAMMAR_PROGRESS, JSON.stringify({}));
    await AsyncStorage.setItem(KEYS.COMPLETED_EXERCISES, JSON.stringify([]));
    await AsyncStorage.setItem(KEYS.GRAMMAR_STATS, JSON.stringify({
      totalTopicsStudied: 0,
      totalExercisesCompleted: 0,
      averageScore: 0,
      topicsCompleted: 0,
    }));
    return true;
  } catch (error) {
    console.error('Error resetting grammar progress:', error);
    return false;
  }
};

// ==================== Допоміжні функції ====================

// Перевірити чи тема вивчена
export const isTopicStudied = async (topicId) => {
  const progress = await getTopicProgress(topicId);
  return progress !== null;
};

// Перевірити чи тема завершена
export const isTopicCompleted = async (topicId) => {
  const progress = await getTopicProgress(topicId);
  return progress && progress.completed === true;
};

// Отримати останні вивчені теми
export const getRecentTopics = async (limit = 5) => {
  try {
    const progress = await getGrammarProgress();
    const topics = Object.entries(progress)
      .map(([topicId, data]) => ({
        topicId,
        ...data,
      }))
      .sort((a, b) => new Date(b.lastStudied) - new Date(a.lastStudied))
      .slice(0, limit);
    return topics;
  } catch (error) {
    console.error('Error getting recent topics:', error);
    return [];
  }
};

export default {
  getGrammarProgress,
  getTopicProgress,
  saveTopicProgress,
  markTopicAsCompleted,
  getCompletedExercises,
  addCompletedExercise,
  getGrammarStats,
  updateGrammarStats,
  getProgressByLevel,
  resetGrammarProgress,
  isTopicStudied,
  isTopicCompleted,
  getRecentTopics,
};