// screens/GrammarExerciseScreen.js
// Екран виконання вправ з граматики

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { GRAMMAR_LEVELS } from '../data/grammar_config';
import { getTopicById } from '../data/grammar_topics';

const GrammarExerciseScreen = ({ route, navigation }) => {
  const { topicId } = route.params;
  const topic = getTopicById(topicId);
  
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  if (!topic || !topic.exercises || topic.exercises.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Вправи не знайдені</Text>
      </SafeAreaView>
    );
  }

  const currentExercise = topic.exercises[currentExerciseIndex];
  const currentQuestion = currentExercise.questions[currentQuestionIndex];
  const totalQuestions = topic.exercises.reduce((sum, ex) => sum + ex.questions.length, 0);
  const answeredQuestions = 
    topic.exercises.slice(0, currentExerciseIndex).reduce((sum, ex) => sum + ex.questions.length, 0) + 
    currentQuestionIndex;

  const level = GRAMMAR_LEVELS[topic.level];

  // Перевірка відповіді
  const checkAnswer = () => {
    let correct = false;
    
    if (currentExercise.type === 'multiple_choice') {
      correct = userAnswer === currentQuestion.answer;
    } else {
      // Для інших типів - порівняння без урахування регістру та пробілів
      const normalizedUserAnswer = userAnswer.trim().toLowerCase();
      const normalizedCorrectAnswer = currentQuestion.answer.trim().toLowerCase();
      correct = normalizedUserAnswer === normalizedCorrectAnswer;
    }

    setIsCorrect(correct);
    setShowResult(true);
    if (correct) {
      setScore(score + 1);
    }
  };

  // Наступне питання
  const nextQuestion = () => {
    setShowResult(false);
    setUserAnswer('');

    // Якщо є ще питання в поточній вправі
    if (currentQuestionIndex < currentExercise.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
    // Якщо є ще вправи
    else if (currentExerciseIndex < topic.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentQuestionIndex(0);
    }
    // Завершено всі вправи
    else {
      setCompleted(true);
    }
  };

  // Зберегти результат при завершенні
  useEffect(() => {
    if (completed) {
      saveExerciseResult();
    }
  }, [completed]);

  const saveExerciseResult = async () => {
    try {
      const { markTopicAsCompleted, addCompletedExercise } = require('../utils/grammarStorage');
      const percentage = Math.round((score / totalQuestions) * 100);
      
      // Зберегти результат теми
      await markTopicAsCompleted(topicId, percentage);
      
      // Зберегти кожну вправу
      for (const exercise of topic.exercises) {
        await addCompletedExercise({
          topicId: topicId,
          exerciseType: exercise.type,
          score: percentage,
          totalQuestions: exercise.questions.length,
        });
      }
    } catch (error) {
      console.error('Error saving exercise result:', error);
    }
  };

  // Екран завершення
  if (completed) {
    const percentage = Math.round((score / totalQuestions) * 100);
    
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completedContainer}>
          <Text style={styles.completedEmoji}>
            {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '💪'}
          </Text>
          <Text style={styles.completedTitle}>Вітаємо!</Text>
          <Text style={styles.completedSubtitle}>Ви завершили всі вправи</Text>
          
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Ваш результат:</Text>
            <Text style={[styles.scoreValue, { color: level.color }]}>
              {score} / {totalQuestions}
            </Text>
            <Text style={styles.scorePercentage}>{percentage}%</Text>
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: level.color }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Повернутися до теми</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Рендер питання залежно від типу
  const renderQuestion = () => {
    switch (currentExercise.type) {
      case 'fill_blank':
        return (
          <View>
            <Text style={styles.sentence}>{currentQuestion.sentence}</Text>
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

      case 'multiple_choice':
        return (
          <View>
            <Text style={styles.sentence}>{currentQuestion.sentence}</Text>
            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.option,
                    userAnswer === option && styles.optionSelected,
                    showResult && option === currentQuestion.answer && styles.optionCorrect,
                    showResult && userAnswer === option && !isCorrect && styles.optionWrong,
                  ]}
                  onPress={() => !showResult && setUserAnswer(option)}
                  disabled={showResult}
                >
                  <Text style={[
                    styles.optionText,
                    userAnswer === option && styles.optionTextSelected,
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'error_correction':
        return (
          <View>
            <Text style={styles.instructionText}>Знайдіть та виправте помилку:</Text>
            <Text style={styles.sentence}>{currentQuestion.sentence}</Text>
            <TextInput
              style={styles.input}
              value={userAnswer}
              onChangeText={setUserAnswer}
              placeholder="Напишіть правильне речення..."
              placeholderTextColor="#999"
              editable={!showResult}
            />
          </View>
        );

      case 'transform':
        return (
          <View>
            <Text style={styles.sentence}>{currentQuestion.sentence}</Text>
            <TextInput
              style={styles.input}
              value={userAnswer}
              onChangeText={setUserAnswer}
              placeholder="Напишіть трансформоване речення..."
              placeholderTextColor="#999"
              editable={!showResult}
            />
          </View>
        );

      default:
        return <Text>Невідомий тип вправи</Text>;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Заголовок */}
      <View style={[styles.header, { backgroundColor: level.color }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{topic.titleUa}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Прогрес */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${(answeredQuestions / totalQuestions) * 100}%`,
                backgroundColor: level.color,
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          Питання {answeredQuestions + 1} з {totalQuestions}
        </Text>
      </View>

      {/* Контент */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.exerciseCard}>
          <Text style={styles.exerciseType}>{currentExercise.instruction}</Text>
          
          {renderQuestion()}

          {/* Результат */}
          {showResult && (
            <View style={[
              styles.resultBox,
              { backgroundColor: isCorrect ? '#e8f5e9' : '#ffebee' }
            ]}>
              <Text style={[
                styles.resultText,
                { color: isCorrect ? '#2e7d32' : '#c62828' }
              ]}>
                {isCorrect ? '✅ Правильно!' : '❌ Неправильно'}
              </Text>
              {!isCorrect && (
                <Text style={styles.correctAnswer}>
                  Правильна відповідь: {currentQuestion.answer}
                </Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Кнопки */}
      <View style={styles.footer}>
        {!showResult ? (
          <TouchableOpacity
            style={[
              styles.checkButton,
              { backgroundColor: level.color },
              !userAnswer && styles.checkButtonDisabled,
            ]}
            onPress={checkAnswer}
            disabled={!userAnswer}
          >
            <Text style={styles.checkButtonText}>Перевірити</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: level.color }]}
            onPress={nextQuestion}
          >
            <Text style={styles.nextButtonText}>Далі →</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  backButton: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 24,
  },
  progressContainer: {
    backgroundColor: '#fff',
    padding: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 15,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  exerciseType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 15,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  sentence: {
    fontSize: 18,
    lineHeight: 26,
    color: '#333',
    marginBottom: 20,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  optionsContainer: {
    gap: 10,
  },
  option: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  optionSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#f1f8f4',
  },
  optionCorrect: {
    borderColor: '#2e7d32',
    backgroundColor: '#e8f5e9',
  },
  optionWrong: {
    borderColor: '#c62828',
    backgroundColor: '#ffebee',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  optionTextSelected: {
    fontWeight: '600',
    color: '#4CAF50',
  },
  resultBox: {
    marginTop: 20,
    padding: 15,
    borderRadius: 12,
  },
  resultText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  correctAnswer: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  checkButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkButtonDisabled: {
    opacity: 0.5,
  },
  checkButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  nextButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  completedEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  completedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  completedSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  scoreCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
    maxWidth: 300,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  scorePercentage: {
    fontSize: 24,
    color: '#999',
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 18,
    color: '#d32f2f',
    textAlign: 'center',
    marginTop: 40,
  },
});

export default GrammarExerciseScreen;