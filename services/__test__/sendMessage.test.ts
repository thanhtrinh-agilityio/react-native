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

describe('sendMessageToOpenRouter', () => {
  const giftedMsgs: IMessage[] = [];

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
    const result = await sendMessageToOpenRouter(giftedMsgs, onPartial);

    expect(result).toBe('Hello');
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
    const result = await sendMessageToOpenRouter(giftedMsgs, onPartial);

    expect(result).toBe('plain response');
    expect(onPartial).toHaveBeenCalledWith('plain response');
  });

  it('throws when the server answers with an error status', async () => {
    (global.fetch as unknown as jest.Mock).mockResolvedValue({
      ok: false,
      text: jest.fn().mockResolvedValue('Bad things happened'),
    });

    await expect(sendMessageToOpenRouter(giftedMsgs)).rejects.toThrow(
      'Bad things happened',
    );
  });
});
