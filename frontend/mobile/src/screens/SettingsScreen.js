import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { SecondaryHeader } from '../components/ui/SecondaryHeader';
import { Card } from '../components/ui/Card';
import { useAppTheme, spacing, typography, borderRadius } from '../utils/theme';
import { useThemeContext } from '../context/ThemeContext';
import { 
  Moon, 
  Sun, 
  Monitor, 
  MapPin, 
  MessageSquare, 
  PhoneCall, 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink 
} from 'lucide-react-native';
import { 
  checkAllPermissions, 
  requestLocationPermission, 
  requestSmsPermission, 
  requestPhonePermission, 
  requestNotificationPermission, 
  openAppSettings,
  PERMISSION_DESCRIPTIONS 
} from '../services/permissions';

export function SettingsScreen() {
  const { colors, isDark, shadows } = useAppTheme();
  const { themePreference, changeThemePreference } = useThemeContext();
  
  const [permissions, setPermissions] = useState({
    location: false,
    sms: false,
    phone: false,
    notifications: false,
  });
  const [isChecking, setIsChecking] = useState(true);

  const refreshPermissions = useCallback(async () => {
    setIsChecking(true);
    try {
      const perms = await checkAllPermissions();
      setPermissions(perms);
    } catch (e) {
      console.log('Error refreshing permissions:', e);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    refreshPermissions();
  }, [refreshPermissions]);

  const handleRequest = async (type) => {
    let granted = false;
    if (type === 'location') {
      granted = await requestLocationPermission();
    } else if (type === 'sms') {
      granted = await requestSmsPermission();
    } else if (type === 'phone') {
      granted = await requestPhonePermission();
    } else if (type === 'notifications') {
      granted = await requestNotificationPermission();
    }
    await refreshPermissions();
    return granted;
  };

  const styles = useMemo(() => getStyles(colors, isDark, shadows), [colors, isDark, shadows]);

  return (
    <ScreenWrapper scrollable edges={['top', 'bottom']} contentContainerStyle={styles.container}>
      <SecondaryHeader title="App Settings" />
      
      <View style={styles.content}>
        {/* APPEARANCE */}
        <Text style={styles.sectionTitle}>APPEARANCE</Text>
        <Card style={styles.card} variant="flat">
          <Text style={styles.cardDesc}>
            Choose how SafeHer looks. Select System to automatically match your device's settings.
          </Text>
          
          <View style={styles.themeSelector}>
            <ThemeOption 
              icon={<Sun size={20} color={themePreference === 'light' ? colors.bgPrimary : colors.textSecondary} />}
              label="Light"
              isActive={themePreference === 'light'}
              onPress={() => changeThemePreference('light')}
              colors={colors}
              styles={styles}
            />
            <ThemeOption 
              icon={<Moon size={20} color={themePreference === 'dark' ? colors.bgPrimary : colors.textSecondary} />}
              label="Dark"
              isActive={themePreference === 'dark'}
              onPress={() => changeThemePreference('dark')}
              colors={colors}
              styles={styles}
            />
            <ThemeOption 
              icon={<Monitor size={20} color={themePreference === 'system' ? colors.bgPrimary : colors.textSecondary} />}
              label="System"
              isActive={themePreference === 'system'}
              onPress={() => changeThemePreference('system')}
              colors={colors}
              styles={styles}
            />
          </View>
        </Card>

        {/* SAFETY PERMISSIONS */}
        <Text style={styles.sectionTitle}>SAFETY PERMISSIONS</Text>
        <Card style={styles.card} variant="flat">
          <Text style={styles.cardDesc}>
            SafeHer requires these device permissions to guarantee reliable distress alerts, automated calls, and location dispatching during an emergency.
          </Text>

          <PermissionItem
            icon={<MapPin size={20} color={permissions.location ? colors.accentSafe : colors.accentWarning} />}
            title="Location (GPS)"
            description={PERMISSION_DESCRIPTIONS.location.purpose}
            isGranted={permissions.location}
            onRequest={() => handleRequest('location')}
            colors={colors}
            styles={styles}
          />

          <View style={styles.divider} />

          <PermissionItem
            icon={<MessageSquare size={20} color={permissions.sms ? colors.accentSafe : colors.accentWarning} />}
            title="Emergency SMS"
            description={PERMISSION_DESCRIPTIONS.sms.purpose}
            isGranted={permissions.sms}
            onRequest={() => handleRequest('sms')}
            colors={colors}
            styles={styles}
          />

          <View style={styles.divider} />

          <PermissionItem
            icon={<PhoneCall size={20} color={permissions.phone ? colors.accentSafe : colors.accentWarning} />}
            title="Emergency Call"
            description={PERMISSION_DESCRIPTIONS.phone.purpose}
            isGranted={permissions.phone}
            onRequest={() => handleRequest('phone')}
            colors={colors}
            styles={styles}
          />

          <View style={styles.divider} />

          <PermissionItem
            icon={<Bell size={20} color={permissions.notifications ? colors.accentSafe : colors.accentWarning} />}
            title="Push Notifications"
            description={PERMISSION_DESCRIPTIONS.notifications.purpose}
            isGranted={permissions.notifications}
            onRequest={() => handleRequest('notifications')}
            colors={colors}
            styles={styles}
          />

          <TouchableOpacity 
            style={styles.openSettingsBtn} 
            activeOpacity={0.7} 
            onPress={openAppSettings}
          >
            <Text style={styles.openSettingsText}>Manage System Permissions in Settings</Text>
            <ExternalLink size={16} color={colors.accentBrand} />
          </TouchableOpacity>
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

function PermissionItem({ icon, title, description, isGranted, onRequest, colors, styles }) {
  return (
    <View style={styles.permissionRow}>
      <View style={[styles.permIconBox, isGranted ? styles.permIconGranted : styles.permIconDenied]}>
        {icon}
      </View>
      <View style={styles.permTextContainer}>
        <View style={styles.permHeaderRow}>
          <Text style={styles.permTitle}>{title}</Text>
          <View style={[styles.statusBadge, isGranted ? styles.badgeGranted : styles.badgeDenied]}>
            {isGranted ? (
              <>
                <CheckCircle2 size={12} color={colors.accentSafe} />
                <Text style={styles.badgeGrantedText}>Allowed</Text>
              </>
            ) : (
              <>
                <AlertCircle size={12} color={colors.accentWarning} />
                <Text style={styles.badgeDeniedText}>Required</Text>
              </>
            )}
          </View>
        </View>
        <Text style={styles.permDesc}>{description}</Text>
        {!isGranted && (
          <TouchableOpacity 
            style={styles.grantBtn} 
            activeOpacity={0.7} 
            onPress={onRequest}
          >
            <Text style={styles.grantBtnText}>Grant Permission</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
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
    backgroundColor: colors.bgSecondary,
    borderColor: colors.border,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderRadius: borderRadius.lg,
  },
  cardDesc: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 18,
  },
  themeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.bgTertiary,
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
    backgroundColor: colors.accentBrand,
    ...shadows.subtle,
  },
  themeOptionLabel: {
    ...typography.footnote,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  themeOptionLabelActive: {
    color: '#FFF',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  permIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  permIconGranted: {
    backgroundColor: colors.accentSafeMuted,
    borderColor: colors.accentSafe,
  },
  permIconDenied: {
    backgroundColor: colors.accentWarningMuted,
    borderColor: colors.accentWarning,
  },
  permTextContainer: {
    flex: 1,
  },
  permHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  permTitle: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  permDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 17,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  badgeGranted: {
    backgroundColor: colors.accentSafeMuted,
  },
  badgeDenied: {
    backgroundColor: colors.accentWarningMuted,
  },
  badgeGrantedText: {
    ...typography.caption,
    color: colors.accentSafe,
    fontWeight: '600',
  },
  badgeDeniedText: {
    ...typography.caption,
    color: colors.accentWarning,
    fontWeight: '600',
  },
  grantBtn: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.accentBrandMuted,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.accentBrand,
  },
  grantBtnText: {
    ...typography.footnote,
    color: colors.accentBrand,
    fontWeight: '600',
  },
  openSettingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.bgTertiary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  openSettingsText: {
    ...typography.footnote,
    color: colors.accentBrand,
    fontWeight: '600',
  },
});
