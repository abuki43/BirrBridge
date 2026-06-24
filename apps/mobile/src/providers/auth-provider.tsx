import {
  createContext,
  useContext,
  useCallback,
  useState,
  useMemo,
  useEffect,
  type ReactNode,
} from 'react';
import { usePrivy, useLoginWithEmail, useLoginWithSMS } from '@privy-io/expo';
import { setAuthToken } from '@/services/api';

export interface AppUser {
  id: string;
  email?: string;
  phone?: string;
}

export interface AuthState {
  token: string | null;
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isNewUser: boolean;
  sendEmailOtp: (email: string) => Promise<void>;
  sendSmsOtp: (phone: string) => Promise<void>;
  verifyCode: (code: string) => Promise<void>;
  signOut: () => Promise<void>;
  setNewUser: (val: boolean) => void;
  otpDestination: string | undefined;
  otpError: string | null;
}

const AuthContext = createContext<AuthState | null>(null);

function mapUser(pu: { id: string; email?: { address: string }; phone?: { number: string } }): AppUser {
  return { id: pu.id, email: pu.email?.address, phone: pu.phone?.number };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: privyUser, isReady, logout, getAccessToken } = usePrivy();
  const { sendCode: sendEmail, loginWithCode: verifyEmail } = useLoginWithEmail();
  const { sendCode: sendPhone, loginWithCode: verifyPhone } = useLoginWithSMS();

  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [otpDestination, setOtpDestination] = useState<string | undefined>();
  const [otpError, setOtpError] = useState<string | null>(null);

  useEffect(() => {
    if (isReady) {
      if (privyUser) {
        setUser(mapUser(privyUser as never));
        getAccessToken().then((t) => {
          if (t) {
            setAuthToken(t);
            setToken(t);
          }
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    }
  }, [isReady, privyUser, getAccessToken]);

  const sendEmailOtp = useCallback(
    async (email: string) => {
      setOtpError(null);
      try {
        await sendEmail({ email });
        setOtpDestination(email);
      } catch (e: unknown) {
        setOtpError(e instanceof Error ? e.message : 'Failed to send code');
        throw e;
      }
    },
    [sendEmail],
  );

  const sendSmsOtp = useCallback(
    async (phone: string) => {
      setOtpError(null);
      try {
        await sendPhone({ phone });
        setOtpDestination(phone);
      } catch (e: unknown) {
        setOtpError(e instanceof Error ? e.message : 'Failed to send code');
        throw e;
      }
    },
    [sendPhone],
  );

  const verifyCode = useCallback(
    async (code: string) => {
      setOtpError(null);
      try {
        const dest = otpDestination;
        if (!dest) throw new Error('No destination set');

        const isEmail = dest.includes('@');
        const result = isEmail
          ? await verifyEmail({ code, email: dest })
          : await verifyPhone({ code, phone: dest });

        if (result) {
          setUser(mapUser(result as never));
          const t = await getAccessToken();
          if (t) {
            setAuthToken(t);
            setToken(t);
          }
        }
      } catch (e: unknown) {
        setOtpError(e instanceof Error ? e.message : 'Incorrect code');
        throw e;
      }
    },
    [otpDestination, verifyEmail, verifyPhone, getAccessToken],
  );

  const signOut = useCallback(async () => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
    setIsNewUser(false);
    setOtpDestination(undefined);
    setOtpError(null);
    await logout();
  }, [logout]);

  const setNewUser = useCallback((val: boolean) => setIsNewUser(val), []);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: token !== null && user !== null,
      isLoading,
      isNewUser,
      sendEmailOtp,
      sendSmsOtp,
      verifyCode,
      signOut,
      setNewUser,
      otpDestination,
      otpError,
    }),
    [token, user, isLoading, isNewUser, sendEmailOtp, sendSmsOtp, verifyCode, signOut, setNewUser, otpDestination, otpError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
