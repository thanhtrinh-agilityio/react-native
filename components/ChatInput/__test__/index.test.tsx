import { fireEvent, render } from '@testing-library/react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';

import { ChatInput } from '../index'; // update path accordingly

jest.mock('@rneui/base', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');

  const SpeedDial = ({ children }) => <>{children}</>;
  SpeedDial.Action = ({ icon, onPress, disabled, testID }) => {
    if (disabled) return null;
    return (
      <TouchableOpacity onPress={onPress} testID={`speeddial-${icon.name}`}>
        <Text>{icon.name}</Text>
      </TouchableOpacity>
    );
  };

  return {
    SpeedDial,
  };
});

// Mocks for Expo file/image picker
jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn().mockResolvedValue({
    canceled: false,
    assets: [{ uri: 'file.pdf', name: 'file.pdf', size: '1024' }],
  }),
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn().mockResolvedValue({
    canceled: false,
    assets: [{ uri: 'image.jpg' }],
  }),
}));

describe('ChatInput', () => {
  const defaultProps = {
    loading: false,
    message: '',
    open: false,
    threadId: '',
    setOpen: jest.fn(),
    onChangeMessage: jest.fn(),
    onSend: jest.fn(),
    onStopStream: jest.fn(),
  };

  it('renders input and send button correctly', () => {
    const { getByTestId, getByLabelText } = render(
      <ChatInput {...defaultProps} />,
    );
    expect(getByTestId('chat-input')).toBeTruthy();
    expect(getByLabelText('send-button')).toBeTruthy();
  });

  it('clears image and file when threadId changes', () => {
    const defaultProps = {
      open: false,
      setOpen: jest.fn(),
      message: '',
      loading: false,
      onChangeMessage: jest.fn(),
      onSend: jest.fn(),
    };

    const { queryByText, queryByTestId, rerender } = render(
      <ChatInput {...defaultProps} threadId="thread-1" />,
    );

    rerender(<ChatInput {...defaultProps} threadId="thread-1" />);

    rerender(<ChatInput {...defaultProps} threadId="thread-2" />);

    // Preview should be cleared
    expect(queryByTestId('image-preview')).toBeNull();
    expect(queryByText(/\.pdf$/)).toBeNull();
  });

  it('disables send button when no input, image or file', () => {
    const { getByLabelText } = render(<ChatInput {...defaultProps} />);
    expect(getByLabelText('send-button').props.disabled).toBe(true);
  });

  it('calls onSend when send button is pressed with message', () => {
    const { getByLabelText } = render(
      <ChatInput {...defaultProps} message="Hello world" />,
    );
    fireEvent.press(getByLabelText('send-button'));
    expect(defaultProps.onSend).toHaveBeenCalledWith('Hello world', '', null);
  });

  it('shows stop button when loading is true', () => {
    const { getByLabelText } = render(
      <ChatInput {...defaultProps} loading={true} />,
    );
    expect(getByLabelText('stop-button')).toBeTruthy();
  });

  it('calls onStopStream when stop button is pressed', () => {
    const { getByLabelText } = render(
      <ChatInput {...defaultProps} loading={true} />,
    );
    fireEvent.press(getByLabelText('stop-button'));
    expect(defaultProps.onStopStream).toHaveBeenCalled();
  });

  it('handles image upload via SpeedDial.Action', async () => {
    const { getByTestId } = render(<ChatInput {...defaultProps} open={true} />);
    const imageAction = getByTestId('speeddial-image');
    fireEvent.press(imageAction);
    expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
  });

  it('handles PDF upload via SpeedDial.Action', async () => {
    const { findByText } = render(<ChatInput {...defaultProps} open={true} />);
    const pdfAction = await findByText('picture-as-pdf');
    fireEvent.press(pdfAction);
    expect(DocumentPicker.getDocumentAsync).toHaveBeenCalled();
  });
});
