// screens/GrammarTopicScreen.js
// Детальний перегляд теми граматики

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { GRAMMAR_LEVELS } from '../data/grammar_config';
import { getTopicById } from '../data/grammar_topics';

// Компонент таблиці
const GrammarTable = ({ table }) => {
  if (!table || !table.headers || !table.rows) return null;
  
  return (
    <View style={styles.tableContainer}>
      {table.title && (
        <Text style={styles.tableTitle}>{table.title}</Text>
      )}
      
      {/* Заголовки */}
      <View style={styles.tableRow}>
        {table.headers.map((header, idx) => (
          <View key={idx} style={[styles.tableCell, styles.tableHeader]}>
            <Text style={styles.tableHeaderText}>{header}</Text>
          </View>
        ))}
      </View>
      
      {/* Рядки */}
      {table.rows.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.tableRow}>
          {row.map((cell, cellIdx) => (
            <View key={cellIdx} style={styles.tableCell}>
              <Text style={styles.tableCellText}>{cell}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

// Компонент правила
const RuleCard = ({ rule }) => (
  <View style={styles.ruleCard}>
    <Text style={styles.ruleTitle}>{rule.rule}</Text>
    <Text style={styles.ruleExplanation}>{rule.explanation}</Text>
    {rule.example && (
      <View style={styles.exampleBox}>
        <Text style={styles.exampleText}>{rule.example}</Text>
      </View>
    )}
  </View>
);

// Компонент прикладу
const ExampleCard = ({ example, index }) => (
  <View style={styles.exampleCard}>
    <View style={styles.exampleNumber}>
      <Text style={styles.exampleNumberText}>{index + 1}</Text>
    </View>
    <View style={styles.exampleContent}>
      <Text style={styles.exampleEnglish}>{example.english}</Text>
      <Text style={styles.exampleUkrainian}>{example.ukrainian}</Text>
    </View>
  </View>
);

// Головний екран
const GrammarTopicScreen = ({ route, navigation }) => {
  const { topicId } = route.params;
  const topic = getTopicById(topicId);
  const [activeTab, setActiveTab] = useState('theory'); // theory, examples, exercises

  if (!topic) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Тему не знайдено</Text>
      </SafeAreaView>
    );
  }

  const level = GRAMMAR_LEVELS[topic.level];

  return (
    <SafeAreaView style={styles.container}>
      {/* Заголовок */}
      <View style={[styles.header, { backgroundColor: level.color }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Назад</Text>
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.levelBadge}>{topic.level}</Text>
          <Text style={styles.headerTitle}>{topic.title}</Text>
          <Text style={styles.headerSubtitle}>{topic.titleUa}</Text>
        </View>
      </View>

      {/* Табы */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'theory' && styles.tabActive]}
          onPress={() => setActiveTab('theory')}
        >
          <Text style={[styles.tabText, activeTab === 'theory' && styles.tabTextActive]}>
            📚 Теорія
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'examples' && styles.tabActive]}
          onPress={() => setActiveTab('examples')}
        >
          <Text style={[styles.tabText, activeTab === 'examples' && styles.tabTextActive]}>
            💡 Приклади
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'exercises' && styles.tabActive]}
          onPress={() => setActiveTab('exercises')}
        >
          <Text style={[styles.tabText, activeTab === 'exercises' && styles.tabTextActive]}>
            ✏️ Вправи
          </Text>
        </TouchableOpacity>
      </View>

      {/* Контент */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Таб: Теорія */}
        {activeTab === 'theory' && (
          <View style={styles.tabContent}>
            {/* Вступ */}
            {topic.explanation?.intro && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📖 Опис</Text>
                <Text style={styles.introText}>{topic.explanation.intro}</Text>
              </View>
            )}

            {/* Правила */}
            {topic.explanation?.rules && topic.explanation.rules.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📌 Правила</Text>
                {topic.explanation.rules.map((rule, idx) => (
                  <RuleCard key={idx} rule={rule} />
                ))}
              </View>
            )}

            {/* Таблиці */}
            {topic.explanation?.tables && topic.explanation.tables.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📊 Таблиці</Text>
                {topic.explanation.tables.map((table, idx) => (
                  <GrammarTable key={idx} table={table} />
                ))}
              </View>
            )}

            {/* Поради */}
            {topic.explanation?.tips && topic.explanation.tips.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>💡 Поради</Text>
                {topic.explanation.tips.map((tip, idx) => (
                  <View key={idx} style={styles.tipItem}>
                    <Text style={styles.tipBullet}>•</Text>
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Типові помилки */}
            {topic.explanation?.commonMistakes && topic.explanation.commonMistakes.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>❌ Типові помилки</Text>
                {topic.explanation.commonMistakes.map((mistake, idx) => (
                  <View key={idx} style={styles.mistakeCard}>
                    <Text style={styles.mistakeWrong}>❌ {mistake.wrong}</Text>
                    <Text style={styles.mistakeCorrect}>✅ {mistake.correct}</Text>
                    {mistake.explanation && (
                      <Text style={styles.mistakeExplanation}>{mistake.explanation}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Таб: Приклади */}
        {activeTab === 'examples' && (
          <View style={styles.tabContent}>
            {topic.examples && topic.examples.length > 0 ? (
              topic.examples.map((example, idx) => (
                <ExampleCard key={idx} example={example} index={idx} />
              ))
            ) : (
              <Text style={styles.emptyText}>Приклади скоро будуть додані</Text>
            )}
          </View>
        )}

        {/* Таб: Вправи */}
        {activeTab === 'exercises' && (
          <View style={styles.tabContent}>
            {topic.exercises && topic.exercises.length > 0 ? (
              <>
                <Text style={styles.exercisesInfo}>
                  Доступно {topic.exercises.length} вправ
                </Text>
                
                <TouchableOpacity
                  style={[styles.startButton, { backgroundColor: level.color }]}
                  onPress={() => navigation.navigate('GrammarExercise', { topicId: topic.id })}
                >
                  <Text style={styles.startButtonText}>🚀 Почати вправи</Text>
                </TouchableOpacity>

                {/* Список типів вправ */}
                <View style={styles.exercisesList}>
                  {topic.exercises.map((exercise, idx) => (
                    <View key={idx} style={styles.exerciseItem}>
                      <Text style={styles.exerciseIcon}>
                        {exercise.type === 'fill_blank' && '✏️'}
                        {exercise.type === 'multiple_choice' && '🔘'}
                        {exercise.type === 'error_correction' && '❌'}
                        {exercise.type === 'transform' && '🔄'}
                      </Text>
                      <View style={styles.exerciseInfo}>
                        <Text style={styles.exerciseTitle}>{exercise.instruction}</Text>
                        <Text style={styles.exerciseCount}>
                          {exercise.questions?.length || 0} питань
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <Text style={styles.emptyText}>Вправи скоро будуть додані</Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContent: {
    alignItems: 'center',
  },
  levelBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#4CAF50',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 15,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  introText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
  },
  ruleCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  ruleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  ruleExplanation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  exampleBox: {
    backgroundColor: '#f0f8f0',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  exampleText: {
    fontSize: 14,
    color: '#2e7d32',
    fontStyle: 'italic',
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
  },
  tableTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    padding: 12,
    backgroundColor: '#f5f5f5',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tableCell: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  tableHeader: {
    backgroundColor: '#f9f9f9',
  },
  tableHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#555',
  },
  tableCellText: {
    fontSize: 13,
    color: '#666',
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 5,
  },
  tipBullet: {
    fontSize: 16,
    color: '#4CAF50',
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
  },
  mistakeCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  mistakeWrong: {
    fontSize: 14,
    color: '#d32f2f',
    marginBottom: 4,
  },
  mistakeCorrect: {
    fontSize: 14,
    color: '#2e7d32',
    marginBottom: 6,
  },
  mistakeExplanation: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  exampleCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  exampleNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exampleNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  exampleContent: {
    flex: 1,
  },
  exampleEnglish: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  exampleUkrainian: {
    fontSize: 14,
    color: '#666',
  },
  exercisesInfo: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 15,
  },
  startButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  exercisesList: {
    marginTop: 10,
  },
  exerciseItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  exerciseIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  exerciseCount: {
    fontSize: 13,
    color: '#888',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#d32f2f',
    textAlign: 'center',
    marginTop: 40,
  },
});

export default GrammarTopicScreen;