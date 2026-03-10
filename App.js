import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';

import { initDatabase } from './utils/database';
import SplashScreenView from './screens/SplashScreenView';

import HomeScreen from './screens/HomeScreen';
import VocabularyScreen from './screens/VocabularyScreen';
import SRSScreen from './screens/SRSScreen';
import SRSSettingsScreen from './screens/SRSSettingsScreen';
import QuizScreen from './screens/QuizScreen';
import ProgressScreen from './screens/ProgressScreen';
import GrammarScreen from './screens/GrammarScreen';
import GrammarTopicScreen from './screens/GrammarTopicScreen';
import GrammarExerciseScreen from './screens/GrammarExerciseScreen';
import NewYearVocabularyScreen from './screens/NewYearVocabularyScreen';
import ListeningScreen from './screens/ListeningScreen';
import ListeningLevelScreen from './screens/ListeningLevelScreen';
import ListeningLessonScreen from './screens/ListeningLessonScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const SRSStack = createStackNavigator();
const ListeningStack = createStackNavigator();

function SRSNavigator() {
  return (
    <SRSStack.Navigator>
      <SRSStack.Screen name="SRSSettings" component={SRSSettingsScreen} options={{ headerShown: false }} />
      <SRSStack.Screen name="SRSLearn" component={SRSScreen} options={{ headerShown: false }} />
    </SRSStack.Navigator>
  );
}

function GrammarStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="GrammarMain" component={GrammarScreen} options={{ headerShown: false }} />
      <Stack.Screen name="GrammarTopic" component={GrammarTopicScreen} options={{ headerShown: false }} />
      <Stack.Screen name="GrammarExercise" component={GrammarExerciseScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function ListeningNavigator() {
  return (
    <ListeningStack.Navigator>
      <ListeningStack.Screen name="ListeningMain" component={ListeningScreen} options={{ headerShown: false }} />
      <ListeningStack.Screen name="ListeningLevel" component={ListeningLevelScreen} options={{ headerShown: false }} />
      <ListeningStack.Screen name="ListeningLesson" component={ListeningLessonScreen} options={{ headerShown: false }} />
    </ListeningStack.Navigator>
  );
}

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await Promise.all([
        initDatabase(),
        new Promise(resolve => setTimeout(resolve, 2000)),
      ]);
      setIsReady(true);
    } catch (err) {
      console.error('Error initializing database:', err);
      setError(err.message);
      setIsReady(true);
    }
  };

  if (!isReady) {
    return (
      <>
        <StatusBar style="light" />
        <SplashScreenView />
      </>
    );
  }

  if (error) {
    return (
      <View style={styles.screen}>
        <Text style={styles.errorText}>⚠️ Помилка бази даних</Text>
        <Text style={styles.errorDetail}>{error}</Text>
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
              paddingBottom: 8, paddingTop: 8, height: 65,
              backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E0E0E0',
            },
            tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
          }}
        >
          <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Головна', tabBarLabel: 'Головна', tabBarIcon: () => <Text style={styles.tabIcon}>🏠</Text> }} />
          <Tab.Screen name="SRS" component={SRSNavigator} options={{ title: 'Навчання', tabBarLabel: 'Навчання', tabBarIcon: () => <Text style={styles.tabIcon}>📚</Text>, headerShown: false }} />
          <Tab.Screen name="Vocabulary" component={VocabularyScreen} options={{ title: 'Словник', tabBarLabel: 'Словник', tabBarIcon: () => <Text style={styles.tabIcon}>📖</Text> }} />
          <Tab.Screen name="Grammar" component={GrammarStack} options={{ title: 'Граматика', tabBarLabel: 'Граматика', tabBarIcon: () => <Text style={styles.tabIcon}>📝</Text>, headerShown: false }} />
          <Tab.Screen name="Listening" component={ListeningNavigator} options={{ title: 'Аудіювання', tabBarLabel: 'Аудіо', tabBarIcon: () => <Text style={styles.tabIcon}>🎧</Text>, headerShown: false }} />
          <Tab.Screen name="Quiz" component={QuizScreen} options={{ title: 'Вікторина', tabBarLabel: 'Тест', tabBarIcon: () => <Text style={styles.tabIcon}>✏️</Text> }} />
          <Tab.Screen name="Progress" component={ProgressScreen} options={{ title: 'Прогрес', tabBarLabel: 'Прогрес', tabBarIcon: () => <Text style={styles.tabIcon}>📊</Text> }} />
          <Tab.Screen name="NewYearVocabulary" component={NewYearVocabularyScreen} options={{ title: 'Новорічний словник', tabBarButton: () => null }} />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA', padding: 20 },
  errorText: { fontSize: 22, fontWeight: 'bold', color: '#E74C3C', marginBottom: 8 },
  errorDetail: { fontSize: 14, color: '#7F8C8D', textAlign: 'center' },
  tabIcon: { fontSize: 22 },
});
