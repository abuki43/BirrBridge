import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/providers/auth-provider';

export default function HomeScreen() {
  const { user } = useAuth();
  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.inner}>
          <Text style={styles.greetingLabel}>{greeting}</Text>
          <Text style={styles.greetingName}>{user?.email ?? 'Welcome'}</Text>
          <Text style={styles.balance}>$0.00 USDC</Text>
          <Text style={styles.balanceFiat}>~ 0.00 ETB</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#191c1f' },
  safe: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  greetingLabel: { fontSize: 14, color: 'rgba(255,255,255,0.72)', marginBottom: 4 },
  greetingName: { fontSize: 16, fontWeight: '600', color: '#ffffff', marginBottom: 32 },
  balance: { fontSize: 48, fontWeight: '500', color: '#ffffff', letterSpacing: -0.48 },
  balanceFiat: { fontSize: 16, color: 'rgba(255,255,255,0.6)', marginTop: 8 },
});
