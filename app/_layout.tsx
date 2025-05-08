import { useEffect, useState } from 'react';
import { DevSettings } from 'react-native';

import { ThemeProvider } from '@rneui/themed';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { theme } from '@/theme/index';



const storybookEnabled = process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === "true";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  

  const [showStorybook, setShowStorybook] = useState(false);

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (!loaded) return;
    if (__DEV__ && loaded) {
      DevSettings.addMenuItem?.('Toggle Storybook', () => {
        setShowStorybook((prev) => !prev);
      });
    }
  }, [loaded]);


  if (showStorybook && storybookEnabled && __DEV__) {
    const StorybookUIRoot = require('../.storybook/').default;
    return <StorybookUIRoot />;
  }

  return (
    <ThemeProvider theme={theme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
