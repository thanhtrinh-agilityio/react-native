

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// constants
import { Colors } from '@/constants/Colors';

// types
import { Suggestion } from '@/types';

type SuggestInputProps = {
  suggestions: Suggestion[];
  onSuggestionPress: (label: string) => void;
};

export const SuggestInput: React.FC<SuggestInputProps> = ({
  suggestions,
  onSuggestionPress,
}) => {

  return (
    <View style={styles.wrapper}>
      <View style={styles.suggestRow}>
        {suggestions.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={[
              styles.suggestBtn,
              { borderColor: item.borderColor }
            ]}
            onPress={() => onSuggestionPress(item.label)}
            activeOpacity={0.7}
          >
            <Text style={[styles.suggestText, { color: item.color }]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    padding: 16,
    borderRadius: 32,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    minHeight: 40,
  },
  suggestRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  suggestBtn: {
    borderWidth: 1,
    borderStyle: "dotted",
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
    color: Colors['light'].textInput,
    fontWeight: '400',
  },
});

