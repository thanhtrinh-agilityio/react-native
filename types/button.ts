import { ButtonProps } from '@rneui/base';

export type ButtonCustomProps = ButtonProps & {
  iconName?: string;
  iconType?: string;
  iconSize?: number;
  type?: 'solid' | 'outline' | 'clear';
  onPress?: () => void;
};
