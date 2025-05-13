import { Button, Icon } from '@rneui/themed';
import React, { memo } from 'react';
import { StyleSheet } from 'react-native';

// constants
import { Colors } from '@/constants/Colors';

// types
import { ButtonCustomProps } from '@/types';



const ButtonBlock = ({
  iconName,
  iconType = 'material',
  type = 'solid',
  radius = 12,
  iconSize = 20,
  titleColorOutline = Colors.light.primary,
  containerStyle,
  buttonStyle,
  ...rest
}: ButtonCustomProps) => {
  const isSolid = type === 'solid';

  return (
    <Button
      type={type}
      icon={
        iconName ? (
          <Icon
            name={iconName}
            type={iconType}
            size={iconSize}
            color={isSolid ? '#fff' : Colors.light.primary}
            style={{ marginRight: 8 }}
          />
        ) : undefined
      }
      buttonStyle={[
        styles.button,
        isSolid ? undefined : type === 'outline' ? [styles.outline, { borderColor: titleColorOutline }] : styles.clear,
        buttonStyle,
      ]}
      containerStyle={[styles.container, containerStyle]}
      titleStyle={[
        styles.title,
        isSolid ? styles.titleSolid : {
          color: titleColorOutline
        },
      ]}
      radius={radius}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    width: '100%',
    alignItems: 'center',
    height: 40,
  },
  outline: {
    borderWidth: 1,
  },
  clear: {
    backgroundColor: Colors.light.secondary,
  },
  title: {
    fontWeight: '600',
    fontSize: 14,
  },
  titleSolid: {
    color: '#fff',
  },
});

export const BaseButton = memo(ButtonBlock);
