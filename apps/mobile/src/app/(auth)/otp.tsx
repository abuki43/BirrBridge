import { useState, useRef, useCallback, useEffect } from 'react';
import { KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { YStack, Text, useTheme } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  withSequence,
  withTiming,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useAuth } from '@/providers/auth-provider';

const DIGITS = 6;
const COUNTDOWN = 45;

export default function OtpScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { verifyCode, otpDestination, isAuthenticated } = useAuth();
  const [digits, setDigits] = useState<string[]>(Array(DIGITS).fill(''));
  const [count, setCount] = useState(COUNTDOWN);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const refs = useRef<TextInput[]>([]);
  const shake = useSharedValue(0);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(auth)/biometrics' as never);
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const t = setInterval(() => setCount((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const shakeAnim = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  const doShake = useCallback(() => {
    shake.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
  }, [shake]);

  const submit = useCallback(
    async (code: string) => {
      setLoading(true);
      setError('');
      try {
        await verifyCode(code);
      } catch {
        doShake();
        setError('Incorrect code. Try again.');
        setDigits(Array(DIGITS).fill(''));
        refs.current[0]?.focus();
      } finally {
        setLoading(false);
      }
    },
    [verifyCode, doShake],
  );

  const handleChange = useCallback(
    (text: string, i: number) => {
      const d = text.replace(/[^0-9]/g, '').slice(-1);
      const next = [...digits];
      next[i] = d;
      setDigits(next);
      setError('');

      if (d && i < DIGITS - 1) refs.current[i + 1]?.focus();

      const code = next.join('');
      if (code.length === DIGITS) submit(code);
    },
    [digits, submit],
  );

  const handleKey = useCallback(
    (key: string, i: number) => {
      if (key === 'Backspace' && !digits[i] && i > 0) {
        const next = [...digits];
        next[i - 1] = '';
        setDigits(next);
        refs.current[i - 1]?.focus();
      }
    },
    [digits],
  );

  const masked = otpDestination
    ? otpDestination.replace(/(?<=.{3}).(?=.{2}@|\d{4})/g, '*')
    : '';

  return (
    <YStack f={1} bg="$bg">
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <YStack f={1} jc="center" ai="center" px="$6">
            <Text fontSize={24} fontWeight="500" color="$color" mb="$2" fontFamily="$heading">
              Check your inbox
            </Text>
            <Text fontSize={14} color="$colorSecondary" textAlign="center" mb="$8" fontFamily="$body">
              We sent a 6-digit code to {masked}
            </Text>

            <Animated.View style={[{ flexDirection: 'row', gap: 8 }, shakeAnim]}>
              {digits.map((d, i) => (
                <YStack
                  key={i}
                  width={48}
                  height={56}
                  br="$3"
                  bg="$bgInput"
                  jc="center"
                  ai="center"
                  borderWidth={error ? 1 : d ? 1 : 0}
                  borderColor={error ? '$danger' : d ? '$borderColor' : 'transparent'}
                >
                  <TextInput
                    ref={(r) => { refs.current[i] = r as TextInput; }}
                    style={{
                      width: '100%',
                      height: '100%',
                      textAlign: 'center',
                      fontSize: 24,
                      fontWeight: '600',
                      color: theme.color.val as string,
                      padding: 0,
                    }}
                    value={d}
                    onChangeText={(t) => handleChange(t, i)}
                    onKeyPress={({ nativeEvent }) => handleKey(nativeEvent.key, i)}
                    keyboardType="number-pad"
                    maxLength={1}
                    textContentType="oneTimeCode"
                    autoComplete="one-time-code"
                  />
                </YStack>
              ))}
            </Animated.View>

            {error ? (
              <Text fontSize={14} color="$danger" mt="$4" textAlign="center" fontFamily="$body">
                {error}
              </Text>
            ) : null}
            {loading ? (
              <Text fontSize={14} color="$colorMuted" mt="$6" fontFamily="$body">
                Verifying...
              </Text>
            ) : null}

            {count > 0 ? (
              <Text fontSize={14} color="$colorMuted" mt="$6" fontFamily="$body">
                Resend code in {count}s
              </Text>
            ) : (
              <Text
                fontSize={14}
                color="$accent"
                mt="$6"
                fontFamily="$body"
                onPress={() => {
                  setCount(COUNTDOWN);
                  setDigits(Array(DIGITS).fill(''));
                  setError('');
                  refs.current[0]?.focus();
                }}
              >
                Resend code
              </Text>
            )}
          </YStack>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </YStack>
  );
}
