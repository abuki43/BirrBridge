import { useEffect } from 'react';
import { YStack, Text, Button } from 'tamagui';
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
    <YStack f={1} bg="$bg">
      <SafeAreaView style={{ flex: 1 }}>
        <YStack f={1} jc="center" ai="center" px="$6">
          <Animated.View entering={FadeIn.duration(800)} style={{ alignItems: 'center', position: 'absolute', top: 120 }}>
            <Animated.View style={logoScale}>
              <Text fontSize={48} fontWeight="500" color="$color" fontFamily="$heading">
                BirrBridge
              </Text>
            </Animated.View>
            <Text fontSize={16} color="$colorSecondary" mt="$2" fontFamily="$body">
              Bridge between USDC and Birr
            </Text>
          </Animated.View>

          <Animated.View entering={FadeIn.duration(600).delay(1200)} style={{ alignItems: 'center', width: '100%' }}>
            <Text fontSize={48}>{'\u24C3'}</Text>
            <Text
              fontSize={40}
              fontWeight="500"
              color="$color"
              textAlign="center"
              mt="$4"
              letterSpacing={-0.4}
              fontFamily="$heading"
            >
              Welcome to BirrBridge
            </Text>
            <Text
              fontSize={16}
              color="$colorSecondary"
              textAlign="center"
              mt="$6"
              px="$4"
              fontFamily="$body"
            >
              Hold USDC. Spend in Birr. No crypto knowledge needed.
            </Text>

            <YStack mt="$9" width="100%" px="$6">
              <Button
                height={56}
                bg="$accent"
                color="white"
                fontSize={16}
                fontWeight="600"
                borderRadius={9999}
                fontFamily="$body"
                onPress={() => router.push('/(auth)/login' as never)}
                pressStyle={{ opacity: 0.8, scale: 0.98 }}
              >
                Get Started
              </Button>

              <Button
                mt="$4"
                bg="transparent"
                color="$colorSecondary"
                fontSize={14}
                fontFamily="$body"
                onPress={() => router.push('/(auth)/login' as never)}
                pressStyle={{ opacity: 0.6 }}
              >
                I already have an account
              </Button>
            </YStack>
          </Animated.View>
        </YStack>
      </SafeAreaView>
    </YStack>
  );
}
