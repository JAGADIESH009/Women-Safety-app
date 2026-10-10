import React, { useState, useMemo } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { borderRadius, spacing, typography, useAppTheme } from '../../utils/theme';

export function Input({
  label,
  error,
  secureTextEntry,
  style,
  containerStyle,
  leadingIcon,
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
  const { colors, isDark } = useAppTheme();
  
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputFocused,
        error && styles.inputError,
      ]}>
        {leadingIcon && (
          <View style={styles.leadingIconContainer}>
            {leadingIcon}
          </View>
        )}
        
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.textMuted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          {...props}
        />
        
        {secureTextEntry && (
          <TouchableOpacity 
            style={styles.eyeIcon} 
            onPress={togglePasswordVisibility}
            activeOpacity={0.7}
          >
            {isPasswordVisible ? (
              <EyeOff size={20} color={colors.textSecondary} />
            ) : (
              <Eye size={20} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        )}
      </View>
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
    width: '100%',
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginLeft: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.bgPrimary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 56,
  },
  inputFocused: {
    borderColor: colors.accentBrand,
    backgroundColor: colors.accentBrandMuted,
    ...Platform.select({
      web: { boxShadow: `0 0 0 1px ${colors.accentBrand}` }
    })
  },
  inputError: {
    borderColor: colors.accentEmergency,
    backgroundColor: colors.accentEmergencyMuted,
  },
  leadingIconContainer: {
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
    height: '100%',
    backgroundColor: 'transparent',
    ...Platform.select({
      web: { outlineStyle: 'none' }
    })
  },
  eyeIcon: {
    paddingHorizontal: spacing.md,
    height: '100%',
    justifyContent: 'center',
  },
  errorText: {
    ...typography.footnote,
    color: colors.accentEmergency,
    marginTop: spacing.xs,
    marginLeft: 4,
  }
});
