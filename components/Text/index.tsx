import { Text } from '@rneui/themed';
import React, { memo } from 'react';
import { TextStyle } from 'react-native';

// hooks
import { useThemeColor } from '@/hooks/useThemeColor';
import { TextBlockProps, TextType } from '@/types/text';


const TextComponent = ({
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
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 24,

  },
  defaultSemiBold: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 26,
  },
  link: {
    fontSize: 16,
    fontWeight: '500',
  },
  primary: {
    fontSize: 16,
  },
};

export const TextBlock = memo(TextComponent);
