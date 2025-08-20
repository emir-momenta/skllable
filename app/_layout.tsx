import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const onboardingCompleted = await AsyncStorage.getItem('onboardingCompleted');
        if (!onboardingCompleted) {
          // Redirect to onboarding if not completed
          setTimeout(() => {
            router.replace('/onboarding');
          }, 0);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    };

    checkOnboardingStatus();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </>
    </GestureHandlerRootView>
  );
}
