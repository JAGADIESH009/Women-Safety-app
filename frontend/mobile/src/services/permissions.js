import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';
import * as Location from 'expo-location';

/**
 * SafeHer Permission Management
 * Handles permission checks, interactive user prompts, denial explanations,
 * and permanent denial (navigates to Android App Settings).
 */

export const PERMISSION_DESCRIPTIONS = {
  location: {
    title: 'Location Permission',
    purpose: 'GPS location is required to attach your precise coordinates and map link to emergency alerts and track your route during an active SOS.',
  },
  sms: {
    title: 'Emergency SMS Permission',
    purpose: 'Direct SMS permission allows SafeHer to automatically send immediate distress messages to your trusted contacts even without mobile data or internet access.',
  },
  phone: {
    title: 'Phone Call Permission',
    purpose: 'Phone call permission allows SafeHer to immediately dial your primary emergency contact when SOS is activated.',
  },
  notifications: {
    title: 'Notifications Permission',
    purpose: 'Notification permission ensures you receive critical safety warnings, check-in reminders, and active emergency status alerts.',
  },
};

export async function checkAllPermissions() {
  const result = {
    location: false,
    sms: false,
    phone: false,
    notifications: false,
  };

  if (Platform.OS === 'web') {
    return { location: true, sms: false, phone: false, notifications: false };
  }

  // 1. Location
  try {
    const locStatus = await Location.getForegroundPermissionsAsync();
    result.location = locStatus.granted;
  } catch (e) {
    console.log('Location check error:', e);
  }

  // 2. Android specific permissions
  if (Platform.OS === 'android') {
    try {
      result.sms = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.SEND_SMS);
    } catch (e) {
      console.log('SMS check error:', e);
    }

    try {
      result.phone = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CALL_PHONE);
    } catch (e) {
      console.log('Phone check error:', e);
    }

    try {
      if (Platform.Version >= 33) {
        result.notifications = await PermissionsAndroid.check(
          'android.permission.POST_NOTIFICATIONS'
        );
      } else {
        result.notifications = true; // Auto-granted on older Android versions
      }
    } catch (e) {
      console.log('Notification check error:', e);
    }
  }

  return result;
}

export function openAppSettings() {
  Linking.openSettings().catch(() => {
    Alert.alert('Settings', 'Unable to open app settings automatically. Please open your device Settings > Apps > SafeHer > Permissions.');
  });
}

function showPermanentDenialAlert(permissionName, desc) {
  Alert.alert(
    `${desc.title} Disabled`,
    `${desc.purpose}\n\nThis permission is currently disabled. Please enable it in device settings to use this feature.`,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Settings', onPress: openAppSettings },
    ]
  );
}

export async function requestLocationPermission() {
  try {
    const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') return true;

    if (!canAskAgain) {
      showPermanentDenialAlert('location', PERMISSION_DESCRIPTIONS.location);
    } else {
      Alert.alert(
        PERMISSION_DESCRIPTIONS.location.title,
        PERMISSION_DESCRIPTIONS.location.purpose
      );
    }
    return false;
  } catch (e) {
    console.warn('Failed to request location permission:', e);
    return false;
  }
}

export async function requestSmsPermission() {
  if (Platform.OS !== 'android') return false;
  try {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.SEND_SMS,
      {
        title: PERMISSION_DESCRIPTIONS.sms.title,
        message: PERMISSION_DESCRIPTIONS.sms.purpose,
        buttonPositive: 'Allow',
        buttonNegative: 'Not Now',
      }
    );

    if (result === PermissionsAndroid.RESULTS.GRANTED) return true;
    if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      showPermanentDenialAlert('sms', PERMISSION_DESCRIPTIONS.sms);
    }
    return false;
  } catch (e) {
    console.warn('Failed to request SMS permission:', e);
    return false;
  }
}

export async function requestPhonePermission() {
  if (Platform.OS !== 'android') return false;
  try {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CALL_PHONE,
      {
        title: PERMISSION_DESCRIPTIONS.phone.title,
        message: PERMISSION_DESCRIPTIONS.phone.purpose,
        buttonPositive: 'Allow',
        buttonNegative: 'Not Now',
      }
    );

    if (result === PermissionsAndroid.RESULTS.GRANTED) return true;
    if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      showPermanentDenialAlert('phone', PERMISSION_DESCRIPTIONS.phone);
    }
    return false;
  } catch (e) {
    console.warn('Failed to request Phone permission:', e);
    return false;
  }
}

export async function requestNotificationPermission() {
  if (Platform.OS !== 'android' || Platform.Version < 33) return true;
  try {
    const result = await PermissionsAndroid.request(
      'android.permission.POST_NOTIFICATIONS',
      {
        title: PERMISSION_DESCRIPTIONS.notifications.title,
        message: PERMISSION_DESCRIPTIONS.notifications.purpose,
        buttonPositive: 'Allow',
        buttonNegative: 'Not Now',
      }
    );

    if (result === PermissionsAndroid.RESULTS.GRANTED) return true;
    if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      showPermanentDenialAlert('notifications', PERMISSION_DESCRIPTIONS.notifications);
    }
    return false;
  } catch (e) {
    console.warn('Failed to request Notification permission:', e);
    return false;
  }
}
