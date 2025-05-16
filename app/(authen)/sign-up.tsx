import { CheckBox, Icon } from '@rneui/themed';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
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

// Constants
import { Colors } from '@/constants/Colors';
import { MESSAGE, MESSAGE_ERROR } from '@/constants/Message';

// Services
import { signUpWithEmail } from '@/services/authService';
import Toast from 'react-native-toast-message';

type FormData = {
  email: string;
  password: string;
  savePassword: boolean;
};

const SignUpScreen = () => {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      email: '',
      password: '',
      savePassword: false,
    },
    mode: 'onBlur',
  });

  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);

  // handle submit form
  const handleSubmitForm = async (data: FormData) => {
    const { email, password } = data;
    setLoading(true);
    try {
      await signUpWithEmail(email, password);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: MESSAGE.CREATED_ACCOUNT_SUCCESS,
      });
      router.replace('/sign-in');
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

  // handle navigate to login screen
  const handleNavigateLogin = useCallback(() => {
    router.replace('/sign-in');
  }, []);

  return (
    <>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          <TextBlock type='title' h4>Create an account</TextBlock>
          <TextBlock type='subtitle' style={styles.subtitle}>
            Sign for a free account. Get easier than search engines results.
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
                <>
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
                    errorMessage={
                      errors.password?.message ? errors.password.message :
                        (control._formValues.password || '').length >= 8 && (
                          <View style={styles.strongPassword}>
                            <Icon name='check-circle-outline' color={Colors.light.success} size={15} />
                            <TextBlock variant='success'>{MESSAGE.STRONG_PASSWORD}</TextBlock>
                          </View>
                        )
                    }
                  />
                </>
              )}
            />

            <Controller
              control={control}
              name="savePassword"
              render={({ field: { onChange, value } }) => (
                <CheckBox
                  title="Save password"
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
              title="Create Account"
              onPress={handleSubmit(handleSubmitForm)}
              size='lg'
              disabled={loading}
            />

            <View style={styles.loginLink}>
              <TextBlock>Already have an account?</TextBlock>
              <TextBlock type='primary' onPress={handleNavigateLogin}>Login</TextBlock>
            </View>
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
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 100,
    gap: 10,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 24,
  },
  formWrapper: {
    flex: 1,
    gap: 12,
  },
  strongPassword: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
    marginLeft: 4,
    height: 20,
  },
  checkbox: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingLeft: 0,
    marginLeft: 4,
    alignItems: 'flex-start',
  },
  checkboxText: {
    fontWeight: '300',
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 20,
  },
  containerButtonLogin: {
    flex: 1,
    alignContent: 'center',
    justifyContent: 'flex-end',
    marginBottom: 40,
    gap: 16,
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SignUpScreen;
