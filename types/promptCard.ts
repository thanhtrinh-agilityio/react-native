export type PromptData = {
  id: string;
  title: string;
  description: string;
  iconName?: string;
  iconType?: string;
  colorCard?: string;
};

export type PromptCardListProps = {
  data: PromptData[];
  onGetAnswer?: (item: PromptData) => void;
  onEditPrompt?: (id: string) => void;
};
