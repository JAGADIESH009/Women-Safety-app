import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useAppTheme, borderRadius } from '../utils/theme';

export function IncidentMap({ location }) {
  const { colors } = useAppTheme();

  if (!location || typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgTertiary }]} />
    );
  }

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
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.8);
          background-color: ${colors.accentEmergency};
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .custom-marker-core {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: #fff;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var lat = ${location.latitude};
        var lng = ${location.longitude};
        
        var map = L.map('map', { 
          zoomControl: false,
          dragging: false,
          touchZoom: false,
          doubleClickZoom: false,
          scrollWheelZoom: false,
          boxZoom: false,
          keyboard: false
        }).setView([lat, lng], 16);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OSM'
        }).addTo(map);

        var customIcon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: '<div class="custom-marker"><div class="custom-marker-core"></div></div>',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        L.marker([lat, lng], { icon: customIcon }).addTo(map);
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html: mapHtml }}
        style={styles.map}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 160,
    width: '100%',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
    backgroundColor: 'transparent'
  }
});
