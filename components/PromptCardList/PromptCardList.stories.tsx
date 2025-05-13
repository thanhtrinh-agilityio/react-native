import { PROMPT_LIST } from '@/mocks';
import type { Meta, StoryObj } from '@storybook/react';

// components
import { PromptCardList } from '.';

const meta: Meta<typeof PromptCardList> = {
  title: 'Components/PromptCardList',
  component: PromptCardList,

};

export default meta;

type Story = StoryObj<typeof PromptCardList>;

export const Default: Story = {
  args: {
    data: PROMPT_LIST
  },
};
