import React, { memo } from 'react';
import { Dimensions, FlatList, StyleSheet, View } from 'react-native';

import { PromptCard } from '../PromptCard';

const { width } = Dimensions.get('window');

type PromptData = {
  id: string;
  title: string;
  description: string;
  iconName?: string;
  iconType?: string;
  colorCard?: string;
};

type PromptCardListProps = {
  data: PromptData[];
  onGetAnswer?: (id: string) => void;
  onEditPrompt?: (id: string) => void;
};

export const PromptCards = ({
  data,
  onGetAnswer,
  onEditPrompt,
}: PromptCardListProps) => {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToAlignment="center"
      decelerationRate="fast"
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => (
        <View style={styles.itemWrapper}>
          <PromptCard
            title={item.title}
            description={item.description}
            iconName={item.iconName}
            iconType={item.iconType}
            colorCard={item.colorCard}
            onGetAnswer={() => onGetAnswer?.(item.id)}
            onEditPrompt={() => onEditPrompt?.(item.id)}
          />
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  itemWrapper: {
    width: width * 0.6,
  },
});

export const PromptCardList = memo(PromptCards);
