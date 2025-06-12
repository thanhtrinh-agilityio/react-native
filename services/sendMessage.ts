import { OPENROUTER_CONFIG } from '@/constants';
import { fetch as expoFetch } from 'expo/fetch';
import { IMessage } from 'react-native-gifted-chat';

global.fetch = expoFetch as any;

type StreamStatus = 'start' | 'chunk' | 'done' | 'abort' | 'error';

export function sendMessageToOpenRouter(
  giftedMsgs: IMessage[],
  onPartial?: (t: string) => void,
  onStatusChange?: (status: StreamStatus, detail?: any) => void,
): {
  result: Promise<string>;
  cancel: () => void;
} {
  const controller = new AbortController();
  const result = (async () => {
    try {
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
          messages: giftedMsgs,
          ...(giftedMsgs.some((m) => m.content[1].type === 'file') && {
            plugins: [
              {
                id: 'file-parser',
                pdf: {
                  engine: 'pdf-text',
                },
              },
            ],
          }),
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        onStatusChange?.('error', errorText);
        throw new Error(errorText);
      }

      if (!res.body || typeof (res.body as any).getReader !== 'function') {
        const all = await res.text();
        onPartial?.(all);
        onStatusChange?.('done');
        return all;
      }

      const reader = (res.body as ReadableStream).getReader();
      const decoder = new TextDecoder('utf-8');

      let accumulated = '';
      let buffered = '';
      let hasStarted = false;

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

          if (data === '[DONE]') {
            onStatusChange?.('done');
            return accumulated;
          }

          try {
            const json = JSON.parse(data);
            const delta = json?.choices?.[0]?.delta?.content;
            if (delta) {
              if (!hasStarted) {
                hasStarted = true;
                onStatusChange?.('start');
              }
              accumulated += delta;
              onPartial?.(accumulated);
              onStatusChange?.('chunk', delta);
            }
          } catch (err) {
            continue;
          }
        }
      }

      onStatusChange?.('done');
      return accumulated;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        onStatusChange?.('abort');
        return '';
      }
      onStatusChange?.('error', err);
      throw err;
    }
  })();

  return {
    result,
    cancel: () => controller.abort(),
  };
}
