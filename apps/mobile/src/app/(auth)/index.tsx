import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  useAnimatedStyle,
  FadeIn,
} from 'react-native-reanimated';

export default function WelcomeScreen() {
  const router = useRouter();
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.02, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [pulse]);

  const logoScale = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Animated.View entering={FadeIn.duration(800)} style={styles.logoWrap}>
            <Animated.View style={logoScale}>
              <Text style={styles.logo}>BirrBridge</Text>
            </Animated.View>
            <Text style={styles.tagline}>Bridge between USDC and Birr</Text>
          </Animated.View>

          <Animated.View entering={FadeIn.duration(600).delay(1200)} style={styles.heroWrap}>
            <Text style={styles.heroIcon}>{'\u24C3'}</Text>
            <Text style={styles.headline}>Welcome to BirrBridge</Text>
            <Text style={styles.subtitle}>
              Hold USDC. Spend in Birr. No crypto knowledge needed.
            </Text>

            <View style={styles.ctaWrap}>
              <TouchableOpacity
                style={styles.primaryCta}
                onPress={() => router.push('/(auth)/login' as never)}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryCtaText}>Get Started</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/(auth)/login' as never)}
              >
                <Text style={styles.secondaryLink}>I already have an account</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#191c1f' },
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  logoWrap: { alignItems: 'center', position: 'absolute', top: 120 },
  logo: { fontSize: 48, fontWeight: '500', color: '#ffffff' },
  tagline: { fontSize: 16, color: 'rgba(255,255,255,0.72)', marginTop: 8 },
  heroWrap: { alignItems: 'center', width: '100%' },
  heroIcon: { fontSize: 48 },
  headline: {
    fontSize: 40,
    fontWeight: '500',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 16,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 16,
  },
  ctaWrap: { marginTop: 48, width: '100%', paddingHorizontal: 24 },
  primaryCta: {
    height: 56,
    backgroundColor: '#494fdf',
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryCtaText: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
  secondaryLink: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 16,
  },
});
