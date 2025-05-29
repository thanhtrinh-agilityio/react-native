import { OPENROUTER_CONFIG } from '@/constants';
import { fetch as expoFetch } from 'expo/fetch';
import { IMessage } from 'react-native-gifted-chat';

global.fetch = expoFetch as any;

export function sendMessageToOpenRouter(
  giftedMsgs: IMessage[],
  onPartial?: (t: string) => void,
): {
  result: Promise<string>;
  cancel: () => void;
} {
  const controller = new AbortController();

  const result = (async () => {
    const res = await fetch(OPENROUTER_CONFIG.url!, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${OPENROUTER_CONFIG.key!}`,
        'Content-Type': 'application/json',
        'X-Title': OPENROUTER_CONFIG.title!,
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({
        model: OPENROUTER_CONFIG.model,
        stream: true,
        max_tokens: 3000,
        messages: giftedMsgs,
      }),
    });

    if (!res.ok) throw new Error(await res.text());

    if (!res.body || typeof (res.body as any).getReader !== 'function') {
      const all = await res.text();
      onPartial?.(all);
      return all;
    }

    const reader = (res.body as ReadableStream).getReader();
    const decoder = new TextDecoder('utf-8');
    let accumulated = '';
    let buffered = '';

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffered += decoder.decode(value, { stream: true });

        const lines = buffered.split('\n');
        buffered = lines.pop() ?? '';

        for (const raw of lines) {
          if (!raw.startsWith('data:')) continue;

          const data = raw.slice(5).trim();
          if (!data) continue;
          if (data === '[DONE]') return accumulated;

          try {
            const json = JSON.parse(data);
            const delta = json?.choices?.[0]?.delta?.content;
            if (delta) {
              accumulated += delta;
              onPartial?.(accumulated);
            }
          } catch (err) {
            continue;
          }
        }
      }
      return accumulated;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return accumulated;
      }
      throw err;
    }
  })();

  return {
    result,
    cancel: () => controller.abort(),
  };
}
