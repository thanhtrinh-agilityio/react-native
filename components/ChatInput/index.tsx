import { FullTheme, Icon, Image, useTheme } from '@rneui/themed';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, Easing, StyleSheet, View } from 'react-native';

// Components
import { BaseButton, TextBlock, TextInput } from '@/components';
import { MESSAGE } from '@/constants/message';
import { SpeedDial } from '@rneui/base';

type ChatInputProps = {
  loading?: boolean;
  message?: string;
  threadId?: string;
  isUploadImage?: boolean;
  isUploadFile?: boolean;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onChangeMessage: (message: string) => void;
  onSend: (message: string, image?: string, filePdf?: any) => void;
  onStopStream?: () => void;
};

const makeStyles = (theme: FullTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: 10,
      width: '100%',
      paddingHorizontal: 5,
      paddingBottom: 10,
      paddingTop: 40,
      position: 'relative',
      borderRadius: 20,
      borderWidth: 0.1,
      borderColor: theme.colors.text,
    },
    iconButton: {
      width: 52,
      height: 52,
      borderRadius: 100,
      backgroundColor: theme.colors.primary,
    },
    sendButton: {
      width: 52,
      height: 52,
      borderRadius: 100,
    },
  });

const ChatInputComponent = ({
  loading = true,
  message = '',
  threadId = '',
  isUploadImage = true,
  isUploadFile = true,
  open,
  setOpen,
  onChangeMessage,
  onSend,
  onStopStream,
}: ChatInputProps) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const placeholderAnim = useRef(new Animated.Value(0)).current;
  const [image, setImage] = useState('');
  const [filePdf, setFilePdf] = useState<any>(null);
  const { theme } = useTheme();
  const styles = makeStyles(theme as FullTheme);

  useEffect(() => {
    if (threadId) {
      setFilePdf(null);
      setImage('');
    }
  }, [threadId]);

  useEffect(() => {
    let rotateAnimation: Animated.CompositeAnimation | null = null;

    if (loading) {
      rotateAnim.setValue(0);
      rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
      rotateAnimation.start();

      placeholderAnim.setValue(0);
      Animated.loop(
        Animated.timing(placeholderAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();
    } else {
      rotateAnim.stopAnimation(() => rotateAnim.setValue(0));
      placeholderAnim.stopAnimation(() => placeholderAnim.setValue(0));
    }

    return () => {
      rotateAnimation?.stop();
    };
  }, [loading]);

  const placeholderOpacity = placeholderAnim.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0.3, 1, 0.3],
  });

  const handleImageUpload = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos', 'livePhotos'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setFilePdf('');
      setOpen(false);
    }
  };

  const handleUploadFilePDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (!result.canceled) {
        setFilePdf(result.assets[0]!);
        setImage('');
        setOpen(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    }
  };

  const handleSend = useCallback(() => {
    onSend(message, image, filePdf!);
    setImage('');
    setFilePdf(null);
  }, [filePdf, image, message, onSend]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Remove uploaded file
  const handleRemoveFileUpload = useCallback(() => {
    setImage('');
    setFilePdf(null);
  }, []);

  const renderLoading = useCallback(() => {
    return (
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Icon
          name="hourglass-outline"
          type="ionicon"
          color={theme?.colors?.textInput}
        />
      </Animated.View>
    );
  }, [rotate]);

  return (
    <View style={styles.container}>
      {(image || filePdf) && (
        <View
          style={{
            position: 'absolute',
            right: 0,
            left: 0,
            alignItems: 'center',
          }}
        >
          {(image || filePdf) && (
            <Icon
              testID="remove-upload"
              accessibilityLabel="remove-upload"
              name="close"
              type="ionicon"
              color={theme?.colors?.text}
              onPress={handleRemoveFileUpload}
              size={14}
            />
          )}
          {image ? (
            <Image
              source={{ uri: image }}
              style={{ width: 30, height: 30, resizeMode: 'contain' }}
            />
          ) : filePdf ? (
            <>
              <TextBlock
                style={{
                  fontWeight: 'bold',
                  fontSize: 10,
                  color: theme.colors.text,
                }}
              >
                {filePdf.name}- {Math.round(parseInt(filePdf.size!) / 1024)} KB
              </TextBlock>
            </>
          ) : null}
        </View>
      )}

      <View
        style={{
          width: 52,
          height: 52,
          marginRight: 10,
          marginTop: 18,
        }}
      >
        <SpeedDial
          isOpen={open}
          icon={{ name: 'edit', color: '#fff' }}
          openIcon={{
            name: 'close',
            color: '#fff',
          }}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          color={theme?.colors?.primary}
          placement="left"
          disabled={loading}
          overlayColor="transparent"
        >
          <SpeedDial.Action
            icon={{
              name: 'image',
              color: '#fff',
            }}
            onPress={handleImageUpload}
            color={theme?.colors?.primary}
            style={{
              marginLeft: 15,
            }}
            disabled={!isUploadImage}
          />
          <SpeedDial.Action
            icon={{ name: 'picture-as-pdf', color: '#fff' }}
            onPress={handleUploadFilePDF}
            color={theme?.colors?.primary}
            style={{
              marginLeft: 15,
            }}
            disabled={!isUploadFile}
          />
        </SpeedDial>
      </View>

      {/* Input Field */}
      <View style={{ flex: 1 }}>
        <View style={{ position: 'relative' }}>
          {loading && (
            <Animated.Text
              style={{
                position: 'absolute',
                left: 32,
                top: 15,
                color: '#aaa',
                opacity: placeholderOpacity,
                zIndex: 1,
              }}
            >
              {MESSAGE.PLACE_HOLDER_CHAT_LOADING}
            </Animated.Text>
          )}
          <TextInput
            placeholder={!loading ? MESSAGE.PLACE_HOLDER_CHAT : ''}
            disabled={loading}
            value={message}
            editable={!loading}
            onChangeText={onChangeMessage}
            variant="plain"
            verticalAlign="middle"
            multiline
            testID="chat-input"
            numberOfLines={4}
            inputContainerStyle={{
              minHeight: 52,
            }}
            {...(loading && { rightIcon: renderLoading() })}
          />
        </View>
      </View>
      {/* Send Button */}
      {loading ? (
        <BaseButton
          icon={
            <Icon name="stop-outline" type="ionicon" color="white" size={18} />
          }
          buttonStyle={styles.sendButton}
          containerStyle={styles.sendButton}
          aria-label="stop-button"
          onPress={onStopStream}
        />
      ) : (
        <BaseButton
          onPress={handleSend}
          icon={<Icon name="send" type="feather" color="white" size={18} />}
          buttonStyle={styles.sendButton}
          containerStyle={styles.sendButton}
          aria-label="send-button"
          disabled={!message && !image && !filePdf}
        />
      )}
    </View>
  );
};

export const ChatInput = memo(ChatInputComponent);
