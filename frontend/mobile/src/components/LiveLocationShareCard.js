import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Share } from 'react-native';
import { useEmergency } from '../context/EmergencyContext';
import { useLocation } from '../hooks/useLocation';
import { Card } from './ui/Card';
import { useAppTheme, spacing, typography, borderRadius } from '../utils/theme';
import { Radio, Share2, MapPin, CheckCircle2, AlertCircle, Clock, ShieldCheck, Power } from 'lucide-react-native';

export function LiveLocationShareCard() {
  const {
    isSharingActive,
    sharingSession,
    sharingError,
    lastShareUploadTime,
    startLiveSharing,
    stopLiveSharing,
  } = useEmergency();

  const { location, errorMsg: locError } = useLocation();
  const { colors, isDark } = useAppTheme();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleToggleSharing = async () => {
    setIsProcessing(true);
    try {
      if (isSharingActive) {
        await stopLiveSharing();
      } else {
        await startLiveSharing();
      }
    } catch (err) {
      Alert.alert('Location Sharing', err.message || 'An error occurred while managing location sharing.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShareLink = async () => {
    if (!sharingSession?.session_token) return;
    const configuredBase = (process.env.EXPO_PUBLIC_WEB_URL || 'https://safeherweb.vercel.app').replace(/\/+$/, '');
    let trackingUrl = (sharingSession.tracking_url && sharingSession.tracking_url.startsWith('http'))
      ? sharingSession.tracking_url.replace('/#/track?', '/track?')
      : `${configuredBase}/track?token=${encodeURIComponent(sharingSession.session_token)}`;

    if (currentLat != null && currentLng != null && !trackingUrl.includes('&lat=')) {
      trackingUrl += `&lat=${encodeURIComponent(Number(currentLat).toFixed(6))}&lng=${encodeURIComponent(Number(currentLng).toFixed(6))}`;
    }

    try {
      await Share.share({
        message: `I am sharing my live location with you for safety via SafeHer:\n${trackingUrl}`,
        url: trackingUrl,
        title: 'SafeHer Live Location',
      });
    } catch (err) {
      console.warn('Share sheet error:', err.message);
    }
  };

  // Determine freshness
  const isStale = lastShareUploadTime
    ? (Date.now() - new Date(lastShareUploadTime).getTime()) > 120000
    : false;

  const styles = getStyles(colors, isDark);

  const currentLat = location?.lat ?? location?.coords?.latitude;
  const currentLng = location?.lng ?? location?.coords?.longitude;
  const currentAccuracy = location?.accuracy ?? location?.coords?.accuracy;
  const currentAddress = location?.addressLabel && location.addressLabel !== 'Updating...' && location.addressLabel !== 'Resolving location...'
    ? location.addressLabel
    : null;

  return (
    <Card style={styles.card} variant="flat">
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <View style={[styles.iconBox, isSharingActive ? styles.iconBoxActive : styles.iconBoxInactive]}>
            <Radio size={20} color={isSharingActive ? colors.accentSafe : colors.textSecondary} />
          </View>
          <View>
            <Text style={styles.title}>Live Location Sharing</Text>
            <Text style={styles.subtitle}>Real-time GPS tracking for contacts</Text>
          </View>
        </View>

        <View style={[styles.statusBadge, isSharingActive ? styles.badgeActive : styles.badgeInactive]}>
          <View style={[styles.statusDot, isSharingActive ? styles.dotActive : styles.dotInactive]} />
          <Text style={[styles.statusText, isSharingActive ? styles.statusTextActive : styles.statusTextInactive]}>
            {isSharingActive ? 'ACTIVE' : 'IDLE'}
          </Text>
        </View>
      </View>

      {/* Details Box */}
      <View style={styles.detailsContainer}>
        {currentAddress ? (
          <View style={styles.detailRow}>
            <MapPin size={16} color={colors.accentBrand} />
            <Text style={styles.detailLabel}>Location:</Text>
            <Text style={[styles.detailValue, { flex: 1, textAlign: 'right' }]} numberOfLines={1}>
              {currentAddress}
            </Text>
          </View>
        ) : null}

        <View style={styles.detailRow}>
          <MapPin size={16} color={colors.textSecondary} />
          <Text style={styles.detailLabel}>Coordinates:</Text>
          <Text style={styles.detailValue}>
            {currentLat != null && currentLng != null
              ? `${Number(currentLat).toFixed(5)}, ${Number(currentLng).toFixed(5)}`
              : 'Acquiring GPS...'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <ShieldCheck size={16} color={colors.textSecondary} />
          <Text style={styles.detailLabel}>GPS Accuracy:</Text>
          <Text style={styles.detailValue}>
            {currentAccuracy != null
              ? `±${Math.round(currentAccuracy)}m`
              : 'Standard'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Clock size={16} color={isStale ? colors.accentWarning : colors.textSecondary} />
          <Text style={styles.detailLabel}>Last Cloud Sync:</Text>
          <Text style={[styles.detailValue, isStale && styles.staleValue]}>
            {lastShareUploadTime
              ? `${new Date(lastShareUploadTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}${isStale ? ' (Stale)' : ''}`
              : 'Not started'}
          </Text>
        </View>
      </View>

      {/* Warning/Error indicator */}
      {sharingError && (
        <View style={styles.errorBox}>
          <AlertCircle size={16} color={colors.accentWarning} />
          <Text style={styles.errorText}>{sharingError}</Text>
        </View>
      )}

      {locError && !location && (
        <View style={styles.errorBox}>
          <AlertCircle size={16} color={colors.accentEmergency} />
          <Text style={styles.errorText}>{locError}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, isSharingActive ? styles.stopBtn : styles.startBtn]}
          activeOpacity={0.8}
          onPress={handleToggleSharing}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Power size={18} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>
                {isSharingActive ? 'Stop Sharing' : 'Start Live Sharing'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {isSharingActive && sharingSession?.session_token && (
          <TouchableOpacity
            style={styles.shareLinkBtn}
            activeOpacity={0.8}
            onPress={handleShareLink}
          >
            <Share2 size={18} color={colors.accentBrand} />
            <Text style={styles.shareLinkText}>Send Link</Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  card: {
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBoxActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  iconBoxInactive: {
    backgroundColor: colors.bgTertiary,
  },
  title: {
    ...typography.headline,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  badgeActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  badgeInactive: {
    backgroundColor: colors.bgTertiary,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: colors.accentSafe,
  },
  dotInactive: {
    backgroundColor: colors.textTertiary,
  },
  statusText: {
    ...typography.caption2,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusTextActive: {
    color: colors.accentSafe,
  },
  statusTextInactive: {
    color: colors.textSecondary,
  },
  detailsContainer: {
    backgroundColor: colors.bgTertiary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailLabel: {
    ...typography.caption1,
    color: colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    ...typography.caption1,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  staleValue: {
    color: colors.accentWarning,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.caption2,
    color: colors.accentEmergency,
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  startBtn: {
    backgroundColor: colors.accentBrand,
  },
  stopBtn: {
    backgroundColor: colors.accentEmergency,
  },
  actionBtnText: {
    ...typography.headline,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  shareLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.accentBrand,
    backgroundColor: 'transparent',
  },
  shareLinkText: {
    ...typography.subhead,
    color: colors.accentBrand,
    fontWeight: '700',
  },
});
