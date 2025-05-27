import * as sendMessageModule from '@/services/sendMessage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { IMessage } from 'react-native-gifted-chat';

// Hooks
import { useSendMessage } from '@/hooks/useSendMessage';
import { act, renderHook } from '@testing-library/react-native';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false,
      },
    },
  });

  const QueryClientProviderWrapper = (props: any) => (
    <QueryClientProvider client={queryClient}>
      {props.children}
    </QueryClientProvider>
  );

  return QueryClientProviderWrapper;
};

describe('useSendMessage', () => {
  it('should call sendMessageToOpenRouter on mutation', async () => {
    const mockResponse = 'response from API';
    const sendMessageSpy = jest
      .spyOn(sendMessageModule, 'sendMessageToOpenRouter')
      .mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useSendMessage(), {
      wrapper: createWrapper(),
    });

    const messages: IMessage[] = [
      {
        _id: '1',
        text: 'Hello',
        createdAt: new Date(),
        user: { _id: 'user1', name: 'User 1' },
      },
    ];

    const response = await act(async () => {
      return result.current.mutateAsync(messages);
    });

    expect(sendMessageSpy).toHaveBeenCalledWith(messages);
    expect(response).toBe(mockResponse);

    sendMessageSpy.mockRestore();
  });

  it('should handle errors properly', async () => {
    const mockError = new Error('Failed to send');
    jest
      .spyOn(sendMessageModule, 'sendMessageToOpenRouter')
      .mockRejectedValue(mockError);

    const { result } = renderHook(() => useSendMessage(), {
      wrapper: createWrapper(),
    });

    const messages: IMessage[] = [
      {
        _id: '1',
        text: 'Hello',
        createdAt: new Date(),
        user: { _id: 'user1', name: 'User 1' },
      },
    ];

    try {
      await act(async () => {
        await result.current.mutateAsync(messages);
      });
    } catch (error) {
      expect(error).toEqual(mockError);
    }
  });
});
