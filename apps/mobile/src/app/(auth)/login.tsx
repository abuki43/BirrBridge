import { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
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
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.kav}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.inner}>
            <Text style={styles.title}>Sign in to BirrBridge</Text>
            <Text style={styles.subtitle}>Enter your email or phone</Text>

            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="you@example.com"
                placeholderTextColor="rgba(255,255,255,0.4)"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType={isEmail ? 'email-address' : 'phone-pad'}
              />
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.orWrap}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>or</Text>
              <View style={styles.orLine} />
            </View>

            <TouchableOpacity style={styles.googleBtn} activeOpacity={0.8}>
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.continueBtn, !isValid && styles.continueBtnDisabled]}
              disabled={!isValid || loading}
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <Text style={styles.continueBtnText}>
                {loading ? 'Sending code...' : 'Continue'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#191c1f' },
  safe: { flex: 1 },
  kav: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, gap: 12 },
  title: {
    fontSize: 24,
    fontWeight: '500',
    color: '#ffffff',
  },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.72)', marginBottom: 8 },
  inputWrap: {
    height: 56,
    borderRadius: 12,
    backgroundColor: '#2a2d30',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  input: { fontSize: 16, color: '#ffffff', padding: 0 },
  error: { fontSize: 14, color: '#e23b4a', textAlign: 'center' },
  orWrap: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  orLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  orText: { paddingHorizontal: 12, fontSize: 14, color: 'rgba(255,255,255,0.4)' },
  googleBtn: {
    height: 56,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleBtnText: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
  continueBtn: {
    height: 56,
    borderRadius: 9999,
    backgroundColor: '#494fdf',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  continueBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.08)', opacity: 0.4 },
  continueBtnText: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
});
