import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { LISTENING_LEVELS, LISTENING_LESSONS } from '../data/listening';
import { getListeningProgress } from '../utils/database';

export default function ListeningScreen({ navigation }) {
  const [progress, setProgress] = useState({});

  useEffect(() => {
    loadProgress();
    const unsubscribe = navigation.addListener('focus', loadProgress);
    return unsubscribe;
  }, [navigation]);

  const loadProgress = async () => {
    const p = await getListeningProgress();
    setProgress(p);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>🎧 Аудіювання</Text>
          <Text style={styles.subtitle}>Дивись відео та проходь тести</Text>
        </View>

        {LISTENING_LEVELS.map(level => {
          const lessons = LISTENING_LESSONS[level.code] || [];
          const completed = lessons.filter(lesson => progress[lesson.id]).length;
          const pct = lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0;

          return (
            <TouchableOpacity
              key={level.code}
              style={styles.levelCard}
              onPress={() => navigation.navigate('ListeningLevel', { level })}
              activeOpacity={0.8}
            >
              <View style={[styles.levelLeft, { backgroundColor: level.color }]}>
                <Text style={styles.levelEmoji}>{level.emoji}</Text>
                <Text style={styles.levelCode}>{level.code}</Text>
              </View>

              <View style={styles.levelContent}>
                <Text style={styles.levelName}>{level.name}</Text>
                <Text style={styles.levelLessons}>{lessons.length} уроків</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: level.color }]} />
                </View>
                <Text style={styles.progressText}>{completed}/{lessons.length} пройдено</Text>
              </View>

              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { padding: 24, paddingBottom: 16 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#2C3E50' },
  subtitle: { fontSize: 15, color: '#7F8C8D', marginTop: 4 },
  levelCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12,
    borderRadius: 16, overflow: 'hidden', elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 4,
  },
  levelLeft: { width: 80, alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
  levelEmoji: { fontSize: 28, marginBottom: 4 },
  levelCode: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
  levelContent: { flex: 1, padding: 14 },
  levelName: { fontSize: 16, fontWeight: 'bold', color: '#2C3E50', marginBottom: 2 },
  levelLessons: { fontSize: 12, color: '#7F8C8D', marginBottom: 8 },
  progressBar: { height: 6, backgroundColor: '#F0F0F0', borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 11, color: '#7F8C8D' },
  arrow: { fontSize: 28, color: '#BDC3C7', paddingRight: 16 },
});
