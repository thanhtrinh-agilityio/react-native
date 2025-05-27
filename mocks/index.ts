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
