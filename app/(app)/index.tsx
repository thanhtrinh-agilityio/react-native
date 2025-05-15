// app/index.tsx
import { Redirect, Stack } from 'expo-router';

export default function Index() {

  // Check if the user is authenticated
  const isAuthenticated = false;
  const isFirstLaunch = true;
  if (isFirstLaunch) {
    return <Redirect href="/welcome" />;
  }
  // Replace with your logic to check if it's the first launch
  if (!isAuthenticated) {
    // You can also use a custom redirect component if needed
    // return <Redirect to="/sign-in" />;
    return <Redirect href="/sign-in" />;
  }
  return <Stack />;
}
