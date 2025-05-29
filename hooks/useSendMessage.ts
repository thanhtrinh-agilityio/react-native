import { useMutation } from '@tanstack/react-query';
import { IMessage } from 'react-native-gifted-chat';

// Services
import { sendMessageToOpenRouter } from '@/services/sendMessage';
import { useRef } from 'react';

type SendMessageArgs = {
  msgs: IMessage[];
  onMessagePartial?: (partialText: string) => void;
};

export const useSendMessage = () => {
  const cancelRef = useRef<() => void | null>(null);

  const mutation = useMutation<string, Error, SendMessageArgs>({
    mutationFn: async ({ msgs, onMessagePartial }) => {
      const { result, cancel } = sendMessageToOpenRouter(
        msgs,
        onMessagePartial,
      );
      cancelRef.current = cancel;
      return await result;
    },
    onSettled: () => {
      cancelRef.current = null;
    },
  });

  return {
    ...mutation,
    cancel: () => cancelRef.current?.(),
  };
};
