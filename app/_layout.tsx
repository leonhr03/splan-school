import { Stack } from 'expo-router';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {

  return (
    <Stack screenOptions={{headerShown: false}}/>
  );
}
