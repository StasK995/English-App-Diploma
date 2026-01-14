// Тема та стилі додатку

export const colors = {
  // Primary Colors
  primary: '#4A90E2',
  primaryDark: '#2E5C8A',
  primaryLight: '#7FB3E8',

  // Secondary Colors
  secondary: '#50C878',
  secondaryDark: '#3AA65D',
  secondaryLight: '#7DD89B',

  // Accent Colors
  accent: '#F39C12',
  accentDark: '#D68910',
  accentLight: '#F5B041',

  // Status Colors
  success: '#50C878',
  warning: '#F39C12',
  error: '#E74C3C',
  info: '#4A90E2',

  // Neutral Colors
  background: '#F5F7FA',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  
  // Text Colors
  textPrimary: '#2C3E50',
  textSecondary: '#7F8C8D',
  textDisabled: '#BDC3C7',
  textWhite: '#FFFFFF',

  // Border & Divider
  border: '#E0E0E0',
  divider: '#ECF0F1',

  // Gradients
  gradientStart: '#4A90E2',
  gradientEnd: '#7FB3E8',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 9999,
};

export const typography = {
  // Font Sizes
  h1: 32,
  h2: 28,
  h3: 24,
  h4: 20,
  h5: 18,
  h6: 16,
  body: 16,
  bodySmall: 14,
  caption: 12,
  tiny: 10,

  // Font Weights
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
};

// Готові стилі для кнопок
export const buttonStyles = {
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  secondary: {
    backgroundColor: colors.secondary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  outline: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
};

// Готові стилі для карток
export const cardStyles = {
  default: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...shadows.medium,
  },
  elevated: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.large,
  },
  flat: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
};

// Готові стилі для тексту
export const textStyles = {
  h1: {
    fontSize: typography.h1,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  h2: {
    fontSize: typography.h2,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  h3: {
    fontSize: typography.h3,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  body: {
    fontSize: typography.body,
    fontWeight: typography.regular,
    color: colors.textPrimary,
  },
  bodySecondary: {
    fontSize: typography.body,
    fontWeight: typography.regular,
    color: colors.textSecondary,
  },
  caption: {
    fontSize: typography.caption,
    fontWeight: typography.regular,
    color: colors.textSecondary,
  },
};

// Анімації
export const animations = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

// Розміри екранів для адаптивності
export const breakpoints = {
  small: 360,
  medium: 768,
  large: 1024,
  xlarge: 1280,
};

// Утиліти
export const utils = {
  // Центрування контенту
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Flex utilities
  flex1: { flex: 1 },
  flexRow: { flexDirection: 'row' },
  flexColumn: { flexDirection: 'column' },
  
  // Spacing utilities
  mt: (value) => ({ marginTop: value }),
  mb: (value) => ({ marginBottom: value }),
  ml: (value) => ({ marginLeft: value }),
  mr: (value) => ({ marginRight: value }),
  pt: (value) => ({ paddingTop: value }),
  pb: (value) => ({ paddingBottom: value }),
  pl: (value) => ({ paddingLeft: value }),
  pr: (value) => ({ paddingRight: value }),
};

// Експорт теми повністю
export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  buttonStyles,
  cardStyles,
  textStyles,
  animations,
  breakpoints,
  utils,
};

export default theme;
