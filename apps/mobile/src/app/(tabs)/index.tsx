import { useState, useCallback } from 'react';
import { RefreshControl } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import { Bell, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/auth-provider';
import BalanceDisplay from '@/components/home/balance-display';
import QuickActions from '@/components/home/quick-actions';
import WalletCard from '@/components/home/wallet-card';
import RecentRow from '@/components/home/recent-row';
import type { Transaction } from '@/components/home/recent-row';
import {
  SkeletonBalance,
  SkeletonActions,
  SkeletonWalletCard,
} from '@/components/ui/skeleton';

const MOCK_TRANSACTIONS: Transaction[] = [
  { type: 'deposit', title: 'Deposit', subtitle: 'Jun 24, 2026', amount: '100.00', positive: true, status: 'completed' },
  { type: 'send', title: 'To John', subtitle: 'Jun 23, 2026', amount: '50.00', positive: false, status: 'completed' },
  { type: 'swap', title: 'Swap to ETB', subtitle: 'Jun 22, 2026', amount: '99.00', positive: false, status: 'completed' },
  { type: 'send', title: 'To Sara', subtitle: 'Pending', amount: '25.00', positive: false, status: 'pending' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setRefreshing(false);
    setLoading(false);
  }, []);

  const displayName = user?.email?.split('@')[0] ?? 'Welcome';
  const nameCapitalized = displayName.charAt(0).toUpperCase() + displayName.slice(1);

  return (
    <YStack f={1} bg="$bg">
      <SafeAreaView style={{ flex: 1 }}>
        <YStack f={1}>
          {/* Header */}
          <XStack
            height={52}
            px="$6"
            ai="center"
            jc="space-between"
          >
            <YStack gap={2}>
              <Text fontSize={14} color="$colorSecondary" fontFamily="$body">
                {greeting}
              </Text>
              <Text fontSize={16} fontWeight="600" color="$color" fontFamily="$body">
                {nameCapitalized}
              </Text>
            </YStack>
            <XStack ai="center" gap="$3">
              <YStack
                width={24}
                height={24}
                jc="center"
                ai="center"
                onPress={() => {}}
                cursor="pointer"
              >
                <Bell size={22} color="rgba(255,255,255,0.8)" strokeWidth={1.5} />
              </YStack>
              <YStack
                width={32}
                height={32}
                br={16}
                bg="$accent"
                jc="center"
                ai="center"
                onPress={() => router.push('/(tabs)/profile' as never)}
                cursor="pointer"
              >
                <Text fontSize={14} fontWeight="600" color="white" fontFamily="$body">
                  {nameCapitalized.charAt(0)}
                </Text>
              </YStack>
            </XStack>
          </XStack>

          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#494fdf"
                colors={['#494fdf']}
              />
            }
          >
            {/* Balance */}
            {loading ? (
              <YStack ai="center" py="$4" gap="$3">
                <SkeletonBalance />
              </YStack>
            ) : (
              <BalanceDisplay usdcBalance={100.00} etbEquivalent={13100} />
            )}

            {/* Quick Actions */}
            {loading ? (
              <YStack px="$6" py="$4" gap="$3">
                <SkeletonActions />
              </YStack>
            ) : (
              <YStack py="$4">
                <QuickActions />
              </YStack>
            )}

            {/* Wallet Card */}
            {loading ? (
              <YStack mx="$5" p="$5" br="$5" bg="$bgSurface" gap="$2">
                <SkeletonWalletCard />
              </YStack>
            ) : (
              <WalletCard />
            )}

            {/* Recent Transactions */}
            <YStack mt="$6" mb="$12">
              {/* Section Header */}
              <XStack px="$5" mb="$2" ai="center" jc="space-between">
                <Text fontSize={16} fontWeight="600" color="$color" fontFamily="$body">
                  Recent Transactions
                </Text>
                <XStack
                  ai="center"
                  gap={4}
                  onPress={() => router.push('/(tabs)/activity' as never)}
                  cursor="pointer"
                >
                  <Text fontSize={14} color="$accent" fontFamily="$body">
                    See All
                  </Text>
                  <ChevronRight size={14} color="#494fdf" strokeWidth={2} />
                </XStack>
              </XStack>

              {MOCK_TRANSACTIONS.map((tx, i) => (
                <YStack key={i}>
                  <RecentRow tx={tx} />
                  {i < MOCK_TRANSACTIONS.length - 1 && (
                    <YStack mx="$5" height={1} bg="$borderColor" />
                  )}
                </YStack>
              ))}
            </YStack>
          </ScrollView>
        </YStack>
      </SafeAreaView>
    </YStack>
  );
}
