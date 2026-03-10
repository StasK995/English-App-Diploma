import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, SafeAreaView,
} from 'react-native';
import { getAllWords } from '../data/vocabulary_words';
import { levels } from '../data/vocabulary_config';
import { getKnownWordIds, getLearnedCountForWordIds, getSRSStatesForWords } from '../utils/database';

const STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  LEARNED:     'learned',
};

const STATUS_CONFIG = {
  [STATUS.NOT_STARTED]: { color: '#D0D0D0', label: 'Не вивчено',  dot: '#D0D0D0' },
  [STATUS.IN_PROGRESS]: { color: '#F39C12', label: 'В процесі',   dot: '#F39C12' },
  [STATUS.LEARNED]:     { color: '#50C878', label: 'Вивчено',     dot: '#50C878' },
};

const FILTER_TABS = [
  { key: 'all',                    label: 'Всі' },
  { key: STATUS.NOT_STARTED,       label: '⚪ Не вивчено' },
  { key: STATUS.IN_PROGRESS,       label: '🟡 В процесі' },
  { key: STATUS.LEARNED,           label: '🟢 Вивчено' },
];

// Скорочення частини мови
const POS_SHORT = {
  'noun': 'n.',
  'verb': 'v.',
  'adjective': 'adj.',
  'adverb': 'adv.',
  'preposition': 'prep.',
  'pronoun': 'pron.',
  'conjunction': 'conj.',
  'interjection': 'interj.',
  'article': 'art.',
  'phrase': 'phr.',
};

export default function VocabularyScreen({ navigation }) {
  const [allWords] = useState(() => getAllWords());
  const [knownIds, setKnownIds] = useState(new Set());
  const [inProgressIds, setInProgressIds] = useState(new Set());
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [levelStats, setLevelStats] = useState({});
  const [expandedWordId, setExpandedWordId] = useState(null);
  const [counts, setCounts] = useState({ all: 0, not_started: 0, in_progress: 0, learned: 0 });

  useEffect(() => {
    loadData();
    const unsubscribe = navigation?.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    const known = await getKnownWordIds();
    const knownSet = new Set(known);
    setKnownIds(knownSet);

    const allIds = allWords.map(w => w.id);
    const srsStates = await getSRSStatesForWords(allIds);
    const inProgressSet = new Set(
      Object.keys(srsStates)
        .map(id => Number(id))
        .filter(id => !knownSet.has(id))
    );
    setInProgressIds(inProgressSet);

    const stats = {};
    for (const level of levels) {
      const ids = allWords.filter(w => w.level === level.code).map(w => w.id);
      const learned = await getLearnedCountForWordIds(ids);
      const inProg = ids.filter(id => inProgressSet.has(id)).length;
      stats[level.code] = { total: ids.length, learned, inProgress: inProg };
    }
    setLevelStats(stats);
  };

  const getWordStatus = useCallback((wordId) => {
    if (knownIds.has(wordId)) return STATUS.LEARNED;
    if (inProgressIds.has(wordId)) return STATUS.IN_PROGRESS;
    return STATUS.NOT_STARTED;
  }, [knownIds, inProgressIds]);

  const getFilteredWords = useCallback(() => {
    let filtered = allWords;
    if (selectedLevel) filtered = filtered.filter(w => w.level === selectedLevel);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(w =>
        w.english.toLowerCase().includes(q) ||
        w.ukrainian.toLowerCase().includes(q)
      );
    }
    if (activeFilter !== 'all') {
      filtered = filtered.filter(w => getWordStatus(w.id) === activeFilter);
    }
    return filtered;
  }, [selectedLevel, searchQuery, activeFilter, knownIds, inProgressIds]);

  useEffect(() => {
    let base = allWords;
    if (selectedLevel) base = base.filter(w => w.level === selectedLevel);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      base = base.filter(w => w.english.toLowerCase().includes(q) || w.ukrainian.toLowerCase().includes(q));
    }
    setCounts({
      all: base.length,
      not_started: base.filter(w => getWordStatus(w.id) === STATUS.NOT_STARTED).length,
      in_progress: base.filter(w => getWordStatus(w.id) === STATUS.IN_PROGRESS).length,
      learned: base.filter(w => getWordStatus(w.id) === STATUS.LEARNED).length,
    });
  }, [selectedLevel, searchQuery, knownIds, inProgressIds]);

  const filteredWords = getFilteredWords();

  const WordItem = ({ item }) => {
    const status = getWordStatus(item.id);
    const config = STATUS_CONFIG[status];
    const isExpanded = expandedWordId === item.id;
    const levelData = levels.find(l => l.code === item.level);
    const isLearned = status === STATUS.LEARNED;
    const isInProgress = status === STATUS.IN_PROGRESS;
    const posShort = item.partOfSpeech ? (POS_SHORT[item.partOfSpeech] || item.partOfSpeech) : null;

    return (
      <TouchableOpacity
        style={[
          styles.wordItem,
          isLearned && styles.wordItemLearned,
          isInProgress && styles.wordItemInProgress,
          !isLearned && !isInProgress && styles.wordItemNotStarted,
        ]}
        onPress={() => setExpandedWordId(isExpanded ? null : item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.wordRow}>
          <View style={[styles.statusDot, { backgroundColor: config.dot }]} />

          <View style={styles.wordContent}>
            <View style={styles.wordHeader}>
              {/* Англійське слово + частина мови */}
              <View style={styles.wordEnRow}>
                <Text style={[
                  styles.wordEn,
                  !isLearned && !isInProgress && styles.wordEnDim,
                ]}>
                  {item.english}
                </Text>
                {posShort && (
                  <Text style={[
                    styles.partOfSpeech,
                    isLearned && { color: '#A8D5B5' },
                    isInProgress && { color: '#F9C784' },
                  ]}>
                    {posShort}
                  </Text>
                )}
              </View>

              <View style={[
                styles.levelBadge,
                { backgroundColor: levelData?.color || '#ccc' },
                !isLearned && !isInProgress && { opacity: 0.4 },
              ]}>
                <Text style={styles.levelBadgeText}>{item.level}</Text>
              </View>
            </View>

            {isLearned ? (
              <Text style={styles.translationLearned}>{item.ukrainian}</Text>
            ) : isInProgress ? (
              <Text style={styles.translationInProgress}>
                {isExpanded ? item.ukrainian : '• • •  (в процесі)'}
              </Text>
            ) : (
              <Text style={styles.translationNotStarted}>
                {isExpanded ? item.ukrainian : '• • •'}
              </Text>
            )}

            {isExpanded && item.example && (
              <Text style={styles.example}>"{item.example}"</Text>
            )}
          </View>

          {isLearned && <Text style={styles.statusIcon}>✓</Text>}
          {isInProgress && <Text style={styles.statusIconProgress}>↻</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Пошук слова..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.levelRow}>
        <TouchableOpacity
          style={[styles.levelBtn, !selectedLevel && styles.levelBtnActive]}
          onPress={() => setSelectedLevel(null)}
        >
          <Text style={[styles.levelBtnText, !selectedLevel && styles.levelBtnTextActive]}>Всі</Text>
        </TouchableOpacity>
        {levels.map(l => {
          const stats = levelStats[l.code] || { total: 0, learned: 0, inProgress: 0 };
          const isActive = selectedLevel === l.code;
          return (
            <TouchableOpacity
              key={l.code}
              style={[styles.levelBtn, isActive && { backgroundColor: l.color, borderColor: l.color }]}
              onPress={() => setSelectedLevel(isActive ? null : l.code)}
            >
              <Text style={[styles.levelBtnText, isActive && styles.levelBtnTextActive]}>{l.code}</Text>
              <Text style={[styles.levelBtnStat, isActive && { color: 'rgba(255,255,255,0.8)' }]}>
                {stats.learned}/{stats.total}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.filterRow}>
        {FILTER_TABS.map(tab => {
          const count = tab.key === 'all' ? counts.all : counts[tab.key];
          const isActive = activeFilter === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.filterTab, isActive && styles.filterTabActive]}
              onPress={() => setActiveFilter(tab.key)}
            >
              <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                {tab.label}
              </Text>
              <Text style={[styles.filterTabCount, isActive && styles.filterTabCountActive]}>
                {count}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {activeFilter === 'all' && counts.not_started > 0 && (
        <View style={styles.hintBar}>
          <Text style={styles.hintText}>
            💡 Слова вивчаються через <Text style={styles.hintBold}>Навчання (SRS)</Text>
          </Text>
        </View>
      )}

      <FlatList
        data={filteredWords}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => <WordItem item={item} />}
        initialNumToRender={30}
        maxToRenderPerBatch={30}
        windowSize={10}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>
              {activeFilter === STATUS.LEARNED ? '📚'
                : activeFilter === STATUS.IN_PROGRESS ? '🔄'
                : '🔍'}
            </Text>
            <Text style={styles.emptyText}>
              {activeFilter === STATUS.LEARNED
                ? 'Вивчених слів ще немає.\nПочни навчання в розділі "Навчання"!'
                : activeFilter === STATUS.IN_PROGRESS
                ? 'Немає слів в процесі.\nПочни навчання!'
                : 'Нічого не знайдено'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },

  searchContainer: { flexDirection: 'row', alignItems: 'center', margin: 12, marginBottom: 8, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, elevation: 2 },
  searchInput: { flex: 1, fontSize: 16, paddingVertical: 12, color: '#2C3E50' },
  clearBtn: { padding: 8 },
  clearBtnText: { fontSize: 16, color: '#999' },

  levelRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 6, marginBottom: 8 },
  levelBtn: { flex: 1, alignItems: 'center', paddingVertical: 6, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E0E0E0' },
  levelBtnActive: { backgroundColor: '#4A90E2', borderColor: '#4A90E2' },
  levelBtnText: { fontSize: 12, fontWeight: 'bold', color: '#7F8C8D' },
  levelBtnTextActive: { color: '#fff' },
  levelBtnStat: { fontSize: 9, color: '#BDC3C7', marginTop: 1 },

  filterRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 6, marginBottom: 8 },
  filterTab: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E0E0E0' },
  filterTabActive: { backgroundColor: '#4A90E2', borderColor: '#4A90E2' },
  filterTabText: { fontSize: 10, fontWeight: '600', color: '#7F8C8D' },
  filterTabTextActive: { color: '#fff' },
  filterTabCount: { fontSize: 13, fontWeight: 'bold', color: '#2C3E50', marginTop: 2 },
  filterTabCountActive: { color: '#fff' },

  hintBar: { backgroundColor: '#FFF9E6', marginHorizontal: 12, marginBottom: 8, padding: 10, borderRadius: 10, borderLeftWidth: 3, borderLeftColor: '#F39C12' },
  hintText: { fontSize: 12, color: '#8E6F3E' },
  hintBold: { fontWeight: 'bold' },

  wordItem: { marginHorizontal: 12, marginBottom: 5, borderRadius: 12, overflow: 'hidden' },
  wordItemLearned: { backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 },
  wordItemInProgress: { backgroundColor: '#FFFBF0', elevation: 1, borderWidth: 1, borderColor: '#FDEAA7' },
  wordItemNotStarted: { backgroundColor: '#F8F8F8', opacity: 0.7 },

  wordRow: { flexDirection: 'row', alignItems: 'center', padding: 13 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12, flexShrink: 0 },
  wordContent: { flex: 1 },
  wordHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 },

  wordEnRow: { flexDirection: 'row', alignItems: 'baseline', flex: 1, gap: 5 },
  wordEn: { fontSize: 16, fontWeight: '700', color: '#2C3E50' },
  wordEnDim: { color: '#9E9E9E' },
  partOfSpeech: { fontSize: 11, color: '#BDC3C7', fontStyle: 'italic' },

  levelBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 8 },
  levelBadgeText: { fontSize: 10, color: '#fff', fontWeight: 'bold' },

  translationLearned: { fontSize: 13, color: '#50C878', fontWeight: '600' },
  translationInProgress: { fontSize: 13, color: '#F39C12', fontWeight: '500' },
  translationNotStarted: { fontSize: 13, color: '#C0C0C0', letterSpacing: 2 },

  example: { fontSize: 12, color: '#7F8C8D', fontStyle: 'italic', marginTop: 5, lineHeight: 17 },

  statusIcon: { fontSize: 16, color: '#50C878', fontWeight: 'bold', marginLeft: 8 },
  statusIconProgress: { fontSize: 18, color: '#F39C12', fontWeight: 'bold', marginLeft: 8 },

  emptyContainer: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyText: { fontSize: 16, color: '#7F8C8D', textAlign: 'center', lineHeight: 24 },
});