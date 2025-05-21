
import { Feather, Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Icon, Image } from '@rneui/themed';
import { router } from 'expo-router';
import { getAuth } from 'firebase/auth';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { BaseButton } from 'react-native-gesture-handler';

// components
import { TextInput } from '@/components/Input';
import { TextBlock } from '../../Text';

// constants
import { Colors } from '@/constants/Colors';

// Hooks
import useDebounce from '@/hooks/useDebounce';

// Services
import { logout } from '@/services/authService';

// Utils
import { generateAvatarUrl, getNameFromEmail } from '@/utils';

const recentChats = [
  'Web Page Design - CSS/HTML/...',
  'AI Impact On UI/UX Design',
  'React Native Animation',
  'Navigation v6 Update',
  'State Management Options',
];


const CustomDrawerContent = ({ navigation }) => {
  const [searchTerm, setSearch] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [historyChats, setHistoryChats] = useState(recentChats);

  const user = getAuth().currentUser;
  const displayName = getNameFromEmail(user?.email || '');
  const avatarUri = user?.photoURL || generateAvatarUrl(displayName);

  useEffect(() => {
    if (debouncedSearchTerm) {
      setSearch(debouncedSearchTerm)
    }
  }, [debouncedSearchTerm]);


  // handle search
  const handleChangeSearch = useCallback((value: string) => {
    setSearch(value);
    setHistoryChats((prevState) => value ? prevState.filter((item) => item.toLowerCase().includes(value.toLowerCase())) : historyChats);
  }, []);

  // handle chat press and navigation
  const handleChatPress = useCallback((value: string) => {
    navigation.navigate('index', { title: value });
  }, [navigation]);

  // handle logout
  const handleLogout = useCallback(async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [{ text: 'Cancel' }, {
      text: 'Logout', onPress: async () => {
        router.replace('/welcome');
        await logout()
      }
    }]);
  }, [])

  const renderRecentItem = useCallback(({ item }) => (
    <BaseButton style={styles.chatItem} onPress={() => handleChatPress(item)}>
      <TextBlock numberOfLines={1} style={styles.chatText}>{item}</TextBlock>
    </BaseButton >
  ), [handleChatPress]);

  return (
    <DrawerContentScrollView contentContainerStyle={styles.container} >
      <View >
        <TextInput
          value={searchTerm}
          onChangeText={handleChangeSearch}
          placeholder="Search chat history..."
          leftIconType='material'
          leftIconName='search'
          variant='plain'
          inputContainerStyle={styles.searchInput}
        />
        <BaseButton style={styles.menuItem} aria-disabled enabled={false}>
          <Ionicons name="chatbubble-ellipses-outline" size={20} />
          <TextBlock type='defaultSemiBold'>Rak-GPT</TextBlock>
        </BaseButton>

        <BaseButton style={styles.menuItem} aria-disabled enabled={false}>
          <Feather name="sliders" size={20} />
          <TextBlock style={styles.menuLabel}>Customize Feed</TextBlock>
        </BaseButton>

        <BaseButton style={styles.menuItem} aria-disabled enabled={false}>
          <Feather name="globe" size={20} />
          <TextBlock style={styles.menuLabel}>Community</TextBlock>
        </BaseButton>

        <View style={styles.sectionDivider} />
        {
          historyChats.length > 0 && (
            <>
              <TextBlock style={styles.sectionTitle}>Recent Chats</TextBlock>
              <FlatList
                data={historyChats}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderRecentItem}
                scrollEnabled={false}
              />
            </>

          )
        }

      </View>
      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: avatarUri }}
            style={styles.avatar}
          />
          <View style={{ width: 180 }}>
            <TextBlock type='defaultSemiBold' numberOfLines={1} ellipsizeMode="tail"
            >{displayName}</TextBlock>
          </View>
        </View>
        <BaseButton style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="poweroff" type="antdesign" size={18} color="#FF4C4C" />
        </BaseButton>
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    width: 293,
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 20,
    borderColor: '#F7F7F8',
    borderWidth: 1,
    marginVertical: 20
  },
  searchInput: {
    marginLeft: -10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
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
    color: '#000',
  },
  footer: {
    marginTop: 30,
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
    width: 30,
    height: 30,
    borderRadius: 15,
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
    backgroundColor: '#FF612F14',
    borderColor: '#FF612F7A',
  },
});

export const DrawerContent = memo(CustomDrawerContent);
