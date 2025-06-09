import { FullTheme, Icon, Image, Input, useTheme } from '@rneui/themed';
import React, { memo, useState } from 'react';

// themes

// types
import { TextInputProps } from '@/types';
import { StyleSheet } from 'react-native';

const makeStyles = (theme: FullTheme) =>
  StyleSheet.create({
    inputContainer: {
      borderRadius: 10,
      borderColor: '#fff',
      paddingHorizontal: 8,
      backgroundColor: '#fff',
      minHeight: 48,
      borderWidth: 1,
      width: '100%',
    },
    inputContainerPlain: {
      borderRadius: 24,
      borderColor: '#fff',
      paddingHorizontal: 20,
    },
    container: {
      width: '100%',
      paddingHorizontal: 0,
    },
    inputContainerFocused: {
      borderColor: theme.colors.borderInput,
    },
    inputContainerError: {
      borderColor: theme.colors.error,
    },
    input: {
      fontSize: 16,
      paddingLeft: 0,
      color: theme.colors.textInput,
    },
    inputPlain: {
      fontSize: 16,
    },
    label: {
      fontSize: 14,
      marginBottom: 4,
      fontWeight: '500',
      color: theme.colors.text,
    },
  });

const InputComponent = ({
  leftIconType,
  leftIconName,
  rightIconType,
  rightIconName,
  onRightIconPress,
  variant = 'default',
  inputContainerStyle,
  image,
  rightIcon,
  errorMessage,
  ...rest
}: TextInputProps) => {
  const isPlain = variant === 'plain';
  const [isFocused, setIsFocused] = useState(false);
  const isError = typeof errorMessage === 'string' && !!errorMessage;
  const { theme } = useTheme();
  const fullTheme = theme as FullTheme;
  const styles = makeStyles(fullTheme);
  return (
    <Input
      {...rest}
      leftIcon={
        leftIconName ? (
          <Icon
            testID="left-icon"
            type={leftIconType}
            name={leftIconName}
            size={20}
            color={theme.colors.icon}
          />
        ) : image ? (
          <Image
            source={{ uri: image }}
            style={{ width: 24, height: 24, resizeMode: 'contain' }}
          />
        ) : undefined
      }
      rightIcon={
        rightIconName ? (
          <Icon
            testID="right-icon"
            type={rightIconType}
            name={rightIconName}
            size={20}
            onPress={onRightIconPress}
            color={theme.colors.icon}
          />
        ) : (
          rightIcon
        )
      }
      inputContainerStyle={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        isPlain && styles.inputContainerPlain,
        isError && styles.inputContainerError,
        inputContainerStyle,
      ]}
      containerStyle={styles.container}
      inputStyle={[styles.input, isPlain && styles.inputPlain]}
      labelStyle={[
        styles.label,
        {
          ...(isError && { color: theme.colors.error }),
        },
      ]}
      errorMessage={errorMessage}
      onFocus={(e) => {
        setIsFocused(true);
        rest?.onFocus?.(e);
      }}
      onBlur={(e) => {
        setIsFocused(false);
        rest?.onBlur?.(e);
      }}
      selectionColor={theme.colors.primary}
    />
  );
};

export const TextInput = memo(InputComponent);
