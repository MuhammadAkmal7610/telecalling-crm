import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, useColorScheme, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Card, Button } from '../../../src/components/common/Card';
import { colors, fonts } from '../../../src/theme/theme';
import { useAuth } from '../../../src/contexts/AuthContext';
import { ApiService } from '../../../src/services/ApiService';
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from "react-native-modal-datetime-picker";

interface CallFeedbackParams {
  phoneNumber: string;
  leadId?: string;
  leadName?: string;
}

export default function CallFeedbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams() as CallFeedbackParams;
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  
  const [callOutcome, setCallOutcome] = useState('');
  const [callDuration, setCallDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const callOutcomes = [
    { value: 'answered', label: 'Answered', icon: 'call-outline', color: '#10B981' },
    { value: 'not_answered', label: 'Not Answered', icon: 'call-missed-outline', color: '#EF4444' },
    { value: 'busy', label: 'Busy', icon: 'time-outline', color: '#F59E0B' },
    { value: 'wrong_number', label: 'Wrong Number', icon: 'close-circle-outline', color: '#6B7280' },
    { value: 'voicemail', label: 'Voicemail', icon: 'mic-outline', color: '#8B5CF6' },
  ];

  const nextActions = [
    'Call Back',
    'Send Email',
    'Send SMS',
    'Schedule Meeting',
    'Send Proposal',
    'No Follow Up Needed'
  ];

  useEffect(() => {
    // Auto-set duration to current time minus call start time (simplified)
    const now = new Date();
    const duration = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setCallDuration(duration);
  }, []);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirm = (date: Date) => {
    setFollowUpDate(date.toLocaleDateString());
    hideDatePicker();
  };

  const handleSubmitFeedback = async () => {
    if (!callOutcome) {
      Alert.alert('Error', 'Please select a call outcome');
      return;
    }

    setLoading(true);
    try {
      // Update the call activity with feedback
      await ApiService.createActivity({
        type: 'call_feedback',
        description: `Call outcome: ${callOutcome}. Duration: ${callDuration}. Notes: ${notes}`,
        lead_id: params.leadId,
        user_id: user?.id,
        organization_id: user?.organization_id,
        workspace_id: user?.workspace_id,
        metadata: {
          phoneNumber: params.phoneNumber,
          outcome: callOutcome,
          duration: callDuration,
          notes,
          followUpRequired,
          followUpDate,
          nextAction
        }
      });

      // Update lead status based on outcome
      if (params.leadId && callOutcome === 'answered') {
        await ApiService.updateLead(params.leadId, {
          status: 'contacted'
        });
      }

      Alert.alert('Success', 'Call feedback saved successfully', [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]);
    } catch (error) {
      console.error('Error saving feedback:', error);
      Alert.alert('Error', 'Failed to save feedback');
    } finally {
      setLoading(false);
    }
  };

  const renderOutcomeOption = (outcome: any) => (
    <TouchableOpacity
      key={outcome.value}
      style={[
        styles.outcomeOption,
        callOutcome === outcome.value && styles.selectedOutcome,
        { borderColor: isDark ? '#374151' : '#E5E7EB' }
      ]}
      onPress={() => setCallOutcome(outcome.value)}
    >
      <Ionicons 
        name={outcome.icon as any} 
        size={20} 
        color={callOutcome === outcome.value ? '#FFFFFF' : outcome.color} 
      />
      <Text style={[
        styles.outcomeLabel,
        callOutcome === outcome.value && styles.selectedOutcomeLabel
      ]}>
        {outcome.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          Call Feedback
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          {params.leadName ? `Call with ${params.leadName}` : `Call to ${params.phoneNumber}`}
        </Text>
      </View>

      {/* Call Outcome */}
      <Card style={styles.card}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Call Outcome
        </Text>
        <View style={styles.outcomesGrid}>
          {callOutcomes.map(renderOutcomeOption)}
        </View>
      </Card>

      {/* Call Details */}
      <Card style={styles.card}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Call Details
        </Text>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: isDark ? colors.surface : colors.onBackground }]}>
            Call Duration
          </Text>
          <View style={[styles.inputContainer, { borderColor: isDark ? '#374151' : '#E5E7EB' }]}>
            <Text style={[styles.inputText, { color: isDark ? colors.surface : colors.onBackground }]}>
              {callDuration}
            </Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: isDark ? colors.surface : colors.onBackground }]}>
            Notes
          </Text>
          <View style={[styles.textAreaContainer, { borderColor: isDark ? '#374151' : '#E5E7EB' }]}>
            <TextInput
              style={[styles.textArea, { color: isDark ? colors.surface : colors.onBackground }]}
              onChangeText={setNotes}
              value={notes}
              placeholder="Add notes about the conversation..."
              placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>
      </Card>

      {/* Follow Up */}
      <Card style={styles.card}>
        <View style={styles.followUpHeader}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Follow Up
          </Text>
          <TouchableOpacity
            style={[styles.toggleButton, followUpRequired && styles.toggleButtonActive]}
            onPress={() => setFollowUpRequired(!followUpRequired)}
          >
            <Text style={[styles.toggleText, followUpRequired && styles.toggleTextActive]}>
              {followUpRequired ? 'Required' : 'Not Required'}
            </Text>
          </TouchableOpacity>
        </View>

        {followUpRequired && (
          <>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: isDark ? colors.surface : colors.onBackground }]}>
                Follow Up Date
              </Text>
              <TouchableOpacity
                style={[styles.inputContainer, { borderColor: isDark ? '#374151' : '#E5E7EB' }]}
                onPress={showDatePicker}
              >
                <Text style={[styles.inputText, { color: followUpDate ? (isDark ? colors.surface : colors.onBackground) : (isDark ? '#9CA3AF' : '#6B7280') }]}>
                  {followUpDate || 'Select date'}
                </Text>
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
                minimumDate={new Date()}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: isDark ? colors.surface : colors.onBackground }]}>
                Next Action
              </Text>
              <View style={styles.actionsGrid}>
                {nextActions.map((action) => (
                  <TouchableOpacity
                    key={action}
                    style={[
                      styles.actionChip,
                      nextAction === action && styles.selectedActionChip,
                      { borderColor: isDark ? '#374151' : '#E5E7EB' }
                    ]}
                    onPress={() => setNextAction(action)}
                  >
                    <Text style={[
                      styles.actionChipText,
                      nextAction === action && styles.selectedActionChipText
                    ]}>
                      {action}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}
      </Card>

      {/* Submit Button */}
      <View style={styles.buttonContainer}>
        <Button
          title="Save Feedback"
          onPress={handleSubmitFeedback}
          loading={loading}
          style={styles.submitButton}
        />
        <Button
          title="Skip"
          onPress={() => router.back()}
          variant="secondary"
          style={styles.skipButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.nohemi.bold,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
  card: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 16,
  },
  outcomesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  outcomeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 100,
  },
  selectedOutcome: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  outcomeLabel: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    marginLeft: 6,
  },
  selectedOutcomeLabel: {
    color: '#FFFFFF',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 8,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  inputText: {
    fontSize: 16,
    fontFamily: fonts.satoshi.regular,
  },
  textAreaContainer: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 80,
  },
  textArea: {
    fontSize: 16,
    fontFamily: fonts.satoshi.regular,
    minHeight: 60,
  },
  followUpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    color: '#6B7280',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  selectedActionChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  actionChipText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    color: '#6B7280',
  },
  selectedActionChipText: {
    color: '#FFFFFF',
  },
  buttonContainer: {
    marginTop: 20,
    gap: 12,
  },
  submitButton: {
    marginBottom: 8,
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
});
