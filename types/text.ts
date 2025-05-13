import { TextProps } from '@rneui/base';

export type TextType =
  | 'default'
  | 'defaultSemiBold'
  | 'title'
  | 'subtitle'
  | 'link'
  | 'primary';

export type TextVariant = 'primary' | 'error' | 'success' | 'warning' | 'info';

export interface TextBlockProps extends TextProps {
  lightColor?: string;
  darkColor?: string;
  type?: TextType;
  variant?: TextVariant;
}
