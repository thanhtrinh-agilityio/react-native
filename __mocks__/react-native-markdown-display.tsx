// __mocks__/react-native-markdown-display.tsx
import React from 'react';
import { Text } from 'react-native';

export default function Markdown({ children }: { children: React.ReactNode }) {
  return <Text>{children}</Text>;
}
