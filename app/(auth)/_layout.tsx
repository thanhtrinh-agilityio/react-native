import { Stack } from 'expo-router'
import { PropsWithChildren } from 'react'

const AuthLayout = ({ children, ...rest }: PropsWithChildren) => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
      {...rest}
    >
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  )
}
export default AuthLayout





