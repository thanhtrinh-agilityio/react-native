import { ThemeProvider } from '@rneui/themed';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { DevSettings } from 'react-native';
import 'react-native-reanimated';

// themes
import DrawerNavigator from '@/navigation/DrawerNavigator';
import { theme } from '@/theme/index';

const storybookEnabled = process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === "true";

export default function RootLayout() {
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
      <DrawerNavigator />
      <StatusBar translucent />
    </ThemeProvider>
  );
}
