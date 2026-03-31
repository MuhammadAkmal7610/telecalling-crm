import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '@/src/components/common/Card';
import { colors, fonts } from '@/src/theme/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const isDark = useColorScheme() === 'dark';

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)' as any);
          },
        },
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showArrow = true 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.settingItem}>
        <View style={styles.settingContent}>
          <View style={[styles.settingIcon, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name={icon as any} size={20} color={colors.primary} />
          </View>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
              {title}
            </Text>
            {subtitle && (
              <Text style={[styles.settingSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                {subtitle}
              </Text>
            )}
          </View>
          {showArrow && (
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={isDark ? '#6B7280' : '#9CA3AF'} 
            />
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* User Profile Section */}
      <Card style={styles.profileCard}>
        <View style={styles.profileContent}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: isDark ? colors.surface : colors.onBackground }]}>
              {user?.name || 'User'}
            </Text>
            <Text style={[styles.profileEmail, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {user?.email}
            </Text>
            <Text style={[styles.profileRole, { color: colors.primary }]}>
              {user?.role || 'User'}
            </Text>
          </View>
        </View>
      </Card>

      {/* Account Settings */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Account
        </Text>
        
        <SettingItem
          icon="person-outline"
          title="Edit Profile"
          subtitle="Update your personal information"
          onPress={() => router.push('/settings/profile' as any)}
        />
        
        <SettingItem
          icon="notifications-outline"
          title="Notifications"
          subtitle="Manage your notification preferences"
          onPress={() => router.push('/settings/notifications' as any)}
        />
        
        <SettingItem
          icon="lock-closed-outline"
          title="Security"
          subtitle="Password and authentication settings"
          onPress={() => router.push('/settings/security' as any)}
        />
      </View>

      {/* App Settings */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Application
        </Text>
        
        <SettingItem
          icon="color-palette-outline"
          title="Appearance"
          subtitle="Theme and display settings"
          onPress={() => router.push('/settings/appearance' as any)}
        />
        
        <SettingItem
          icon="language-outline"
          title="Language"
          subtitle="Choose your preferred language"
          onPress={() => router.push('/settings/language' as any)}
        />
        
        <SettingItem
          icon="sync-outline"
          title="Data & Sync"
          subtitle="Manage data synchronization"
          onPress={() => router.push('/settings/sync' as any)}
        />
      </View>

      {/* Support */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Support
        </Text>
        
        <SettingItem
          icon="help-circle-outline"
          title="Help Center"
          subtitle="Get help and support"
          onPress={() => router.push('/settings/help' as any)}
        />
        
        <SettingItem
          icon="document-text-outline"
          title="Terms & Privacy"
          subtitle="Legal information and policies"
          onPress={() => router.push('/settings/legal' as any)}
        />
        
        <SettingItem
          icon="information-circle-outline"
          title="About"
          subtitle="App version and information"
          onPress={() => router.push('/settings/about' as any)}
        />
      </View>

      {/* Sign Out Button */}
      <View style={styles.section}>
        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="secondary"
          style={[styles.signOutButton, { borderColor: '#EF4444' }]}
        />
      </View>

      {/* App Version */}
      <Text style={[styles.versionText, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
        TeleCRM Mobile v1.0.0
      </Text>
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
  profileCard: {
    padding: 20,
    marginBottom: 24,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontFamily: fonts.nohemi.bold,
    color: colors.onPrimary,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    marginBottom: 2,
  },
  profileRole: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  settingItem: {
    marginBottom: 8,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    fontFamily: fonts.satoshi.regular,
  },
  signOutButton: {
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  versionText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
    textAlign: 'center',
    marginTop: 8,
  },
});
