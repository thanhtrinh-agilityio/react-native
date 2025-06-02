import { Text, makeStyles } from '@rneui/themed';
import React, { memo } from 'react';
import { TextStyle } from 'react-native';

// hooks
import { useThemeColor } from '@/hooks/useThemeColor';
import { TextBlockProps, TextType } from '@/types/text';

const useStyles = makeStyles(
  (theme, { type }: { type: TextType }) =>
    ({
      default: {
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 24,
        color:
          theme.mode === 'light' ? theme.colors?.black : theme.colors?.white,
      },
      defaultSemiBold: {
        fontSize: 14,
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
    } as Record<TextType, TextStyle>),
);

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
    variant ?? (type === 'primary' ? 'primary' : 'text'),
  );

  const styles = useStyles({ type });

  return <Text style={[{ color }, styles[type], style]} {...rest} />;
};

export const TextBlock = memo(TextComponent);
