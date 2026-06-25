import { XStack, YStack, Text } from 'tamagui';
import { ArrowDown, ArrowUp, ArrowLeftRight } from 'lucide-react-native';

type TxType = 'deposit' | 'send' | 'receive' | 'swap';
type TxStatus = 'completed' | 'pending' | 'failed';

interface Transaction {
  type: TxType;
  title: string;
  subtitle: string;
  amount: string;
  positive: boolean;
  status?: TxStatus;
}

const TYPE_CONFIG: Record<TxType, { icon: typeof ArrowDown; color: string }> = {
  deposit: { icon: ArrowDown, color: '#00a87e' },
  send: { icon: ArrowUp, color: '#e61e49' },
  receive: { icon: ArrowDown, color: '#00a87e' },
  swap: { icon: ArrowLeftRight, color: '#494fdf' },
};

export default function RecentRow({ tx }: { tx: Transaction }) {
  const config = TYPE_CONFIG[tx.type];
  const Icon = config.icon;

  return (
    <XStack height={64} ai="center" gap="$3" px="$5">
      <YStack
        width={32}
        height={32}
        br={16}
        bg={`${config.color}20`}
        jc="center"
        ai="center"
      >
        <Icon size={16} color={config.color} strokeWidth={2.5} />
      </YStack>

      <YStack f={1} gap={2}>
        <Text fontSize={16} fontWeight="600" color="$color" fontFamily="$body">
          {tx.title}
        </Text>
        <XStack ai="center" gap="$2">
          <Text fontSize={14} color="$colorMuted" fontFamily="$body">
            {tx.subtitle}
          </Text>
          {tx.status === 'pending' && (
            <YStack
              px={4}
              py={2}
              br={9999}
              bg="rgba(236,126,0,0.15)"
            >
              <Text fontSize={11} fontWeight="600" color="#ec7e00" fontFamily="$body">
                Pending
              </Text>
            </YStack>
          )}
        </XStack>
      </YStack>

      <Text
        fontSize={16}
        fontWeight="600"
        color={tx.positive ? '#00a87e' : '$color'}
        fontFamily="$body"
      >
        {tx.positive ? '+' : '-'}{tx.amount}
      </Text>
    </XStack>
  );
}

export type { Transaction };
