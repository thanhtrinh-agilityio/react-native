import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

// components
import { PromptCardList } from '../index';

// mocks
import { PROMPT_LIST } from '@/mocks';

describe('PromptCardList', () => {
  it('renders the correct number of prompt cards', () => {
    const { getByText } = render(<PromptCardList data={PROMPT_LIST} />);
    expect(getByText(PROMPT_LIST[0].title)).toBeTruthy();
    expect(getByText((PROMPT_LIST[1].title))).toBeTruthy();
  });

  it('calls onGetAnswer and onEditPrompt when prompt buttons are pressed', () => {
    const onGetAnswer = jest.fn();
    const onEditPrompt = jest.fn();

    const { getAllByLabelText } = render(
      <PromptCardList
        data={PROMPT_LIST}
        onGetAnswer={onGetAnswer}
        onEditPrompt={onEditPrompt}
      />
    );

    // Get all buttons by accessibility label
    const getAnswerButtons = getAllByLabelText('Get Answer');
    const editPromptButtons = getAllByLabelText('Edit Prompt');

    // Simulate pressing first item's buttons
    fireEvent.press(getAnswerButtons[0]);
    fireEvent.press(editPromptButtons[0]);

    expect(onGetAnswer).toHaveBeenCalledWith(PROMPT_LIST[0]);
    expect(onEditPrompt).toHaveBeenCalledWith(PROMPT_LIST[0].id);
  });
});
