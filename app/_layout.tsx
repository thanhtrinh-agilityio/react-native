import { ThemeProvider } from '@rneui/themed';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { DevSettings, StatusBar } from 'react-native';
import Toast from 'react-native-toast-message';

// Components
import LoadingOverlay from '@/components/Loading';

// Constants

// Context
import { LoadingProvider } from '@/contexts/LoadingContext';

// Theme
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
    <LoadingProvider>
      <ThemeProvider theme={theme}>
        <StatusBar barStyle="dark-content" />
        <Slot />
        <Toast />
        <LoadingOverlay />
      </ThemeProvider>
    </LoadingProvider>
  );
}
