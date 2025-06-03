import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { SuggestInput } from '../SuggestInput';

// Mocks
import { MOCK_SUGGESTIONS } from '@/mocks';

describe('SuggestInput', () => {
  it('should renders all suggestions correctly', () => {
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

  it('should calls onSuggestionPress with correct label when pressed', () => {
    const onSuggestionPressMock = jest.fn();

    const { getByText } = render(
      <SuggestInput
        suggestions={MOCK_SUGGESTIONS}
        onSuggestionPress={onSuggestionPressMock}
      />,
    );

    const suggestion = getByText(MOCK_SUGGESTIONS[0].label);
    fireEvent.press(suggestion);

    expect(onSuggestionPressMock).toHaveBeenCalledWith(
      MOCK_SUGGESTIONS[0].label,
    );
  });

  it('shows loading spinner when isLoading is true', () => {
    const { getByTestId } = render(
      <SuggestInput
        suggestions={MOCK_SUGGESTIONS}
        onSuggestionPress={() => {}}
        isLoading
      />,
    );

    expect(getByTestId('loading-suggest')).toBeTruthy();
  });
});
