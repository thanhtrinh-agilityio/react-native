import * as sendMessageModule from '@/services/sendMessage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { IMessage } from 'react-native-gifted-chat';

// Hooks
import { useSendMessage } from '@/hooks/useSendMessage';
import { act, renderHook, waitFor } from '@testing-library/react-native';

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

const messages: IMessage[] = [
  {
    _id: '1',
    text: 'Hello',
    createdAt: new Date(),
    user: { _id: 'user1', name: 'User 1' },
  },
];

describe('useSendMessage', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls sendMessageToOpenRouter and returns the response on success', async () => {
    const mockResponse = 'response from API';
    const sendMessageSpy = jest
      .spyOn(sendMessageModule, 'sendMessageToOpenRouter')
      .mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useSendMessage(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ msgs: messages });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(sendMessageSpy).toHaveBeenCalledWith(messages, undefined);
    expect(result.current.data).toBe(mockResponse);
  });

  it('passes onMessagePartial through to sendMessageToOpenRouter', async () => {
    const onPartial = jest.fn();
    jest
      .spyOn(sendMessageModule, 'sendMessageToOpenRouter')
      .mockResolvedValue('final text');

    const { result } = renderHook(() => useSendMessage(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ msgs: messages, onMessagePartial: onPartial });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(sendMessageModule.sendMessageToOpenRouter).toHaveBeenCalledWith(
      messages,
      onPartial,
    );
  });

  it('exposes error state when the mutation rejects', async () => {
    const mockError = new Error('Failed to send');
    jest
      .spyOn(sendMessageModule, 'sendMessageToOpenRouter')
      .mockRejectedValue(mockError);

    const { result } = renderHook(() => useSendMessage(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ msgs: messages });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(mockError);
  });
});
