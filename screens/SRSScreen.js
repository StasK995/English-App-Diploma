import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, SafeAreaView,
} from 'react-native';
import * as Speech from 'expo-speech';
import { getAllWords } from '../data/vocabulary_words';
import { levels } from '../data/vocabulary_config';
import {
  getSRSStatesForWords,
  getWordsForSRSSession,
  saveSRSResult,
  updateStreak,
} from '../utils/database';
import {
  calculateNextReview,
  createInitialSRSState,
  RATING,
  getNextReviewText,
} from '../utils/srsAlgorithm';

export default function SRSScreen({ route, navigation }) {
  const { level, category, wordsCount, mode } = route.params || {};

  const [sessionWords, setSessionWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [srsStates, setSrsStates] = useState({});
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [dueCount, setDueCount] = useState(0);
  const [newCount, setNewCount] = useState(0);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const sessionWordsRef = useRef([]);
  const statsRef = useRef({ easy: 0, hard: 0, wrong: 0 });
  const currentIndexRef = useRef(0);

  useEffect(() => {
    loadSession();
    return () => { Speech.stop(); };
  }, []);

  const loadSession = async () => {
    setIsLoading(true);
    try {
      let allWords = getAllWords();
      if (level) allWords = allWords.filter(w => w.level === level);
      if (category) allWords = allWords.filter(w => w.category === category);

      const { dueWords, newWords, sessionWords: mixed } = await getWordsForSRSSession(
        allWords, wordsCount || 20
      );

      let words = [];
      if (mode === 'new') words = newWords;
      else if (mode === 'review') words = dueWords;
      else words = mixed;

      if (words.length === 0) {
        setIsComplete(true);
        setIsLoading(false);
        return;
      }

      const wordIds = words.map(w => w.id);
      const states = await getSRSStatesForWords(wordIds);

      sessionWordsRef.current = words;
      setSessionWords(words);
      setSrsStates(states);
      setDueCount(dueWords.length);
      setNewCount(newWords.length);
    } catch (e) {
      console.error('loadSession error:', e);
    }
    setIsLoading(false);
  };

  const showCard = () => {
    if (showTranslation) return;
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setTimeout(() => setShowTranslation(true), 120);
  };

  const speakWord = (word) => {
    Speech.stop();
    setIsSpeaking(true);
    Speech.speak(word, {
      language: 'en-US',
      rate: 0.75,
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleRating = async (rating) => {
    const words = sessionWordsRef.current;
    const idx = currentIndexRef.current;
    const word = words[idx];
    if (!word) return;

    const rawState = srsStates[word.id];
    const normalizedState = rawState
      ? {
          wordId: rawState.word_id ?? rawState.wordId ?? word.id,
          interval: rawState.interval ?? 0,
          easeFactor: rawState.ease_factor ?? rawState.easeFactor ?? 2.5,
          repetitions: rawState.repetitions ?? 0,
          learningStep: rawState.learning_step ?? rawState.learningStep ?? 0,
          nextReview: rawState.next_review ?? rawState.nextReview ?? null,
          lastReview: rawState.last_review ?? rawState.lastReview ?? null,
          status: rawState.status ?? 'new',
        }
      : createInitialSRSState(word.id);

    const newState = calculateNextReview(normalizedState, rating);

    try {
      await saveSRSResult(newState);
      await updateStreak();
    } catch (e) {
      console.error('saveSRSResult error:', e);
    }

    setSrsStates(prev => ({ ...prev, [word.id]: newState }));

    const newStats = { ...statsRef.current };
    if (rating >= RATING.EASY) {
      newStats.easy += 1;
    } else if (rating === RATING.HARD) {
      newStats.hard += 1;
    } else {
      newStats.wrong += 1;
      const updatedWords = [...words, word];
      sessionWordsRef.current = updatedWords;
      setSessionWords([...updatedWords]);
    }
    statsRef.current = newStats;

    Speech.stop();
    setIsSpeaking(false);

    const nextIdx = idx + 1;
    currentIndexRef.current = nextIdx;

    // Плавний перехід до наступної картки
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setShowTranslation(false);
      if (nextIdx >= sessionWordsRef.current.length) {
        setIsComplete(true);
      } else {
        setCurrentIndex(nextIdx);
      }
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    });
  };

  // ---- Завантаження ----
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Завантаження...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ---- Завершення ----
  if (isComplete || sessionWords.length === 0) {
    const stats = statsRef.current;
    const total = stats.easy + stats.hard + stats.wrong;
    const pct = total > 0 ? Math.round((stats.easy / total) * 100) : 0;
    const emoji = pct >= 80 ? '🎉' : pct >= 50 ? '👍' : total === 0 ? '🎯' : '💪';

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.completeEmoji}>{emoji}</Text>
          <Text style={styles.completeTitle}>
            {total === 0 ? 'Все повторено!' : 'Сесія завершена!'}
          </Text>
          {total > 0 ? (
            <View style={styles.statsCard}>
              {[
                { label: '✅ Легко:', val: stats.easy, color: '#50C878' },
                { label: '😅 Важко:', val: stats.hard, color: '#F39C12' },
                { label: '❌ Не знав:', val: stats.wrong, color: '#E74C3C' },
                { label: '📊 Результат:', val: `${pct}%`, color: '#4A90E2' },
              ].map((s, i) => (
                <View key={i} style={[styles.statRow, i === 3 && { borderBottomWidth: 0 }]}>
                  <Text style={styles.statLabel}>{s.label}</Text>
                  <Text style={[styles.statVal, { color: s.color }]}>{s.val}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noWordsText}>
              {mode === 'review' ? 'Немає слів для повторення.\nПоверніться завтра!'
                : mode === 'new' ? 'Немає нових слів.\nСпробуй інший рівень!'
                : 'Немає слів для навчання.'}
            </Text>
          )}
          <Text style={styles.nextHint}>Алгоритм сам нагадає коли повторити 🧠</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>← Назад</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const card = sessionWords[currentIndex];
  if (!card) return null;

  const levelData = levels.find(l => l.code === card.level);
  const rawState = srsStates[card.id];
  const isNewWord = !rawState;
  const progress = ((currentIndex + 1) / sessionWords.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      {/* Шапка */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { Speech.stop(); navigation.goBack(); }} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerCounter}>{currentIndex + 1} / {sessionWords.length}</Text>
          <View style={styles.headerBadges}>
            {dueCount > 0 && <View style={styles.dueBadge}><Text style={styles.dueBadgeText}>🔄 {dueCount}</Text></View>}
            {newCount > 0 && <View style={styles.newBadge}><Text style={styles.newBadgeText}>🆕 {newCount}</Text></View>}
          </View>
        </View>
        <View style={styles.miniStats}>
          <Text style={styles.miniStat}>✅{statsRef.current.easy}</Text>
          <Text style={styles.miniStat}>😅{statsRef.current.hard}</Text>
          <Text style={styles.miniStat}>❌{statsRef.current.wrong}</Text>
        </View>
      </View>

      {/* Прогрес */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: levelData?.color || '#4A90E2' }]} />
      </View>

      {/* Картка */}
      <Animated.View style={[styles.cardArea, { opacity: fadeAnim }]}>
        {!showTranslation ? (
          /* ФРОНТ */
          <View style={styles.card}>
            <View style={styles.cardTopRow}>
              <View style={[styles.levelBadge, { backgroundColor: levelData?.color || '#4A90E2' }]}>
                <Text style={styles.levelText}>{card.level}</Text>
              </View>
              {isNewWord
                ? <View style={styles.newBadgeCard}><Text style={styles.newBadgeCardText}>🆕 Нове</Text></View>
                : rawState
                  ? <View style={styles.intervalBadge}><Text style={styles.intervalText}>📅 {getNextReviewText({ nextReview: rawState.next_review || rawState.nextReview })}</Text></View>
                  : null
              }
            </View>

            <TouchableOpacity style={styles.cardTapArea} onPress={showCard} activeOpacity={0.8}>
              <Text style={styles.wordEn}>{card.english}</Text>
              {card.transcription && <Text style={styles.transcription}>[{card.transcription}]</Text>}
              <Text style={styles.tapHint}>Натисніть для перекладу 👆</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.speakBtn, isSpeaking && styles.speakBtnActive]}
              onPress={() => speakWord(card.english)}
            >
              <Text style={styles.speakText}>{isSpeaking ? '🔊 Грає...' : '🔈 Вимова'}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* ЗВОРОТ */
          <View style={[styles.card, styles.cardBack]}>
            <View style={styles.cardTopRow}>
              <View style={[styles.levelBadge, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                <Text style={styles.levelText}>{card.level}</Text>
              </View>
            </View>
            <Text style={styles.wordEnBack}>{card.english}</Text>
            <Text style={styles.wordUa}>{card.ukrainian}</Text>
            {card.example && <Text style={styles.example}>"{card.example}"</Text>}
            <Text style={styles.ratingHint}>Наскільки добре ви знаєте це слово?</Text>
          </View>
        )}
      </Animated.View>

      {/* Кнопки */}
      {showTranslation ? (
        <View style={styles.ratingButtons}>
          <TouchableOpacity style={[styles.ratingBtn, { backgroundColor: '#E74C3C' }]} onPress={() => handleRating(RATING.WRONG)}>
            <Text style={styles.ratingEmoji}>❌</Text>
            <Text style={styles.ratingLabel}>Не знаю</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.ratingBtn, { backgroundColor: '#F39C12' }]} onPress={() => handleRating(RATING.HARD)}>
            <Text style={styles.ratingEmoji}>😅</Text>
            <Text style={styles.ratingLabel}>Важко</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.ratingBtn, { backgroundColor: '#50C878' }]} onPress={() => handleRating(RATING.EASY)}>
            <Text style={styles.ratingEmoji}>✅</Text>
            <Text style={styles.ratingLabel}>Легко</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.hintContainer}>
          <Text style={styles.hint}>👆 Натисніть картку щоб побачити переклад</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { fontSize: 18, color: '#7F8C8D' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, paddingBottom: 8 },
  closeBtn: { padding: 4 },
  closeBtnText: { fontSize: 22, color: '#2C3E50', fontWeight: 'bold' },
  headerCenter: { alignItems: 'center' },
  headerCounter: { fontSize: 16, fontWeight: 'bold', color: '#2C3E50' },
  headerBadges: { flexDirection: 'row', gap: 6, marginTop: 4 },
  dueBadge: { backgroundColor: '#FFF3E0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  dueBadgeText: { fontSize: 11, color: '#E67E22', fontWeight: '600' },
  newBadge: { backgroundColor: '#E3F2FD', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  newBadgeText: { fontSize: 11, color: '#4A90E2', fontWeight: '600' },
  miniStats: { flexDirection: 'row', gap: 6 },
  miniStat: { fontSize: 12, fontWeight: 'bold', color: '#7F8C8D' },

  progressBar: { height: 5, backgroundColor: '#E0E0E0', marginHorizontal: 16, borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 3 },

  cardArea: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },

  card: {
    width: '100%', minHeight: 360,
    backgroundColor: '#fff', borderRadius: 24, padding: 28,
    alignItems: 'center', justifyContent: 'center',
    elevation: 8, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8,
  },
  cardBack: { backgroundColor: '#4A90E2' },
  cardTapArea: { alignItems: 'center', justifyContent: 'center', width: '100%', paddingVertical: 20 },
  cardTopRow: { position: 'absolute', top: 20, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  levelBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  levelText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  newBadgeCard: { backgroundColor: '#E3F2FD', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  newBadgeCardText: { fontSize: 11, color: '#4A90E2', fontWeight: '600' },
  intervalBadge: { backgroundColor: '#F5F5F5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  intervalText: { fontSize: 11, color: '#7F8C8D', fontWeight: '600' },

  wordEn: { fontSize: 42, fontWeight: 'bold', color: '#2C3E50', textAlign: 'center', marginBottom: 8 },
  wordEnBack: { fontSize: 28, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 8, opacity: 0.9 },
  transcription: { fontSize: 16, color: '#7F8C8D', marginBottom: 4 },
  tapHint: { fontSize: 13, color: '#BDC3C7', marginTop: 16 },

  speakBtn: { backgroundColor: '#4A90E2', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 24, marginTop: 16, elevation: 3 },
  speakBtnActive: { backgroundColor: '#2ECC71' },
  speakText: { color: '#fff', fontWeight: '600', fontSize: 15 },

  wordUa: { fontSize: 36, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 12 },
  example: { fontSize: 13, color: 'rgba(255,255,255,0.85)', textAlign: 'center', fontStyle: 'italic', paddingHorizontal: 16, marginTop: 8 },
  ratingHint: { position: 'absolute', bottom: 20, fontSize: 12, color: 'rgba(255,255,255,0.7)', textAlign: 'center', paddingHorizontal: 20 },

  ratingButtons: { flexDirection: 'row', padding: 16, gap: 10, paddingBottom: 24 },
  ratingBtn: { flex: 1, alignItems: 'center', paddingVertical: 16, borderRadius: 16, elevation: 4 },
  ratingEmoji: { fontSize: 28, marginBottom: 6 },
  ratingLabel: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  hintContainer: { padding: 24, alignItems: 'center', paddingBottom: 32 },
  hint: { fontSize: 15, color: '#4A90E2', textAlign: 'center' },

  completeEmoji: { fontSize: 72, marginBottom: 16 },
  completeTitle: { fontSize: 28, fontWeight: 'bold', color: '#2C3E50', marginBottom: 24 },
  statsCard: { backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '100%', marginBottom: 20, elevation: 4 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  statLabel: { fontSize: 16, color: '#7F8C8D' },
  statVal: { fontSize: 20, fontWeight: 'bold' },
  noWordsText: { fontSize: 16, color: '#7F8C8D', textAlign: 'center', lineHeight: 24, marginBottom: 24 },
  nextHint: { fontSize: 14, color: '#7F8C8D', textAlign: 'center', marginBottom: 24 },
  backBtn: { backgroundColor: '#4A90E2', paddingHorizontal: 40, paddingVertical: 16, borderRadius: 14, elevation: 4 },
  backBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});