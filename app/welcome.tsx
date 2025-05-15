import { BaseButton, TextBlock } from '@/components';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

const slides = [
  {
    key: 'start',
    title: 'Start Free\nConversation',
    iconName: 'arrow-right',
    description:
      'No login required for get started chat with our AI powered chatbot. \nFeel free to ask what you want to know.',
  },
  {
    key: 'voice',
    title: 'Leave Your\nVoice Instantly',
    iconName: 'image',
    description:
      'No login is required to start chatting with our AI-powered chatbot.\nFeel free to ask what you want to know.',
  },
];

const OnboardingScreen = () => {
  const carouselRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [carouselWidth, setCarouselWidth] = useState<number | null>(null);

  const renderSlide = ({ item }) => (
    <View style={[styles.containerContent]}>
      <TextBlock type="title" h1 numberOfLines={2} adjustsFontSizeToFit allowFontScaling>
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
            source={require('../assets/images/logo-hoz.png')}
            style={styles.logo}
          />
        </View>

        {carouselWidth !== null && (
          <Carousel
            ref={carouselRef}
            width={carouselWidth}
            data={slides}
            autoPlay
            loop
            scrollAnimationDuration={2000}
            onSnapToItem={(index) => setCurrentIndex(index)}
            renderItem={renderSlide}
            style={styles.carousel}
          />
        )}
      </View>

      <View style={styles.buttonContainer}>
        <BaseButton
          title="Continue with Google"
          iconName="google"
          iconType="material-community"
          iconPosition="left"
          iconSize={18}
          containerStyle={{ width: '100%' }}
          size="lg"
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
    borderWidth: 1
  }
});

export default OnboardingScreen;
