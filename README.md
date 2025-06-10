# Expo Practice

1. Overview:

   A revision of the Expo training plan, which focuses on the latest version of Expo, will help trainees build and deploy universal React Native applications. It provides a set of tools and services that streamline the development process and simplify the creation of mobile apps for iOS, Android, and the web.

2. Tech stack

   - React
   - Framework: React Native
   - Expo: Expo SDK
   - Navigation: React Navigation or Expo Router
   - Testing: Jest, React Testing Library
   - Linting & Formatting: ESLint, Prettier, Husky
   - Storybook

3. TARGETS:

   - Handle platform differences between Android, iOS
   - Unit test coverage should be greater than 80%
   - Configure the app icon, and splash screen that matches the Expo app.
   - Apply Expo SDK libraries to build a functional chat app (expo-image, expo-file-system,...)

4. Installation

   Clone repository:

   ```bash
   git@gitlab.asoft-python.com:thanh.trinh/react-native.git
   ```

   Check out the branch:

   ```bash
   git checkout feat/practice-chat-rak-gpt
   cd chatRAK-GPT
   ```

   Install package dependencies:

   ```bash
   yarn
   ```

   Run application (Expo CLI)

   ```bash
   yarn start
   ```

   6.Environment Variables (.env)

   | Key                            | Value                                                |
   | ------------------------------ | ---------------------------------------------------- |
   | EXPO_PUBLIC_STORYBOOK_ENABLED  | boolean                                              |
   | EXPO_PUBLIC_OPENROUTER_API_KEY | key register in openrouter.ai `sk-or-v1-d219a755...` |
   | EXPO_PUBLIC_OPENROUTER_MODEL   | meta-llama/llama-4-maverick:free                     |
   | EXPO_PUBLIC_OPENROUTER_API_URL | https://openrouter.ai/api/v1/chat/completions        |
   | EXPO_PUBLIC_OPENROUTER_TITLE   | App title                                            |
