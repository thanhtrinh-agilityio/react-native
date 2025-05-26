import * as AuthSession from 'expo-auth-session';
import { LinearGradient } from 'expo-linear-gradient';
import { uuid } from 'expo-modules-core';
import { router } from 'expo-router';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import React, { useRef, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import Toast from 'react-native-toast-message';

// Components
import { BaseButton, TextBlock } from '@/components';

// Mocks
import { SLIDES } from '@/mocks';

// Services

// Constants
import { EXPO_ANDROID_CLIENT_ID, MESSAGE, ROUTES } from '@/constants';

// Services
import { useLoading } from '@/contexts/LoadingContext';

// firebase
import { firebaseAuth } from '@/firebaseConfig';
import { useGoogleSignIn } from '@/services/authService';

const OnboardingScreen = () => {
  const carouselRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [carouselWidth, setCarouselWidth] = useState<number | null>(null);
  const { request, promptAsync } = useGoogleSignIn();

  const discovery = AuthSession.useAutoDiscovery('https://accounts.google.com');
  const { isLoading, setLoading } = useLoading();

  const handleLoginWithGoogle = async () => {
    if (!request) return;
    try {
      const id = uuid.v4().toString();
      const res = await promptAsync();
      if (res.type === 'success' && res.params.code) {
        const { code } = res.params;
        setLoading(true);

        const tokens = await AuthSession.exchangeCodeAsync(
          {
            clientId: EXPO_ANDROID_CLIENT_ID,
            code,
            redirectUri: AuthSession.makeRedirectUri({
              scheme: 'com.thanh.trinhagilityo.rakgpt',
            }),
            extraParams: {
              code_verifier: request.codeVerifier || '',
            },
          },
          discovery!,
        );

        const credential = GoogleAuthProvider.credential(tokens?.idToken);
        const result = await signInWithCredential(firebaseAuth, credential);

        if (result?.user) {
          router.replace({
            pathname: ROUTES.HOME,
            params: { threadId: id },
          });

          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: MESSAGE.LOGIN_SUCCESS_GOOGLE,
          });
        }
        setLoading(false);
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err instanceof Error ? err.message : 'An unknown error occurred',
      });
      setLoading(false);
    }
  };

  const renderSlide = ({ item }: { item: (typeof SLIDES)[number] }) => (
    <View style={[styles.containerContent]}>
      <TextBlock
        type="title"
        h1
        numberOfLines={2}
        adjustsFontSizeToFit
        allowFontScaling
      >
        {item.title}
      </TextBlock>
      <TextBlock type="subtitle">{item.description}</TextBlock>

      <BaseButton
        iconName={item.iconName}
        iconType="feather"
        iconSize={40}
        ViewComponent={LinearGradient}
        linearGradientProps={{
          colors: ['#3EAEFF', '#B659FF', '#0300A6'],
          start: { x: 0, y: 0 },
          end: { x: 1, y: 1 },
          locations: [0, 0.495, 1],
        }}
        buttonStyle={styles.buttonIcon}
        radius={100}
        onPress={() => {
          router.replace(ROUTES.HOME);
        }}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View
        style={styles.containerHeader}
        onLayout={(event) => {
          const layoutWidth = event.nativeEvent.layout.width;
          setCarouselWidth(layoutWidth);
        }}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/logo-hoz.png')}
            style={styles.logo}
          />
        </View>

        {carouselWidth !== null && (
          <Carousel
            ref={carouselRef}
            width={carouselWidth}
            data={SLIDES}
            autoPlay
            loop
            key={currentIndex}
            scrollAnimationDuration={2000}
            onSnapToItem={(index) => setCurrentIndex(index)}
            renderItem={renderSlide}
            style={styles.carousel}
          />
        )}
      </View>

      <View style={styles.buttonContainer}>
        <BaseButton
          title={isLoading ? 'Signing in...' : 'Continue with Google'}
          iconName={isLoading ? undefined : 'google'}
          iconType="material-community"
          iconPosition="left"
          iconSize={18}
          containerStyle={{ width: '100%' }}
          size="lg"
          onPress={handleLoginWithGoogle}
          disabled={isLoading}
        />
        <BaseButton
          title="Sign up with email"
          iconName="mail"
          iconType="feather"
          iconPosition="left"
          type="clear"
          iconSize={18}
          size="lg"
          onPress={() => {
            router.replace('/sign-up');
          }}
        />
        <BaseButton
          title="Login to existing account"
          iconPosition="left"
          type="outline"
          size="lg"
          onPress={() => {
            router.replace('/sign-in');
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  containerHeader: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  carousel: {
    alignSelf: 'center',
  },
  containerContent: {
    justifyContent: 'center',
    gap: 20,
    width: '100%',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    width: 119,
    height: 39,
    resizeMode: 'contain',
    marginRight: 8,
  },
  buttonContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 30,
    gap: 12,
  },
  buttonIcon: {
    width: 80,
    height: 80,
    marginTop: 50,
    borderWidth: 1,
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OnboardingScreen;
