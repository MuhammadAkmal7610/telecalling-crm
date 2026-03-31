import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, TextInput, TextInputProps, Platform } from 'react-native';
import { colors, fonts, shadows, spacing } from '../../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface CardProps {
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
  variant?: 'default' | 'flat' | 'elevated' | 'glass';
}

export function Card({ children, style, onPress, variant = 'elevated' }: CardProps) {
  const isDark = useColorScheme() === 'dark';
  
  const cardStyle = [
    styles.card,
    {
      backgroundColor: isDark ? colors.darkSurface : colors.surface,
      borderColor: isDark ? colors.darkBorder : colors.border,
    },
    variant === 'elevated' && (isDark ? shadows.sm : shadows.md),
    variant === 'flat' && { borderWidth: 1, shadowOpacity: 0, elevation: 0 },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.7}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  gradient?: string[];
}

export function StatCard({ title, value, subtitle, color = colors.primary, gradient }: StatCardProps) {
  const isDark = useColorScheme() === 'dark';

  return (
    <Card style={styles.statCard}>
      <Text style={[styles.statTitle, { color: isDark ? colors.darkMuted : colors.muted }]}>
        {title}
      </Text>
      <Text style={[styles.statValue, { color }]}>
        {value}
      </Text>
      {subtitle && (
        <View style={styles.subtitleContainer}>
          <Text style={[styles.statSubtitle, { color: isDark ? colors.darkMuted : colors.muted }]}>
            {subtitle}
          </Text>
        </View>
      )}
    </Card>
  );
}

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: any;
  textStyle?: any;
}

export function Button({ title, onPress, variant = 'primary', loading, disabled, style, textStyle }: ButtonProps) {
  const isDark = useColorScheme() === 'dark';

  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: colors.primary };
      case 'secondary':
        return { backgroundColor: isDark ? colors.darkBorder : colors.secondary };
      case 'outline':
        return { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary };
      case 'ghost':
        return { backgroundColor: 'transparent' };
      default:
        return { backgroundColor: colors.primary };
    }
  };

  const getTextColor = () => {
    if (variant === 'outline' || variant === 'ghost') return colors.primary;
    if (variant === 'secondary') return isDark ? colors.surface : colors.onPrimary;
    return colors.onPrimary;
  };

  const buttonContent = (
    <View style={[styles.button, getButtonStyle(), disabled && styles.buttonDisabled, style]}>
      <Text style={[styles.buttonText, { color: getTextColor() }, textStyle]}>
        {loading ? 'Loading...' : title}
      </Text>
    </View>
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {buttonContent}
    </TouchableOpacity>
  );
}

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, style, ...props }: InputProps) {
  const isDark = useColorScheme() === 'dark';
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <View style={styles.inputWrapper}>
      {label && (
        <Text style={[styles.inputLabel, { color: isDark ? colors.surface : colors.onBackground }]}>
          {label}
        </Text>
      )}
      <View 
        style={[
          styles.inputContainer, 
          { 
            borderColor: error ? colors.error : isFocused ? colors.primary : (isDark ? colors.darkBorder : colors.border),
            backgroundColor: isDark ? colors.darkBackground : '#F8FAFC',
          }
        ]}
      >
        {icon && <View style={styles.inputIcon}>{icon}</View>}
        <TextInput
          style={[
            styles.input, 
            { color: isDark ? colors.surface : colors.onBackground },
            style
          ]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={isDark ? colors.darkMuted : colors.muted}
          {...props}
        />
      </View>
      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
}

interface LeadStatusBadgeProps {
  status: string;
}

export function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new': return '#10B981';
      case 'contacted': return '#3B82F6';
      case 'qualified': return '#8B5CF6';
      case 'converted': return '#059669';
      case 'lost': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <View style={[badgeStyles.badge, { backgroundColor: getStatusColor(status) }]}>
      <Text style={badgeStyles.badgeText}>{status}</Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: fonts.satoshi.medium,
    textTransform: 'uppercase',
  },
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: spacing.lg,
  },
  statTitle: {
    fontSize: 10,
    fontFamily: fonts.satoshi.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: 28,
    fontFamily: fonts.nohemi.bold,
    marginVertical: spacing.xs,
  },
  subtitleContainer: {
    marginTop: spacing.xs,
  },
  statSubtitle: {
    fontSize: 11,
    fontFamily: fonts.satoshi.regular,
    textAlign: 'center',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 15,
    fontFamily: fonts.satoshi.bold,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    marginBottom: spacing.sm,
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: fonts.satoshi.regular,
    height: '100%',
    borderWidth: 0,
    // @ts-ignore - outlineStyle is web-only but safe to use in RN styles
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  } as any,
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontFamily: fonts.satoshi.regular,
  },
});
