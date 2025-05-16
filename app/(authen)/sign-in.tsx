import { CheckBox } from '@rneui/themed';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
// Components
import { BaseButton, TextBlock, TextInput } from '@/components';
import { Colors } from '@/constants/Colors';
import { ACCESS_TOKEN_KEY, USER_EMAIL_KEY } from '@/constants/Key';
import { MESSAGE, MESSAGE_ERROR } from '@/constants/Message';
import { signInWithEmail } from '@/services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon } from '@rneui/base';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';


// Constants

type FormData = {
  email: string;
  password: string;
  remember: boolean;
};

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

  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
    const { email, password } = data;
    setLoading(true);
    try {
      const userCredential = await signInWithEmail(email, password);
      const token = await userCredential.user.getIdToken();

      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_EMAIL_KEY, userCredential.user.email ?? '');

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: MESSAGE.LOGIN_SUCCESS,
      });
      router.replace('/home');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          <TextBlock type='title' h4>Welcome back to login!</TextBlock>
          <TextBlock type='subtitle' style={styles.subtitle}>
            Login to your account. Get easier than search engines results.
          </TextBlock>
          <View style={styles.formWrapper}>
            <Controller
              control={control}
              name="email"
              rules={{
                required: MESSAGE_ERROR.REQUIRED,
                pattern: { value: /^\S+@\S+\.\S+$/, message: MESSAGE_ERROR.INVALID_EMAIL }
              }}
              render={({ field: { onChange, value, onBlur } }) => (
                <TextInput
                  label="Email"
                  placeholder="Enter your email"
                  leftIconName='mail-outline'
                  leftIconType='ionicon'
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
                  message: MESSAGE_ERROR.INVALID_PASSWORD
                }
              }}
              render={({ field: { onChange, value, onBlur } }) => (
                <View style={{ position: 'relative' }}>
                  <TextInput
                    label="Password"
                    placeholder="Create strong password"
                    secureTextEntry={secureText}
                    leftIconName='lock-closed-outline'
                    leftIconType='ionicon'
                    rightIconName={secureText ? 'eye-off' : 'eye'}
                    rightIconType='feather'
                    value={value}
                    onBlur={onBlur}
                    onRightIconPress={() => setSecureText(!secureText)}
                    onChangeText={onChange}
                    errorMessage={errors.password?.message
                    }
                  />
                  <View style={styles.containerPassword}>
                    {<View style={styles.strongPassword}>
                      {control._formValues.password?.length >= 8 && (
                        <>
                          <Icon
                            name="check-circle-outline"
                            color={Colors.light.success}
                            size={15}
                          />
                          <TextBlock variant="success">{MESSAGE.STRONG_PASSWORD}</TextBlock>
                        </>
                      )}
                    </View>}
                    <TextBlock variant='warning' >Reset password</TextBlock>
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
            <BaseButton title="Login" onPress={handleSubmit(onSubmit)} size='lg'
              disabled={loading} />

            <TextBlock style={styles.orText}>Or sign in with using</TextBlock>

            <BaseButton
              title='Continue with Google'
              iconName='google'
              iconType="material-community"
              iconPosition="left"
              iconSize={18}
              containerStyle={{ width: '100%' }}
              size="lg"
              type='outline'
            // onPress={handleLoginWithGoogle}
            // disabled={loading || !request}
            />
            <TextBlock style={styles.signup}>
              Don’t have an account? <TextBlock type='defaultSemiBold' variant='primary' onPress={() => router.navigate('/sign-up')}>Create an account</TextBlock>
            </TextBlock>
          </View>
        </View>
      </ScrollView>
      {/* Full-screen Loading Overlay */}
      <Modal visible={loading} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
        </View>
      </Modal>
    </>

  );
}

const styles = StyleSheet.create({
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
    top: 80
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
    color: 'gray',
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
    color: 'gray',
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
