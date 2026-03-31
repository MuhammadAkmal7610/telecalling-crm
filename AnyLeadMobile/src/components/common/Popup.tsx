import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity, Modal, useColorScheme } from 'react-native';
import { colors, fonts, spacing, shadows } from '../../theme/theme';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export type PopupType = 'success' | 'error' | 'warning' | 'info' | 'confirmation';

export interface PopupProps {
  visible: boolean;
  type: PopupType;
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  autoHide?: boolean;
  duration?: number;
  onClose: () => void;
}

export function Popup({
  visible,
  type,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = false,
  autoHide = false,
  duration = 3000,
  onClose,
}: PopupProps) {
  const isDark = useColorScheme() === 'dark';
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Trigger Haptic Feedback
      if (type === 'error') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else if (type === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (type === 'warning') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Show Animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 10,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto Hide
      if (autoHide && type !== 'confirmation') {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      // Hide Animation
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    handleClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    handleClose();
  };

  const getPopupColors = () => {
    switch (type) {
      case 'success':
        return { background: '#10B981', text: '#FFFFFF', border: '#059669' };
      case 'error':
        return { background: '#EF4444', text: '#FFFFFF', border: '#DC2626' };
      case 'warning':
        return { background: '#F59E0B', text: '#FFFFFF', border: '#D97706' };
      case 'info':
        return { background: '#3B82F6', text: '#FFFFFF', border: '#2563EB' };
      case 'confirmation':
        return { background: isDark ? '#1F2937' : '#FFFFFF', text: isDark ? '#FFFFFF' : '#111827', border: isDark ? '#374151' : '#E5E7EB' };
      default:
        return { background: isDark ? '#1F2937' : '#FFFFFF', text: isDark ? '#FFFFFF' : '#111827', border: isDark ? '#374151' : '#E5E7EB' };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      case 'warning':
        return 'warning';
      case 'info':
        return 'information-circle';
      case 'confirmation':
        return 'help-circle';
      default:
        return 'alert-circle';
    }
  };

  const colorscheme = getPopupColors();

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View
        style={[
          styles.overlay,
          { opacity: opacityAnim },
        ]}
        onTouchEnd={type === 'confirmation' ? undefined : handleClose}
      >
        <Animated.View
          style={[
            styles.popup,
            {
              transform: [{ scale: scaleAnim }],
              backgroundColor: colorscheme.background,
              borderColor: colorscheme.border,
              ...shadows.lg,
            },
          ]}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons 
              name={getIcon() as any} 
              size={48} 
              color={colorscheme.text} 
            />
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={[styles.title, { color: colorscheme.text }]}>
              {title}
            </Text>
            <Text style={[styles.message, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {message}
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            {showCancel && (
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.cancelButton,
                  { borderColor: colorscheme.border }
                ]}
                onPress={handleCancel}
                activeOpacity={0.8}
              >
                <Text style={[styles.buttonText, { color: colorscheme.text }]}>
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.button,
                type === 'confirmation' ? styles.confirmButton : styles.primaryButton,
                { backgroundColor: type === 'confirmation' ? colorscheme.background : colorscheme.background }
              ]}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.buttonText, 
                { 
                  color: type === 'confirmation' ? colorscheme.text : '#FFFFFF',
                  fontFamily: fonts.satoshi.bold,
                }
              ]}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  popup: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  iconContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'transparent',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  title: {
    fontSize: 20,
    fontFamily: fonts.nohemi.bold,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    textAlign: 'center',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
  },
});