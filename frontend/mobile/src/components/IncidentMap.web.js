import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAppTheme, borderRadius } from '../utils/theme';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';

export function IncidentMap({ location }) {
  const { colors } = useAppTheme();

  if (!location || typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgTertiary }]} />
    );
  }

  const position = [location.latitude, location.longitude];

  const customMarkerIcon = new L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="width: 24px; height: 24px; background-color: rgba(255,255,255,0.8); border: 2px solid ${colors.accentEmergency}; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${colors.accentEmergency};"></div></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  return (
    <View style={styles.container}>
      <MapContainer 
        center={position} 
        zoom={16} 
        style={{ height: '100%', width: '100%', zIndex: 1 }}
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={customMarkerIcon} />
      </MapContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 160,
    width: '100%',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  }
});
