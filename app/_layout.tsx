import { ThemeMode, ThemeProvider } from '@rneui/themed';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { DevSettings, Platform, StatusBar, useColorScheme } from 'react-native';
import {
  KeyboardAvoidingView,
  KeyboardProvider,
} from 'react-native-keyboard-controller';
import Toast from 'react-native-toast-message';

// Components
import LoadingOverlay from '@/components/Loading';

// Context
import { LoadingProvider } from '@/LoadingContext';

// Theme
import { initDatabase } from '@/db';
import { darkTheme, lightTheme } from '@/theme';

const storybookEnabled = process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true';

const StorybookUIRoot = require('../.storybook').default;

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const [showStorybook, setShowStorybook] = useState(false);
  const [appIsReady, setAppIsReady] = useState(false);
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  theme.mode = scheme as ThemeMode;
  const backgroundColor =
    scheme === 'dark'
      ? theme?.darkColors?.background
      : theme?.lightColors?.background;

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    initDatabase().then((e) => {
      console.log('Database initialized', e);
    });
    const prepare = async () => {
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
    };

    prepare();

    if (__DEV__) {
      DevSettings.addMenuItem?.('Toggle Storybook', () => {
        setShowStorybook((prev) => !prev);
      });
    }
  }, [loaded]);

  if (showStorybook && storybookEnabled && __DEV__) {
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
              style={{
                flexGrow: 1,
                backgroundColor: backgroundColor,
              }}
            >
              <StatusBar
                translucent
                barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'}
              />
              <Slot />
              <Toast />
              <LoadingOverlay visible={!appIsReady} />
            </KeyboardAvoidingView>
          </ThemeProvider>
        </LoadingProvider>
      </KeyboardProvider>
    </QueryClientProvider>
  );
}
