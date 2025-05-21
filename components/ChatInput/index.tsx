import { Icon } from '@rneui/themed';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  View
} from 'react-native';


// Components
import { BaseButton, TextInput } from '@/components';
import { MESSAGE } from '@/constants/message';

type ChatInputProps = {
  loading?: boolean;
  message?: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  onSend: (message: string, image?: string) => void;
};

export const ChatInput = ({ loading = true, message = '', setMessage, onSend }: ChatInputProps) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const placeholderAnim = useRef(new Animated.Value(0)).current;
  const [image, setImage] = useState('');

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [rotateAnim]);

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(placeholderAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      placeholderAnim.stopAnimation();
    }
  }, [loading]);

  const placeholderOpacity = placeholderAnim.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0.3, 1, 0.3],
  });

  const handleImageUpload = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSend = useCallback(() => {
    onSend(message, image);
    setImage('');
  }, [image, message, onSend]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const renderLoading = useCallback(() => {
    return (
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Icon name="hourglass-outline" type="ionicon" />
      </Animated.View>
    );
  }, []);

  return (
    <View style={styles.container}>
      {/* Upload Image Button */}
      <BaseButton
        type="clear"
        onPress={handleImageUpload}
        icon={<Icon name="image" type="feather" color="#6366f1" />}
        buttonStyle={styles.iconButton}
        containerStyle={styles.iconButton}
      />

      {/* Input Field */}
      <View style={{ width: '80%' }}>
        <View style={{ position: 'relative' }}>
          {loading && !message && (
            <Animated.Text
              style={{
                position: 'absolute',
                left: 32,
                top: 14,
                color: '#aaa',
                opacity: placeholderOpacity,
                zIndex: 1,
              }}
            >
              {MESSAGE.PLACE_HOLDER_CHAT_LOADING}
            </Animated.Text>
          )}
          <TextInput
            placeholder={!loading ? MESSAGE.PLACE_HOLDER_CHAT : ""}
            disabled={loading}
            value={message}
            editable={!loading}
            onChangeText={setMessage}
            variant="plain"
            image={image}
            {...(loading && { rightIcon: renderLoading() })}
          />
        </View>
      </View>

      {/* Send Button */}
      {loading ? (
        <BaseButton
          onPress={handleSend}
          icon={<Icon name="stop-outline" type="ionicon" color="white" size={18} />}
          buttonStyle={styles.sendButton}
          containerStyle={styles.sendButton}
        />
      ) : (
        <BaseButton
          onPress={handleSend}
          icon={<Icon name="send" type="feather" color="white" size={18} />}
          buttonStyle={styles.sendButton}
          containerStyle={styles.sendButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'center',
    gap: 10,
    flex: 1,
    width: '100%',
    paddingHorizontal: 10,
  },
  iconButton: {
    width: 52,
    height: 52,
    borderRadius: 100,
  },
  sendButton: {
    width: 52,
    height: 52,
    borderRadius: 100,
  },
});
