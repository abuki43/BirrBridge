import { createTamagui, createTokens, createFont } from '@tamagui/core'
import { shorthands } from '@tamagui/shorthands'
import { createAnimations } from '@tamagui/animations-reanimated'

// When Aeonik Pro license is secured, replace Inter-Medium in headingFont face with 'AeonikPro-Medium'
const headingFont = createFont({
  family: 'Inter',
  size: {
    1: 10,
    2: 12,
    3: 14,
    true: 4,
    4: 16,
    5: 20,
    6: 24,
    7: 40,
    8: 48,
  },
  weight: {
    1: '400',
    2: '500',
    3: '600',
  },
  face: {
    400: { normal: 'Inter' },
    500: { normal: 'Inter-Medium' },
    600: { normal: 'Inter-SemiBold' },
  },
})

const bodyFont = createFont({
  family: 'Inter',
  size: {
    1: 10,
    2: 12,
    3: 14,
    true: 4,
    4: 16,
    5: 20,
    6: 24,
  },
  weight: {
    1: '400',
    2: '500',
    3: '600',
  },
  face: {
    400: { normal: 'Inter' },
    500: { normal: 'Inter-Medium' },
    600: { normal: 'Inter-SemiBold' },
  },
})

const monoFont = createFont({
  family: 'JetBrainsMono',
  size: {
    1: 12,
    true: 2,
    2: 14,
  },
  weight: {
    1: '400',
  },
  face: {
    400: { normal: 'JetBrainsMono' },
  },
})

const tokens = createTokens({
  color: {
    bgCanvas: '#191c1f',
    bgCanvasLight: '#ffffff',
    bgSurface: '#1f2226',
    bgSurfaceLight: '#f4f4f4',
    bgElevated: '#2a2d30',
    bgElevatedLight: '#ffffff',
    bgInput: '#2a2d30',
    bgInputLight: '#f4f4f4',
    textPrimary: '#ffffff',
    textPrimaryLight: '#191c1f',
    textSecondary: 'rgba(255,255,255,0.72)',
    textSecondaryLight: '#505a63',
    textMuted: 'rgba(255,255,255,0.48)',
    textMutedLight: '#8d969e',
    accent: '#494fdf',
    accentHover: '#3d43c9',
    accentSoft: 'rgba(73,79,223,0.12)',
    accentSoftLight: 'rgba(73,79,223,0.08)',
    success: '#00a87e',
    warning: '#ec7e00',
    danger: '#e23b4a',
    border: 'rgba(255,255,255,0.08)',
    borderLight: 'rgba(0,0,0,0.08)',
    overlay: 'rgba(0,0,0,0.6)',
    overlayHeavy: 'rgba(0,0,0,0.75)',
  },
  space: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 32,
    8: 40,
    9: 48,
    10: 64,
  },
  size: {
    0: 0,
    1: 4,
    true: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 32,
    8: 40,
    9: 48,
    10: 64,
    11: 80,
    12: 100,
    13: 120,
    14: 200,
    15: 220,
  },
  radius: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 30,
    7: 9999,
  },
  zIndex: {
    0: 0,
    1: 100,
    2: 200,
    3: 1000,
  },
})

const themes = {
  dark: {
    bg: tokens.color.bgCanvas,
    bgSurface: tokens.color.bgSurface,
    bgElevated: tokens.color.bgElevated,
    bgInput: tokens.color.bgInput,
    color: tokens.color.textPrimary,
    colorSecondary: tokens.color.textSecondary,
    colorMuted: tokens.color.textMuted,
    accent: tokens.color.accent,
    accentHover: tokens.color.accentHover,
    accentSoft: tokens.color.accentSoft,
    success: tokens.color.success,
    warning: tokens.color.warning,
    danger: tokens.color.danger,
    borderColor: tokens.color.border,
    overlay: tokens.color.overlay,
    overlayHeavy: tokens.color.overlayHeavy,
  },
  light: {
    bg: tokens.color.bgCanvasLight,
    bgSurface: tokens.color.bgSurfaceLight,
    bgElevated: tokens.color.bgElevatedLight,
    bgInput: tokens.color.bgInputLight,
    color: tokens.color.textPrimaryLight,
    colorSecondary: tokens.color.textSecondaryLight,
    colorMuted: tokens.color.textMutedLight,
    accent: tokens.color.accent,
    accentHover: tokens.color.accentHover,
    accentSoft: tokens.color.accentSoftLight,
    success: tokens.color.success,
    warning: tokens.color.warning,
    danger: tokens.color.danger,
    borderColor: tokens.color.borderLight,
    overlay: 'rgba(0,0,0,0.3)',
    overlayHeavy: 'rgba(0,0,0,0.4)',
  },
}

const animations = createAnimations({
  fast: {
    type: 'timing',
    duration: 150,
  },
  base: {
    type: 'timing',
    duration: 240,
  },
  slow: {
    type: 'timing',
    duration: 400,
  },
  spring: {
    type: 'spring',
    damping: 20,
    mass: 1.2,
    stiffness: 250,
  },
  bouncy: {
    type: 'spring',
    damping: 10,
    mass: 0.9,
    stiffness: 100,
  },
})

const config = createTamagui({
  defaultTheme: 'dark',
  shouldAddPrefersColorThemes: false,
  themeClassNameOnRoot: false,
  fonts: {
    heading: headingFont,
    body: bodyFont,
    mono: monoFont,
  },
  tokens,
  themes,
  shorthands,
  animations,
})

export type AppConfig = typeof config

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config
