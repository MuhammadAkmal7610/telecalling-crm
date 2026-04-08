import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, TouchableOpacity, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button, Input } from '@/src/components/common/Card';
import { colors, fonts } from '@/src/theme/theme';
import { Ionicons } from '@expo/vector-icons';

export default function SecurityScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  
  const [twoFactor, setTwoFactor] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      Alert.alert('Error', 'Please fill all password fields');
      return;
    }
    if (passwords.new !== passwords.confirm) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Password updated successfully');
      setPasswords({ current: '', new: '', confirm: '' });
    }, 1500);
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
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>Security</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>Change Password</Text>
        <Card style={styles.sectionCard}>
          <Input 
            label="Current Password" 
            secureTextEntry 
            value={passwords.current}
            onChangeText={(v) => setPasswords(prev => ({ ...prev, current: v }))}
          />
          <Input 
            label="New Password" 
            secureTextEntry 
            value={passwords.new}
            onChangeText={(v) => setPasswords(prev => ({ ...prev, new: v }))}
          />
          <Input 
            label="Confirm New Password" 
            secureTextEntry 
            value={passwords.confirm}
            onChangeText={(v) => setPasswords(prev => ({ ...prev, confirm: v }))}
          />
          <Button 
            title="Update Password" 
            onPress={handlePasswordChange} 
            loading={loading}
            style={styles.saveButton}
          />
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>Two-Factor Authentication</Text>
        <Card style={styles.sectionCard}>
          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: isDark ? colors.surface : colors.onBackground }]}>Enable 2FA</Text>
              <Text style={[styles.settingDesc, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Secure your account with an extra layer of protection</Text>
            </View>
            <Switch 
              value={twoFactor} 
              onValueChange={setTwoFactor}
              trackColor={{ false: '#E5E7EB', true: colors.primary + '40' }}
              thumbColor={twoFactor ? colors.primary : '#fff'}
            />
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>Active Sessions</Text>
        <Card style={styles.sectionCard}>
          <View style={styles.sessionItem}>
            <Ionicons name="phone-portrait-outline" size={24} color={colors.primary} />
            <View style={styles.sessionInfo}>
              <Text style={[styles.sessionText, { color: isDark ? colors.surface : colors.onBackground }]}>Current Device (SM-G991B)</Text>
              <Text style={[styles.sessionSubtext, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Last active: Just now • London, UK</Text>
            </View>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>ACTIVE</Text>
            </View>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 20, paddingTop: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backButton: { marginRight: 16 },
  title: { fontSize: 24, fontFamily: fonts.nohemi.bold },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontFamily: fonts.nohemi.semiBold, marginBottom: 12, paddingHorizontal: 4 },
  sectionCard: { padding: 16 },
  saveButton: { marginTop: 12 },
  settingRow: { flexDirection: 'row', alignItems: 'center' },
  settingLabel: { fontSize: 15, fontFamily: fonts.satoshi.medium, marginBottom: 2 },
  settingDesc: { fontSize: 12, fontFamily: fonts.satoshi.regular },
  sessionItem: { flexDirection: 'row', alignItems: 'center' },
  sessionInfo: { flex: 1, marginLeft: 12 },
  sessionText: { fontSize: 14, fontFamily: fonts.satoshi.medium },
  sessionSubtext: { fontSize: 12, fontFamily: fonts.satoshi.regular },
  activeBadge: { backgroundColor: '#10B98120', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  activeBadgeText: { color: '#10B981', fontSize: 10, fontFamily: fonts.satoshi.bold },
});
