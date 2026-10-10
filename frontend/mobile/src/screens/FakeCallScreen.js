import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated } from 'react-native';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { Phone, PhoneOff, User } from 'lucide-react-native';
import { useAppTheme, spacing, typography } from '../utils/theme';

export function FakeCallScreen({ navigation }) {
  const [callState, setCallState] = useState('incoming'); // 'incoming' | 'active'
  const [callDuration, setCallDuration] = useState(0);
  
  const { colors, shadows, isDark } = useAppTheme();
  const styles = useMemo(() => getStyles(colors, shadows, isDark), [colors, shadows, isDark]);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (callState === 'incoming') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: Platform.OS !== 'web' })
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
    }
  }, [callState, pulseAnim]);

  useEffect(() => {
    let interval;
    if (callState === 'active') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const acceptCall = () => {
    setCallState('active');
  };

  const declineCall = () => {
    navigation.goBack();
  };

  return (
    <ScreenWrapper edges={['top', 'bottom']} style={styles.container}>
      <View style={styles.content}>
        
        <View style={styles.callerInfo}>
          <Text style={styles.callerStatus}>
            {callState === 'incoming' ? 'Incoming call...' : formatTime(callDuration)}
          </Text>
          <Text style={styles.callerName}>Mom</Text>
          <Text style={styles.callerType}>Mobile</Text>
        </View>

        <View style={styles.avatarContainer}>
          <Animated.View style={[styles.avatarPulse, { transform: [{ scale: pulseAnim }] }]} />
          <View style={styles.avatar}>
            <User size={64} color={colors.textPrimary} />
          </View>
        </View>

        <View style={styles.controls}>
          {callState === 'incoming' ? (
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.declineButton} onPress={declineCall} activeOpacity={0.7}>
                <PhoneOff size={32} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptButton} onPress={acceptCall} activeOpacity={0.7}>
                <Phone size={32} color="#FFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.actionRowCenter}>
              <TouchableOpacity style={styles.declineButton} onPress={declineCall} activeOpacity={0.7}>
                <PhoneOff size={32} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>

      </View>
    </ScreenWrapper>
  );
}

const getStyles = (colors, shadows, isDark) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#000' : '#111',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing.xxxl,
    paddingTop: 80,
  },
  callerInfo: {
    alignItems: 'center',
  },
  callerStatus: {
    ...typography.subhead,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing.xs,
  },
  callerName: {
    ...typography.h1,
    fontSize: 40,
    color: '#FFF',
    marginBottom: spacing.xs,
  },
  callerType: {
    ...typography.subhead,
    color: 'rgba(255,255,255,0.5)',
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
  },
  avatarPulse: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    marginBottom: 40,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  actionRowCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  declineButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
