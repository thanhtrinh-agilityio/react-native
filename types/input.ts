import { InputProps } from '@rneui/base';
import { IMessage } from 'react-native-gifted-chat';

export type TextInputProps = InputProps & {
  leftIconType?: string;
  leftIconName?: string;
  rightIconType?: string;
  rightIconName?: string;
  onRightIconPress?: () => void;
  variant?: 'default' | 'plain';
  image?: string;
};

export type Suggestion = {
  label: string;
  color: string;
  borderColor: string;
};

export type ParsedMessage = {
  text: string;
  isCode?: boolean;
  language?: string;
  fileName?: string;
};

export interface IMessageWithParsedParts extends IMessage {
  parsedParts?: ParsedMessage[];
}
