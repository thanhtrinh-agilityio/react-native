import { jest } from '@jest/globals';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@rneui/themed', () => ({
  Text: 'Text',
  Input: 'Input',
  Icon: 'Icon',
  Button: 'Button',
  Card: 'Card',
  Image: 'Image',
}));

jest.mock('react-native/Libraries/Image/Image', () => 'Image');
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
jest.mock('franc-min', () => ({
  franc: jest.fn(() => 'eng'),
}));
