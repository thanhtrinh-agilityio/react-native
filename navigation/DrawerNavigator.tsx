import { FullTheme, Icon, useTheme } from '@rneui/themed';
import { Drawer } from 'expo-router/drawer';
import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

// Components
import { BaseButton } from '@/components';
import { DrawerContent } from '@/components/ui/DrawerContent';

// Constants & helpers
import { ROUTES } from '@/constants';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { router, useNavigation } from 'expo-router';
import { getAuth } from 'firebase/auth';

type DrawerType = 'slide' | 'front' | 'back' | 'permanent';
interface RouteParams {
  title: string;
  isNew: boolean;
}

type RootParamList = {
  [key: string]: any;
};

const makeStyles = (theme: FullTheme) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
    },
    drawer: {
      width: 293,
      backgroundColor: theme?.colors?.background,
    },
    header: {
      backgroundColor: theme?.colors?.background,
      elevation: 0,
    },
    headerTitle: {
      textTransform: 'capitalize',
      width: '100%',
      fontSize: 16,
      color: theme?.colors?.text,
    },
    headerLeftContainer: {
      marginLeft: 12,
      width: 40,
      padding: 6,
    },
    iconContainer: {
      marginRight: 10,
    },
    loginButton: {
      paddingRight: 10,
      width: 80,
    },
    headerBackgroundContainer: {
      backgroundColor: theme?.colors?.background,
    },
  });

const DrawerNavigator = () => {
  const { theme } = useTheme();
  const fullTheme = theme as FullTheme;
  const styles = useMemo(() => makeStyles(fullTheme), [fullTheme]);
  const user = getAuth().currentUser;

  const renderDrawerContent = useCallback(
    (props: any) => <DrawerContent {...props} />,
    [],
  );

  const HeaderRight = useCallback(
    () =>
      user ? (
        <View style={styles.iconContainer}>
          <Icon
            name="dots-three-vertical"
            type="entypo"
            color={theme?.colors?.text}
            size={20}
          />
        </View>
      ) : (
        <BaseButton
          title="Login"
          accessibilityLabel="Login"
          onPress={() => router.replace(ROUTES.SIGN_IN)}
          size="sm"
          containerStyle={styles.loginButton}
        />
      ),
    [user, styles, theme],
  );

  const HeaderLeft = () => {
    const navigation = useNavigation<DrawerNavigationProp<RootParamList>>();

    return (
      <View style={styles.headerLeftContainer}>
        <Icon
          name="menu"
          type="feather"
          color={
            theme?.mode === 'light'
              ? theme?.colors?.black
              : theme?.colors?.white
          }
          size={24}
          onPress={() => navigation.openDrawer()}
        />
      </View>
    );
  };

  const screenOptions = useMemo(
    () => ({
      drawerStyle: styles.drawer,
      drawerType: 'slide' as DrawerType,
      swipeEdgeWidth: 293,
      overlayColor: 'transparent',
      swipeEnabled: false,
    }),
    [styles.drawer],
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
          options={({ route }) => {
            const params = route.params as RouteParams;
            const computedTitle =
              user?.email && !params?.isNew && params?.title
                ? params.title
                : user?.email && !params?.isNew
                ? 'New Chat'
                : params?.isNew
                ? 'New Chat'
                : 'rak-GPT';

            return {
              title: computedTitle,

              drawerLabel: 'Home',
              headerLeft: () => <HeaderLeft />,
              headerRight: () => <HeaderRight />,
              headerStyle: styles.header,
              headerTitleAlign: 'center',
              headerTitleStyle: styles.headerTitle,
            };
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
};

export default DrawerNavigator;
