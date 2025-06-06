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

const createGiftedMessage = (text: string): IMessage => ({
  _id: Math.random().toString(),
  text,
  createdAt: new Date(),
  user: { _id: 1, name: 'User' },
});

const createReadableStream = (chunks: string[]) => {
  let i = 0;
  return new ReadableStream({
    pull(controller) {
      if (i < chunks.length) {
        controller.enqueue(new TextEncoder().encode(chunks[i++]));
      } else {
        controller.close();
      }
    },
  });
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
    jest.useFakeTimers();

    (global.fetch as jest.Mock) = jest
      .fn()
      .mockResolvedValue(
        makeStreamResponse([
          'data: ' +
            JSON.stringify({ choices: [{ delta: { content: 'Hel' } }] }),
        ]),
      );

    const onPartial = jest.fn();
    const { result, cancel } = sendMessageToOpenRouter(giftedMsgs, onPartial);

    await jest.runOnlyPendingTimersAsync();
    cancel();

    await expect(result).resolves.toBe('Hel');
    expect(onPartial).toHaveBeenCalledWith('Hel');

    jest.useRealTimers();
  });

  it('continues on malformed JSON lines', async () => {
    const malformedChunk = 'data: { invalid json }\n';
    const validChunk = 'data: {"choices":[{"delta":{"content":"Hi"}}]}\n';
    const doneChunk = 'data: [DONE]\n';

    const stream = createReadableStream([
      malformedChunk,
      validChunk,
      doneChunk,
    ]);

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      body: stream,
      headers: new Headers(),
    });

    const partials: string[] = [];

    const { result } = sendMessageToOpenRouter(
      [createGiftedMessage('Hi')],
      (text) => partials.push(text),
    );

    const output = await result;
    expect(output).toBe('Hi');
    expect(partials).toContain('Hi');
  });

  it('handles AbortError gracefully', async () => {
    const chunks = [
      'data: {"choices":[{"delta":{"content":"Hello"}}]}\n',
      'data: [DONE]\n',
    ];

    let readCount = 0;
    const stream = new ReadableStream({
      pull(controller) {
        if (readCount === 0) {
          controller.enqueue(new TextEncoder().encode(chunks[0]));
          readCount++;
        } else {
          const error = new Error('Aborted');
          (error as any).name = 'AbortError';
          controller.error(error);
        }
      },
    });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      body: stream,
      headers: new Headers(),
    });

    const onPartial = jest.fn();

    const { result, cancel } = sendMessageToOpenRouter(
      [createGiftedMessage('Hello')],
      onPartial,
    );

    cancel();

    const output = await result;
    expect(output).toContain('');
    expect(onPartial).toHaveBeenCalled();
  });
});
