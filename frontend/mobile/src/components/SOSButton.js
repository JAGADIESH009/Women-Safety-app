import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useEmergency } from '../context/EmergencyContext';
import { useAppTheme, typography } from '../utils/theme';

export function SOSButton({ locationData }) {
  const [isPressing, setIsPressing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3.0);
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.15)).current;
  
  const { colors, shadows } = useAppTheme();
  const styles = useMemo(() => getStyles(colors, shadows), [colors, shadows]);
  
  const timerRef = useRef(null);
  const intervalRef = useRef(null);
  
  const navigation = useNavigation();
  const { activateEmergency } = useEmergency();

  useEffect(() => {
    const startPulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseAnim, { toValue: 1.25, duration: 2500, useNativeDriver: Platform.OS !== 'web' }),
            Animated.timing(opacityAnim, { toValue: 0, duration: 2500, useNativeDriver: Platform.OS !== 'web' })
          ]),
          Animated.parallel([
            Animated.timing(pulseAnim, { toValue: 1, duration: 0, useNativeDriver: Platform.OS !== 'web' }),
            Animated.timing(opacityAnim, { toValue: 0.15, duration: 0, useNativeDriver: Platform.OS !== 'web' })
          ])
        ])
      ).start();
    };
    startPulse();
  }, [pulseAnim, opacityAnim]);

  const handlePressIn = () => {
    setIsPressing(true);
    setTimeLeft(3.0);
    
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      friction: 6,
      useNativeDriver: Platform.OS !== 'web',
    }).start();

    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = Math.max(0, 3.0 - elapsed);
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        clearInterval(intervalRef.current);
      }
    }, 50); // 50ms for smooth decimal updates

    timerRef.current = setTimeout(() => {
      activateEmergency(locationData);
      setIsPressing(false);
      setTimeLeft(3.0);
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: Platform.OS !== 'web' }).start();
    }, 3000);
  };

  const handlePressOut = () => {
    if (timeLeft > 0) {
      setIsPressing(false);
      setTimeLeft(3.0);
      
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
      
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  };

  const isActivating = timeLeft <= 0 && isPressing;
  const displayTime = timeLeft.toFixed(1) + 's';

  // Calculate ring scale based on time left (0 to 1 scale over 3s)
  const ringScale = isPressing ? Math.max(0.6, 1 - (timeLeft / 3)) : 0.6;

  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.pulseCircle,
        { 
          transform: [{ scale: isPressing ? 1 : pulseAnim }],
          opacity: isPressing ? 0 : opacityAnim,
          pointerEvents: 'none'
        }
      ]} />
      
      <View style={[styles.bgRing, { pointerEvents: 'none' }]} />

      {isPressing && (
        <Animated.View style={[
          styles.progressRing,
          { 
            transform: [{ scale: ringScale }],
            opacity: 1
          }
        ]} pointerEvents="none" />
      )}

      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.pressableArea}
      >
        <Animated.View style={[
          styles.button, 
          isPressing ? styles.buttonActive : styles.buttonIdle,
          { transform: [{ scale: scaleAnim }] }
        ]}>
          <Text style={[styles.text, isPressing && styles.textActive]}>
            {isActivating ? 'Activating' : (isPressing ? displayTime : 'SOS')}
          </Text>
        </Animated.View>
      </Pressable>
      
      <Text style={styles.helperText}>
        {isPressing ? 'Release to cancel' : 'Hold to SOS'}
      </Text>
    </View>
  );
}

const getStyles = (colors, shadows) => StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 200,
  },
  pulseCircle: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.accentEmergency,
  },
  bgRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.accentEmergencyMuted,
  },
  progressRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.accentEmergencyMuted,
  },
  pressableArea: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  button: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIdle: {
    backgroundColor: colors.bgTertiary,
    borderWidth: 1,
    borderColor: colors.accentEmergencyMuted,
  },
  buttonActive: {
    backgroundColor: colors.accentEmergency,
    ...shadows.glowEmergency,
  },
  text: {
    color: colors.accentEmergency,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  textActive: {
    color: '#FFFFFF',
    fontSize: 24,
    letterSpacing: 0,
  },
  helperText: {
    position: 'absolute',
    bottom: 0,
    ...typography.caption,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  }
});
