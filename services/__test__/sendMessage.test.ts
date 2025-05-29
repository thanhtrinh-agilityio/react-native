import type { IMessage } from 'react-native-gifted-chat';
import { sendMessageToOpenRouter } from '../sendMessage'; // ← adjust!

jest.mock('@/constants', () => ({
  OPENROUTER_CONFIG: {
    url: 'https://openrouter.ai/api/v1',
    key: 'fake-key',
    title: 'Test-Run',
    model: 'test-model',
  },
}));

jest.mock('expo/fetch', () => ({
  fetch: jest.fn(),
}));

const encoder = new TextEncoder();

const makeReader = (chunks: string[]) => {
  let i = 0;
  return {
    read: async () => {
      if (i < chunks.length) {
        return { value: encoder.encode(chunks[i++] + '\n'), done: false };
      }
      return { value: undefined, done: true };
    },
  };
};

const makeStreamResponse = (lines: string[]) => {
  return {
    ok: true,
    body: { getReader: () => makeReader(lines) },
  } as unknown as Response;
};

describe('sendMessageToOpenRouter Service', () => {
  const giftedMsgs: IMessage[] = [
    {
      _id: 1,
      text: 'Hello',
      createdAt: new Date(),
      user: { _id: 2, name: 'Me' },
    },
  ];

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('streams chunks, calls onPartial, and resolves the final text', async () => {
    const encoder = new TextEncoder();
    const streamedChunks = [
      encoder.encode(
        `data: ${JSON.stringify({
          choices: [{ delta: { content: 'Hel' } }],
        })}\n`,
      ),
      encoder.encode(
        `data: ${JSON.stringify({
          choices: [{ delta: { content: 'lo' } }],
        })}\n`,
      ),
      encoder.encode('data: [DONE]\n'),
    ];

    let idx = 0;
    const getReader = () => ({
      read: jest.fn().mockImplementation(() => {
        if (idx < streamedChunks.length) {
          return Promise.resolve({ value: streamedChunks[idx++], done: false });
        }
        return Promise.resolve({ value: undefined, done: true });
      }),
    });

    (global.fetch as unknown as jest.Mock).mockResolvedValue({
      ok: true,
      body: { getReader },
    });

    const onPartial = jest.fn();
    const { result } = await sendMessageToOpenRouter(giftedMsgs, onPartial);

    await expect(result).resolves.toBe('Hello');
    expect(onPartial).toHaveBeenCalledTimes(2);
    expect(onPartial).toHaveBeenLastCalledWith('Hello');
  });

  it('falls back to non-streaming responses (no getReader)', async () => {
    (global.fetch as unknown as jest.Mock).mockResolvedValue({
      ok: true,
      body: {}, // no getReader
      text: jest.fn().mockResolvedValue('plain response'),
    });

    const onPartial = jest.fn();
    const { result } = await sendMessageToOpenRouter(giftedMsgs, onPartial);
    await expect(result).resolves.toBe('plain response');
    expect(onPartial).toHaveBeenCalledWith('plain response');
  });

  it('throws with the server error text when the response is not ok', async () => {
    (global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
      ok: false,
      text: jest.fn().mockResolvedValue('Bad things'),
    });

    const { result } = sendMessageToOpenRouter(giftedMsgs);
    await expect(result).rejects.toThrow('Bad things');
  });

  it('stops reading when cancel() is called and returns what has streamed so far', async () => {
    jest.useFakeTimers(); // so the read loop yields

    (global.fetch as jest.Mock) = jest.fn().mockResolvedValue(
      makeStreamResponse([
        'data: ' + JSON.stringify({ choices: [{ delta: { content: 'Hel' } }] }),
        // we never deliver the rest because we’ll cancel
      ]),
    );

    const onPartial = jest.fn();
    const { result, cancel } = sendMessageToOpenRouter(giftedMsgs, onPartial);

    // let the first chunk be processed…
    await jest.runOnlyPendingTimersAsync();
    cancel(); // trigger AbortController

    await expect(result).resolves.toBe('Hel');
    expect(onPartial).toHaveBeenCalledWith('Hel');

    jest.useRealTimers();
  });
});
