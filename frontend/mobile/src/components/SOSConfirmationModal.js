import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Platform } from 'react-native';
import { useEmergency } from '../context/EmergencyContext';
import { useAppTheme, spacing, typography, borderRadius } from '../utils/theme';
import { AlertTriangle, XCircle, ShieldAlert } from 'lucide-react-native';

export function SOSConfirmationModal() {
  const { sosStatus, pendingTrigger, countdownRemaining, cancelSOSTrigger } = useEmergency();
  const { colors, isDark } = useAppTheme();

  if (sosStatus !== 'pending_confirmation') {
    return null;
  }

  const triggerLabel = pendingTrigger?.triggerSource === 'SHAKE'
    ? 'Shake Detection'
    : pendingTrigger?.triggerSource === 'VOICE'
    ? 'Voice Keyword ("SafeHer SOS")'
    : 'SOS Action';

  const styles = getStyles(colors, isDark);

  return (
    <Modal
      transparent
      animationType="fade"
      visible={true}
      onRequestClose={cancelSOSTrigger}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <ShieldAlert size={48} color={colors.accentEmergency} />
          </View>

          <Text style={styles.title}>Did you mean to trigger SOS?</Text>

          <View style={styles.triggerBadge}>
            <AlertTriangle size={14} color={colors.accentWarning} />
            <Text style={styles.triggerBadgeText}>Triggered via {triggerLabel}</Text>
          </View>

          <View style={styles.countdownBox}>
            <Text style={styles.countdownNumber}>
              {countdownRemaining > 0 ? countdownRemaining.toFixed(1) : '0.0'}
            </Text>
            <Text style={styles.countdownUnit}>seconds remaining</Text>
          </View>

          <Text style={styles.desc}>
            An emergency alert with your current GPS coordinates will be dispatched to your trusted contacts when the countdown finishes.
          </Text>

          <TouchableOpacity
            style={styles.cancelButton}
            activeOpacity={0.8}
            onPress={cancelSOSTrigger}
            accessibilityLabel="Cancel SOS countdown"
          >
            <XCircle size={22} color="#FFFFFF" />
            <Text style={styles.cancelButtonText}>CANCEL SOS</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.accentEmergency,
    ...Platform.select({
      ios: {
        shadowColor: colors.accentEmergency,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  triggerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginBottom: spacing.lg,
  },
  triggerBadgeText: {
    ...typography.caption1,
    color: colors.accentWarning,
    fontWeight: '600',
  },
  countdownBox: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  countdownNumber: {
    fontSize: 56,
    fontWeight: '900',
    color: colors.accentEmergency,
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  countdownUnit: {
    ...typography.footnote,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  desc: {
    ...typography.subhead,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: spacing.lg,
    lineHeight: 20,
  },
  cancelButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accentEmergency,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
  },
  cancelButtonText: {
    ...typography.headline,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 1,
  },
});
