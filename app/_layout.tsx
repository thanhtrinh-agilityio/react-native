import { ThemeProvider } from '@rneui/themed';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import { useEffect, useState } from 'react';
import { DevSettings, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import 'react-native-reanimated';

import { Colors } from '@/constants/Colors';
import { theme } from '@/theme/index';

const storybookEnabled = process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true';

export default function RootLayout() {
  const [showStorybook, setShowStorybook] = useState(false);

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (!loaded) return;
    if (__DEV__) {
      DevSettings.addMenuItem?.('Toggle Storybook', () => {
        setShowStorybook((prev) => !prev);
      });
    }
  }, [loaded]);

  if (!loaded) return null;

  if (showStorybook && storybookEnabled && __DEV__) {
    const StorybookUIRoot = require('../.storybook').default;
    return <StorybookUIRoot />;
  }

  return (
    <ThemeProvider theme={theme}>
      <StatusBar barStyle={'dark-content'} />
      <KeyboardAvoidingView
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        style={{
          flex: 1,
          backgroundColor: Colors.light.background,
        }}
      >

        <Slot />
      </KeyboardAvoidingView>
    </ThemeProvider>
  );
}
