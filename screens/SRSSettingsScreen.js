import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView,
} from 'react-native';
import { getAllWords } from '../data/vocabulary_words';
import { levels, categories } from '../data/vocabulary_config';
import {
  getLearnedCountForWordIds,
  getWordsForSRSSession,
  getSRSStatsByLevel,
} from '../utils/database';

export default function SRSSettingsScreen({ navigation }) {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [wordsCount, setWordsCount] = useState(20);
  const [mode, setMode] = useState('mixed');
  const [levelProgress, setLevelProgress] = useState({});
  const [levelSRSStats, setLevelSRSStats] = useState({});
  const [sessionPreview, setSessionPreview] = useState({ due: 0, new: 0 });

  useEffect(() => {
    loadProgress();
    // ✅ Оновлюємо при поверненні на екран
    const unsubscribe = navigation.addListener('focus', loadProgress);
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (selectedLevel) {
      updateSessionPreviewForLevel(selectedLevel, selectedCategory, wordsCount);
    }
  }, [selectedLevel, selectedCategory, wordsCount, mode]);

  const loadProgress = async () => {
    const allWords = getAllWords();
    const progress = {};
    const srsStats = {};

    for (const level of levels) {
      const ids = allWords.filter(w => w.level === level.code).map(w => w.id);
      const learned = await getLearnedCountForWordIds(ids);
      progress[level.code] = {
        total: ids.length,
        learned,
        percentage: ids.length > 0 ? Math.round((learned / ids.length) * 100) : 0,
      };
      srsStats[level.code] = await getSRSStatsByLevel(ids);
    }

    setLevelProgress(progress);
    setLevelSRSStats(srsStats);

    let firstLevel = null;
    const withDue = levels.find(l => (srsStats[l.code]?.due || 0) > 0);
    const first = withDue || levels.find(l => (progress[l.code]?.percentage || 0) < 100) || levels[0];
    if (first) {
      firstLevel = first.code;
      setSelectedLevel(firstLevel);
    }

    if (firstLevel) {
      await updateSessionPreviewForLevel(firstLevel, null, 20);
    }
  };

  const updateSessionPreviewForLevel = async (level, category, count) => {
    if (!level) return;
    try {
      let allWords = getAllWords().filter(w => w.level === level);
      if (category) allWords = allWords.filter(w => w.category === category);
      const { dueWords, newWords } = await getWordsForSRSSession(allWords, count);
      setSessionPreview({ due: dueWords.length, new: newWords.length });
    } catch (e) {
      console.error('Preview error:', e);
    }
  };

  const startSession = () => {
    const total = sessionPreview.due + sessionPreview.new;
    if (total === 0) {
      alert('Немає слів для навчання. Поверніться завтра або оберіть інший рівень!');
      return;
    }
    navigation.navigate('SRSLearn', {
      level: selectedLevel,
      category: selectedCategory,
      wordsCount,
      mode,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Навчання</Text>
          <Text style={styles.subtitle}>Інтервальне повторення (SRS)</Text>
        </View>

        {/* Рівні */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 Рівень</Text>
          {levels.map(level => {
            const prog = levelProgress[level.code] || { total: 0, learned: 0, percentage: 0 };
            const srs = levelSRSStats[level.code] || { due: 0, new: 0, learning: 0, mastered: 0 };
            const isSelected = selectedLevel === level.code;

            return (
              <TouchableOpacity
                key={level.code}
                style={[styles.levelCard, isSelected && { borderColor: level.color, borderWidth: 3 }]}
                onPress={() => setSelectedLevel(level.code)}
              >
                <View style={styles.levelCardTop}>
                  <View style={[styles.levelBadge, { backgroundColor: level.color }]}>
                    <Text style={styles.levelBadgeText}>{level.code}</Text>
                  </View>
                  <Text style={styles.levelName}>{level.name}</Text>
                  {isSelected && (
                    <View style={[styles.checkBadge, { backgroundColor: level.color }]}>
                      <Text style={styles.checkText}>✓</Text>
                    </View>
                  )}
                </View>

                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${prog.percentage}%`, backgroundColor: level.color }]} />
                </View>
                <Text style={styles.progressText}>{prog.learned}/{prog.total} слів ({prog.percentage}%)</Text>

                <View style={styles.srsRow}>
                  {srs.due > 0 && (
                    <View style={styles.srsBadge}>
                      <Text style={styles.srsBadgeText}>🔄 {srs.due} на повторення</Text>
                    </View>
                  )}
                  {srs.new > 0 && (
                    <View style={[styles.srsBadge, styles.srsBadgeNew]}>
                      <Text style={[styles.srsBadgeText, { color: '#4A90E2' }]}>🆕 {srs.new} нових</Text>
                    </View>
                  )}
                  {srs.mastered > 0 && (
                    <View style={[styles.srsBadge, styles.srsBadgeMastered]}>
                      <Text style={[styles.srsBadgeText, { color: '#50C878' }]}>🎓 {srs.mastered} опановано</Text>
                    </View>
                  )}
                  {srs.due === 0 && srs.new === 0 && srs.mastered === 0 && (
                    <View style={[styles.srsBadge, styles.srsBadgeNew]}>
                      <Text style={[styles.srsBadgeText, { color: '#4A90E2' }]}>🆕 {prog.total} нових</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Категорія */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏷️ Категорія (опціонально)</Text>
          <View style={styles.chipRow}>
            <TouchableOpacity
              style={[styles.chip, !selectedCategory && styles.chipSelected]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text style={styles.chipEmoji}>📋</Text>
              <Text style={[styles.chipText, !selectedCategory && styles.chipTextSelected]}>Всі</Text>
            </TouchableOpacity>
            {categories.map(cat => {
              const isSelected = selectedCategory === cat.code;
              return (
                <TouchableOpacity
                  key={cat.code}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => setSelectedCategory(isSelected ? null : cat.code)}
                >
                  <Text style={styles.chipEmoji}>{cat.emoji}</Text>
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{cat.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Режим */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Режим</Text>
          <View style={styles.modesRow}>
            {[
              { key: 'mixed',  emoji: '🔀', label: 'Змішано' },
              { key: 'new',    emoji: '🆕', label: 'Нові' },
              { key: 'review', emoji: '🔄', label: 'Повторення' },
            ].map(m => (
              <TouchableOpacity
                key={m.key}
                style={[styles.modeBtn, mode === m.key && styles.modeBtnSelected]}
                onPress={() => setMode(m.key)}
              >
                <Text style={styles.modeEmoji}>{m.emoji}</Text>
                <Text style={[styles.modeLabel, mode === m.key && styles.modeLabelSelected]}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Кількість */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔢 Слів за сесію</Text>
          <View style={styles.chipRow}>
            {[10, 20, 30, 50].map(n => (
              <TouchableOpacity
                key={n}
                style={[styles.countBtn, wordsCount === n && styles.countBtnSelected]}
                onPress={() => setWordsCount(n)}
              >
                <Text style={[styles.countText, wordsCount === n && styles.countTextSelected]}>{n}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Preview сесії */}
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>Сесія буде складатися з:</Text>
          <View style={styles.previewRow}>
            <View style={styles.previewItem}>
              <Text style={[styles.previewVal, { color: '#E67E22' }]}>{sessionPreview.due}</Text>
              <Text style={styles.previewLabel}>🔄 На повторення</Text>
            </View>
            <View style={styles.previewDivider} />
            <View style={styles.previewItem}>
              <Text style={[styles.previewVal, { color: '#4A90E2' }]}>{sessionPreview.new}</Text>
              <Text style={styles.previewLabel}>🆕 Нові слова</Text>
            </View>
          </View>
          {sessionPreview.due === 0 && sessionPreview.new === 0 && (
            <Text style={styles.previewEmpty}>
              🎯 Все повторено! Поверніться завтра або оберіть інший рівень.
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.startBtn,
            (sessionPreview.due + sessionPreview.new) === 0 && styles.startBtnDisabled,
          ]}
          onPress={startSession}
          disabled={(sessionPreview.due + sessionPreview.new) === 0}
        >
          <Text style={styles.startBtnText}>🚀 Почати навчання</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { padding: 20, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2C3E50', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#7F8C8D' },
  section: { padding: 20, paddingTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2C3E50', marginBottom: 12 },
  levelCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 2, borderColor: 'transparent', elevation: 2 },
  levelCardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  levelBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginRight: 10 },
  levelBadgeText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  levelName: { fontSize: 16, fontWeight: 'bold', color: '#2C3E50', flex: 1 },
  checkBadge: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  checkText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  progressBar: { height: 6, backgroundColor: '#E0E0E0', borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 12, color: '#7F8C8D', marginBottom: 8 },
  srsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  srsBadge: { backgroundColor: '#FFF3E0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  srsBadgeNew: { backgroundColor: '#E3F2FD' },
  srsBadgeMastered: { backgroundColor: '#E8F5E9' },
  srsBadgeText: { fontSize: 11, color: '#E67E22', fontWeight: '600' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 2, borderColor: 'transparent', gap: 4 },
  chipSelected: { borderColor: '#4A90E2', backgroundColor: '#E3F2FD' },
  chipEmoji: { fontSize: 16 },
  chipText: { fontSize: 13, color: '#2C3E50' },
  chipTextSelected: { fontWeight: 'bold', color: '#4A90E2' },
  modesRow: { flexDirection: 'row', gap: 10 },
  modeBtn: { flex: 1, alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 12, borderWidth: 2, borderColor: 'transparent', elevation: 1 },
  modeBtnSelected: { borderColor: '#4A90E2', backgroundColor: '#E3F2FD' },
  modeEmoji: { fontSize: 24, marginBottom: 6 },
  modeLabel: { fontSize: 12, color: '#2C3E50', fontWeight: '600' },
  modeLabelSelected: { color: '#4A90E2' },
  countBtn: { flex: 1, backgroundColor: '#fff', padding: 14, borderRadius: 12, alignItems: 'center', borderWidth: 2, borderColor: 'transparent', elevation: 1 },
  countBtnSelected: { borderColor: '#4A90E2', backgroundColor: '#E3F2FD' },
  countText: { fontSize: 18, fontWeight: 'bold', color: '#2C3E50' },
  countTextSelected: { color: '#4A90E2' },
  previewCard: { backgroundColor: '#fff', marginHorizontal: 20, padding: 20, borderRadius: 14, elevation: 2, marginBottom: 16 },
  previewTitle: { fontSize: 14, color: '#7F8C8D', textAlign: 'center', marginBottom: 16 },
  previewRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  previewItem: { alignItems: 'center' },
  previewVal: { fontSize: 36, fontWeight: 'bold', marginBottom: 4 },
  previewLabel: { fontSize: 13, color: '#7F8C8D' },
  previewDivider: { width: 1, height: 50, backgroundColor: '#E0E0E0' },
  previewEmpty: { textAlign: 'center', color: '#7F8C8D', fontSize: 14, marginTop: 12 },
  startBtn: { backgroundColor: '#4A90E2', marginHorizontal: 20, padding: 18, borderRadius: 14, alignItems: 'center', elevation: 4 },
  startBtnDisabled: { backgroundColor: '#BDC3C7' },
  startBtnText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
});