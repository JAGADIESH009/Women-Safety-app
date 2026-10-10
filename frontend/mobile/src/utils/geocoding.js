import { Platform } from 'react-native';
import * as Location from 'expo-location';

export async function getReverseGeocode(lat, lng) {
  if (!lat || !lng) return null;

  try {
    // Nominatim Reverse Geocoding
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2&zoom=18&addressdetails=1`, {
      headers: { 
        'Accept-Language': 'en-US,en',
        'User-Agent': 'WppSafetyApp/1.0.0 (wppsafety@gmail.com)'
      }
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data.address) {
        const parts = [];
        const addr = data.address;
        
        const local = addr.road || addr.neighbourhood || addr.suburb;
        if (local) parts.push(local);
        
        const place = addr.city || addr.town || addr.village || addr.municipality || addr.county;
        if (place && place !== local) parts.push(place);
        
        if (addr.state) parts.push(addr.state);
        
        if (parts.length > 0) {
          return parts.join(', ');
        }
        
        if (data.display_name) {
           return data.display_name.split(',').slice(0, 3).join(', ');
        }
      }
    }
  } catch (err) {
    console.log('Reverse geocoding failed:', err);
  }
  
  // Fallback to Expo Location if Nominatim fails (mostly useful on native)
  try {
    const geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    if (geocode && geocode.length > 0) {
      const place = geocode[0];
      const parts = [];
      const placeName = place.city || place.subregion || place.district || place.street;
      if (placeName) parts.push(placeName);
      if (place.region) parts.push(place.region);
      
      if (parts.length > 0) {
        return parts.join(', ');
      }
    }
  } catch (expoErr) {
    console.log('Expo reverse geocoding fallback failed:', expoErr);
  }
  
  return null;
}
