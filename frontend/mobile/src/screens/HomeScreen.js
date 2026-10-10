import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, useWindowDimensions, ScrollView, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { useEmergency } from '../context/EmergencyContext';
import { SOSButton } from '../components/SOSButton';
import { LocationStatus } from '../components/LocationStatus';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { Card } from '../components/ui/Card';
import { useLocation } from '../hooks/useLocation';
import { ShieldCheck, Users, PhoneCall, AlertTriangle, Activity, ShieldAlert, ChevronRight, CheckCircle } from 'lucide-react-native';
import { useAppTheme, spacing, typography, borderRadius } from '../utils/theme';

export function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { location, errorMsg, isLoading } = useLocation();
  const { activeIncident } = useEmergency();
  const { width } = useWindowDimensions();
  const [contactsReady, setContactsReady] = useState(0);
  const { colors, shadows, isDark } = useAppTheme();
  
  const pulseAnim = useRef(new Animated.Value(0.2)).current;
  const styles = useMemo(() => getStyles(colors, shadows, isDark), [colors, shadows, isDark]);

  const isDesktop = width > 768;
  const isSecure = !activeIncident && !errorMsg && !isLoading;

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const stored = await AsyncStorage.getItem('women_safety_contacts');
        if (stored) {
          const parsed = JSON.parse(stored);
          setContactsReady(parsed.length);
        }
      } catch(e) {
        console.error(e);
      }
    };
    
    const unsubscribe = navigation.addListener('focus', () => {
      loadContacts();
    });

    loadContacts();
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    // Ambient safety pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.6, duration: 3000, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(pulseAnim, { toValue: 0.2, duration: 3000, useNativeDriver: Platform.OS !== 'web' })
      ])
    ).start();
  }, [pulseAnim]);

  // Calculate Readiness
  const readinessScore = (location ? 40 : 0) + (contactsReady > 0 ? 40 : 0) + 20; // base 20% for auth

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <Text style={styles.greeting}>Good evening,</Text>
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('ProfileTab')} style={styles.avatar} activeOpacity={0.7}>
        <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || 'U'}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSafetyStatus = () => {
    const pulseColor = activeIncident ? colors.accentEmergency : (isSecure ? colors.accentSafe : colors.accentWarning);
    
    return (
      <View style={styles.statusWrapper}>
        <Animated.View style={[
          styles.statusPulse, 
          { backgroundColor: pulseColor, opacity: pulseAnim }
        ]} pointerEvents="none" />
        
        <Card style={styles.statusCard} variant="flat">
          <View style={styles.statusHeader}>
            {isSecure ? (
              <ShieldCheck size={24} color={colors.accentSafe} />
            ) : (
              <ShieldAlert size={24} color={activeIncident ? colors.accentEmergency : colors.accentWarning} />
            )}
            <Text style={styles.statusTitle}>
              {activeIncident ? 'EMERGENCY ACTIVE' : (isSecure ? "You're protected" : "Attention needed")}
            </Text>
          </View>
          
          <View style={styles.readinessContainer}>
            <View style={styles.readinessHeader}>
              <Text style={styles.readinessLabel}>Safety readiness</Text>
              <Text style={styles.readinessScore}>{readinessScore}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${readinessScore}%`, backgroundColor: pulseColor }]} />
            </View>
          </View>
        </Card>
      </View>
    );
  };

  const renderContacts = () => (
    <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Contacts')}>
      <Card style={styles.moduleCard} variant="flat">
        <View style={styles.moduleHeader}>
          <View style={styles.moduleTitleRow}>
            <Users size={20} color={colors.textPrimary} />
            <Text style={styles.moduleTitle}>Trusted Network</Text>
          </View>
          <ChevronRight size={20} color={colors.textSecondary} />
        </View>
        
        {contactsReady > 0 ? (
          <View style={styles.treeContainer}>
            <Text style={styles.treeText}>You</Text>
            <Text style={styles.treeLine}>│</Text>
            <View style={styles.treeRow}>
              <Text style={styles.treeText}>├── Contacts ({contactsReady})</Text>
              <Text style={styles.treeReady}>● Ready</Text>
            </View>
            <View style={styles.treeRow}>
              <Text style={styles.treeText}>└── Services</Text>
              <Text style={styles.treeReady}>● Ready</Text>
            </View>
          </View>
        ) : (
          <Text style={[styles.moduleText, { color: colors.accentWarning }]}>
            Your safety network is empty. Tap to add trusted contacts.
          </Text>
        )}
      </Card>
    </TouchableOpacity>
  );

  const renderLocation = () => (
    <View style={styles.locationWrapper}>
      <LocationStatus location={location} errorMsg={errorMsg} isLoading={isLoading} />
    </View>
  );

  const renderActivity = () => (
    <Card style={styles.moduleCard} variant="flat">
      <View style={styles.moduleHeader}>
        <View style={styles.moduleTitleRow}>
          <Activity size={20} color={colors.textPrimary} />
          <Text style={styles.moduleTitle}>Recent Activity</Text>
        </View>
      </View>
      
      {activeIncident ? (
        <View style={styles.activityItem}>
          <View style={styles.activityDotRed} />
          <View>
            <Text style={styles.activityText}>Emergency incident active</Text>
            <Text style={styles.activityTime}>Right now</Text>
          </View>
        </View>
      ) : (
        <View style={styles.activityItem}>
          <View style={styles.activityDot} />
          <View>
            <Text style={styles.activityText}>Location updated</Text>
            <Text style={styles.activityTime}>{location ? 'Just now' : 'Unknown'}</Text>
          </View>
        </View>
      )}
    </Card>
  );

  const renderQuickActions = () => (
    <View style={styles.actionsSection}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      {isDesktop ? (
        <View style={styles.desktopActionsContainer}>
          <ActionBtn 
            icon={<Users size={24} color={colors.accentBrand} />} 
            label="Contacts" 
            onPress={() => navigation.navigate('Contacts')}
            colors={colors}
          />
          <ActionBtn 
            icon={<PhoneCall size={24} color={colors.textPrimary} />} 
            label="Fake Call" 
            onPress={() => navigation.navigate('FakeCall')}
            colors={colors}
          />
          <ActionBtn 
            icon={<AlertTriangle size={24} color={colors.accentWarning} />} 
            label="Report" 
            onPress={() => navigation.navigate('Report')}
            colors={colors}
          />
        </View>
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.actionsScroll}
        >
          <ActionBtn 
            icon={<Users size={24} color={colors.accentBrand} />} 
            label="Contacts" 
            onPress={() => navigation.navigate('Contacts')}
            colors={colors}
          />
          <ActionBtn 
            icon={<PhoneCall size={24} color={colors.textPrimary} />} 
            label="Fake Call" 
            onPress={() => navigation.navigate('FakeCall')}
            colors={colors}
          />
          <ActionBtn 
            icon={<AlertTriangle size={24} color={colors.accentWarning} />} 
            label="Report" 
            onPress={() => navigation.navigate('Report')}
            colors={colors}
          />
        </ScrollView>
      )}
    </View>
  );

  const renderSOS = () => (
    <View style={styles.sosContainer}>
      <SOSButton locationData={location} />
    </View>
  );

  if (isDesktop) {
    return (
      <ScreenWrapper scrollable isWide withGlow contentContainerStyle={styles.desktopContainer}>
        {renderHeader()}
        <View style={styles.desktopGrid}>
          <View style={styles.desktopLeft}>
            {renderSafetyStatus()}
            {renderLocation()}
            {renderContacts()}
            {renderActivity()}
          </View>
          <View style={styles.desktopRight}>
            {renderSOS()}
            {renderQuickActions()}
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scrollable withGlow contentContainerStyle={styles.mobileContainer}>
      {renderHeader()}
      {renderSafetyStatus()}
      {renderSOS()}
      {renderLocation()}
      {renderContacts()}
      {renderQuickActions()}
      {renderActivity()}
    </ScreenWrapper>
  );
}

function ActionBtn({ icon, label, onPress, colors }) {
  return (
    <TouchableOpacity style={styles(colors).actionBtn} onPress={onPress} activeOpacity={0.7}>
      <View style={styles(colors).actionIcon}>{icon}</View>
      <Text style={styles(colors).actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = (colors) => StyleSheet.create({
  actionBtn: {
    alignItems: 'center',
    width: 80,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionLabel: {
    ...typography.footnote,
    color: colors.textPrimary,
  }
});

const getStyles = (colors, shadows, isDark) => StyleSheet.create({
  desktopContainer: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
  },
  mobileContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
  },
  desktopGrid: {
    flexDirection: 'row',
    gap: spacing.xxl,
    marginTop: spacing.md, // Reduced gap from header
  },
  desktopLeft: {
    flex: 1.2, // Give slightly more room to content
    gap: spacing.lg,
  },
  desktopRight: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing.xl, // Push SOS down slightly to align better with content
    gap: spacing.xxl, // More space between SOS and Quick Actions
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    ...typography.subhead,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  userName: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.subtle,
  },
  avatarText: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  statusWrapper: {
    marginBottom: spacing.lg,
    position: 'relative',
  },
  statusPulse: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: borderRadius.xl,
    ...Platform.select({
      web: { filter: 'blur(20px)' },
      ios: { shadowColor: '#000', shadowOffset: {width:0, height:0}, shadowOpacity: 0.1, shadowRadius: 20 }
    })
  },
  statusCard: {
    backgroundColor: colors.bgSecondary,
    marginBottom: 0,
    zIndex: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statusTitle: {
    ...typography.subhead,
    color: colors.textPrimary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  readinessContainer: {
    marginTop: spacing.xs,
  },
  readinessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  readinessLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  readinessScore: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.bgTertiary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  sosContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xl,
  },
  locationWrapper: {
    marginBottom: spacing.lg,
  },
  moduleCard: {
    marginBottom: spacing.lg,
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  moduleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  moduleTitle: {
    ...typography.callout,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  moduleText: {
    ...typography.footnote,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: 4,
  },
  treeContainer: {
    marginTop: spacing.sm,
    paddingLeft: spacing.xs,
  },
  treeText: {
    ...typography.footnote,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  treeLine: {
    ...typography.footnote,
    color: colors.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginLeft: 1,
    marginVertical: -2,
  },
  treeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  treeReady: {
    ...typography.caption,
    color: colors.accentSafe,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accentSafe,
  },
  activityDotRed: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accentEmergency,
  },
  activityText: {
    ...typography.subhead,
    color: colors.textPrimary,
  },
  activityTime: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  actionsSection: {
    marginTop: spacing.md,
    width: '100%',
  },
  sectionTitle: {
    ...typography.subhead,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },
  actionsScroll: {
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  desktopActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    width: '100%',
  },
});
