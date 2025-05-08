import type { Meta, StoryObj } from '@storybook/react';

import { TextBlock } from '.';

const meta: Meta<typeof TextBlock> = {
  title: 'Components/Text',
  component: TextBlock,
  args: {
    children: 'Hello TextBlock',
  },
};

export default meta;

type Story = StoryObj<typeof TextBlock>;

export const Default: Story = {
  args: {
    type: 'default',
  },
};

export const DefaultSemiBold: Story = {
  args: {
    type: 'defaultSemiBold',
  },
};

export const Title: Story = {
  args: {
    type: 'title',
    h1: true,
  },
};

export const Subtitle: Story = {
  args: {
    type: 'subtitle',
  },
};

export const Link: Story = {
  args: {
    type: 'link',

  },
};

export const PrimaryColor: Story = {
  args: {
    type: 'primary',
  },
};

