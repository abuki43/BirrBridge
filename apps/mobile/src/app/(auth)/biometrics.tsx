import { useState, useCallback } from 'react';
import { YStack, Text, Button } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';

export default function BiometricsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleEnable = useCallback(async () => {
    setLoading(true);
    try {
      const has = await LocalAuthentication.hasHardwareAsync();
      if (!has) {
        router.replace('/(auth)/setup' as never);
        return;
      }
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        router.replace('/(auth)/setup' as never);
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Secure your account',
        fallbackLabel: 'Use passcode',
      });
      if (result.success) {
        router.replace('/(auth)/setup' as never);
      } else {
        router.replace('/(auth)/setup' as never);
      }
    } catch {
      router.replace('/(auth)/setup' as never);
    } finally {
      setLoading(false);
    }
  }, [router]);

  return (
    <YStack f={1} bg="$bg">
      <SafeAreaView style={{ flex: 1 }}>
        <YStack f={1} jc="center" ai="center" px="$8">
          <YStack w={80} h={80} br={40} bg="$bgSurface" jc="center" ai="center" mb="$6">
            <Text fontSize={36}>{'\uD83D\uDD12'}</Text>
          </YStack>
          <Text
            fontSize={24}
            fontWeight="500"
            color="$color"
            textAlign="center"
            mb="$3"
            fontFamily="$heading"
          >
            Secure your account
          </Text>
          <Text
            fontSize={16}
            color="$colorSecondary"
            textAlign="center"
            mb="$10"
            px="$2"
            fontFamily="$body"
          >
            Use Face ID to log in faster and approve transactions
          </Text>

          <Button
            bg="$accent"
            color="white"
            height={56}
            borderRadius={9999}
            width="100%"
            fontSize={16}
            fontWeight="600"
            fontFamily="$body"
            onPress={handleEnable}
            disabled={loading}
            pressStyle={{ opacity: 0.8, scale: 0.98 }}
          >
            {loading ? 'Setting up...' : 'Enable Face ID'}
          </Button>

          <Text
            fontSize={14}
            color="$colorMuted"
            mt="$4"
            fontFamily="$body"
            onPress={() => router.replace('/(auth)/setup' as never)}
          >
            Skip
          </Text>
        </YStack>
      </SafeAreaView>
    </YStack>
  );
}
