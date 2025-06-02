import { Icon } from '@rneui/base';
import { CheckBox, FullTheme, useTheme } from '@rneui/themed';
import * as AuthSession from 'expo-auth-session';
import { uuid } from 'expo-modules-core';
import { router } from 'expo-router';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';

import Toast from 'react-native-toast-message';

// Components
import { BaseButton, TextBlock, TextInput } from '@/components';

// Constants
import {
  Colors,
  EXPO_ANDROID_CLIENT_ID,
  MESSAGE,
  MESSAGE_ERROR,
  ROUTES,
} from '@/constants';

// Services
import { useLoading } from '@/LoadingContext';
import { firebaseAuth } from '@/firebaseConfig';
import { signInWithEmail, useGoogleSignIn } from '@/services/authService';

type FormData = {
  email: string;
  password: string;
  remember: boolean;
};

const makeStyles = (theme: FullTheme) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingTop: 100,
      gap: 10,
    },
    title: {
      marginBottom: 8,
    },
    subtitle: {
      marginTop: 8,
      marginBottom: 24,
    },
    formWrapper: {
      flex: 1,
      gap: 8,
    },
    containerPassword: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      position: 'absolute',
      top: 80,
    },
    strongPassword: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: 12,
      marginLeft: 4,
      height: 20,
    },
    resetPassword: {
      color: 'tomato',
    },
    checkbox: {
      backgroundColor: 'transparent',
      borderWidth: 0,
      paddingLeft: 0,
      marginLeft: 4,
      alignItems: 'flex-start',
    },
    button: {
      marginVertical: 16,
    },
    orText: {
      textAlign: 'center',
      marginBottom: 10,
      color: theme?.colors?.text,
    },
    googleButton: {
      borderColor: '#DB4437',
    },
    googleText: {
      marginLeft: 8,
    },
    googleIcon: {
      marginRight: 8,
    },
    signup: {
      marginTop: 16,
      textAlign: 'center',
      color: theme?.colors?.text,
    },
    link: {
      fontWeight: 'bold',
    },
    checkboxText: {
      fontWeight: '300',
    },
    loadingOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.25)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    containerButtonLogin: {
      flex: 1,
      alignContent: 'center',
      justifyContent: 'flex-end',
      marginBottom: 40,
      gap: 16,
    },
  });

export default function LoginScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  });
  const { theme } = useTheme();
  const fullTheme = theme as FullTheme;
  const styles = makeStyles(fullTheme);
  const { request, promptAsync } = useGoogleSignIn();
  const discovery = AuthSession.useAutoDiscovery('https://accounts.google.com');
  const [secureText, setSecureText] = useState(true);
  const { isLoading, setLoading } = useLoading();

  const onSubmit = async (data: FormData) => {
    const { email, password } = data;
    setLoading(true);
    try {
      await signInWithEmail(email, password);

      router.replace({
        pathname: ROUTES.HOME,
        params: { threadId: uuid.v4().toString() },
      });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: MESSAGE.LOGIN_SUCCESS,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2:
          error instanceof Error ? error.message : 'An unknown error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginWithGoogle = async () => {
    if (!request) return;
    try {
      const res = await promptAsync();
      if (res.type === 'success' && res.params.code) {
        const { code } = res.params;
        setLoading(true);

        const tokens = await AuthSession.exchangeCodeAsync(
          {
            clientId: EXPO_ANDROID_CLIENT_ID,
            code,
            redirectUri: AuthSession.makeRedirectUri({
              scheme: 'com.thanh.trinhagilityo.rakgpt',
            }),
            extraParams: {
              code_verifier: request.codeVerifier || '',
            },
          },
          discovery!,
        );

        const credential = GoogleAuthProvider.credential(tokens?.idToken);
        const result = await signInWithCredential(firebaseAuth, credential);
        if (result?.user) {
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: MESSAGE.LOGIN_SUCCESS_GOOGLE,
          });

          router.replace({
            pathname: ROUTES.HOME,
            params: { threadId: uuid.v4().toString() },
          });
        }
        setLoading(false);
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err instanceof Error ? err.message : 'An unknown error occurred',
      });
      setLoading(false);
    }
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          <TextBlock type="title" h4>
            Welcome back to login!
          </TextBlock>
          <TextBlock type="subtitle" style={styles.subtitle}>
            Login to your account. Get easier than search engines results.
          </TextBlock>
          <View style={styles.formWrapper}>
            <Controller
              control={control}
              name="email"
              rules={{
                required: MESSAGE_ERROR.REQUIRED,
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: MESSAGE_ERROR.INVALID_EMAIL,
                },
              }}
              render={({ field: { onChange, value, onBlur } }) => (
                <TextInput
                  label="Email"
                  placeholder="Enter your email"
                  leftIconName="mail-outline"
                  leftIconType="ionicon"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  errorMessage={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              rules={{
                required: MESSAGE_ERROR.REQUIRED,
                minLength: {
                  value: 8,
                  message: MESSAGE_ERROR.INVALID_PASSWORD,
                },
              }}
              render={({ field: { onChange, value, onBlur } }) => (
                <View style={{ position: 'relative' }}>
                  <TextInput
                    label="Password"
                    placeholder="Create strong password"
                    secureTextEntry={secureText}
                    leftIconName="lock-closed-outline"
                    leftIconType="ionicon"
                    rightIconName={secureText ? 'eye-off' : 'eye'}
                    rightIconType="feather"
                    value={value}
                    onBlur={onBlur}
                    onRightIconPress={() => setSecureText(!secureText)}
                    onChangeText={onChange}
                    errorMessage={errors.password?.message}
                  />
                  <View style={styles.containerPassword}>
                    {
                      <View style={styles.strongPassword}>
                        {control._formValues.password?.length >= 8 && (
                          <>
                            <Icon
                              name="check-circle-outline"
                              color={Colors.light.success}
                              size={15}
                            />
                            <TextBlock variant="success">
                              {MESSAGE.STRONG_PASSWORD}
                            </TextBlock>
                          </>
                        )}
                      </View>
                    }
                    <TextBlock variant="warning" disabled>
                      Reset password
                    </TextBlock>
                  </View>
                </View>
              )}
            />

            <Controller
              control={control}
              name="remember"
              render={({ field: { onChange, value } }) => (
                <CheckBox
                  title="Remember login info"
                  checked={value}
                  iconType="material-community"
                  checkedIcon="checkbox-outline"
                  uncheckedIcon="checkbox-blank-outline"
                  onPress={() => onChange(!value)}
                  containerStyle={styles.checkbox}
                  textStyle={styles.checkboxText}
                />
              )}
            />
          </View>

          <View style={styles.containerButtonLogin}>
            <BaseButton
              title="Login"
              onPress={handleSubmit(onSubmit)}
              size="lg"
              disabled={isLoading}
            />

            <TextBlock style={styles.orText}>Or sign in with using</TextBlock>

            <BaseButton
              title="Continue with Google"
              iconName="google"
              iconType="material-community"
              iconPosition="left"
              iconSize={18}
              containerStyle={{ width: '100%' }}
              size="lg"
              type="outline"
              onPress={handleLoginWithGoogle}
              disabled={isLoading || !request}
            />
            <TextBlock style={styles.signup}>
              Don’t have an account?{' '}
              <TextBlock
                type="defaultSemiBold"
                variant="primary"
                onPress={() => router.navigate(ROUTES.SIGN_UP)}
              >
                Create an account
              </TextBlock>
            </TextBlock>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
