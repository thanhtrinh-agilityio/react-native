import type { Meta, StoryObj } from '@storybook/react';
import { BaseButton } from '.';

const meta: Meta<typeof BaseButton> = {
  title: 'Components/ButtonBlock',
  component: BaseButton,
  args: {
    title: 'Click Me',
  },
};

export default meta;

type Story = StoryObj<typeof BaseButton>;

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
    iconSize: 20,
    iconName: 'settings',
  },
};
