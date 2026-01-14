import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import { getAllWords } from '../data/vocabulary_words';
import { levels } from '../data/vocabulary_config';

export default function SRSScreen({ route, navigation }) {
  const { level, category, wordsCount, mode } = route.params || {};
  
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [knownWords, setKnownWords] = useState([]);
  const [sessionStats, setSessionStats] = useState({
    total: 0,
    learned: 0,
    reviewing: 0,
  });
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [levelCompleted, setLevelCompleted] = useState(false);
  const [flipAnim] = useState(new Animated.Value(0));
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const knownWordsData = await AsyncStorage.getItem('knownWords');
      const known = knownWordsData ? JSON.parse(knownWordsData) : [];
      setKnownWords(known);

      const allWords = getAllWords();
      let filtered = allWords;

      // Фільтр за рівнем
      if (level) {
        filtered = filtered.filter(w => w.level === level);
      }

      // Фільтр за категорією
      if (category) {
        filtered = filtered.filter(w => w.category === category);
      }

      // Фільтр за режимом
      if (mode === 'new') {
        filtered = filtered.filter(w => !known.includes(w.id));
      } else if (mode === 'review') {
        filtered = filtered.filter(w => known.includes(w.id));
      }

      // Перемішуємо та беремо потрібну кількість
      const shuffled = filtered.sort(() => 0.5 - Math.random());
      const sessionWords = shuffled.slice(0, wordsCount || 10);

      setCards(sessionWords);
      setSessionStats({
        total: sessionWords.length,
        learned: 0,
        reviewing: 0,
      });
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  const checkLevelCompletion = async () => {
    if (!level) return;

    const allWords = getAllWords();
    const levelWords = allWords.filter(w => w.level === level);
    const learnedLevelWords = levelWords.filter(w => knownWords.includes(w.id));

    if (learnedLevelWords.length === levelWords.length) {
      setLevelCompleted(true);
    }
  };

  const flipCard = () => {
    if (showTranslation) {
      Animated.timing(flipAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowTranslation(false));
    } else {
      setShowTranslation(true);
      Animated.timing(flipAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const speakWord = (word) => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    Speech.speak(word, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.75,
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleKnow = async () => {
    const currentCard = cards[currentIndex];
    
    // Додаємо до вивчених слів
    if (!knownWords.includes(currentCard.id)) {
      const updatedKnown = [...knownWords, currentCard.id];
      setKnownWords(updatedKnown);
      await AsyncStorage.setItem('knownWords', JSON.stringify(updatedKnown));
      
      // Оновлюємо загальну статистику
      await AsyncStorage.setItem('wordsLearned', updatedKnown.length.toString());
      const today = await AsyncStorage.getItem('todayWords');
      await AsyncStorage.setItem('todayWords', (parseInt(today || 0) + 1).toString());
    }

    setSessionStats(prev => ({
      ...prev,
      learned: prev.learned + 1,
    }));

    moveToNext();
  };

  const handleDontKnow = () => {
    const currentCard = cards[currentIndex];
    
    // Додаємо слово в кінець черги
    setCards(prevCards => {
      const newCards = [...prevCards];
      newCards.push(currentCard);
      return newCards;
    });

    setSessionStats(prev => ({
      ...prev,
      reviewing: prev.reviewing + 1,
    }));

    moveToNext();
  };

const moveToNext = async () => {
      setShowTranslation(false);
    flipAnim.setValue(0);
    Speech.stop();
    setIsSpeaking(false);

    if (currentIndex + 1 >= cards.length) {
      // Сесія завершена
      await checkLevelCompletion();
      setIsSessionComplete(true);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const restartSession = () => {
    setIsSessionComplete(false);
    setCurrentIndex(0);
    setSessionStats({
      total: cards.length,
      learned: 0,
      reviewing: 0,
    });
    loadSession();
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  if (cards.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Завантаження...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isSessionComplete) {
    const percentage = Math.round((sessionStats.learned / sessionStats.total) * 100);
    const levelData = level ? levels.find(l => l.code === level) : null;
    
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completeContainer}>
          <Text style={styles.completeEmoji}>
            {levelCompleted ? '🎓' : percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '💪'}
          </Text>
          
          {levelCompleted ? (
            <>
              <Text style={styles.completeTitle}>Вітаємо! 🎉</Text>
              <Text style={styles.levelCompletedText}>
                Ви завершили рівень {level}!
              </Text>
              <Text style={styles.levelCompletedSubtext}>
                Переходьте до наступного рівня
              </Text>
            </>
          ) : (
            <Text style={styles.completeTitle}>Сесія завершена!</Text>
          )}
          
          <View style={styles.statsCard}>
            {levelData && (
              <View style={[styles.levelBadgeLarge, { backgroundColor: levelData.color }]}>
                <Text style={styles.levelBadgeTextLarge}>{level}</Text>
              </View>
            )}
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Вивчено:</Text>
              <Text style={[styles.statValue, { color: '#50C878' }]}>
                {sessionStats.learned} слів
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Повторень:</Text>
              <Text style={[styles.statValue, { color: '#F39C12' }]}>
                {sessionStats.reviewing}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Всього:</Text>
              <Text style={[styles.statValue, { color: '#4A90E2' }]}>
                {sessionStats.total} слів
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.restartButton}
            onPress={restartSession}
          >
            <Text style={styles.restartButtonText}>🔄 Ще раз</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Повернутися</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentCard = cards[currentIndex];
  const levelData = levels.find(l => l.code === currentCard.level);
  const progress = ((currentIndex + 1) / cards.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Навчання</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentIndex + 1} / {cards.length}
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.miniStats}>
        <View style={styles.miniStatItem}>
          <Text style={styles.miniStatEmoji}>✅</Text>
          <Text style={styles.miniStatText}>{sessionStats.learned}</Text>
        </View>
        <View style={styles.miniStatItem}>
          <Text style={styles.miniStatEmoji}>🔄</Text>
          <Text style={styles.miniStatText}>{sessionStats.reviewing}</Text>
        </View>
      </View>

      {/* Flashcard */}
      <View style={styles.cardContainer}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={flipCard}
          style={styles.card}
        >
          {!showTranslation ? (
            // Front side - English
            <Animated.View
              style={[
                styles.cardFace,
                { transform: [{ rotateY: frontInterpolate }] },
              ]}
            >
              <View style={[styles.levelBadge, { backgroundColor: levelData?.color || '#4A90E2' }]}>
                <Text style={styles.levelText}>{currentCard.level}</Text>
              </View>
              
              <View style={styles.cardContent}>
                <Text style={styles.wordEnglish}>{currentCard.english}</Text>
                
                {currentCard.transcription && (
                  <Text style={styles.transcription}>[{currentCard.transcription}]</Text>
                )}
                
                {/* Audio Button */}
                <TouchableOpacity
                  style={styles.audioButton}
                  onPress={() => speakWord(currentCard.english)}
                >
                  <Text style={styles.audioIcon}>
                    {isSpeaking ? '🔊' : '🔈'}
                  </Text>
                  <Text style={styles.audioText}>Вимова</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.hint}>Натисніть для перекладу</Text>
            </Animated.View>
          ) : (
            // Back side - Ukrainian
            <Animated.View
              style={[
                styles.cardFace,
                styles.cardBack,
                { transform: [{ rotateY: backInterpolate }] },
              ]}
            >
              <View style={[styles.levelBadge, { backgroundColor: levelData?.color || '#4A90E2' }]}>
                <Text style={styles.levelText}>{currentCard.level}</Text>
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.wordEnglish}>{currentCard.english}</Text>
                <Text style={styles.wordUkrainian}>{currentCard.ukrainian}</Text>
                
                {currentCard.example && (
                  <View style={styles.exampleBox}>
                    <Text style={styles.exampleText}>{currentCard.example}</Text>
                  </View>
                )}
              </View>

              <Text style={styles.hint}>Ви знаєте це слово?</Text>
            </Animated.View>
          )}
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      {showTranslation && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.dontKnowButton]}
            onPress={handleDontKnow}
          >
            <Text style={styles.actionButtonEmoji}>❌</Text>
            <Text style={styles.actionButtonText}>Не знаю</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.knowButton]}
            onPress={handleKnow}
          >
            <Text style={styles.actionButtonEmoji}>✅</Text>
            <Text style={styles.actionButtonText}>Знаю</Text>
          </TouchableOpacity>
        </View>
      )}

      {!showTranslation && (
        <View style={styles.flipHintContainer}>
          <Text style={styles.flipHint}>👆 Торкніться картку для перекладу</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  closeButton: {
    fontSize: 24,
    color: '#2C3E50',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  placeholder: {
    width: 24,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  miniStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
    paddingVertical: 10,
  },
  miniStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniStatEmoji: {
    fontSize: 20,
  },
  miniStatText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    height: 400,
    maxWidth: 500,
  },
  cardFace: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    backgroundColor: '#4A90E2',
    position: 'absolute',
  },
  levelBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordEnglish: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 10,
  },
  transcription: {
    fontSize: 18,
    color: '#7F8C8D',
    marginBottom: 20,
  },
  wordUkrainian: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 10,
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
    gap: 8,
  },
  audioIcon: {
    fontSize: 24,
  },
  audioText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  exampleBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
  },
  exampleText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  hint: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  flipHintContainer: {
    paddingVertical: 20,
  },
  flipHint: {
    fontSize: 16,
    color: '#4A90E2',
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 15,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  dontKnowButton: {
    backgroundColor: '#E74C3C',
  },
  knowButton: {
    backgroundColor: '#50C878',
  },
  actionButtonEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#7F8C8D',
  },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  completeEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  completeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 30,
  },
  levelCompletedText: {
    fontSize: 20,
    color: '#2C3E50',
    marginBottom: 8,
    fontWeight: '600',
  },
  levelCompletedSubtext: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 20,
  },
  levelBadgeLarge: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 20,
  },
  levelBadgeTextLarge: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    marginBottom: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statLabel: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  restartButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 15,
    width: '100%',
    maxWidth: 400,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  restartButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  backButton: {
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4A90E2',
    textAlign: 'center',
  },
});