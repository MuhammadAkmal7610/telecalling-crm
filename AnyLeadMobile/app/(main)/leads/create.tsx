import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, useColorScheme, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '../../../src/components/common/Card';
import { colors, fonts } from '../../../src/theme/theme';
import { ApiService } from '../../../src/services/ApiService';
import { useAuth } from '../../../src/contexts/AuthContext';
import { Lead } from '../../../src/lib/supabase';

interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  description?: string;
}

const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'converted', 'lost'];
const LEAD_SOURCES = ['manual', 'website', 'facebook', 'instagram', 'whatsapp', 'referral', 'other'];

export default function CreateLeadScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  const [formData, setFormData] = useState<LeadFormData>({
    name: '',
    email: '',
    phone: '',
    status: 'new',
    source: 'manual',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof LeadFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Lead name is required');
      return false;
    }
    if (formData.email && !formData.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const leadData: Partial<Lead> = {
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        status: formData.status,
        source: formData.source,
        organization_id: user?.organization_id || '',
        workspace_id: user?.workspace_id,
      };

      const { error } = await ApiService.createLead(leadData);
      if (error) {
        throw error;
      }

      Alert.alert('Success', 'Lead created successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error creating lead:', error);
      Alert.alert('Error', 'Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder?: string,
    keyboardType?: any
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
          keyboardType={keyboardType}
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
          Create New Lead
        </Text>

        {renderInput('Lead Name *', formData.name, (value) => handleInputChange('name', value), 'Enter lead name')}
        {renderInput('Email', formData.email, (value) => handleInputChange('email', value), 'Enter email address', 'email-address')}
        {renderInput('Phone', formData.phone, (value) => handleInputChange('phone', value), 'Enter phone number', 'phone-pad')}
        
        {renderPicker('Status', formData.status, (value) => handleInputChange('status', value), LEAD_STATUSES)}
        {renderPicker('Source', formData.source, (value) => handleInputChange('source', value), LEAD_SOURCES)}

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
              placeholder="Enter additional notes about this lead"
              placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Cancel"
            onPress={() => router.back()}
            variant="secondary"
            style={styles.cancelButton}
          />
          <Button
            title="Create Lead"
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
