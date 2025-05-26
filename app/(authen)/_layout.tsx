import { ROUTES } from '@/constants';
import { Icon } from '@rneui/themed';
import { Stack, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Pressable } from 'react-native';

export default function AuthLayout() {
  const router = useRouter();

  // handle go back
  const handleGoBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(ROUTES.WELCOME);
    }
  }, [router]);

  return (
    <Stack
      screenOptions={{
        headerTitle: '',
        headerTransparent: true,
        headerLeft: () => (
          <Pressable onPress={() => handleGoBack()}>
            <Icon name="arrow-left" size={24} type="feather" />
          </Pressable>
        ),
      }}
    />
  );
}
