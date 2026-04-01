import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button, Input } from '@/src/components/common/Card';
import { colors, fonts } from '@/src/theme/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { ApiService } from '@/src/services/ApiService';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface CampaignFormData {
  name: string;
  description: string;
  campaign_type: 'bulk' | 'drip' | 'triggered';
  template_name?: string;
  message_content: string;
  variables_mapping: Record<string, string>;
  target_audience: Record<string, any>;
  lead_filters: Record<string, any>;
  schedule_type: 'immediate' | 'scheduled' | 'recurring';
  scheduled_at?: string;
  max_retries: number;
  retry_interval_minutes: number;
  rate_limit_per_hour: number;
}

export default function CreateCampaignScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    description: '',
    campaign_type: 'bulk',
    message_content: '',
    variables_mapping: {},
    target_audience: {},
    lead_filters: {},
    schedule_type: 'immediate',
    max_retries: 3,
    retry_interval_minutes: 30,
    rate_limit_per_hour: 100,
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());

  const campaignTypes = [
    { value: 'bulk', label: 'Bulk Campaign', description: 'Send messages to multiple leads at once' },
    { value: 'drip', label: 'Drip Campaign', description: 'Send messages in a sequence over time' },
    { value: 'triggered', label: 'Triggered Campaign', description: 'Send messages based on specific events' },
  ];

  const scheduleTypes = [
    { value: 'immediate', label: 'Immediate', description: 'Send messages right away' },
    { value: 'scheduled', label: 'Scheduled', description: 'Send messages at a specific time' },
    { value: 'recurring', label: 'Recurring', description: 'Send messages on a recurring schedule' },
  ];

  const handleInputChange = (field: keyof CampaignFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleVariableMapping = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      variables_mapping: { ...prev.variables_mapping, [key]: value }
    }));
  };

  const handleTargetAudience = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      target_audience: { ...prev.target_audience, [field]: value }
    }));
  };

  const handleLeadFilters = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      lead_filters: { ...prev.lead_filters, [field]: value }
    }));
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      setFormData(prev => ({ ...prev, scheduled_at: selectedDate.toISOString() }));
    }
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!formData.name.trim()) errors.push('Campaign name is required');
    if (!formData.message_content.trim()) errors.push('Message content is required');
    if (formData.campaign_type === 'bulk' && !formData.target_audience) errors.push('Target audience is required for bulk campaigns');
    if (formData.schedule_type === 'scheduled' && !formData.scheduled_at) errors.push('Scheduled date is required');
    
    return errors;
  };

  const createCampaign = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'));
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await ApiService.post('/whatsapp/campaigns', formData);
      if (error) throw error;
      
      Alert.alert('Success', 'Campaign created successfully');
      router.back();
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      Alert.alert('Error', error.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const renderCampaignTypeSelector = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
        Campaign Type
      </Text>
      {campaignTypes.map((type) => (
        <TouchableOpacity
          key={type.value}
          style={[
            styles.optionCard,
            { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' },
            formData.campaign_type === type.value && styles.optionCardSelected
          ]}
          onPress={() => handleInputChange('campaign_type', type.value)}
        >
          <View style={styles.optionHeader}>
            <Text style={[styles.optionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
              {type.label}
            </Text>
            <View style={[
              styles.radioButton,
              formData.campaign_type === type.value && styles.radioButtonSelected
            ]}>
              {formData.campaign_type === type.value && (
                <View style={styles.radioButtonInner} />
              )}
            </View>
          </View>
          <Text style={[styles.optionDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {type.description}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderScheduleSelector = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
        Schedule Type
      </Text>
      {scheduleTypes.map((type) => (
        <TouchableOpacity
          key={type.value}
          style={[
            styles.optionCard,
            { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' },
            formData.schedule_type === type.value && styles.optionCardSelected
          ]}
          onPress={() => handleInputChange('schedule_type', type.value)}
        >
          <View style={styles.optionHeader}>
            <Text style={[styles.optionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
              {type.label}
            </Text>
            <View style={[
              styles.radioButton,
              formData.schedule_type === type.value && styles.radioButtonSelected
            ]}>
              {formData.schedule_type === type.value && (
                <View style={styles.radioButtonInner} />
              )}
            </View>
          </View>
          <Text style={[styles.optionDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {type.description}
          </Text>
        </TouchableOpacity>
      ))}
      
      {formData.schedule_type === 'scheduled' && (
        <View style={styles.datePickerContainer}>
          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text style={[styles.dateButtonText, { color: isDark ? colors.surface : colors.onBackground }]}>
              {formData.scheduled_at 
                ? new Date(formData.scheduled_at).toLocaleString()
                : 'Select Date & Time'
              }
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="datetime"
              is24Hour={true}
              display="default"
              onChange={onDateChange}
            />
          )}
        </View>
      )}
    </View>
  );

  const renderTargetAudience = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
        Target Audience
      </Text>
      <View style={styles.formRow}>
        <Input
          placeholder="Lead Status (e.g., fresh, contacted)"
          value={formData.target_audience.status || ''}
          onChangeText={(value) => handleTargetAudience('status', value)}
          style={[styles.input, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}
        />
      </View>
      <View style={styles.formRow}>
        <Input
          placeholder="Lead Source (e.g., website, referral)"
          value={formData.target_audience.source || ''}
          onChangeText={(value) => handleTargetAudience('source', value)}
          style={[styles.input, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}
        />
      </View>
      <View style={styles.formRow}>
        <Input
          placeholder="Custom Filter Field"
          value={formData.target_audience.custom_field || ''}
          onChangeText={(value) => handleTargetAudience('custom_field', value)}
          style={[styles.input, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}
        />
      </View>
    </View>
  );

  const renderMessageSettings = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
        Message Settings
      </Text>
      <View style={styles.formRow}>
        <Input
          placeholder="Template Name (optional)"
          value={formData.template_name || ''}
          onChangeText={(value) => handleInputChange('template_name', value)}
          style={[styles.input, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}
        />
      </View>
      <View style={styles.formRow}>
        <Input
          placeholder="Message Content"
          value={formData.message_content}
          onChangeText={(value) => handleInputChange('message_content', value)}
          style={[styles.textArea, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}
          multiline
          numberOfLines={4}
        />
      </View>
      <Text style={[styles.helperText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
        Use variables like {'{{name}}'}, {'{{phone}}'} for personalization
      </Text>
    </View>
  );

  const renderAdvancedSettings = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
        Advanced Settings
      </Text>
      <View style={styles.formRow}>
        <Input
          placeholder="Max Retries"
          value={formData.max_retries.toString()}
          onChangeText={(value) => handleInputChange('max_retries', parseInt(value) || 0)}
          keyboardType="numeric"
          style={[styles.input, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}
        />
      </View>
      <View style={styles.formRow}>
        <Input
          placeholder="Retry Interval (minutes)"
          value={formData.retry_interval_minutes.toString()}
          onChangeText={(value) => handleInputChange('retry_interval_minutes', parseInt(value) || 0)}
          keyboardType="numeric"
          style={[styles.input, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}
        />
      </View>
      <View style={styles.formRow}>
        <Input
          placeholder="Rate Limit per Hour"
          value={formData.rate_limit_per_hour.toString()}
          onChangeText={(value) => handleInputChange('rate_limit_per_hour', parseInt(value) || 0)}
          keyboardType="numeric"
          style={[styles.input, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}
        />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDark ? colors.surface : colors.onBackground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          Create Campaign
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Basic Information
          </Text>
          <View style={styles.formRow}>
            <Input
              placeholder="Campaign Name"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              style={[styles.input, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}
            />
          </View>
          <View style={styles.formRow}>
            <Input
              placeholder="Campaign Description"
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              style={[styles.textArea, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Campaign Type */}
        {renderCampaignTypeSelector()}

        {/* Schedule Type */}
        {renderScheduleSelector()}

        {/* Target Audience */}
        {renderTargetAudience()}

        {/* Message Settings */}
        {renderMessageSettings()}

        {/* Advanced Settings */}
        {renderAdvancedSettings()}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <Button
          title="Create Campaign"
          onPress={createCampaign}
          loading={loading}
          style={[styles.createButton, { backgroundColor: colors.primary }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB30',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: fonts.nohemi.bold,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 12,
  },
  formRow: {
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: fonts.satoshi.regular,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: fonts.satoshi.regular,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
    marginTop: 4,
  },
  optionCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#EFF6FF',
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: fonts.nohemi.semiBold,
  },
  optionDescription: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: colors.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  datePickerContainer: {
    marginTop: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 16,
    fontFamily: fonts.satoshi.regular,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB30',
  },
  createButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
});