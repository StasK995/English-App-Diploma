import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { words } from '../data/vocabulary_words';
import { levels, categories } from '../data/vocabulary_config';
import { saveQuizResult } from '../utils/database';

export default function QuizScreen() {
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Налаштування
  const [selectedLevels, setSelectedLevels] = useState(['A1']);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [questionCount, setQuestionCount] = useState(10);
  const [availableCount, setAvailableCount] = useState(0);

  // Стан гри
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const scoreRef = useRef(0);

  useEffect(() => {
    setAvailableCount(getFiltered().length);
  }, [selectedLevels, selectedCategories]);

  const getFiltered = () => words.filter(w => {
    const lvl = selectedLevels.length === 0 || selectedLevels.includes(w.level);
    const cat = selectedCategories.length === 0 || selectedCategories.includes(w.category);
    return lvl && cat;
  });

  const generateQuestions = () => {
    const pool = getFiltered();
    if (pool.length < 4) return false;

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const count = Math.min(questionCount, pool.length);

    const qs = shuffled.slice(0, count).map(word => {
      const wrong = pool
        .filter(w => w.id !== word.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      return {
        id: word.id,
        question: word.english,
        level: word.level,
        correctAnswer: word.ukrainian,
        answers: [
          { text: word.ukrainian, correct: true },
          ...wrong.map(w => ({ text: w.ukrainian, correct: false })),
        ].sort(() => Math.random() - 0.5),
      };
    });

    setQuestions(qs);
    setCurrentQ(0);
    scoreRef.current = 0;
    setSelectedAnswer(null);
    setShowResult(false);
    setQuizCompleted(false);
    return true;
  };

  const startQuiz = () => {
    if (generateQuestions()) setQuizStarted(true);
  };

  const handleAnswer = (answer, idx) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    setShowResult(true);

    if (answer.correct) scoreRef.current += 1;

    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setQuizCompleted(true);
        // ✅ Зберігаємо в SQLite
        saveQuizResult(
          selectedLevels,
          selectedCategories.length > 0 ? selectedCategories : ['all'],
          scoreRef.current,
          questions.length,
        ).catch(console.error);
      }
    }, 1200);
  };

  const toggleLevel = (code) => {
    setSelectedLevels(prev =>
      prev.includes(code)
        ? prev.length > 1 ? prev.filter(l => l !== code) : prev
        : [...prev, code]
    );
  };

  const toggleCategory = (code) => {
    setSelectedCategories(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  // ---- Результат ----
  if (quizCompleted) {
    const score = scoreRef.current;
    const pct = Math.round((score / questions.length) * 100);
    const emoji = pct >= 90 ? '🌟' : pct >= 70 ? '🎉' : pct >= 50 ? '👍' : '💪';

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.resultContainer}>
        <Text style={styles.resultEmoji}>{emoji}</Text>
        <Text style={styles.resultTitle}>Вікторина завершена!</Text>

        <View style={styles.levelBadgeRow}>
          {selectedLevels.map(l => {
            const ld = levels.find(x => x.code === l);
            return (
              <View key={l} style={[styles.levelBadge, { backgroundColor: ld?.color }]}>
                <Text style={styles.levelBadgeText}>{l}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.scoreBox}>
          <Text style={styles.scoreBig}>{score}</Text>
          <Text style={styles.scoreSlash}>/</Text>
          <Text style={styles.scoreTotal}>{questions.length}</Text>
        </View>
        <Text style={styles.pctText}>{pct}%</Text>

        <TouchableOpacity style={styles.primaryBtn} onPress={() => { generateQuestions(); setQuizStarted(true); }}>
          <Text style={styles.primaryBtnText}>🔄 Ще раз</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => { setQuizStarted(false); setQuizCompleted(false); }}>
          <Text style={styles.secondaryBtnText}>⚙️ Налаштування</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // ---- Гра ----
  if (quizStarted && questions.length > 0) {
    const q = questions[currentQ];
    const ld = levels.find(l => l.code === q.level);

    return (
      <ScrollView style={styles.container}>
        {/* Шапка */}
        <View style={styles.quizHeader}>
          <View style={[styles.levelPill, { backgroundColor: ld?.color }]}>
            <Text style={styles.levelPillText}>{q.level}</Text>
          </View>
          <Text style={styles.qCounter}>{currentQ + 1}/{questions.length}</Text>
          <Text style={styles.scoreLive}>✓ {scoreRef.current}</Text>
        </View>

        {/* Прогрес */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((currentQ + 1) / questions.length) * 100}%`, backgroundColor: ld?.color }]} />
        </View>

        {/* Питання */}
        <View style={styles.questionBox}>
          <Text style={styles.questionLabel}>Оберіть переклад:</Text>
          <Text style={styles.questionWord}>{q.question}</Text>
        </View>

        {/* Відповіді */}
        <View style={styles.answersBox}>
          {q.answers.map((a, idx) => {
            let style = styles.answerBtn;
            if (selectedAnswer !== null) {
              if (a.correct) style = [styles.answerBtn, styles.answerCorrect];
              else if (selectedAnswer === idx) style = [styles.answerBtn, styles.answerWrong];
            }
            return (
              <TouchableOpacity
                key={idx}
                style={style}
                onPress={() => handleAnswer(a, idx)}
                disabled={selectedAnswer !== null}
              >
                <Text style={styles.answerText}>{a.text}</Text>
                {selectedAnswer !== null && a.correct && <Text style={styles.mark}>✓</Text>}
                {selectedAnswer === idx && !a.correct && <Text style={styles.mark}>✗</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {showResult && (
          <View style={styles.resultFeedback}>
            <Text style={styles.resultFeedbackText}>
              {questions[currentQ]?.answers[selectedAnswer]?.correct
                ? '🎉 Правильно!'
                : `❌ Правильна відповідь: ${q.correctAnswer}`}
            </Text>
          </View>
        )}
      </ScrollView>
    );
  }

  // ---- Налаштування ----
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.settingsContainer}>
      <Text style={styles.settingsTitle}>🎯 Вікторина</Text>

      {/* Рівні */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Рівні</Text>
        <View style={styles.chipRow}>
          {levels.map(l => (
            <TouchableOpacity
              key={l.code}
              style={[styles.chip, selectedLevels.includes(l.code) && { backgroundColor: l.color, borderColor: l.color }]}
              onPress={() => toggleLevel(l.code)}
            >
              <Text style={[styles.chipText, selectedLevels.includes(l.code) && styles.chipTextActive]}>
                {l.code}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Категорії */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Категорії</Text>
          <TouchableOpacity onPress={() => setSelectedCategories([])}>
            <Text style={styles.clearBtn}>Всі</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.chipRow}>
          {categories.map(c => (
            <TouchableOpacity
              key={c.code}
              style={[styles.chip, selectedCategories.includes(c.code) && styles.chipActive]}
              onPress={() => toggleCategory(c.code)}
            >
              <Text style={styles.chipEmoji}>{c.emoji}</Text>
              <Text style={[styles.chipText, selectedCategories.includes(c.code) && styles.chipTextActive]}>
                {c.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Кількість */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Питань</Text>
        <View style={styles.chipRow}>
          {[5, 10, 15, 20].map(n => (
            <TouchableOpacity
              key={n}
              style={[styles.chip, questionCount === n && styles.chipActive, n > availableCount && styles.chipDisabled]}
              onPress={() => n <= availableCount && setQuestionCount(n)}
            >
              <Text style={[styles.chipText, questionCount === n && styles.chipTextActive]}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Інфо */}
      <View style={styles.infoCard}>
        <Text style={styles.infoText}>📚 Доступно слів: <Text style={styles.infoVal}>{availableCount}</Text></Text>
      </View>

      <TouchableOpacity
        style={[styles.primaryBtn, availableCount < 4 && styles.btnDisabled]}
        onPress={startQuiz}
        disabled={availableCount < 4}
      >
        <Text style={styles.primaryBtnText}>▶️ Почати</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  settingsContainer: { padding: 20 },
  settingsTitle: { fontSize: 28, fontWeight: 'bold', color: '#2C3E50', textAlign: 'center', marginBottom: 24 },
  section: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2C3E50', marginBottom: 10 },
  clearBtn: { fontSize: 14, color: '#4A90E2', fontWeight: '600' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: '#fff', borderWidth: 2, borderColor: '#E0E0E0', gap: 4 },
  chipActive: { backgroundColor: '#4A90E2', borderColor: '#4A90E2' },
  chipDisabled: { opacity: 0.4 },
  chipEmoji: { fontSize: 16 },
  chipText: { fontSize: 14, color: '#2C3E50', fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  infoCard: { backgroundColor: '#FFF9E6', padding: 16, borderRadius: 12, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#F39C12' },
  infoText: { fontSize: 14, color: '#8E6F3E' },
  infoVal: { fontWeight: 'bold', color: '#E67E22' },
  primaryBtn: { backgroundColor: '#50C878', padding: 18, borderRadius: 14, alignItems: 'center', elevation: 4, marginBottom: 12 },
  primaryBtnText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  secondaryBtn: { padding: 14, alignItems: 'center' },
  secondaryBtnText: { fontSize: 16, color: '#7F8C8D', fontWeight: '600' },
  btnDisabled: { backgroundColor: '#BDC3C7' },
  quizHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingBottom: 8 },
  levelPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  levelPillText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  qCounter: { fontSize: 16, color: '#7F8C8D', fontWeight: '600' },
  scoreLive: { fontSize: 16, color: '#50C878', fontWeight: 'bold' },
  progressBar: { height: 6, backgroundColor: '#E0E0E0', marginHorizontal: 16, borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  progressFill: { height: '100%', borderRadius: 3 },
  questionBox: { padding: 20, paddingTop: 24 },
  questionLabel: { fontSize: 14, color: '#7F8C8D', marginBottom: 10, fontWeight: '600' },
  questionWord: { fontSize: 38, fontWeight: 'bold', color: '#2C3E50' },
  answersBox: { padding: 16, paddingTop: 4 },
  answerBtn: { backgroundColor: '#fff', padding: 18, borderRadius: 12, marginBottom: 10, borderWidth: 2, borderColor: '#E0E0E0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  answerCorrect: { backgroundColor: '#D4EDDA', borderColor: '#50C878' },
  answerWrong: { backgroundColor: '#F8D7DA', borderColor: '#E74C3C' },
  answerText: { fontSize: 17, color: '#2C3E50', fontWeight: '500', flex: 1 },
  mark: { fontSize: 22, fontWeight: 'bold' },
  resultFeedback: { backgroundColor: '#FFF9E6', padding: 16, marginHorizontal: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#F39C12' },
  resultFeedbackText: { fontSize: 15, color: '#8E6F3E', fontWeight: '600' },
  resultContainer: { padding: 32, alignItems: 'center' },
  resultEmoji: { fontSize: 80, marginBottom: 16 },
  resultTitle: { fontSize: 26, fontWeight: 'bold', color: '#2C3E50', marginBottom: 16 },
  levelBadgeRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  levelBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  levelBadgeText: { color: '#fff', fontWeight: 'bold' },
  scoreBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  scoreBig: { fontSize: 72, fontWeight: 'bold', color: '#4A90E2' },
  scoreSlash: { fontSize: 48, color: '#BDC3C7', marginHorizontal: 8 },
  scoreTotal: { fontSize: 48, color: '#7F8C8D', fontWeight: '600' },
  pctText: { fontSize: 36, fontWeight: 'bold', color: '#50C878', marginBottom: 32 },
});
