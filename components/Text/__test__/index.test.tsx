import { render } from '@testing-library/react-native';
import React from 'react';

// components
import { TextBlock } from '../index';

// hooks
import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';

// Mock useThemeColor hook
jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: jest.fn(),
}));


describe('TextBlock Component', () => {
  beforeEach(() => {
    // Reset mock before each test
    (useThemeColor as jest.Mock).mockReset();
  });

  it('renders correctly with default type', () => {
    (useThemeColor as jest.Mock).mockReturnValue('black');

    const { getByText } = render(
      <TextBlock>Test Default</TextBlock>
    );

    const textElement = getByText('Test Default');
    expect(textElement).toBeTruthy();
    expect(textElement).toHaveStyle({ fontSize: 13, fontWeight: '400', color: 'black' });
  });

  it('renders correctly with primary type', () => {
    (useThemeColor as jest.Mock).mockReturnValue(Colors.light.primary);
    const { getByText } = render(
      <TextBlock type="primary">Test Primary</TextBlock>
    );

    const textElement = getByText('Test Primary');
    expect(textElement).toBeTruthy();
    expect(textElement).toHaveStyle({ fontSize: 16, color: Colors.light.primary });
  });

  it('renders correctly with custom light and dark colors', () => {
    (useThemeColor as jest.Mock).mockReturnValue('green');  // Mocking custom light/dark color

    const { getByText } = render(
      <TextBlock lightColor="yellow" darkColor="purple">
        Test Custom Colors
      </TextBlock>
    );

    const textElement = getByText('Test Custom Colors');
    expect(textElement).toBeTruthy();
    expect(textElement).toHaveStyle({ color: 'green' }); // green is the mocked value
  });

  it('applies styles based on type', () => {
    (useThemeColor as jest.Mock).mockReturnValue('red');  // Mocking theme color for link type

    const { getByText } = render(
      <TextBlock type="link">Test Link</TextBlock>
    );

    const textElement = getByText('Test Link');
    expect(textElement).toBeTruthy();
    expect(textElement).toHaveStyle({ fontSize: 16, fontWeight: '500', color: 'red' });
  });
});
