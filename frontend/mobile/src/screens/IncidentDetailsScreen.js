import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView } from 'react-native';
import { useEmergency } from '../context/EmergencyContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { SecondaryHeader } from '../components/ui/SecondaryHeader';
import { MapPin, ShieldAlert, Clock, Navigation, Phone } from 'lucide-react-native';
import { useAppTheme, spacing, typography, borderRadius } from '../utils/theme';
import { IncidentMap } from '../components/IncidentMap';
import { getReverseGeocode } from '../utils/geocoding';

export function IncidentDetailsScreen({ route, navigation }) {
  const { activeIncident, endEmergency } = useEmergency();
  const { colors, shadows, isDark } = useAppTheme();
  const styles = useMemo(() => getStyles(colors, shadows, isDark), [colors, shadows, isDark]);

  const passedIncident = route?.params?.incident;
  const incident = passedIncident || activeIncident || {
    id: '#INC-000000',
    type: 'SOS Emergency',
    status: 'UNKNOWN',
    timeline: [],
    location: {lat: 0, lng: 0, accuracy: 0},
    emergencyContacts: []
  };

  const [locationName, setLocationName] = useState('Resolving location...');

  useEffect(() => {
    async function resolveLocation() {
      // Prefer latestLocation or initialLocation
      const locToUse = incident.latestLocation || incident.initialLocation || incident.location;
      
      if (locToUse && locToUse.addressLabel && locToUse.addressLabel !== 'Resolving location...') {
        setLocationName(locToUse.addressLabel);
      } else if (locToUse && (locToUse.latitude || locToUse.lat)) {
        setLocationName('Resolving location...');
        const lat = locToUse.latitude || locToUse.lat;
        const lng = locToUse.longitude || locToUse.lng;
        const name = await getReverseGeocode(lat, lng);
        if (name) {
          setLocationName(name);
        } else {
          setLocationName('Location unavailable');
        }
      } else {
        setLocationName('Location unavailable');
      }
    }
    resolveLocation();
  }, [incident]);

  const formatDateTime = (isoString) => {
    if (!isoString) return 'Unavailable';
    const date = new Date(isoString);
    return date.toLocaleString(undefined, { 
      day: 'numeric', month: 'short', year: 'numeric',
      hour: 'numeric', minute: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    if (seconds === undefined || seconds === null) return 'N/A';
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  const isActive = incident.status === 'ACTIVE';
  const triggerText = incident.triggerType === 'MANUAL_SOS' ? 'Manual SOS' : (incident.triggerType || 'Unknown / Legacy incident');
  const locToUse = incident.latestLocation || incident.initialLocation || incident.location || { lat: 0, lng: 0 };
  const latToUse = locToUse.latitude || locToUse.lat || 0;
  const lngToUse = locToUse.longitude || locToUse.lng || 0;
  const accuracyToUse = locToUse.accuracy || 0;
  const dateToUse = incident.createdAt || incident.startTime;

  return (
    <ScreenWrapper scrollable withGlow edges={['top', 'bottom']} contentContainerStyle={styles.container}>
      <SecondaryHeader title="Incident Details" />
      
      <View style={styles.header}>
        {/* SUMMARY SECTION */}
        <Card style={styles.summaryCard} variant="flat">
          <View style={styles.summaryHeader}>
            <View style={styles.summaryTypeContainer}>
              <ShieldAlert size={20} color={colors.accentEmergency} />
              <Text style={styles.summaryType}>{incident.type}</Text>
            </View>
            <View style={[styles.badge, isActive ? styles.badgeActive : styles.badgeResolved]}>
              <Text style={[styles.badgeText, isActive ? styles.badgeTextActive : styles.badgeTextResolved]}>
                {incident.status}
              </Text>
            </View>
          </View>
          
          <Text style={styles.summaryTrigger}>{triggerText}</Text>
          <Text style={styles.summaryLocation}>{locationName}</Text>
          <Text style={styles.summaryDate}>{formatDateTime(dateToUse)}</Text>
        </Card>

        {/* MAP SECTION */}
        <Text style={styles.sectionTitle}>INCIDENT LOCATION</Text>
        <Card style={styles.mapCard} variant="flat">
          <IncidentMap location={{ latitude: latToUse, longitude: lngToUse }} />
        </Card>

        {/* INFORMATION SECTION */}
        <Text style={styles.sectionTitle}>INFORMATION</Text>
        <Card style={styles.infoCard} variant="flat">
          <InfoRow label="Status" value={incident.status} />
          <InfoRow label="Trigger" value={triggerText} />
          <InfoRow label="Location" value={locationName} />
          <InfoRow label="Started" value={formatDateTime(dateToUse)} />
          <InfoRow label="Ended" value={incident.endedAt || incident.endTime ? formatDateTime(incident.endedAt || incident.endTime) : '--'} />
          <InfoRow label="Duration" value={incident.duration ? formatDuration(incident.duration) : '--'} />
          <InfoRow label="GPS Accuracy" value={accuracyToUse ? `±${Math.round(accuracyToUse)} m` : '--'} borderBottom={false} />
        </Card>

        {/* EMERGENCY CONTACTS */}
        <Text style={styles.sectionTitle}>EMERGENCY CONTACTS</Text>
        <Card style={styles.contactsCard} variant="flat">
          {(!incident.emergencyContacts || incident.emergencyContacts.length === 0) ? (
             <Text style={styles.emptyText}>No emergency contacts associated with this incident.</Text>
          ) : (
            incident.emergencyContacts.map((contact, idx) => (
              <View key={idx} style={[styles.contactRow, idx === incident.emergencyContacts.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={styles.contactIconBox}>
                  <Phone size={18} color={colors.textSecondary} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.name || contact.phoneNumber}</Text>
                  <Text style={styles.contactStatus}>{contact.status || 'Selected for emergency alert'}</Text>
                </View>
              </View>
            ))
          )}
        </Card>

        {/* LOCATION TIMELINE */}
        <Text style={styles.sectionTitle}>LOCATION TIMELINE</Text>
        <Card style={styles.timelineCard} variant="flat">
          <View>
            {incident.timeline && incident.timeline.length > 0 ? (
              incident.timeline.map((item, idx) => (
                <View key={idx} style={styles.timelineItem}>
                  {idx !== incident.timeline.length - 1 && <View style={styles.timelineLine} />}
                  <View style={styles.timelineDot} />
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineEvent}>{item.event}</Text>
                    <Text style={styles.timelineTime}>{item.time}</Text>
                    {item.location?.addressLabel && (
                      <View style={styles.timelineLocationRow}>
                        <MapPin size={12} color={colors.textMuted} />
                        <Text style={styles.timelineLocationText}>{item.location.addressLabel}</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No timeline events recorded.</Text>
            )}
          </View>
        </Card>

        {activeIncident && incident.id === activeIncident.id && (
          <Button 
            title="END EMERGENCY" 
            variant="outline"
            style={styles.resolveBtn}
            textStyle={{ color: colors.accentEmergency }}
            onPress={() => {
              if (Platform.OS === 'web') {
                if (window.confirm('Are you sure you want to end this emergency?')) {
                  endEmergency();
                  navigation.goBack();
                }
              } else {
                endEmergency();
                navigation.goBack();
              }
            }}
          />
        )}
      </View>
    </ScreenWrapper>
  );
}

function InfoRow({ label, value, borderBottom = true }) {
  const { colors } = useAppTheme();
  return (
    <View style={[
      { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.md },
      borderBottom && { borderBottomWidth: 1, borderBottomColor: colors.border }
    ]}>
      <Text style={{ ...typography.body, color: colors.textSecondary }}>{label}</Text>
      <Text style={{ ...typography.bodySemibold, color: colors.textPrimary, flex: 1, textAlign: 'right', marginLeft: spacing.md }}>
        {value}
      </Text>
    </View>
  );
}

const getStyles = (colors, shadows, isDark) => StyleSheet.create({
  container: {
    paddingBottom: spacing.xxxl,
  },
  header: {
    paddingHorizontal: spacing.xl,
  },
  summaryCard: {
    padding: spacing.xl,
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.md,
  },
  summaryTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  summaryType: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  summaryTrigger: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  summaryLocation: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  summaryDate: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  badge: { 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: borderRadius.sm 
  },
  badgeActive: { 
    backgroundColor: colors.accentEmergencyMuted, 
    borderWidth: 1, 
    borderColor: isDark ? 'rgba(244, 63, 94, 0.3)' : 'rgba(225, 29, 72, 0.3)',
  },
  badgeResolved: { 
    backgroundColor: colors.bgTertiary 
  },
  badgeText: { 
    ...typography.caption,
    letterSpacing: 0.5 
  },
  badgeTextActive: { 
    color: colors.accentEmergency 
  },
  badgeTextResolved: { 
    color: colors.textSecondary 
  },
  sectionTitle: { 
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  mapCard: {
    padding: 0,
    overflow: 'hidden',
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  rawLocationBox: {
    padding: spacing.md,
    backgroundColor: colors.bgTertiary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rawLocationText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textAlign: 'center',
  },
  infoCard: {
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  contactsCard: {
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  contactIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  contactStatus: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  timelineContainer: {
    paddingHorizontal: spacing.xl,
  },
  timelineCard: { 
    marginBottom: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.bgSecondary,
    borderColor: colors.border,
    borderWidth: 1,
  },
  timelineItem: { 
    flexDirection: 'row', 
    marginBottom: spacing.md 
  },
  timelineLine: { 
    position: 'absolute', 
    left: 5, 
    top: 18, 
    bottom: -30, 
    width: 2, 
    backgroundColor: colors.border 
  },
  timelineDot: { 
    width: 12, 
    height: 12, 
    borderRadius: 6, 
    backgroundColor: colors.textSecondary, 
    marginTop: 6, 
    marginRight: 16, 
    zIndex: 1 
  },
  timelineContent: { 
    flex: 1,
    paddingBottom: spacing.sm
  },
  timelineTime: { 
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4
  },
  timelineEvent: { 
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  timelineLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4
  },
  timelineLocationText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  emptyText: { 
    ...typography.body,
    color: colors.textSecondary,
    padding: spacing.lg,
    textAlign: 'center'
  },
  resolveBtn: { 
    borderColor: colors.accentEmergencyMuted, 
    marginTop: spacing.md 
  }
});
