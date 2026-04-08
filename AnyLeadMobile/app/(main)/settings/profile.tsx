import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button, Input } from '@/src/components/common/Card';
import { colors, fonts, spacing } from '@/src/theme/theme';
import { ApiService } from '@/src/services/ApiService';
import { useAuth } from '@/src/contexts/AuthContext';
import { usePopupMessages } from '@/src/hooks/usePopupMessages';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, fetchUserProfile } = useAuth();
  const { showSuccess, showError, showLoading, hidePopup } = usePopupMessages();
  const isDark = useColorScheme() === 'dark';
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showError('Name is required');
      return;
    }

    setLoading(true);
    showLoading('Updating profile...');
    try {
      const { error } = await ApiService.updateUser({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
      });

      if (error) throw error;

      await fetchUserProfile(user?.id || '');
      showSuccess('Profile updated successfully');
    } catch (error: any) {
      showError(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
      hidePopup();
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/settings')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDark ? colors.surface : colors.onBackground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>Edit Profile</Text>
      </View>

      <Card style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{formData.name.charAt(0).toUpperCase() || 'U'}</Text>
          </View>
          <TouchableOpacity style={styles.editAvatarBtn}>
            <Text style={{ color: colors.primary, fontFamily: fonts.satoshi.bold }}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        <Input
          label="Full Name"
          value={formData.name}
          onChangeText={(v) => handleInputChange('name', v)}
          placeholder="Enter your full name"
        />

        <Input
          label="Email Address"
          value={formData.email}
          editable={false}
          style={{ opacity: 0.6 }}
          placeholder="Email address"
        />

        <Input
          label="Phone Number"
          value={formData.phone}
          onChangeText={(v) => handleInputChange('phone', v)}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
        />

        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={loading}
          style={styles.saveButton}
        />
      </Card>

      <View style={styles.infoSection}>
        <Text style={[styles.infoTitle, { color: isDark ? colors.surface : colors.onBackground }]}>Account Information</Text>
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Role</Text>
            <Text style={[styles.infoValue, { color: isDark ? colors.surface : colors.onBackground }]}>{user?.role || 'User'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Workspace ID</Text>
            <Text style={[styles.infoValue, { color: isDark ? colors.surface : colors.onBackground }]} numberOfLines={1}>{user?.workspace_id || 'None'}</Text>
          </View>
        </Card>
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
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.nohemi.bold,
  },
  profileCard: {
    padding: 20,
    marginBottom: 24,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontFamily: fonts.nohemi.bold,
    color: '#fff',
  },
  editAvatarBtn: {
    padding: 4,
  },
  saveButton: {
    marginTop: 12,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 12,
  },
  infoCard: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB10',
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    flex: 1,
    textAlign: 'right',
    marginLeft: 20,
  },
});
