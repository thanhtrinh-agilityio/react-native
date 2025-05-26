import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';

import { ChatInput } from '../index';

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      assets: [{ uri: 'mocked-image-uri' }],
    }),
  ),
  requestMediaLibraryPermissionsAsync: jest.fn(() =>
    Promise.resolve({ granted: true }),
  ),
}));

describe('ChatInput Component', () => {
  const setMessageMock = jest.fn();
  const onSendMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders input and buttons', () => {
    const { getByTestId, getByLabelText } = render(
      <ChatInput
        loading={false}
        message=""
        setMessage={setMessageMock}
        onSend={onSendMock}
      />,
    );
    expect(getByTestId('chat-input')).toBeTruthy();
    expect(getByLabelText('upload-image-button')).toBeTruthy();
  });

  it('calls setMessage on text input change', () => {
    const { getByTestId } = render(
      <ChatInput
        loading={false}
        message=""
        setMessage={setMessageMock}
        onSend={onSendMock}
      />,
    );

    fireEvent.changeText(getByTestId('chat-input'), 'Hello');

    expect(setMessageMock).toHaveBeenCalledWith('Hello');
  });

  it('calls expo-image-picker when image upload button pressed', async () => {
    const { getByLabelText } = render(
      <ChatInput
        loading={false}
        message=""
        setMessage={setMessageMock}
        onSend={onSendMock}
      />,
    );

    fireEvent.press(getByLabelText('upload-image-button', { name: /image/i }));

    await waitFor(() => {
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
    });
  });

  it('calls onSend with message and clears image after sending', async () => {
    const { getByLabelText } = render(
      <ChatInput
        loading={false}
        message="Test message"
        setMessage={setMessageMock}
        onSend={onSendMock}
      />,
    );

    fireEvent.press(getByLabelText('send-button'));
    await waitFor(() => {
      expect(onSendMock).toHaveBeenCalledWith('Test message', '');
    });
  });

  it('renders loading indicator and disables input', () => {
    const onSendMock = jest.fn();

    const { getByTestId, getByLabelText, queryByPlaceholderText } = render(
      <ChatInput
        loading={true}
        message=""
        setMessage={jest.fn()}
        onSend={onSendMock}
      />,
    );

    const input = getByTestId('chat-input');
    expect(input.props.editable).toBe(false);

    // The send button in loading state is the stop-button
    const stopButton = getByLabelText('stop-button');
    expect(stopButton).toBeTruthy();

    // The placeholder animation text is shown
    expect(queryByPlaceholderText('Ask what’s on mind...')).toBeNull();
  });
});
