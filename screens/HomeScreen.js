import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllWords } from '../data/vocabulary_words';
import { levels } from '../data/vocabulary_config';
import { getGrammarStats } from '../utils/grammarStorage';
import { GRAMMAR_TOPICS } from '../data/grammar_topics';

export default function HomeScreen({ navigation }) {
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

  useEffect(() => {
    loadStats();
    
    // Refresh stats when screen is focused
    const unsubscribe = navigation.addListener('focus', () => {
      loadStats();
    });
    
    return unsubscribe;
  }, [navigation]);

  const loadStats = async () => {
    try {
      // Словник
      const wordsLearned = await AsyncStorage.getItem('wordsLearned');
      const currentStreak = await AsyncStorage.getItem('currentStreak');
      const todayWords = await AsyncStorage.getItem('todayWords');
      const allWords = getAllWords();

      setStats({
        wordsLearned: parseInt(wordsLearned) || 0,
        currentStreak: parseInt(currentStreak) || 0,
        todayWords: parseInt(todayWords) || 0,
        totalWords: allWords.length,
      });
      
      // Граматика
      const grammarData = await getGrammarStats();
      setGrammarStats(grammarData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const MenuButton = ({ title, subtitle, onPress, color, emoji, badge }) => (
    <TouchableOpacity
      style={[styles.menuButton, { backgroundColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.buttonEmoji}>{emoji}</Text>
      <View style={styles.buttonTextContainer}>
        <Text style={styles.buttonTitle}>{title}</Text>
        <Text style={styles.buttonSubtitle}>{subtitle}</Text>
      </View>
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const StatCard = ({ label, value, emoji, color }) => (
    <View style={[styles.statCard, { borderBottomColor: color }]}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const completionPercentage = stats.totalWords > 0
    ? Math.round((stats.wordsLearned / stats.totalWords) * 100)
    : 0;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Вітаємо! 👋</Text>
        <Text style={styles.subGreeting}>Готові вчити англійську?</Text>
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <StatCard
          emoji="📚"
          value={stats.wordsLearned}
          label="Вивчено"
          color="#4A90E2"
        />
        <StatCard
          emoji="🔥"
          value={stats.currentStreak}
          label="Днів"
          color="#E74C3C"
        />
        <StatCard
          emoji="⭐"
          value={stats.todayWords}
          label="Сьогодні"
          color="#F39C12"
        />
        <StatCard
          emoji="📊"
          value={`${completionPercentage}%`}
          label="Прогрес"
          color="#50C878"
        />
      </View>

      {/* Total Words Info */}
      <View style={styles.totalWordsCard}>
        <Text style={styles.totalWordsText}>
          Всього слів у словнику: <Text style={styles.totalWordsNumber}>{stats.totalWords}</Text>
        </Text>
        <View style={styles.levelsRow}>
          {levels.map(level => (
            <View key={level.code} style={[styles.levelBadge, { backgroundColor: level.color }]}>
              <Text style={styles.levelBadgeText}>{level.code}</Text>
            </View>
          ))}
        </View>
      </View>

            {/* 🎄 New Year Special Block */}
      <View style={styles.newYearSpecial}>
        <Text style={styles.newYearTitle}>🎄 New Year Special</Text>
        <Text style={styles.newYearSubtitle}>50 святкових слів</Text>

        <TouchableOpacity
          style={styles.newYearButton}
          onPress={() => navigation.navigate('NewYearVocabulary')} // ← ИЗМЕНЕНО!
        >
          <Text style={styles.newYearButtonText}>Перейти →</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Почніть навчання</Text>
        
        <MenuButton
          emoji="📖"
          title="Словник"
          subtitle="Вивчайте нові слова з флешкартами"
          color="#4A90E2"
          onPress={() => navigation.navigate('Vocabulary')}
        />
        
        <MenuButton
          emoji="📝"
          title="Граматика"
          subtitle={`${GRAMMAR_TOPICS.length} тем • ${grammarStats.topicsCompleted} завершено`}
          color="#9C27B0"
          onPress={() => navigation.navigate('Grammar')}
          badge={grammarStats.totalTopicsStudied > 0 ? `${grammarStats.totalTopicsStudied}` : null}
        />
        
        <MenuButton
          emoji="✏️"
          title="Вікторина"
          subtitle="Перевірте свої знання"
          color="#50C878"
          onPress={() => navigation.navigate('Quiz')}
        />
        
        <MenuButton
          emoji="📊"
          title="Прогрес"
          subtitle="Подивіться статистику навчання"
          color="#FF5722"
          onPress={() => navigation.navigate('Progress')}
        />
      </View>

      {/* Daily Tip */}
      <View style={styles.tipContainer}>
        <Text style={styles.tipTitle}>💡 Порада дня</Text>
        <Text style={styles.tipText}>
          Поєднуйте вивчення нових слів з граматикою! Після вивчення 10-15 слів, перейдіть до граматики, щоб краще зрозуміти, як їх використовувати в реченнях.
        </Text>
      </View>

      {/* Level Guide */}
      <View style={styles.levelGuideContainer}>
        <Text style={styles.sectionTitle}>Рівні CEFR</Text>
        {levels.map(level => (
          <View key={level.code} style={styles.levelGuideItem}>
            <View style={[styles.levelGuideDot, { backgroundColor: level.color }]} />
            <View style={styles.levelGuideText}>
              <Text style={styles.levelGuideName}>
                <Text style={{ color: level.color, fontWeight: 'bold' }}>{level.code}</Text> - {level.name}
              </Text>
              <Text style={styles.levelGuideDesc}>{level.description}</Text>
            </View>
          </View>
        ))}
      </View>

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
    paddingTop: 16,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: '23%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderBottomWidth: 3,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  totalWordsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  totalWordsText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 12,
  },
  totalWordsNumber: {
    fontWeight: 'bold',
    color: '#2C3E50',
    fontSize: 18,
  },
  levelsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Новый блок New Year Special
  newYearSpecial: {
    backgroundColor: '#C62828',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  newYearTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  newYearSubtitle: {
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
    fontSize: 16,
  },
  newYearButton: {
    marginTop: 12,
  },
  newYearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  actionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  menuButton: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  buttonEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  buttonSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    position: 'absolute',
    top: 12,
    right: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tipContainer: {
    backgroundColor: '#FFF9E6',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F39C12',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E67E22',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#8E6F3E',
    lineHeight: 20,
  },
  levelGuideContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  levelGuideItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  levelGuideDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: 12,
  },
  levelGuideText: {
    flex: 1,
  },
  levelGuideName: {
    fontSize: 14,
    color: '#2C3E50',
    marginBottom: 2,
  },
  levelGuideDesc: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  bottomPadding: {
    height: 20,
  },
});