import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, useColorScheme, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '../../../src/components/common/Card';
import { colors, fonts } from '../../../src/theme/theme';
import { ApiService } from '../../../src/services/ApiService';
import { useAuth } from '../../../src/contexts/AuthContext';
import { Campaign } from '../../../src/lib/supabase';

interface CampaignFormData {
  name: string;
  description: string;
  status: string;
  priority: string;
  start_date?: string;
  end_date?: string;
}

const CAMPAIGN_STATUSES = ['draft', 'active', 'paused', 'completed'];
const CAMPAIGN_PRIORITIES = ['low', 'medium', 'high'];

export default function CreateCampaignScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    description: '',
    status: 'draft',
    priority: 'medium',
    start_date: '',
    end_date: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof CampaignFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Campaign name is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const campaignData: Partial<Campaign> = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        status: formData.status,
        priority: formData.priority,
        organization_id: user?.organization_id || '',
        workspace_id: user?.workspace_id,
        created_by: user?.id || '',
      };

      const { error } = await ApiService.createCampaign(campaignData);
      if (error) {
        throw error;
      }

      Alert.alert('Success', 'Campaign created successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error creating campaign:', error);
      Alert.alert('Error', 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder?: string
  ) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { color: isDark ? colors.surface : colors.onBackground }]}>
        {label}
      </Text>
      <View style={[styles.inputContainer, { borderColor: isDark ? '#374151' : '#E5E7EB' }]}>
        <TextInput
          style={[
            styles.input,
            { color: isDark ? colors.surface : colors.onBackground },
          ]}
          onChangeText={onChangeText}
          value={value}
          placeholder={placeholder}
          placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
        />
      </View>
    </View>
  );

  const renderPicker = (
    label: string,
    value: string,
    onValueChange: (value: string) => void,
    options: string[]
  ) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { color: isDark ? colors.surface : colors.onBackground }]}>
        {label}
      </Text>
      <View style={[styles.pickerContainer, { borderColor: isDark ? '#374151' : '#E5E7EB' }]}>
        <Text style={[styles.pickerText, { color: isDark ? colors.surface : colors.onBackground }]}>
          {value}
        </Text>
      </View>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              {
                backgroundColor: value === option ? colors.primary : 'transparent',
                borderColor: isDark ? '#374151' : '#E5E7EB',
              },
            ]}
            onPress={() => onValueChange(option)}
          >
            <Text
              style={[
                styles.optionText,
                {
                  color: value === option ? colors.onPrimary : isDark ? colors.surface : colors.onBackground,
                },
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Card style={styles.formCard}>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          Create New Campaign
        </Text>

        {renderInput('Campaign Name *', formData.name, (value) => handleInputChange('name', value), 'Enter campaign name')}
        
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: isDark ? colors.surface : colors.onBackground }]}>
            Description
          </Text>
          <View style={[styles.textAreaContainer, { borderColor: isDark ? '#374151' : '#E5E7EB' }]}>
            <TextInput
              style={[
                styles.textArea,
                { color: isDark ? colors.surface : colors.onBackground },
              ]}
              onChangeText={(value) => handleInputChange('description', value)}
              value={formData.description}
              placeholder="Describe your campaign goals and target audience"
              placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>
        
        {renderPicker('Status', formData.status, (value) => handleInputChange('status', value), CAMPAIGN_STATUSES)}
        {renderPicker('Priority', formData.priority, (value) => handleInputChange('priority', value), CAMPAIGN_PRIORITIES)}

        <View style={styles.buttonContainer}>
          <Button
            title="Cancel"
            onPress={() => router.back()}
            variant="secondary"
            style={styles.cancelButton}
          />
          <Button
            title="Create Campaign"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />
        </View>
      </Card>
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
  formCard: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: fonts.nohemi.bold,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 8,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  input: {
    fontSize: 16,
    fontFamily: fonts.satoshi.regular,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
  },
  pickerText: {
    fontSize: 16,
    fontFamily: fonts.satoshi.regular,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  optionText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    textTransform: 'capitalize',
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
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});
