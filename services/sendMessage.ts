import { OPENROUTER_CONFIG } from '@/constants';
import { fetch as expoFetch } from 'expo/fetch';
import { IMessage } from 'react-native-gifted-chat';
global.fetch = expoFetch as any;

export async function sendMessageToOpenRouter(
  giftedMsgs: IMessage[],
  onPartial?: (t: string) => void,
) {
  const res = await fetch(OPENROUTER_CONFIG.url!, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENROUTER_CONFIG.key!}`,
      'Content-Type': 'application/json',
      'X-Title': OPENROUTER_CONFIG.title!,
    },
    body: JSON.stringify({
      model: OPENROUTER_CONFIG.model,
      stream: true,
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

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });

    for (const line of chunk.split('\n')) {
      if (!line.startsWith('data:')) continue;
      const data = line.slice(5).trim();
      if (data === '[DONE]') return accumulated;
      try {
        const delta = JSON.parse(data).choices?.[0]?.delta?.content;
        if (delta) {
          accumulated += delta;
          onPartial?.(accumulated);
        }
      } catch {}
    }
  }
  return accumulated;
}
