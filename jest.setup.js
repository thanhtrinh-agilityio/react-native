import { jest } from '@jest/globals';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import { MOCK_THEME } from './mocks';

jest.mock('@rneui/themed', () => ({
  ThemeProvider: ({ children }) => <>{children}</>,
  useTheme: () => ({
    theme: MOCK_THEME,
  }),
  makeStyles:
    (factory) =>
    (params = {}) =>
      factory(MOCK_THEME, params),

  Text: 'Text',
  Input: 'Input',
  Icon: 'Icon',
  Button: 'Button',
  Card: 'Card',
  Image: 'Image',
  Avatar: 'Avatar',
}));

jest.mock('react-native/Libraries/Image/Image', () => 'Image');
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
jest.mock('franc-min', () => ({
  franc: jest.fn(() => 'eng'),
}));

jest.mock('react-native-gifted-chat', () => ({
  GiftedChat: () => null,
  IMessage: {},
}));

jest.mock('@rneui/base', () => {
  return {
    Icon: () => null,
  };
});

jest.mock('react-native-reanimated-carousel', () => {
  const React = require('react');
  const CarouselComponent = React.forwardRef(
    ({ data, renderItem, onSnapToItem, ...props }, ref) => {
      return <>{data.map((item, index) => renderItem({ item, index }))}</>;
    },
  );
  CarouselComponent.displayName = 'MockCarousel';
  return {
    __esModule: true,
    default: CarouselComponent,
  };
});
