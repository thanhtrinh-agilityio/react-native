import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

// Constants
import {
  ACCESS_TOKEN_KEY,
  EXPO_ANDROID_CLIENT_ID,
  USER_EMAIL_KEY,
} from '@/constants';

// firebase
import { firebaseAuth } from '@/firebaseConfig';

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      firebaseAuth,
      email,
      password,
    );
    return userCredential.user;
  } catch (error: any) {
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      firebaseAuth,
      email,
      password,
    );
    return userCredential;
  } catch (error: any) {
    throw error;
  }
};

export const useGoogleSignIn = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: EXPO_ANDROID_CLIENT_ID,
    scopes: ['openid', 'profile', 'email'],
    redirectUri: AuthSession.makeRedirectUri(),
    responseType: 'code',
    usePKCE: true,
  });

  return { request, response, promptAsync };
};

export const logout = async () => {
  try {
    await firebaseAuth.signOut();
    await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, USER_EMAIL_KEY]);
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export const getStoredToken = async () => {
  return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getStoredEmail = async () => {
  return await AsyncStorage.getItem(USER_EMAIL_KEY);
};
