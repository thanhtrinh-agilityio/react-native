import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';

// DB
import * as db from '@/db';

// Mocks
import { MOCK_CHAT_HISTORY } from '@/mocks';

// Components
import { DrawerContent } from '..';

const mockReplace = jest.fn();
const mockLogout = jest.fn();
// Mocks
jest.mock('firebase/auth', () => ({
  getAuth: () => ({
    currentUser: {
      email: 'test@example.com',
      photoURL: 'https://avatar.url',
    },
  }),
}));

jest.mock('@react-navigation/drawer', () => ({
  useDrawerStatus: jest.fn(() => 'open'),
  DrawerContentScrollView: ({ children }: any) => <>{children}</>,
}));

jest.mock('@/db');
jest.mock('expo-router', () => ({
  router: {
    replace: mockReplace,
  },
}));
jest.mock('@/services/authService', () => ({
  __esModule: true,
  logout: mockLogout,
}));

describe('DrawerContent', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock loadUserThreadsWithFirstMessage
    (db.loadUserThreadsWithFirstMessage as jest.Mock).mockResolvedValue(
      MOCK_CHAT_HISTORY,
    );
  });

  it('renders correctly with recent chats and user info', async () => {
    const { getByTestId, getByText, queryByText } = render(
      <DrawerContent navigation={{ navigate: mockNavigate } as any} />,
    );
    expect(getByTestId('chat-search')).toBeTruthy();

    await waitFor(() => {
      expect(getByText('Recent Chats')).toBeTruthy();
      // Should render recent chat texts
      expect(getByText('Hello world')).toBeTruthy();
      expect(getByText('Second message')).toBeTruthy();

      expect(getByText('Test')).toBeTruthy();

      // "Rak-GPT" label exists
      expect(getByText('Rak-GPT')).toBeTruthy();

      // Community label exists
      expect(getByText('New Chat')).toBeTruthy();

      // Logout button exists
      expect(queryByText('Logout')).toBeFalsy();
    });
  });

  it('filters chat list based on search input', async () => {
    const { getByTestId, queryByText } = render(
      <DrawerContent navigation={{ navigate: mockNavigate } as any} />,
    );

    await waitFor(() => expect(queryByText('Hello world')).toBeTruthy());

    const input = getByTestId('chat-search');

    fireEvent.changeText(input, 'second');

    // Should only show "Second message"
    await waitFor(() => {
      expect(queryByText('Second message')).toBeTruthy();
      expect(queryByText('Hello world')).toBeNull();
    });

    // Clear search shows both again
    fireEvent.changeText(input, '');

    await waitFor(() => {
      expect(queryByText('Hello world')).toBeTruthy();
      expect(queryByText('Second message')).toBeTruthy();
    });
  });

  it('navigates to chat thread on chat press', async () => {
    const { getByText } = render(
      <DrawerContent navigation={{ navigate: mockNavigate } as any} />,
    );

    await waitFor(() => expect(getByText('Hello world')).toBeTruthy());

    fireEvent.press(getByText('Hello world'));
    expect(mockNavigate).toHaveBeenCalledWith('index', {
      threadId: '1',
      title: 'Hello world',
    });
  });
});
