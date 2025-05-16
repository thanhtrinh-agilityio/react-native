import { ThemeProvider } from '@rneui/themed';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import { useEffect, useState } from 'react';
import { DevSettings, KeyboardAvoidingView, Platform, StatusBar, View } from 'react-native';
import Toast from 'react-native-toast-message';

import * as SplashScreen from 'expo-splash-screen';

import { Colors } from '@/constants/Colors';
import { theme } from '@/theme/index';

const storybookEnabled = process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [showStorybook, setShowStorybook] = useState(false);
  const [appIsReady, setAppIsReady] = useState(false);

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    async function prepare() {
      if (!loaded) return;

      try {
        // Nếu có dữ liệu cơ bản cần load thêm, load ở đây
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        try {
          await SplashScreen.hideAsync();
        } catch {
          // Splash đã ẩn rồi
        }
      }
    }

    prepare();

    if (__DEV__) {
      DevSettings.addMenuItem?.('Toggle Storybook', () => {
        setShowStorybook(prev => !prev);
      });
    }
  }, [loaded]);

  if (!appIsReady) {
    return <View style={{ flex: 1, backgroundColor: Colors.light.background }} />;
  }

  if (showStorybook && storybookEnabled && __DEV__) {
    const StorybookUIRoot = require('../.storybook').default;
    return <StorybookUIRoot />;
  }

  return (
    <ThemeProvider theme={theme}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        style={{
          flex: 1,
          backgroundColor: Colors.light.background,
        }}
      >
        <Slot />
      </KeyboardAvoidingView>
      <Toast />
    </ThemeProvider>
  );
}
