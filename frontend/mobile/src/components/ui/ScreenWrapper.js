import React, { useMemo } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../utils/theme';

export function ScreenWrapper({ 
  children, 
  scrollable = false, 
  style, 
  contentContainerStyle,
  edges = ['top', 'bottom', 'left', 'right'],
  keyboardShouldPersistTaps = 'handled',
  withGlow = false,
  isWide = false,
}) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;
  const { colors, isDark } = useAppTheme();
  
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  const innerContent = (
    <View style={[!scrollable && styles.flex, isDesktop && styles.desktopWrapper, isDesktop && isWide && styles.desktopWideWrapper, { width: '100%' }]}>
      {children}
    </View>
  );

  const content = scrollable ? (
    <ScrollView 
      style={styles.flex} 
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      showsVerticalScrollIndicator={false}
    >
      {innerContent}
    </ScrollView>
  ) : (
    <View style={[styles.flex, contentContainerStyle]}>
      {innerContent}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, style]} edges={edges}>
      {withGlow && (
        <>
          <View style={[styles.ambientGlowTop, { pointerEvents: 'none' }]} />
          <View style={[styles.ambientGlowBottom, { pointerEvents: 'none' }]} />
        </>
      )}
      <KeyboardAvoidingView 
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {content}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  flex: {
    flex: 1,
    width: '100%',
  },
  desktopWrapper: {
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
    flex: 1,
  },
  desktopWideWrapper: {
    maxWidth: 1100,
  },
  scrollContent: {
    flexGrow: 1,
  },
  ambientGlowTop: {
    position: 'absolute',
    top: -150,
    left: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: colors.accentBrandMuted,
    transform: [{ scale: 1.5 }],
    ...Platform.select({
      ios: { shadowColor: colors.accentBrand, shadowOffset: {width:0, height:0}, shadowOpacity: 0.2, shadowRadius: 100 },
      web: { filter: 'blur(120px)' }
    })
  },
  ambientGlowBottom: {
    position: 'absolute',
    bottom: -150,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.accentBrandMuted,
    transform: [{ scale: 1.5 }],
    ...Platform.select({
      ios: { shadowColor: colors.accentBrand, shadowOffset: {width:0, height:0}, shadowOpacity: 0.1, shadowRadius: 100 },
      web: { filter: 'blur(120px)' }
    })
  },
});
