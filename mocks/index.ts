import { IMessage } from 'react-native-gifted-chat';

export const MOCK_SUGGESTIONS = [
  { label: 'AI', color: '#50E3C2', borderColor: '#50E3C2' },
  { label: 'Using HTML', color: '#F5A623', borderColor: '#F5A623' },
];

export const MOCK_PROMPT_CARD = {
  title: 'Try Fix Bug From Your Code',
  description:
    'Fix my bug from below code. I can’t find ,where is the issue. Do it in details and explain me why ha...',
  colorCard: '#0FA958',
};

export const PROMPT_LIST = [
  {
    id: '1',
    title: 'Translate Text',
    description:
      'Fix my bug from below code. I can’t find where is the issue. Do it in details and explain me why happeni',
    colorCard: '#4A90E2',
  },
  {
    id: '2',
    title: 'Summarize Article',
    description:
      'Fix my bug from below code. I can’t find where is the issue. Do it in details and explain me why happeni',
    colorCard: '#50E3C2',
  },
  {
    id: '3',
    title: 'Fix Grammar',
    description:
      'Fix my bug from below code. I can’t find where is the issue. Do it in details and explain me why happeni',
    colorCard: '#F5A623',
  },
];

export const SLIDES = [
  {
    key: 'start',
    title: 'Start Free\nConversation',
    iconName: 'arrow-right',
    description:
      'No login required for get started chat with our AI powered chatbot. \nFeel free to ask what you want to know.',
  },
  {
    key: 'voice',
    title: 'Leave Your\nVoice Instantly',
    iconName: 'image',
    description:
      'No login is required to start chatting with our AI-powered chatbot.\nFeel free to ask what you want to know.',
  },
];

export const MOCK_CHAT_HISTORY = [
  {
    threadId: '1',
    title: 'Test Thread 1',
    firstMessage: { text: 'Hello world' },
  },
  {
    threadId: '2',
    title: 'Test Thread 2',
    firstMessage: { text: 'Second message' },
  },
];

export const MOCK_USER = {
  email: 'test@example.com',
  password: 'Password123!',
};

export const MOCK_MESSAGES: IMessage[] = [
  {
    _id: 1,
    text: 'Hello!',
    createdAt: new Date(),
    user: { _id: 2, name: 'User' },
  },
];

export const MOCK_THEME = {
  mode: 'light',
  colors: {
    text: '#1f1e58',
    primary: '#5956fc',
    background: '#f5f5f6',
    tint: '#5956fc',
    icon: '#9f9eb7',
    error: '#ff3b30',
    success: '#34c759',
    warning: '#ff9500',
    info: '#5ac8fa',
    secondary: '#eeeeff',
    borderInput: '#cccbfe',
    textInput: '#9f9eb7',
    backgroundButtonContainer: '#fff',
    borderButtonContainer: '#fff',
    black: '#000',
    borderDrawer: '#f7f7f8',
    backgroundLogoutButton: '#ff612f14',
    borderLogoutButton: '#ff612f7a',
    colorLogoutButton: '#ff4c4c',
  },
};
