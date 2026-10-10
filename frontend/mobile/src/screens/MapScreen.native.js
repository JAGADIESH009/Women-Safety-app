import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocation } from '../hooks/useLocation';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { MapPin, Navigation, Shield, Crosshair, AlertTriangle } from 'lucide-react-native';
import { useAppTheme, spacing, typography, borderRadius } from '../utils/theme';

export function MapScreen() {
  const { location, errorMsg, isLoading, refreshLocation } = useLocation();
  const [lastUpdated, setLastUpdated] = useState(0);
  
  const [places, setPlaces] = useState([]);
  const [isPlacesLoading, setIsPlacesLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  
  const webViewRef = useRef(null);

  const { colors, shadows, isDark } = useAppTheme();
  const styles = useMemo(() => getStyles(colors, shadows, isDark), [colors, shadows, isDark]);

  // Handle timestamp updates
  useEffect(() => {
    if (location?.timestamp) {
      const interval = setInterval(() => {
        const diff = Math.floor((Date.now() - location.timestamp) / 1000);
        setLastUpdated(diff > 0 ? diff : 0);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [location]);

  // Inject location into WebView Leaflet map
  useEffect(() => {
    if (location && webViewRef.current) {
      const script = `
        try {
          var evt = new MessageEvent('message', {
            data: JSON.stringify({ type: 'updateLocation', lat: ${location.lat}, lng: ${location.lng} })
          });
          document.dispatchEvent(evt);
        } catch(e) {}
        true;
      `;
      webViewRef.current.injectJavaScript(script);
    }
  }, [location]);


  // Overpass API Nearby Places
  useEffect(() => {
    if (!location) return;

    const fetchPOIs = async () => {
      setIsPlacesLoading(true);
      
      let typeStr = '';
      if (activeCategory === 'Police') typeStr = 'node["amenity"="police"]';
      else if (activeCategory === 'Hospitals') typeStr = 'node["amenity"="hospital"]';
      else if (activeCategory === 'Pharmacies') typeStr = 'node["amenity"="pharmacy"]';
      else typeStr = `
        node["amenity"="police"];
        node["amenity"="hospital"];
        node["amenity"="pharmacy"];
      `;

      const query = `
        [out:json];
        (
          ${typeStr.split(';').filter(t => t.trim()).map(t => `${t.trim()}(around:5000,${location.lat},${location.lng});`).join('')}
        );
        out body;
      `;
      
      try {
        const res = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: query
        });
        const data = await res.json();
        
        if (data && data.elements) {
          const processedPlaces = data.elements.map(place => {
            const distance = getDistance(location.lat, location.lng, place.lat, place.lon);
            const name = place.tags?.name || 'Unnamed Location';
            const category = place.tags?.amenity || 'unknown';
            return { 
              name, 
              distance, 
              types: [category], 
              lat: place.lat, 
              lng: place.lon,
              vicinity: place.tags?.['addr:street'] || place.tags?.['addr:city'] || 'Location available'
            };
          }).filter(p => p.name !== 'Unnamed Location')
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 15);
            
          setPlaces(processedPlaces);
        } else {
          setPlaces([]);
        }
      } catch (err) {
        console.warn('Overpass error', err);
        setPlaces([]);
      } finally {
        setIsPlacesLoading(false);
      }
    };
    
    // Add small delay to prevent rapid requests while typing/switching
    const timer = setTimeout(fetchPOIs, 500);
    return () => clearTimeout(timer);
  }, [location?.lat, location?.lng, activeCategory]);

  const handleLocateMe = async () => {
    if (isLoading) return;
    await refreshLocation();
    if (location && webViewRef.current) {
      const script = `
        try {
          var evt = new MessageEvent('message', {
            data: JSON.stringify({ type: 'updateLocation', lat: ${location.lat}, lng: ${location.lng}, forceRecenter: true })
          });
          document.dispatchEvent(evt);
        } catch(e) {}
        true;
      `;
      webViewRef.current.injectJavaScript(script);
    }
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2-lat1) * Math.PI / 180;
    const dLon = (lon2-lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getCategoryIcon = (types = []) => {
    if (types.includes('police')) return <Shield size={16} color={colors.accentSafe} />;
    if (types.includes('hospital')) return <AlertTriangle size={16} color={colors.accentEmergency} />;
    return <MapPin size={16} color={colors.accentBrand} />;
  };

  const openDirections = (place) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${place.lat},${place.lng}(${place.name})`,
      android: `geo:0,0?q=${place.lat},${place.lng}(${place.name})`,
    });
    Linking.openURL(url);
  };

  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { padding: 0; margin: 0; }
        html, body, #map { height: 100%; width: 100%; }
        .custom-marker {
          width: 20px;
          height: 20px;
          background-color: #780d2b;
          border: 3px solid #FFFFFF;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(0,0,0,0.4);
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', { zoomControl: false }).setView([0, 0], 2);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        var customIcon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: '<div class="custom-marker"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        var marker;

        document.addEventListener('message', function(e) {
          try {
            var data = JSON.parse(e.data);
            if (data.type === 'updateLocation') {
              var lat = data.lat;
              var lng = data.lng;
              
              if (!marker) {
                marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
                map.setView([lat, lng], 15);
              } else {
                marker.setLatLng([lat, lng]);
                if (data.forceRecenter) {
                  map.setView([lat, lng], 15);
                }
              }
            }
          } catch (err) {}
        });
      </script>
    </body>
    </html>
  `;

  return (
    <ScreenWrapper edges={['top', 'bottom']} style={styles.container} withGlow>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Safety Map</Text>
          <Text style={styles.subtitle}>Your current location and nearby safe zones.</Text>
        </View>
        <Button 
          title="Locate Me"
          variant="secondary"
          icon={<Crosshair size={18} color={colors.textPrimary} />}
          onPress={handleLocateMe}
          loading={isLoading}
        />
      </View>

      <ScrollView style={styles.contentLayout} showsVerticalScrollIndicator={false}>
        <View style={styles.mapWrapper}>
          <WebView
            ref={webViewRef}
            originWhitelist={['*']}
            source={{ html: mapHtml }}
            style={styles.map}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            onLoadEnd={() => {
              // Inject initial location when WebView loads
              if (location) {
                const script = `
                  try {
                    var evt = new MessageEvent('message', {
                      data: JSON.stringify({ type: 'updateLocation', lat: ${location.lat}, lng: ${location.lng} })
                    });
                    document.dispatchEvent(evt);
                  } catch(e) {}
                  true;
                `;
                webViewRef.current?.injectJavaScript(script);
              }
            }}
          />
          {!location && (
            <View style={[StyleSheet.absoluteFill, styles.loadingContainerMap]}>
              <MapPin size={28} color={colors.textMuted} />
              <Text style={styles.loadingText}>
                {errorMsg ? "Location unavailable" : "Acquiring GPS..."}
              </Text>
            </View>
          )}
        </View>

        <Card style={styles.locationCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>📍 CURRENT LOCATION</Text>
          </View>

          {location ? (
            <View style={styles.locationDetails}>
              <Text style={styles.addressLabel}>
                {location.addressLabel || "Location detected"}
              </Text>
              
              <View style={styles.metaRow}>
                <Text style={styles.metaText}>Accuracy ±{location.accuracy}m</Text>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.metaText}>Updated {lastUpdated} sec ago</Text>
              </View>
            </View>
          ) : (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>
                {errorMsg ? errorMsg : "Finding your location..."}
              </Text>
            </View>
          )}
        </Card>

        <Card style={styles.placesCard} variant="flat">
          <Text style={styles.placesTitle}>Nearby Safe Zones</Text>
          
          <View style={styles.filtersRow}>
            {['All', 'Police', 'Hospitals', 'Pharmacies'].map(cat => (
              <TouchableOpacity 
                key={cat} 
                style={[styles.filterChip, activeCategory === cat && styles.filterChipActive]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[styles.filterText, activeCategory === cat && styles.filterTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.placesList}>
            {isPlacesLoading ? (
              <Text style={styles.loadingText}>Finding nearby safe zones...</Text>
            ) : places.length > 0 ? (
              places.map((place, idx) => (
                <View key={idx} style={styles.placeItem}>
                  <View style={styles.placeHeader}>
                    {getCategoryIcon(place.types)}
                    <Text style={styles.placeName} numberOfLines={1}>{place.name}</Text>
                  </View>
                  <View style={styles.placeRow}>
                    <Text style={styles.placeDistance}>{place.distance.toFixed(1)} km</Text>
                    <Text style={styles.placeAddress} numberOfLines={1}>
                      {place.vicinity}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.directionsBtn} onPress={() => openDirections(place)}>
                    <Navigation size={14} color={colors.accentBrand} />
                    <Text style={styles.directionsText}>Directions</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No nearby safety locations available for this category.</Text>
            )}
          </View>
        </Card>
        
        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const getStyles = (colors, shadows, isDark) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPrimary },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  title: { ...typography.h2, color: colors.textPrimary },
  subtitle: { ...typography.body, fontSize: 14, color: colors.textSecondary },
  
  contentLayout: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  
  mapWrapper: {
    height: 300,
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    position: 'relative',
    ...shadows.subtle,
  },
  map: { 
    width: '100%', 
    height: '100%',
    backgroundColor: 'transparent'
  },
  loadingContainerMap: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
  },
  
  locationCard: {
    padding: spacing.lg,
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  cardHeader: {
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  addressLabel: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  metaDot: {
    color: colors.textMuted,
  },
  
  placesCard: {
    padding: spacing.lg,
    backgroundColor: colors.bgTertiary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  placesTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.accentBrand,
    borderColor: colors.accentBrand,
  },
  filterText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFF',
  },
  
  placesList: {
    flex: 1,
  },
  placeItem: {
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  placeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 4,
  },
  placeName: {
    ...typography.subhead,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  placeDistance: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  placeAddress: {
    fontSize: 13,
    color: colors.textMuted,
    flex: 1,
  },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingVertical: 4,
  },
  directionsText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accentBrand,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 14,
    fontStyle: 'italic',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
  }
});
