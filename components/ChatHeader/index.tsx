import { TextBlock } from '@/components/';
import { Image } from '@rneui/themed';
import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';

type ChatHeaderProps = {
  displayName: string;
};

const ChatHeaderComponent = ({ displayName }: ChatHeaderProps) => {
  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/robot.png')}
        style={styles.image}
        testID="image-robot"
      />
      <TextBlock h2 type="title" style={styles.text}>
        Hello, {displayName}! {'\n'}Am ready to help you
      </TextBlock>
      <TextBlock type="subtitle" style={styles.text}>
        Ask me anything that's on your mind. I'm here to assist you!
      </TextBlock>
    </View>
  );
};

export const ChatHeader = memo(ChatHeaderComponent);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: 200,
    height: 200,
  },
  text: {
    textAlign: 'center',
    marginVertical: 8,
  },
});
