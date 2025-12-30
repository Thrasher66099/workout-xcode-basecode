/**
 * StrongAI Theme - Matching the iOS app's dark theme
 */

import { Platform, StyleSheet, ViewStyle, TextStyle } from 'react-native';

// StrongAI custom colors from Swift Theme.swift
export const StrongColors = {
  // Primary colors
  strongBlack: '#0D0D0D', // Deep OLED black
  strongDarkGrey: '#1F1F1F', // Card background
  strongBlue: '#3A82F6', // Action blue
  strongGreen: '#10B981', // Success green
  strongRed: '#EE4646', // Delete/fail red

  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textTertiary: '#6B7280',

  // Background colors
  background: '#0D0D0D',
  cardBackground: '#1F1F1F',
  inputBackground: '#2A2A2A',

  // Border colors
  border: '#333333',
  borderLight: '#404040',
};

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: StrongColors.strongBlue,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: StrongColors.strongBlue,
  },
  dark: {
    text: StrongColors.textPrimary,
    background: StrongColors.strongBlack,
    tint: StrongColors.strongBlue,
    icon: StrongColors.textSecondary,
    tabIconDefault: StrongColors.textSecondary,
    tabIconSelected: StrongColors.strongBlue,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Common spacing values
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Common border radius values
export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
};

// Typography styles
export const Typography = StyleSheet.create({
  largeTitle: {
    fontSize: 34,
    fontWeight: '700' as const,
    color: StrongColors.textPrimary,
  },
  title1: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: StrongColors.textPrimary,
  },
  title2: {
    fontSize: 22,
    fontWeight: '600' as const,
    color: StrongColors.textPrimary,
  },
  title3: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: StrongColors.textPrimary,
  },
  headline: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: StrongColors.textPrimary,
  },
  body: {
    fontSize: 17,
    fontWeight: '400' as const,
    color: StrongColors.textPrimary,
  },
  callout: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: StrongColors.textPrimary,
  },
  subheadline: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: StrongColors.textSecondary,
  },
  footnote: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: StrongColors.textSecondary,
  },
  caption1: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: StrongColors.textSecondary,
  },
  caption2: {
    fontSize: 11,
    fontWeight: '400' as const,
    color: StrongColors.textTertiary,
  },
});

// Common component styles
export const CommonStyles = StyleSheet.create({
  // Screen container
  screen: {
    flex: 1,
    backgroundColor: StrongColors.background,
  },
  screenPadded: {
    flex: 1,
    backgroundColor: StrongColors.background,
    padding: Spacing.lg,
  },

  // Card styles (matching Swift cardStyle modifier)
  card: {
    backgroundColor: StrongColors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  cardSmall: {
    backgroundColor: StrongColors.cardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },

  // Button styles (matching Swift primaryButtonStyle modifier)
  primaryButton: {
    backgroundColor: StrongColors.strongBlue,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  primaryButtonText: {
    color: StrongColors.textPrimary,
    fontSize: 17,
    fontWeight: '600' as const,
  },
  secondaryButton: {
    backgroundColor: StrongColors.cardBackground,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: StrongColors.border,
  },
  secondaryButtonText: {
    color: StrongColors.textPrimary,
    fontSize: 17,
    fontWeight: '600' as const,
  },
  dangerButton: {
    backgroundColor: StrongColors.strongRed,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  // Input styles
  input: {
    backgroundColor: StrongColors.inputBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: StrongColors.textPrimary,
    fontSize: 17,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: StrongColors.textSecondary,
    marginBottom: Spacing.xs,
  },

  // Row layouts
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  rowSpaceBetween: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },

  // Separator
  separator: {
    height: 1,
    backgroundColor: StrongColors.border,
    marginVertical: Spacing.sm,
  },

  // Section header
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: StrongColors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
});
