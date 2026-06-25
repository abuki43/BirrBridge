import { useState } from 'react';
import { YStack, Text } from 'tamagui';
import { Eye, EyeOff } from 'lucide-react-native';

function formatUsd(amount: number, hide: boolean): string {
  if (hide) return '****';
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatEtb(amount: number, hide: boolean): string {
  if (hide) return '****';
  return `~ ${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ETB`;
}

function splitDecimal(formatted: string): [string, string] {
  if (formatted.startsWith('$')) {
    const parts = formatted.slice(1).split('.');
    if (parts.length === 2) return [`$${parts[0]}`, `.${parts[1]}`];
    return [formatted.slice(1), ''];
  }
  return [formatted, ''];
}

export default function BalanceDisplay({
  usdcBalance = 0,
  etbEquivalent = 0,
}: {
  usdcBalance?: number;
  etbEquivalent?: number;
}) {
  const [hidden, setHidden] = useState(false);

  const formatted = formatUsd(usdcBalance, hidden);
  const [whole, decimal] = splitDecimal(formatted);

  return (
    <YStack ai="center" py="$4" px="$6">
      <YStack position="relative" ai="center">
        <YStack flexDirection="row" ai="flex-end">
          <Text
            fontSize={48}
            fontWeight="500"
            color="$color"
            fontFamily="$heading"
            letterSpacing={-0.48}
            lineHeight={52}
          >
            {whole}
            <Text
              fontSize={24}
              fontWeight="400"
              color="$colorMuted"
              fontFamily="$body"
              letterSpacing={0}
            >
              {decimal}
            </Text>
          </Text>
          <Text
            fontSize={24}
            fontWeight="400"
            color="$colorMuted"
            fontFamily="$body"
            ml="$1"
            mb="$1"
          >
            USDC
          </Text>
        </YStack>

        <YStack
          position="absolute"
          right={-32}
          top={6}
          width={24}
          height={24}
          jc="center"
          ai="center"
          onPress={() => setHidden(!hidden)}
          cursor="pointer"
        >
          {hidden ? (
            <EyeOff size={20} color="rgba(255,255,255,0.4)" strokeWidth={1.5} />
          ) : (
            <Eye size={20} color="rgba(255,255,255,0.4)" strokeWidth={1.5} />
          )}
        </YStack>
      </YStack>

      <Text fontSize={16} color="$colorSecondary" fontFamily="$body" mt="$3">
        {formatEtb(etbEquivalent, hidden)}
      </Text>
    </YStack>
  );
}
