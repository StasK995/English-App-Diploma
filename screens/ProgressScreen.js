import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllWords } from '../data/vocabulary_words';
import { levels, categories } from '../data/vocabulary_config';
import { getGrammarStats, getProgressByLevel as getGrammarProgressByLevel, resetGrammarProgress } from '../utils/grammarStorage';
import { GRAMMAR_TOPICS } from '../data/grammar_topics';
import { GRAMMAR_LEVELS } from '../data/grammar_config';

export default function ProgressScreen() {
  const [stats, setStats] = useState({
    wordsLearned: 0,
    currentStreak: 0,
    todayWords: 0,
    totalWords: 0,
  });
  
  const [grammarStats, setGrammarStats] = useState({
    totalTopicsStudied: 0,
    totalExercisesCompleted: 0,
    averageScore: 0,
    topicsCompleted: 0,
  });
  
  const [grammarLevelProgress, setGrammarLevelProgress] = useState({});
  const [quizHistory, setQuizHistory] = useState([]);
  const [knownWords, setKnownWords] = useState([]);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      // Словник
      const wordsLearned = await AsyncStorage.getItem('wordsLearned');
      const currentStreak = await AsyncStorage.getItem('currentStreak');
      const todayWords = await AsyncStorage.getItem('todayWords');
      const quizHistoryData = await AsyncStorage.getItem('quizHistory');
      const knownWordsData = await AsyncStorage.getItem('knownWords');

      const allWords = getAllWords();

      setStats({
        wordsLearned: parseInt(wordsLearned) || 0,
        currentStreak: parseInt(currentStreak) || 0,
        todayWords: parseInt(todayWords) || 0,
        totalWords: allWords.length,
      });

      setQuizHistory(quizHistoryData ? JSON.parse(quizHistoryData) : []);
      setKnownWords(knownWordsData ? JSON.parse(knownWordsData) : []);
      
      // Граматика
      const grammarData = await getGrammarStats();
      setGrammarStats(grammarData);
      
      const grammarLevels = await getGrammarProgressByLevel(GRAMMAR_TOPICS);
      setGrammarLevelProgress(grammarLevels);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const resetProgress = () => {
    Alert.alert(
      'Скинути прогрес?',
      'Ви впевнені, що хочете видалити всі дані про навчання (словник + граматика)? Цю дію не можна скасувати.',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Скинути',
          style: 'destructive',
          onPress: async () => {
            try {
              // Словник
              await AsyncStorage.setItem('wordsLearned', '0');
              await AsyncStorage.setItem('currentStreak', '0');
              await AsyncStorage.setItem('todayWords', '0');
              await AsyncStorage.setItem('knownWords', JSON.stringify([]));
              await AsyncStorage.setItem('quizHistory', JSON.stringify([]));
              
              // Граматика
              await resetGrammarProgress();
              
              loadProgress();
              Alert.alert('Готово', 'Прогрес скинуто успішно!');
            } catch (error) {
              console.error('Error resetting progress:', error);
              Alert.alert('Помилка', 'Не вдалося скинути прогрес');
            }
          },
        },
      ]
    );
  };

  const StatCard = ({ emoji, value, label, color = '#4A90E2' }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <View style={styles.statContent}>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );

  const QuizHistoryItem = ({ result, index }) => {
    const date = new Date(result.date);
    const formattedDate = date.toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

    let gradeColor = '#E74C3C';
    if (result.percentage >= 90) gradeColor = '#50C878';
    else if (result.percentage >= 70) gradeColor = '#F39C12';

    const levelData = levels.find(l => l.code === result.level);

    return (
      <View style={styles.quizItem}>
        <View style={styles.quizItemLeft}>
          <Text style={styles.quizItemNumber}>#{quizHistory.length - index}</Text>
          <View>
            <View style={styles.quizItemHeader}>
              <Text style={styles.quizItemDate}>{formattedDate}</Text>
              {result.level && (
                <View style={[styles.quizLevelBadge, { backgroundColor: levelData?.color || '#4A90E2' }]}>
                  <Text style={styles.quizLevelText}>{result.level}</Text>
                </View>
              )}
            </View>
            <Text style={styles.quizItemScore}>
              {result.score} / {result.total} правильних
            </Text>
          </View>
        </View>
        <View style={[styles.quizItemBadge, { backgroundColor: gradeColor }]}>
          <Text style={styles.quizItemPercentage}>{result.percentage}%</Text>
        </View>
      </View>
    );
  };

  const completionPercentage = stats.totalWords > 0
    ? Math.round((stats.wordsLearned / stats.totalWords) * 100)
    : 0;

  const averageQuizScore = quizHistory.length > 0
    ? Math.round(
        quizHistory.reduce((sum, quiz) => sum + quiz.percentage, 0) /
          quizHistory.length
      )
    : 0;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ваш прогрес 📊</Text>
        <Text style={styles.subtitle}>Продовжуйте навчання щодня!</Text>
      </View>

      {/* Main Stats */}
      <View style={styles.statsGrid}>
        <StatCard
          emoji="📚"
          value={`${stats.wordsLearned} / ${stats.totalWords}`}
          label="Слів вивчено"
          color="#4A90E2"
        />
        <StatCard
          emoji="🔥"
          value={stats.currentStreak}
          label="Днів підряд"
          color="#E74C3C"
        />
        <StatCard
          emoji="⭐"
          value={stats.todayWords}
          label="Сьогодні"
          color="#F39C12"
        />
        <StatCard
          emoji="📈"
          value={`${completionPercentage}%`}
          label="Завершено"
          color="#50C878"
        />
      </View>

      {/* Grammar Stats */}
      {grammarStats.totalTopicsStudied > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Граматика</Text>
          <View style={styles.grammarStatsCard}>
            <View style={styles.grammarStatItem}>
              <Text style={styles.grammarStatValue}>{grammarStats.topicsCompleted}</Text>
              <Text style={styles.grammarStatLabel}>Тем завершено</Text>
            </View>
            <View style={styles.quizStatDivider} />
            <View style={styles.grammarStatItem}>
              <Text style={[styles.grammarStatValue, { color: '#9C27B0' }]}>
                {grammarStats.totalExercisesCompleted}
              </Text>
              <Text style={styles.grammarStatLabel}>Вправ виконано</Text>
            </View>
            <View style={styles.quizStatDivider} />
            <View style={styles.grammarStatItem}>
              <Text style={[styles.grammarStatValue, { color: '#50C878' }]}>
                {grammarStats.averageScore}%
              </Text>
              <Text style={styles.grammarStatLabel}>Середній бал</Text>
            </View>
          </View>
        </View>
      )}

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.sectionTitle}>Загальний прогрес словника</Text>
          <Text style={styles.progressPercentage}>{completionPercentage}%</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View
            style={[styles.progressBar, { width: `${completionPercentage}%` }]}
          />
        </View>
        <Text style={styles.progressText}>
          {stats.wordsLearned} з {stats.totalWords} слів
        </Text>
      </View>

      {/* Vocabulary Level Progress */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Прогрес словника за рівнями</Text>
        <View style={styles.levelProgressContainer}>
          {levels.map((level) => {
            const allWords = getAllWords();
            const levelWords = allWords.filter(w => w.level === level.code);
            const learnedLevelWords = levelWords.filter(w => knownWords.includes(w.id));
            const levelPercentage = levelWords.length > 0 
              ? Math.round((learnedLevelWords.length / levelWords.length) * 100)
              : 0;
            
            return (
              <View key={level.code} style={styles.levelProgressItem}>
                <View style={styles.levelProgressHeader}>
                  <View style={[styles.levelDot, { backgroundColor: level.color }]} />
                  <Text style={styles.levelProgressCode}>{level.code}</Text>
                  <Text style={styles.levelProgressCount}>
                    {learnedLevelWords.length}/{levelWords.length}
                  </Text>
                </View>
                <View style={styles.levelProgressBarContainer}>
                  <View 
                    style={[
                      styles.levelProgressBar, 
                      { width: `${levelPercentage}%`, backgroundColor: level.color }
                    ]} 
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Grammar Level Progress */}
      {grammarStats.totalTopicsStudied > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Прогрес граматики за рівнями</Text>
          <View style={styles.levelProgressContainer}>
            {Object.entries(GRAMMAR_LEVELS).map(([key, level]) => {
              const progress = grammarLevelProgress[level.id] || { total: 0, studied: 0, completed: 0 };
              const levelPercentage = progress.total > 0 
                ? Math.round((progress.completed / progress.total) * 100)
                : 0;
              
              if (progress.total === 0) return null;
              
              return (
                <View key={level.id} style={styles.levelProgressItem}>
                  <View style={styles.levelProgressHeader}>
                    <View style={[styles.levelDot, { backgroundColor: level.color }]} />
                    <Text style={styles.levelProgressCode}>{level.id}</Text>
                    <Text style={styles.levelProgressCount}>
                      {progress.completed}/{progress.total}
                    </Text>
                  </View>
                  <View style={styles.levelProgressBarContainer}>
                    <View 
                      style={[
                        styles.levelProgressBar, 
                        { width: `${levelPercentage}%`, backgroundColor: level.color }
                      ]} 
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Quiz Statistics */}
      {quizHistory.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Статистика вікторин</Text>
          <View style={styles.quizStatsCard}>
            <View style={styles.quizStatItem}>
              <Text style={styles.quizStatValue}>{quizHistory.length}</Text>
              <Text style={styles.quizStatLabel}>Пройдено</Text>
            </View>
            <View style={styles.quizStatDivider} />
            <View style={styles.quizStatItem}>
              <Text style={[styles.quizStatValue, { color: '#50C878' }]}>
                {averageQuizScore}%
              </Text>
              <Text style={styles.quizStatLabel}>Середній бал</Text>
            </View>
          </View>
        </View>
      )}

      {/* Quiz History */}
      {quizHistory.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Історія вікторин</Text>
          {[...quizHistory].reverse().slice(0, 10).map((result, index) => (
            <QuizHistoryItem key={index} result={result} index={index} />
          ))}
          {quizHistory.length > 10 && (
            <Text style={styles.moreText}>
              Показано останні 10 з {quizHistory.length} вікторин
            </Text>
          )}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateEmoji}>📝</Text>
          <Text style={styles.emptyStateText}>
            Ви ще не проходили вікторини
          </Text>
          <Text style={styles.emptyStateSubtext}>
            Перейдіть у розділ "Вікторина" щоб перевірити свої знання!
          </Text>
        </View>
      )}

      {/* Achievements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Досягнення 🏆</Text>
        <View style={styles.achievementsGrid}>
          <View
            style={[
              styles.achievementCard,
              stats.wordsLearned >= 10 && styles.achievementUnlocked,
            ]}
          >
            <Text style={styles.achievementEmoji}>🌟</Text>
            <Text style={styles.achievementTitle}>Перші кроки</Text>
            <Text style={styles.achievementDesc}>Вивчіть 10 слів</Text>
          </View>
          <View
            style={[
              styles.achievementCard,
              grammarStats.topicsCompleted >= 3 && styles.achievementUnlocked,
            ]}
          >
            <Text style={styles.achievementEmoji}>📚</Text>
            <Text style={styles.achievementTitle}>Граматист</Text>
            <Text style={styles.achievementDesc}>3 теми граматики</Text>
          </View>
          <View
            style={[
              styles.achievementCard,
              stats.currentStreak >= 3 && styles.achievementUnlocked,
            ]}
          >
            <Text style={styles.achievementEmoji}>🔥</Text>
            <Text style={styles.achievementTitle}>На хвилі</Text>
            <Text style={styles.achievementDesc}>3 дні підряд</Text>
          </View>
          <View
            style={[
              styles.achievementCard,
              grammarStats.totalExercisesCompleted >= 10 && styles.achievementUnlocked,
            ]}
          >
            <Text style={styles.achievementEmoji}>✍️</Text>
            <Text style={styles.achievementTitle}>Практик</Text>
            <Text style={styles.achievementDesc}>10 вправ</Text>
          </View>
          <View
            style={[
              styles.achievementCard,
              stats.wordsLearned >= 100 && styles.achievementUnlocked,
            ]}
          >
            <Text style={styles.achievementEmoji}>🎯</Text>
            <Text style={styles.achievementTitle}>Знавець</Text>
            <Text style={styles.achievementDesc}>100 слів</Text>
          </View>
          <View
            style={[
              styles.achievementCard,
              completionPercentage >= 100 && grammarStats.topicsCompleted >= GRAMMAR_TOPICS.length && styles.achievementUnlocked,
            ]}
          >
            <Text style={styles.achievementEmoji}>🎓</Text>
            <Text style={styles.achievementTitle}>Майстер</Text>
            <Text style={styles.achievementDesc}>Все завершено</Text>
          </View>
        </View>
      </View>

      {/* Reset Button */}
      <TouchableOpacity
        style={styles.resetButton}
        onPress={resetProgress}
      >
        <Text style={styles.resetButtonText}>🔄 Скинути прогрес</Text>
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  progressSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  // Grammar Stats
  grammarStatsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  grammarStatItem: {
    alignItems: 'center',
  },
  grammarStatValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#9C27B0',
    marginBottom: 4,
  },
  grammarStatLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  // Level Progress
  levelProgressContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  levelProgressItem: {
    marginBottom: 12,
  },
  levelProgressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  levelDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  levelProgressCode: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
  },
  levelProgressCount: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  levelProgressBarContainer: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  levelProgressBar: {
    height: '100%',
    borderRadius: 3,
  },
  // Quiz Stats
  quizStatsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quizStatItem: {
    alignItems: 'center',
  },
  quizStatValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 4,
  },
  quizStatLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  quizStatDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  quizItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quizItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  quizItemNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  quizItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  quizItemDate: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
  },
  quizLevelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  quizLevelText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  quizItemScore: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  quizItemBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  quizItemPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  moreText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 12,
  },
  achievementCard: {
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    opacity: 0.5,
  },
  achievementUnlocked: {
    backgroundColor: '#FFFFFF',
    opacity: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  achievementEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#E74C3C',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bottomPadding: {
    height: 40,
  },
});