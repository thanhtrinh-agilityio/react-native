import * as FileSystem from 'expo-file-system';
import { franc } from 'franc-min';
import langs from 'langs';
import { IMessage } from 'react-native-gifted-chat';

// Types
import {
  DEFAULT_CODE_LANGUAGE,
  REGEX_BY_CODE_LANGUAGE,
  REGEX_FALL_BACK,
} from '@/constants';
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
    case 'auth/invalid-credential':
      return 'Email or password is incorrect.';
    default:
      return 'Something went wrong. Please try again.';
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
  } as IMessage & { parsedParts: ParsedMessage[] },
];

// Build payload understood by OpenRouter Vision models
export const buildOpenRouterMessages = async (
  history: IMessage[],
  userText: string,
  imageUri?: string | null,
  filePdf?: any | null,
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
    }
    if (m.file!) {
      const base64 = await FileSystem.readAsStringAsync(m.file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const base64PDF = `data:application/pdf;base64,${base64}`;
      msgs.push({
        role,
        content: [
          { type: 'text', text: userText || '' },
          {
            type: 'file',
            file: {
              filename: m.file?.name,
              file_data: base64PDF,
            },
          },
        ],
      });
    }
    msgs.push({ role, content: m.text });
  }

  if (!imageUri && !filePdf) {
    msgs.push({ role: 'user', content: userText });
  } else {
    if (imageUri) {
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

    if (filePdf.uri) {
      const base64 = await FileSystem.readAsStringAsync(filePdf.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const base64PDF = `data:application/pdf;base64,${base64}`;
      msgs.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: userText || 'What are the main points in this document?',
          },
          {
            type: 'file',
            file: {
              filename: filePdf.name,
              file_data: base64PDF,
            },
          },
        ],
      });
    }
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

export const extractErrorMessage = (err: any): string =>
  typeof err === 'string'
    ? err
    : typeof err?.error?.message === 'string'
    ? err.error.message
    : (() => {
        try {
          const parsed = JSON.parse(err?.message);
          return parsed.error?.message || JSON.stringify(parsed);
        } catch {
          return err?.message || 'Unknown error occurred';
        }
      })() || 'Unknown error occurred';

export const extractFilename = (content = '', language = ''): string | null => {
  const lines = content.trim().split('\n').slice(0, 5);
  const lang = language.toLowerCase();

  // Try explicit filename in comments or code-specific hints
  const patterns =
    REGEX_BY_CODE_LANGUAGE[lang] || REGEX_BY_CODE_LANGUAGE.default;
  for (const line of lines) {
    for (const regex of patterns) {
      const match = line.match(regex);
      if (match) return match[1].trim();
    }
  }

  for (const line of lines) {
    const match = line.match(REGEX_FALL_BACK);
    if (match) return match[1].trim();
  }

  return null;
};

export const getDefaultFileNameByLang = (lang: string) => {
  if (!lang) return 'file.txt';

  const key = lang.toLowerCase();

  return DEFAULT_CODE_LANGUAGE[key] || 'file.txt';
};
