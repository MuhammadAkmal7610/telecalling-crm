import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Card, Button, Input } from '@/src/components/common/Card';
import { colors, fonts, spacing } from '@/src/theme/theme';
import { ApiService } from '@/src/services/ApiService';
import { useAuth } from '@/src/contexts/AuthContext';
import { usePopupMessages } from '@/src/hooks/usePopupMessages';
import { Lead } from '@/src/lib/supabase';

interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  alt_phone: string;
  company: string;
  status: string;
  source: string;
  assignee_id?: string;
}

const LEAD_STATUSES = ['Fresh', 'Active', 'Interested', 'Hot', 'Scheduled', 'Won', 'Lost', 'Cold', 'Archive', 'Trash'];
const LEAD_SOURCES = ['Facebook', 'Website', 'WhatsApp', 'Referral', 'Manual', 'Import', 'IndiaMART', 'Justdial', 'Google Ads'];

export default function CreateLeadScreen() {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const { user } = useAuth();
  const { showSuccess, showError, showValidation } = usePopupMessages();
  const isDark = useColorScheme() === 'dark';
  
  const [formData, setFormData] = useState<LeadFormData>({
    name: '',
    email: '',
    phone: '',
    alt_phone: '',
    company: '',
    status: 'Fresh',
    source: 'Manual',
    assignee_id: '',
  });
  
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  React.useEffect(() => {
    if (user?.role === 'manager' || user?.role === 'admin' || user?.role === 'root') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await ApiService.getUsers();
      if (!error && data) {
        // /users returns a paginated shape: { data: [...], total, page, limit }
        const usersArray: any[] = Array.isArray(data) ? data : (data.data ?? []);
        setUsers(usersArray.filter((u: any) => u.role !== 'root'));
      }
    } catch (e) {
      console.error('Failed to fetch users:', e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleInputChange = (field: keyof LeadFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      showValidation('Lead name is required');
      return false;
    }
    if (!formData.phone.trim()) {
      showValidation('Phone number is required');
      return false;
    }
    if (formData.email && !formData.email.includes('@')) {
      showValidation('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const leadData: any = {
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        alt_phone: formData.alt_phone.trim() || undefined,
        company: formData.company.trim() || undefined,
        status: formData.status,
        source: formData.source,
        assignee_id: formData.assignee_id || undefined,
        workspace_id: user?.workspace_id,
      };

      const { error } = await ApiService.createLead(leadData);
      if (error) {
        throw error;
      }

      showSuccess('Lead created successfully');
      // Navigate back to the page the user came from, or default to leads list
      if (returnTo) {
        router.push(`/${returnTo}` as any);
      } else {
        router.back();
      }
    } catch (error: any) {
      console.error('Error creating lead:', error);
      showError(error.message || 'Failed to create lead. Please try again.');
    } finally {
      setLoading(false);
    }
  };

// Removed local renderInput in favor of Common Input component

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

        <Input 
          label="Lead Name *" 
          value={formData.name} 
          onChangeText={(value) => handleInputChange('name', value)} 
          placeholder="Enter lead name" 
        />
        <Input 
          label="Email" 
          value={formData.email} 
          onChangeText={(value) => handleInputChange('email', value)} 
          placeholder="Enter email address" 
          keyboardType="email-address" 
        />
        <Input 
          label="Phone *" 
          value={formData.phone} 
          onChangeText={(value) => handleInputChange('phone', value)} 
          placeholder="Enter phone number" 
          keyboardType="phone-pad" 
        />
        <Input 
          label="Alternate Phone" 
          value={formData.alt_phone} 
          onChangeText={(value) => handleInputChange('alt_phone', value)} 
          placeholder="Enter alternate phone number" 
          keyboardType="phone-pad" 
        />
        <Input 
          label="Company" 
          value={formData.company} 
          onChangeText={(value) => handleInputChange('company', value)} 
          placeholder="Enter company name" 
        />
        
        {renderPicker('Status', formData.status, (value) => handleInputChange('status', value), LEAD_STATUSES)}
        {renderPicker('Source', formData.source, (value) => handleInputChange('source', value), LEAD_SOURCES)}

        {users.length > 0 && renderPicker(
          'Assignee', 
          users.find(u => u.id === formData.assignee_id)?.name || 'Unassigned', 
          (value) => {
            const selectedUser = users.find(u => u.name === value);
            handleInputChange('assignee_id', selectedUser?.id || '');
          }, 
          ['Unassigned', ...users.map(u => u.name)]
        )}


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
