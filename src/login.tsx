import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useTheme } from './context/ThemeContext.tsx';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Input from './components/Input.tsx';
import Button from './components/Button.tsx';

function Login() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const styles = createStyles(colors);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <View style={styles.topSite}>
        <Text style={styles.heading}>Willkommen zu Splan</Text>
      </View>

      <View style={styles.bottomSite}>
        <Text style={styles.text}>Bitte gebe deinen Namen ein</Text>
        <Input value={name} onChange={setName} placeholder={'Name'} />
        <Button label={"Weiter"} onPress={() => {Alert.alert(name)}}/>
      </View>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      gap: 10,
      backgroundColor: colors.card,
    },

    topSite: {
      height: '55%',
      width: '100%',
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },

    bottomSite: {
      height: '45%',
      width: '100%',
      paddingTop: 28,
      paddingHorizontal: 24,
      paddingBottom: 24,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      backgroundColor: colors.background,
      gap: 20,
      alignItems: 'center',
    },

    heading: {
      fontSize: 25,
      color: colors.text,
      fontWeight: 'bold',
      textAlign: 'center',
    },

    text: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '600',
    },
  });

export default Login;
