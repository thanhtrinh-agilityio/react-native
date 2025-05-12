import type { Meta, StoryObj } from '@storybook/react';
import { CustomButton } from '.';

const meta: Meta<typeof CustomButton> = {
  title: 'Components/ButtonBlock',
  component: CustomButton,
  args: {
    title: 'Click Me',
  },
};

export default meta;

type Story = StoryObj<typeof CustomButton>;

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
