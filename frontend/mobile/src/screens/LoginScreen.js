import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ShieldCheck, AlertTriangle, Mail, Lock } from 'lucide-react-native';
import { useAppTheme, spacing, typography, borderRadius } from '../utils/theme';

export function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login, loginWithGoogle, configMissing } = useAuth();
  
  const { colors, shadows, isDark } = useAppTheme();
  const styles = useMemo(() => getStyles(colors, shadows, isDark), [colors, shadows, isDark]);

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg("Please enter email and password");
      return;
    }
    
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        setErrorMsg(err.message || 'Google Login failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenWrapper scrollable edges={['top', 'bottom']} withGlow>
      <View style={styles.content}>
        
        <View style={styles.header}>
          <View style={styles.brandContainer}>
            <View style={styles.iconContainer}>
              <ShieldCheck size={32} color={colors.accentBrand} strokeWidth={2.5} />
            </View>
            <Text style={styles.brandTitle}>SafeHer</Text>
          </View>
          <Text style={styles.subtitle}>Your safety, always within reach.</Text>
        </View>

        {configMissing && (
          <View style={styles.configWarning}>
            <AlertTriangle size={20} color={colors.accentWarning} />
            <View style={styles.configWarningTextContainer}>
              <Text style={styles.configWarningTitle}>Missing Configuration</Text>
              <Text style={styles.configWarningText}>
                Firebase Auth is not configured. Add credentials to environment variables to enable authentication.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.formCard}>
          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
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
              editable={!configMissing}
              leadingIcon={<Mail size={20} color={colors.textSecondary} />}
            />
            
            <Input 
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!configMissing}
              leadingIcon={<Lock size={20} color={colors.textSecondary} />}
            />

            <TouchableOpacity 
              style={styles.forgotPassword} 
              activeOpacity={0.7}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>

            <Button 
              title="Sign in"
              onPress={handleLogin} 
              style={styles.loginButton}
              disabled={configMissing}
              loading={isSubmitting}
            />
            
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button 
              title="Sign in with Google"
              variant="secondary"
              style={styles.googleButton}
              disabled={configMissing || isSubmitting}
              onPress={handleGoogleLogin}
              textStyle={{ fontWeight: '500', color: colors.textPrimary }}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>New to SafeHer? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.7}>
            <Text style={styles.createAccount}>Create account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const getStyles = (colors, shadows, isDark) => StyleSheet.create({
  content: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    paddingBottom: spacing.xxxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.accentBrandMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(124, 58, 237, 0.15)',
    ...shadows.glowBrand,
  },
  brandTitle: {
    ...typography.h1,
    fontSize: 36,
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.subhead,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  configWarning: {
    flexDirection: 'row',
    backgroundColor: colors.accentWarningMuted,
    borderColor: isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(217, 119, 6, 0.2)',
    borderWidth: 1,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    gap: 12,
    alignItems: 'center',
  },
  configWarningTextContainer: {
    flex: 1,
  },
  configWarningTitle: {
    ...typography.subhead,
    color: colors.accentWarning,
    fontWeight: '600',
    marginBottom: 4,
  },
  configWarningText: {
    ...typography.footnote,
    color: colors.accentWarning,
    opacity: 0.9,
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
  form: {
    width: '100%',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.xl,
    marginTop: -spacing.sm,
  },
  forgotPasswordText: {
    ...typography.footnote,
    color: colors.accentBrand,
    fontWeight: '500',
  },
  loginButton: {
    marginBottom: spacing.lg,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  googleButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  footer: {
    flexDirection: 'row',
    marginTop: spacing.xxl,
    justifyContent: 'center',
  },
  footerText: {
    ...typography.subhead,
    color: colors.textSecondary,
  },
  createAccount: {
    ...typography.subhead,
    color: colors.textPrimary,
    fontWeight: '600',
  }
});
