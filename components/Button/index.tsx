import { Button, FullTheme, Icon, useTheme } from '@rneui/themed';
import React, { memo } from 'react';
import { StyleSheet } from 'react-native';

// types
import { ButtonCustomProps } from '@/types';

// makeStyles function returns styles based on theme
const makeStyles = (theme: FullTheme) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      width: '100%',
    },
    button: {
      width: '100%',
      alignItems: 'center',
      minHeight: 32,
    },
    outline: {
      borderWidth: 1,
      borderColor:
        theme?.mode === 'light'
          ? theme?.colors?.primary
          : theme?.colors?.secondary,
    },
    clear: {
      backgroundColor: theme?.colors?.secondary,
      color: theme?.colors?.white,
    },
    title: {
      fontWeight: '600',
      fontSize: 14,
    },
    titleSolid: {
      color: theme?.colors?.white,
    },
  });

const ButtonBlock = ({
  iconName,
  iconType = 'material',
  type = 'solid',
  radius = 12,
  iconSize = 20,
  titleColorOutline = '',
  containerStyle,
  buttonStyle,
  ...rest
}: ButtonCustomProps) => {
  const { theme } = useTheme();
  const fullTheme = theme as FullTheme;
  const styles = makeStyles(fullTheme);
  const isSolid = type === 'solid';

  // fallback colors from theme or defaults
  const primaryColor = theme?.colors?.primary;
  const secondaryColor = theme?.colors?.secondary;

  const outlineColor = titleColorOutline || primaryColor;

  return (
    <Button
      type={type}
      icon={
        iconName ? (
          <Icon
            testID="icon"
            name={iconName}
            type={iconType}
            size={iconSize}
            color={
              isSolid || (theme?.mode === 'dark' && type === 'outline')
                ? theme?.colors?.white
                : primaryColor
            }
            {...(rest.title && { style: { marginRight: 5 } })}
          />
        ) : undefined
      }
      buttonStyle={[
        styles.button,
        isSolid
          ? undefined
          : type === 'outline'
          ? [{ borderColor: outlineColor }, styles.outline]
          : [styles.clear, { backgroundColor: secondaryColor }],
        buttonStyle,
      ]}
      accessibilityLabel={rest.title as string}
      containerStyle={[styles.container, containerStyle]}
      titleStyle={[
        styles.title,
        isSolid
          ? styles.titleSolid
          : {
              color:
                type === 'outline' && theme?.mode === 'dark'
                  ? secondaryColor
                  : outlineColor,
            },
      ]}
      radius={radius}
      {...rest}
    />
  );
};

export const BaseButton = memo(ButtonBlock);
