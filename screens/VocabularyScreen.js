import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getWordsByLevel,
  getWordsByLevelAndCategory,
} from '../data/vocabulary_words';
import { NEW_YEAR_WORDS } from '../data/vocabulary_new_year';
import { levels } from '../data/vocabulary_config';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48;

export default function VocabularyScreen() {
  const [dictionaryMode, setDictionaryMode] = useState('default'); // 'default' | 'newYear'
  const [selectedLevel, setSelectedLevel] = useState('A1');
  const [words, setWords] = useState([]);
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flipAnim] = useState(new Animated.Value(0));
  const [knownWords, setKnownWords] = useState([]);

  // Отдельный ключ хранения для новогоднего словаря
  const STORAGE_KEY =
    dictionaryMode === 'newYear' ? 'knownWordsNewYear' : 'knownWords';

  // Подготовка новогодних слов
  const getNewYearWords = () =>
    NEW_YEAR_WORDS.map((item, i) => ({
      id: `ny_${i}`,
      english: item[0],
      ukrainian: item[1],
      level: 'NY',
      category: 'new_year',
      partOfSpeech: '',
    }));

  useEffect(() => {
    loadKnownWords();
    loadWords();
  }, [dictionaryMode, selectedLevel]);

  const loadKnownWords = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      setKnownWords(data ? JSON.parse(data) : []);
    } catch (e) {
      console.error('Error loading known words', e);
    }
  };

  const loadWords = () => {
    let newWords;

    if (dictionaryMode === 'newYear') {
      newWords = getNewYearWords();
    } else {
      newWords = getWordsByLevel(selectedLevel);
    }

    setWords(newWords);
    setIndex(0);
    setIsFlipped(false);
    flipAnim.setValue(0);
  };

  const flip = () => {
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 0 : 180,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const markKnown = async () => {
    const word = words[index];
    if (word && !knownWords.includes(word.id)) {
      const updated = [...knownWords, word.id];
      setKnownWords(updated);
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving known word', e);
      }
    }
    next();
  };

  const next = () => {
    if (index < words.length - 1) {
      setIndex(index + 1);
      setIsFlipped(false);
      flipAnim.setValue(0);
    }
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const currentWord = words[index];
  if (!currentWord) return null;

  return (
    <View style={styles.container}>
      {/* Переключатель словаря */}
      <View style={styles.switchRow}>
        <TouchableOpacity
          style={[
            styles.switchBtn,
            dictionaryMode === 'default' && styles.activeBlue,
          ]}
          onPress={() => setDictionaryMode('default')}
        >
          <Text style={styles.switchText}>📘 Основний</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.switchBtn,
            dictionaryMode === 'newYear' && styles.activeRed,
          ]}
          onPress={() => setDictionaryMode('newYear')}
        >
          <Text style={styles.switchText}>🎄 New Year</Text>
        </TouchableOpacity>
      </View>

      {/* Выбор уровня (только для основного словаря) */}
      {dictionaryMode === 'default' && (
        <View style={styles.levelRow}>
          {levels.map((l) => (
            <TouchableOpacity
              key={l.code}
              onPress={() => setSelectedLevel(l.code)}
            >
              <Text
                style={[
                  styles.levelText,
                  selectedLevel === l.code && { color: l.color },
                ]}
              >
                {l.code}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Карточка */}
      <TouchableOpacity style={styles.cardWrap} onPress={flip}>
        <Animated.View
          style={[
            styles.card,
            { transform: [{ rotateY: frontInterpolate }] },
          ]}
        >
          <Text style={styles.word}>{currentWord.english}</Text>
          <Text style={styles.hint}>Натисніть для перекладу</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            { transform: [{ rotateY: backInterpolate }] },
          ]}
        >
          <Text style={styles.wordUa}>{currentWord.ukrainian}</Text>
          {knownWords.includes(currentWord.id) && (
            <Text style={styles.known}>✓ Вивчено</Text>
          )}
        </Animated.View>
      </TouchableOpacity>

      {/* Управление */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.btn} onPress={markKnown}>
          <Text style={styles.btnText}>Знаю</Text>
        </TouchableOpacity>
        <Text style={styles.counter}>
          {index + 1} / {words.length}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F5F7FA' },
  switchRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  switchBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#ccc',
    alignItems: 'center',
  },
  switchText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  activeBlue: { backgroundColor: '#4A90E2' },
  activeRed: { backgroundColor: '#C62828' },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  levelText: { fontSize: 18, color: '#7F8C8D', fontWeight: '600' },
  cardWrap: {
    width: CARD_WIDTH,
    height: 300,
    alignSelf: 'center',
    marginVertical: 30,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  cardBack: { backgroundColor: '#C62828' },
  word: { fontSize: 36, fontWeight: 'bold', color: '#2C3E50', textAlign: 'center' },
  wordUa: { fontSize: 32, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  hint: { marginTop: 16, color: '#95A5A6', fontSize: 16 },
  known: { marginTop: 16, color: '#A5E6A5', fontSize: 18, fontWeight: 'bold' },
  controls: { alignItems: 'center', marginTop: 20 },
  btn: {
    backgroundColor: '#50C878',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 4,
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  counter: { marginTop: 16, color: '#7F8C8D', fontSize: 16 },
});