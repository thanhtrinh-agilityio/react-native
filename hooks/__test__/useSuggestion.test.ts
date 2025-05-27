import { act, renderHook } from '@testing-library/react-native';
import { useSuggestions } from '../useSuggestions';

// ---------- Mock utils & constants ----------
jest.mock('@/utils', () => ({
  detectLanguage: jest.fn(() => ({ name: 'English' })),
  generateUniqueColors: jest.fn((len: number) =>
    Array.from({ length: len }, (_, i) => `#00000${i}`),
  ),
}));

jest.mock('@/constants', () => ({
  OPENROUTER_CONFIG: { url: 'https://fake.openrouter.ai', key: 'DUMMY_KEY' },
}));

// ---------- Helpers ----------
const flushPromises = () => new Promise(setImmediate);

describe('useSuggestions hook', () => {
  const mockResponse = {
    choices: [
      {
        message: {
          content: 'Hello there\nHow are you\nSee you',
        },
      },
    ],
  };

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockResponse),
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty suggestions when input is blank', async () => {
    const { result } = renderHook(() => useSuggestions());

    await act(async () => {
      await result.current.fetchSuggestions('   ');
    });

    expect(result.current.suggestions).toEqual([]);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('fetches, parses, and sets suggestions', async () => {
    const { result } = renderHook(() => useSuggestions());

    act(() => {
      // kick off the async call
      result.current.fetchSuggestions('Hello');
    });

    // loading should be true immediately
    expect(result.current.loading).toBe(true);

    await act(async () => {
      await flushPromises();
    });

    // loading should be false after resolution
    expect(result.current.loading).toBe(false);

    // verify suggestions
    expect(result.current.suggestions).toEqual([
      { label: 'Hello there', color: '#000000', borderColor: '#000000' },
      { label: 'How are you', color: '#000001', borderColor: '#000001' },
      { label: 'See you', color: '#000002', borderColor: '#000002' },
    ]);

    // network call made with correct payload
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(options!.body!);
    expect(body.messages[1].content).toContain('Suggest next phrases');
  });

  it('handles fetch errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network down'),
    );

    const { result } = renderHook(() => useSuggestions());

    await act(async () => {
      await result.current.fetchSuggestions('Hello');
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.suggestions).toEqual([]);
  });
});
