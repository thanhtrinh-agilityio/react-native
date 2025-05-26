// app/index.tsx
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

// firebase config
import LoadingOverlay from '@/components/Loading';
import { ROUTES } from '@/constants';
import { firebaseAuth } from '@/firebaseConfig';
import { uuid } from 'expo-modules-core';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function Index() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      firebaseAuth,
      async (currentUser) => {
        setUser(currentUser);
        setInitializing(false);
      },
    );

    return () => unsubscribe();
  }, []);

  if (initializing) {
    return <LoadingOverlay visible={true} text="Loading..." />;
  }

  if (!user) {
    return <Redirect href={ROUTES.WELCOME} />;
  }

  return <Redirect href={`${ROUTES.HOME}?threadId=${uuid.v4().toString()}`} />;
}
