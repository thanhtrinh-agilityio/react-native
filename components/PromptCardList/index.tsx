import React, { memo, useCallback } from 'react';
import { Dimensions, FlatList, StyleSheet, View } from 'react-native';

import { PromptCardListProps, PromptData } from '@/types';
import { PromptCard } from '../PromptCard';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.8;



export const PromptCards = ({
  data,
  onGetAnswer,
  onEditPrompt,
}: PromptCardListProps) => {
  const renderItem = useCallback(({ item }: { item: PromptData }) => {
    const { id, title, description, iconName, iconType, colorCard } = item;
    return (
      <View style={styles.itemWrapper}>
        <PromptCard
          title={title}
          description={description}
          iconName={iconName}
          iconType={iconType}
          colorCard={colorCard}
          onGetAnswer={() => onGetAnswer?.(item)}
          onEditPrompt={() => onEditPrompt?.(id)}
        />
      </View>
    );
  }, [onEditPrompt, onGetAnswer]);

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
      snapToAlignment="center"
      contentContainerStyle={{
        alignItems: 'center',
        marginBottom: 16,
      }}
      renderItem={renderItem}
      getItemLayout={(_, index) => ({
        length: ITEM_WIDTH,
        offset: ITEM_WIDTH * index,
        index,
      })}
    />
  );
};

const styles = StyleSheet.create({
  itemWrapper: {
    width: ITEM_WIDTH,
  },
});

export const PromptCardList = memo(PromptCards);
