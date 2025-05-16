import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { useEffect } from 'react';

// Firebase
import { ACCESS_TOKEN_KEY, USER_EMAIL_KEY } from '@/constants/Key';
import { firebaseAuth } from '@/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

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
    androidClientId:
      '609133469559-6ojam3dmhot2mqfhjk2lcrim8cebdft1.apps.googleusercontent.com',
    iosClientId: '',
    webClientId:
      '609133469559-5fpksfghs4iggqhivcgpl296btga9crq.apps.googleusercontent.com',
    redirectUri: AuthSession.makeRedirectUri({}),
    scopes: ['profile', 'email'],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.authentication;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(firebaseAuth, credential)
        .then((userCred) => {
          console.log('Google sign-in success:', userCred.user);
        })
        .catch((error) => {
          console.error('Firebase sign-in error:', error);
        });
    }
  }, [response]);

  return { request, promptAsync };
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
