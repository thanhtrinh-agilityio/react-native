import { InputProps } from '@rneui/base';
import { IMessage } from 'react-native-gifted-chat';

export type TextInputProps = InputProps & {
  leftIconType?: string;
  leftIconName?: string;
  rightIconType?: string;
  rightIconName?: string;
  onRightIconPress?: () => void;
  variant?: 'default' | 'plain';
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
  fileUrl?: string;
};

export interface IMessageWithParsedParts extends IMessage {
  parsedParts?: ParsedMessage[];
  file?: {
    name?: string;
    uri?: string;
    mimeType?: string;
    size?: string;
  };
}

export type GiftedMessageOverride = {
  _id?: string | number;
  createdAt?: Date;
  user?: {
    _id: string | number;
    name: string;
    avatar: string;
  };
};
