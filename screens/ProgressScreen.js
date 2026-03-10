import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { getAllWords } from '../data/vocabulary_words';
import { levels } from '../data/vocabulary_config';
import { GRAMMAR_TOPICS } from '../data/grammar';
import { GRAMMAR_LEVELS } from '../data/grammar_config';
import {
  getLearnedWordsCount, getLearnedCountForWordIds, getKnownWordIds,
  getUserStats, getGrammarStats, getGrammarProgressByLevel,
  getQuizHistory, getQuizStats, getProgressByDay,
  resetAllProgress, getSRSStatesForWords, getSRSReviewsByDay,
  getTodaySRSCount, getBestQuizScore,
} from '../utils/database';

export default function ProgressScreen({ navigation }) {
  const [stats, setStats] = useState({
    wordsLearned: 0, wordsInProgress: 0, wordsNew: 0,
    currentStreak: 0, totalWords: 0,
    todaySRS: 0, bestQuiz: 0,
  });
  const [grammarStats, setGrammarStats] = useState({ topicsCompleted: 0, totalExercisesCompleted: 0, averageScore: 0 });
  const [grammarLevelProgress, setGrammarLevelProgress] = useState({});
  const [quizHistory, setQuizHistory] = useState([]);
  const [quizStats, setQuizStats] = useState({ total: 0, averageScore: 0 });
  const [levelProgress, setLevelProgress] = useState({});
  const [weeklyLearned, setWeeklyLearned] = useState([]);
  const [weeklyReviews, setWeeklyReviews] = useState([]);

  useEffect(() => {
    loadAll();
    const unsubscribe = navigation?.addListener('focus', loadAll);
    return unsubscribe;
  }, [navigation]);

  const loadAll = async () => {
    const allWords = getAllWords();
    const allIds = allWords.map(w => w.id);

    const [
      wordsLearned, userStats, gStats, gLevels, history, qStats,
      weekly, srsStates, knownIdsArr, reviews, todaySRS, bestQuiz,
    ] = await Promise.all([
      getLearnedWordsCount(),
      getUserStats(),
      getGrammarStats(),
      getGrammarProgressByLevel(GRAMMAR_TOPICS),
      getQuizHistory(10),
      getQuizStats(),
      getProgressByDay(7),
      getSRSStatesForWords(allIds),
      getKnownWordIds(),
      getSRSReviewsByDay(7),
      getTodaySRSCount(),
      getBestQuizScore(),
    ]);

    const knownIds = new Set(knownIdsArr);
    const inProgressCount = Object.keys(srsStates)
      .map(id => Number(id))
      .filter(id => !knownIds.has(id)).length;

    setStats({
      wordsLearned,
      wordsInProgress: inProgressCount,
      wordsNew: Math.max(0, allWords.length - wordsLearned - inProgressCount),
      currentStreak: userStats?.current_streak || 0,
      totalWords: allWords.length,
      todaySRS,
      bestQuiz,
    });

    setGrammarStats(gStats);
    setGrammarLevelProgress(gLevels);
    setQuizHistory(history);
    setQuizStats(qStats);
    setWeeklyLearned(weekly);
    setWeeklyReviews(reviews);

    const lp = {};
    for (const level of levels) {
      const ids = allWords.filter(w => w.level === level.code).map(w => w.id);
      const learned = await getLearnedCountForWordIds(ids);
      const inProgress = ids.map(id => srsStates[id]).filter(s => s && !knownIds.has(s.word_id)).length;
      lp[level.code] = {
        total: ids.length,
        learned,
        inProgress,
        learnedPct: ids.length > 0 ? Math.round((learned / ids.length) * 100) : 0,
        inProgressPct: ids.length > 0 ? Math.round((inProgress / ids.length) * 100) : 0,
      };
    }
    setLevelProgress(lp);
  };

  const handleReset = () => {
    Alert.alert('Скинути прогрес?', 'Всі дані будуть видалені. Цю дію не можна скасувати.', [
      { text: 'Скасувати', style: 'cancel' },
      { text: 'Скинути', style: 'destructive', onPress: async () => { await resetAllProgress(); loadAll(); } },
    ]);
  };

  const totalPct = stats.totalWords > 0 ? Math.round((stats.wordsLearned / stats.totalWords) * 100) : 0;
  const totalInProgressPct = stats.totalWords > 0 ? Math.round((stats.wordsInProgress / stats.totalWords) * 100) : 0;

  const WeeklyChart = () => {
    const dayLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const learned = weeklyLearned.find(w => w.date === dateStr)?.count || 0;
      const reviews = weeklyReviews.find(w => w.date === dateStr)?.count || 0;
      return { label: dayLabels[d.getDay() === 0 ? 6 : d.getDay() - 1], learned, reviews, total: learned + reviews };
    });
    const maxCount = Math.max(...last7.map(d => d.total), 1);

    return (
      <View style={styles.chartCard}>
        <Text style={styles.sectionTitle}>📅 Активність за тиждень</Text>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#50C878' }]} />
            <Text style={styles.legendText}>Нові слова</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F39C12' }]} />
            <Text style={styles.legendText}>Повторення</Text>
          </View>
        </View>
        <View style={styles.chart}>
          {last7.map((item, i) => {
            const totalH = Math.round((item.total / maxCount) * 60);
            const learnedH = item.total > 0 ? Math.round((item.learned / item.total) * totalH) : 0;
            const reviewsH = totalH - learnedH;
            return (
              <View key={i} style={styles.chartCol}>
                {item.total > 0
                  ? <Text style={styles.chartVal}>{item.total}</Text>
                  : <Text style={styles.chartValEmpty}> </Text>}
                <View style={styles.chartTrack}>
                  {reviewsH > 0 && <View style={[styles.chartBarReview, { height: reviewsH }]} />}
                  {learnedH > 0 && <View style={[styles.chartBarLearned, { height: learnedH }]} />}
                </View>
                <Text style={styles.chartLabel}>{item.label}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const DoubleProgressBar = ({ learnedPct, inProgressPct, color }) => (
    <View style={styles.barTrack}>
      {inProgressPct > 0 && (
        <View style={[styles.barLayerYellow, { width: `${Math.min(learnedPct + inProgressPct, 100)}%` }]} />
      )}
      {learnedPct > 0 && (
        <View style={[styles.barLayerGreen, { width: `${learnedPct}%`, backgroundColor: color }]} />
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Прогрес 📊</Text>
      </View>

      {/* ✅ Оновлені картки */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { borderLeftColor: '#E74C3C' }]}>
          <Text style={styles.statEmoji}>🔥</Text>
          <View>
            <Text style={[styles.statVal, { color: '#E74C3C' }]}>{stats.currentStreak}</Text>
            <Text style={styles.statLabel}>Днів підряд</Text>
            <Text style={styles.statHint}>≥5 слів/день</Text>
          </View>
        </View>

        <View style={[styles.statCard, { borderLeftColor: '#F39C12' }]}>
          <Text style={styles.statEmoji}>🔄</Text>
          <View>
            <Text style={[styles.statVal, { color: '#F39C12' }]}>{stats.todaySRS}</Text>
            <Text style={styles.statLabel}>Повторено сьогодні</Text>
            <Text style={styles.statHint}>SRS карток</Text>
          </View>
        </View>

        <View style={[styles.statCard, { borderLeftColor: '#50C878' }]}>
          <Text style={styles.statEmoji}>🧠</Text>
          <View>
            <Text style={[styles.statVal, { color: '#50C878' }]}>{stats.wordsLearned}</Text>
            <Text style={styles.statLabel}>Слів вивчено</Text>
            <Text style={styles.statHint}>за весь час</Text>
          </View>
        </View>

        <View style={[styles.statCard, { borderLeftColor: '#9C27B0' }]}>
          <Text style={styles.statEmoji}>🏆</Text>
          <View>
            <Text style={[styles.statVal, { color: '#9C27B0' }]}>
              {stats.bestQuiz > 0 ? `${stats.bestQuiz}%` : '—'}
            </Text>
            <Text style={styles.statLabel}>Рекорд тесту</Text>
            <Text style={styles.statHint}>найкращий %</Text>
          </View>
        </View>
      </View>

      {/* Три стани слів */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Словниковий прогрес</Text>
        <View style={styles.threeStates}>
          <View style={styles.stateItem}>
            <Text style={[styles.stateVal, { color: '#50C878' }]}>{stats.wordsLearned}</Text>
            <View style={styles.stateLabelRow}>
              <View style={[styles.stateDot, { backgroundColor: '#50C878' }]} />
              <Text style={styles.stateLabel}>Вивчено</Text>
            </View>
          </View>
          <View style={styles.stateDivider} />
          <View style={styles.stateItem}>
            <Text style={[styles.stateVal, { color: '#F39C12' }]}>{stats.wordsInProgress}</Text>
            <View style={styles.stateLabelRow}>
              <View style={[styles.stateDot, { backgroundColor: '#F39C12' }]} />
              <Text style={styles.stateLabel}>В процесі</Text>
            </View>
          </View>
          <View style={styles.stateDivider} />
          <View style={styles.stateItem}>
            <Text style={[styles.stateVal, { color: '#BDC3C7' }]}>{stats.wordsNew}</Text>
            <View style={styles.stateLabelRow}>
              <View style={[styles.stateDot, { backgroundColor: '#BDC3C7' }]} />
              <Text style={styles.stateLabel}>Не почато</Text>
            </View>
          </View>
        </View>
        <DoubleProgressBar learnedPct={totalPct} inProgressPct={totalInProgressPct} color="#50C878" />
        <Text style={styles.barLabel}>Всього слів: {stats.totalWords}</Text>
      </View>

      <WeeklyChart />

      {/* Прогрес за рівнями */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>За рівнями</Text>
        <View style={styles.levelLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#50C878' }]} />
            <Text style={styles.legendText}>Вивчено</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F39C12' }]} />
            <Text style={styles.legendText}>В процесі</Text>
          </View>
        </View>
        {levels.map(l => {
          const lp = levelProgress[l.code] || { total: 0, learned: 0, inProgress: 0, learnedPct: 0, inProgressPct: 0 };
          return (
            <View key={l.code} style={styles.levelRow}>
              <View style={styles.levelRowHeader}>
                <View style={[styles.dot, { backgroundColor: l.color }]} />
                <Text style={styles.levelCode}>{l.code}</Text>
                <View style={styles.levelCounts}>
                  {lp.inProgress > 0 && <Text style={styles.levelInProgress}>🟡 {lp.inProgress}</Text>}
                  <Text style={styles.levelCount}>🟢 {lp.learned}/{lp.total}</Text>
                </View>
              </View>
              <DoubleProgressBar learnedPct={lp.learnedPct} inProgressPct={lp.inProgressPct} color={l.color} />
            </View>
          );
        })}
      </View>

      {/* Граматика */}
      {grammarStats.topicsCompleted > 0 && (
        <>
          <View style={[styles.card, styles.threeCol]}>
            {[
              { val: grammarStats.topicsCompleted, label: 'Тем', color: '#9C27B0' },
              { val: grammarStats.totalExercisesCompleted, label: 'Вправ', color: '#4A90E2' },
              { val: `${grammarStats.averageScore}%`, label: 'Середній бал', color: '#50C878' },
            ].map((s, i) => (
              <React.Fragment key={i}>
                {i > 0 && <View style={styles.divider} />}
                <View style={styles.colItem}>
                  <Text style={[styles.colVal, { color: s.color }]}>{s.val}</Text>
                  <Text style={styles.colLabel}>{s.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Граматика за рівнями</Text>
            {Object.entries(GRAMMAR_LEVELS || {}).map(([key, level]) => {
              const prog = grammarLevelProgress[level.id] || { total: 0, completed: 0 };
              if (prog.total === 0) return null;
              const pct = Math.round((prog.completed / prog.total) * 100);
              return (
                <View key={level.id} style={styles.levelRow}>
                  <View style={styles.levelRowHeader}>
                    <View style={[styles.dot, { backgroundColor: level.color }]} />
                    <Text style={styles.levelCode}>{level.id}</Text>
                    <Text style={styles.levelCount}>{prog.completed}/{prog.total}</Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View style={[styles.barLayerGreen, { width: `${pct}%`, backgroundColor: level.color }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </>
      )}

      {/* Вікторини */}
      {quizStats.total > 0 && (
        <View style={[styles.card, styles.threeCol]}>
          <View style={styles.colItem}>
            <Text style={[styles.colVal, { color: '#4A90E2' }]}>{quizStats.total}</Text>
            <Text style={styles.colLabel}>Вікторин</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.colItem}>
            <Text style={[styles.colVal, { color: '#50C878' }]}>{quizStats.averageScore}%</Text>
            <Text style={styles.colLabel}>Середній бал</Text>
          </View>
        </View>
      )}

      {/* Історія вікторин */}
      {quizHistory.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Останні вікторини</Text>
          {quizHistory.map((r, i) => {
            const date = new Date(r.played_at).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
            const color = r.percentage >= 90 ? '#50C878' : r.percentage >= 70 ? '#F39C12' : '#E74C3C';
            const lvls = Array.isArray(r.levels) ? r.levels : [];
            return (
              <View key={r.id || i} style={styles.quizItem}>
                <View>
                  <View style={styles.row}>
                    <Text style={styles.quizDate}>{date}</Text>
                    {lvls.map(lvl => {
                      const ld = levels.find(l => l.code === lvl);
                      return ld ? <View key={lvl} style={[styles.lvlBadge, { backgroundColor: ld.color }]}><Text style={styles.lvlBadgeText}>{lvl}</Text></View> : null;
                    })}
                  </View>
                  <Text style={styles.quizScore}>{r.score}/{r.total} правильних</Text>
                </View>
                <View style={[styles.pctBadge, { backgroundColor: color }]}>
                  <Text style={styles.pctBadgeText}>{r.percentage}%</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Досягнення */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Досягнення 🏆</Text>
        <View style={styles.achievements}>
          {[
            { e: '🌟', t: 'Перші кроки',  d: '10 слів',       ok: stats.wordsLearned >= 10 },
            { e: '📚', t: 'Граматист',     d: '3 теми',        ok: grammarStats.topicsCompleted >= 3 },
            { e: '🔥', t: 'На хвилі',      d: '3 дні підряд',  ok: stats.currentStreak >= 3 },
            { e: '🎯', t: 'Знавець',        d: '100 слів',      ok: stats.wordsLearned >= 100 },
            { e: '👑', t: 'Чемпіон',        d: '7 днів підряд', ok: stats.currentStreak >= 7 },
            { e: '⚡', t: 'Рекордсмен',    d: '30 днів',       ok: stats.currentStreak >= 30 },
            { e: '🎓', t: 'Майстер',        d: '500 слів',      ok: stats.wordsLearned >= 500 },
            { e: '🏅', t: 'Легенда',        d: '1000 слів',     ok: stats.wordsLearned >= 1000 },
          ].map((a, i) => (
            <View key={i} style={[styles.achievementCard, a.ok && styles.achievementUnlocked]}>
              <Text style={styles.achievementEmoji}>{a.e}</Text>
              <Text style={styles.achievementTitle}>{a.t}</Text>
              <Text style={styles.achievementDesc}>{a.d}</Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
        <Text style={styles.resetBtnText}>🔄 Скинути прогрес</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { padding: 24, paddingBottom: 12 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#2C3E50' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10, marginBottom: 8 },
  statCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, width: '48%', flexDirection: 'row', alignItems: 'center', gap: 10, borderLeftWidth: 4, elevation: 2 },
  statEmoji: { fontSize: 26 },
  statVal: { fontSize: 18, fontWeight: 'bold' },
  statLabel: { fontSize: 11, color: '#7F8C8D' },
  statHint: { fontSize: 10, color: '#BDC3C7', marginTop: 1 },

  threeStates: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 16 },
  stateItem: { flex: 1, alignItems: 'center' },
  stateVal: { fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
  stateLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stateDot: { width: 8, height: 8, borderRadius: 4 },
  stateLabel: { fontSize: 11, color: '#7F8C8D' },
  stateDivider: { width: 1, height: 50, backgroundColor: '#E0E0E0' },

  chartCard: { margin: 16, backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2 },
  chartLegend: { flexDirection: 'row', gap: 16, marginBottom: 12, marginTop: 4 },
  chart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 90 },
  chartCol: { flex: 1, alignItems: 'center' },
  chartVal: { fontSize: 10, color: '#2C3E50', fontWeight: 'bold', marginBottom: 4, height: 14 },
  chartValEmpty: { height: 14, marginBottom: 4 },
  chartTrack: { width: 22, height: 60, backgroundColor: '#F0F0F0', borderRadius: 4, justifyContent: 'flex-end', overflow: 'hidden' },
  chartBarReview: { width: '100%', backgroundColor: '#F39C12' },
  chartBarLearned: { width: '100%', backgroundColor: '#50C878' },
  chartLabel: { fontSize: 11, color: '#7F8C8D', marginTop: 4 },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, margin: 16, marginTop: 0, marginBottom: 12, elevation: 2 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#2C3E50', marginBottom: 12 },
  barTrack: { height: 10, backgroundColor: '#E0E0E0', borderRadius: 5, overflow: 'hidden', marginBottom: 6, position: 'relative' },
  barLayerYellow: { position: 'absolute', height: '100%', backgroundColor: '#F39C12', borderRadius: 5 },
  barLayerGreen: { position: 'absolute', height: '100%', borderRadius: 5 },
  barLabel: { fontSize: 12, color: '#7F8C8D', textAlign: 'center', marginTop: 4 },

  levelLegend: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: '#7F8C8D' },

  levelRow: { marginBottom: 12 },
  levelRowHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  levelCode: { fontSize: 13, fontWeight: 'bold', color: '#2C3E50', flex: 1 },
  levelCounts: { flexDirection: 'row', gap: 10 },
  levelCount: { fontSize: 12, color: '#7F8C8D' },
  levelInProgress: { fontSize: 12, color: '#F39C12' },

  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  threeCol: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  colItem: { alignItems: 'center', flex: 1 },
  colVal: { fontSize: 26, fontWeight: 'bold', marginBottom: 4 },
  colLabel: { fontSize: 12, color: '#7F8C8D', textAlign: 'center' },
  divider: { width: 1, height: 50, backgroundColor: '#E0E0E0' },
  section: { paddingHorizontal: 16, marginBottom: 12 },

  quizItem: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 },
  quizDate: { fontSize: 13, fontWeight: '600', color: '#2C3E50' },
  quizScore: { fontSize: 12, color: '#7F8C8D', marginTop: 2 },
  lvlBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 4 },
  lvlBadgeText: { fontSize: 10, color: '#fff', fontWeight: 'bold' },
  pctBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  pctBadgeText: { fontSize: 15, fontWeight: 'bold', color: '#fff' },

  achievements: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  achievementCard: { backgroundColor: '#F0F0F0', borderRadius: 12, padding: 14, width: '48%', alignItems: 'center', opacity: 0.45 },
  achievementUnlocked: { backgroundColor: '#fff', opacity: 1, elevation: 2 },
  achievementEmoji: { fontSize: 36, marginBottom: 6 },
  achievementTitle: { fontSize: 13, fontWeight: 'bold', color: '#2C3E50', marginBottom: 2 },
  achievementDesc: { fontSize: 11, color: '#7F8C8D' },

  resetBtn: { backgroundColor: '#E74C3C', marginHorizontal: 16, padding: 16, borderRadius: 12, alignItems: 'center', elevation: 2 },
  resetBtnText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
});

