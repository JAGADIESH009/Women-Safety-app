import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { SecondaryHeader } from '../components/ui/SecondaryHeader';
import { Card } from '../components/ui/Card';
import { Shield, MapPin, Database, EyeOff } from 'lucide-react-native';
import { useAppTheme, spacing, typography } from '../utils/theme';

export function PrivacySecurityScreen() {
  const [settings, setSettings] = useState({
    locationTracking: true,
    dataSharing: false,
    analytics: true,
    incognitoMode: false,
  });

  const { colors, shadows, isDark } = useAppTheme();
  const styles = useMemo(() => getStyles(colors, shadows, isDark), [colors, shadows, isDark]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem('women_safety_privacy');
      if (stored) setSettings(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleSetting = async (key) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    try {
      await AsyncStorage.setItem('women_safety_privacy', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const renderToggle = (key, icon, title, description) => (
    <View style={styles.toggleRow}>
      <View style={styles.iconBox}>{icon}</View>
      <View style={styles.textContainer}>
        <Text style={styles.titleText}>{title}</Text>
        <Text style={styles.descriptionText}>{description}</Text>
      </View>
      <Switch 
        value={settings[key]} 
        onValueChange={() => toggleSetting(key)}
        trackColor={{ false: colors.bgTertiary, true: colors.accentBrand }}
        thumbColor="#FFF"
      />
    </View>
  );

  return (
    <ScreenWrapper edges={['top', 'bottom']}>
      <SecondaryHeader title="Privacy & Security" />
      <ScrollView contentContainerStyle={styles.content}>
        
        <Text style={styles.sectionTitle}>LOCATION & TRACKING</Text>
        <Card style={styles.card} variant="flat">
          {renderToggle(
            'locationTracking',
            <MapPin size={20} color={colors.accentBrand} />,
            'Background Location',
            'Allow SafeHer to access location in the background for continuous protection.'
          )}
        </Card>

        <Text style={styles.sectionTitle}>DATA PRIVACY</Text>
        <Card style={styles.card} variant="flat">
          {renderToggle(
            'dataSharing',
            <Database size={20} color={colors.accentSafe} />,
            'Anonymous Data Sharing',
            'Share anonymized incident data to help map regional safety zones.'
          )}
          <View style={styles.divider} />
          {renderToggle(
            'analytics',
            <Shield size={20} color={colors.accentBrand} />,
            'App Analytics',
            'Share crash reports and performance data to improve the app.'
          )}
        </Card>

        <Text style={styles.sectionTitle}>STEALTH</Text>
        <Card style={styles.card} variant="flat">
          {renderToggle(
            'incognitoMode',
            <EyeOff size={20} color={colors.textSecondary} />,
            'Incognito Mode',
            'Hide app icon from recent apps menu and silence non-critical alerts.'
          )}
        </Card>

      </ScrollView>
    </ScreenWrapper>
  );
}

const getStyles = (colors, shadows, isDark) => StyleSheet.create({
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.bgSecondary,
    padding: 0,
    marginBottom: spacing.xxl,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  titleText: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  descriptionText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.lg + 40 + spacing.md, // Align with text
  }
});
