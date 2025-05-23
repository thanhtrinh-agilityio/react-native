import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

// Constants
import { EXPO_ANDROID_CLIENT_ID } from '@/constants';

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
  } catch (error) {
    console.error('Logout error:', error);
  }
};
