import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Navigation } from 'lucide-react-native';
import { useAppTheme, typography, spacing, borderRadius } from '../utils/theme';

export function LocationStatus({ location, errorMsg, isLoading }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  if (isLoading && !location) {
    return (
      <View style={styles.container}>
        <Text style={styles.details}>Locating device...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text style={[styles.details, { color: colors.accentWarning }]}>{errorMsg}</Text>
      </View>
    );
  }

  if (!location) return null;

  const isHigh = location.accuracyLevel === 'HIGH';
  const isMod = location.accuracyLevel === 'MODERATE';
  
  const statusColor = isHigh ? colors.accentSafe : isMod ? colors.accentWarning : colors.accentEmergency;
  
  const humanReadableStatus = isHigh 
    ? "Precise location active" 
    : isMod 
      ? "Good accuracy" 
      : "Accuracy needs improvement";

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Navigation size={14} color={statusColor} style={{ transform: [{ rotate: '45deg' }] }} />
        <Text style={[styles.title, { color: statusColor }]}>
          LOCATION
        </Text>
      </View>
      <Text style={styles.mainText}>
        {humanReadableStatus}
      </Text>
      <View style={styles.metaRow}>
        <Text style={styles.details}>
          ±{location.accuracy}m
        </Text>
        {!isHigh && (
          <TouchableOpacity activeOpacity={0.7} style={styles.actionBtn}>
            <Text style={styles.actionText}>Improve accuracy →</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  title: {
    ...typography.label,
    letterSpacing: 1,
  },
  mainText: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  details: {
    ...typography.footnote,
    color: colors.textSecondary,
  },
  actionBtn: {
    backgroundColor: colors.bgTertiary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  actionText: {
    ...typography.caption,
    color: colors.accentBrand,
  }
});
