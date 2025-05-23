import { Icon } from '@rneui/themed';
import { Drawer } from 'expo-router/drawer';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

// Components
import { DrawerContent } from '@/components/ui/DrawerContent';

// Themes
import { BaseButton } from '@/components';
import { Colors, ROUTES } from '@/constants';
import { loadUserThreadsWithFirstMessage } from '@/db';
import { router } from 'expo-router';
import { getAuth } from 'firebase/auth';

type DrawerType = 'slide' | 'front' | 'back' | 'permanent';
interface RouteParams {
  title: string;
  isNew: boolean;
}

const DrawerNavigator = () => {
  const user = getAuth().currentUser;
  const [title, setTitle] = useState<string>('');

  useEffect(() => {
    if (!user?.email) return;

    (async () => {
      const list = await loadUserThreadsWithFirstMessage(user.email!);
      list?.length && setTitle(list[0].firstMessage?.text);
    })();
  }, [user?.email]);

  const renderDrawerContent = useCallback(
    (props) => <DrawerContent {...props} />,
    [],
  );
  const HeaderRight = useCallback(
    () =>
      user ? (
        <View style={styles.iconContainer}>
          <Icon
            name="dots-three-vertical"
            type="entypo"
            color="#000"
            size={20}
          />
        </View>
      ) : (
        <BaseButton
          title="Login"
          accessibilityLabel="Login"
          onPress={() => {
            router.replace(ROUTES.SIGN_IN);
          }}
          size="sm"
          containerStyle={styles.loginButton}
        />
      ),
    [user],
  );

  const screenOptions = useMemo(
    () => ({
      drawerStyle: styles.drawer,
      drawerType: 'slide' as DrawerType,
      swipeEdgeWidth: 293,
      overlayColor: 'transparent',
      swipeEnabled: false,
    }),
    [],
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <Drawer
        drawerContent={renderDrawerContent}
        screenOptions={screenOptions}
        backBehavior="initialRoute"
        initialRouteName="index"
      >
        <Drawer.Screen
          name="index"
          options={({ route }) => ({
            title:
              user?.email &&
              !(route.params as RouteParams).isNew &&
              !(route.params as RouteParams)?.title
                ? title
                : (route.params as RouteParams).title
                ? (route.params as RouteParams)?.title
                : 'rak-GPT',
            drawerLabel: 'Home',
            headerRight: () => <HeaderRight />,
            headerStyle: styles.header,
            headerTitleAlign: 'center',
            headerTitleStyle: styles.headerTitle,
          })}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  drawer: {
    width: 293,
    backgroundColor: Colors.light.background,
  },
  header: {
    backgroundColor: Colors.light.background,
    elevation: 0,
  },
  headerTitle: {
    textTransform: 'capitalize',
    width: '100%',
    fontSize: 16,
  },
  iconContainer: {
    marginRight: 10,
  },
  loginButton: {
    paddingRight: 10,
    width: 80,
  },
});

export default DrawerNavigator;
