import { useMutation } from '@tanstack/react-query';
import { IMessage } from 'react-native-gifted-chat';

// Services
import { sendMessageToOpenRouter } from '@/services/sendMessage';

type SendMessageArgs = {
  msgs: IMessage[];
  onMessagePartial?: (partialText: string) => void;
};

export const useSendMessage = () => {
  return useMutation<string, Error, SendMessageArgs>({
    mutationFn: ({ msgs, onMessagePartial }) =>
      sendMessageToOpenRouter(msgs, onMessagePartial),
  });
};
