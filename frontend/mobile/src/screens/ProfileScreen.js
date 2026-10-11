import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { 
  User, 
  Shield, 
  Bell, 
  LogOut, 
  ChevronRight, 
  Settings, 
  AlertTriangle, 
  HeartPulse, 
  Droplet, 
  FileText, 
  Edit3, 
  Users,
  Phone,
  Check
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme, spacing, typography, borderRadius } from '../utils/theme';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export function ProfileScreen() {
  const { user, updateUserProfile, logout } = useAuth();
  const { colors, isDark, shadows } = useAppTheme();
  const navigation = useNavigation();
  
  // Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [allergies, setAllergies] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const styles = useMemo(() => getStyles(colors, isDark, shadows), [colors, isDark, shadows]);

  const handleOpenEdit = () => {
    setName(user?.name || '');
    setPhone(user?.phone !== 'Not provided' ? (user?.phone || '') : '');
    setBloodGroup(user?.bloodGroup || 'O+');
    setAllergies(user?.allergies || '');
    setMedicalNotes(user?.medicalNotes || '');
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile({
        name,
        phone,
        bloodGroup,
        allergies,
        medicalNotes,
      });
      setIsEditing(false);
      Alert.alert('Profile Updated', 'Your profile details and medical information have been saved.');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.content}>
      <Text style={styles.title}>Profile & Settings</Text>

      {/* HEADER CARD */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitials}>{user?.name?.[0]?.toUpperCase() || 'U'}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.email}>{user?.email || 'Not connected'}</Text>
          {user?.phone && user?.phone !== 'Not provided' && (
            <View style={styles.phoneBadge}>
              <Phone size={12} color={colors.textSecondary} />
              <Text style={styles.phoneText}>{user.phone}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity 
          style={styles.editProfileBtn} 
          onPress={handleOpenEdit}
          activeOpacity={0.7}
        >
          <Edit3 size={16} color={colors.accentBrand} />
          <Text style={styles.editProfileBtnText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* MEDICAL & EMERGENCY SAFETY CARD */}
      <Text style={styles.sectionTitle}>EMERGENCY MEDICAL INFO</Text>
      <Card style={styles.medicalCard} variant="flat">
        <View style={styles.medicalGrid}>
          <View style={styles.medicalItem}>
            <View style={[styles.iconBoxMini, { backgroundColor: colors.accentEmergencyMuted }]}>
              <Droplet size={18} color={colors.accentEmergency} />
            </View>
            <View>
              <Text style={styles.medicalLabel}>Blood Group</Text>
              <Text style={styles.medicalValue}>{user?.bloodGroup || 'Not set'}</Text>
            </View>
          </View>

          <View style={styles.medicalItem}>
            <View style={[styles.iconBoxMini, { backgroundColor: colors.accentSafeMuted }]}>
              <HeartPulse size={18} color={colors.accentSafe} />
            </View>
            <View>
              <Text style={styles.medicalLabel}>Allergies</Text>
              <Text style={styles.medicalValue} numberOfLines={1}>
                {user?.allergies ? user.allergies : 'None listed'}
              </Text>
            </View>
          </View>
        </View>

        {user?.medicalNotes ? (
          <View style={styles.medicalNotesBox}>
            <FileText size={16} color={colors.textSecondary} />
            <Text style={styles.medicalNotesText} numberOfLines={2}>
              {user.medicalNotes}
            </Text>
          </View>
        ) : null}

        <View style={styles.divider} />

        <TouchableOpacity 
          style={styles.manageContactsRow}
          onPress={() => navigation.navigate('Contacts')}
          activeOpacity={0.7}
        >
          <View style={styles.manageContactsLeft}>
            <Users size={18} color={colors.accentBrand} />
            <Text style={styles.manageContactsText}>Manage Trusted Emergency Contacts</Text>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </Card>

      {/* PREFERENCES */}
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

      {/* ACTIVITY */}
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

      {/* ACCOUNT ACTIONS */}
      <Text style={styles.sectionTitle}>ACCOUNT ACTIONS</Text>
      <SettingsItem 
        icon={<LogOut size={20} color={colors.accentEmergency} />} 
        title="Log Out"
        subtitle="Sign out of SafeHer"
        isDestructive
        onPress={logout}
        colors={colors}
        styles={styles}
      />

      {/* EDIT PROFILE MODAL */}
      <Modal
        visible={isEditing}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditing(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile & Medical Info</Text>
            <Text style={styles.modalSubtitle}>
              Ensure your emergency data is up to date for first responders and safety alerts.
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              <Input
                label="Full Name"
                placeholder="Jane Doe"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                leadingIcon={<User size={18} color={colors.textSecondary} />}
              />

              <Input
                label="Phone Number"
                placeholder="+1 234 567 8900"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                leadingIcon={<Phone size={18} color={colors.textSecondary} />}
              />

              <Text style={styles.fieldLabel}>BLOOD GROUP</Text>
              <View style={styles.bloodGroupSelector}>
                {BLOOD_GROUPS.map((bg) => (
                  <TouchableOpacity
                    key={bg}
                    style={[
                      styles.bloodGroupChip,
                      bloodGroup === bg && styles.bloodGroupChipActive,
                    ]}
                    onPress={() => setBloodGroup(bg)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.bloodGroupChipText,
                        bloodGroup === bg && styles.bloodGroupChipTextActive,
                      ]}
                    >
                      {bg}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Input
                label="Known Allergies (Optional)"
                placeholder="e.g. Penicillin, Peanuts, Latex"
                value={allergies}
                onChangeText={setAllergies}
                leadingIcon={<HeartPulse size={18} color={colors.textSecondary} />}
              />

              <Input
                label="Medical Notes / Conditions (Optional)"
                placeholder="e.g. Asthma, Diabetic, Epilepsy"
                value={medicalNotes}
                onChangeText={setMedicalNotes}
                multiline
                numberOfLines={3}
                style={{ height: 72, textAlignVertical: 'top', paddingTop: 8 }}
                leadingIcon={<FileText size={18} color={colors.textSecondary} />}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => setIsEditing(false)}
                disabled={isSaving}
                style={styles.modalCancelBtn}
              />
              <Button
                title={isSaving ? "Saving..." : "Save Changes"}
                onPress={handleSaveProfile}
                loading={isSaving}
                style={styles.modalSaveBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
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

const getStyles = (colors, isDark, shadows) => StyleSheet.create({
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
    marginBottom: spacing.xl,
    backgroundColor: colors.bgSecondary,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: { 
    width: 72, 
    height: 72, 
    borderRadius: 36, 
    backgroundColor: colors.accentBrandMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.accentBrand,
    marginBottom: spacing.md,
  },
  avatarInitials: { 
    ...typography.h1, 
    color: colors.accentBrand,
    fontWeight: '700',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: spacing.md,
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
  phoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: colors.bgTertiary,
    borderRadius: borderRadius.sm,
  },
  phoneText: {
    ...typography.footnote,
    color: colors.textSecondary,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accentBrandMuted,
    borderWidth: 1,
    borderColor: colors.accentBrand,
  },
  editProfileBtnText: {
    ...typography.footnote,
    color: colors.accentBrand,
    fontWeight: '600',
  },
  sectionTitle: { 
    ...typography.label, 
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    color: colors.textSecondary,
  },
  medicalCard: {
    padding: spacing.lg,
    marginBottom: spacing.xl,
    backgroundColor: colors.bgSecondary,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
  },
  medicalGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  medicalItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bgTertiary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBoxMini: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medicalLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  medicalValue: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  medicalNotesBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: colors.bgTertiary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  medicalNotesText: {
    ...typography.footnote,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  manageContactsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  manageContactsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  manageContactsText: {
    ...typography.bodySemibold,
    color: colors.accentBrand,
  },
  settingsCard: { 
    padding: spacing.md, 
    marginBottom: spacing.xl,
    backgroundColor: colors.bgSecondary,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.subtle,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  modalSubtitle: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  modalScroll: {
    paddingBottom: spacing.md,
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginLeft: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  bloodGroupSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  bloodGroupChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.bgTertiary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bloodGroupChipActive: {
    backgroundColor: colors.accentBrand,
    borderColor: colors.accentBrand,
  },
  bloodGroupChipText: {
    ...typography.footnote,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  bloodGroupChipTextActive: {
    color: '#FFF',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  modalCancelBtn: {
    flex: 1,
  },
  modalSaveBtn: {
    flex: 2,
  },
});
