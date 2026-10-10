import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { SecondaryHeader } from '../components/ui/SecondaryHeader';
import { Card } from '../components/ui/Card';
import { useAppTheme, spacing, typography, borderRadius } from '../utils/theme';
import { useThemeContext } from '../context/ThemeContext';
import { Moon, Sun, Monitor } from 'lucide-react-native';

export function SettingsScreen() {
  const { colors, isDark, shadows } = useAppTheme();
  const { themePreference, changeThemePreference } = useThemeContext();
  
  const styles = useMemo(() => getStyles(colors, isDark, shadows), [colors, isDark, shadows]);

  return (
    <ScreenWrapper scrollable edges={['top', 'bottom']} contentContainerStyle={styles.container}>
      <SecondaryHeader title="App Settings" />
      
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>APPEARANCE</Text>
        <Card style={styles.card} variant="flat">
          <Text style={styles.cardDesc}>
            Choose how SafeHer looks. Select System to automatically match your device's settings.
          </Text>
          
          <View style={styles.themeSelector}>
            <ThemeOption 
              icon={<Sun size={20} color={themePreference === 'light' ? colors.background : colors.textSecondary} />}
              label="Light"
              isActive={themePreference === 'light'}
              onPress={() => changeThemePreference('light')}
              colors={colors}
              styles={styles}
            />
            <ThemeOption 
              icon={<Moon size={20} color={themePreference === 'dark' ? colors.background : colors.textSecondary} />}
              label="Dark"
              isActive={themePreference === 'dark'}
              onPress={() => changeThemePreference('dark')}
              colors={colors}
              styles={styles}
            />
            <ThemeOption 
              icon={<Monitor size={20} color={themePreference === 'system' ? colors.background : colors.textSecondary} />}
              label="System"
              isActive={themePreference === 'system'}
              onPress={() => changeThemePreference('system')}
              colors={colors}
              styles={styles}
            />
          </View>
        </Card>
      </View>
    </ScreenWrapper>
  );
}

function ThemeOption({ icon, label, isActive, onPress, colors, styles }) {
  return (
    <TouchableOpacity 
      style={[styles.themeOption, isActive && styles.themeOptionActive]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon}
      <Text style={[styles.themeOptionLabel, isActive && styles.themeOptionLabelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const getStyles = (colors, isDark, shadows) => StyleSheet.create({
  container: {
    paddingBottom: spacing.xxxl,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    padding: spacing.lg,
  },
  cardDesc: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  themeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  themeOptionActive: {
    backgroundColor: colors.primary,
    ...shadows.subtle,
  },
  themeOptionLabel: {
    ...typography.footnote,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  themeOptionLabelActive: {
    color: colors.background, // Ensure high contrast against primary brand color
  }
});
