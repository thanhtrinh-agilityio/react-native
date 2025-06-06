import { useLoading } from '@/LoadingContext';
import { FullTheme, useTheme } from '@rneui/themed';
import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';

const makeStyles = (theme: FullTheme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme?.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    spinnerContainer: {
      backgroundColor: theme?.colors.white,
      padding: 25,
      borderRadius: 15,
      alignItems: 'center',
      shadowColor: theme?.colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    loadingText: {
      marginTop: 15,
      fontSize: 16,
      color: theme?.colors.primary,
      fontWeight: '600',
    },
  });

export default function LoadingOverlay({
  visible = false,
  text = 'Loading...',
}) {
  const { isLoading } = useLoading();
  const { theme } = useTheme();
  const fullTheme = theme as FullTheme;
  const styles = makeStyles(fullTheme);
  return (
    <Modal
      transparent
      animationType="fade"
      visible={isLoading || visible}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.spinnerContainer}>
          <ActivityIndicator
            testID="loading-spinner"
            size="large"
            color={theme?.colors.primary}
          />
          {<Text style={styles.loadingText}>{text}</Text>}
        </View>
      </View>
    </Modal>
  );
}
