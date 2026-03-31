import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, useColorScheme, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card, Button, Input } from '@/src/components/common/Card';
import { colors, fonts, spacing } from '@/src/theme/theme';
import { ApiService } from '@/src/services/ApiService';
import { useAuth } from '@/src/contexts/AuthContext';
import { Lead } from '@/src/lib/supabase';
import { Ionicons } from '@expo/vector-icons';

interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  status: string;
  source: string;
}

const LEAD_STATUSES = ['Fresh', 'Active', 'Interested', 'Hot', 'Scheduled', 'Won', 'Lost', 'Cold', 'Archive', 'Trash'];
const LEAD_SOURCES = ['Facebook', 'Website', 'WhatsApp', 'Referral', 'Manual', 'Import', 'IndiaMART', 'Justdial', 'Google Ads'];

export default function EditLeadScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  const [formData, setFormData] = useState<LeadFormData>({
    name: '',
    email: '',
    phone: '',
    status: 'Fresh',
    source: 'Manual',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadLead();
  }, [id]);

  const loadLead = async () => {
    try {
      const { data: allLeads } = await ApiService.getLeads(user?.workspace_id);
      const currentLead = allLeads?.find((l: Lead) => l.id === id);
      
      if (currentLead) {
        setFormData({
          name: currentLead.name,
          email: currentLead.email || '',
          phone: currentLead.phone || '',
          status: currentLead.status,
          source: currentLead.source || 'Manual',
        });
      } else {
        Alert.alert('Error', 'Lead not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading lead:', error);
      Alert.alert('Error', 'Failed to load lead data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof LeadFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Lead name is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const updates: Partial<Lead> = {
        name: formData.name.trim(),
        email: formData.email.trim() || null as any,
        phone: formData.phone.trim() || null as any,
        status: formData.status,
        source: formData.source,
        workspace_id: user?.workspace_id,
      };

      const { error } = await ApiService.updateLead(id as string, updates);
      if (error) throw error;

      Alert.alert('Success', 'Lead updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error updating lead:', error);
      Alert.alert('Error', 'Failed to update lead');
    } finally {
      setSaving(false);
    }
  };

  const renderInput = (label: string, value: string, onChangeText: (text: string) => void, placeholder?: string, keyboardType?: any) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { color: isDark ? colors.surface : colors.onBackground }]}>{label}</Text>
      <View style={[styles.inputContainer, { borderColor: isDark ? '#374151' : '#E5E7EB' }]}>
        <TextInput
          style={[styles.input, { color: isDark ? colors.surface : colors.onBackground }]}
          onChangeText={onChangeText}
          value={value}
          placeholder={placeholder}
          placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
          keyboardType={keyboardType}
        />
      </View>
    </View>
  );

  const renderPicker = (label: string, value: string, onValueChange: (value: string) => void, options: string[]) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { color: isDark ? colors.surface : colors.onBackground }]}>{label}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              { 
                backgroundColor: value === option ? colors.primary : 'transparent',
                borderColor: isDark ? '#374151' : '#E5E7EB' 
              }
            ]}
            onPress={() => onValueChange(option)}
          >
            <Text style={[styles.optionText, { color: value === option ? colors.onPrimary : (isDark ? colors.surface : colors.onBackground) }]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: isDark ? '#121212' : colors.background }]}>
        <Text style={{ color: isDark ? colors.surface : colors.onBackground }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDark ? colors.surface : colors.onBackground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>Edit Lead</Text>
      </View>

      <Card style={styles.formCard}>
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
          label="Phone" 
          value={formData.phone} 
          onChangeText={(value) => handleInputChange('phone', value)} 
          placeholder="Enter phone number" 
          keyboardType="phone-pad" 
        />
        
        {renderPicker('Status', formData.status, (value) => handleInputChange('status', value), LEAD_STATUSES)}
        {renderPicker('Source', formData.source, (value) => handleInputChange('source', value), LEAD_SOURCES)}

        <View style={styles.buttonContainer}>
          <Button title="Save Changes" onPress={handleSubmit} loading={saving} style={styles.submitButton} />
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  contentContainer: { padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingTop: 40 },
  backButton: { padding: 8, marginRight: 12 },
  title: { fontSize: 24, fontFamily: fonts.nohemi.bold },
  formCard: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontFamily: fonts.satoshi.medium, marginBottom: 8 },
  inputContainer: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12 },
  input: { fontSize: 16, fontFamily: fonts.satoshi.regular },
  optionsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionButton: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  optionText: { fontSize: 12, fontFamily: fonts.satoshi.medium, textTransform: 'capitalize' },
  buttonContainer: { marginTop: 20 },
  submitButton: { width: '100%' },
});
