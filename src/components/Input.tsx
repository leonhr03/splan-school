import { useState, type ComponentRef, type Ref } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext.tsx';
import { ThemeColors } from '../assets/colors.ts';

export type InputProps = Omit<
  TextInputProps,
  'value' | 'onChange' | 'onChangeText'
> & {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  ref?: Ref<ComponentRef<typeof TextInput>>;
};

function Input({
  label,
  value,
  onChange,
  style,
  onFocus,
  onBlur,
  ref,
  ...rest
}: InputProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TextInput
        ref={ref}
        placeholderTextColor={colors.text + '66'}
        selectionColor={colors.primary}
        {...rest}
        value={value}
        onChangeText={onChange}
        onFocus={event => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={event => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={[styles.textInput, focused && styles.textInputFocused, style]}
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      width: '100%',
      gap: 8,
    },

    label: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },

    textInput: {
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: colors.card,
      borderRadius: 15,
      borderWidth: 1.5,
      borderColor: 'transparent',
      width: '100%',
      fontSize: 16,
      color: colors.text,
    },

    textInputFocused: {
      borderColor: colors.primary,
    },
  });

export default Input;
