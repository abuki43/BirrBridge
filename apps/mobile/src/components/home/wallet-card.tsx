import { useState } from 'react';
import { YStack, XStack, Text } from 'tamagui';
import { Copy, Check } from 'lucide-react-native';
// import * as Clipboard from 'expo-clipboard';

function truncateAddress(addr: string): string {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function WalletCard({ address = '0x0000000000000000000000000000000000000000' }: { address?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    // await Clipboard.setStringAsync(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <XStack
      mx="$5"
      br="$5"
      bg="$bgSurface"
      p="$5"
      ai="center"
      jc="space-between"
      onPress={handleCopy}
      pressStyle={{ opacity: 0.9 }}
      cursor="pointer"
    >
      <YStack gap="$1">
        <Text fontSize={16} fontWeight="600" color="$color" fontFamily="$body">
          USDC Wallet
        </Text>
        <Text fontSize={14} fontFamily="$mono" color="$colorMuted">
          {truncateAddress(address)}
        </Text>
      </YStack>
      <YStack
        width={36}
        height={36}
        br="$3"
        bg="rgba(255,255,255,0.08)"
        jc="center"
        ai="center"
      >
        {copied ? (
          <Check size={18} color="#00a87e" strokeWidth={2.5} />
        ) : (
          <Copy size={18} color="rgba(255,255,255,0.6)" strokeWidth={1.5} />
        )}
      </YStack>
    </XStack>
  );
}
