import { MOCK_PROMPT_CARD } from '@/mocks';
import type { Meta, StoryObj } from '@storybook/react';
import { PromptCard } from '.';

const meta: Meta<typeof PromptCard> = {
  title: 'Components/PromptCard',
  component: PromptCard,

};

export default meta;

type Story = StoryObj<typeof PromptCard>;

export const Default: Story = {
  args: {
    ...MOCK_PROMPT_CARD
  },
};
