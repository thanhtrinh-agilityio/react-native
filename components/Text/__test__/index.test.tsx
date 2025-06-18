import { render } from '@testing-library/react-native';
import React from 'react';

// components
import { TextBlock } from '../index';

// hooks
import { Colors } from '@/constants';
import { useThemeColor } from '@/hooks/useThemeColor';
import { MOCK_THEME } from '@/mocks';

// Mock useThemeColor hook
jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: jest.fn(),
}));

describe('TextBlock Component', () => {
  beforeEach(() => {
    // Reset mock before each test
    (useThemeColor as jest.Mock).mockReset();
    MOCK_THEME.mode = 'dark';
    MOCK_THEME.colors.white = '#fff';
  });

  afterAll(() => {
    MOCK_THEME.mode = 'light';
  });

  it('renders correctly with default type', () => {
    (useThemeColor as jest.Mock).mockReturnValue('black');

    const { getByText } = render(<TextBlock>Test Default</TextBlock>);

    const textElement = getByText('Test Default');
    expect(textElement).toBeTruthy();
    expect(textElement).toHaveStyle({
      fontSize: 14,
      fontWeight: '400',
      color: '#fff',
    });
  });

  it('renders correctly with primary type', () => {
    (useThemeColor as jest.Mock).mockReturnValue(Colors.light.primary);

    const { getByText } = render(
      <TextBlock type="primary">Test Primary</TextBlock>,
    );

    const textElement = getByText('Test Primary');
    expect(textElement).toBeTruthy();
    expect(textElement).toHaveStyle({
      fontSize: 16,
      color: Colors.light.primary,
    });
  });

  it('renders correctly with custom light and dark colors', () => {
    const { getByText } = render(
      <TextBlock lightColor="yellow" darkColor="purple">
        Test Custom Colors
      </TextBlock>,
    );

    const textElement = getByText('Test Custom Colors');
    expect(textElement).toBeTruthy();
    expect(textElement).toHaveStyle({ color: '#fff' });
  });

  it('applies styles based on type', () => {
    (useThemeColor as jest.Mock).mockReturnValue('red');

    const { getByText } = render(<TextBlock type="link">Test Link</TextBlock>);

    const textElement = getByText('Test Link');
    expect(textElement).toBeTruthy();
    expect(textElement).toHaveStyle({
      fontSize: 16,
      fontWeight: '500',
      color: 'red',
    });
  });

  it('applies white text color in dark mode for type="default"', () => {
    const { getByText } = render(
      <TextBlock type="default">Dark Mode Text</TextBlock>,
    );

    const textElement = getByText('Dark Mode Text');

    expect(textElement).toHaveStyle({
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 24,
      color: '#fff',
    });
  });
});
