import { jest } from '@jest/globals';

jest.mock('@rneui/themed', () => ({
  Text: 'Text',
  Input: 'Input',
  Icon: 'Icon',
  Button: 'Button',
  Card: 'Card',
}));
