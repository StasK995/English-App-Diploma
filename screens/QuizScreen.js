import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { words } from '../data/vocabulary_words';
import { levels, categories } from '../data/vocabulary_config';

export default function QuizScreen() {
  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  
  // Filter state
  const [quizStarted, setQuizStarted] = useState(false);
  const [selectedLevels, setSelectedLevels] = useState(['A1']); // Вибрані рівні
  const [selectedCategories, setSelectedCategories] = useState([]); // Порожній = всі
  const [questionCount, setQuestionCount] = useState(10); // Кількість питань
  const [availableWordsCount, setAvailableWordsCount] = useState(0);

  // Підрахунок доступних слів при зміні фільтрів
  useEffect(() => {
    const filteredWords = getFilteredWords();
    setAvailableWordsCount(filteredWords.length);
  }, [selectedLevels, selectedCategories]);

  // Отримати слова за фільтрами
  const getFilteredWords = () => {
    return words.filter(word => {
      const levelMatch = selectedLevels.length === 0 || selectedLevels.includes(word.level);
      const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(word.category);
      return levelMatch && categoryMatch;
    });
  };

  // Перемикання рівня
  const toggleLevel = (levelCode) => {
    setSelectedLevels(prev => {
      if (prev.includes(levelCode)) {
        // Не дозволяємо зняти останній рівень
        if (prev.length === 1) return prev;
        return prev.filter(l => l !== levelCode);
      } else {
        return [...prev, levelCode];
      }
    });
  };

  // Вибрати всі рівні
  const selectAllLevels = () => {
    setSelectedLevels(levels.map(l => l.code));
  };

  // Перемикання категорії
  const toggleCategory = (categoryCode) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryCode)) {
        return prev.filter(c => c !== categoryCode);
      } else {
        return [...prev, categoryCode];
      }
    });
  };

  // Вибрати всі / зняти всі категорії
  const toggleAllCategories = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(categories.map(c => c.code));
    }
  };

  // Генерація вікторини
  const generateQuiz = () => {
    const filteredWords = getFilteredWords();
    
    if (filteredWords.length < 4) {
      return false;
    }
    
    // Вибираємо випадкові слова
    const shuffled = [...filteredWords].sort(() => 0.5 - Math.random());
    const count = Math.min(questionCount, filteredWords.length);
    const selectedWords = shuffled.slice(0, count);

    const quizQuestions = selectedWords.map((word) => {
      // Отримуємо 3 неправильні відповіді
      let wrongAnswers = filteredWords
        .filter(w => w.id !== word.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      
      // Якщо недостатньо слів у фільтрі, беремо з усіх
      if (wrongAnswers.length < 3) {
        const additionalWrong = words
          .filter(w => w.id !== word.id && !wrongAnswers.find(wa => wa.id === w.id))
          .sort(() => 0.5 - Math.random())
          .slice(0, 3 - wrongAnswers.length);
        wrongAnswers = [...wrongAnswers, ...additionalWrong];
      }
      
      const allAnswers = [
        { text: word.ukrainian, correct: true },
        ...wrongAnswers.map(w => ({ text: w.ukrainian, correct: false })),
      ];

      const shuffledAnswers = allAnswers.sort(() => 0.5 - Math.random());

      return {
        id: word.id,
        question: word.english,
        partOfSpeech: word.partOfSpeech,
        level: word.level,
        category: word.category,
        answers: shuffledAnswers,
        correctAnswer: word.ukrainian,
      };
    });

    setQuestions(quizQuestions);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setQuizCompleted(false);
    return true;
  };

  // Почати вікторину
  const startQuiz = () => {
    if (generateQuiz()) {
      setQuizStarted(true);
    }
  };

  // Обробка відповіді
  const handleAnswer = (answer, index) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(index);
    setShowResult(true);

    if (answer.correct) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setQuizCompleted(true);
        saveQuizResult();
      }
    }, 1500);
  };

  // Збереження результату
  const saveQuizResult = async () => {
    try {
      const quizHistory = await AsyncStorage.getItem('quizHistory');
      const history = quizHistory ? JSON.parse(quizHistory) : [];
      
      const finalScore = score + (selectedAnswer !== null && questions[currentQuestion]?.answers[selectedAnswer]?.correct ? 1 : 0);
      
      const newResult = {
        date: new Date().toISOString(),
        levels: selectedLevels,
        categories: selectedCategories.length > 0 ? selectedCategories : ['all'],
        score: finalScore,
        total: questions.length,
        percentage: Math.round((finalScore / questions.length) * 100),
      };

      history.push(newResult);
      await AsyncStorage.setItem('quizHistory', JSON.stringify(history));
    } catch (error) {
      console.error('Error saving quiz result:', error);
    }
  };

  // Повернення до налаштувань
  const backToSettings = () => {
    setQuizStarted(false);
    setQuizCompleted(false);
  };

  // ==========================================
  // RENDER: Екран налаштувань
  // ==========================================
  if (!quizStarted) {
    const canStart = availableWordsCount >= 4;
    
    return (
      <ScrollView style={styles.container}>
        <View style={styles.settingsContainer}>
          <Text style={styles.settingsTitle}>🎯 Налаштування вікторини</Text>
          
          {/* Вибір рівнів */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Рівні</Text>
              <TouchableOpacity onPress={selectAllLevels}>
                <Text style={styles.selectAllText}>Вибрати всі</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.levelsGrid}>
              {levels.map((level) => {
                const isSelected = selectedLevels.includes(level.code);
                const levelWordCount = words.filter(w => w.level === level.code).length;
                return (
                  <TouchableOpacity
                    key={level.code}
                    style={[
                      styles.levelChip,
                      isSelected && { backgroundColor: level.color },
                    ]}
                    onPress={() => toggleLevel(level.code)}
                  >
                    <Text style={[
                      styles.levelChipText,
                      isSelected && styles.levelChipTextSelected,
                    ]}>
                      {level.code}
                    </Text>
                    <Text style={[
                      styles.levelChipCount,
                      isSelected && styles.levelChipCountSelected,
                    ]}>
                      {levelWordCount}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Вибір категорій */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Теми</Text>
              <TouchableOpacity onPress={toggleAllCategories}>
                <Text style={styles.selectAllText}>
                  {selectedCategories.length === categories.length ? 'Зняти всі' : 'Вибрати всі'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Кнопка "Всі теми" */}
            <TouchableOpacity
              style={[
                styles.allCategoriesButton,
                selectedCategories.length === 0 && styles.allCategoriesButtonActive,
              ]}
              onPress={() => setSelectedCategories([])}
            >
              <Text style={styles.allCategoriesEmoji}>📋</Text>
              <Text style={[
                styles.allCategoriesText,
                selectedCategories.length === 0 && styles.allCategoriesTextActive,
              ]}>
                Всі теми ({words.length} слів)
              </Text>
              {selectedCategories.length === 0 && (
                <Text style={styles.checkMark}>✓</Text>
              )}
            </TouchableOpacity>

            <View style={styles.categoriesGrid}>
              {categories.map((category) => {
                const isSelected = selectedCategories.includes(category.code);
                const categoryWordCount = words.filter(w => 
                  w.category === category.code && 
                  (selectedLevels.length === 0 || selectedLevels.includes(w.level))
                ).length;
                return (
                  <TouchableOpacity
                    key={category.code}
                    style={[
                      styles.categoryChip,
                      isSelected && styles.categoryChipSelected,
                    ]}
                    onPress={() => toggleCategory(category.code)}
                  >
                    <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                    <Text style={[
                      styles.categoryName,
                      isSelected && styles.categoryNameSelected,
                    ]} numberOfLines={1}>
                      {category.name}
                    </Text>
                    <Text style={[
                      styles.categoryCount,
                      isSelected && styles.categoryCountSelected,
                    ]}>
                      {categoryWordCount}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Кількість питань */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Кількість питань</Text>
            <View style={styles.questionCountGrid}>
              {[5, 10, 15, 20, 30].map((count) => {
                const isSelected = questionCount === count;
                const isDisabled = count > availableWordsCount;
                return (
                  <TouchableOpacity
                    key={count}
                    style={[
                      styles.countChip,
                      isSelected && styles.countChipSelected,
                      isDisabled && styles.countChipDisabled,
                    ]}
                    onPress={() => !isDisabled && setQuestionCount(count)}
                    disabled={isDisabled}
                  >
                    <Text style={[
                      styles.countChipText,
                      isSelected && styles.countChipTextSelected,
                      isDisabled && styles.countChipTextDisabled,
                    ]}>
                      {count}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Інформація про вибір */}
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              📚 Доступно слів: <Text style={styles.infoHighlight}>{availableWordsCount}</Text>
            </Text>
            <Text style={styles.infoText}>
              📝 Питань у вікторині: <Text style={styles.infoHighlight}>{Math.min(questionCount, availableWordsCount)}</Text>
            </Text>
          </View>

          {/* Кнопка старту */}
          <TouchableOpacity
            style={[styles.startButton, !canStart && styles.startButtonDisabled]}
            onPress={startQuiz}
            disabled={!canStart}
          >
            <Text style={styles.startButtonText}>
              {canStart ? '▶️ Почати вікторину' : '⚠️ Потрібно мінімум 4 слова'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // ==========================================
  // RENDER: Результати
  // ==========================================
  if (quizCompleted) {
    const percentage = Math.round((score / questions.length) * 100);
    let feedback = '';
    let emoji = '';

    if (percentage >= 90) {
      feedback = 'Вражаюче! Ви справжній експерт! 🏆';
      emoji = '🌟';
    } else if (percentage >= 70) {
      feedback = 'Чудова робота! Продовжуйте навчання! 💪';
      emoji = '👏';
    } else if (percentage >= 50) {
      feedback = 'Непогано! Є над чим попрацювати. 📚';
      emoji = '👍';
    } else {
      feedback = 'Не здавайтеся! Практика робить майстра! 💪';
      emoji = '📖';
    }

    return (
      <ScrollView style={styles.container}>
        <View style={styles.resultContainer}>
          <Text style={styles.resultEmoji}>{emoji}</Text>
          <Text style={styles.resultTitle}>Вікторина завершена!</Text>
          
          {/* Показуємо фільтри */}
          <View style={styles.resultFilters}>
            <View style={styles.resultFilterRow}>
              {selectedLevels.map(level => {
                const levelData = levels.find(l => l.code === level);
                return (
                  <View key={level} style={[styles.resultLevelBadge, { backgroundColor: levelData?.color }]}>
                    <Text style={styles.resultLevelText}>{level}</Text>
                  </View>
                );
              })}
            </View>
            {selectedCategories.length > 0 && selectedCategories.length <= 3 && (
              <Text style={styles.resultCategoriesText}>
                {selectedCategories.map(c => categories.find(cat => cat.code === c)?.emoji).join(' ')}
              </Text>
            )}
          </View>
          
          <View style={styles.scoreCard}>
            <Text style={styles.scoreText}>{score}</Text>
            <Text style={styles.scoreDivider}>/</Text>
            <Text style={styles.totalText}>{questions.length}</Text>
          </View>

          <Text style={styles.percentageText}>{percentage}%</Text>
          <Text style={styles.feedbackText}>{feedback}</Text>

          <TouchableOpacity
            style={styles.restartButton}
            onPress={() => {
              generateQuiz();
              setQuizStarted(true);
            }}
          >
            <Text style={styles.restartButtonText}>🔄 Пройти знову</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsButton}
            onPress={backToSettings}
          >
            <Text style={styles.settingsButtonText}>⚙️ Змінити налаштування</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // ==========================================
  // RENDER: Вікторина
  // ==========================================
  const question = questions[currentQuestion];
  const questionLevelData = levels.find(l => l.code === question?.level);
  const questionCategoryData = categories.find(c => c.code === question?.category);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.quizHeader}>
        <View style={styles.quizHeaderLeft}>
          <View style={[styles.levelIndicator, { backgroundColor: questionLevelData?.color }]}>
            <Text style={styles.levelIndicatorText}>{question?.level}</Text>
          </View>
          <Text style={styles.categoryIndicator}>{questionCategoryData?.emoji}</Text>
          <Text style={styles.questionCounter}>
            {currentQuestion + 1}/{questions.length}
          </Text>
        </View>
        <Text style={styles.scoreCounter}>✓ {score}</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { 
              width: `${((currentQuestion + 1) / questions.length) * 100}%`,
              backgroundColor: questionLevelData?.color || '#4A90E2'
            },
          ]}
        />
      </View>

      {/* Question */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionLabel}>Оберіть правильний переклад:</Text>
        <Text style={styles.questionText}>{question?.question}</Text>
      </View>

      {/* Answers */}
      <View style={styles.answersContainer}>
        {question?.answers.map((answer, index) => {
          let buttonStyle = styles.answerButton;
          let textStyle = styles.answerText;

          if (selectedAnswer !== null) {
            if (answer.correct) {
              buttonStyle = [styles.answerButton, styles.correctAnswer];
              textStyle = [styles.answerText, styles.correctAnswerText];
            } else if (selectedAnswer === index) {
              buttonStyle = [styles.answerButton, styles.wrongAnswer];
              textStyle = [styles.answerText, styles.wrongAnswerText];
            }
          }

          return (
            <TouchableOpacity
              key={index}
              style={buttonStyle}
              onPress={() => handleAnswer(answer, index)}
              disabled={selectedAnswer !== null}
              activeOpacity={0.7}
            >
              <Text style={textStyle}>{answer.text}</Text>
              {selectedAnswer !== null && answer.correct && (
                <Text style={styles.checkmark}>✓</Text>
              )}
              {selectedAnswer === index && !answer.correct && (
                <Text style={styles.crossmark}>✗</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Feedback */}
      {showResult && (
        <View style={styles.resultFeedback}>
          <Text style={styles.resultFeedbackText}>
            {selectedAnswer !== null && question?.answers[selectedAnswer]?.correct
              ? '🎉 Правильно!'
              : `❌ Правильна відповідь: ${question?.correctAnswer}`}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  
  // ==========================================
  // Settings Screen
  // ==========================================
  settingsContainer: {
    padding: 20,
  },
  settingsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  selectAllText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
  },
  
  // Levels
  levelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  levelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    gap: 8,
  },
  levelChipText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  levelChipTextSelected: {
    color: '#FFFFFF',
  },
  levelChipCount: {
    fontSize: 12,
    color: '#7F8C8D',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  levelChipCountSelected: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    color: '#FFFFFF',
  },
  
  // Categories
  allCategoriesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  allCategoriesButtonActive: {
    borderColor: '#4A90E2',
    backgroundColor: '#EBF5FF',
  },
  allCategoriesEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  allCategoriesText: {
    fontSize: 16,
    color: '#2C3E50',
    flex: 1,
  },
  allCategoriesTextActive: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  checkMark: {
    fontSize: 20,
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    width: '48%',
  },
  categoryChipSelected: {
    borderColor: '#4A90E2',
    backgroundColor: '#EBF5FF',
  },
  categoryEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 13,
    color: '#2C3E50',
    flex: 1,
  },
  categoryNameSelected: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  categoryCount: {
    fontSize: 11,
    color: '#7F8C8D',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryCountSelected: {
    backgroundColor: '#4A90E2',
    color: '#FFFFFF',
  },
  
  // Question count
  questionCountGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  countChip: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  countChipSelected: {
    borderColor: '#4A90E2',
    backgroundColor: '#4A90E2',
  },
  countChipDisabled: {
    opacity: 0.4,
  },
  countChipText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  countChipTextSelected: {
    color: '#FFFFFF',
  },
  countChipTextDisabled: {
    color: '#BDC3C7',
  },
  
  // Info card
  infoCard: {
    backgroundColor: '#FFF9E6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#F39C12',
  },
  infoText: {
    fontSize: 14,
    color: '#8E6F3E',
    marginBottom: 4,
  },
  infoHighlight: {
    fontWeight: 'bold',
    color: '#E67E22',
  },
  
  // Start button
  startButton: {
    backgroundColor: '#50C878',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  startButtonDisabled: {
    backgroundColor: '#BDC3C7',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // ==========================================
  // Quiz Screen
  // ==========================================
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  quizHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelIndicatorText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  categoryIndicator: {
    fontSize: 20,
  },
  questionCounter: {
    fontSize: 16,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  scoreCounter: {
    fontSize: 18,
    color: '#50C878',
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  questionContainer: {
    padding: 20,
    paddingTop: 30,
  },
  questionLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 12,
    fontWeight: '600',
  },
  questionText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  answersContainer: {
    padding: 16,
    paddingTop: 8,
  },
  answerButton: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  answerText: {
    fontSize: 18,
    color: '#2C3E50',
    fontWeight: '500',
    flex: 1,
  },
  correctAnswer: {
    backgroundColor: '#D4EDDA',
    borderColor: '#50C878',
  },
  correctAnswerText: {
    color: '#155724',
    fontWeight: 'bold',
  },
  wrongAnswer: {
    backgroundColor: '#F8D7DA',
    borderColor: '#E74C3C',
  },
  wrongAnswerText: {
    color: '#721C24',
  },
  checkmark: {
    fontSize: 24,
    color: '#50C878',
    fontWeight: 'bold',
  },
  crossmark: {
    fontSize: 24,
    color: '#E74C3C',
    fontWeight: 'bold',
  },
  resultFeedback: {
    backgroundColor: '#FFF9E6',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F39C12',
  },
  resultFeedbackText: {
    fontSize: 16,
    color: '#8E6F3E',
    fontWeight: '600',
  },

  // ==========================================
  // Results Screen
  // ==========================================
  resultContainer: {
    padding: 32,
    alignItems: 'center',
  },
  resultEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  resultFilters: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resultFilterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  resultLevelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  resultLevelText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  resultCategoriesText: {
    fontSize: 24,
  },
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  scoreDivider: {
    fontSize: 48,
    color: '#BDC3C7',
    marginHorizontal: 8,
  },
  totalText: {
    fontSize: 48,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  percentageText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#50C878',
    marginBottom: 16,
  },
  feedbackText: {
    fontSize: 18,
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 24,
  },
  restartButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  restartButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  settingsButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  settingsButtonText: {
    fontSize: 16,
    color: '#7F8C8D',
    fontWeight: '600',
  },
});