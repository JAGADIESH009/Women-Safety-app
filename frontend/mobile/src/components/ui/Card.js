import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { borderRadius, spacing, useAppTheme } from '../../utils/theme';

export function Card({ children, style, variant = 'elevated' }) {
  const { colors, shadows, isDark } = useAppTheme();
  const styles = useMemo(() => getStyles(colors, shadows, isDark), [colors, shadows, isDark]);

  return (
    <View style={[
      styles.card, 
      variant === 'elevated' && styles.elevated,
      variant === 'flat' && styles.flat,
      style
    ]}>
      {children}
    </View>
  );
}

const getStyles = (colors, shadows, isDark) => StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    overflow: 'hidden',
  },
  elevated: {
    backgroundColor: colors.bgSecondary,
    ...shadows.subtle,
    borderWidth: 1,
    borderColor: isDark ? colors.border : 'transparent',
  },
  flat: {
    backgroundColor: colors.bgTertiary,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : colors.border,
  }
});
