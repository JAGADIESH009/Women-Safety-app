import { Platform, Linking, PermissionsAndroid } from 'react-native';
import * as Location from 'expo-location';
import ExpoDirectSms from '../../modules/expo-direct-sms/src/ExpoDirectSmsModule';

export async function sendEmergencySMS(contacts, message) {
  console.log('[SMS] ENTER sendEmergencySMS');
  console.log(`[SMS] contacts count: ${contacts ? contacts.length : 0}`);
  
  if (!contacts || contacts.length === 0) return [];

  const results = [];
  
  console.log(`[SMS] native module exists: ${!!ExpoDirectSms}`);
  
  if (Platform.OS === 'web' || !ExpoDirectSms) {
    // Web doesn't support background SMS, and missing native modules (e.g. in Expo Go) are unavailable
    return contacts.map(c => ({ contact: c, status: 'UNAVAILABLE' }));
  }

  if (Platform.OS === 'android') {
    try {
      // Race the permission request against a timeout in case the OS blocks it
      const granted = await Promise.race([
        PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.SEND_SMS,
          {
            title: 'SMS Permission',
            message: 'This app needs access to send SMS for emergency alerts.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        ),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Permission request timed out')), 5000))
      ]);
      
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        // Fallback: If SEND_SMS permission is denied, open native SMS composer for primary contact
        try {
          const primary = contacts.find(c => c.isPrimary) || contacts[0];
          if (primary && primary.phone) {
            const cleanPhone = primary.phone.replace(/[\s\-\(\)]/g, '');
            const smsUrl = `sms:${cleanPhone}?body=${encodeURIComponent(message)}`;
            Linking.canOpenURL(smsUrl).then(supported => {
              if (supported) Linking.openURL(smsUrl);
            }).catch(() => {});
          }
        } catch (fallbackErr) {
          console.warn('[SMS] Fallback SMS composer error:', fallbackErr);
        }
        return contacts.map(c => ({ contact: c, status: 'PERMISSION_DENIED', error: 'Android SEND_SMS permission denied by user' }));
      }
    } catch (err) {
      console.warn('[SMS] Failed to request SMS permission:', err);
    }
  }


  for (const contact of contacts) {
    console.log(`[SMS] processing contact: ${contact.name}, phone: ${contact.phone}, enabled: ${contact.enabled}`);
    if (!contact.phone) {
        results.push({ contact, status: 'UNAVAILABLE', error: 'No phone number' });
        continue;
    }

    try {
      // Remove spaces, dashes, and parens for Android SmsManager
      const sanitizedPhone = contact.phone.replace(/[\s\-\(\)]/g, '');
      console.log(`[SMS] BEFORE native call to ${sanitizedPhone}`);
      
      // Strict timeout around the native SMS call
      const success = await Promise.race([
        ExpoDirectSms.sendSmsAsync(sanitizedPhone, message),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Native SMS module timed out')), 8000))
      ]);
      
      console.log(`[SMS] AFTER native call: success=${success}`);
      if (success) {
        results.push({ contact, status: 'DISPATCHED' });
      } else {
        results.push({ contact, status: 'FAILED', error: 'Native module returned false' });
      }
    } catch (e) {
      console.log(`[SMS] ERROR native call for ${contact.name}:`, e);
      if (e.message && e.message.includes('Permission')) {
        results.push({ contact, status: 'PERMISSION_DENIED', error: e.message });
      } else {
        results.push({ contact, status: 'FAILED', error: e.message });
      }
    }
  }

  return results;
}

export async function initiateEmergencyCall(contact) {
  console.log('[CALL] ENTER initiateEmergencyCall');
  if (!contact || !contact.phone) return { status: 'FAILED', error: 'No phone number' };
  
  if (Platform.OS === 'web') {
    return { status: 'CALL_UNAVAILABLE', error: 'Web platform does not support calling' };
  }

  if (Platform.OS === 'android') {
    try {
      const granted = await Promise.race([
        PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CALL_PHONE,
          {
            title: 'Phone Call Permission',
            message: 'This app needs access to make phone calls for emergencies.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        ),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Permission request timed out')), 5000))
      ]);
      
      if (granted === PermissionsAndroid.RESULTS.GRANTED && ExpoDirectSms?.makeCallAsync) {
        try {
          console.log(`[CALL] BEFORE native call to ${contact.phone}`);
          
          await Promise.race([
            ExpoDirectSms.makeCallAsync(contact.phone),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Native CALL module timed out')), 8000))
          ]);
          
          console.log(`[CALL] AFTER native call SUCCESS`);
          return { status: 'CALL_INITIATED' };
        } catch (e) {
          console.log('[CALL] EXCEPTION in native call:', e);
          // Fall through to dialer
        }
      }
    } catch (err) {
      console.warn('[CALL] Failed to request CALL_PHONE permission', err);
    }
  }

  try {
    const url = `tel:${contact.phone}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
      return { status: 'DIALER_OPENED' };
    } else {
      return { status: 'CALL_UNAVAILABLE', error: 'Linking not supported' };
    }
  } catch (e) {
    console.log('[CALL] Error opening dialer:', e);
    return { status: 'FAILED', error: e.message };
  }
}

export function buildEmergencyMessage(userName, incidentType, locationName, lat, lng, isReport = false) {
  const timeStr = new Date().toLocaleTimeString();
  const hasCoords = lat != null && lng != null;
  const displayLocation = locationName || (hasCoords ? `${lat}, ${lng}` : 'Unknown');
  const mapLine = hasCoords ? `\n\nMap:\nhttps://maps.google.com/?q=${lat},${lng}` : '';
  
  if (isReport) {
    return `⚠️ SAFETY INCIDENT REPORT\n\nIncident type: ${incidentType}\nReported by: ${userName || 'User'}\n\nLocation:\n${displayLocation}${mapLine}\n\nTime:\n${timeStr}\n\nPlease check on me.`;
  }
  
  return `🚨 EMERGENCY ALERT\n${userName ? userName + ' has' : 'I have'} triggered an SOS.\n\nLocation:\n${displayLocation}${mapLine}\n\nTime:\n${timeStr}\n\nPlease contact immediately.`;
}
