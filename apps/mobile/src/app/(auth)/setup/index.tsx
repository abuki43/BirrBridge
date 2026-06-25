import { useState, useCallback, useEffect } from 'react';
import { ScrollView } from 'react-native';
import { YStack, Text, Input, Button, useTheme } from 'tamagui';
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
    <YStack height={4} bg="$borderColor" br="$2" mx="$6" mt="$2" mb="$6" overflow="hidden">
      <YStack height="100%" bg="$accent" br="$2" style={{ width: `${pct}%` }} />
    </YStack>
  );
}

function ShimmerPill({ width: w, height: h, delay = 0 }: { width: number; height: number; delay?: number }) {
  const theme = useTheme();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View
      style={[
        { width: w, height: h, borderRadius: 9999, backgroundColor: theme.bgSurface.val },
        style,
      ]}
    />
  );
}

function WalletCreationStep({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <YStack f={1} jc="center" ai="center" px="$8">
      <YStack w={100} h={100} br={50} bg="$bgSurface" jc="center" ai="center" mb="$6">
        <Text fontSize={48}>{'\uD83D\uDEE1\uFE0F'}</Text>
      </YStack>
      <Text fontSize={24} fontWeight="500" color="$color" textAlign="center" mb="$3" fontFamily="$heading">
        Your wallet is being created
      </Text>
      <Text fontSize={16} color="$colorSecondary" textAlign="center" mb="$8" px="$2" fontFamily="$body">
        BirrBridge creates a secure smart wallet for you on Base blockchain. No seed phrases. No gas
        fees. No crypto knowledge needed.
      </Text>
      <YStack gap="$3" ai="center" width="100%">
        <ShimmerPill width={200} height={16} />
        <ShimmerPill width={160} height={14} delay={200} />
        <ShimmerPill width={180} height={14} delay={400} />
      </YStack>
      <Text fontSize={14} color="$colorMuted" mt="$8" fontFamily="$body">
        Setting up your wallet...
      </Text>
    </YStack>
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
    <YStack f={1} bg="$bg">
      <SafeAreaView style={{ flex: 1 }}>
        <ProgressBar step={step} total={STEPS.length} />
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
          <YStack mt="$8" gap="$4">
            {step === 0 && (
              <YStack gap="$4">
                <Text fontSize={24} fontWeight="500" color="$color" mb="$2" fontFamily="$heading">
                  What's your name?
                </Text>
                <YStack height={56} br="$3" bg="$bgInput" jc="center" px="$4">
                  <Input
                    value={name}
                    onChangeText={setName}
                    placeholder="Full name"
                    placeholderTextColor="$colorMuted"
                    autoCapitalize="words"
                    fontSize={16}
                    color="$color"
                    bg="transparent"
                    borderWidth={0}
                    padding={0}
                    outlineStyle="none"
                  />
                </YStack>
                <Button
                  height={56}
                  borderRadius={9999}
                  bg={name.trim() ? '$accent' : '$bgInput'}
                  color="white"
                  fontSize={16}
                  fontWeight="600"
                  fontFamily="$body"
                  mt="$4"
                  disabled={!name.trim()}
                  opacity={name.trim() ? 1 : 0.4}
                  onPress={() => setStep(1)}
                  pressStyle={{ opacity: 0.8, scale: 0.98 }}
                >
                  Continue
                </Button>
              </YStack>
            )}

            {step === 1 && (
              <YStack gap="$4">
                <Text fontSize={24} fontWeight="500" color="$color" mb="$2" fontFamily="$heading">
                  Where are you based?
                </Text>
                <YStack height={48} br="$3" bg="$bgInput" jc="center" px="$4" mb="$2">
                  <Input
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search country"
                    placeholderTextColor="$colorMuted"
                    fontSize={16}
                    color="$color"
                    bg="transparent"
                    borderWidth={0}
                    padding={0}
                    outlineStyle="none"
                  />
                </YStack>
                {filtered.map((c) => (
                  <YStack
                    key={c.code}
                    height={56}
                    px="$4"
                    br="$3"
                    bg={country === c.code ? '$accentSoft' : 'transparent'}
                    flexDirection="row"
                    ai="center"
                    gap="$3"
                    onPress={() => { setCountry(c.code); setStep(2); }}
                    pressStyle={{ bg: '$accentSoft' }}
                  >
                    <Text fontSize={20}>{c.flag}</Text>
                    <Text fontSize={16} color="$color" fontFamily="$body">{c.name}</Text>
                  </YStack>
                ))}
              </YStack>
            )}
          </YStack>
        </ScrollView>
      </SafeAreaView>
    </YStack>
  );
}
