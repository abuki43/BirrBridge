import { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  withTiming,
  withRepeat,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import { useAuth } from '@/providers/auth-provider';

const COUNTRIES = [
  { code: 'ET', name: 'Ethiopia', flag: '\uD83C\uDDEA\uD83C\uDDF9' },
  { code: 'KE', name: 'Kenya', flag: '\uD83C\uDDF0\uD83C\uDDEA' },
  { code: 'NG', name: 'Nigeria', flag: '\uD83C\uDDF3\uD83C\uDDEC' },
  { code: 'GH', name: 'Ghana', flag: '\uD83C\uDDEC\uD83C\uDDED' },
  { code: 'ZA', name: 'South Africa', flag: '\uD83C\uDDFF\uD83C\uDDE6' },
  { code: 'TZ', name: 'Tanzania', flag: '\uD83C\uDDF9\uD83C\uDDFF' },
  { code: 'UG', name: 'Uganda', flag: '\uD83C\uDDFA\uD83C\uDDEC' },
  { code: 'RW', name: 'Rwanda', flag: '\uD83C\uDDF7\uD83C\uDDFC' },
];

const STEPS = ['Name', 'Country', 'Wallet'];

function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = (step / (total - 1)) * 100;
  return (
    <View style={styles.progressBg}>
      <View style={[styles.progressFill, { width: `${pct}%` }]} />
    </View>
  );
}

function ShimmerPill({ width, height, delay = 0 }: { width: number; height: number; delay?: number }) {
  const opacity = useSharedValue(0.3);
  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[styles.shimmer, { width, height }, style]} />;
}

function WalletCreationStep({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <View style={styles.center}>
      <View style={styles.walletIcon}>
        <Text style={{ fontSize: 48 }}>{'\uD83D\uDEE1\uFE0F'}</Text>
      </View>
      <Text style={styles.title}>Your wallet is being created</Text>
      <Text style={styles.body}>
        BirrBridge creates a secure smart wallet for you on Base blockchain. No seed phrases. No gas
        fees. No crypto knowledge needed.
      </Text>
      <View style={styles.shimmerWrap}>
        <ShimmerPill width={200} height={16} />
        <ShimmerPill width={160} height={14} delay={200} />
        <ShimmerPill width={180} height={14} delay={400} />
      </View>
      <Text style={styles.walletStatus}>Setting up your wallet...</Text>
    </View>
  );
}

export default function SetupScreen() {
  const router = useRouter();
  const { setNewUser } = useAuth();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [search, setSearch] = useState('');

  const filtered = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDone = useCallback(() => {
    setNewUser(false);
    router.replace('/(tabs)' as never);
  }, [setNewUser, router]);

  if (step === 2) return <WalletCreationStep onDone={handleDone} />;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ProgressBar step={step} total={STEPS.length} />
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollInner}>
          {step === 0 && (
            <View style={styles.stepWrap}>
              <Text style={styles.title}>What's your name?</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Full name"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  autoCapitalize="words"
                />
              </View>
              <TouchableOpacity
                style={[styles.continueBtn, !name.trim() && styles.continueBtnDisabled]}
                disabled={!name.trim()}
                onPress={() => setStep(1)}
                activeOpacity={0.8}
              >
                <Text style={styles.continueBtnText}>Continue</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 1 && (
            <View style={styles.stepWrap}>
              <Text style={styles.title}>Where are you based?</Text>
              <View style={[styles.inputWrap, styles.searchWrap]}>
                <TextInput
                  style={styles.input}
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search country"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                />
              </View>
              {filtered.map((c) => (
                <TouchableOpacity
                  key={c.code}
                  style={[
                    styles.countryRow,
                    country === c.code && styles.countryRowSelected,
                  ]}
                  onPress={() => { setCountry(c.code); setStep(2); }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.countryFlag}>{c.flag}</Text>
                  <Text style={styles.countryName}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#191c1f' },
  safe: { flex: 1 },
  progressBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 24,
  },
  progressFill: { height: '100%', backgroundColor: '#494fdf', borderRadius: 2 },
  scroll: { flex: 1, paddingHorizontal: 24 },
  scrollInner: { paddingBottom: 40 },
  stepWrap: { marginTop: 32, gap: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  title: {
    fontSize: 24,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 8,
  },
  body: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputWrap: {
    height: 56,
    borderRadius: 12,
    backgroundColor: '#2a2d30',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  searchWrap: { height: 48, marginBottom: 8 },
  input: { fontSize: 16, color: '#ffffff', padding: 0 },
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
  countryRow: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  countryRowSelected: { backgroundColor: 'rgba(73,79,223,0.12)' },
  countryFlag: { fontSize: 20, marginRight: 12 },
  countryName: { fontSize: 16, color: '#ffffff' },
  walletIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  shimmerWrap: { gap: 12, alignItems: 'center', width: '100%' },
  shimmer: { borderRadius: 9999, backgroundColor: 'rgba(255,255,255,0.08)' },
  walletStatus: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.48)',
    marginTop: 32,
  },
});
