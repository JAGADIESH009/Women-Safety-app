import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { User, Shield, Bell, LogOut, ChevronRight, Settings, AlertTriangle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme, spacing, typography, borderRadius } from '../utils/theme';

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const { colors, isDark } = useAppTheme();
  const navigation = useNavigation();
  
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.content}>
      <Text style={styles.title}>Profile & Settings</Text>

      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitials}>{user?.name?.[0] || 'U'}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.email}>{user?.email || 'Not connected'}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>PREFERENCES</Text>
      <Card style={styles.settingsCard} variant="flat">
        <SettingsItem 
          icon={<Shield size={20} color={colors.accentSafe} />} 
          title="Privacy & Security" 
          subtitle="Manage your data and tracking"
          onPress={() => navigation.navigate('PrivacySecurity')}
          colors={colors}
          styles={styles}
        />
        <SettingsItem 
          icon={<Bell size={20} color={colors.accentBrand} />} 
          title="Notifications" 
          subtitle="Alerts and updates"
          onPress={() => navigation.navigate('Notifications')}
          colors={colors}
          styles={styles}
        />
        <SettingsItem 
          icon={<Settings size={20} color={colors.textSecondary} />} 
          title="App Settings" 
          subtitle="Theme, language, and permissions"
          onPress={() => navigation.navigate('Settings')}
          colors={colors}
          styles={styles}
        />
      </Card>

      <Text style={styles.sectionTitle}>ACTIVITY</Text>
      <Card style={styles.settingsCard} variant="flat">
        <SettingsItem 
          icon={<AlertTriangle size={20} color={colors.accentWarning} />} 
          title="Incident History" 
          subtitle="Past emergencies and reports"
          onPress={() => navigation.navigate('Incidents')}
          colors={colors}
          styles={styles}
        />
      </Card>

      <Text style={styles.sectionTitle}>ACCOUNT ACTIONS</Text>
      <SettingsItem 
        icon={<LogOut size={20} color={colors.accentEmergency} />} 
        title="Log Out"
        isDestructive
        onPress={logout}
        colors={colors}
        styles={styles}
      />
    </ScreenWrapper>
  );
}

function SettingsItem({ icon, title, subtitle, isDestructive, onPress, colors, styles }) {
  return (
    <TouchableOpacity style={styles.settingsItem} activeOpacity={0.7} onPress={onPress}>
      <View style={[styles.iconBox, isDestructive && styles.iconBoxDestructive]}>
        {icon}
      </View>
      <View style={styles.settingsItemText}>
        <Text style={[styles.settingsItemTitle, isDestructive && styles.textDestructive]}>{title}</Text>
        {subtitle && <Text style={styles.settingsItemSubtitle}>{subtitle}</Text>}
      </View>
      <ChevronRight size={20} color={isDestructive ? colors.accentEmergency : colors.textMuted} />
    </TouchableOpacity>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  content: { 
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  title: { 
    ...typography.h1, 
    marginBottom: spacing.xl,
    color: colors.textPrimary,
  },
  profileHeader: { 
    alignItems: 'center', 
    marginBottom: spacing.xxl 
  },
  avatar: { 
    width: 72, 
    height: 72, 
    borderRadius: 36, 
    backgroundColor: colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  avatarInitials: { 
    ...typography.h1, 
    color: colors.textPrimary,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: { 
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  email: { 
    ...typography.body,
    color: colors.textSecondary, 
  },
  sectionTitle: { 
    ...typography.label, 
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    color: colors.textSecondary,
  },
  settingsCard: { 
    padding: spacing.md, 
    marginBottom: spacing.xxl,
    backgroundColor: colors.bgSecondary,
    borderColor: colors.border,
    borderWidth: 1,
  },
  settingsItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  iconBox: { 
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxDestructive: {
    backgroundColor: colors.accentEmergencyMuted,
  },
  settingsItemText: {
    flex: 1,
  },
  settingsItemTitle: { 
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  settingsItemSubtitle: { 
    ...typography.footnote,
    color: colors.textSecondary, 
    marginTop: 2 
  },
  textDestructive: {
    color: colors.accentEmergency,
  }
});
