import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import all screens
import HomeScreen from './screens/HomeScreen';
import VocabularyScreen from './screens/VocabularyScreen';
import SRSScreen from './screens/SRSScreen';
import SRSSettingsScreen from './screens/SRSSettingsScreen';
import QuizScreen from './screens/QuizScreen';
import ProgressScreen from './screens/ProgressScreen';
import GrammarScreen from './screens/GrammarScreen';
import GrammarTopicScreen from './screens/GrammarTopicScreen';
import GrammarExerciseScreen from './screens/GrammarExerciseScreen';
import NewYearVocabularyScreen from './screens/NewYearVocabularyScreen'; // ← Новый экран

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const SRSStack = createStackNavigator();

// Stack Navigator для SRS (Навчання)
function SRSNavigator() {
  return (
    <SRSStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#4A90E2' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <SRSStack.Screen 
        name="SRSSettings" 
        component={SRSSettingsScreen}
        options={{ headerShown: false }}
      />
      <SRSStack.Screen 
        name="SRSLearn" 
        component={SRSScreen}
        options={{ headerShown: false }}
      />
    </SRSStack.Navigator>
  );
}

// Stack Navigator для граматики
function GrammarStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#4A90E2' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="GrammarMain" 
        component={GrammarScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="GrammarTopic" 
        component={GrammarTopicScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="GrammarExercise" 
        component={GrammarExerciseScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');
      if (!hasLaunched) {
        await AsyncStorage.setItem('hasLaunched', 'true');
        await AsyncStorage.setItem('wordsLearned', '0');
        await AsyncStorage.setItem('currentStreak', '0');
        await AsyncStorage.setItem('todayWords', '0');
        await AsyncStorage.setItem('knownWords', JSON.stringify([]));
        await AsyncStorage.setItem('knownWordsNewYear', JSON.stringify([])); // ← Для новогоднего словаря
        await AsyncStorage.setItem('quizHistory', JSON.stringify([]));
        await AsyncStorage.setItem('srsData', JSON.stringify({}));
        // Ініціалізація даних граматики
        await AsyncStorage.setItem('grammarProgress', JSON.stringify({}));
        await AsyncStorage.setItem('completedExercises', JSON.stringify([]));
      }
      setIsReady(true);
    } catch (error) {
      console.error('Error initializing app:', error);
      setIsReady(true);
    }
  };

  if (!isReady) {
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>Завантаження...</Text>
      </View>
    );
  }

  return (
    <PaperProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Tab.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#4A90E2' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
            tabBarActiveTintColor: '#4A90E2',
            tabBarInactiveTintColor: '#7F8C8D',
            tabBarStyle: {
              paddingBottom: 8,
              paddingTop: 8,
              height: 65,
              backgroundColor: '#FFFFFF',
              borderTopWidth: 1,
              borderTopColor: '#E0E0E0',
            },
            tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          }}
        >
          <Tab.Screen 
            name="Home" 
            component={HomeScreen}
            options={{
              title: 'Головна',
              tabBarLabel: 'Головна',
              tabBarIcon: () => <Text style={styles.tabIcon}>🏠</Text>,
            }}
          />
          <Tab.Screen 
            name="SRS" 
            component={SRSNavigator}
            options={{
              title: 'Навчання',
              tabBarLabel: 'Навчання',
              tabBarIcon: () => <Text style={styles.tabIcon}>📚</Text>,
              headerShown: false,
            }}
          />
          <Tab.Screen 
            name="Vocabulary" 
            component={VocabularyScreen}
            options={{
              title: 'Словник',
              tabBarLabel: 'Словник',
              tabBarIcon: () => <Text style={styles.tabIcon}>📖</Text>,
            }}
          />
          <Tab.Screen 
            name="Grammar" 
            component={GrammarStack}
            options={{
              title: 'Граматика',
              tabBarLabel: 'Граматика',
              tabBarIcon: () => <Text style={styles.tabIcon}>📝</Text>,
              headerShown: false,
            }}
          />
          <Tab.Screen 
            name="Quiz" 
            component={QuizScreen}
            options={{
              title: 'Вікторина',
              tabBarLabel: 'Тест',
              tabBarIcon: () => <Text style={styles.tabIcon}>✏️</Text>,
            }}
          />
          <Tab.Screen 
            name="Progress" 
            component={ProgressScreen}
            options={{
              title: 'Прогрес',
              tabBarLabel: 'Прогрес',
              tabBarIcon: () => <Text style={styles.tabIcon}>📊</Text>,
            }}
          />

          {/* Скрытый экран — доступен только через navigation.navigate */}
          <Tab.Screen
            name="NewYearVocabulary"
            component={NewYearVocabularyScreen}
            options={{
              title: 'Новорічний словник',
              tabBarButton: () => null, // Не показываем в нижней панели
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
  },
  tabIcon: {
    fontSize: 24,
  },
});