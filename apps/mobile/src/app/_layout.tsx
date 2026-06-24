import { useEffect, type ReactNode } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { PrivyProvider } from '@privy-io/expo';
import { QueryProvider } from '@/providers/query-provider';
import { AuthProvider, useAuth } from '@/providers/auth-provider';

function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const seg = segments as string[];
    const inAuth = seg[0] === '(auth)';
    const inSetup = seg[1] === 'setup' || seg[2] === 'setup';

    if (!isAuthenticated && !inAuth) {
      router.replace('/(auth)' as never);
    } else if (isAuthenticated && inAuth && !inSetup) {
      router.replace('/(tabs)' as never);
    }
  }, [isAuthenticated, isLoading, segments, router]);

  return <>{children}</>;
}

function InnerLayout({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider appId={process.env.EXPO_PUBLIC_PRIVY_APP_ID ?? ''}>
      <AuthProvider>
        <AuthGuard>{children}</AuthGuard>
      </AuthProvider>
    </PrivyProvider>
  );
}

export default function RootLayout() {
  return (
    <QueryProvider>
      <InnerLayout>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </InnerLayout>
    </QueryProvider>
  );
}
