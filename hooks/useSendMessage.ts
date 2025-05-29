import { useMutation } from '@tanstack/react-query';
import { IMessage } from 'react-native-gifted-chat';

// Services
import { sendMessageToOpenRouter } from '@/services/sendMessage';

type SendMessageArgs = {
  msgs: IMessage[];
  onMessagePartial?: (partialText: string) => void;
};

export const useSendMessage = () => {
  let cancelStream: (() => void) | null = null;
  const mutation = useMutation<string, Error, SendMessageArgs>({
    mutationFn: async ({ msgs, onMessagePartial }) => {
      const { result, cancel } = sendMessageToOpenRouter(
        msgs,
        onMessagePartial,
      );
      cancelStream = cancel;
      return await result;
    },
    onSettled: () => {
      cancelStream = null;
    },
  });

  return {
    ...mutation,
    cancel: () => cancelStream?.(),
  };
};
