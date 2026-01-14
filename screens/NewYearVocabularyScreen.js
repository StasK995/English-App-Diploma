import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Vibration,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NEW_YEAR_WORDS } from '../data/vocabulary_new_year';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48;

// Масив новорічних емодзі для прикраси під кожним словом
const FESTIVE_EMOJIS = ['❄️', '🎄', '🎅', '🔔', '🎁', '✨', '🕯️', '🥂', '🎉', '⛄'];

export default function NewYearVocabularyScreen({ navigation }) {
  const [words, setWords] = useState([]);             // Список усіх новорічних слів
  const [index, setIndex] = useState(0);              // Поточний індекс слова
  const [isFlipped, setIsFlipped] = useState(false);  // Чи перевернута картка
  const [flipAnim] = useState(new Animated.Value(0)); // Анімація перевороту
  const [knownWords, setKnownWords] = useState([]);    // Масив id вивчених слів
  const [sound, setSound] = useState(null);           // Об’єкт звуку (якщо завантажився)

  const STORAGE_KEY = 'knownWordsNewYear'; // Ключ для збереження прогресу новорічного словника

  // Виконується один раз при завантаженні екрану
  useEffect(() => {
    // Підготовка слів: додаємо id та емодзі до кожного елемента
    const preparedWords = NEW_YEAR_WORDS.map((item, i) => ({
      id: `ny_${i}`,
      english: item[0],
      ukrainian: item[1],
      emoji: FESTIVE_EMOJIS[i % FESTIVE_EMOJIS.length], // Циклічно беремо емодзі
    }));
    setWords(preparedWords);

    // Завантажуємо прогрес користувача та звук
    loadKnownWords();
    loadSound();

    // Очищення звуку при виході з екрану
    return () => {
      if (sound) {
        sound.unloadAsync().catch(() => {});
      }
    };
  }, []);

  // Спроба завантажити новорічний звук (якщо файл є)
  const loadSound = async () => {
    try {
      const { sound: loadedSound } = await Audio.Sound.createAsync(
        require('../assets/sounds/jingle-bell-short.mp3')
      );
      setSound(loadedSound);
    } catch (error) {
      console.log('Звуковий файл не знайдено або не завантажився — звук вимкнено (це нормально!)');
      // Програма продовжує працювати без звуку
    }
  };

  // Відтворення святкового звуку при натисканні "Знаю"
  const playSuccessSound = async () => {
    if (sound) {
      try {
        await sound.replayAsync();
      } catch (e) {
        console.log('Помилка відтворення звуку:', e);
      }
    }
  };

  // Завантаження списку вивчених слів з AsyncStorage
  const loadKnownWords = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      setKnownWords(data ? JSON.parse(data) : []);
    } catch (e) {
      console.error('Помилка завантаження прогресу новорічного словника:', e);
    }
  };

  // Анімація перевороту картки
  const flip = () => {
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 0 : 180,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  // Обробка натискання кнопки "Знаю"
  const markKnown = async () => {
    const word = words[index];
    if (word && !knownWords.includes(word.id)) {
      const updated = [...knownWords, word.id];
      setKnownWords(updated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      // Святкові ефекти
      await playSuccessSound();
      Vibration.vibrate(100); // Коротка вібрація
    }
    next();
  };

  // Перехід до наступного слова
  const next = () => {
    if (index < words.length - 1) {
      setIndex(index + 1);
      setIsFlipped(false);
      flipAnim.setValue(0);
    } else {
      // Якщо всі слова вивчено — показуємо привітання
      Alert.alert('🎉 Вітаємо!', 'Ви вивчили всі 50 новорічних слів! 🎄✨');
    }
  };

  // Налаштування анімації перевороту (передня та задня сторони)
  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const currentWord = words[index];
  if (!currentWord) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Завантаження...</Text>
      </View>
    );
  }

  // Підрахунок прогресу
  const learnedCount = knownWords.filter(id => id.startsWith('ny_')).length;
  const progress = Math.round((learnedCount / words.length) * 100);

  return (
    <View style={styles.container}>
      {/* Новорічний заголовок */}
      <View style={styles.header}>
        <Text style={styles.title}>🎄 Новорічний словник</Text>
        <Text style={styles.subtitle}>50 святкових слів</Text>
        <Text style={styles.progress}>Вивчено: {learnedCount} / {words.length} ({progress}%)</Text>
      </View>

      {/* Картка зі словом */}
      <TouchableOpacity style={styles.cardWrap} onPress={flip}>
        {/* Передня сторона (англійська) */}
        <Animated.View style={[styles.card, { transform: [{ rotateY: frontInterpolate }] }]}>
          <Text style={styles.wordEn}>{currentWord.english}</Text>
          <Text style={styles.emojiBig}>{currentWord.emoji}</Text>
          <Text style={styles.hint}>Натисніть, щоб побачити переклад</Text>
        </Animated.View>

        {/* Задня сторона (українська) */}
        <Animated.View style={[styles.card, styles.cardBack, { transform: [{ rotateY: backInterpolate }] }]}>
          <Text style={styles.wordUa}>{currentWord.ukrainian}</Text>
          <Text style={styles.emojiBig}>{currentWord.emoji}</Text>
          {knownWords.includes(currentWord.id) && (
            <Text style={styles.knownMark}>✓ Вивчено</Text>
          )}
        </Animated.View>
      </TouchableOpacity>

      {/* Кнопки керування */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.knowBtn} onPress={markKnown}>
          <Text style={styles.knowBtnText}>Знаю ✨</Text>
        </TouchableOpacity>
        <Text style={styles.counter}>
          {index + 1} / {words.length}
        </Text>
      </View>
    </View>
  );
}

// Стилі компонентів
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F5', paddingTop: 20 },
  header: { alignItems: 'center', paddingVertical: 20, backgroundColor: '#C62828', borderBottomLeftRadius: 20, borderBottomRightRadius: 20, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' },
  subtitle: { fontSize: 18, color: '#FFEBEE', marginTop: 4 },
  progress: { fontSize: 16, color: '#FFEBEE', marginTop: 12, fontWeight: '600' },
  cardWrap: { width: CARD_WIDTH, height: 340, alignSelf: 'center', marginVertical: 20 },
  card: { position: 'absolute', width: '100%', height: '100%', backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, alignItems: 'center', justifyContent: 'center', backfaceVisibility: 'hidden', elevation: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 12, borderWidth: 4, borderColor: '#C62828' },
  cardBack: { backgroundColor: '#C62828', borderColor: '#2E7D32' },
  wordEn: { fontSize: 40, fontWeight: 'bold', color: '#2C3E50', textAlign: 'center', marginBottom: 10 },
  wordUa: { fontSize: 36, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 10 },
  emojiBig: { fontSize: 60, marginVertical: 20 },
  hint: { fontSize: 16, color: '#7F8C8D', marginTop: 10 },
  knownMark: { fontSize: 20, color: '#A8E6CF', fontWeight: 'bold', marginTop: 20 },
  controls: { alignItems: 'center' },
  knowBtn: { backgroundColor: '#2E7D32', paddingHorizontal: 60, paddingVertical: 18, borderRadius: 20, elevation: 8 },
  knowBtnText: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  counter: { marginTop: 20, fontSize: 18, color: '#C62828', fontWeight: '600' },
});