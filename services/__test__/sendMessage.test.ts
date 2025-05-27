import { MOCK_MESSAGES } from '@/mocks';
import { sendMessageToOpenRouter } from '../sendMessage';

global.fetch = jest.fn();

describe('sendMessageToOpenRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a message content on successful API call', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Hello! How can I help you today?' } }],
      }),
    });

    const result = await sendMessageToOpenRouter(MOCK_MESSAGES);
    expect(result).toBe('Hello! How can I help you today?');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should return default message if choices[0].message.content is missing', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{}] }),
    });

    const result = await sendMessageToOpenRouter(MOCK_MESSAGES);
    expect(result).toBe('(no reply)');
  });

  it('should throw an error on failed API call', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      text: async () => 'Unauthorized',
    });

    await expect(sendMessageToOpenRouter(MOCK_MESSAGES)).rejects.toThrow(
      'Unauthorized',
    );
  });
});
