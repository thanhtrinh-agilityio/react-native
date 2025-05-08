import { Text, TextProps } from '@rneui/themed';
import React from 'react';
import { TextStyle } from 'react-native';


// hooks
import { useThemeColor } from '@/hooks/useThemeColor';

type TextVariant = 'default' | 'defaultSemiBold' | 'title' | 'subtitle' | 'link' | 'primary';

interface TextBlockProps extends TextProps {
  lightColor?: string;
  darkColor?: string;
  type?: TextVariant;
}

export const TextBlock = ({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: TextBlockProps) => {
  const color = useThemeColor(
    { light: lightColor, dark: darkColor },
    type === 'primary' ? 'primary' : 'text'
  );

  return (
    <Text
      style={[
        { color },
        styles[type],
        style,
      ]}
      {...rest}
    />
  );
}

const styles: Record<TextVariant, TextStyle> = {
  default: {
    fontSize: 16,
    fontWeight: '400',
  },
  defaultSemiBold: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    opacity: 0.8,
  },
  link: {
    fontSize: 16,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  primary: {
    fontSize: 16,
  },
};
