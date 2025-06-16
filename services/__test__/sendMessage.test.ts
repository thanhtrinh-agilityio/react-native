import type { IMessage } from 'react-native-gifted-chat';

import { sendMessageToOpenRouter } from '../sendMessage';
jest.mock('@/constants', () => ({
  OPENROUTER_CONFIG: {
    url: 'https://mock.openrouter.ai/v1/chat/completions',
    key: 'mock-api-key',
    title: 'mock-title',
    model: 'mock-model',
  },
}));

jest.mock('expo/fetch', () => ({
  fetch: jest.fn(),
}));

const encoder = new TextEncoder();
const createGiftedMessage = (text: string): IMessage => ({
  _id: 'msg1',
  text,
  createdAt: new Date(),
  user: { _id: '1' },
  content: [{ type: 'text', value: text }],
});

const mockFetch = global.fetch as jest.Mock;

describe('sendMessageToOpenRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('streams text, calls onPartial, and resolves final result', async () => {
    const chunks = [
      encoder.encode(
        `data: ${JSON.stringify({
          choices: [{ delta: { content: 'He' } }],
        })}\n`,
      ),
      encoder.encode(
        `data: ${JSON.stringify({
          choices: [{ delta: { content: 'llo' } }],
        })}\n`,
      ),
      encoder.encode('data: [DONE]\n'),
    ];

    let index = 0;
    const reader = {
      read: jest
        .fn()
        .mockImplementation(() =>
          index < chunks.length
            ? Promise.resolve({ value: chunks[index++], done: false })
            : Promise.resolve({ value: undefined, done: true }),
        ),
    };

    mockFetch.mockResolvedValue({
      ok: true,
      body: { getReader: () => reader },
    });

    const onPartial = jest.fn();
    const onStatusChange = jest.fn();

    const { result } = sendMessageToOpenRouter(
      [createGiftedMessage('Hello')],
      onPartial,
      onStatusChange,
    );

    const output = await result;
    expect(output).toBe('Hello');
    expect(onPartial).toHaveBeenCalledWith('He');
    expect(onPartial).toHaveBeenLastCalledWith('Hello');
    expect(onStatusChange).toHaveBeenCalledWith('start');
    expect(onStatusChange).toHaveBeenCalledWith('chunk', 'He');
    expect(onStatusChange).toHaveBeenCalledWith('chunk', 'llo');
    expect(onStatusChange).toHaveBeenCalledWith('done');
  });

  it('returns non-stream response if getReader is not a function', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      body: {},
      text: jest.fn().mockResolvedValue('No stream'),
    });

    const onPartial = jest.fn();
    const { result } = sendMessageToOpenRouter(
      [createGiftedMessage('Hi')],
      onPartial,
    );
    await expect(result).resolves.toBe('No stream');
    expect(onPartial).toHaveBeenCalledWith('No stream');
  });

  it('throws if response not ok', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      text: jest.fn().mockResolvedValue('Bad response'),
    });

    const { result } = sendMessageToOpenRouter([createGiftedMessage('error')]);
    await expect(result).rejects.toThrow('Bad response');
  });

  it('handles AbortError gracefully', async () => {
    const abortError = new Error('AbortError');
    (abortError as any).name = 'AbortError';

    mockFetch.mockImplementation(() => {
      throw abortError;
    });

    const onStatusChange = jest.fn();
    const { result } = sendMessageToOpenRouter(
      [createGiftedMessage('Hi')],
      undefined,
      onStatusChange,
    );

    await expect(result).resolves.toBe('');
    expect(onStatusChange).toHaveBeenCalledWith('abort');
  });

  it('can cancel during stream', async () => {
    const controller = new AbortController();
    const mockAbort = jest.spyOn(controller, 'abort');

    // Simulate fetch being aborted mid-stream
    mockFetch.mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          const err = new Error('AbortError');
          (err as any).name = 'AbortError';
          reject(err);
        }),
    );

    const onPartial = jest.fn();
    const onStatusChange = jest.fn();

    // Patch AbortController in the actual function if not injectable
    const { result, cancel } = sendMessageToOpenRouter(
      [createGiftedMessage('Hi')],
      onPartial,
      onStatusChange,
    );

    cancel(); // Abort immediately
    const output = await result;

    expect(output).toBe('');
    expect(onStatusChange).toHaveBeenCalledWith('abort');
  });

  it('skips invalid json and keeps streaming', async () => {
    const chunks = [
      encoder.encode('data: { invalid json }\n'),
      encoder.encode(
        `data: ${JSON.stringify({
          choices: [{ delta: { content: 'Yo' } }],
        })}\n`,
      ),
      encoder.encode('data: [DONE]\n'),
    ];

    let i = 0;
    const reader = {
      read: jest
        .fn()
        .mockImplementation(() =>
          i < chunks.length
            ? Promise.resolve({ value: chunks[i++], done: false })
            : Promise.resolve({ done: true, value: undefined }),
        ),
    };

    mockFetch.mockResolvedValue({
      ok: true,
      body: { getReader: () => reader },
    });

    const onPartial = jest.fn();
    const { result } = sendMessageToOpenRouter(
      [createGiftedMessage('test')],
      onPartial,
    );
    await expect(result).resolves.toBe('Yo');
  });

  it('sends plugin payload when file type exists', async () => {
    const messageWithFile = {
      _id: 'f1',
      createdAt: new Date(),
      text: 'File here',
      user: { _id: '2' },
      content: [
        { type: 'text', value: 'Check this' },
        { type: 'file', value: { name: 'file.pdf' } },
      ],
    };

    const mockJson = jest.fn().mockResolvedValue({ result: 'ok' });
    const mockReader = {
      read: jest.fn().mockResolvedValue({ done: true }),
    };

    mockFetch.mockResolvedValue({
      ok: true,
      body: { getReader: () => mockReader },
    });

    const { result } = sendMessageToOpenRouter([messageWithFile as any]);
    await result;

    const bodySent = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(bodySent.plugins).toBeDefined();
    expect(bodySent.plugins[0].id).toBe('file-parser');
  });
});
