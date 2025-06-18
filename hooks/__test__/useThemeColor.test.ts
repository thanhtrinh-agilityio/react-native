import { renderHook } from '@testing-library/react-native';
import { useThemeColor } from '../useThemeColor';

import { Colors } from '@/constants'; // adjust path if needed
import { useColorScheme } from '@/hooks/useColorScheme';

// Mock Colors constant
jest.mock('@/constants', () => ({
  Colors: {
    light: { text: '#000000', background: '#ffffff' },
    dark: { text: '#ffffff', background: '#000000' },
  },
}));

// Mock useColorScheme hook
jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: jest.fn(),
}));

describe('useThemeColor', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns the color from props if provided for the current theme', () => {
    (useColorScheme as jest.Mock).mockReturnValue('light');

    const { result } = renderHook(() =>
      useThemeColor({ light: '#123456' }, 'text'),
    );

    expect(result.current).toBe('#123456');
  });

  it('returns the fallback color from Colors if props does not include theme color', () => {
    (useColorScheme as jest.Mock).mockReturnValue('dark');

    const { result } = renderHook(() => useThemeColor({}, 'text'));

    expect(result.current).toBe(Colors.dark.text);
  });

  it('defaults to light theme if useColorScheme returns null', () => {
    (useColorScheme as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(() => useThemeColor({}, 'background'));

    expect(result.current).toBe(Colors.light.background);
  });
});
