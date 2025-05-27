import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Clipboard,
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
import { rainbow } from 'react-syntax-highlighter/styles/hljs';
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
  convertToGiftedMessages,
  generateAvatarUrl,
  getNameFromEmail,
} from '@/utils';
import {
  router,
  useGlobalSearchParams,
  useLocalSearchParams,
} from 'expo-router';

export default function ChatGPTScreen({ navigation }: any) {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const user = getAuth().currentUser;
  const { threadId: paramId, isNew } = useGlobalSearchParams();
  const { threadId: uid } = useLocalSearchParams();

  const [threadId, setThreadId] = useState<string | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  const { mutateAsync: sendMessage, isPending: isLoading } = useSendMessage();
  const { suggestions, fetchSuggestions, loading } = useSuggestions();
  const disPlayName = user?.displayName || getNameFromEmail(user?.email || '');
  const avatarUrl = user?.photoURL || generateAvatarUrl(disPlayName || 'Guest');

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
      setMessages(msgs);
    };

    setupChatThread();
  }, [isNew, paramId, threadId, uid, user]);

  // handle change message input
  const handleChangeMessage = (message: string) => {
    setChatInput(message);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (message.trim()) fetchSuggestions(message);
    }, 500);
  };

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
          name: disPlayName ?? 'Guest',
          avatar: avatarUrl,
        },
        image: imageUri || '',
      };

      setMessages((prev) => GiftedChat.append(prev, [userMsg]));
      setChatInput('');

      try {
        const payload = await buildOpenRouterMessages(trimmed, imageUri);
        const reply = await sendMessage(payload);

        const replyMsgs = convertToGiftedMessages(reply);
        const messageUpdate = [...replyMsgs, userMsg];
        user?.email! &&
          (await saveMessages(threadId!, user!.email!, messageUpdate));
        setThreadId(threadId);
        setMessages((prev) => GiftedChat.append(prev, replyMsgs));
        messages.length === 0 &&
          router.push({
            pathname: ROUTES.HOME,
            params: { threadId: threadId, title: trimmed },
          });
      } catch (err: any) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: String(err?.message || err),
        });
      }
    },
    [disPlayName, avatarUrl, sendMessage, user, threadId, messages.length],
  );

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
        ? 'https://avatar.iran.liara.run/public/username?background=random&username=Rak+GPT'
        : currentMessage.user.avatar;

      return (
        <View style={{ paddingHorizontal: 15, marginVertical: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <GiftedAvatar
              user={{ _id: currentMessage.user._id, avatar: avatarUri }}
            />
            <Text style={{ fontSize: 14, color: '#555', marginLeft: 8 }}>
              {currentMessage.user.name || (isBot ? 'Rak-GPT' : 'User')}
            </Text>
          </View>

          <View style={{ marginLeft: 40 }}>
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
                    <Text style={styles.languageLabel}>
                      {part.language?.toUpperCase() || 'CODE'} (
                      <Text style={styles.fileName}>
                        {part.fileName || 'code.txt'}
                      </Text>
                      )
                    </Text>
                    <TouchableOpacity
                      onPress={async () => {
                        await Clipboard.setString(part.text);
                        Alert.alert('Copied!');
                      }}
                    >
                      <Ionicons name="copy-outline" size={20} color="#333" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    horizontal
                    nestedScrollEnabled
                    showsVerticalScrollIndicator
                    style={{ borderRadius: 8, backgroundColor: '#f6f8fa' }}
                  >
                    <SyntaxHighlighter
                      language={part?.language || 'text'}
                      style={rainbow}
                      highlighter="hljs"
                      customStyle={{ padding: 10, minWidth: 300 }}
                      PreTag={Text}
                      CodeTag={Text}
                    >
                      {part.text}
                    </SyntaxHighlighter>
                  </ScrollView>
                </View>
              ) : (
                <View key={index} style={[styles.message]}>
                  <Text>{part.text}</Text>
                </View>
              ),
            )}
          </View>
        </View>
      );
    },
    [],
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
        contentContainerStyle={{
          flexGrow: 1,
          backgroundColor: Colors.light.background,
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
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/512/4712/4712109.png',
                }}
                style={{ width: 100, height: 100 }}
              />
              <TextBlock h2 type="title" style={styles.text}>
                Hello, {disPlayName ?? 'Boss'}! {'\n'} Am ready for help you
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
              name: disPlayName ?? 'Boss',
              avatar: avatarUrl,
            }}
            isTyping={isLoading}
            showUserAvatar
            onInputTextChanged={setChatInput}
            placeholder="Ask what you want..."
            alwaysShowSend
            renderInputToolbar={() => null}
            renderSend={renderSend}
            renderLoading={renderLoading}
          />
        )}
      </ScrollView>
      <View style={styles.inputContainer}>
        <ChatInput
          loading={isLoading}
          message={chatInput}
          onChangeMessage={handleChangeMessage}
          onSend={handleSendMessage}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: Colors.light.background,
  },
  messageContainer: {
    margin: 8,
    padding: 10,
    borderRadius: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  languageLabel: {
    fontWeight: 'bold',
    color: '#333',
  },
  fileName: {
    color: '#d73a49',
  },
});
