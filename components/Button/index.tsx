import { Button, ButtonProps, Icon } from '@rneui/themed';
import React from 'react';
import { StyleSheet } from 'react-native';

// constants
import { Colors } from '@/constants/Colors';

interface ButtonCustomProps extends ButtonProps {
  iconName?: string;
  iconType?: string;
  iconSize?: number;
  type?: 'solid' | 'outline' | 'clear';
  onPress?: () => void;
}

export const CustomButton = ({
  iconName,
  iconType = 'material',
  type = 'solid',
  radius = 12,
  iconSize = 20,
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
        isSolid ? undefined : type === 'outline' ? styles.outline : styles.clear,
      ]}
      containerStyle={[styles.container]}
      titleStyle={[
        styles.title,
        isSolid ? styles.titleSolid : styles.titleOutline,
      ]}
      radius={radius}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignContent: 'center'
  },
  button: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  outline: {
    borderColor: Colors.light.primary,
    borderWidth: 1,
  },
  clear: {
    backgroundColor: Colors.light.secondary,
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
  },
  titleSolid: {
    color: 'white',
  },
  titleOutline: {
    color: Colors.light.primary,
  },
});
