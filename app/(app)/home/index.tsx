import { ChatInput, PromptCard } from '@/components';
import { BaseButton } from '@/components/Button';
import { TextInput } from '@/components/Input';
import { SuggestInput } from '@/components/Input/SuggestInput';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { PromptCardList } from '@/components/PromptCardList';
import { TextBlock } from '@/components/Text';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { PROMPT_LIST } from '@/mocks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Platform, StyleSheet } from 'react-native';

export default function HomeScreen() {
  const [inputValue, setInputValue] = useState('');
  const getRandomColor = () =>
    '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

  const responseSuggestions = ['AI', 'Machine Learning', 'Blockchain'];

  const suggestions = responseSuggestions.map((label) => {
    const color = getRandomColor();
    return {
      label,
      color,
      borderColor: color,
    };
  });

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: 'red', dark: 'black' }}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <TextBlock h1 type="primary" variant='success'> Heading 1 </TextBlock>

      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2: Explore</ThemedText>
        <BaseButton
          iconName="arrow-right"
          iconType="feather"
          iconSize={40}
          ViewComponent={LinearGradient}
          linearGradientProps={{
            colors: ['#3EAEFF', '#B659FF', '#0300A6'],
            start: { x: 0, y: 0 },
            end: { x: 1, y: 1 },
            locations: [0, 0.495, 1],
          }}
          buttonStyle={
            {
              width: 80,
              height: 80
            }
          }
          containerStyle={
            {
              width: 80,
              height: 80
            }
          }
          radius={100}
          onPress={() => {
            AsyncStorage.removeItem()
          }}
        />
        <BaseButton
          title="Continue"
          iconName="arrow-right"
          iconType="feather"
        />

        <BaseButton
          title="Continue with email"
          iconName="mail"
          iconType="feather"
          iconPosition='left'
          type='outline'
        />

        <BaseButton
          title="Continue with email"
          iconName="mail"
          iconType="feather"
          iconPosition='left'
          type='clear'
        />


        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>

        <TextInput
          label="Email"
          placeholder="Enter your email"
          leftIconType="feather"
          leftIconName="mail"
          value={''}
        // onChangeText={setEmail}
        />

        <TextInput
          label="Password"
          placeholder="Create strong password"
          leftIconType="feather"
          leftIconName="lock"
          rightIconType="feather"
          rightIconName={"eye-off"}

        // secureTextEntry={!showPassword}
        // value={password}
        // onChangeText={setPassword}
        // onRightIconPress={() => setShowPassword(!showPassword)}
        />
        <TextInput
          placeholder="design a web page"
          variant="plain"
        />
        <SuggestInput
          suggestions={suggestions}
          onSuggestionPress={(label) => {
            setInputValue((prev) => prev + label);
          }}
        />

        <PromptCard
          title="Try Fix Bug From Your Code"
          description="Fix my bug from below code. I can’t find where is the issue. Do it in details and explain me why ha..."
          colorCard='#ECDA1D'
        />
        <PromptCardList data={PROMPT_LIST} />
        <ChatInput />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
