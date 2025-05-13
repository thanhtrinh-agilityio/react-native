import { Icon, Input } from '@rneui/themed';
import React, { memo, useState } from 'react';
import { StyleSheet } from 'react-native';

// themes
import { Colors } from '@/constants/Colors';

// types
import { TextInputProps } from '@/types';


const InputComponent = ({
  leftIconType,
  leftIconName,
  rightIconType,
  rightIconName,
  onRightIconPress,
  variant = 'default',
  inputContainerStyle,
  ...rest
}: TextInputProps) => {
  const isPlain = variant === 'plain';
  const [isFocused, setIsFocused] = useState(false);

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
            color={Colors['light'].icon}
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
            color={Colors['light'].icon}
          />
        ) : undefined
      }
      inputContainerStyle={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        isPlain && styles.inputContainerPlain,
        rest.errorMessage && styles.inputContainerError,
        inputContainerStyle
      ]}
      inputStyle={[
        styles.input,
        isPlain && styles.inputPlain,
      ]}
      labelStyle={[styles.label, {
        ...rest.errorMessage && { color: Colors.light.error }
      }]}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      selectionColor={Colors['light'].primary}

    />
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    borderRadius: 10,
    borderColor: "#fff",
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    minHeight: 48,
    borderWidth: 1,
    color: Colors['light'].textInput,
  },
  inputContainerPlain: {
    borderRadius: 24,
    borderColor: "#fff",
    minHeight: 56,
    paddingHorizontal: 20,
  },
  inputContainerFocused: {
    borderColor: Colors.light.borderInput,
  },
  inputContainerError: {
    borderColor: Colors.light.error,
  },
  input: {
    fontSize: 16,
    paddingLeft: 0,
  },
  inputPlain: {
    fontSize: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '500',
  },
});

export const TextInput = memo(InputComponent);
