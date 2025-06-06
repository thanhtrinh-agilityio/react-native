// __tests__/MarkdownRenderer.test.tsx

import { render } from '@testing-library/react-native';
import React from 'react';
import { MarkdownRenderer } from '../index';

// Mock Clipboard and Alert to prevent native calls
jest.mock('react-native/Libraries/Components/Clipboard/Clipboard', () => ({
  setString: jest.fn(),
}));

jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

describe('MarkdownRenderer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders simple markdown text', () => {
    const content = 'Hello **World**';
    const { queryByText } = render(<MarkdownRenderer content={content} />);

    expect(queryByText(/Hello/i)).toBeTruthy();
    expect(queryByText(/World/i)).toBeTruthy();
  });
});
