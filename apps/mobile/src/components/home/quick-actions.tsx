import { ScrollView } from 'react-native';
import { XStack, YStack, Text } from 'tamagui';
import { ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const ACTIONS = [
  { label: 'Deposit', icon: ArrowDownToLine, route: '/(tabs)/deposit' as const },
  { label: 'Send', icon: ArrowUpFromLine, route: '/(tabs)/send' as const },
  { label: 'Swap', icon: ArrowLeftRight, route: '/(tabs)/swap' as const },
];

export default function QuickActions() {
  const router = useRouter();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 24, gap: 10 }}
    >
      {ACTIONS.map((action) => {
        const ActionIcon = action.icon;
        return (
          <YStack
            key={action.label}
            height={48}
            px="$4"
            br={9999}
            bg="rgba(255,255,255,0.08)"
            flexDirection="row"
            ai="center"
            gap="$2"
            onPress={() => router.push(action.route as never)}
            pressStyle={{ opacity: 0.8, scale: 0.96 }}
            cursor="pointer"
          >
            <ActionIcon size={18} color="white" strokeWidth={2} />
            <Text fontSize={14} fontWeight="600" color="white" fontFamily="$body">
              {action.label}
            </Text>
          </YStack>
        );
      })}
    </ScrollView>
  );
}
