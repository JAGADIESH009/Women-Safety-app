import { Platform } from 'react-native';
import { useThemeContext } from '../context/ThemeContext';

const darkColors = {
  // Deep burgundy/charcoal foundation
  bgPrimary: '#1A0F12', 
  bgSecondary: '#24161A',
  bgTertiary: '#2E1E23',
  
  textPrimary: '#FDFBF7', // warm white
  textSecondary: '#EBEBF599',
  textMuted: '#EBEBF54D',
  
  // Brand: Lighter Burgundy / Rose for dark mode legibility
  accentBrand: '#B23A5B', 
  accentBrandMuted: 'rgba(178, 58, 91, 0.15)',
  
  // Safe: Emerald / Teal
  accentSafe: '#10B981',
  accentSafeMuted: 'rgba(16, 185, 129, 0.15)',
  
  // Attention: Warm Amber
  accentWarning: '#F59E0B',
  accentWarningMuted: 'rgba(245, 158, 11, 0.15)',
  
  // Emergency: Rose / Red
  accentEmergency: '#F43F5E',
  accentEmergencyMuted: 'rgba(244, 63, 94, 0.15)',
  
  border: '#3A272C',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

// Add standard alias tokens to darkColors
darkColors.background = darkColors.bgPrimary;
darkColors.surface = darkColors.bgSecondary;
darkColors.surfaceElevated = darkColors.bgTertiary;
darkColors.text = darkColors.textPrimary;
darkColors.primary = darkColors.accentBrand;
darkColors.success = darkColors.accentSafe;
darkColors.warning = darkColors.accentWarning;
darkColors.danger = darkColors.accentEmergency;

const lightColors = {
  // Warm cream / ivory foundation
  bgPrimary: '#FFFDF9', 
  bgSecondary: '#F4EFE6',
  bgTertiary: '#E8E0D1',
  
  textPrimary: '#2A161A', // deep brown/burgundy
  textSecondary: '#5E4A4D',
  textMuted: '#998487',
  
  // Brand: Burgundy
  accentBrand: '#780d2b', 
  accentBrandMuted: 'rgba(120, 13, 43, 0.1)',
  
  accentSafe: '#059669',
  accentSafeMuted: 'rgba(5, 150, 105, 0.1)',
  
  accentWarning: '#D97706',
  accentWarningMuted: 'rgba(217, 119, 6, 0.1)',
  
  // Emergency: Rose / Red
  accentEmergency: '#E11D48',
  accentEmergencyMuted: 'rgba(225, 29, 72, 0.1)',
  
  border: '#D4C6C0',
  overlay: 'rgba(42, 22, 26, 0.3)',
};

// Add standard alias tokens to lightColors
lightColors.background = lightColors.bgPrimary;
lightColors.surface = lightColors.bgSecondary;
lightColors.surfaceElevated = lightColors.bgTertiary;
lightColors.text = lightColors.textPrimary;
lightColors.primary = lightColors.accentBrand;
lightColors.success = lightColors.accentSafe;
lightColors.warning = lightColors.accentWarning;
lightColors.danger = lightColors.accentEmergency;

// Legacy Aliases to prevent runtime crashes from previous designs
lightColors.accentRedMuted = lightColors.accentEmergencyMuted;
lightColors.accentBlue = lightColors.accentBrand;
lightColors.accentGreen = lightColors.accentSafe;
lightColors.accentOrange = lightColors.accentWarning;
darkColors.accentRedMuted = darkColors.accentEmergencyMuted;
darkColors.accentBlue = darkColors.accentBrand;
darkColors.accentGreen = darkColors.accentSafe;
darkColors.accentOrange = darkColors.accentWarning;

export function useAppTheme() {
  const { isDark } = useThemeContext();
  const colors = isDark ? darkColors : lightColors;

  const shadows = {
    subtle: Platform.select({
      web: {
        boxShadow: isDark 
          ? '0px 4px 12px rgba(0, 0, 0, 0.4)' 
          : '0px 4px 12px rgba(0, 0, 0, 0.08)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.4 : 0.08,
        shadowRadius: 12,
        elevation: 8,
      }
    }),
    glowBrand: Platform.select({
      web: {
        boxShadow: `0px 0px 20px ${colors.accentBrand}`,
      },
      default: {
        shadowColor: colors.accentBrand,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 10,
      }
    }),
    glowEmergency: Platform.select({
      web: {
        boxShadow: `0px 0px 24px ${colors.accentEmergency}`,
      },
      default: {
        shadowColor: colors.accentEmergency,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 24,
        elevation: 12,
      }
    }),
  };

  // Legacy shadow aliases
  shadows.glowBlue = shadows.glowBrand;

  return { colors, shadows, isDark };
}

// Fallback for non-react contexts where hooks can't be used (like App.js NavigationContainer theme prop). 
// Use with caution, it won't dynamically update on scheme change unless App remounts.
export const staticThemeColors = darkColors;

export const typography = {
  h1: { fontSize: 34, fontWeight: '700', letterSpacing: 0.37 },
  h2: { fontSize: 28, fontWeight: '700', letterSpacing: 0.36 },
  h3: { fontSize: 22, fontWeight: '600', letterSpacing: 0.35 },
  body: { fontSize: 17, fontWeight: '400', letterSpacing: -0.41, lineHeight: 22 },
  bodySemibold: { fontSize: 17, fontWeight: '600', letterSpacing: -0.41, lineHeight: 22 },
  callout: { fontSize: 16, fontWeight: '400', letterSpacing: -0.32 },
  subhead: { fontSize: 15, fontWeight: '400', letterSpacing: -0.24 },
  footnote: { fontSize: 13, fontWeight: '400', letterSpacing: -0.08 },
  caption: { fontSize: 12, fontWeight: '500', letterSpacing: 0 },
  label: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};
