import { YStack, Text } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SwapScreen() {
  return (
    <YStack f={1} bg="$bg">
      <SafeAreaView style={{ flex: 1 }}>
        <YStack f={1} jc="center" ai="center" px="$6">
          <Text fontSize={24} fontWeight="500" color="$color" fontFamily="$heading" mb="$2">
            Swap
          </Text>
          <Text fontSize={16} color="$colorSecondary" textAlign="center" fontFamily="$body">
            Swap USDC to ETB
          </Text>
        </YStack>
      </SafeAreaView>
    </YStack>
  );
}
