import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { SecondaryHeader } from '../components/ui/SecondaryHeader';
import { UserPlus, User, Trash2, Phone, Pencil } from 'lucide-react-native';
import { useAppTheme, spacing, typography, borderRadius } from '../utils/theme';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STORAGE_KEY = 'women_safety_contacts';

export function ContactsScreen() {
  const [contacts, setContacts] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const syncInProgress = React.useRef(false);
  
  const { colors, shadows, isDark } = useAppTheme();
  const styles = useMemo(() => getStyles(colors, shadows, isDark), [colors, shadows, isDark]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadLocalContacts().then(() => {
        syncContactsWithBackend();
      });
    }
  }, [user]);

  const saveContacts = async (userContactsToSave) => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const allContacts = stored ? JSON.parse(stored) : [];
      // Remove current user's old contacts and legacy contacts (no userId), append new ones
      const otherContacts = allContacts.filter(c => c.userId && c.userId !== user?.uid);
      const updatedAll = [...otherContacts, ...userContactsToSave];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAll));
    } catch (e) {
      console.error("Failed to save contacts", e);
    }
  };

  const loadLocalContacts = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const allLocalContacts = stored ? JSON.parse(stored) : [];
      let localContacts = allLocalContacts.filter(c => c.userId === user?.uid || !c.userId);

      if (localContacts.length === 0) {
        const defaultContacts = [
          { id: `local-1-${Date.now()}`, userId: user?.uid, name: 'Mom', phone: '+1234567890', relation: 'Family', isPrimary: true },
          { id: `local-2-${Date.now()}`, userId: user?.uid, name: 'Dad', phone: '+0987654321', relation: 'Family', isPrimary: false },
          { id: `local-3-${Date.now()}`, userId: user?.uid, name: 'Roommate', phone: '+1122334455', relation: 'Friend', isPrimary: false },
        ];
        setContacts(defaultContacts);
        await saveContacts(defaultContacts);
      } else {
        setContacts(localContacts);
      }
    } catch (e) {
      console.error('Failed to load local contacts', e);
    }
  };

  const syncContactsWithBackend = async () => {
    if (syncInProgress.current) return;
    syncInProgress.current = true;
    setIsSyncing(true);
    
    try {
      const backendContacts = await api.getContacts();
      if (!backendContacts) return;

      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const allLocalContacts = stored ? JSON.parse(stored) : [];
      let localContacts = allLocalContacts.filter(c => c.userId === user?.uid || !c.userId);

      // Process offline deletions
      const pending = await AsyncStorage.getItem(`pending_contact_deletes_${user?.uid}`);
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
          await AsyncStorage.setItem(`pending_contact_deletes_${user?.uid}`, JSON.stringify(remainingDeletes));
      }

      const validBackend = backendContacts.filter(bc => !remainingDeletes.includes(bc.id));

      const mapped = validBackend.map(bc => ({
          id: bc.id.toString(),
          backendId: bc.id,
          userId: user?.uid,
          name: bc.name,
          phone: bc.phone,
          relation: bc.relation,
          isPrimary: bc.is_primary
      }));
      
      // Find local contacts created offline
      const unsyncedLocal = localContacts.filter(c => !c.backendId && isNaN(c.id));
      
      for (const uc of unsyncedLocal) {
          try {
            const bc = await api.createContact({
              name: uc.name,
              phone: uc.phone,
              relation: uc.relation,
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
              mapped.push(uc); // keep it in list to retry later
          }
      }

      const mergedContacts = mapped.map(c => ({ ...c, userId: user?.uid }));
      if (mergedContacts.length > 0 || unsyncedLocal.length === 0) {
          // If length is 0 but unsyncedLocal is 0, it means backend actually returned 0 contacts and we have no pending creates.
          // In this case, we should update local to match backend.
          setContacts(mergedContacts);
          await saveContacts(mergedContacts);
      }
    } catch (backendErr) {
      console.log("Sync failed, keeping local contacts:", backendErr.message);
    } finally {
      setIsSyncing(false);
      syncInProgress.current = false;
    }
  };

  const handleSaveContact = async () => {
    if (!newName.trim() || !newPhone.trim()) {
      Alert.alert('Error', 'Please enter both name and phone number');
      return;
    }

    if (editingContact) {
      const updatedContact = { ...editingContact, name: newName, phone: newPhone };
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
              name: newName,
              phone: newPhone,
            });
          } catch (e) {
            console.log("Failed to update on backend", e.message);
          }
        } else {
          try {
            const bc = await api.createContact({
              name: newName,
              phone: newPhone,
              relation: editingContact.relation || 'Added',
              is_primary: editingContact.isPrimary || false
            });
            if (bc && bc.id) {
               const syncedContact = { ...updatedContact, backendId: bc.id, id: bc.id.toString() };
               const finalUpdated = contacts.map(c => c.id === editingContact.id ? syncedContact : c);
               setContacts(finalUpdated);
               await saveContacts(finalUpdated);
            }
          } catch (e) {
            console.log("Failed to sync edited local contact", e.message);
          }
        }
      } catch (e) {
        console.error('Failed to update contact', e);
      }
      return;
    }

    const tempId = Date.now().toString() + '-' + Math.random().toString(36).substr(2, 5);
    const newContact = {
      id: tempId,
      userId: user?.uid,
      name: newName,
      phone: newPhone,
      relation: 'Added',
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

      // Background sync
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
               ? { ...c, id: backendContact.id.toString(), backendId: backendContact.id, userId: user?.uid } 
               : c
           );
           setContacts(finalContacts);
           await saveContacts(finalContacts);
        }
      } catch (backendErr) {
        console.log("Failed to sync new contact to backend, keeping local", backendErr.message);
      }
    } catch (e) {
      console.error('Failed to save contact', e);
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
           console.log("Failed to delete contact from backend", backendErr.message);
           const is404 = backendErr.status === 404 || (backendErr.message && backendErr.message.includes('404'));
           if (!is404) {
             const pending = await AsyncStorage.getItem(`pending_contact_deletes_${user?.uid}`);
             const pendingDeletes = pending ? JSON.parse(pending) : [];
             if (!pendingDeletes.includes(backendIdToDelete)) {
                 pendingDeletes.push(backendIdToDelete);
                 await AsyncStorage.setItem(`pending_contact_deletes_${user?.uid}`, JSON.stringify(pendingDeletes));
             }
           }
         }
      }
    } catch (e) {
      console.error('Failed to delete contact', e);
    }
  };

  const renderContact = ({ item }) => (
    <Card style={styles.contactCard} variant="flat">
      <View style={styles.contactInfo}>
        <View style={styles.avatar}>
          <User size={20} color={colors.textPrimary} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactPhone}>{item.phone}</Text>
        </View>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.editBtn} 
          onPress={() => handleEdit(item)}
          activeOpacity={0.7}
        >
          <Pencil size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteBtn} 
          onPress={() => confirmDelete(item.id)}
          activeOpacity={0.7}
        >
          <Trash2 size={20} color={colors.accentEmergency} />
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <ScreenWrapper scrollable={false} contentContainerStyle={styles.container}>
      <SecondaryHeader title="Trusted Network" />
      <View style={styles.header}>
        <Text style={styles.subtitle}>These contacts will be notified during an SOS emergency.</Text>
        {isSyncing && <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>Syncing with cloud...</Text>}
      </View>

      {isAdding ? (
        <Card style={styles.addForm}>
          <Text style={styles.formTitle}>{editingContact ? 'Edit Contact' : 'Add New Contact'}</Text>
          <Input 
            label="Name" 
            placeholder="Jane Doe" 
            value={newName} 
            onChangeText={setNewName} 
            leadingIcon={<User size={18} color={colors.textSecondary} />}
          />
          <Input 
            label="Phone Number" 
            placeholder="+1 234 567 8900" 
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
            keyExtractor={(item, index) => item.id ? `${item.id}-${index}` : index.toString()}
            renderItem={renderContact}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
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
    marginBottom: spacing.xl,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  textContainer: {
    flex: 1,
  },
  contactName: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  contactPhone: {
    ...typography.subhead,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  editBtn: {
    padding: spacing.sm,
    backgroundColor: colors.bgTertiary,
    borderRadius: borderRadius.sm,
  },
  deleteBtn: {
    padding: spacing.sm,
    backgroundColor: colors.accentEmergencyMuted,
    borderRadius: borderRadius.sm,
  },
  addForm: {
    padding: spacing.lg,
    backgroundColor: colors.bgSecondary,
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
