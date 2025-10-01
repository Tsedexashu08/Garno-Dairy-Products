import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar'; // Optional, but recommended for style
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    // 1. Wrap the entire application in the Provider
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="Products" />
        <Stack.Screen name="DailyReciept" />
      </Stack>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}