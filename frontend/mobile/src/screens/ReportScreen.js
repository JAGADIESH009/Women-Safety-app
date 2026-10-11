import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { SecondaryHeader } from '../components/ui/SecondaryHeader';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { AlertTriangle, MapPin, CheckCircle, Upload } from 'lucide-react-native';
import { useAppTheme, spacing, typography, borderRadius } from '../utils/theme';
import { useLocation } from '../hooks/useLocation';
import { useAuth } from '../context/AuthContext';
import { sendEmergencySMS, buildEmergencyMessage } from '../services/emergencyCommunication';

export function ReportScreen({ navigation }) {
  const { user } = useAuth();
  const [incidentType, setIncidentType] = useState('Harassment');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const { location } = useLocation();
  const { colors, shadows, isDark } = useAppTheme();
  const styles = useMemo(() => getStyles(colors, shadows, isDark), [colors, shadows, isDark]);

  const incidentTypes = ['Harassment', 'Theft', 'Assault', 'Stalking', 'Suspicious Person', 'Unsafe Location'];

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Required Field', 'Please provide a brief description of the incident.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const now = new Date();
      const newReport = {
        id: `#REP-${Math.floor(100000 + Math.random() * 900000)}`,
        userId: user?.uid,
        type: incidentType,
        description: description,
        createdAt: now.toISOString(),
        initialLocation: {
          latitude: location?.lat || 0,
          longitude: location?.lng || 0,
          addressLabel: location?.addressLabel || 'Unknown Location',
          accuracy: location?.accuracy || 0,
          timestamp: now.toISOString(),
        },
        latestLocation: {
          latitude: location?.lat || 0,
          longitude: location?.lng || 0,
          addressLabel: location?.addressLabel || 'Unknown Location',
          accuracy: location?.accuracy || 0,
          timestamp: now.toISOString(),
        },
        status: 'Submitted',
        timeline: [
          {
            time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}),
            event: 'Incident created',
            location: {
              latitude: location?.lat || 0,
              longitude: location?.lng || 0,
              addressLabel: location?.addressLabel
            }
          }
        ]
      };

      // Notify contacts
      const contactsStore = await AsyncStorage.getItem('women_safety_contacts');
      let contacts = [];
      if (contactsStore) {
        contacts = JSON.parse(contactsStore).filter(c => (c.userId === user?.uid || !c.userId) && c.enabled !== false);
      }


      if (contacts.length > 0) {
        const message = buildEmergencyMessage(
          user?.displayName || 'User',
          incidentType,
          location?.addressLabel,
          location?.lat,
          location?.lng,
          true
        );
        
        const smsResults = await sendEmergencySMS(contacts, message);
        newReport.emergencyContacts = contacts.map(c => {
          const res = smsResults.find(r => r.contact.id === c.id);
          return { ...c, status: res ? res.status : 'PENDING' };
        });

        smsResults.forEach(res => {
          newReport.timeline.push({
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}),
            event: `SMS notification ${res.status === 'SENT' ? 'sent to' : 'failed for'} ${res.contact.name}`,
            location: newReport.latestLocation
          });
        });
      } else {
        newReport.emergencyContacts = [];
      }
      
      newReport.timeline.push({
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}),
        event: 'Incident saved',
        location: newReport.latestLocation
      });

      const stored = await AsyncStorage.getItem('women_safety_incidents');
      const history = stored ? JSON.parse(stored) : [];
      const updated = [newReport, ...history];
      
      await AsyncStorage.setItem('women_safety_incidents', JSON.stringify(updated));
      
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <ScreenWrapper edges={['top', 'bottom']} withGlow>
        <SecondaryHeader title="Report Incident" />
        <View style={styles.successContent}>
          <CheckCircle size={64} color={colors.accentSafe} style={styles.successIcon} />
          <Text style={styles.successTitle}>Report Submitted</Text>
          <Text style={styles.successMessage}>
            Your incident report has been securely saved and submitted. 
            You can view its status in the Incidents History section.
          </Text>
          <Button 
            title="Return to Home" 
            onPress={() => navigation.navigate('MainTabs')} 
            style={styles.doneBtn}
          />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper edges={['top', 'bottom']}>
      <SecondaryHeader title="Report Incident" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        
        <View style={styles.warningBanner}>
          <AlertTriangle size={20} color={colors.accentWarning} style={styles.bannerIcon} />
          <Text style={styles.bannerText}>
            If you are in immediate danger, use the SOS button on the home screen instead.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>TYPE OF INCIDENT</Text>
        <Card style={styles.typeCard} variant="flat">
          <View style={styles.typeGrid}>
            {incidentTypes.map(type => (
              <TouchableOpacity 
                key={type}
                style={[
                  styles.typePill,
                  incidentType === type && styles.typePillActive
                ]}
                onPress={() => setIncidentType(type)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.typeText,
                  incidentType === type && styles.typeTextActive
                ]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Text style={styles.sectionTitle}>DESCRIPTION</Text>
        <Card style={styles.inputCard} variant="flat">
          <Input 
            placeholder="Describe what happened..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={styles.textArea}
            containerStyle={{ marginBottom: 0 }}
          />
        </Card>

        <Text style={styles.sectionTitle}>LOCATION</Text>
        <Card style={styles.locationCard} variant="flat">
          <MapPin size={20} color={colors.accentBrand} />
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationTitle}>Current Location Attached</Text>
            <Text style={styles.locationSubtitle}>
              {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Location unavailable'}
            </Text>
          </View>
        </Card>

        <Button 
          title="Submit Report" 
          onPress={handleSubmit}
          loading={isSubmitting}
          style={styles.submitBtn}
          icon={<Upload size={18} color="#FFF" />}
        />

      </ScrollView>
    </ScreenWrapper>
  );
}

const getStyles = (colors, shadows, isDark) => StyleSheet.create({
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  warningBanner: {
    flexDirection: 'row',
    backgroundColor: colors.accentWarningMuted,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(217, 119, 6, 0.2)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  bannerIcon: {
    marginRight: spacing.sm,
  },
  bannerText: {
    flex: 1,
    ...typography.footnote,
    color: colors.accentWarning,
    lineHeight: 20,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  typeCard: {
    backgroundColor: colors.bgSecondary,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typePill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.bgTertiary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typePillActive: {
    backgroundColor: colors.accentBrand,
    borderColor: colors.accentBrand,
  },
  typeText: {
    ...typography.footnote,
    color: colors.textPrimary,
  },
  typeTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  inputCard: {
    backgroundColor: colors.bgSecondary,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  locationCard: {
    flexDirection: 'row',
    backgroundColor: colors.bgSecondary,
    padding: spacing.md,
    marginBottom: spacing.xxl,
    alignItems: 'center',
  },
  locationTextContainer: {
    marginLeft: spacing.md,
    flex: 1,
  },
  locationTitle: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  locationSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  submitBtn: {
    marginBottom: spacing.xxl,
  },
  successContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  successIcon: {
    marginBottom: spacing.lg,
  },
  successTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  successMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  doneBtn: {
    width: '100%',
  }
});
