import React, { useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { borderRadius, typography, spacing, useAppTheme } from '../../utils/theme';

export function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  icon,
  style,
  textStyle,
  disabled = false,
  loading = false,
}) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';
  const isSecondary = variant === 'secondary';

  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        isPrimary && styles.primary,
        isDanger && styles.danger,
        isOutline && styles.outline,
        isGhost && styles.ghost,
        isSecondary && styles.secondary,
        (disabled || loading) && styles.disabled,
        style
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator 
          color={isPrimary || isDanger ? '#FFFFFF' : colors.textPrimary} 
          size="small" 
        />
      ) : (
        <View style={styles.contentContainer}>
          {icon && icon}
          <Text style={[
            styles.text, 
            isPrimary && styles.primaryText,
            isDanger && styles.dangerText,
            isOutline && styles.outlineText,
            isGhost && styles.ghostText,
            isSecondary && styles.secondaryText,
            disabled && styles.disabledText,
            textStyle
          ]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const getStyles = (colors) => StyleSheet.create({
  button: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    width: '100%',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  text: {
    ...typography.bodySemibold,
  },
  primary: {
    backgroundColor: colors.accentBrand,
  },
  primaryText: {
    color: '#FFFFFF',
  },
  danger: {
    backgroundColor: colors.accentEmergency,
  },
  dangerText: {
    color: '#FFFFFF',
  },
  secondary: {
    backgroundColor: colors.bgTertiary,
  },
  secondaryText: {
    color: colors.textPrimary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  outlineText: {
    color: colors.textPrimary,
  },
  ghost: {
    backgroundColor: 'transparent',
    height: 'auto',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  ghostText: {
    color: colors.accentBrand,
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.8,
  }
});
