import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { getListeningLessonsForLevel } from '../data/listening';
import { getListeningProgress } from '../utils/database';

export default function ListeningLevelScreen({ route, navigation }) {
  const { level } = route.params;
  const lessons = getListeningLessonsForLevel(level.code);
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
      {/* Шапка */}
      <View style={[styles.header, { backgroundColor: level.color }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Назад</Text>
        </TouchableOpacity>
        <Text style={styles.headerEmoji}>{level.emoji}</Text>
        <Text style={styles.headerTitle}>{level.code} — {level.name}</Text>
        <Text style={styles.headerSub}>{lessons.length} уроків аудіювання</Text>
      </View>

      <FlatList
        data={lessons}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item, index }) => {
          const lessonProgress = progress[item.id];
          const isDone = !!lessonProgress;
          const pct = lessonProgress?.percentage || 0;
          const scoreColor = pct >= 80 ? '#50C878' : pct >= 50 ? '#F39C12' : '#E74C3C';

          return (
            <TouchableOpacity
              style={[styles.lessonCard, isDone && styles.lessonCardDone]}
              onPress={() => navigation.navigate('ListeningLesson', { lesson: item, level })}
              activeOpacity={0.8}
            >
              <View style={[styles.lessonNumber, { backgroundColor: isDone ? '#50C878' : level.color }]}>
                <Text style={styles.lessonNumberText}>
                  {isDone ? '✓' : index + 1}
                </Text>
              </View>

              <View style={styles.lessonContent}>
                <Text style={styles.lessonTitle}>{item.title}</Text>
                <Text style={styles.lessonDesc}>{item.description}</Text>
                <View style={styles.lessonMeta}>
                  <Text style={styles.lessonDuration}>⏱ {item.duration}</Text>
                  <Text style={styles.lessonQuestions}>❓ {item.questions.length} питань</Text>
                </View>
              </View>

              <View style={styles.lessonRight}>
                {isDone ? (
                  <View style={[styles.scoreBadge, { backgroundColor: scoreColor }]}>
                    <Text style={styles.scoreText}>{pct}%</Text>
                  </View>
                ) : (
                  <Text style={styles.startText}>▶</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { padding: 20, paddingTop: 16, paddingBottom: 24 },
  backBtn: { marginBottom: 12 },
  backText: { color: 'rgba(255,255,255,0.9)', fontSize: 16, fontWeight: '600' },
  headerEmoji: { fontSize: 40, marginBottom: 6 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },

  lessonCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    marginBottom: 12, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3,
  },
  lessonCardDone: { borderLeftWidth: 4, borderLeftColor: '#50C878' },

  lessonNumber: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  lessonNumberText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  lessonContent: { flex: 1 },
  lessonTitle: { fontSize: 15, fontWeight: 'bold', color: '#2C3E50', marginBottom: 3 },
  lessonDesc: { fontSize: 12, color: '#7F8C8D', marginBottom: 6 },
  lessonMeta: { flexDirection: 'row', gap: 12 },
  lessonDuration: { fontSize: 11, color: '#95A5A6' },
  lessonQuestions: { fontSize: 11, color: '#95A5A6' },

  lessonRight: { marginLeft: 10, alignItems: 'center' },
  scoreBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  scoreText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  startText: { fontSize: 22, color: '#BDC3C7' },
});
