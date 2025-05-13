import { Icon } from '@rneui/themed';
import { Drawer } from 'expo-router/drawer';
import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

// Components
import { DrawerContent } from '@/components/ui/DrawerContent';

// Themes
import { theme } from '@/theme';

type DrawerType = 'slide' | 'front' | 'back' | 'permanent';
interface RouteParams {
  title: string;
}

const DrawerNavigator = () => {
  const renderDrawerContent = useCallback((props) => <DrawerContent {...props} />, []);

  const HeaderRight = useCallback(() => (
    <View style={styles.iconContainer}>
      <Icon
        name="dots-three-vertical"
        type="entypo"
        color="#000"
        size={20}
      />
    </View>
  ), []);


  const screenOptions = useMemo(() => ({
    drawerStyle: styles.drawer,
    drawerType: 'slide' as DrawerType,
    swipeEdgeWidth: 293,
    overlayColor: 'transparent',
    swipeEnabled: false
  }), []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <Drawer
        initialRouteName="index"
        drawerContent={renderDrawerContent}
        screenOptions={screenOptions}
      >
        <Drawer.Screen
          name="index"
          options={({ route }) => ({
            title: (route.params as RouteParams)?.title || 'rak-GPT',
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
    backgroundColor: theme.lightColors?.background,
  },
  header: {
    backgroundColor: theme.lightColors?.background,
    borderBottomWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTitle: {
    textTransform: 'capitalize',
    width: '100%',
    fontSize: 16,
  },
  iconContainer: {
    marginRight: 10,
  },
});

export default DrawerNavigator;
