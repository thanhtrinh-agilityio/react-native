import { ThemeProvider } from '@rneui/themed';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { DevSettings, Platform, StatusBar } from 'react-native';
import {
  KeyboardAvoidingView,
  KeyboardProvider,
} from 'react-native-keyboard-controller';
import Toast from 'react-native-toast-message';

// Components
import LoadingOverlay from '@/components/Loading';

// Constants

// Context
import { LoadingProvider } from '@/contexts/LoadingContext';

// Theme
import { Colors } from '@/constants';
import { initDatabase } from '@/db';
import { theme } from '@/theme/index';

const storybookEnabled = process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const [showStorybook, setShowStorybook] = useState(false);
  const [appIsReady, setAppIsReady] = useState(false);

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    initDatabase().then((e) => {
      console.log('Database initialized', e);
    });
    async function prepare() {
      if (!loaded) return;

      try {
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        try {
          await SplashScreen.hideAsync();
        } catch {}
      }
    }

    prepare();

    if (__DEV__) {
      DevSettings.addMenuItem?.('Toggle Storybook', () => {
        setShowStorybook((prev) => !prev);
      });
    }
  }, [loaded]);
  if (!appIsReady) return <LoadingOverlay visible text="Loading..." />;

  if (showStorybook && storybookEnabled && __DEV__) {
    const StorybookUIRoot = require('../.storybook').default;
    return <StorybookUIRoot />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <KeyboardProvider>
        <LoadingProvider>
          <ThemeProvider theme={theme}>
            <KeyboardAvoidingView
              behavior={'padding'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
              style={{ flex: 1, backgroundColor: Colors.light.background }}
            >
              <StatusBar translucent barStyle="dark-content" />
              <Slot />
              <Toast />
              <LoadingOverlay />
            </KeyboardAvoidingView>
          </ThemeProvider>
        </LoadingProvider>
      </KeyboardProvider>
    </QueryClientProvider>
  );
}
