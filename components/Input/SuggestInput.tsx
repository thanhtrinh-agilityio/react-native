import { FullTheme, useTheme } from '@rneui/themed';
import React, { memo } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// constants
import { Colors } from '@/constants/colors';

// types
import { Suggestion } from '@/types';

type SuggestInputProps = {
  suggestions: Suggestion[];
  isLoading?: boolean;
  onSuggestionPress: (label: string) => void;
};

const makeStyles = (theme: FullTheme) =>
  StyleSheet.create({
    wrapper: {
      padding: 16,
      borderRadius: 32,
      backgroundColor:
        theme?.mode === 'light'
          ? theme?.colors?.white
          : theme?.colors?.background,
      marginHorizontal: 16,
      minHeight: 40,
      borderColor: theme?.colors?.white,
      borderWidth: 0.2,
    },
    suggestRow: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    loadingContainer: {
      justifyContent: 'center',
      flex: 1,
    },
    suggestBtn: {
      borderWidth: 1,
      borderStyle: 'dotted',
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 6,
      backgroundColor: 'transparent',
    },
    suggestText: {
      fontSize: 14,
      fontWeight: '400',
    },
    input: {
      fontSize: 16,
      color: theme.colors.textInput,
      fontWeight: '400',
    },
  });

const SuggestInputComponent = ({
  suggestions,
  isLoading,
  onSuggestionPress,
}: SuggestInputProps) => {
  const { theme } = useTheme();
  const fullTheme = theme as FullTheme;

  const styles = makeStyles(fullTheme);
  return (
    <View style={styles.wrapper}>
      <View style={[styles.suggestRow]}>
        {isLoading ? (
          <View style={[styles.loadingContainer]}>
            <ActivityIndicator
              size="small"
              color={Colors.light.primary}
              testID="loading-suggest"
            />
          </View>
        ) : (
          suggestions.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.suggestBtn, { borderColor: item.borderColor }]}
              onPress={() => onSuggestionPress(item.label)}
              activeOpacity={0.7}
            >
              <Text style={[styles.suggestText, { color: item.color }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </View>
  );
};

export const SuggestInput = memo(SuggestInputComponent);
