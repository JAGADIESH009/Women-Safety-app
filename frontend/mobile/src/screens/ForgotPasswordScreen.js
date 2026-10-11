import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Platform, Alert, Image } from 'react-native';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ShieldCheck, Mail, ChevronLeft } from 'lucide-react-native';
import { useAppTheme, spacing, typography, borderRadius } from '../utils/theme';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../config/firebase';

export function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const { colors, shadows, isDark } = useAppTheme();
  const styles = useMemo(() => getStyles(colors, shadows, isDark), [colors, shadows, isDark]);

  const handleResetPassword = async () => {
    if (!email) {
      setErrorMsg("Please enter your email address");
      return;
    }
    
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);
    
    try {
      if (!isFirebaseConfigured) {
        // Simulate success for preview
        setTimeout(() => {
          setIsSubmitting(false);
          setSuccessMsg('Password reset link sent (Simulated)');
        }, 1000);
        return;
      }
      
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg('Password reset link has been sent to your email.');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send reset email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenWrapper scrollable edges={['top', 'bottom']} withGlow>
      <View style={styles.content}>
        
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Image source={require('../../assets/icon.png')} style={styles.logoImage} />
          </View>
          <Text style={styles.brandTitle}>Reset Password</Text>
          <Text style={styles.subtitle}>Enter your email address and we'll send you a link to reset your password.</Text>
        </View>

        <View style={styles.formCard}>
          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}
          
          {successMsg ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>{successMsg}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <Input 
              label="Email"
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              leadingIcon={<Mail size={20} color={colors.textSecondary} />}
            />

            <Button 
              title="Send Reset Link"
              onPress={handleResetPassword} 
              style={styles.resetButton}
              loading={isSubmitting}
            />
          </View>
        </View>

      </View>
    </ScreenWrapper>
  );
}

const getStyles = (colors, shadows, isDark) => StyleSheet.create({
  content: {
    flex: 1,
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    marginTop: Platform.OS === 'web' ? spacing.xl : spacing.sm,
  },
  header: {
    marginBottom: spacing.xxl,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.accentBrandMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.accentBrand,
    ...shadows.glowBrand,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },

  brandTitle: {
    ...typography.h1,
    fontSize: 32,
    letterSpacing: -0.5,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  formCard: {
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.subtle,
  },
  errorBox: {
    backgroundColor: colors.accentEmergencyMuted,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.accentEmergency,
  },
  errorText: {
    ...typography.footnote,
    color: colors.accentEmergency,
    fontWeight: '500',
  },
  successBox: {
    backgroundColor: colors.accentSafeMuted,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.accentSafe,
  },
  successText: {
    ...typography.footnote,
    color: colors.accentSafe,
    fontWeight: '500',
  },
  form: {
    width: '100%',
  },
  resetButton: {
    marginTop: spacing.md,
  },
});
