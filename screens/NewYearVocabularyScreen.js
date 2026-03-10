import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Alert,
} from 'react-native';
import { NEW_YEAR_WORDS } from '../data/vocabulary_new_year';
import { getKnownWordIds, markWordAsKnown } from '../utils/database';

let Audio = null;
try { Audio = require('expo-av').Audio; } catch (e) {}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48;
const FESTIVE_EMOJIS = ['❄️', '🎄', '🎅', '🔔', '🎁', '✨', '🕯️', '🥂', '🎉', '⛄'];

export default function NewYearVocabularyScreen({ navigation }) {
  const [words] = useState(() =>
    NEW_YEAR_WORDS.map((item, i) => ({
      id: `ny_${i}`,
      english: item[0],
      ukrainian: item[1],
      emoji: FESTIVE_EMOJIS[i % FESTIVE_EMOJIS.length],
    }))
  );
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flipAnim] = useState(new Animated.Value(0));
  const [knownIds, setKnownIds] = useState([]);
  const [sound, setSound] = useState(null);

  useEffect(() => {
    loadKnownIds();
    loadSound();
    return () => { sound?.unloadAsync().catch(() => {}); };
  }, []);

  const loadKnownIds = async () => {
    // ✅ SQLite замість AsyncStorage
    const ids = await getKnownWordIds();
    setKnownIds(ids);
  };

  const loadSound = async () => {
    if (!Audio) return;
    try {
      const file = require('../assets/sounds/jingle-bell-short.mp3');
      const { sound: s } = await Audio.Sound.createAsync(file);
      setSound(s);
    } catch (e) {}
  };

  const flip = () => {
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 0 : 180,
      friction: 8, tension: 10, useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const markKnown = async () => {
    const word = words[index];
    if (word && !knownIds.includes(word.id)) {
      // ✅ SQLite замість AsyncStorage
      await markWordAsKnown(word.id);
      setKnownIds(prev => [...prev, word.id]);
      try { await sound?.replayAsync(); } catch (e) {}
    }
    next();
  };

  const next = () => {
    if (index < words.length - 1) {
      setIndex(index + 1);
      setIsFlipped(false);
      flipAnim.setValue(0);
    } else {
      Alert.alert('🎉 Вітаємо!', 'Ви вивчили всі новорічні слова! 🎄✨');
    }
  };

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 180], outputRange: ['0deg', '180deg'] });
  const backRotate = flipAnim.interpolate({ inputRange: [0, 180], outputRange: ['180deg', '360deg'] });

  const word = words[index];
  const isKnown = knownIds.includes(word.id);
  const learnedCount = knownIds.filter(id => id.startsWith('ny_')).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎄 Новорічний словник</Text>
        <Text style={styles.subtitle}>50 святкових слів</Text>
        <Text style={styles.progress}>Вивчено: {learnedCount} / {words.length}</Text>
      </View>

      <TouchableOpacity style={styles.cardWrap} onPress={flip} activeOpacity={1}>
        <Animated.View style={[styles.card, { transform: [{ rotateY: frontRotate }] }]}>
          <Text style={styles.wordEn}>{word.english}</Text>
          <Text style={styles.emoji}>{word.emoji}</Text>
          <Text style={styles.hint}>Натисніть для перекладу</Text>
        </Animated.View>

        <Animated.View style={[styles.card, styles.cardBack, { transform: [{ rotateY: backRotate }] }]}>
          <Text style={styles.wordUa}>{word.ukrainian}</Text>
          <Text style={styles.emoji}>{word.emoji}</Text>
          {isKnown && <Text style={styles.knownMark}>✓ Вивчено</Text>}
        </Animated.View>
      </TouchableOpacity>

      <View style={styles.controls}>
        <TouchableOpacity style={[styles.knowBtn, isKnown && styles.knowBtnDone]} onPress={markKnown}>
          <Text style={styles.knowBtnText}>{isKnown ? '✓ Вже знаю' : 'Знаю ✨'}</Text>
        </TouchableOpacity>
        <Text style={styles.counter}>{index + 1} / {words.length}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F5' },
  header: { alignItems: 'center', paddingVertical: 20, backgroundColor: '#C62828', borderBottomLeftRadius: 20, borderBottomRightRadius: 20, marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 16, color: '#FFEBEE', marginTop: 4 },
  progress: { fontSize: 15, color: '#FFEBEE', marginTop: 10, fontWeight: '600' },
  cardWrap: { width: CARD_WIDTH, height: 320, alignSelf: 'center', marginVertical: 16 },
  card: { position: 'absolute', width: '100%', height: '100%', backgroundColor: '#fff', borderRadius: 24, alignItems: 'center', justifyContent: 'center', backfaceVisibility: 'hidden', elevation: 10, borderWidth: 3, borderColor: '#C62828' },
  cardBack: { backgroundColor: '#C62828', borderColor: '#2E7D32' },
  wordEn: { fontSize: 38, fontWeight: 'bold', color: '#2C3E50', textAlign: 'center', marginBottom: 8 },
  wordUa: { fontSize: 34, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 8 },
  emoji: { fontSize: 56, marginVertical: 12 },
  hint: { fontSize: 14, color: '#BDC3C7' },
  knownMark: { fontSize: 18, color: '#A8E6CF', fontWeight: 'bold', marginTop: 12 },
  controls: { alignItems: 'center', marginTop: 8 },
  knowBtn: { backgroundColor: '#2E7D32', paddingHorizontal: 56, paddingVertical: 16, borderRadius: 18, elevation: 6 },
  knowBtnDone: { backgroundColor: '#BDC3C7' },
  knowBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  counter: { marginTop: 16, fontSize: 16, color: '#C62828', fontWeight: '600' },
});
