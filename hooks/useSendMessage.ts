import { useMutation } from '@tanstack/react-query';
import { IMessage } from 'react-native-gifted-chat';

// Services
import { sendMessageToOpenRouter } from '@/services/sendMessage';

export const useSendMessage = () => {
  return useMutation<string, Error, IMessage[]>({
    mutationFn: (msgs: IMessage[]) => sendMessageToOpenRouter(msgs),
  });
};
