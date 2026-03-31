export const colors = {
  // Brand Colors
  primary: '#0D9488',          // Refined Emerald
  primaryVariant: '#0F766E',   // Deep Teal
  secondary: '#6366F1',        // Vibrant Indigo
  secondaryVariant: '#4F46E5', // Deep Royal Blue
  
  // States
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Neutrals (Light Mode)
  background: '#F8FAFC',       // Slate 50
  surface: '#FFFFFF',
  onBackground: '#0F172A',     // Slate 900
  onSurface: '#1E293B',        // Slate 800
  border: '#E2E8F0',           // Slate 200
  muted: '#64748B',            // Slate 500
  
  // Dark Mode Overrides (Handled in components via hook)
  darkBackground: '#0F172A',
  darkSurface: '#1E293B',
  darkBorder: '#334155',
  darkMuted: '#94A3B8',
  
  // Premium Gradients (Represented as color arrays for components)
  gradientPrimary: ['#0D9488', '#059669'] as const,
  gradientSecondary: ['#6366F1', '#4F46E5'] as const,
  gradientRoyal: ['#4F46E5', '#7C3AED'] as const,

  // Content Colors
  onPrimary: '#FFFFFF',
  onSecondary: '#FFFFFF',
  onSuccess: '#FFFFFF',
  onError: '#FFFFFF',
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
};

export const fonts = {
  nohemi: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },
  satoshi: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
};
