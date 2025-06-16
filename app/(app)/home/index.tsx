import { Ionicons } from '@expo/vector-icons';
import { FullTheme, useTheme } from '@rneui/themed';
import { router, useFocusEffect, useGlobalSearchParams } from 'expo-router';
import { getAuth } from 'firebase/auth';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  GiftedAvatar,
  GiftedChat,
  IMessage,
  Send,
} from 'react-native-gifted-chat';
import Toast from 'react-native-toast-message';

// Components
import {
  Chat,
  ChatHeader,
  ChatInput,
  MarkdownRenderer,
  PromptCardList,
  SuggestInput,
  TextBlock,
} from '@/components';

// Hooks
import { useSendMessage } from '@/hooks/useSendMessage';
import { useSuggestions } from '@/hooks/useSuggestions';

// Mocks
import { PROMPT_LIST } from '@/mocks';

// Types
import { IMessageWithParsedParts, PromptData } from '@/types';

// Constants
import { ROUTES } from '@/constants';

// DB
import { loadMessages, loadThreadIds, saveMessages } from '@/db';

// Utils
import {
  buildOpenRouterMessages,
  convertToGiftedMessages,
  extractErrorMessage,
  generateAvatarUrl,
  getNameFromEmail,
} from '@/utils';

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
      color: theme?.colors.textInput,
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
  });

export default function ChatGPTScreen() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const user = getAuth().currentUser;
  const { threadId: paramId, isNew } = useGlobalSearchParams();
  const { theme } = useTheme();
  const styles = makeStyles(theme as FullTheme);
  const [isNewThread, setIsNewThread] = useState(!!isNew);

  const [threadId, setThreadId] = useState<string | null>(paramId as string);
  const typingTimeoutRef = useRef<number | null>(null);
  const historyRef = useRef<IMessage[]>(messages);
  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);

  const {
    mutateAsync: sendMessage,
    isPending: isLoading,
    cancel,
  } = useSendMessage();

  const { suggestions, fetchSuggestions, loading } = useSuggestions(
    !!isNew || !chatInput,
  );
  const scrollRef = useRef<ScrollView>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const disPlayName = user?.displayName || getNameFromEmail(user?.email || '');
  const avatarUrl = useMemo(
    () => user?.photoURL || generateAvatarUrl(disPlayName),
    [user, disPlayName],
  );

  useFocusEffect(
    useCallback(() => {
      setIsSpeedDialOpen(false);
    }, []),
  );

  useEffect(() => {
    historyRef.current = messages;
  }, [messages]);

  useEffect(() => {
    const initializeNewThread = () => {
      setThreadId(paramId as string);
      setMessages([]);
      setChatInput('');
    };

    const loadExistingThread = async (email: string, threadId: string) => {
      try {
        const threadIds = await loadThreadIds(email);
        const threadExists = threadIds?.includes(threadId);

        if (!threadExists) return;
        setIsSpeedDialOpen(false);
        setIsLoadingMessages(true);
        const msgs = await loadMessages(threadId);
        setThreadId(threadId);
        setMessages(msgs);
        setIsNewThread(false);
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    const setupChatThread = async () => {
      if (!user) {
        setMessages([]);
        return;
      }

      if (!!isNew) {
        initializeNewThread();
        return;
      }

      if (user.email && !isNewThread) {
        await loadExistingThread(user.email, paramId as string);
      }
    };
    setChatInput('');
    setupChatThread();
  }, [paramId, user, isNewThread]);

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
    async (text: string, imageUri?: string | null, filePdf?: any) => {
      const trimmed = text.trim();
      if (!trimmed && !imageUri && !filePdf) return;

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
        ...(filePdf && {
          file: {
            name: filePdf.name,
            uri: filePdf.uri,
            mimeType: filePdf.mimeType,
            size: filePdf.size,
          },
        }),
      };

      setMessages((prev) => GiftedChat.append(prev, [userMsg]));
      setChatInput('');

      const botMessageId = `streaming_${Date.now()}`;
      const botInfo = {
        _id: 2,
        name: 'Rak-GPT',
        avatar:
          theme?.mode === 'dark'
            ? require('@/assets/images/splash-icon-gpt-dark.png')
            : require('@/assets/images/splash-icon-gpt-light.png'),
      };

      setMessages((prev) =>
        GiftedChat.append(prev, [
          {
            _id: botMessageId,
            text: '',
            createdAt: new Date(),
            user: botInfo,
          },
        ]),
      );

      let isDone = false;
      try {
        const payload = await buildOpenRouterMessages(
          historyRef.current,
          trimmed,
          imageUri,
          filePdf,
        );
        const reply = await sendMessage({
          msgs: payload,
          onMessagePartial: (partialText) => {
            const [parsedMsg] = convertToGiftedMessages(partialText, {
              _id: botMessageId,
              user: botInfo,
            });

            setMessages((prev) =>
              prev.map((msg) => (msg._id === botMessageId ? parsedMsg : msg)),
            );
          },
          onStatusChange: async (status, detail) => {
            if (status === 'done') {
              isDone = true;
            }
            if (status === 'error') {
              Toast.show({
                type: 'error',
                text1: 'Stream Error',
                text2: extractErrorMessage(detail),
                position: 'bottom',
              });
            }
          },
        });
        const replyMsgs = convertToGiftedMessages(reply);
        setIsNewThread(false);
        setMessages((prev) => {
          const withoutStreaming = prev.filter(
            (msg) => msg._id !== botMessageId,
          );
          return GiftedChat.append(withoutStreaming, replyMsgs);
        });

        if (user?.email && threadId && isDone) {
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

        setMessages((prev) => prev.filter((msg) => msg._id !== botMessageId));
      }
    },
    [
      disPlayName,
      avatarUrl,
      theme?.mode,
      sendMessage,
      user?.email,
      threadId,
      messages,
    ],
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

  // handle outside press
  const handleOutsidePress = useCallback(() => {
    Keyboard.dismiss();
    if (isSpeedDialOpen) {
      setIsSpeedDialOpen(false);
    }
  }, [isSpeedDialOpen]);

  const renderSend = useCallback(
    (props: any) => (
      <Send {...props}>
        <View style={styles.sendButton}>
          <Ionicons name="send" size={20} color="white" />
        </View>
      </Send>
    ),
    [],
  );

  // render message
  const renderMessage = useCallback(
    ({ currentMessage }: { currentMessage: IMessageWithParsedParts }) => {
      const isBot = currentMessage.user._id === 2;
      const avatarUri = isBot
        ? theme?.mode === 'dark'
          ? require('@/assets/images/splash-icon-gpt-dark.png')
          : require('@/assets/images/splash-icon-gpt-light.png')
        : currentMessage.user.avatar;

      return (
        <View
          style={{
            paddingHorizontal: 20,
            backgroundColor: theme?.colors.background,
            width: '100%',
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
            {currentMessage?.file && (
              <View
                style={{
                  padding: 10,
                  borderRadius: 10,
                  maxWidth: 250,
                }}
              >
                <TouchableOpacity>
                  <TextBlock style={{ fontWeight: 'bold' }}>
                    {currentMessage.file.name}
                  </TextBlock>
                  <TextBlock style={{ color: '#888', fontSize: 12 }}>
                    {currentMessage.file.mimeType} -{' '}
                    {Math.round(parseInt(currentMessage.file.size!) / 1024)} KB
                  </TextBlock>
                </TouchableOpacity>
              </View>
            )}
            <MarkdownRenderer content={currentMessage.text} />
          </View>
        </View>
      );
    },
    [theme],
  );

  const renderLoading = useCallback(
    () => (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    ),
    [],
  );

  const { isEnableFile, isEnableImage } = useMemo(() => {
    const hasImage = messages?.some((msg) => !!msg.image) || false;
    const hasFile = messages?.some((msg) => !!msg.file) || false;

    if (!hasImage && !hasFile) {
      return { isEnableImage: true, enableisEnableFileile: true };
    }

    return {
      isEnableImage: hasImage,
      isEnableFile: hasFile,
    };
  }, [messages]);

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
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
              <ChatHeader displayName={disPlayName} />
              <PromptCardList
                data={PROMPT_LIST}
                onGetAnswer={handleGetAnswer}
              />
              {suggestions.length > 0 && chatInput.length > 0 && (
                <SuggestInput
                  suggestions={suggestions}
                  onSuggestionPress={handleGetSuggestedInput}
                  isLoading={loading}
                />
              )}
            </>
          ) : isLoadingMessages ? (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : (
            <Chat
              messages={messages}
              disPlayName={disPlayName}
              avatarUrl={avatarUrl}
              placeholder="Ask what you want..."
              renderMessage={renderMessage}
              renderSend={renderSend}
              renderLoading={renderLoading}
            />
          )}
        </ScrollView>
        <View style={styles.inputContainer}>
          <ChatInput
            loading={isLoading}
            message={chatInput}
            threadId={threadId!}
            open={isSpeedDialOpen}
            setOpen={setIsSpeedDialOpen}
            isUploadImage={isEnableImage}
            isUploadFile={isEnableFile}
            onChangeMessage={handleChangeMessage}
            onSend={handleSendMessage}
            onStopStream={handleStopStreaming}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
