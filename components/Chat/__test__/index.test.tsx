import { render } from '@testing-library/react-native';
import React from 'react';
import { IMessage } from 'react-native-gifted-chat';
import { Chat } from '../index';

// Prefix with `mock` to be allowed inside jest.mock()
const mockGiftedChat = jest.fn();

jest.mock('react-native-gifted-chat', () => ({
  GiftedChat: (props: any) => {
    mockGiftedChat(props); // Capture the props for assertions
    return null;
  },
}));

describe('Chat Component', () => {
  const mockMessages: IMessage[] = [];

  const renderMessage = jest.fn();
  const renderSend = jest.fn();

  it('passes correct props to GiftedChat', () => {
    render(
      <Chat
        messages={mockMessages}
        disPlayName="Jane Doe"
        avatarUrl="https://example.com/jane.png"
        renderMessage={renderMessage}
        renderSend={renderSend}
      />,
    );

    expect(mockGiftedChat).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [],
        placeholder: 'Ask what you want...',
        alwaysShowSend: true,
        showUserAvatar: true,
        messagesContainerStyle: { flexGrow: 1 },
        invertibleScrollViewProps: { scrollEnabled: false },
        renderMessage,
        renderSend,
        renderInputToolbar: expect.any(Function),
        user: {
          _id: 1,
          name: 'Jane Doe',
          avatar: 'https://example.com/jane.png',
        },
      }),
    );
  });

  it('passes renderInputToolbar that returns null', () => {
    render(
      <Chat
        messages={mockMessages}
        disPlayName="Jane"
        avatarUrl="https://example.com/avatar.png"
        renderMessage={renderMessage}
        renderSend={renderSend}
      />,
    );

    const passedProps = mockGiftedChat.mock.calls[0][0];
    expect(typeof passedProps.renderInputToolbar).toBe('function');

    expect(passedProps.renderInputToolbar()).toBeNull();
  });
});
