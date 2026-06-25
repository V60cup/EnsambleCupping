// src/components/ui/ThemeToggle.tsx

import { Pressable, StyleSheet, Text, useWindowDimensions } from 'react-native';

import { radius, spacing } from '../../theme/theme';
import { useTheme } from '../../theme/ThemeProvider';

export function ThemeToggle() {
  const { theme, mode, toggleTheme } = useTheme();
  const { width } = useWindowDimensions();

  const isDark = mode === 'dark';
  const compact = width < 420;

  const label = isDark ? 'Claro' : 'Oscuro';
  const fullLabel = isDark ? 'Modo claro' : 'Modo oscuro';
  const icon = isDark ? '☀️' : '🌙';

  const backgroundColor = isDark ? '#F7F1EA' : '#2F2A26';
  const borderColor = isDark ? '#F7F1EA' : '#2F2A26';
  const textColor = isDark ? '#171513' : '#FFFFFF';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Cambiar a ${fullLabel}`}
      onPress={toggleTheme}
      style={({ pressed }) => [
        styles.button,
        compact && styles.buttonCompact,
        {
          backgroundColor,
          borderColor,
          opacity: pressed ? 0.82 : 1,
        },
      ]}
    >
      <Text style={styles.icon}>{icon}</Text>

      {!compact && (
        <Text
          numberOfLines={1}
          style={[
            styles.text,
            {
              color: textColor,
            },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    minHeight: 40,
    maxWidth: 118,
  },
  buttonCompact: {
    width: 42,
    height: 42,
    paddingHorizontal: 0,
    paddingVertical: 0,
    maxWidth: 42,
  },
  icon: {
    fontSize: 16,
    lineHeight: 20,
  },
  text: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.1,
  },
});