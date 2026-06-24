import { useState } from 'react';
import { YStack, XStack, Input, Button, Text, Theme } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePrivy } from '@privy-io/expo';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const { login } = usePrivy();
  const router = useRouter();

  const handleCreateAccount = async () => {
    // Basic implementation: trigger phone login
    // In a real scenario, Privy handles the validation and SMS sending
    await login({ loginMethod: 'phone', phone });
  };

  return (
    <Theme name="dark">
      <YStack f={1} bg="$background" p="$four">
        <SafeAreaView style={{ flex: 1 }}>
          <YStack f={1} jc="center" gap="$four">
            <Text fontSize={32} fontWeight="700" color="$text">
              Let's get started!
            </Text>
            <Text fontSize={16} color="$textSecondary">
              Enter your phone number. We will send you a confirmation code there.
            </Text>

            <XStack gap="$two" ai="center">
              <YStack bg="$backgroundElement" p="$three" br="$four" w={80} ai="center">
                <Text color="$text" fontWeight="600">+251</Text>
              </YStack>
              <Input
                f={1}
                bg="$backgroundElement"
                size="$four"
                br="$four"
                placeholder="Enter your phone"
                placeholderTextColor="$textSecondary"
                color="$text"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </XStack>

            <Button
              bg="$backgroundElement"
              br="$four"
              size="$four"
              onPress={handleCreateAccount}
            >
              <Text color="$text" fontWeight="600">Create account</Text>
            </Button>
            
            <Text 
                color="$textSecondary" 
                textAlign="center" 
                onPress={() => console.log('Navigate to log in')}
            >
                Already have an account? Log in
            </Text>
          </YStack>
        </SafeAreaView>
      </YStack>
    </Theme>
  );
}
