import { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
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
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.kav}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.inner}>
            <Text style={styles.title}>Check your inbox</Text>
            <Text style={styles.sub}>We sent a 6-digit code to {masked}</Text>

            <Animated.View style={[styles.row, shakeAnim]}>
              {digits.map((d, i) => (
                <View
                  key={i}
                  style={[styles.box, d ? styles.boxFilled : null, error ? styles.boxError : null]}
                >
                  <TextInput
                    ref={(r) => { refs.current[i] = r as TextInput; }}
                    style={styles.boxInput}
                    value={d}
                    onChangeText={(t) => handleChange(t, i)}
                    onKeyPress={({ nativeEvent }) => handleKey(nativeEvent.key, i)}
                    keyboardType="number-pad"
                    maxLength={1}
                    textContentType="oneTimeCode"
                    autoComplete="one-time-code"
                  />
                </View>
              ))}
            </Animated.View>

            {error ? <Text style={styles.error}>{error}</Text> : null}
            {loading ? <Text style={styles.loading}>Verifying...</Text> : null}

            {count > 0 ? (
              <Text style={styles.timer}>Resend code in {count}s</Text>
            ) : (
              <TouchableOpacityText
                label="Resend code"
                onPress={() => {
                  setCount(COUNTDOWN);
                  setDigits(Array(DIGITS).fill(''));
                  setError('');
                  refs.current[0]?.focus();
                }}
              />
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function TouchableOpacityText({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Text style={styles.resend} onPress={onPress}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#191c1f' },
  safe: { flex: 1 },
  kav: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  title: { fontSize: 24, fontWeight: '500', color: '#ffffff', marginBottom: 8 },
  sub: { fontSize: 14, color: 'rgba(255,255,255,0.72)', textAlign: 'center', marginBottom: 32 },
  row: { flexDirection: 'row', gap: 8 },
  box: {
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#2a2d30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxFilled: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  boxError: { borderWidth: 1, borderColor: '#e23b4a' },
  boxInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
  },
  error: { fontSize: 14, color: '#e23b4a', marginTop: 16, textAlign: 'center' },
  loading: { fontSize: 14, color: 'rgba(255,255,255,0.48)', marginTop: 24 },
  timer: { fontSize: 14, color: 'rgba(255,255,255,0.48)', marginTop: 24 },
  resend: { fontSize: 14, color: '#494fdf', marginTop: 24 },
});
