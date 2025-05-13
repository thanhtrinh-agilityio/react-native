import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

// components
import { PromptCard } from '../index';

// mocks
import { MOCK_PROMPT_CARD } from '@/mocks';


describe('PromptCard', () => {
  const mockProps = {
    ...MOCK_PROMPT_CARD,
    onGetAnswer: jest.fn(),
    onEditPrompt: jest.fn()
  };

  it('renders title and description correctly', () => {
    const { getByText } = render(<PromptCard {...mockProps} />);
    expect(getByText(MOCK_PROMPT_CARD.title)).toBeTruthy();
    expect(getByText(MOCK_PROMPT_CARD.description)).toBeTruthy();
  });

  it('renders both buttons using accessibilityLabel', () => {
    const { getByLabelText } = render(<PromptCard {...mockProps} />);
    expect(getByLabelText('Get Answer')).toBeTruthy();
    expect(getByLabelText('Edit Prompt')).toBeTruthy();
  });

  it('calls onGetAnswer when Get Answer button is pressed', () => {
    const { getByLabelText } = render(<PromptCard {...mockProps} />);
    fireEvent.press(getByLabelText('Get Answer'));
    expect(mockProps.onGetAnswer).toHaveBeenCalled();
  });

  it('calls onEditPrompt when Edit Prompt button is pressed', () => {
    const { getByLabelText } = render(<PromptCard {...mockProps} />);
    fireEvent.press(getByLabelText('Edit Prompt'));
    expect(mockProps.onEditPrompt).toHaveBeenCalled();
  });
});
