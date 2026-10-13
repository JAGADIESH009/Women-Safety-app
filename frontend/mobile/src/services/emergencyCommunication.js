import { Platform, Linking, PermissionsAndroid } from 'react-native';
import * as Location from 'expo-location';
import ExpoDirectSms from '../../modules/expo-direct-sms/src/ExpoDirectSmsModule';

export async function sendEmergencySMS(contacts, message) {
  console.log('[SMS] ENTER sendEmergencySMS');
  console.log(`[SMS] contacts count: ${contacts ? contacts.length : 0}`);
  
  if (!contacts || contacts.length === 0) return [];

  const results = [];
  
  // If native module is missing or on web, fallback to opening native SMS composer for primary contact
  if (Platform.OS === 'web' || !ExpoDirectSms) {
    try {
      const primary = contacts.find(c => c.isPrimary) || contacts[0];
      if (primary && primary.phone) {
        const cleanPhone = primary.phone.replace(/[\s\-\(\)]/g, '');
        const smsUrl = `sms:${cleanPhone}?body=${encodeURIComponent(message)}`;
        if (await Linking.canOpenURL(smsUrl)) {
          await Linking.openURL(smsUrl);
          return contacts.map(c => ({ contact: c, status: 'COMPOSER_OPENED' }));
        }
      }
    } catch (e) {}
    return contacts.map(c => ({ contact: c, status: 'UNAVAILABLE' }));
  }

  let sendSmsGranted = false;
  if (Platform.OS === 'android') {
    try {
      const checkResult = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.SEND_SMS);
      if (checkResult) {
        sendSmsGranted = true;
      } else {
        const granted = await Promise.race([
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.SEND_SMS,
            {
              title: 'Emergency SMS Permission',
              message: 'SafeHer sends emergency alerts to your trusted contacts during an SOS.',
              buttonNeutral: 'Ask Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'Allow',
            }
          ),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Permission request timed out')), 5000))
        ]);
        sendSmsGranted = (granted === PermissionsAndroid.RESULTS.GRANTED);
      }
    } catch (err) {
      console.warn('[SMS] Failed to check/request SMS permission:', err);
    }
  }

  // If SEND_SMS permission is not granted, fallback to opening native SMS composer
  if (!sendSmsGranted) {
    console.log('[SMS] SEND_SMS permission not granted; falling back to native SMS composer');
    try {
      const recipientPhones = contacts
        .filter(c => c.phone)
        .map(c => c.phone.replace(/[\s\-\(\)]/g, ''))
        .filter(Boolean);

      const targetPhone = recipientPhones.join(';') || recipientPhones[0] || '';
      const smsUrl = targetPhone ? `sms:${targetPhone}?body=${encodeURIComponent(message)}` : `sms:?body=${encodeURIComponent(message)}`;
      
      const canOpen = await Linking.canOpenURL(smsUrl);
      if (canOpen) {
        await Linking.openURL(smsUrl);
        return contacts.map(c => ({ contact: c, status: 'COMPOSER_OPENED' }));
      }
    } catch (fallbackErr) {
      console.warn('[SMS] Fallback SMS composer error:', fallbackErr);
    }
    return contacts.map(c => ({ 
      contact: c, 
      status: 'PERMISSION_DENIED', 
      error: 'Android SEND_SMS permission denied and SMS composer could not be opened' 
    }));
  }

  for (const contact of contacts) {
    console.log(`[SMS] processing contact: ${contact.name}, phone: ${contact.phone}, enabled: ${contact.enabled}`);
    if (!contact.phone) {
      results.push({ contact, status: 'UNAVAILABLE', error: 'No phone number' });
      continue;
    }

    try {
      const sanitizedPhone = contact.phone.replace(/[\s\-\(\)]/g, '');
      console.log(`[SMS] BEFORE native direct SMS call to ${sanitizedPhone}`);
      
      const success = await Promise.race([
        ExpoDirectSms.sendSmsAsync(sanitizedPhone, message),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Native SMS module timed out')), 8000))
      ]);
      
      console.log(`[SMS] AFTER native call: success=${success}`);
      if (success) {
        results.push({ contact, status: 'DISPATCHED' });
      } else {
        // Fallback to composer on failure
        const smsUrl = `sms:${sanitizedPhone}?body=${encodeURIComponent(message)}`;
        if (await Linking.canOpenURL(smsUrl)) {
          await Linking.openURL(smsUrl);
          results.push({ contact, status: 'COMPOSER_OPENED', error: 'Direct send returned false; composer opened' });
        } else {
          results.push({ contact, status: 'FAILED', error: 'Native module returned false' });
        }
      }
    } catch (e) {
      console.log(`[SMS] ERROR native call for ${contact.name}:`, e);
      try {
        const sanitizedPhone = contact.phone.replace(/[\s\-\(\)]/g, '');
        const smsUrl = `sms:${sanitizedPhone}?body=${encodeURIComponent(message)}`;
        if (await Linking.canOpenURL(smsUrl)) {
          await Linking.openURL(smsUrl);
          results.push({ contact, status: 'COMPOSER_OPENED', error: e.message });
          continue;
        }
      } catch (composerErr) {}

      results.push({ 
        contact, 
        status: e.message?.includes('Permission') ? 'PERMISSION_DENIED' : 'FAILED', 
        error: e.message 
      });
    }
  }

  return results;
}

export async function initiateEmergencyCall(contact, emergencyNumberOverride = null) {
  console.log('[CALL] ENTER initiateEmergencyCall');
  // Strict priority: Primary contact's phone first, then override, then 112
  const targetNumber = contact?.phone || emergencyNumberOverride || '112';
  
  if (Platform.OS === 'web') {
    return { status: 'CALL_UNAVAILABLE', error: 'Web platform does not support calling' };
  }

  const cleanNumber = String(targetNumber).replace(/[\s\-\(\)]/g, '');
  console.log(`[CALL] Target number determined: ${cleanNumber} (Contact: ${contact?.name || 'Emergency'})`);

  // 1. Direct emergency phone call via native module with CALL_PHONE permission
  if (Platform.OS === 'android' && ExpoDirectSms && typeof ExpoDirectSms.makeCallAsync === 'function') {
    try {
      let callGranted = false;
      const checkResult = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CALL_PHONE);
      if (checkResult) {
        callGranted = true;
      } else {
        const granted = await Promise.race([
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CALL_PHONE,
            {
              title: 'Emergency Call Permission',
              message: 'SafeHer calls your primary emergency contact immediately during an SOS emergency.',
              buttonNeutral: 'Ask Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'Allow',
            }
          ),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Permission request timed out')), 2000))
        ]);
        callGranted = (granted === PermissionsAndroid.RESULTS.GRANTED);
      }

      if (callGranted) {
        console.log(`[CALL] Placing direct call to primary contact: ${cleanNumber}`);
        await ExpoDirectSms.makeCallAsync(cleanNumber);
        return { status: 'CALL_PLACED', number: cleanNumber, contactName: contact?.name };
      }
    } catch (directErr) {
      console.warn('[CALL] Direct call failed, falling back to dialer:', directErr.message);
    }
  }

  // 2. Fallback: Open native phone dialer with primary contact number
  try {
    const url = `tel:${cleanNumber}`;
    try {
      await Linking.openURL(url);
      console.log(`[CALL] Successfully opened native dialer for ${cleanNumber}`);
      return { status: 'DIALER_OPENED', number: cleanNumber, contactName: contact?.name };
    } catch (openErr) {
      const supported = await Linking.canOpenURL(url).catch(() => false);
      if (!supported) {
        return { status: 'CALL_UNAVAILABLE', error: 'Phone dialer URL not supported on this device' };
      }
      throw openErr;
    }
  } catch (e) {
    console.error('[CALL] Error opening phone dialer:', e);
    return { status: 'FAILED', error: e.message };
  }
}

export function buildEmergencyMessage(userName, incidentType, locationName, lat, lng, isReport = false, trackingUrl = null) {
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const hasCoords = lat != null && lng != null && !isNaN(Number(lat)) && !isNaN(Number(lng));
  const coordsStr = hasCoords ? `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}` : null;
  const displayLocation = locationName ? `${locationName}${coordsStr ? ` (${coordsStr})` : ''}` : (coordsStr || 'Location unavailable');
  
  let linkSection = '';

  // 1. Live location sharing session link
  if (trackingUrl) {
    let cleanUrl = String(trackingUrl).trim();
    // Normalize domain and routes so SMS apps parse the URL cleanly without breaking
    cleanUrl = cleanUrl.replace('https://safeher-public-website.vercel.app', 'https://safeherweb.vercel.app');
    cleanUrl = cleanUrl.replace('/#/track?', '/track?').replace('#track?', 'track?');
    if (!cleanUrl.startsWith('http')) {
      cleanUrl = `https://safeherweb.vercel.app/track?token=${encodeURIComponent(cleanUrl)}`;
    }
    linkSection += `\n\nLive Track:\n${cleanUrl}`;
  }

  // 2. Exact Google Maps Pin (always provide direct navigation pin when GPS is available)
  if (hasCoords) {
    const mapsUrl = `https://maps.google.com/?q=${Number(lat).toFixed(6)},${Number(lng).toFixed(6)}`;
    linkSection += `\n\nGoogle Maps:\n${mapsUrl}`;
  }

  if (linkSection) {
    linkSection += '\n';
  }
  
  if (isReport) {
    return `[SAFEHER INCIDENT REPORT]\n${userName || 'User'} reported: ${incidentType}\n\nLocation:\n${displayLocation}${linkSection}\nTime: ${timeStr}\n\nPlease check on me.`;
  }
  
  return `[SAFEHER EMERGENCY ALERT]\n${userName ? userName + ' has' : 'I have'} triggered an SOS.\n\nLocation:\n${displayLocation}${linkSection}\nTime: ${timeStr}\n\nPlease help immediately!`;
}
