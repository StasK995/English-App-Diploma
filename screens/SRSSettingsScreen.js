// screens/SRSSettingsScreen.js
// Екран налаштувань сесії навчання

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllWords } from '../data/vocabulary_words';
import { levels, categories } from '../data/vocabulary_config';

export default function SRSSettingsScreen({ navigation }) {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [wordsCount, setWordsCount] = useState(10);
  const [mode, setMode] = useState('mixed'); // new, review, mixed
  const [knownWords, setKnownWords] = useState([]);
  const [levelProgress, setLevelProgress] = useState({});

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const knownWordsData = await AsyncStorage.getItem('knownWords');
      const known = knownWordsData ? JSON.parse(knownWordsData) : [];
      setKnownWords(known);

      // Підрахунок прогресу по рівнях
      const allWords = getAllWords();
      const progress = {};

      levels.forEach(level => {
        const levelWords = allWords.filter(w => w.level === level.code);
        const learnedCount = levelWords.filter(w => known.includes(w.id)).length;
        progress[level.code] = {
          total: levelWords.length,
          learned: learnedCount,
          percentage: levelWords.length > 0 ? Math.round((learnedCount / levelWords.length) * 100) : 0,
        };
      });

      setLevelProgress(progress);

      // Автоматично вибираємо перший незавершений рівень
      const firstIncomplete = levels.find(level => 
        progress[level.code] && progress[level.code].percentage < 100
      );
      if (firstIncomplete && !selectedLevel) {
        setSelectedLevel(firstIncomplete.code);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const getAvailableWords = () => {
    const allWords = getAllWords();
    let filtered = allWords;

    // Фільтр за рівнем
    if (selectedLevel) {
      filtered = filtered.filter(w => w.level === selectedLevel);
    }

    // Фільтр за категорією
    if (selectedCategory) {
      filtered = filtered.filter(w => w.category === selectedCategory);
    }

    // Фільтр за режимом
    if (mode === 'new') {
      filtered = filtered.filter(w => !knownWords.includes(w.id));
    } else if (mode === 'review') {
      filtered = filtered.filter(w => knownWords.includes(w.id));
    }

    return filtered;
  };

  const startSession = () => {
    const availableWords = getAvailableWords();

    if (availableWords.length === 0) {
      alert('Немає слів для вивчення з такими налаштуваннями');
      return;
    }

    navigation.navigate('SRSLearn', {
      level: selectedLevel,
      category: selectedCategory,
      wordsCount: wordsCount,
      mode: mode,
    });
  };

  const LevelCard = ({ level }) => {
    const progress = levelProgress[level.code] || { total: 0, learned: 0, percentage: 0 };
    const isSelected = selectedLevel === level.code;
    const isLocked = levels.findIndex(l => l.code === level.code) > 0 && 
                     levelProgress[levels[levels.findIndex(l => l.code === level.code) - 1]?.code]?.percentage < 100;

    return (
      <TouchableOpacity
        style={[
          styles.levelCard,
          isSelected && { borderColor: level.color, borderWidth: 3 },
          isLocked && styles.levelCardLocked,
        ]}
        onPress={() => !isLocked && setSelectedLevel(level.code)}
        disabled={isLocked}
      >
        <View style={[styles.levelBadge, { backgroundColor: level.color }]}>
          <Text style={styles.levelBadgeText}>{level.code}</Text>
        </View>

        <Text style={styles.levelName}>{level.name}</Text>
        <Text style={styles.levelDescription}>{level.description}</Text>

        {isLocked ? (
          <View style={styles.lockedBadge}>
            <Text style={styles.lockedText}>🔒 Заблоковано</Text>
          </View>
        ) : (
          <>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${progress.percentage}%`, backgroundColor: level.color }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {progress.learned} / {progress.total} ({progress.percentage}%)
            </Text>
          </>
        )}

        {isSelected && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const CategoryButton = ({ category }) => {
    const isSelected = selectedCategory === category.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.categoryButton,
          isSelected && styles.categoryButtonSelected,
        ]}
        onPress={() => setSelectedCategory(isSelected ? null : category.id)}
      >
        <Text style={styles.categoryEmoji}>{category.emoji}</Text>
        <Text style={[
          styles.categoryName,
          isSelected && styles.categoryNameSelected,
        ]}>
          {category.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const availableWordsCount = getAvailableWords().length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Налаштування навчання</Text>
          <Text style={styles.subtitle}>Оберіть параметри для сесії</Text>
        </View>

        {/* Вибір рівня */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 Оберіть рівень</Text>
          <Text style={styles.sectionSubtitle}>
            Вивчайте слова послідовно від A1 до C2
          </Text>

          {levels.map(level => (
            <LevelCard key={level.code} level={level} />
          ))}
        </View>

        {/* Вибір категорії */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏷️ Категорія (опціонально)</Text>
          <View style={styles.categoriesGrid}>
            {categories.map(category => (
              <CategoryButton key={category.id} category={category} />
            ))}
          </View>
        </View>

        {/* Режим навчання */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Режим навчання</Text>
          <View style={styles.modesContainer}>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'new' && styles.modeButtonSelected]}
              onPress={() => setMode('new')}
            >
              <Text style={styles.modeEmoji}>🆕</Text>
              <Text style={[styles.modeText, mode === 'new' && styles.modeTextSelected]}>
                Тільки нові
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeButton, mode === 'mixed' && styles.modeButtonSelected]}
              onPress={() => setMode('mixed')}
            >
              <Text style={styles.modeEmoji}>🔀</Text>
              <Text style={[styles.modeText, mode === 'mixed' && styles.modeTextSelected]}>
                Змішано
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeButton, mode === 'review' && styles.modeButtonSelected]}
              onPress={() => setMode('review')}
            >
              <Text style={styles.modeEmoji}>🔄</Text>
              <Text style={[styles.modeText, mode === 'review' && styles.modeTextSelected]}>
                Повторення
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Кількість слів */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔢 Кількість слів</Text>
          <View style={styles.countsContainer}>
            {[5, 10, 15, 20].map(count => (
              <TouchableOpacity
                key={count}
                style={[
                  styles.countButton,
                  wordsCount === count && styles.countButtonSelected,
                ]}
                onPress={() => setWordsCount(count)}
              >
                <Text style={[
                  styles.countText,
                  wordsCount === count && styles.countTextSelected,
                ]}>
                  {count}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Інформація */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📊 Доступно для вивчення:</Text>
          <Text style={styles.infoValue}>{availableWordsCount} слів</Text>
          {availableWordsCount < wordsCount && (
            <Text style={styles.infoWarning}>
              ⚠️ Доступно менше слів, ніж обрано
            </Text>
          )}
        </View>

        {/* Кнопка старту */}
        <TouchableOpacity
          style={[
            styles.startButton,
            availableWordsCount === 0 && styles.startButtonDisabled,
          ]}
          onPress={startSession}
          disabled={availableWordsCount === 0}
        >
          <Text style={styles.startButtonText}>
            🚀 Почати навчання
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  section: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 15,
  },
  levelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  levelCardLocked: {
    opacity: 0.6,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
  },
  levelBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  levelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  levelDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  lockedBadge: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  lockedText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  selectedBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#50C878',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryButtonSelected: {
    borderColor: '#4A90E2',
    backgroundColor: '#E3F2FD',
  },
  categoryEmoji: {
    fontSize: 18,
    marginRight: 6,
  },
  categoryName: {
    fontSize: 14,
    color: '#2C3E50',
  },
  categoryNameSelected: {
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  modesContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  modeButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modeButtonSelected: {
    borderColor: '#4A90E2',
    backgroundColor: '#E3F2FD',
  },
  modeEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  modeText: {
    fontSize: 14,
    color: '#2C3E50',
  },
  modeTextSelected: {
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  countsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  countButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  countButtonSelected: {
    borderColor: '#4A90E2',
    backgroundColor: '#E3F2FD',
  },
  countText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  countTextSelected: {
    color: '#4A90E2',
  },
  infoCard: {
    backgroundColor: '#FFF9E6',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#F39C12',
  },
  infoTitle: {
    fontSize: 14,
    color: '#8E6F3E',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E67E22',
  },
  infoWarning: {
    fontSize: 12,
    color: '#E67E22',
    marginTop: 8,
  },
  startButton: {
    backgroundColor: '#4A90E2',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  startButtonDisabled: {
    backgroundColor: '#BDC3C7',
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bottomPadding: {
    height: 30,
  },
});