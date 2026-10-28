import {
  StatusBar,
  useColorScheme,
} from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './src/login.tsx';
import { ThemeProvider } from './src/context/ThemeContext.tsx';
import { NavigationContainer } from '@react-navigation/native';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const Stack = createStackNavigator();

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" component={Login} />
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
