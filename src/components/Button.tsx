import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Radius, Spacing } from '../theme';

type Variant = 'primary' | 'leaving' | 'searching' | 'outline' | 'ghost';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

const variantStyles: Record<Variant, { container: ViewStyle; text: TextStyle }> = {
  primary: {
    container: { backgroundColor: Colors.primary },
    text: { color: '#fff' },
  },
  leaving: {
    container: { backgroundColor: Colors.leaving },
    text: { color: '#fff' },
  },
  searching: {
    container: { backgroundColor: Colors.searching },
    text: { color: '#fff' },
  },
  outline: {
    container: { backgroundColor: 'transparent', borderWidth: 2, borderColor: Colors.primary },
    text: { color: Colors.primary },
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    text: { color: Colors.primary },
  },
};

export default function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  const vs = variantStyles[variant];
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.base,
        vs.container,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? Colors.primary : '#fff'} />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, vs.text, textStyle]}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 16,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    minHeight: 54,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  disabled: {
    opacity: 0.5,
  },
});
