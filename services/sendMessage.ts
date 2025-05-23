import { OPENROUTER_CONFIG } from '@/constants';
import { IMessage } from 'react-native-gifted-chat';

export const sendMessageToOpenRouter = async (
  messages: IMessage[],
): Promise<string> => {
  const res = await fetch(OPENROUTER_CONFIG.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENROUTER_CONFIG.key}`,
      'Content-Type': 'application/json',
      'X-Title': OPENROUTER_CONFIG.title,
    },
    body: JSON.stringify({
      model: OPENROUTER_CONFIG.model,
      messages,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '(no reply)';
};
