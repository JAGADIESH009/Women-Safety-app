import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { SecondaryHeader } from '../components/ui/SecondaryHeader';
import { UserPlus, User, Trash2, Phone, Pencil, RotateCw, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { useAppTheme, spacing, typography, borderRadius } from '../utils/theme';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STORAGE_KEY = 'women_safety_contacts';

/**
 * Normalizes phone numbers to standard 10-digit national number
 * to ensure +91 98765 43210 and 9876543210 match identically.
 */
const normalizePhone = (phone) => {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
};

/**
 * Returns a stable unique key for deduplication.
 * Prefers server backendId or numeric ID, falling back to normalized 10-digit phone.
 */
const getStableContactKey = (contact) => {
  if (!contact) return '';
  if (contact.backendId) return `bid:${contact.backendId}`;
  if (contact.id && !isNaN(contact.id) && String(contact.id).length < 10) {
    return `bid:${contact.id}`;
  }
  const normPhone = normalizePhone(contact.phone);
  if (normPhone) return `phone:${normPhone}`;
  return `id:${contact.id}`;
};

/**
 * Checks whether two contact records represent the exact same person.
 */
const areContactsMatching = (a, b) => {
  if (!a || !b) return false;
  const aBid = a.backendId || (!isNaN(a.id) && String(a.id).length < 10 ? a.id : null);
  const bBid = b.backendId || (!isNaN(b.id) && String(b.id).length < 10 ? b.id : null);
  if (aBid && bBid && String(aBid) === String(bBid)) return true;
  if (a.id && b.id && String(a.id) === String(b.id)) return true;
  const aPhone = normalizePhone(a.phone);
  const bPhone = normalizePhone(b.phone);
  if (aPhone && bPhone && aPhone === bPhone) return true;
  return false;
};

export function ContactsScreen({ navigation }) {
  const [contacts, setContacts] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  
  // Real-time synchronization state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null); // 'success' | 'offline' | 'error' | null
  const [lastSyncedText, setLastSyncedText] = useState('');
  const syncInProgress = useRef(false);
  
  const { colors, shadows, isDark } = useAppTheme();
  const styles = useMemo(() => getStyles(colors, shadows, isDark), [colors, shadows, isDark]);
  const { user } = useAuth();

  /**
   * Save contacts to local persistent storage (both user-scoped and global for backward compat).
   */
  const saveContacts = useCallback(async (userContactsToSave) => {
    try {
      // 1. Deduplicate in memory before writing
      const seen = new Set();
      const uniqueUserContacts = [];
      for (const c of userContactsToSave) {
        const key = getStableContactKey(c);
        if (key && !seen.has(key)) {
          seen.add(key);
          uniqueUserContacts.push({ ...c, userId: user?.uid });
        }
      }

      // 2. Write to user-scoped storage key for strict data isolation
      if (user?.uid) {
        await AsyncStorage.setItem(`${STORAGE_KEY}_${user.uid}`, JSON.stringify(uniqueUserContacts));
      }

      // 3. Write to legacy shared storage key keeping other users' contacts intact
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const allContacts = stored ? JSON.parse(stored) : [];
      const otherContacts = allContacts.filter(c => c.userId && user?.uid && c.userId !== user.uid);
      const updatedAll = [...otherContacts, ...uniqueUserContacts];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAll));
    } catch (e) {
      console.error("[ContactsScreen] Failed to save contacts to storage", e);
    }
  }, [user]);

  /**
   * Load local cached contacts immediately for zero-latency startup.
   */
  const loadLocalContacts = useCallback(async () => {
    try {
      let rawLocal = [];
      if (user?.uid) {
        const userStored = await AsyncStorage.getItem(`${STORAGE_KEY}_${user.uid}`);
        if (userStored) {
          rawLocal = JSON.parse(userStored);
        }
      }

      if (rawLocal.length === 0) {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const allContacts = stored ? JSON.parse(stored) : [];
        rawLocal = allContacts.filter(c => (user?.uid ? c.userId === user.uid : true) || !c.userId);
      }

      // Strictly deduplicate local records
      const seen = new Set();
      const dedupedLocal = [];
      for (const c of rawLocal) {
        const key = getStableContactKey(c);
        if (key && !seen.has(key)) {
          seen.add(key);
          dedupedLocal.push({ ...c, userId: user?.uid });
        }
      }

      setContacts(dedupedLocal);
      return dedupedLocal;
    } catch (e) {
      console.error('[ContactsScreen] Failed to load local contacts', e);
      return [];
    }
  }, [user]);

  /**
   * Performs cloud synchronization with backend API and Firestore.
   */
  const syncContactsWithBackend = useCallback(async (isManual = false) => {
    if (syncInProgress.current) return;
    syncInProgress.current = true;
    setIsSyncing(true);
    setSyncStatus(null);
    
    try {
      const backendContacts = await api.getContacts();
      if (!Array.isArray(backendContacts)) {
        throw new Error('Invalid backend response');
      }

      // Process pending offline deletions
      const pendingKey = user?.uid ? `pending_contact_deletes_${user.uid}` : 'pending_contact_deletes';
      const pending = await AsyncStorage.getItem(pendingKey);
      let pendingDeletes = pending ? JSON.parse(pending) : [];
      const remainingDeletes = [];
      
      for (const delId of pendingDeletes) {
        try {
          await api.deleteContact(delId);
        } catch(e) {
          remainingDeletes.push(delId);
        }
      }
      
      if (remainingDeletes.length !== pendingDeletes.length) {
        await AsyncStorage.setItem(pendingKey, JSON.stringify(remainingDeletes));
      }

      const validBackend = backendContacts.filter(bc => !remainingDeletes.includes(bc.id));

      // Map backend records
      const mapped = validBackend.map(bc => ({
        id: bc.id.toString(),
        backendId: bc.id,
        userId: user?.uid,
        name: bc.name,
        phone: bc.phone,
        relation: bc.relation,
        isPrimary: bc.is_primary
      }));

      // Load local cache to check for offline additions
      const currentLocal = await loadLocalContacts();
      
      // An unsynced local contact is one that has NO matching record in validBackend by ID or phone
      const unsyncedLocal = currentLocal.filter(lc => {
        return !validBackend.some(bc => areContactsMatching(lc, {
          id: bc.id.toString(),
          backendId: bc.id,
          phone: bc.phone,
          name: bc.name
        }));
      });

      // Synchronize genuinely new offline contacts to backend
      for (const uc of unsyncedLocal) {
        try {
          const bc = await api.createContact({
            name: uc.name,
            phone: uc.phone,
            relation: uc.relation || 'Emergency Contact',
            is_primary: uc.isPrimary || false
          });
          if (bc && bc.id) {
            mapped.push({
              id: bc.id.toString(),
              backendId: bc.id,
              userId: user?.uid,
              name: bc.name,
              phone: bc.phone,
              relation: bc.relation,
              isPrimary: bc.is_primary
            });
          }
        } catch (err) {
          // If creation fails due to offline or error, keep it locally to retry
          mapped.push(uc);
        }
      }

      // Canonical deduplication using stable keys
      const seen = new Set();
      const finalMerged = [];
      // Sort primary contacts first
      const sortedMapped = [...mapped].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
      for (const c of sortedMapped) {
        const key = getStableContactKey(c);
        if (key && !seen.has(key)) {
          seen.add(key);
          finalMerged.push({ ...c, userId: user?.uid });
        }
      }

      setContacts(finalMerged);
      await saveContacts(finalMerged);
      setSyncStatus('success');
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSyncedText(`Synced at ${timeStr}`);
    } catch (backendErr) {
      console.log("[ContactsScreen] Cloud sync failed, using cached contacts:", backendErr.message);
      setSyncStatus('offline');
      setLastSyncedText('Offline • Displaying cached contacts');
    } finally {
      setIsSyncing(false);
      syncInProgress.current = false;
    }
  }, [user, loadLocalContacts, saveContacts]);

  // Initial load & focus refresh
  useEffect(() => {
    if (user) {
      loadLocalContacts().then(() => {
        syncContactsWithBackend();
      });
    }

    const unsubscribe = navigation?.addListener ? navigation.addListener('focus', () => {
      if (user && !syncInProgress.current) {
        loadLocalContacts().then(() => {
          syncContactsWithBackend();
        });
      }
    }) : undefined;

    return unsubscribe;
  }, [user, navigation, loadLocalContacts, syncContactsWithBackend]);

  const handleSaveContact = async () => {
    if (!newName.trim() || !newPhone.trim()) {
      Alert.alert('Error', 'Please enter both name and phone number');
      return;
    }

    if (editingContact) {
      const updatedContact = { ...editingContact, name: newName.trim(), phone: newPhone.trim() };
      const updated = contacts.map(c => c.id === editingContact.id ? updatedContact : c);
      setContacts(updated);
      
      try {
        await saveContacts(updated);
        setIsAdding(false);
        setEditingContact(null);
        setNewName('');
        setNewPhone('');

        if (editingContact.backendId) {
          try {
            await api.updateContact(editingContact.backendId, {
              name: newName.trim(),
              phone: newPhone.trim(),
            });
          } catch (e) {
            console.log("[ContactsScreen] Failed to update on backend:", e.message);
          }
        }
      } catch (e) {
        console.error('[ContactsScreen] Failed to update contact', e);
      }
      return;
    }

    // New Contact Creation
    const tempId = `temp-${Date.now()}`;
    const newContact = {
      id: tempId,
      userId: user?.uid,
      name: newName.trim(),
      phone: newPhone.trim(),
      relation: 'Emergency Contact',
      isPrimary: contacts.length === 0,
    };

    // Optimistic local update
    const updated = [...contacts, newContact];
    setContacts(updated);
    
    try {
      await saveContacts(updated);
      setIsAdding(false);
      setNewName('');
      setNewPhone('');

      // Background cloud sync
      try {
        const backendContact = await api.createContact({
          name: newContact.name,
          phone: newContact.phone,
          relation: newContact.relation,
          is_primary: newContact.isPrimary
        });
        
        if (backendContact && backendContact.id) {
          const finalContacts = updated.map(c => 
            c.id === tempId 
              ? { 
                  ...c, 
                  id: backendContact.id.toString(), 
                  backendId: backendContact.id, 
                  userId: user?.uid,
                  name: backendContact.name,
                  phone: backendContact.phone
                } 
              : c
          );
          setContacts(finalContacts);
          await saveContacts(finalContacts);
        }
      } catch (backendErr) {
        console.log("[ContactsScreen] Failed to sync new contact to backend, keeping local", backendErr.message);
      }
    } catch (e) {
      console.error('[ContactsScreen] Failed to save contact', e);
    }
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setNewName(contact.name);
    setNewPhone(contact.phone);
    setIsAdding(true);
  };

  const confirmDelete = (id) => {
    Alert.alert(
      "Remove Contact",
      "Are you sure you want to remove this emergency contact?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: () => handleDelete(id) }
      ]
    );
  };

  const handleDelete = async (id) => {
    const contactToDelete = contacts.find(c => c.id === id);
    const updated = contacts.filter(c => c.id !== id);
    setContacts(updated);
    try {
      await saveContacts(updated);
      
      const backendIdToDelete = contactToDelete?.backendId || (!isNaN(id) && id.toString().length < 10 ? parseInt(id, 10) : null);
      
      if (backendIdToDelete) {
        try {
          await api.deleteContact(backendIdToDelete);
        } catch (backendErr) {
          console.log("[ContactsScreen] Failed to delete contact from backend:", backendErr.message);
          const is404 = backendErr.status === 404 || (backendErr.message && backendErr.message.includes('404'));
          if (!is404) {
            const pendingKey = user?.uid ? `pending_contact_deletes_${user.uid}` : 'pending_contact_deletes';
            const pending = await AsyncStorage.getItem(pendingKey);
            const pendingDeletes = pending ? JSON.parse(pending) : [];
            if (!pendingDeletes.includes(backendIdToDelete)) {
              pendingDeletes.push(backendIdToDelete);
              await AsyncStorage.setItem(pendingKey, JSON.stringify(pendingDeletes));
            }
          }
        }
      }
    } catch (e) {
      console.error('[ContactsScreen] Failed to delete contact', e);
    }
  };

  const renderContact = ({ item }) => (
    <Card style={styles.contactCard} variant="flat">
      <View style={styles.contactInfo}>
        <View style={styles.avatar}>
          <User size={20} color={colors.accentBrand || colors.textPrimary} />
        </View>
        <View style={styles.textContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.contactName}>{item.name}</Text>
            {item.isPrimary && (
              <View style={styles.primaryBadge}>
                <Text style={styles.primaryBadgeText}>Primary</Text>
              </View>
            )}
          </View>
          <Text style={styles.contactPhone}>{item.phone}</Text>
        </View>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.actionBtn} 
          onPress={() => handleEdit(item)}
          activeOpacity={0.7}
        >
          <Pencil size={18} color={colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteBtn} 
          onPress={() => confirmDelete(item.id)}
          activeOpacity={0.7}
        >
          <Trash2 size={18} color={colors.accentEmergency} />
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <ScreenWrapper scrollable={false} contentContainerStyle={styles.container}>
      {/* Top Header with working manual Cloud Sync Button */}
      <SecondaryHeader 
        title="Trusted Network" 
        rightAction={
          <TouchableOpacity 
            onPress={() => syncContactsWithBackend(true)}
            disabled={isSyncing}
            style={[styles.syncHeaderBtn, isSyncing && styles.syncHeaderBtnDisabled]}
            activeOpacity={0.7}
            accessibilityLabel="Sync contacts with cloud"
          >
            {isSyncing ? (
              <ActivityIndicator size="small" color={colors.accentBrand || colors.textPrimary} />
            ) : (
              <RotateCw size={18} color={colors.accentBrand || colors.textPrimary} />
            )}
            <Text style={styles.syncBtnText}>{isSyncing ? 'Syncing...' : 'Sync'}</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.header}>
        <Text style={styles.subtitle}>These contacts will be notified during an SOS emergency.</Text>
        
        {/* Sync Status Banner */}
        {lastSyncedText ? (
          <View style={[
            styles.syncStatusBanner,
            syncStatus === 'success' && styles.syncBannerSuccess,
            syncStatus === 'offline' && styles.syncBannerOffline,
          ]}>
            {syncStatus === 'success' ? (
              <CheckCircle2 size={13} color="#059669" />
            ) : syncStatus === 'offline' ? (
              <AlertCircle size={13} color="#D97706" />
            ) : (
              <RotateCw size={13} color={colors.textSecondary} />
            )}
            <Text style={styles.syncStatusText}>{lastSyncedText}</Text>
          </View>
        ) : null}
      </View>

      {isAdding ? (
        <Card style={styles.addForm}>
          <Text style={styles.formTitle}>{editingContact ? 'Edit Contact' : 'Add New Contact'}</Text>
          <Input 
            label="Name" 
            placeholder="e.g. Mom" 
            value={newName} 
            onChangeText={setNewName} 
            leadingIcon={<User size={18} color={colors.textSecondary} />}
          />
          <Input 
            label="Phone Number" 
            placeholder="e.g. +91 98765 43210" 
            value={newPhone} 
            onChangeText={setNewPhone} 
            keyboardType="phone-pad"
            leadingIcon={<Phone size={18} color={colors.textSecondary} />}
          />
          <View style={styles.formActions}>
            <Button 
              title="Cancel" 
              variant="ghost" 
              onPress={() => {
                setIsAdding(false);
                setEditingContact(null);
                setNewName('');
                setNewPhone('');
              }} 
              style={styles.cancelBtn} 
            />
            <Button 
              title="Save Contact" 
              onPress={handleSaveContact} 
              style={styles.saveBtn} 
            />
          </View>
        </Card>
      ) : (
        <View style={styles.listContainer}>
          <Button 
            title="Add Trusted Contact" 
            icon={<UserPlus size={20} color="#FFF" />} 
            onPress={() => setIsAdding(true)} 
            style={styles.addBtn}
          />
          
          <FlatList
            data={contacts}
            keyExtractor={(item) => getStableContactKey(item)}
            renderItem={renderContact}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <User size={32} color={colors.textMuted} />
                </View>
                <Text style={styles.emptyTitle}>No Emergency Contacts</Text>
                <Text style={styles.emptySubtitle}>
                  Add family members or trusted friends who should be immediately alerted via SMS and phone call during an SOS.
                </Text>
              </View>
            }
          />
        </View>
      )}
    </ScreenWrapper>
  );
}

const getStyles = (colors, shadows, isDark) => StyleSheet.create({
  container: {
    paddingBottom: 0,
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 13,
  },
  syncHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  syncHeaderBtnDisabled: {
    opacity: 0.6,
  },
  syncBtnText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 12,
  },
  syncStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: colors.bgSecondary,
    alignSelf: 'flex-start',
  },
  syncBannerSuccess: {
    backgroundColor: 'rgba(5, 150, 105, 0.08)',
  },
  syncBannerOffline: {
    backgroundColor: 'rgba(217, 119, 6, 0.08)',
  },
  syncStatusText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  addForm: {
    padding: spacing.lg,
    backgroundColor: colors.bgSecondary,
    marginHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
  },
  addBtn: {
    marginBottom: spacing.lg,
  },
  listContent: {
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.bgSecondary,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  textContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactName: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  primaryBadge: {
    backgroundColor: 'rgba(166, 25, 69, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  primaryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accentBrand || '#A61945',
  },
  contactPhone: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentEmergencyMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.subhead,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
  formTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  cancelBtn: {
    width: 'auto',
  },
  saveBtn: {
    width: 'auto',
    flex: 1,
  }
});
