import { sendMessageToOpenRouter } from '@/services/sendMessage';
import { useMutation } from '@tanstack/react-query';
import { useRef } from 'react';
import { IMessage } from 'react-native-gifted-chat';

type StreamStatus = 'start' | 'chunk' | 'done' | 'abort' | 'error';

type SendMessageArgs = {
  msgs: IMessage[];
  onMessagePartial?: (partialText: string) => void;
  onStatusChange?: (status: StreamStatus, detail?: any) => void;
};

export const useSendMessage = () => {
  const cancelRef = useRef<() => void | null>(null);

  const mutation = useMutation<string, Error, SendMessageArgs>({
    mutationFn: async ({ msgs, onMessagePartial, onStatusChange }) => {
      const { result, cancel } = sendMessageToOpenRouter(
        msgs,
        onMessagePartial,
        onStatusChange,
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
