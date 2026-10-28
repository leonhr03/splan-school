import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext.tsx';

type params = {
  label: string,
  onPress: () => void,
}

function Button({label, onPress}: params) {
  const { colors } = useTheme();

  const styles = createStyles(colors);
  
  return(
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  )
}

const createStyles = (colors: any) => StyleSheet.create({
     button: {
       padding: 15,
       backgroundColor: colors.primary,
       borderRadius: 15,
       width: "50%",
       alignItems: "center",
       justifyContent: "center",
     },

     label: {
       fontSize: 15,
       color: colors.text,
     }
  });

export default Button;
