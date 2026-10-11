import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Platform, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ShieldCheck, User, Mail, Lock, Phone } from 'lucide-react-native';
import { useAppTheme, spacing, typography, borderRadius } from '../utils/theme';

export function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { register, loginWithGoogle } = useAuth();
  
  const { colors, shadows, isDark } = useAppTheme();
  const styles = useMemo(() => getStyles(colors, shadows, isDark), [colors, shadows, isDark]);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword || !mobileNumber) {
      setErrorMsg("Please fill in all fields");
      return;
    }
    
    // Basic email validation
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErrorMsg("Please enter a valid email address");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters");
      return;
    }

    // Basic phone validation (allowing digits, spaces, plus, hyphens)
    if (!/^\+?[\d\s-]{10,}$/.test(mobileNumber)) {
      setErrorMsg("Please enter a valid phone number (min 10 digits)");
      return;
    }
    
    setErrorMsg('');
    setIsSubmitting(true);
    
    try {
      await register(email, password, name, mobileNumber);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
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
      if (err.message !== 'auth/popup-closed-by-user' && err.message !== 'auth/cancelled-popup-request') {
        setErrorMsg(err.message || 'Google Registration failed.');
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
              <Image source={require('../../assets/icon.png')} style={styles.logoImage} />
            </View>
            <Text style={styles.brandTitle}>SafeHer</Text>
          </View>
          <Text style={styles.subtitle}>Your safety, always within reach.</Text>
        </View>

        <View style={styles.formCard}>
          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <Input 
              label="Full Name"
              placeholder="Jane Doe"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              leadingIcon={<User size={20} color={colors.textSecondary} />}
            />
            
            <Input 
              label="Email"
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              leadingIcon={<Mail size={20} color={colors.textSecondary} />}
            />

            <Input 
              label="Mobile Number"
              placeholder="+1 234 567 8900"
              value={mobileNumber}
              onChangeText={setMobileNumber}
              keyboardType="phone-pad"
              leadingIcon={<Phone size={20} color={colors.textSecondary} />}
            />
            
            <Input 
              label="Password"
              placeholder="Create a strong password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leadingIcon={<Lock size={20} color={colors.textSecondary} />}
            />
            
            <Input 
              label="Confirm Password"
              placeholder="Repeat password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              leadingIcon={<Lock size={18} color={colors.textSecondary} />}
            />

            <Button 
              title="Create Account"
              onPress={handleRegister} 
              style={styles.registerButton}
              loading={isSubmitting}
            />

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button 
              title="Sign up with Google"
              variant="secondary"
              style={styles.googleButton}
              disabled={isSubmitting}
              onPress={handleGoogleLogin}
              textStyle={{ fontWeight: '500', color: colors.textPrimary }}
            />

            <View style={styles.signInSection}>
              <Button 
                title="Already have an account? Sign in"
                variant="outline"
                onPress={() => navigation.navigate('Login')}
                disabled={isSubmitting}
              />
            </View>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const getStyles = (colors, shadows, isDark) => StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
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
  },
  subtitle: {
    ...typography.subhead,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.subtle,
  },
  errorBox: {
    backgroundColor: colors.accentEmergencyMuted,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
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
  registerButton: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
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
  signInSection: {
    marginTop: spacing.md,
  },
});

