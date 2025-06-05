import {
  DrawerContentScrollView,
  useDrawerStatus,
} from '@react-navigation/drawer';
import { FullTheme, Icon, Image, useTheme } from '@rneui/themed';
import { uuid } from 'expo-modules-core';
import { router } from 'expo-router';
import { getAuth } from 'firebase/auth';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

// Components
import { TextInput } from '@/components/Input';
import { TextBlock } from '../../Text';

// Hooks
import useDebounce from '@/hooks/useDebounce';

// Services
import { logout } from '@/services/authService';

// Utils
import { generateAvatarUrl, getNameFromEmail } from '@/utils';

// Database
import { ROUTES } from '@/constants';
import { loadUserThreadsWithFirstMessage } from '@/db';
import { BaseButton } from 'react-native-gesture-handler';

// Types
interface ChatThread {
  id: string;
  title: string;
  text: string;
}

const screenHeight = Dimensions.get('window').height;
const chatListHeight = screenHeight * 0.5;

export const DrawerContent = ({ navigation }) => {
  const [searchTerm, setSearch] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { theme } = useTheme();
  const fullTheme = theme as FullTheme;
  const styles = makeStyles(fullTheme);

  const [historyChats, setHistoryChats] = useState<ChatThread[]>([]);
  const [allChatsHistory, setAllChatsHistory] = useState<ChatThread[]>([]);

  const drawerStatus = useDrawerStatus();

  const user = getAuth().currentUser;
  const displayName = getNameFromEmail(user?.email || '');
  const avatarUri = user?.photoURL || generateAvatarUrl(displayName);
  useEffect(() => {
    if (!user?.email) return;
    if (drawerStatus !== 'open') return;
    (async () => {
      const list = await loadUserThreadsWithFirstMessage(user.email!);
      const recentHistoryChat = list?.map((thread) => ({
        id: thread.threadId,
        title: thread.title,
        text: thread.firstMessage?.text ?? '',
      }));
      setHistoryChats(recentHistoryChat);
      setAllChatsHistory(recentHistoryChat);
    })();
  }, [drawerStatus, user?.email]);

  useEffect(() => {
    if (debouncedSearchTerm) {
      setSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  // handle search
  const handleChangeSearch = useCallback(
    (value: string) => {
      setSearch(value);
      setHistoryChats((prevState) =>
        value
          ? prevState.filter((item) =>
              item.text.toLowerCase().includes(value.toLowerCase()),
            )
          : allChatsHistory,
      );
    },
    [allChatsHistory],
  );

  // handle chat press and navigation
  const handleChatPress = useCallback(
    (item: ChatThread) => {
      const { id, text } = item;
      navigation.navigate('index', { threadId: id, title: text });
    },
    [navigation],
  );

  // handle logout
  const handleLogout = useCallback(async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          await logout();
          router.replace(ROUTES.WELCOME);
        },
      },
    ]);
  }, []);

  // handle add new chat
  const handleAddNewChat = useCallback(() => {
    navigation.navigate('index', {
      threadId: uuid.v4().toString(),
      title: 'New Chat',
      isNew: true,
    });
  }, [navigation]);

  const renderRecentItem = useCallback(
    ({ item }: { item: ChatThread }) => (
      <BaseButton style={styles.chatItem} onPress={() => handleChatPress(item)}>
        <TextBlock numberOfLines={1} style={styles.chatText}>
          {item.text || 'No message'}
        </TextBlock>
      </BaseButton>
    ),
    [handleChatPress, styles.chatItem, styles.chatText],
  );

  return (
    <DrawerContentScrollView
      contentContainerStyle={styles.container}
      scrollEnabled
    >
      <View>
        <TextInput
          value={searchTerm}
          onChangeText={handleChangeSearch}
          placeholder="Search chat history..."
          leftIconType="material"
          leftIconName="search"
          variant="plain"
          inputContainerStyle={styles.searchInput}
          testID="chat-search"
        />
        <View style={styles.menuItem} aria-disabled>
          <Image
            source={
              theme.mode === 'light'
                ? require('@/assets/images/splash-icon-gpt-light.png')
                : require('@/assets/images/splash-icon-gpt-dark.png')
            }
            style={styles.avatar}
          />
          <TextBlock type="defaultSemiBold">Rak-GPT</TextBlock>
        </View>

        <Pressable style={styles.menuItem} aria-disabled>
          <Icon name="sliders" type="feather" size={20} />
          <TextBlock style={styles.menuLabel}>Customize Feed</TextBlock>
        </Pressable>

        <Pressable
          style={styles.menuItem}
          aria-disabled
          onPress={handleAddNewChat}
        >
          <Icon name="chatbox-ellipses-outline" type="ionicon" size={20} />
          <TextBlock style={styles.menuLabel}>New Chat</TextBlock>
        </Pressable>

        <View style={styles.sectionDivider} />
        <View style={{ maxHeight: chatListHeight }}>
          {historyChats?.length > 0 && (
            <>
              <TextBlock style={styles.sectionTitle}>Recent Chats</TextBlock>
              <FlatList
                data={historyChats}
                keyExtractor={(item) => item.id}
                renderItem={renderRecentItem}
                scrollEnabled={true}
                nestedScrollEnabled={true} // Cần thiết cho Android
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{ paddingBottom: 8 }}
              />
              <View style={styles.sectionDivider} />
            </>
          )}
        </View>
      </View>
      {/* Footer */}
      <View style={styles.footer}>
        {user && (
          <>
            <View style={styles.profileContainer}>
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
              <View style={{ width: 180 }}>
                <TextBlock
                  type="defaultSemiBold"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {displayName}
                </TextBlock>
              </View>
            </View>
            <BaseButton
              style={styles.logoutButton}
              onPress={handleLogout}
              aria-label="Logout"
            >
              <Icon
                name="poweroff"
                type="antdesign"
                size={18}
                color={theme.colors?.colorLogoutButton}
              />
            </BaseButton>
          </>
        )}
      </View>
    </DrawerContentScrollView>
  );
};

const makeStyles = (theme: FullTheme) =>
  StyleSheet.create({
    container: {
      width: 293,
      flex: 1,
      justifyContent: 'space-between',
      paddingBottom: 20,
      borderColor: theme.colors?.borderDrawer,
      borderWidth: 1,
      marginVertical: 20,
      ...(Platform.OS === 'web'
        ? {
            boxShadow: '20px 0px 40px -40px #A0B0BF40',
          }
        : {
            shadowColor: '#A0B0BF',
            shadowOffset: { width: 20, height: 0 },
            shadowOpacity: 0.25,
            shadowRadius: 40,
            elevation: theme.mode === 'light' ? 1 : 0,
          }),
    },
    searchInput: {
      marginLeft: 0,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 14,
      gap: 10,
      paddingLeft: 3,
    },
    menuLabel: {
      fontSize: 14,
      fontWeight: '600',
    },
    sectionDivider: {
      height: 1,
      backgroundColor: '#eaeaea',
      marginVertical: 16,
    },
    sectionTitle: {
      fontWeight: '500',
      marginBottom: 8,
    },
    chatItem: {
      paddingVertical: 6,
    },
    chatText: {
      fontSize: 14,
      color: theme?.colors?.text,
    },
    footer: {
      marginTop: 50,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    profileContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    avatar: {
      width: 22,
      height: 22,
    },
    username: {
      fontSize: 14,
      fontWeight: '600',
    },
    logoutButton: {
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 100,
      backgroundColor: theme?.colors?.backgroundLogoutButton,
      borderColor: theme?.colors?.borderLogoutButton,
    },
  });
