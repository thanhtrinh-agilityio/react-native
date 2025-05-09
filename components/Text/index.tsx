import { Text, TextProps } from '@rneui/themed';
import React from 'react';
import { TextStyle } from 'react-native';

// hooks
import { useThemeColor } from '@/hooks/useThemeColor';
import { TextType, TextVariant } from '@/types/text';



interface TextBlockProps extends TextProps {
  lightColor?: string;
  darkColor?: string;
  type?: TextType;
  variant?: TextVariant;
}

export const TextBlock = ({
  style,
  lightColor,
  darkColor,
  type = 'default',
  variant,
  ...rest
}: TextBlockProps) => {
  const color = useThemeColor(
    { light: lightColor, dark: darkColor },
    variant ?? (type === 'primary' ? 'primary' : 'text')
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
};

const styles: Record<TextType, TextStyle> = {
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
