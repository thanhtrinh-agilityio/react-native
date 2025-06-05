import { useCallback, useEffect, useState } from 'react';

// Constants
import { OPENROUTER_CONFIG } from '@/constants';

// Utils
import { detectLanguage, generateUniqueColors } from '@/utils';

type Suggestion = {
  label: string;
  color: string;
  borderColor: string;
};

export const useSuggestions = (isNewChat = false) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isNewChat) {
      setSuggestions([]);
    }
  }, [isNewChat]);

  const fetchSuggestions = useCallback(async (inputText: string) => {
    if (!inputText.trim()) {
      setSuggestions([]);
      return;
    }

    const { name: langName } = detectLanguage(inputText);

    setLoading(true);
    try {
      const response = await fetch(OPENROUTER_CONFIG.url!, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENROUTER_CONFIG.key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openai/gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content:
                `You are a quick-suggestion engine. The user's language is ${langName}. ` +
                `Return exactly 3 short suggestions in the same language. ` +
                `Each suggestion must be a phrase of no more than 3 words. ` +
                `No numbering. One suggestion per line.`,
            },
            {
              role: 'user',
              content: `Suggest next phrases for: "${inputText}"`,
            },
          ],
          max_tokens: 50,
          temperature: 0.5,
        }),
      });

      const data = await response.json();
      const resultText = data?.choices?.[0]?.message?.content;

      if (resultText) {
        const lines = resultText
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean);

        const uniqueColors = generateUniqueColors(lines.length);

        const parsed = lines.map((label: string, index: number): Suggestion => {
          const color = uniqueColors[index];
          const labelUpdate = label.replace(/^\d+\.\s*/, '');
          return {
            label: labelUpdate,
            color,
            borderColor: color,
          };
        });

        setSuggestions(parsed);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { suggestions, loading, fetchSuggestions };
};
