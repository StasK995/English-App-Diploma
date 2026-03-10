import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Dimensions, Linking,
} from 'react-native';
import { saveListeningResult } from '../utils/database';

const { width } = Dimensions.get('window');

const STEP = { VIDEO: 'video', QUIZ: 'quiz', RESULT: 'result' };

export default function ListeningLessonScreen({ route, navigation }) {
  const { lesson, level } = route.params;
  const [step, setStep] = useState(STEP.VIDEO);
  const [answers, setAnswers] = useState({});

  const openVideo = () => {
    Linking.openURL(`https://www.youtube.com/watch?v=${lesson.youtubeId}`);
  };

  // ---- Підрахунок результату ----
  const calcScore = () => {
    let correct = 0;
    lesson.questions.forEach(q => {
      if (answers[q.id] === q.correct) correct++;
    });
    return correct;
  };

  const handleFinishQuiz = async () => {
    const score = calcScore();
    await saveListeningResult(lesson.id, score, lesson.questions.length);
    setStep(STEP.RESULT);
  };

  const allAnswered = lesson.questions.every(q => answers[q.id] !== undefined);

  // ============ ВІДЕО ============
  if (step === STEP.VIDEO) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.topBar, { backgroundColor: level.color }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>‹ Назад</Text>
          </TouchableOpacity>
          <Text style={styles.topTitle}>{lesson.title}</Text>
        </View>

        <ScrollView>
          {/* Превью замість плеєра */}
          <TouchableOpacity
            style={[styles.videoThumb, { backgroundColor: level.color + '22' }]}
            onPress={openVideo}
            activeOpacity={0.85}
          >
            <View style={[styles.playCircle, { backgroundColor: level.color }]}>
              <Text style={styles.playIcon}>▶</Text>
            </View>
            <Text style={[styles.videoLabel, { color: level.color }]}>
              Відкрити відео на YouTube
            </Text>
            <Text style={styles.videoDuration}>⏱ {lesson.duration}</Text>
          </TouchableOpacity>

          <View style={styles.lessonInfo}>
            <Text style={styles.lessonTitle}>{lesson.title}</Text>
            <Text style={styles.lessonDesc}>{lesson.description}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaBadge}>
                <Text style={styles.metaText}>⏱ {lesson.duration}</Text>
              </View>
              <View style={styles.metaBadge}>
                <Text style={styles.metaText}>❓ {lesson.questions.length} питань</Text>
              </View>
              <View style={[styles.metaBadge, { backgroundColor: level.color + '20' }]}>
                <Text style={[styles.metaText, { color: level.color }]}>{level.code}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.watchBtn, { backgroundColor: level.color }]}
              onPress={openVideo}
            >
              <Text style={styles.watchBtnText}>▶ Дивитись на YouTube</Text>
            </TouchableOpacity>

            <View style={styles.tipBox}>
              <Text style={styles.tipTitle}>💡 Як проходити урок</Text>
              <Text style={styles.tipText}>
                1. Натисни кнопку вище — відео відкриється в YouTube{'\n'}
                2. Подивись відео уважно{'\n'}
                3. Повернись сюди і натисни "Далі — Тест"
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: level.color }]}
            onPress={() => setStep(STEP.QUIZ)}
          >
            <Text style={styles.nextBtnText}>Далі — Тест ›</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ============ ТЕСТ ============
  if (step === STEP.QUIZ) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.topBar, { backgroundColor: level.color }]}>
          <TouchableOpacity onPress={() => setStep(STEP.VIDEO)} style={styles.backBtn}>
            <Text style={styles.backText}>‹ Відео</Text>
          </TouchableOpacity>
          <Text style={styles.topTitle}>Тест по відео</Text>
        </View>

        <ScrollView contentContainerStyle={styles.quizContent}>
          <Text style={styles.quizHeader}>
            Відповідай на питання по відео {lesson.title}
          </Text>

          {lesson.questions.map((q, qi) => (
            <View key={q.id} style={styles.questionCard}>
              <Text style={styles.questionNum}>Питання {qi + 1} з {lesson.questions.length}</Text>
              <Text style={styles.questionText}>{q.text}</Text>

              {q.options.map((opt, oi) => {
                const isSelected = answers[q.id] === oi;
                return (
                  <TouchableOpacity
                    key={oi}
                    style={[
                      styles.optionBtn,
                      isSelected && { backgroundColor: level.color, borderColor: level.color },
                    ]}
                    onPress={() => setAnswers(prev => ({ ...prev, [q.id]: oi }))}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.optionCircle, isSelected && { backgroundColor: '#fff' }]}>
                      <Text style={[styles.optionLetter, isSelected && { color: level.color }]}>
                        {['A', 'B', 'C', 'D'][oi]}
                      </Text>
                    </View>
                    <Text style={[styles.optionText, isSelected && { color: '#fff' }]}>{opt}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}

          <TouchableOpacity
            style={[
              styles.submitBtn,
              { backgroundColor: allAnswered ? level.color : '#BDC3C7' },
            ]}
            onPress={allAnswered ? handleFinishQuiz : null}
            disabled={!allAnswered}
          >
            <Text style={styles.submitBtnText}>
              {allAnswered ? 'Завершити тест ✓' : `Відповідей: ${Object.keys(answers).length}/${lesson.questions.length}`}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ============ РЕЗУЛЬТАТ ============
  const score = calcScore();
  const pct = Math.round((score / lesson.questions.length) * 100);
  const emoji = pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪';
  const resultColor = pct >= 80 ? '#50C878' : pct >= 50 ? '#F39C12' : '#E74C3C';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.resultContent}>
        <Text style={styles.resultEmoji}>{emoji}</Text>
        <Text style={styles.resultTitle}>
          {pct >= 80 ? 'Чудово!' : pct >= 50 ? 'Непогано!' : 'Спробуй ще раз!'}
        </Text>

        <View style={[styles.scoreBig, { borderColor: resultColor }]}>
          <Text style={[styles.scorePct, { color: resultColor }]}>{pct}%</Text>
          <Text style={styles.scoreDetail}>{score} з {lesson.questions.length} правильно</Text>
        </View>

        <View style={styles.reviewCard}>
          <Text style={styles.reviewTitle}>Розбір відповідей</Text>
          {lesson.questions.map((q, qi) => {
            const userAnswer = answers[q.id];
            const isCorrect = userAnswer === q.correct;
            return (
              <View key={q.id} style={styles.reviewItem}>
                <Text style={styles.reviewQ}>{qi + 1}. {q.text}</Text>
                <View style={[styles.reviewAnswer, { backgroundColor: isCorrect ? '#E8F8EE' : '#FEE8E8' }]}>
                  <Text style={styles.reviewLabel}>
                    {isCorrect ? '✅ Правильно' : '❌ Неправильно'}
                  </Text>
                  {!isCorrect && (
                    <Text style={styles.reviewCorrect}>
                      Правильно: {q.options[q.correct]}
                    </Text>
                  )}
                  <Text style={styles.reviewYours}>
                    Твоя відповідь: {userAnswer !== undefined ? q.options[userAnswer] : '—'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.resultBtns}>
          <TouchableOpacity
            style={[styles.retryBtn, { borderColor: level.color }]}
            onPress={() => { setStep(STEP.VIDEO); setAnswers({}); }}
          >
            <Text style={[styles.retryBtnText, { color: level.color }]}>↺ Ще раз</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: level.color }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.doneBtnText}>← До уроків</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },

  topBar: { padding: 14, paddingBottom: 12 },
  backBtn: { marginBottom: 6 },
  backText: { color: 'rgba(255,255,255,0.9)', fontSize: 15, fontWeight: '600' },
  topTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },

  videoThumb: {
    width: width, height: width * 0.5,
    alignItems: 'center', justifyContent: 'center',
  },
  playCircle: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12, elevation: 4,
  },
  playIcon: { fontSize: 28, color: '#fff', marginLeft: 4 },
  videoLabel: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  videoDuration: { fontSize: 13, color: '#7F8C8D' },

  lessonInfo: { padding: 20 },
  lessonTitle: { fontSize: 22, fontWeight: 'bold', color: '#2C3E50', marginBottom: 6 },
  lessonDesc: { fontSize: 15, color: '#7F8C8D', marginBottom: 16, lineHeight: 22 },
  metaRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  metaBadge: { backgroundColor: '#F0F0F0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  metaText: { fontSize: 13, color: '#7F8C8D', fontWeight: '500' },

  watchBtn: {
    padding: 16, borderRadius: 14, alignItems: 'center',
    marginBottom: 16, elevation: 3,
  },
  watchBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  tipBox: { backgroundColor: '#FFF9E6', borderRadius: 12, padding: 14, borderLeftWidth: 3, borderLeftColor: '#F39C12' },
  tipTitle: { fontSize: 14, fontWeight: 'bold', color: '#8E6F3E', marginBottom: 6 },
  tipText: { fontSize: 13, color: '#8E6F3E', lineHeight: 22 },

  bottomBar: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  nextBtn: { padding: 18, borderRadius: 14, alignItems: 'center', elevation: 3 },
  nextBtnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },

  quizContent: { padding: 16 },
  quizHeader: { fontSize: 15, color: '#7F8C8D', marginBottom: 16, textAlign: 'center' },
  questionCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 16, elevation: 2 },
  questionNum: { fontSize: 12, color: '#BDC3C7', marginBottom: 6, fontWeight: '600' },
  questionText: { fontSize: 16, fontWeight: 'bold', color: '#2C3E50', marginBottom: 14, lineHeight: 22 },
  optionBtn: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 2, borderColor: '#E0E0E0', borderRadius: 10,
    padding: 12, marginBottom: 8,
  },
  optionCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#F0F0F0', alignItems: 'center',
    justifyContent: 'center', marginRight: 10,
  },
  optionLetter: { fontSize: 13, fontWeight: 'bold', color: '#7F8C8D' },
  optionText: { fontSize: 14, color: '#2C3E50', flex: 1 },
  submitBtn: { padding: 18, borderRadius: 14, alignItems: 'center', marginTop: 8, elevation: 3 },
  submitBtnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },

  resultContent: { padding: 24, alignItems: 'center' },
  resultEmoji: { fontSize: 80, marginBottom: 12, marginTop: 20 },
  resultTitle: { fontSize: 28, fontWeight: 'bold', color: '#2C3E50', marginBottom: 24 },
  scoreBig: { borderWidth: 3, borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 24, width: '70%' },
  scorePct: { fontSize: 52, fontWeight: 'bold' },
  scoreDetail: { fontSize: 16, color: '#7F8C8D', marginTop: 4 },
  reviewCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, width: '100%', marginBottom: 24, elevation: 2 },
  reviewTitle: { fontSize: 17, fontWeight: 'bold', color: '#2C3E50', marginBottom: 14 },
  reviewItem: { marginBottom: 14 },
  reviewQ: { fontSize: 14, fontWeight: '600', color: '#2C3E50', marginBottom: 6 },
  reviewAnswer: { borderRadius: 8, padding: 10 },
  reviewLabel: { fontSize: 13, fontWeight: 'bold', marginBottom: 4 },
  reviewCorrect: { fontSize: 13, color: '#27AE60', marginBottom: 2 },
  reviewYours: { fontSize: 12, color: '#7F8C8D' },
  resultBtns: { flexDirection: 'row', gap: 12, width: '100%' },
  retryBtn: { flex: 1, padding: 16, borderRadius: 12, borderWidth: 2, alignItems: 'center' },
  retryBtnText: { fontSize: 16, fontWeight: 'bold' },
  doneBtn: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', elevation: 2 },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});