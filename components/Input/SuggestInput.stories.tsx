import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';
import { SuggestInput } from './SuggestInput';

const meta: Meta<typeof SuggestInput> = {
  title: 'Components/SuggestInput',
  component: SuggestInput,
  args: {
    suggestions: [
      { label: 'React', color: '#61DAFB', borderColor: '#61DAFB' },
      { label: 'Expo', color: '#000000', borderColor: '#000000' },
      { label: 'Firebase', color: '#FFA000', borderColor: '#FFA000' },
    ],
    onSuggestionPress: (label: string) => {
      console.log('Pressed:', label);
    },
  },
};

export default meta;

type Story = StoryObj<typeof SuggestInput>;

export const Default: Story = {
  render: (args) => (
    <View style={{ padding: 20 }}>
      <SuggestInput {...args} />
    </View>
  ),
};
