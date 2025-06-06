import { render } from '@testing-library/react-native';
import React from 'react';

// Component
import { ChatHeader } from '../index';

describe('ChatHeader', () => {
  it('renders correctly with given displayName', () => {
    const displayName = 'John Doe';
    const { getByText, getByTestId } = render(
      <ChatHeader displayName={displayName} />,
    );

    // Check if image is rendered (Image doesn't have accessible role by default, so use testID)
    const image = getByTestId('image-robot', { hidden: true });
    expect(image).toBeTruthy();

    // Check for greeting text
    expect(
      getByText(`Hello, ${displayName}! \nAm ready to help you`),
    ).toBeTruthy();

    // Check for subtitle text
    expect(
      getByText("Ask me anything that's on your mind. I'm here to assist you!"),
    ).toBeTruthy();
  });
});
