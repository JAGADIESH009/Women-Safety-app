import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { SecondaryHeader } from '../components/ui/SecondaryHeader';
import { Card } from '../components/ui/Card';
import { ShieldAlert, AlertTriangle, ChevronRight, MapPin } from 'lucide-react-native';
import { useAppTheme, spacing, typography, borderRadius } from '../utils/theme';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export function IncidentsScreen({ navigation }) {
  const [incidents, setIncidents] = useState([]);
  
  const { colors, shadows, isDark } = useAppTheme();
  const styles = useMemo(() => getStyles(colors, shadows, isDark), [colors, shadows, isDark]);

  const { user } = useAuth();

  useEffect(() => {
    // Focus listener to reload incidents when returning to this screen
    const unsubscribe = navigation.addListener('focus', () => {
      loadIncidents();
    });
    
    return unsubscribe;
  }, [navigation, user]);

  const loadIncidents = async () => {
    try {
      const stored = await AsyncStorage.getItem('women_safety_incidents');
      let localIncidents = stored ? JSON.parse(stored) : [];

      try {
        const backendIncidents = await api.getIncidents();
        
        // Sync any offline incidents to backend
        const unsyncedLocal = localIncidents.filter(inc => inc.userId === user?.uid && !inc.backendId);
        for (const uInc of unsyncedLocal) {
           try {
              const bInc = await api.createIncident({ type: uInc.type || 'SOS Emergency' });
              if (bInc && bInc.id) {
                 uInc.backendId = bInc.id;
                 
                 if (uInc.unsyncedLocations && uInc.unsyncedLocations.length > 0) {
                    for (const loc of uInc.unsyncedLocations) {
                       await api.addLocation(bInc.id, {
                          latitude: loc.latitude,
                          longitude: loc.longitude,
                          accuracy: loc.accuracy
                       }).catch(() => {});
                    }
                    uInc.unsyncedLocations = [];
                 }

                 if (uInc.status === 'RESOLVED' || uInc.status === 'ENDED') {
                    await api.updateIncident(bInc.id, { status: 'RESOLVED', end_time: uInc.endedAt });
                 }
              }
           } catch(e) {}
        }

        if (backendIncidents && backendIncidents.length > 0) {
           const mapped = backendIncidents.map(bi => ({
             id: bi.id.toString(),
             backendId: bi.id,
             userId: user?.uid,
             type: 'SOS Emergency',
             triggerType: 'MANUAL_SOS',
             status: bi.status === 'RESOLVED' ? 'ENDED' : bi.status,
             createdAt: bi.start_time,
             endedAt: bi.end_time,
           }));
           
           const localBackendIds = localIncidents.map(i => i.backendId).filter(Boolean);
           const newFromBackend = mapped.filter(bi => !localBackendIds.includes(bi.backendId));
           localIncidents = [...localIncidents, ...newFromBackend];
        }
        await AsyncStorage.setItem('women_safety_incidents', JSON.stringify(localIncidents));
      } catch (err) {
        console.log("Failed to sync incidents with backend:", err.message);
      }

      // Filter incidents belonging to current user and sort newest first
      const userIncidents = localIncidents
        .filter(inc => inc.userId === user?.uid)
        .sort((a, b) => new Date(b.createdAt || b.startTime) - new Date(a.createdAt || a.startTime));
      
      setIncidents(userIncidents);
    } catch (e) {
      console.error('Failed to load incidents', e);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unavailable';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const renderIncident = ({ item }) => {
    const isEmergency = item.isSOS || item.type === 'SOS Emergency';
    const isActive = item.status === 'ACTIVE';
    const Icon = isEmergency ? ShieldAlert : AlertTriangle;
    const iconColor = isEmergency ? colors.accentEmergency : colors.accentWarning;
    const bgColor = isEmergency ? colors.accentEmergencyMuted : colors.accentWarningMuted;

    const triggerLabel = item.triggerType === 'MANUAL_SOS' ? 'Manual SOS' : (item.triggerType || 'Unknown / Legacy incident');
    
    // Attempt to get location label
    let locLabel = 'Address unavailable';
    if (item.latestLocation?.addressLabel) {
      locLabel = item.latestLocation.addressLabel;
    } else if (item.initialLocation?.addressLabel) {
      locLabel = item.initialLocation.addressLabel;
    } else if (item.location?.lat) {
      locLabel = 'Address unavailable';
    }

    const durationText = item.duration ? `${Math.ceil(item.duration / 60)} min` : '--';

    return (
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={() => navigation.navigate('IncidentDetails', { incident: item })}
      >
        <Card style={styles.incidentCard} variant="flat">
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: bgColor }]}>
              <Icon size={20} color={iconColor} />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.incidentType}>{item.type}</Text>
              <Text style={styles.incidentTrigger}>{triggerLabel}</Text>
              <View style={styles.locationRow}>
                <MapPin size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
                <Text style={styles.incidentLocation} numberOfLines={1}>{locLabel}</Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </View>
          
          <View style={styles.cardFooter}>
            <View style={styles.footerInfo}>
              <Text style={styles.incidentDate}>{formatDate(item.createdAt || item.startTime)}</Text>
              {!isActive && <Text style={styles.incidentDuration}> • {durationText}</Text>}
            </View>
            <View style={[styles.statusBadge, isActive ? styles.statusBadgeActive : null]}>
              <Text style={[styles.statusText, isActive ? styles.statusTextActive : null]}>{item.status}</Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper edges={['top', 'bottom']}>
      <SecondaryHeader title="Incident History" />
      
      {incidents.length === 0 ? (
        <View style={styles.emptyState}>
          <ShieldAlert size={48} color={colors.textMuted} style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>No Incidents Found</Text>
          <Text style={styles.emptyText}>You have no past emergencies or reports.</Text>
        </View>
      ) : (
        <FlatList
          data={incidents}
          keyExtractor={item => item.id}
          renderItem={renderIncident}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenWrapper>
  );
}

const getStyles = (colors, shadows, isDark) => StyleSheet.create({
  listContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
  },
  emptyIcon: {
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  incidentCard: {
    backgroundColor: colors.bgSecondary,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardTextContainer: {
    flex: 1,
  },
  incidentType: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  incidentTrigger: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  incidentLocation: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    marginTop: spacing.sm,
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  incidentDate: {
    ...typography.footnote,
    color: colors.textSecondary,
  },
  incidentDuration: {
    ...typography.footnote,
    color: colors.textMuted,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.bgTertiary,
    borderRadius: borderRadius.sm,
  },
  statusBadgeActive: {
    backgroundColor: colors.accentEmergencyMuted,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(244, 63, 94, 0.3)' : 'rgba(225, 29, 72, 0.3)',
  },
  statusText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  statusTextActive: {
    color: colors.accentEmergency,
  }
});
