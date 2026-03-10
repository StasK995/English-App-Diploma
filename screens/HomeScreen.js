// ========================================
// screens/HomeScreen.js
// ========================================

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { getAllWords } from '../data/vocabulary_words';
import { levels } from '../data/vocabulary_config';
import { GRAMMAR_TOPICS } from '../data/grammar';
import { getLearnedWordsCount, getUserStats, getGrammarStats } from '../utils/database';

export function HomeScreen({ navigation }) {
  const [stats, setStats] = useState({ wordsLearned: 0, currentStreak: 0, todayWords: 0, totalWords: 0 });
  const [grammarStats, setGrammarStats] = useState({ topicsCompleted: 0 });

  useEffect(() => {
    loadStats();
    const unsub = navigation.addListener('focus', loadStats);
    return unsub;
  }, [navigation]);

  const loadStats = async () => {
    const [wordsLearned, userStats, gStats] = await Promise.all([
      getLearnedWordsCount(),
      getUserStats(),
      getGrammarStats(),
    ]);
    setStats({
      wordsLearned,
      currentStreak: userStats?.current_streak || 0,
      todayWords: userStats?.today_words || 0,
      totalWords: getAllWords().length,
    });
    setGrammarStats(gStats);
  };

  const pct = stats.totalWords > 0 ? Math.round((stats.wordsLearned / stats.totalWords) * 100) : 0;

  const StatCard = ({ emoji, value, label, color }) => (
    <View style={[hStyles.statCard, { borderBottomColor: color }]}>
      <Text style={hStyles.statEmoji}>{emoji}</Text>
      <Text style={[hStyles.statValue, { color }]}>{value}</Text>
      <Text style={hStyles.statLabel}>{label}</Text>
    </View>
  );

  const MenuBtn = ({ emoji, title, subtitle, color, onPress }) => (
    <TouchableOpacity style={[hStyles.menuBtn, { backgroundColor: color }]} onPress={onPress} activeOpacity={0.8}>
      <Text style={hStyles.menuEmoji}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={hStyles.menuTitle}>{title}</Text>
        <Text style={hStyles.menuSub}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={hStyles.container}>
      <View style={hStyles.header}>
        <Text style={hStyles.greeting}>Вітаємо! 👋</Text>
        <Text style={hStyles.sub}>Готові вчити англійську?</Text>
      </View>

      <View style={hStyles.statsRow}>
        <StatCard emoji="📚" value={stats.wordsLearned} label="Вивчено" color="#4A90E2" />
        <StatCard emoji="🔥" value={stats.currentStreak} label="Днів підряд" color="#E74C3C" />
        <StatCard emoji="⭐" value={stats.todayWords} label="Сьогодні" color="#F39C12" />
        <StatCard emoji="📊" value={`${pct}%`} label="Прогрес" color="#50C878" />
      </View>

      <View style={hStyles.newYear}>
        <Text style={hStyles.nyTitle}>🎄 New Year Special</Text>
        <TouchableOpacity onPress={() => navigation.navigate('NewYearVocabulary')}>
          <Text style={hStyles.nyLink}>Перейти →</Text>
        </TouchableOpacity>
      </View>

      <View style={hStyles.menu}>
        <Text style={hStyles.sectionTitle}>Почніть навчання</Text>
        <MenuBtn emoji="📖" title="Словник" subtitle="Флешкарти з 6000 слів" color="#4A90E2" onPress={() => navigation.navigate('Vocabulary')} />
        <MenuBtn emoji="📝" title="Граматика" subtitle={`${GRAMMAR_TOPICS.length} тем • ${grammarStats.topicsCompleted} завершено`} color="#9C27B0" onPress={() => navigation.navigate('Grammar')} />
        <MenuBtn emoji="✏️" title="Вікторина" subtitle="Перевірте свої знання" color="#50C878" onPress={() => navigation.navigate('Quiz')} />
        <MenuBtn emoji="📊" title="Прогрес" subtitle="Статистика навчання" color="#FF5722" onPress={() => navigation.navigate('Progress')} />
      </View>

      <View style={hStyles.tip}>
        <Text style={hStyles.tipTitle}>💡 Порада</Text>
        <Text style={hStyles.tipText}>Вчіть по 10-15 слів щодня і повторюйте раніше вивчені — це найефективніший метод!</Text>
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const hStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { padding: 24, paddingTop: 16 },
  greeting: { fontSize: 32, fontWeight: 'bold', color: '#2C3E50', marginBottom: 4 },
  sub: { fontSize: 16, color: '#7F8C8D' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 12, marginBottom: 16 },
  statCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center', width: '23%', elevation: 2, borderBottomWidth: 3 },
  statEmoji: { fontSize: 22, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: 'bold', marginBottom: 2 },
  statLabel: { fontSize: 10, color: '#7F8C8D', textAlign: 'center' },
  newYear: { backgroundColor: '#C62828', marginHorizontal: 16, marginBottom: 16, padding: 20, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nyTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  nyLink: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  menu: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#2C3E50', marginBottom: 12 },
  menuBtn: { borderRadius: 14, padding: 18, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  menuEmoji: { fontSize: 30, marginRight: 14 },
  menuTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
  menuSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)' },
  tip: { backgroundColor: '#FFF9E6', borderRadius: 14, padding: 18, marginHorizontal: 16, borderLeftWidth: 4, borderLeftColor: '#F39C12' },
  tipTitle: { fontSize: 15, fontWeight: 'bold', color: '#E67E22', marginBottom: 6 },
  tipText: { fontSize: 14, color: '#8E6F3E', lineHeight: 20 },
});

export default HomeScreen;



