import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDkKviY26ce8PWE7mDidUwTLT6ioF51UxQ',
  authDomain: 'chat-rak.firebaseapp.com',
  projectId: 'chat-rak',
  storageBucket: 'chat-rak.firebasestorage.app',
  messagingSenderId: '609133469559',
  appId: '1:609133469559:android:3d0839b214ccea24e64b72',
};

const app = initializeApp(firebaseConfig);

const firebaseAuth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { app, firebaseAuth };
