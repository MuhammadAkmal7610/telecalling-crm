import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, Dimensions, useColorScheme } from 'react-native';
import { useToast } from '../../contexts/ToastContext';
import { colors, fonts, spacing, shadows } from '../../theme/theme';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export function Toast() {
  const { visible, toast, hideToast } = useToast();
  const isDark = useColorScheme() === 'dark';
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && toast) {
      // Trigger Haptic Feedback
      if (toast.type === 'error') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else if (toast.type === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Show Animation
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 60,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto Hide
      const timer = setTimeout(() => {
        handleHide();
      }, toast.duration || 3000);

      return () => clearTimeout(timer);
    }
  }, [visible, toast]);

  const handleHide = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      hideToast();
    });
  };

  if (!visible || !toast) return null;

  const getBackgroundColor = () => {
    if (toast.type === 'error') return '#EF4444';
    if (toast.type === 'success') return '#10B981';
    return colors.primary;
  };

  const getIcon = () => {
    if (toast.type === 'error') return 'alert-circle';
    if (toast.type === 'success') return 'checkmark-circle';
    return 'information-circle';
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          backgroundColor: getBackgroundColor(),
          ...shadows.lg,
        },
      ]}
    >
      <View style={styles.content}>
        <Ionicons name={getIcon() as any} size={20} color="#FFFFFF" />
        <Text style={styles.message}>{toast.message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: spacing.lg,
    right: spacing.lg,
    borderRadius: 12,
    padding: spacing.md,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    textAlign: 'center',
  },
});
