import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="business-auth" />
      <Stack.Screen name="consumer-auth" />
      <Stack.Screen name="professional-info" />
      <Stack.Screen name="plan-selection" />
      <Stack.Screen name="skills-assessment" />
    </Stack>
  );
}