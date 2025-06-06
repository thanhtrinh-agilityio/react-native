import { useSendMessage } from '@/hooks/useSendMessage';
import * as sendMessageModule from '@/services/sendMessage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { IMessage } from 'react-native-gifted-chat';

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
    const mockCancel = jest.fn();
    const mockResponse = 'response from API';

    jest.spyOn(sendMessageModule, 'sendMessageToOpenRouter').mockReturnValue({
      result: Promise.resolve(mockResponse),
      cancel: mockCancel,
    });

    const { result } = renderHook(() => useSendMessage(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ msgs: messages });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(sendMessageModule.sendMessageToOpenRouter).toHaveBeenCalledWith(
      messages,
      undefined,
      undefined,
    );
    expect(result.current.data).toBe(mockResponse);
  });

  it('passes onMessagePartial through to sendMessageToOpenRouter', async () => {
    const mockCancel = jest.fn();
    const onPartial = jest.fn();

    jest.spyOn(sendMessageModule, 'sendMessageToOpenRouter').mockReturnValue({
      result: Promise.resolve('final text'),
      cancel: mockCancel,
    });

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
      undefined,
    );
  });

  it('exposes error state when the mutation rejects', async () => {
    const mockCancel = jest.fn();
    const mockError = new Error('Failed to send');

    jest.spyOn(sendMessageModule, 'sendMessageToOpenRouter').mockReturnValue({
      result: Promise.reject(mockError),
      cancel: mockCancel,
    });

    const { result } = renderHook(() => useSendMessage(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ msgs: messages });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(mockError);
  });

  it('exposes a cancel method that calls the internal cancelStream', async () => {
    const mockCancel = jest.fn();

    let resolveFn: (value: string) => void;
    const deferredPromise = new Promise<string>((resolve) => {
      resolveFn = resolve;
    });

    const sendMessageSpy = jest
      .spyOn(sendMessageModule, 'sendMessageToOpenRouter')
      .mockReturnValue({
        result: deferredPromise,
        cancel: mockCancel,
      });

    const { result } = renderHook(() => useSendMessage(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ msgs: messages });
    });

    await waitFor(() => {
      expect(sendMessageSpy).toHaveBeenCalled();
    });

    act(() => {
      result.current.cancel();
    });

    expect(mockCancel).toHaveBeenCalled();

    resolveFn!('response');
  });
});
