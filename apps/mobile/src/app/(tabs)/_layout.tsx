import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { House, History, ArrowLeftRight, UserCircle } from 'lucide-react-native';

const TABS = [
  { name: 'index' as const, label: 'Home', Icon: House },
  { name: 'activity' as const, label: 'Activity', Icon: History },
  { name: 'swap' as const, label: 'Swap', Icon: ArrowLeftRight },
  { name: 'profile' as const, label: 'Profile', Icon: UserCircle },
];

function CustomTabBar({ state, navigation }: { state: any; navigation: any }) {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const tabBg = isDark ? 'rgba(25,28,31,0.96)' : 'rgba(255,255,255,0.92)';
  const mutedColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';

  return (
    <YStack position="absolute" bottom={0} left={12} right={12} pointerEvents="box-none">
      <XStack
        height={64}
        br={28}
        bg={tabBg}
        borderWidth={1}
        borderColor="$borderColor"
        px="$2"
        ai="center"
        mb={insets.bottom > 0 ? insets.bottom - 4 : 8}
        shadowColor={isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.08)'}
        shadowOffset={{ width: 0, height: 4 }}
        shadowOpacity={isDark ? 0.4 : 0.3}
        shadowRadius={12}
        elevation={8}
      >
        {TABS.map((tab, index) => {
          const focused = state.index === index;
          const TabIcon = tab.Icon;
          return (
            <YStack
              key={tab.name}
              f={1}
              ai="center"
              jc="center"
              height={48}
              gap={2}
              onPress={() => {
                const event = navigation.emit({ type: 'tabPress', target: state.routes[index].key, canPreventDefault: true });
                if (!event.defaultPrevented) {
                  navigation.navigate(tab.name);
                }
              }}
              cursor="pointer"
            >
              <TabIcon
                size={24}
                color={focused ? '#494fdf' : mutedColor}
                strokeWidth={focused ? 2.5 : 1.5}
              />
              <Text
                fontSize={10}
                fontWeight="500"
                color={focused ? '$accent' : mutedColor}
                fontFamily="$body"
                letterSpacing={0.1}
              >
                {tab.label}
              </Text>
            </YStack>
          );
        })}
      </XStack>
    </YStack>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="activity" />
      <Tabs.Screen name="swap" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
