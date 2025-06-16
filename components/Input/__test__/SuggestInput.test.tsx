// ✅ Top of your file
import { MOCK_SUGGESTIONS } from '@/mocks';
import { useTheme } from '@rneui/themed'; // ⛔ must come AFTER the mock
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { SuggestInput } from '../SuggestInput';

jest.mock('@rneui/themed', () => ({
  useTheme: jest.fn(), // make sure it's a jest mock
}));

describe('SuggestInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all suggestions correctly', () => {
    (useTheme as jest.Mock).mockReturnValue({
      theme: {
        mode: 'light',
        colors: {
          white: '#FFFFFF',
          background: '#000000',
        },
      },
    });

    const { getByText } = render(
      <SuggestInput
        suggestions={MOCK_SUGGESTIONS}
        onSuggestionPress={() => {}}
      />,
    );

    MOCK_SUGGESTIONS.forEach((item) => {
      expect(getByText(item.label)).toBeTruthy();
    });
  });

  it('calls onSuggestionPress with correct label when pressed', () => {
    (useTheme as jest.Mock).mockReturnValue({
      theme: {
        mode: 'light',
        colors: {
          white: '#FFFFFF',
          background: '#000000',
        },
      },
    });

    const onSuggestionPressMock = jest.fn();

    const { getByText } = render(
      <SuggestInput
        suggestions={MOCK_SUGGESTIONS}
        onSuggestionPress={onSuggestionPressMock}
      />,
    );

    fireEvent.press(getByText(MOCK_SUGGESTIONS[0].label));

    expect(onSuggestionPressMock).toHaveBeenCalledWith(
      MOCK_SUGGESTIONS[0].label,
    );
  });

  it('shows loading spinner when isLoading is true', () => {
    (useTheme as jest.Mock).mockReturnValue({
      theme: {
        mode: 'light',
        colors: {
          white: '#FFFFFF',
          background: '#000000',
        },
      },
    });

    const { getByTestId } = render(
      <SuggestInput
        suggestions={MOCK_SUGGESTIONS}
        onSuggestionPress={() => {}}
        isLoading
      />,
    );

    expect(getByTestId('loading-suggest')).toBeTruthy();
  });

  it('applies dark mode background color from theme', () => {
    (useTheme as jest.Mock).mockReturnValue({
      theme: {
        mode: 'dark',
        colors: {
          white: '#FFFFFF',
          background: '#121212',
        },
      },
    });

    const { getByTestId } = render(
      <SuggestInput
        suggestions={MOCK_SUGGESTIONS}
        onSuggestionPress={() => {}}
      />,
    );

    const container = getByTestId('suggest-input-container');
    const style = Array.isArray(container.props.style)
      ? Object.assign({}, ...container.props.style)
      : container.props.style;

    expect(style.backgroundColor).toBe('#121212');
  });
});
