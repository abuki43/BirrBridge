import { useState, useCallback } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { YStack, XStack, Text, Input, Button } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/auth-provider';

export default function LoginScreen() {
  const router = useRouter();
  const { sendEmailOtp, sendSmsOtp } = useAuth();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEmail = input.includes('@');
  const isValid = input.trim().length > 0;

  const handleContinue = useCallback(async () => {
    if (!isValid || loading) return;
    setLoading(true);
    setError('');
    try {
      if (isEmail) {
        await sendEmailOtp(input.trim());
      } else {
        await sendSmsOtp(input.trim());
      }
      router.push('/(auth)/otp' as never);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [input, isEmail, isValid, loading, sendEmailOtp, sendSmsOtp, router]);

  return (
    <YStack f={1} bg="$bg">
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <YStack f={1} jc="center" px="$6" gap="$3">
            <Text fontSize={24} fontWeight="500" color="$color" fontFamily="$heading">
              Sign in to BirrBridge
            </Text>
            <Text fontSize={14} color="$colorSecondary" mb="$2" fontFamily="$body">
              Enter your email or phone
            </Text>

            <Input
              value={input}
              onChangeText={setInput}
              placeholder="you@example.com"
              placeholderTextColor="$colorSecondary"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              fontSize={16}
              color="$color"
              bg="$bgInput"
              height={56}
              br="$3"
              px="$4"
              borderWidth={0}
              borderBottomWidth={1}
              borderBottomColor="$borderColor"
              outlineStyle="none"
            />

            {error ? (
              <Text fontSize={14} color="$danger" textAlign="center" fontFamily="$body">
                {error}
              </Text>
            ) : null}

            <XStack ai="center" my="$4">
              <YStack f={1} height={1} bg="$borderColor" />
              <Text px="$3" fontSize={14} color="$colorMuted">or</Text>
              <YStack f={1} height={1} bg="$borderColor" />
            </XStack>

            <Button
              height={56}
              borderRadius={9999}
              borderWidth={1}
              borderColor="$borderColor"
              bg="transparent"
              color="$color"
              fontSize={16}
              fontWeight="600"
              fontFamily="$body"
              pressStyle={{ opacity: 0.8 }}
            >
              Continue with Google
            </Button>

            <Button
              height={56}
              borderRadius={9999}
              bg={isValid ? '$accent' : '$bgInput'}
              color={isValid ? 'white' : '$colorMuted'}
              fontSize={16}
              fontWeight="600"
              fontFamily="$body"
              mt="$4"
              onPress={handleContinue}
              disabled={!isValid || loading}
              pressStyle={{ opacity: 0.8, scale: 0.98 }}
            >
              {loading ? 'Sending code...' : 'Continue'}
            </Button>
          </YStack>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </YStack>
  );
}
