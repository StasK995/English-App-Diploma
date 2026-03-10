import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput,
} from 'react-native';
import { GRAMMAR_LEVELS } from '../data/grammar_config';
import { getTopicById } from '../data/grammar';
import { markTopicAsCompleted, addCompletedExercise } from '../utils/database';

export default function GrammarExerciseScreen({ route, navigation }) {
  const { topicId } = route.params;
  const topic = getTopicById(topicId);

  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [completed, setCompleted] = useState(false);

  const scoreRef = useRef(0);

  if (!topic?.exercises?.length) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Вправи не знайдені</Text>
      </SafeAreaView>
    );
  }

  const exercise = topic.exercises[exerciseIdx];
  const question = exercise.questions[questionIdx];
  const level = GRAMMAR_LEVELS[topic.level];

  const totalQuestions = topic.exercises.reduce((s, e) => s + e.questions.length, 0);
  const answeredSoFar =
    topic.exercises.slice(0, exerciseIdx).reduce((s, e) => s + e.questions.length, 0) + questionIdx;

  const checkAnswer = () => {
    let correct = false;
    if (exercise.type === 'multiple_choice') {
      correct = userAnswer === question.answer;
    } else {
      correct = userAnswer.trim().toLowerCase() === question.answer.trim().toLowerCase();
    }
    setIsCorrect(correct);
    setShowResult(true);
    if (correct) scoreRef.current += 1;
  };

  const nextQuestion = () => {
    setShowResult(false);
    setUserAnswer('');

    if (questionIdx < exercise.questions.length - 1) {
      setQuestionIdx(questionIdx + 1);
    } else if (exerciseIdx < topic.exercises.length - 1) {
      setExerciseIdx(exerciseIdx + 1);
      setQuestionIdx(0);
    } else {
      setCompleted(true);
    }
  };

  // ✅ Зберігаємо в SQLite коли завершено
  useEffect(() => {
    if (!completed) return;
    const finalScore = scoreRef.current;
    const pct = Math.round((finalScore / totalQuestions) * 100);

    markTopicAsCompleted(topicId, pct).catch(console.error);

    topic.exercises.forEach(ex => {
      addCompletedExercise(topicId, ex.type, pct, ex.questions.length).catch(console.error);
    });
  }, [completed]);

  // ---- Завершення ----
  if (completed) {
    const finalScore = scoreRef.current;
    const pct = Math.round((finalScore / totalQuestions) * 100);
    const emoji = pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '💪';

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completeContainer}>
          <Text style={styles.completeEmoji}>{emoji}</Text>
          <Text style={styles.completeTitle}>Вітаємо!</Text>
          <Text style={styles.completeSub}>Всі вправи завершено</Text>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Ваш результат:</Text>
            <Text style={[styles.scoreValue, { color: level.color }]}>{finalScore} / {totalQuestions}</Text>
            <Text style={styles.scorePct}>{pct}%</Text>
          </View>
          <TouchableOpacity style={[styles.btn, { backgroundColor: level.color }]} onPress={() => navigation.goBack()}>
            <Text style={styles.btnText}>← Назад до теми</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ---- Вправа ----
  const renderQuestion = () => {
    switch (exercise.type) {
      case 'multiple_choice':
        return (
          <View>
            <Text style={styles.sentence}>{question.sentence}</Text>
            <View style={styles.options}>
              {question.options.map((opt, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.option,
                    userAnswer === opt && styles.optionSelected,
                    showResult && opt === question.answer && styles.optionCorrect,
                    showResult && userAnswer === opt && !isCorrect && styles.optionWrong,
                  ]}
                  onPress={() => !showResult && setUserAnswer(opt)}
                  disabled={showResult}
                >
                  <Text style={[styles.optionText, userAnswer === opt && !showResult && styles.optionTextSelected]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      default:
        return (
          <View>
            <Text style={styles.sentence}>{question.sentence}</Text>
            <TextInput
              style={styles.input}
              value={userAnswer}
              onChangeText={setUserAnswer}
              placeholder="Введіть відповідь..."
              placeholderTextColor="#999"
              autoCapitalize="none"
              editable={!showResult}
            />
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Шапка */}
      <View style={[styles.header, { backgroundColor: level.color }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{topic.titleUa}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Прогрес */}
      <View style={styles.progressWrap}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(answeredSoFar / totalQuestions) * 100}%`, backgroundColor: level.color }]} />
        </View>
        <Text style={styles.progressText}>{answeredSoFar + 1} / {totalQuestions}</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ padding: 16 }}>
        <View style={styles.card}>
          <Text style={[styles.exerciseType, { color: level.color }]}>{exercise.instruction}</Text>
          {renderQuestion()}

          {showResult && (
            <View style={[styles.resultBox, { backgroundColor: isCorrect ? '#e8f5e9' : '#ffebee' }]}>
              <Text style={[styles.resultText, { color: isCorrect ? '#2e7d32' : '#c62828' }]}>
                {isCorrect ? '✅ Правильно!' : '❌ Неправильно'}
              </Text>
              {!isCorrect && (
                <Text style={styles.correctAnswerText}>Правильна відповідь: {question.answer}</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Кнопки */}
      <View style={styles.footer}>
        {!showResult ? (
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: level.color }, !userAnswer && styles.btnDisabled]}
            onPress={checkAnswer}
            disabled={!userAnswer}
          >
            <Text style={styles.btnText}>Перевірити</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.btn, { backgroundColor: level.color }]} onPress={nextQuestion}>
            <Text style={styles.btnText}>Далі →</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15 },
  closeBtn: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: 'bold', flex: 1, textAlign: 'center', marginHorizontal: 8 },
  progressWrap: { backgroundColor: '#fff', padding: 12 },
  progressBar: { height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 4 },
  progressText: { fontSize: 13, color: '#666', textAlign: 'center' },
  content: { flex: 1 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  exerciseType: { fontSize: 15, fontWeight: '600', marginBottom: 16 },
  sentence: { fontSize: 18, lineHeight: 26, color: '#333', marginBottom: 20 },
  input: { borderWidth: 2, borderColor: '#e0e0e0', borderRadius: 12, padding: 14, fontSize: 16, color: '#333', backgroundColor: '#f9f9f9' },
  options: { gap: 10 },
  option: { padding: 15, borderRadius: 12, borderWidth: 2, borderColor: '#e0e0e0', backgroundColor: '#fff' },
  optionSelected: { borderColor: '#4CAF50', backgroundColor: '#f1f8f4' },
  optionCorrect: { borderColor: '#2e7d32', backgroundColor: '#e8f5e9' },
  optionWrong: { borderColor: '#c62828', backgroundColor: '#ffebee' },
  optionText: { fontSize: 16, color: '#333' },
  optionTextSelected: { fontWeight: '600', color: '#4CAF50' },
  resultBox: { marginTop: 16, padding: 14, borderRadius: 12 },
  resultText: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  correctAnswerText: { fontSize: 14, color: '#666' },
  footer: { padding: 14, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  btn: { padding: 16, borderRadius: 12, alignItems: 'center' },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  completeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  completeEmoji: { fontSize: 72, marginBottom: 16 },
  completeTitle: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  completeSub: { fontSize: 16, color: '#666', marginBottom: 24 },
  scoreCard: { backgroundColor: '#fff', borderRadius: 20, padding: 28, alignItems: 'center', marginBottom: 24, width: '100%', elevation: 4 },
  scoreLabel: { fontSize: 15, color: '#666', marginBottom: 8 },
  scoreValue: { fontSize: 48, fontWeight: 'bold', marginBottom: 4 },
  scorePct: { fontSize: 22, color: '#999' },
  errorText: { textAlign: 'center', marginTop: 40, fontSize: 18, color: '#d32f2f' },
});

