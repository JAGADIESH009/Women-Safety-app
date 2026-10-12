import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { useAppTheme, spacing, typography, borderRadius } from '../../utils/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function SecondaryHeader({ title, onBack, rightAction }) {
  const navigation = useNavigation();
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  
  const styles = useMemo(() => getStyles(colors, isDark, insets), [colors, isDark, insets]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={handleBack}
        activeOpacity={0.7}
        accessibilityLabel="Go back"
        accessibilityRole="button"
      >
        <ChevronLeft size={24} color={colors.textPrimary} />
      </TouchableOpacity>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      {rightAction ? (
        <View style={styles.rightActionWrapper}>{rightAction}</View>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
}

const getStyles = (colors, isDark, insets) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    // Add top padding only if we want the header to integrate safe area itself.
    // Assuming ScreenWrapper handles safe area, we don't need top padding here.
    backgroundColor: 'transparent',
    width: '100%',
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
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40, // Same width as backButton to keep title exactly centered
  },
  rightActionWrapper: {
    minWidth: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  }
});
