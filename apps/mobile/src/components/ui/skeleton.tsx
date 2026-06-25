import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';

export function SkeletonPill({
  width,
  height,
  borderRadius = 9999,
  delay = 0,
}: {
  width: number;
  height: number;
  borderRadius?: number;
  delay?: number;
}) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    const start = withTiming(0.3, { duration: 0 });
    const high = withTiming(0.7, { duration: 800, easing: Easing.inOut(Easing.sin) });
    const low = withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.sin) });
    opacity.value = withRepeat(high, -1, true);
  }, [opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: 'rgba(255,255,255,0.06)' },
        style,
      ]}
    />
  );
}

export function SkeletonBalance() {
  return (
    <>
      <SkeletonPill width={120} height={16} borderRadius={8} />
      <SkeletonPill width={200} height={48} borderRadius={12} delay={100} />
      <SkeletonPill width={140} height={16} borderRadius={8} delay={200} />
    </>
  );
}

export function SkeletonActions() {
  return (
    <>
      <SkeletonPill width={100} height={48} borderRadius={9999} />
      <SkeletonPill width={100} height={48} borderRadius={9999} delay={100} />
      <SkeletonPill width={100} height={48} borderRadius={9999} delay={200} />
    </>
  );
}

export function SkeletonWalletCard() {
  return (
    <>
      <SkeletonPill width={80} height={16} borderRadius={8} />
      <SkeletonPill width={160} height={14} borderRadius={8} delay={150} />
    </>
  );
}

export function SkeletonRow() {
  return (
    <>
      <SkeletonPill width={44} height={44} borderRadius={22} />
      <SkeletonPill width={140} height={14} borderRadius={8} delay={100} />
    </>
  );
}
