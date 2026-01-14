// screens/GrammarScreen.js
// Головний екран граматики - перегляд тем за рівнями

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { GRAMMAR_LEVELS, getLevelsArray } from '../data/grammar_config';
import { GRAMMAR_TOPICS } from '../data/grammar_topics';

// Компонент вибору рівня
const LevelSelector = ({ selectedLevel, onSelectLevel }) => {
  const levels = getLevelsArray();
  
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.levelSelectorContainer}
      contentContainerStyle={styles.levelSelectorContent}
    >
      <TouchableOpacity
        style={[
          styles.levelButton,
          !selectedLevel && styles.levelButtonActive,
          { backgroundColor: !selectedLevel ? '#666' : '#f0f0f0' }
        ]}
        onPress={() => onSelectLevel(null)}
      >
        <Text style={[
          styles.levelButtonText,
          !selectedLevel && styles.levelButtonTextActive
        ]}>
          Всі
        </Text>
      </TouchableOpacity>
      
      {levels.map((level) => (
        <TouchableOpacity
          key={level.id}
          style={[
            styles.levelButton,
            selectedLevel === level.id && styles.levelButtonActive,
            { 
              backgroundColor: selectedLevel === level.id ? level.color : '#f0f0f0',
              borderColor: level.color,
            }
          ]}
          onPress={() => onSelectLevel(level.id)}
        >
          <Text style={[
            styles.levelButtonText,
            selectedLevel === level.id && styles.levelButtonTextActive
          ]}>
            {level.id}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

// Компонент картки теми
const TopicCard = ({ topic, onPress }) => {
  const level = GRAMMAR_LEVELS[topic.level];
  
  return (
    <TouchableOpacity 
      style={[styles.topicCard, { borderLeftColor: level.color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.topicCardHeader}>
        <View style={[styles.levelBadge, { backgroundColor: level.color }]}>
          <Text style={styles.levelBadgeText}>{topic.level}</Text>
        </View>
      </View>
      
      <Text style={styles.topicTitle}>{topic.title}</Text>
      <Text style={styles.topicTitleUa}>{topic.titleUa}</Text>
      
      <View style={styles.topicMeta}>
        <View style={styles.metaItem}>
          <Text style={styles.metaIcon}>📝</Text>
          <Text style={styles.metaText}>
            {topic.exercises?.length || 0} вправ
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaIcon}>💡</Text>
          <Text style={styles.metaText}>
            {topic.examples?.length || 0} прикладів
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Головний екран
const GrammarScreen = ({ navigation }) => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Фільтрація тем
  const filteredTopics = useMemo(() => {
    let topics = [...GRAMMAR_TOPICS];
    
    if (selectedLevel) {
      topics = topics.filter(t => t.level === selectedLevel);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      topics = topics.filter(t => 
        t.title.toLowerCase().includes(query) ||
        t.titleUa.toLowerCase().includes(query)
      );
    }
    
    return topics;
  }, [selectedLevel, searchQuery]);
  
  const handleTopicPress = (topic) => {
  navigation.navigate('GrammarTopic', { topicId: topic.id });
};
  
  const stats = useMemo(() => {
    return {
      totalTopics: GRAMMAR_TOPICS.length,
      totalExercises: GRAMMAR_TOPICS.reduce((acc, t) => acc + (t.exercises?.length || 0), 0),
    };
  }, []);
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📖 Граматика</Text>
        <Text style={styles.headerSubtitle}>
          {stats.totalTopics} тем • {stats.totalExercises} вправ
        </Text>
      </View>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Пошук теми..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <LevelSelector 
        selectedLevel={selectedLevel}
        onSelectLevel={setSelectedLevel}
      />
      
      <ScrollView 
        style={styles.topicsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.topicsListContent}
      >
        {filteredTopics.map((topic) => (
          <TopicCard 
            key={topic.id} 
            topic={topic}
            onPress={() => handleTopicPress(topic)}
          />
        ))}
        
        {filteredTopics.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>
              {searchQuery ? `Нічого не знайдено за запитом "${searchQuery}"` : 'Нічого не знайдено'}
            </Text>
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
    padding: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 12,
    paddingLeft: 16,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    position: 'absolute',
    right: 30,
    padding: 8,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#999',
  },
  levelSelectorContainer: {
    backgroundColor: '#fff',
    maxHeight: 60,
  },
  levelSelectorContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 8,
    flexDirection: 'row',
  },
  levelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  levelButtonActive: {
    borderWidth: 2,
  },
  levelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  levelButtonTextActive: {
    color: '#fff',
  },
  topicsList: {
    flex: 1,
  },
  topicsListContent: {
    padding: 15,
    paddingBottom: 30,
  },
  topicCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  topicCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  topicTitleUa: {
    fontSize: 15,
    color: '#666',
    marginBottom: 12,
  },
  topicMeta: {
    flexDirection: 'row',
    gap: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaIcon: {
    fontSize: 14,
  },
  metaText: {
    fontSize: 13,
    color: '#888',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default GrammarScreen;