import { InputProps } from '@rneui/base';

export type TextInputProps = InputProps & {
  leftIconType?: string;
  leftIconName?: string;
  rightIconType?: string;
  rightIconName?: string;
  onRightIconPress?: () => void;
  variant?: 'default' | 'plain';
  image?: string;
};

export type Suggestion = {
  label: string;
  color: string;
  borderColor: string;
};
