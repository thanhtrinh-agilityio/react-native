import {
  logout,
  signInWithEmail,
  signUpWithEmail,
  useGoogleSignIn,
} from '@/services/authService';
import { renderHook } from '@testing-library/react-native';
import * as GoogleProvider from 'expo-auth-session/providers/google';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

import { firebaseAuth } from '@/firebaseConfig';
import { MOCK_USER } from '@/mocks';

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
}));

jest.mock('@/firebaseConfig', () => ({
  firebaseAuth: {
    signOut: jest.fn(),
  },
}));

jest.mock('expo-auth-session/providers/google', () => ({
  useAuthRequest: jest.fn(),
}));

jest.mock('expo-auth-session', () => ({
  makeRedirectUri: jest.fn().mockReturnValue('myapp://redirect'),
}));

describe('Auth helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signUpWithEmail', () => {
    it('calls firebase createUserWithEmailAndPassword with correct params and returns the user', async () => {
      const mockUser = { uid: '123', email: MOCK_USER.email };
      (createUserWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
        user: mockUser,
      });

      const user = await signUpWithEmail(MOCK_USER.email, MOCK_USER.password);

      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        firebaseAuth,
        MOCK_USER.email,
        MOCK_USER.password,
      );
      expect(user).toEqual(mockUser);
    });

    it('propagates errors', async () => {
      const error = new Error('signup‑failed');
      (createUserWithEmailAndPassword as jest.Mock).mockRejectedValueOnce(
        error,
      );

      await expect(
        signUpWithEmail(MOCK_USER.email, MOCK_USER.password),
      ).rejects.toThrow(error);
    });
  });

  describe('signInWithEmail', () => {
    it('calls firebase signInWithEmailAndPassword with correct params and returns the credential', async () => {
      const mockCredential = { user: { uid: '123', email: MOCK_USER.email } };
      (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce(
        mockCredential,
      );

      const credential = await signInWithEmail(
        MOCK_USER.email,
        MOCK_USER.password,
      );

      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        firebaseAuth,
        MOCK_USER.email,
        MOCK_USER.password,
      );
      expect(credential).toEqual(mockCredential);
    });

    it('propagates errors', async () => {
      const error = new Error('signin‑failed');
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce(error);

      await expect(
        signInWithEmail(MOCK_USER.email, MOCK_USER.password),
      ).rejects.toThrow(error);
    });
  });

  describe('logout', () => {
    it('calls firebaseAuth.signOut', async () => {
      const signOutMock = (
        firebaseAuth.signOut as jest.Mock
      ).mockResolvedValueOnce(undefined);

      await logout();

      expect(signOutMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('useGoogleSignIn', () => {
    it('returns the tuple from Google.useAuthRequest', () => {
      const tuple = [
        { request: true },
        { response: null },
        jest.fn(),
      ] as unknown as ReturnType<typeof GoogleProvider.useAuthRequest>;
      (GoogleProvider.useAuthRequest as jest.Mock).mockReturnValueOnce(tuple);

      const { result } = renderHook(() => useGoogleSignIn());

      expect(result.current).toEqual({
        request: tuple[0],
        response: tuple[1],
        promptAsync: tuple[2],
      });
    });
  });
});
