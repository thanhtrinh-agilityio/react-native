export const fetch = jest.fn(async () => ({
  ok: true,
  text: async () => 'mocked response',
  body: {
    getReader: () => ({
      read: async () => ({ done: true, value: undefined }),
    }),
  },
}));
