import { Icon } from '@rneui/base';
import { FullTheme, useTheme } from '@rneui/themed';
import React, { memo, RefObject, useMemo, useRef } from 'react';
import {
  Alert,
  Clipboard,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Markdown, { ASTNode, RenderRules } from 'react-native-markdown-display';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/styles/hljs';

// Components
import { TextBlock } from '@/components';

// Constants
import { REGEX_CODE_LANGUAGE } from '@/constants';

// Utils
import { extractFilename, getDefaultFileNameByLang } from '@/utils';

const makeStyles = (theme: FullTheme) =>
  StyleSheet.create({
    messageContainer: {
      backgroundColor: theme.colors.white,
      borderRadius: 12,
      paddingBottom: 15,
      marginBottom: 10,
      width: '100%',
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
      backgroundColor: theme.colors.white,
      padding: 10,
      borderRadius: 12,
    },
    languageLabel: {
      fontWeight: 'bold',
      color: theme.colors.textInput,
    },
    fileName: {
      color: '#d73a49',
      textTransform: 'lowercase',
    },
  });

const MarkdownRendererComponent = ({ content }: { content: string }) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme as FullTheme);
  const currentHeadingRef = useRef<{
    text?: string;
    index?: number;
    isCodeHeading?: boolean;
    lang?: string;
    fileName?: string | null;
  } | null>(null);

  const skipFenceIndexRef = useRef<number | null>(null);
  console.log('MarkdownRendererComponent content:', content);

  const formatMarkdown = (md: string) => {
    const lines = md.split('\n');
    const fixed: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^\s+```/.test(line)) {
        fixed.push(line.trimStart());
        continue;
      }

      if (/^```/.test(line) && i > 0 && lines[i - 1].trim() !== '') {
        fixed.push('');
        fixed.push(line);
        continue;
      }

      if (
        /^```/.test(line) &&
        i + 1 < lines.length &&
        lines[i + 1].trim() !== '' &&
        !/^```/.test(lines[i + 1])
      ) {
        fixed.push(line);
        fixed.push('');
        continue;
      }

      fixed.push(line);
    }

    return fixed.join('\n');
  };

  const getKey = (prefix: string, node: any, index?: number) =>
    `${prefix}-${node.key ?? index ?? JSON.stringify(node)}`;
  const renderHeading = (
    node: ASTNode,
    index: number,
    level: number,
    currentHeadingRef: RefObject<{
      text?: string;
      index?: number;
      isCodeHeading?: boolean;
      lang?: string;
      fileName?: string | null;
    } | null>,
    skipFenceIndexRef: RefObject<number | null>,
  ) => {
    const headingText = node?.children?.[0]?.children?.[0]?.content || '';

    const isCodeHeading = REGEX_CODE_LANGUAGE.test(headingText);

    if (isCodeHeading) {
      const fileName = extractFilename(headingText);
      const lang = fileName?.split('.').pop()?.toLowerCase() || 'text';

      currentHeadingRef.current = {
        text: headingText,
        index,
        isCodeHeading: true,
        lang,
        fileName,
      };
      skipFenceIndexRef.current = null;

      return null;
    }
    return (
      <View key={getKey(`heading${level}`, node, index)}>
        <TextBlock type="subtitle">{headingText}</TextBlock>
      </View>
    );
  };

  const rules: RenderRules = {
    heading2: (node) =>
      renderHeading(node, node.index, 2, currentHeadingRef, skipFenceIndexRef),
    heading3: (node) =>
      renderHeading(node, node.index, 3, currentHeadingRef, skipFenceIndexRef),
    heading4: (node) =>
      renderHeading(node, node.index, 4, currentHeadingRef, skipFenceIndexRef),

    fence: (node) => {
      const heading = currentHeadingRef.current;
      const fileName = heading?.fileName
        ? heading.fileName
        : node.sourceInfo
        ? getDefaultFileNameByLang(node.sourceInfo)
        : node.content && node.sourceInfo;
      extractFilename(node.content, node.sourceInfo);

      console.log(
        'extractFilename:',
        extractFilename(node.content, node.sourceInfo),
      );

      const language = node.sourceInfo
        ? node.sourceInfo
        : heading?.lang ?? 'text';
      const code = node.content;
      if (skipFenceIndexRef?.current !== node.index) {
        skipFenceIndexRef.current = node.index;
        currentHeadingRef.current = null;

        return (
          <View key={getKey('fence', node)} style={styles.messageContainer}>
            <View style={styles.headerRow}>
              <Text style={styles.languageLabel}>
                {language.toUpperCase()}
                {language !== 'bash' && (
                  <>
                    {' ('}
                    <Text style={styles.fileName}>
                      {fileName || 'code.txt'}
                    </Text>
                    {')'}
                  </>
                )}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  Clipboard.setString(code);
                  Alert.alert('Copied!');
                }}
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                <Icon
                  name="copy-outline"
                  type="ionicon"
                  size={20}
                  color={theme.colors.textInput}
                />
                <Text
                  style={{
                    marginLeft: 6,
                    textTransform: 'uppercase',
                    color: theme.colors.textInput,
                  }}
                >
                  Copy
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator
              style={{
                backgroundColor: theme.colors.backgroundCode,
                borderRadius: 8,
                padding: 5,
                marginHorizontal: 10,
                minHeight: 10,
              }}
            >
              <SyntaxHighlighter
                language={language}
                style={docco}
                highlighter="hljs"
                customStyle={{
                  width: Dimensions.get('window').width - 80,
                  backgroundColor: theme.colors.backgroundCode,
                  paddingBottom: 10,
                  borderRadius: 8,
                  color: theme.colors.textInput,
                }}
                PreTag={Text}
                CodeTag={Text}
              >
                {code}
              </SyntaxHighlighter>
            </ScrollView>
          </View>
        );
      }

      return null;
    },
    code_inline: (node) => {
      const content = node.content;
      const isCodeHeading = REGEX_CODE_LANGUAGE.test(content);
      if (isCodeHeading) {
        const fileName = extractFilename(content);
        currentHeadingRef.current = {
          ...(currentHeadingRef.current || {}),
          fileName,
          text: content,
          isCodeHeading: true,
        };
      }

      return (
        <Text
          key={node.key}
          style={{
            color: theme.colors.text,
          }}
        >
          {content}
        </Text>
      );
    },
  };

  const markdownStyle = {
    heading1: {
      fontSize: 20,
      fontWeight: '700' as const,
      color: theme.colors.text,
    },
    heading2: {
      fontSize: 18,
      fontWeight: '600' as const,
      color: theme.colors.text,
    },
    heading3: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: theme.colors.text,
    },
    body: {
      borderRadius: 8,
      color: theme.colors.text,
      lineHeight: 26,
      width: Dimensions.get('window').width - 42,
    },
  };

  const normalizedContent = useMemo(
    () => formatMarkdown(content.trim()),
    [content],
  );

  return (
    <Markdown rules={rules} style={markdownStyle}>
      {normalizedContent}
    </Markdown>
  );
};

export const MarkdownRenderer = memo(MarkdownRendererComponent);
