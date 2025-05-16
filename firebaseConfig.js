// firebaseConfig.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAZPqMnnW30FphQXqMiNf2X-tiq7FXpuGA',
  authDomain: 'chat-rak.firebaseapp.com',
  projectId: 'chat-rak',
  storageBucket: 'chat-rak.appspot.com',
  messagingSenderId: '609133469559',
  appId: '1:609133469559:android:2fed7a6d639ae96de64b72',
};

const app = initializeApp(firebaseConfig);

// 👇 Chỉ gọi initializeAuth một lần duy nhất trong toàn dự án
const firebaseAuth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { app, firebaseAuth };
