import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { colors, fonts } from '../../theme/theme';

interface CardProps {
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
}

export function Card({ children, style, onPress }: CardProps) {
  const isDark = useColorScheme() === 'dark';
  
  const cardStyle = [
    styles.card,
    {
      backgroundColor: isDark ? '#1E1E1E' : colors.surface,
      borderColor: isDark ? '#333' : '#E5E7EB',
    },
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
}

export function StatCard({ title, value, subtitle, color = colors.primary }: StatCardProps) {
  const isDark = useColorScheme() === 'dark';

  return (
    <Card style={styles.statCard}>
      <Text style={[styles.statTitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
        {title}
      </Text>
      <Text style={[styles.statValue, { color }]}>
        {value}
      </Text>
      {subtitle && (
        <Text style={[styles.statSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          {subtitle}
        </Text>
      )}
    </Card>
  );
}

interface LeadStatusBadgeProps {
  status: string;
}

export function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return '#10B981';
      case 'contacted':
        return '#3B82F6';
      case 'qualified':
        return '#8B5CF6';
      case 'converted':
        return '#059669';
      case 'lost':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  return (
    <View style={[styles.badge, { backgroundColor: getStatusColor(status) }]}>
      <Text style={styles.badgeText}>{status}</Text>
    </View>
  );
}

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  disabled?: boolean;
  style?: any;
}

export function Button({ title, onPress, variant = 'primary', loading, disabled, style }: ButtonProps) {
  const isDark = useColorScheme() === 'dark';

  const buttonStyle = [
    styles.button,
    variant === 'primary' 
      ? { backgroundColor: colors.primary }
      : { backgroundColor: isDark ? '#374151' : '#F3F4F6' },
    disabled && styles.buttonDisabled,
    style,
  ];

  const textStyle = [
    styles.buttonText,
    variant === 'primary' 
      ? { color: colors.onPrimary }
      : { color: isDark ? colors.surface : colors.onBackground },
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <Text style={textStyle}>
        {loading ? 'Loading...' : title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  statTitle: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 24,
    fontFamily: fonts.nohemi.bold,
    marginVertical: 4,
  },
  statSubtitle: {
    fontSize: 11,
    fontFamily: fonts.satoshi.regular,
  },
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
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: fonts.satoshi.medium,
  },
});
