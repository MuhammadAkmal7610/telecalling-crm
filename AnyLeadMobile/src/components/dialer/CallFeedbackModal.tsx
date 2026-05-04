import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, useColorScheme, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, shadows } from '../../theme/theme';
import { Button } from '../common/Card';

interface CallFeedbackModalProps {
  visible: boolean;
  leadName: string;
  onClose: () => void;
  onSubmit: (data: { status: string, notes: string, followUp?: string }) => void;
}

export function CallFeedbackModal({ visible, leadName, onClose, onSubmit }: CallFeedbackModalProps) {
  const isDark = useColorScheme() === 'dark';
  const [status, setStatus] = useState('interested');
  const [notes, setNotes] = useState('');

  const outcomes = [
    { id: 'interested', label: 'Interested', icon: 'checkmark-circle', color: '#10B981' },
    { id: 'follow_up', label: 'Follow Up', icon: 'calendar', color: '#3B82F6' },
    { id: 'callback', label: 'Callback', icon: 'refresh', color: '#F59E0B' },
    { id: 'not_interested', label: 'Not Interested', icon: 'close-circle', color: '#EF4444' },
    { id: 'wrong_number', label: 'Wrong Number', icon: 'alert-circle', color: '#6B7280' },
  ];

  const handleSubmit = () => {
    onSubmit({ status, notes });
    setNotes('');
    setStatus('interested');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={[styles.container, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
              Call Feedback
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={isDark ? colors.darkMuted : colors.muted} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={[styles.subtitle, { color: isDark ? colors.darkMuted : colors.muted }]}>
              How was your call with <Text style={{ color: colors.primary, fontFamily: fonts.nohemi.bold }}>{leadName}</Text>?
            </Text>

            <View style={styles.outcomeGrid}>
              {outcomes.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.outcomeItem,
                    { borderColor: status === item.id ? item.color : (isDark ? '#374151' : '#E5E7EB') },
                    status === item.id && { backgroundColor: item.color + '10' }
                  ]}
                  onPress={() => setStatus(item.id)}
                >
                  <Ionicons 
                    name={item.icon as any} 
                    size={20} 
                    color={status === item.id ? item.color : (isDark ? '#6B7280' : '#9CA3AF')} 
                  />
                  <Text style={[
                    styles.outcomeLabel,
                    { color: status === item.id ? item.color : (isDark ? colors.surface : colors.onBackground) }
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: isDark ? colors.surface : colors.onBackground }]}>
                Add Notes
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  { 
                    backgroundColor: isDark ? '#111827' : '#F9FAFB',
                    borderColor: isDark ? '#374151' : '#E5E7EB',
                    color: isDark ? colors.surface : colors.onBackground
                  }
                ]}
                placeholder="Brief summary of the conversation..."
                placeholderTextColor={isDark ? '#4B5563' : '#9CA3AF'}
                multiline
                numberOfLines={3}
                value={notes}
                onChangeText={setNotes}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <Button 
              title="Save & Continue" 
              onPress={handleSubmit}
              style={styles.submitBtn}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB30',
  },
  title: {
    fontSize: 20,
    fontFamily: fonts.nohemi.bold,
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 20,
    lineHeight: 24,
  },
  outcomeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  outcomeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 8,
  },
  outcomeLabel: {
    fontSize: 14,
    fontFamily: fonts.satoshi.bold,
  },
  inputGroup: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: fonts.satoshi.bold,
    marginBottom: 8,
  },
  textInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
    fontFamily: fonts.satoshi.regular,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB30',
  },
  submitBtn: {
    width: '100%',
  },
});
