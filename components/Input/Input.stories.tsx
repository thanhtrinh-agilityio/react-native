import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput } from './index';

const meta: Meta<typeof TextInput> = {
  title: 'Components/TextInput',
  component: TextInput,
  args: {
    placeholder: 'Enter your input...',
  },
  decorators: [
    (Story) => (
      <View style={styles.container}>
        <Story />
      </View>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof TextInput>;

export const Default: Story = {
  args: {
    label: 'Username',
  },
};

export const WithLeftIcon: Story = {
  args: {
    label: 'Email',
    leftIconType: 'material',
    leftIconName: 'email',
  },
};

export const WithRightIcon: Story = {
  args: {
    label: 'Search',
    rightIconType: 'material',
    rightIconName: 'search',
    onRightIconPress: () => alert('Right icon clicked!'),
  },
};

export const WithBothIcons: Story = {
  args: {
    label: 'Search Email',
    leftIconType: 'material',
    leftIconName: 'search',
    rightIconType: 'material',
    rightIconName: 'close',
    onRightIconPress: () => alert('Clear clicked'),
  },
};

export const PlainVariant: Story = {
  args: {
    variant: 'plain',
    label: 'Search',
    leftIconType: 'material',
    leftIconName: 'search',
  },
};

export const WithError: Story = {
  args: {
    label: 'Phone Number',
    errorMessage: 'Invalid phone number',
    leftIconType: 'material',
    leftIconName: 'phone',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Field',
    value: 'Read only',
    disabled: true,
    leftIconType: 'material',
    leftIconName: 'lock',
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5', // ✅ background cho Storybook
    justifyContent: 'center',
  },
});
