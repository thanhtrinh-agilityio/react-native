import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import React, { useCallback, useEffect, useState } from 'react';
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
import { MOCK_SUGGESTIONS, PROMPT_LIST } from '@/mocks';
import { ParsedMessage, PromptData } from '@/types';

// Utils
import { SuggestInput } from '@/components/Input/SuggestInput';
import { Colors } from '@/constants';
import { loadMessages, loadThreadIds, saveMessages } from '@/db';
import {
  buildOpenRouterMessages,
  convertToGiftedMessages,
  generateAvatarUrl,
  getNameFromEmail,
} from '@/utils';
import { uuid } from 'expo-modules-core';
import { useGlobalSearchParams } from 'expo-router';

export default function ChatGPTScreen({ navigation }: any) {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [input, setInput] = useState('');
  const user = getAuth().currentUser;
  const { threadId: paramId, isNew } = useGlobalSearchParams();

  const [threadId, setThreadId] = useState<string | null>(null);

  const { mutateAsync: sendMessage, isPending: isLoading } = useSendMessage();
  const disPlayName = user?.displayName || getNameFromEmail(user?.email || '');
  const avatarUrl = user?.photoURL || generateAvatarUrl(disPlayName);

  useEffect(() => {
    (async () => {
      const threadIds = await loadThreadIds(user?.email!);
      if (isNew || (!threadId && threadIds?.length === 0)) {
        setThreadId(paramId ? (paramId as string) : uuid.v4().toString());
        setMessages([]);
      } else {
        if (!user?.email || isNew) return;
        const msgs = await loadMessages(
          paramId ? paramId : threadIds[0]!.threadId,
        );
        setThreadId(paramId ? paramId : threadIds[0]!.threadId);
        setMessages(msgs);
      }
    })();
  }, [isNew, paramId, threadId, user?.email]);

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
      setInput('');

      try {
        const payload = await buildOpenRouterMessages(trimmed, imageUri);
        const reply = await sendMessage(payload);
        const replyMsgs = convertToGiftedMessages(reply);
        const messageUpdate = [...replyMsgs, userMsg];
        await saveMessages(threadId!, user!.email!, messageUpdate);

        setMessages((prev) => GiftedChat.append(prev, replyMsgs));
      } catch (err: any) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: String(err?.message || err),
        });
      }
    },
    [disPlayName, avatarUrl, sendMessage, threadId, user],
  );

  const handleGetAnswer = async (item: PromptData) => {
    setInput(item.description);
  };

  const renderSend = (props: any) => (
    <Send {...props}>
      <View style={styles.sendButton}>
        <Ionicons name="send" size={20} color="white" />
      </View>
    </Send>
  );

  const renderMessage = ({ currentMessage }: { currentMessage: any }) => {
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
  };

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
            {!user && messages.length === 0 && (
              <PromptCardList
                data={PROMPT_LIST}
                onGetAnswer={handleGetAnswer}
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
            onInputTextChanged={setInput}
            placeholder="Ask what you want..."
            alwaysShowSend
            renderInputToolbar={() => null}
            renderSend={renderSend}
            renderLoading={renderLoading}
          />
        )}
        {!user && input.length > 0 && (
          <SuggestInput
            suggestions={MOCK_SUGGESTIONS}
            onSuggestionPress={(label) => {
              setInput((prev) => prev + ' ' + label);
            }}
          />
        )}
      </ScrollView>
      <View style={styles.inputContainer}>
        <ChatInput
          loading={isLoading}
          message={input}
          setMessage={setInput}
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
    paddingHorizontal: 15,
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
