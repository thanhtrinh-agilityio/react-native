import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { franc } from 'franc-min';
import langs from 'langs';
import { IMessage } from 'react-native-gifted-chat';
// Constants
import { ACCESS_TOKEN_KEY, USER_EMAIL_KEY } from '@/constants';

// Types
import { GiftedMessageOverride, ParsedMessage } from '@/types';

export const formatFirebaseAuthError = (code: string): string => {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already in use. Please log in or use a different email.';
    case 'auth/invalid-email':
      return 'Invalid email format. Please enter a valid email.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    default:
      return 'Something went wrong. Please try again.';
  }
};

export const saveUserInfo = async (user) => {
  try {
    await AsyncStorage.setItem(
      ACCESS_TOKEN_KEY,
      user.stsTokenManager.accessToken ?? '',
    );
    await AsyncStorage.setItem(USER_EMAIL_KEY, user.email ?? '');
  } catch (e) {
    console.error('Failed to save user info:', e);
  }
};

export const loadUserChatHistory = async (userEmail: string) => {
  try {
    const json = await AsyncStorage.getItem(`chat_messages_${userEmail}`);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.error('Failed to load chat history:', e);
    return [];
  }
};

export const saveUserChatHistory = async (userEmail: string, messages: any) => {
  try {
    const json = JSON.stringify(messages);
    await AsyncStorage.setItem(`chat_messages_${userEmail}`, json);
  } catch (e) {
    console.error('Failed to save chat history:', e);
  }
};

export const getNameFromEmail = (email: string): string => {
  if (!email) return 'Boss';

  const namePart = email.split('@')[0];
  return namePart
    .split(/[._-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

export const generateAvatarUrl = (name: string): string => {
  const encodedName = encodeURIComponent(name || 'Boss');
  return `https://avatar.iran.liara.run/username?background=random&username=${encodedName}`;
};

export const parseContentToMessages = (content: string): ParsedMessage[] => {
  const messages: ParsedMessage[] = [];
  const regex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const [fullMatch, lang, code] = match;
    const start = match.index;

    if (start > lastIndex) {
      const beforeText = content.slice(lastIndex, start).trim();
      if (beforeText) messages.push({ text: beforeText });
    }

    messages.push({
      text: code.trim(),
      isCode: true,
      language: lang || 'text',
      fileName: lang ? `index.${lang}` : undefined,
    });

    lastIndex = regex.lastIndex;
  }

  const remainingText = content.slice(lastIndex).trim();
  if (remainingText) messages.push({ text: remainingText });

  return messages;
};

export const convertToGiftedMessages = (
  content: string,
  override: GiftedMessageOverride = {},
): IMessage[] => [
  {
    _id: override._id ?? Date.now() + Math.random(),
    createdAt: override.createdAt ?? new Date(),
    user: override.user || {
      _id: 2,
      name: 'Rak-GPT',
      avatar: require('@/assets/images/logo.png'),
    },
    text: content,
    parsedParts: parseContentToMessages(content),
  } as IMessage & { parsedParts: ParsedMessage[] },
];

// Build payload understood by OpenRouter Vision models
export const buildOpenRouterMessages = async (
  history: IMessage[],
  userText: string,
  imageUri?: string | null,
) => {
  const msgs: any[] = [
    {
      role: 'system',
      content: 'You are a helpful assistant.',
    },
  ];

  const chronological = [...history].sort(
    (a, b) => (a.createdAt as Date).getTime() - (b.createdAt as Date).getTime(),
  );

  for (const m of chronological) {
    const role = m.user._id === 1 ? 'user' : 'assistant';

    if (m.image) {
      msgs.push({
        role,
        content: [
          { type: 'text', text: m.text || '' },
          { type: 'image_url', image_url: { url: m.image } },
        ],
      });
    } else {
      msgs.push({ role, content: m.text });
    }
  }

  if (!imageUri) {
    msgs.push({ role: 'user', content: userText });
  } else {
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const mime = imageUri.toLowerCase().endsWith('.png') ? 'png' : 'jpeg';
    const dataUrl = `data:image/${mime};base64,${base64}`;

    msgs.push({
      role: 'user',
      content: [
        { type: 'text', text: userText || ' ' },
        { type: 'image_url', image_url: { url: dataUrl } },
      ],
    });
  }

  return msgs;
};

export const getRandomColor = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const generateUniqueColors = (count: number): string[] => {
  const colorSet = new Set<string>();
  while (colorSet.size < count) {
    colorSet.add(getRandomColor());
  }
  return Array.from(colorSet);
};

export const detectLanguage = (text: string) => {
  const whitelist = ['eng', 'vie'];
  const code = franc(text, { only: whitelist });

  if (code === 'und') return { iso3: 'eng', name: 'English' };

  const lang = langs.where('3', code);
  return { iso3: code, name: lang?.name ?? 'English' };
};

export const convertMessagesToGiftedFromDB = (
  messages: IMessage[],
): (IMessage & { parsedParts: ParsedMessage[] })[] =>
  messages.map((m) => ({
    _id: m._id,
    createdAt: new Date(m.createdAt),
    text: m.text,
    image: m.image,
    user: {
      _id: m.user._id,
      name: m.user.name,
      avatar: m.user.avatar,
    },
    parsedParts: parseContentToMessages(m.text),
  }));
