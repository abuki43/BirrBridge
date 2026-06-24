import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.inner}>
          <View style={styles.iconWrap}>
            <Text style={styles.icon}>{'\uD83D\uDD12'}</Text>
          </View>
          <Text style={styles.title}>Secure your account</Text>
          <Text style={styles.body}>
            Use Face ID to log in faster and approve transactions
          </Text>

          <TouchableOpacity
            style={styles.enableBtn}
            onPress={handleEnable}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.enableBtnText}>
              {loading ? 'Setting up...' : 'Enable Face ID'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/(auth)/setup' as never)}>
            <Text style={styles.skip}>Skip</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#191c1f' },
  safe: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: { fontSize: 36 },
  title: {
    fontSize: 24,
    fontWeight: '500',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  body: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 8,
  },
  enableBtn: {
    height: 56,
    backgroundColor: '#494fdf',
    borderRadius: 9999,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  enableBtnText: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
  skip: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 16 },
});
