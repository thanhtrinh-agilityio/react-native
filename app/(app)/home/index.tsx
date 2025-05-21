import { ChatInput, PromptCardList, TextBlock } from '@/components';
import { SuggestInput } from '@/components/Input/SuggestInput';
import { Colors } from '@/constants';
import { MOCK_SUGGESTIONS, PROMPT_LIST } from '@/mocks';
import { ParsedMessage, PromptData } from '@/types';
import { buildOpenRouterMessages, convertToGiftedMessages } from '@/utils';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Clipboard,
  Image,
  KeyboardAvoidingView,
  Platform,
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

export default function ChatGPTScreen() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const user = getAuth().currentUser;

  // handle send message
  const handleSendMessage = useCallback(
    async (text: string, imageUri?: string | null) => {
      const trimmed = text.trim();
      if (!trimmed && !imageUri) return;

      const userMsg: IMessage = {
        _id: Date.now(),
        text: trimmed,
        createdAt: new Date(),
        user: { _id: 1 },
        image: imageUri || '',
      };
      setMessages((prev) => GiftedChat.append(prev, [userMsg]));
      setInput('');
      setLoading(true);

      try {
        const payload = await buildOpenRouterMessages(trimmed, imageUri);

        const res = await fetch(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              Authorization:
                'Bearer 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',
              'Content-Type': 'application/json',
              'X-Title': 'My ChatGPT Clone',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.0-flash-001',
              messages: payload,
            }),
          },
        );

        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content ?? '🤖 (empty reply)';
        setMessages((prev) =>
          GiftedChat.append(prev, convertToGiftedMessages(reply)),
        );
      } catch (err: any) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: String(err?.message || err),
        });
      } finally {
        setLoading(false);
      }
    },
    [],
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
      : 'https://avatar.iran.liara.run/public/boy?background=random';

    return (
      <View style={{ paddingHorizontal: 10, marginVertical: 4 }}>
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
              <View key={index} style={[styles.message, styles.bot]}>
                <Text>{part.text}</Text>
              </View>
            ),
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      style={{ flex: 1, backgroundColor: Colors.light.background }}
    >
      {/* <View style={styles.container}> */}
      {messages?.length === 0 && (
        <>
          <View style={{ alignItems: 'center' }}>
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/512/4712/4712109.png',
              }}
              style={{ width: 100, height: 100 }}
            />
            <TextBlock h2 type="title">
              Hello, Rakibul! Am ready for help you
            </TextBlock>
            <TextBlock type="default">
              Ask me anything what's are on your mind. Am here to assist you!
            </TextBlock>
          </View>
        </>
      )}
      {messages.length > 0 && (
        <GiftedChat
          messages={messages}
          renderMessage={renderMessage}
          onSend={() => {}}
          user={{
            _id: 1,
            name: 'User',
            avatar:
              'https://avatar.iran.liara.run/public/girl?background=random',
          }}
          showUserAvatar
          isLoadingEarlier={loading}
          onInputTextChanged={setInput}
          isTyping={loading}
          placeholder="Ask what you want..."
          alwaysShowSend
          renderInputToolbar={() => null}
          renderSend={renderSend}
        />
      )}

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {messages?.length === 0 &&
          (!user && input.length === 0 ? (
            <PromptCardList data={PROMPT_LIST} onGetAnswer={handleGetAnswer} />
          ) : (
            <SuggestInput
              suggestions={MOCK_SUGGESTIONS}
              onSuggestionPress={(label) => {
                setInput((prev) => prev + '' + label);
              }}
            />
          ))}
        <View style={styles.inputContainer}>
          <ChatInput
            loading={loading}
            message={input}
            setMessage={setInput}
            onSend={handleSendMessage}
          />
        </View>
      </ScrollView>
      {/* </View> */}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  message: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    alignContent: 'flex-start',
  },

  inputContainer: {
    flexDirection: 'row',
    margin: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: 'center',
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
