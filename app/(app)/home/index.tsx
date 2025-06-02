import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  GiftedAvatar,
  GiftedChat,
  IMessage,
  Send,
} from 'react-native-gifted-chat';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import Toast from 'react-native-toast-message';
import { docco } from 'react-syntax-highlighter/styles/hljs';
// Components
import { ChatInput, PromptCardList, TextBlock } from '@/components';
import { useSendMessage } from '@/hooks/useSendMessage';
import { PROMPT_LIST } from '@/mocks';
import { IMessageWithParsedParts, ParsedMessage, PromptData } from '@/types';

// Utils
import { SuggestInput } from '@/components/Input/SuggestInput';
import { Colors, ROUTES } from '@/constants';
import { loadMessages, saveMessages } from '@/db';
import { useSuggestions } from '@/hooks/useSuggestions';
import {
  buildOpenRouterMessages,
  convertMessagesToGiftedFromDB,
  convertToGiftedMessages,
  extractErrorMessage,
  generateAvatarUrl,
  getNameFromEmail,
} from '@/utils';
import { FullTheme, useTheme } from '@rneui/themed';
import {
  router,
  useGlobalSearchParams,
  useLocalSearchParams,
} from 'expo-router';

const makeStyles = (theme: FullTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    message: {
      marginBottom: 10,
      padding: 10,
      borderRadius: 10,
      alignContent: 'flex-start',
    },
    text: {
      textAlign: 'center',
      marginTop: 16,
    },
    sendButton: {
      borderRadius: 24,
      height: 40,
      width: 40,
      marginLeft: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    inputContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 0,
      alignItems: 'center',
      backgroundColor: theme?.colors?.background,
    },
    messageContainer: {
      margin: 0,
      backgroundColor: theme?.colors.background,
      borderRadius: 12,
      paddingBottom: 15,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
      backgroundColor: theme?.colors.white,
      padding: 10,
      borderRadius: 12,
      paddingBottom: 15,
    },
    languageLabel: {
      fontWeight: 'bold',
      color: '#333',
    },
    fileName: {
      color: '#d73a49',
    },
    copyButton: {
      flexDirection: 'row',
      gap: 3,
      marginRight: 10,
    },
  });

export default function ChatGPTScreen({ navigation }: any) {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const user = getAuth().currentUser;
  const { threadId: paramId, isNew } = useGlobalSearchParams();
  const { threadId: uid } = useLocalSearchParams();
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  const [threadId, setThreadId] = useState<string | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const historyRef = useRef<IMessage[]>(messages);
  const {
    mutateAsync: sendMessage,
    isPending: isLoading,
    cancel,
  } = useSendMessage();
  const { suggestions, fetchSuggestions, loading } = useSuggestions();
  const disPlayName = user?.displayName || getNameFromEmail(user?.email || '');
  const avatarUrl = user?.photoURL || generateAvatarUrl(disPlayName);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    historyRef.current = messages;
  }, [messages]);

  useEffect(() => {
    const setupChatThread = async () => {
      if (!user) {
        if (isNew) setMessages([]);
        return;
      }

      if ((isNew || !threadId) && uid) {
        setThreadId((paramId ?? uid) as string);
        setMessages([]);
        return;
      }

      if (isNew || !user.email) return;

      const id = (paramId as string) ?? threadId!;
      const msgs = await loadMessages(id);
      setThreadId(paramId as string);
      setMessages(convertMessagesToGiftedFromDB(msgs));
    };

    setupChatThread();
  }, [isNew, paramId, threadId, uid, user]);

  // handle change message input
  const handleChangeMessage = useCallback(
    (message: string) => {
      setChatInput(message);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        if (message.trim() && messages?.length === 0) fetchSuggestions(message);
      }, 500);
    },
    [fetchSuggestions, messages?.length],
  );

  // handle send message
  const handleSendMessage = useCallback(
    async (text: string, imageUri?: string | null) => {
      const trimmed = text.trim();
      if (!trimmed && !imageUri) return;

      const userMsg: IMessage = {
        _id: Date.now().toString(),
        text: trimmed,
        createdAt: new Date(),
        user: {
          _id: 1,
          name: disPlayName,
          avatar: avatarUrl,
        },
        image: imageUri || '',
      };

      setMessages((prev) => GiftedChat.append(prev, [userMsg]));
      setChatInput('');

      // Append placeholder for streaming response
      setMessages((prev) =>
        GiftedChat.append(prev, [
          {
            _id: 'streaming',
            text: '',
            createdAt: new Date(),
            user: {
              _id: 2,
              name: 'Rak-GPT',
              avatar: require('@/assets/images/logo.png'),
            },
          },
        ]),
      );

      try {
        const payload = await buildOpenRouterMessages(
          historyRef.current,
          trimmed,
          imageUri,
        );

        const reply = await sendMessage({
          msgs: payload,
          onMessagePartial: (partialText) => {
            const [parsedMsg] = convertToGiftedMessages(partialText, {
              _id: 'streaming',
              user: {
                _id: 2,
                name: 'Rak-GPT',
                avatar:
                  theme?.mode === 'dark'
                    ? require('@/assets/images/splash-icon-gpt-dark.png')
                    : require('@/assets/images/splash-icon-gpt-light.png'),
              },
            });

            setMessages((prev) =>
              prev.map((msg) => (msg._id === 'streaming' ? parsedMsg : msg)),
            );
          },
        });

        const replyMsgs = convertToGiftedMessages(reply);

        // Remove streaming placeholder and append reply
        setMessages((prev) => {
          const withoutStreaming = prev.filter(
            (msg) => msg._id !== 'streaming',
          );
          return GiftedChat.append(withoutStreaming, replyMsgs);
        });

        if (user?.email && threadId) {
          await saveMessages(threadId, user.email, [
            ...messages,
            userMsg,
            ...replyMsgs,
          ]);
        }

        if (messages.length === 0) {
          router.push({
            pathname: ROUTES.HOME,
            params: { threadId: threadId, title: trimmed },
          });
        }
      } catch (err: any) {
        const errorMessage = extractErrorMessage(err);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: errorMessage,
          position: 'bottom',
          visibilityTime: 5000,
        });

        setMessages((prev) => prev.filter((msg) => msg._id !== 'streaming'));
      }
    },
    [disPlayName, avatarUrl, sendMessage, user, threadId, messages, theme],
  );

  // handle stop streaming
  const handleStopStreaming = useCallback(() => {
    cancel();
  }, [cancel]);

  // handle get answer from prompt
  const handleGetAnswer = useCallback((item: PromptData) => {
    setChatInput((prev) => prev + ' ' + item.description);
  }, []);

  // handle get suggested input
  const handleGetSuggestedInput = useCallback((label: string) => {
    setChatInput((prev) => prev + ' ' + label);
  }, []);

  const renderSend = (props: any) => (
    <Send {...props}>
      <View style={styles.sendButton}>
        <Ionicons name="send" size={20} color="white" />
      </View>
    </Send>
  );

  const renderMessage = useCallback(
    ({ currentMessage }: { currentMessage: IMessageWithParsedParts }) => {
      const parts: ParsedMessage[] = currentMessage?.parsedParts || [
        { text: currentMessage.text },
      ];
      const isBot = currentMessage.user._id === 2;
      const avatarUri = isBot
        ? theme?.mode === 'dark'
          ? require('@/assets/images/splash-icon-gpt-dark.png')
          : require('@/assets/images/splash-icon-gpt-light.png')
        : currentMessage.user.avatar;

      return (
        <View
          style={{
            paddingHorizontal: 15,
            backgroundColor: theme?.colors.background,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <GiftedAvatar
              user={{ _id: currentMessage.user._id, avatar: avatarUri }}
              avatarStyle={{ width: 30, height: 30 }}
            />
            <TextBlock style={{ marginLeft: 8 }}>
              {currentMessage.user.name || (isBot ? 'Rak-GPT' : 'User')}
            </TextBlock>
          </View>

          <View>
            {currentMessage.image && (
              <Image
                source={{ uri: currentMessage.image }}
                style={{
                  width: 200,
                  height: 200,
                  borderRadius: 10,
                  marginVertical: 6,
                }}
                resizeMode="cover"
              />
            )}

            {parts?.map((part, index) =>
              part.isCode ? (
                <View key={index} style={styles.messageContainer}>
                  <View style={styles.headerRow}>
                    <TextBlock style={styles.languageLabel}>
                      {part.language?.toUpperCase() || 'CODE'} (
                      <Text style={styles.fileName}>
                        {part.fileName || 'code.txt'}
                      </Text>
                      )
                    </TextBlock>
                    <TouchableOpacity
                      onPress={async () => {
                        await Clipboard.setString(part.text);
                        Alert.alert('Copied!');
                      }}
                      style={styles.copyButton}
                    >
                      <Ionicons name="copy-outline" size={20} color="#333" />
                      <TextBlock
                        style={{
                          textTransform: 'uppercase',
                        }}
                      >
                        Copy
                      </TextBlock>
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    horizontal
                    nestedScrollEnabled
                    showsVerticalScrollIndicator
                    style={{
                      borderRadius: 8,
                      backgroundColor: theme?.colors.background,
                    }}
                  >
                    <SyntaxHighlighter
                      language={part?.language || 'text'}
                      style={docco}
                      highlighter="hljs"
                      customStyle={{
                        marginLeft: 20,
                        marginRight: 20,
                        width: Dimensions.get('window').width - 70,
                        alignItems: 'center',
                        backgroundColor: theme?.colors.background,
                        paddingBottom: 10,
                        borderRadius: 8,
                      }}
                      PreTag={Text}
                      CodeTag={Text}
                    >
                      {part.text}
                    </SyntaxHighlighter>
                  </ScrollView>
                </View>
              ) : (
                <View key={index} style={[styles.message]}>
                  <TextBlock>{part.text}</TextBlock>
                </View>
              ),
            )}
          </View>
        </View>
      );
    },
    [styles, theme],
  );

  const renderLoading = useCallback(
    () => (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    ),
    [],
  );

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({ animated: true })
        }
        contentContainerStyle={{
          flexGrow: 1,
          backgroundColor: theme.colors.background,
        }}
      >
        {messages?.length === 0 ? (
          <>
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                paddingHorizontal: 20,
              }}
            >
              <Image
                source={require('@/assets/images/robot.png')}
                style={{
                  width: 200,
                  height: 200,
                }}
              />
              <TextBlock h2 type="title" style={styles.text}>
                Hello, {disPlayName}! {'\n'} Am ready for help you
              </TextBlock>
              <TextBlock type="subtitle" style={styles.text}>
                Ask me anything what is are on your mind. Am here to assist you!
              </TextBlock>
            </View>
            <PromptCardList data={PROMPT_LIST} onGetAnswer={handleGetAnswer} />
            {chatInput.length > 0 && suggestions.length > 0 && (
              <SuggestInput
                suggestions={suggestions}
                onSuggestionPress={handleGetSuggestedInput}
                isLoading={loading}
              />
            )}
          </>
        ) : (
          <GiftedChat
            messages={messages}
            renderMessage={renderMessage}
            onSend={() => {}}
            user={{
              _id: 1,
              name: disPlayName,
              avatar: avatarUrl,
            }}
            showUserAvatar
            onInputTextChanged={setChatInput}
            placeholder="Ask what you want..."
            alwaysShowSend
            renderInputToolbar={() => null}
            renderSend={renderSend}
            renderLoading={renderLoading}
            renderChatEmpty={() => null}
            invertibleScrollViewProps={{ scrollEnabled: false }}
            messagesContainerStyle={{ flexGrow: 1 }}
          />
        )}
      </ScrollView>
      <View style={styles.inputContainer}>
        <ChatInput
          loading={isLoading}
          message={chatInput}
          onChangeMessage={handleChangeMessage}
          onSend={handleSendMessage}
          onStopStream={handleStopStreaming}
        />
      </View>
    </View>
  );
}
