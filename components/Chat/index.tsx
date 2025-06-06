import React, { memo } from 'react';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { GiftedChatProps } from 'react-native-gifted-chat/lib/GiftedChat/types';

interface ChatMessageProps extends GiftedChatProps<IMessage> {
  messages: IMessage[];
  disPlayName: string;
  avatarUrl: string;
  placeholder?: string;
  renderMessage: GiftedChatProps<IMessage>['renderMessage'];
  renderSend: GiftedChatProps<IMessage>['renderSend'];
}

const ChatMessage = ({
  messages,
  disPlayName,
  avatarUrl,
  placeholder = 'Ask what you want...',
  renderMessage,
  renderSend,
  ...rest
}: ChatMessageProps) => {
  return (
    <GiftedChat
      messages={messages}
      renderMessage={renderMessage}
      user={{
        _id: 1,
        name: disPlayName,
        avatar: avatarUrl,
      }}
      showUserAvatar
      placeholder={placeholder}
      alwaysShowSend
      renderInputToolbar={() => null}
      renderSend={renderSend}
      invertibleScrollViewProps={{ scrollEnabled: false }}
      messagesContainerStyle={{ flexGrow: 1 }}
      {...rest}
    />
  );
};

export const Chat = memo(ChatMessage);
