import * as FileSystem from 'expo-file-system';
import { franc } from 'franc-min';
import langs from 'langs';
import { IMessage } from 'react-native-gifted-chat';
// Types
import { REGEX_BY_CODE_LANGUAGE } from '@/constants';
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
    case 'auth/invalid-credentials':
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

// export const parseContentToMessages = (content: string): ParsedMessage[] => {
//   const messages: ParsedMessage[] = [];
//   const regex = /```(\w+)?\n([\s\S]*?)```/g;
//   let lastIndex = 0;
//   let match;

//   while ((match = regex.exec(content)) !== null) {
//     const [fullMatch, lang, code] = match;
//     const start = match.index;

//     if (start > lastIndex) {
//       const beforeText = content.slice(lastIndex, start).trim();
//       if (beforeText) messages.push({ text: beforeText });
//     }

//     messages.push({
//       text: code.trim(),
//       isCode: true,
//       language: lang || 'text',
//       fileName: lang ? `index.${lang}` : undefined,
//     });

//     lastIndex = regex.lastIndex;
//   }

//   const remainingText = content.slice(lastIndex).trim();
//   if (remainingText) messages.push({ text: remainingText });

//   return messages;
// };

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
    // parsedParts: parseContentToMessages(content),
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

export const extractFilename = (content = '', lang = ''): string | null => {
  const lines = content.trim().split('\n').slice(0, 5);
  const patterns =
    REGEX_BY_CODE_LANGUAGE[lang] || REGEX_BY_CODE_LANGUAGE.default;

  for (const line of lines) {
    for (const regex of patterns) {
      const match = line.match(regex);
      if (match) return match[1].trim();
    }
  }

  const fallback = /([a-zA-Z0-9_.-]+\.[a-z0-9]+)/;
  for (const line of lines) {
    const match = line.match(fallback);
    if (match) return match[1].trim();
  }

  return null;
};
