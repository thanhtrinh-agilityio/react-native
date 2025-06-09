import React from 'react';
import { Text, View } from 'react-native';

type ASTNode = {
  content?: string;
  children?: any[];
  index?: number;
  sourceInfo?: string;
};

type RenderRules = {
  [key: string]: (
    node: ASTNode,
    children: any[],
    parent: any,
    styles: any,
  ) => React.ReactNode;
};

let index = 0;

export default function Markdown({
  children,
  rules = {},
}: {
  children: string;
  rules?: RenderRules;
}) {
  const elements: React.ReactNode[] = [];

  const lines = children.trim().split('\n');
  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (line.startsWith('#### ')) {
      const content = line.slice(5);
      const node = {
        children: [{ children: [{ content }] }],
        index: index++,
      };
      elements.push(
        <View key={`heading4-${i}`}>
          {rules.heading4 ? (
            rules.heading4(node, [], {}, {})
          ) : (
            <Text>{content}</Text>
          )}
        </View>,
      );
    } else if (line.startsWith('### ')) {
      const content = line.slice(4);
      const node = {
        children: [{ children: [{ content }] }],
        index: index++,
      };
      elements.push(
        <View key={`heading3-${i}`}>
          {rules.heading3 ? (
            rules.heading3(node, [], {}, {})
          ) : (
            <Text>{content}</Text>
          )}
        </View>,
      );
    } else if (line.startsWith('## ')) {
      const content = line.slice(3);
      const node = {
        children: [{ children: [{ content }] }],
        index: index++,
      };
      elements.push(
        <View key={`heading2-${i}`}>
          {rules.heading2 ? (
            rules.heading2(node, [], {}, {})
          ) : (
            <Text>{content}</Text>
          )}
        </View>,
      );
    } else if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      const node = {
        content: codeLines.join('\n'),
        sourceInfo: lang.toLowerCase(),
        index: index++,
      };
      elements.push(
        <View key={`fence-${i}`}>
          {rules.fence ? (
            rules.fence(node, [], {}, {})
          ) : (
            <Text>{codeLines.join('\n')}</Text>
          )}
        </View>,
      );
    } else {
      // Inline code `...`
      const inlineMatch = line.match(/(.*?)`([^`]+)`(.*)/);
      if (inlineMatch) {
        const [, before, inlineCode, after] = inlineMatch;
        const node = { content: inlineCode, index: index++ };
        elements.push(<Text key={`text-before-${i}`}>{before}</Text>);
        elements.push(
          <Text key={`code-inline-${i}`}>
            {rules.code_inline ? (
              rules.code_inline(node, [], {}, {})
            ) : (
              <Text>{inlineCode}</Text>
            )}
          </Text>,
        );
        elements.push(<Text key={`text-after-${i}`}>{after}</Text>);
      } else {
        elements.push(<Text key={`text-${i}`}>{line}</Text>);
      }
    }
  }

  return <View>{elements}</View>;
}
