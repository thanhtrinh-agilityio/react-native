import { ButtonBlock } from '@/components/Button';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof ButtonBlock> = {
  title: 'Components/ButtonBlock',
  component: ButtonBlock,
  args: {
    title: 'Click Me',
  },
};

export default meta;

type Story = StoryObj<typeof ButtonBlock>;

export const Solid: Story = {
  args: {
    type: 'solid',
    iconName: 'check',
  },
};

export const Outline: Story = {
  args: {
    type: 'outline',
    iconName: 'star',
  },
};

export const Clear: Story = {
  args: {
    type: 'clear',
    iconName: 'info',
  },
};

export const WithoutIcon: Story = {
  args: {
    iconName: undefined,
  },
};

export const CustomRadiusAndSize: Story = {
  args: {
    radius: 20,
    iconSize: 30,
    iconName: 'settings',
  },
};
