import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, useColorScheme, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '../../../src/components/common/Card';
import { colors, fonts } from '../../../src/theme/theme';
import { useAuth } from '../../../src/contexts/AuthContext';
import { ApiService } from '../../../src/services/ApiService';
import { Ionicons } from '@expo/vector-icons';

interface UserInvitation {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'manager' | 'sales' | 'agent' | 'viewer';
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  invitedBy: string;
  invitedByName: string;
  organizationId: string;
  organizationName: string;
  workspaceId?: string;
  workspaceName?: string;
  invitationToken: string;
  invitedAt: string;
  expiresAt: string;
  acceptedAt?: string;
  message?: string;
  permissions: {
    canManageUsers: boolean;
    canManageSettings: boolean;
    canViewReports: boolean;
    canManageLeads: boolean;
    canManageCampaigns: boolean;
  };
}

interface InviteLink {
  id: string;
  name: string;
  role: 'admin' | 'manager' | 'sales' | 'agent' | 'viewer';
  workspaceId?: string;
  workspaceName?: string;
  link: string;
  isActive: boolean;
  uses: number;
  maxUses?: number;
  expiresAt?: string;
  createdAt: string;
  createdBy: string;
  permissions: {
    canManageUsers: boolean;
    canManageSettings: boolean;
    canViewReports: boolean;
    canManageLeads: boolean;
    canManageCampaigns: boolean;
  };
}

export default function UserInviteScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  
  const [invitations, setInvitations] = useState<UserInvitation[]>([]);
  const [inviteLinks, setInviteLinks] = useState<InviteLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'invitations' | 'links' | 'settings'>('invitations');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    name: '',
    role: 'sales' as const,
    message: '',
    workspaceId: '',
    permissions: {
      canManageUsers: false,
      canManageSettings: false,
      canViewReports: true,
      canManageLeads: true,
      canManageCampaigns: false
    }
  });

  const tabs = [
    { key: 'invitations', label: 'Invitations', icon: 'mail-outline' },
    { key: 'links', label: 'Invite Links', icon: 'link-outline' },
    { key: 'settings', label: 'Settings', icon: 'cog-outline' }
  ];

  const roles = [
    { value: 'admin', label: 'Admin', description: 'Full access to all features' },
    { value: 'manager', label: 'Manager', description: 'Manage team and view reports' },
    { value: 'sales', label: 'Sales', description: 'Manage leads and campaigns' },
    { value: 'agent', label: 'Agent', description: 'Basic lead management' },
    { value: 'viewer', label: 'Viewer', description: 'View-only access' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadInvitations(),
        loadInviteLinks()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadInvitations = async () => {
    // Mock invitations data
    const mockInvitations: UserInvitation[] = [
      {
        id: '1',
        email: 'john.doe@example.com',
        name: 'John Doe',
        role: 'sales',
        status: 'pending',
        invitedBy: user?.id || '1',
        invitedByName: user?.name || 'Current User',
        organizationId: user?.organization_id || 'org1',
        organizationName: 'Tech Solutions Inc',
        workspaceId: 'ws1',
        workspaceName: 'Main Sales Team',
        invitationToken: 'inv_123456789',
        invitedAt: new Date(Date.now() - 86400000).toISOString(),
        expiresAt: new Date(Date.now() + 604800000).toISOString(),
        message: 'Join our sales team to help us grow our customer base!',
        permissions: {
          canManageUsers: false,
          canManageSettings: false,
          canViewReports: true,
          canManageLeads: true,
          canManageCampaigns: false
        }
      },
      {
        id: '2',
        email: 'sarah.smith@example.com',
        name: 'Sarah Smith',
        role: 'manager',
        status: 'accepted',
        invitedBy: user?.id || '1',
        invitedByName: user?.name || 'Current User',
        organizationId: user?.organization_id || 'org1',
        organizationName: 'Tech Solutions Inc',
        invitationToken: 'inv_987654321',
        invitedAt: new Date(Date.now() - 172800000).toISOString(),
        expiresAt: new Date(Date.now() + 432000000).toISOString(),
        acceptedAt: new Date(Date.now() - 3600000).toISOString(),
        permissions: {
          canManageUsers: true,
          canManageSettings: false,
          canViewReports: true,
          canManageLeads: true,
          canManageCampaigns: true
        }
      },
      {
        id: '3',
        email: 'mike.wilson@example.com',
        role: 'agent',
        status: 'expired',
        invitedBy: user?.id || '1',
        invitedByName: user?.name || 'Current User',
        organizationId: user?.organization_id || 'org1',
        organizationName: 'Tech Solutions Inc',
        invitationToken: 'inv_456789123',
        invitedAt: new Date(Date.now() - 1209600000).toISOString(),
        expiresAt: new Date(Date.now() - 864000000).toISOString(),
        permissions: {
          canManageUsers: false,
          canManageSettings: false,
          canViewReports: false,
          canManageLeads: true,
          canManageCampaigns: false
        }
      }
    ];
    setInvitations(mockInvitations);
  };

  const loadInviteLinks = async () => {
    // Mock invite links data
    const mockLinks: InviteLink[] = [
      {
        id: '1',
        name: 'Sales Team Invitation',
        role: 'sales',
        workspaceId: 'ws1',
        workspaceName: 'Main Sales Team',
        link: 'https://yourcrm.app/invite/sales-team-abc123',
        isActive: true,
        uses: 5,
        maxUses: 10,
        expiresAt: new Date(Date.now() + 2592000000).toISOString(),
        createdAt: new Date(Date.now() - 604800000).toISOString(),
        createdBy: user?.id || '1',
        permissions: {
          canManageUsers: false,
          canManageSettings: false,
          canViewReports: true,
          canManageLeads: true,
          canManageCampaigns: false
        }
      },
      {
        id: '2',
        name: 'Manager Role Invitation',
        role: 'manager',
        link: 'https://yourcrm.app/invite/manager-def456',
        isActive: true,
        uses: 2,
        maxUses: 3,
        expiresAt: new Date(Date.now() + 864000000).toISOString(),
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        createdBy: user?.id || '1',
        permissions: {
          canManageUsers: true,
          canManageSettings: false,
          canViewReports: true,
          canManageLeads: true,
          canManageCampaigns: true
        }
      },
      {
        id: '3',
        name: 'Public Agent Invitation',
        role: 'agent',
        link: 'https://yourcrm.app/invite/agent-ghi789',
        isActive: false,
        uses: 0,
        createdAt: new Date(Date.now() - 518400000).toISOString(),
        createdBy: user?.id || '1',
        permissions: {
          canManageUsers: false,
          canManageSettings: false,
          canViewReports: false,
          canManageLeads: true,
          canManageCampaigns: false
        }
      }
    ];
    setInviteLinks(mockLinks);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const sendInvitation = async () => {
    if (!inviteForm.email) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    try {
      const newInvitation: UserInvitation = {
        id: Date.now().toString(),
        email: inviteForm.email,
        name: inviteForm.name || undefined,
        role: inviteForm.role,
        status: 'pending',
        invitedBy: user?.id || '1',
        invitedByName: user?.name || 'Current User',
        organizationId: user?.organization_id || 'org1',
        organizationName: 'Tech Solutions Inc',
        workspaceId: inviteForm.workspaceId || undefined,
        invitationToken: `inv_${Date.now()}`,
        invitedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 604800000).toISOString(), // 7 days
        message: inviteForm.message || undefined,
        permissions: inviteForm.permissions
      };

      setInvitations(prev => [newInvitation, ...prev]);
      setInviteForm({
        email: '',
        name: '',
        role: 'sales',
        message: '',
        workspaceId: '',
        permissions: {
          canManageUsers: false,
          canManageSettings: false,
          canViewReports: true,
          canManageLeads: true,
          canManageCampaigns: false
        }
      });
      setShowInviteForm(false);
      Alert.alert('Success', 'Invitation sent successfully');
    } catch (error) {
      console.error('Error sending invitation:', error);
      Alert.alert('Error', 'Failed to send invitation');
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    Alert.alert(
      'Cancel Invitation',
      'Are you sure you want to cancel this invitation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Cancel Invitation',
          style: 'destructive',
          onPress: async () => {
            try {
              setInvitations(prev => prev.map(inv => 
                inv.id === invitationId ? { ...inv, status: 'cancelled' as const } : inv
              ));
              Alert.alert('Success', 'Invitation cancelled');
            } catch (error) {
              console.error('Error cancelling invitation:', error);
              Alert.alert('Error', 'Failed to cancel invitation');
            }
          }
        }
      ]
    );
  };

  const resendInvitation = async (invitationId: string) => {
    try {
      const invitation = invitations.find(inv => inv.id === invitationId);
      if (invitation) {
        const updatedInvitation = {
          ...invitation,
          invitationToken: `inv_${Date.now()}`,
          invitedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 604800000).toISOString(),
          status: 'pending' as const
        };
        setInvitations(prev => prev.map(inv => 
          inv.id === invitationId ? updatedInvitation : inv
        ));
        Alert.alert('Success', 'Invitation resent successfully');
      }
    } catch (error) {
      console.error('Error resending invitation:', error);
      Alert.alert('Error', 'Failed to resend invitation');
    }
  };

  const createInviteLink = async () => {
    try {
      const newLink: InviteLink = {
        id: Date.now().toString(),
        name: `New ${inviteForm.role.charAt(0).toUpperCase() + inviteForm.role.slice(1)} Link`,
        role: inviteForm.role,
        workspaceId: inviteForm.workspaceId || undefined,
        link: `https://yourcrm.app/invite/${Date.now()}`,
        isActive: true,
        uses: 0,
        maxUses: 10,
        expiresAt: new Date(Date.now() + 2592000000).toISOString(), // 30 days
        createdAt: new Date().toISOString(),
        createdBy: user?.id || '1',
        permissions: inviteForm.permissions
      };
      setInviteLinks(prev => [newLink, ...prev]);
      Alert.alert('Success', 'Invite link created successfully');
    } catch (error) {
      console.error('Error creating invite link:', error);
      Alert.alert('Error', 'Failed to create invite link');
    }
  };

  const toggleInviteLink = async (linkId: string) => {
    try {
      setInviteLinks(prev => prev.map(link => 
        link.id === linkId ? { ...link, isActive: !link.isActive } : link
      ));
      Alert.alert('Success', 'Invite link updated');
    } catch (error) {
      console.error('Error toggling invite link:', error);
      Alert.alert('Error', 'Failed to update invite link');
    }
  };

  const deleteInviteLink = async (linkId: string) => {
    Alert.alert(
      'Delete Invite Link',
      'Are you sure you want to delete this invite link?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setInviteLinks(prev => prev.filter(link => link.id !== linkId));
              Alert.alert('Success', 'Invite link deleted');
            } catch (error) {
              console.error('Error deleting invite link:', error);
              Alert.alert('Error', 'Failed to delete invite link');
            }
          }
        }
      ]
    );
  };

  const copyToClipboard = async (text: string) => {
    try {
      // In a real app, you'd use Clipboard API
      Alert.alert('Copied', 'Link copied to clipboard');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      Alert.alert('Error', 'Failed to copy link');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'accepted': return '#10B981';
      case 'expired': return '#EF4444';
      case 'cancelled': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#DC2626';
      case 'manager': return '#8B5CF6';
      case 'sales': return '#3B82F6';
      case 'agent': return '#10B981';
      case 'viewer': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const renderInvitationItem = ({ item }: { item: UserInvitation }) => (
    <Card style={[styles.invitationCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
      <View style={styles.invitationHeader}>
        <View style={styles.invitationInfo}>
          <Text style={[styles.invitationEmail, { color: isDark ? colors.surface : colors.onBackground }]}>
            {item.email}
          </Text>
          {item.name && (
            <Text style={[styles.invitationName, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {item.name}
            </Text>
          )}
          <View style={styles.invitationMeta}>
            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) + '20' }]}>
              <Text style={[styles.roleText, { color: getRoleColor(item.role) }]}>
                {item.role.toUpperCase()}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {item.status.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {item.message && (
        <Text style={[styles.invitationMessage, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          "{item.message}"
        </Text>
      )}

      <View style={styles.invitationDetails}>
        <Text style={[styles.detailText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          Invited by {item.invitedByName} • {new Date(item.invitedAt).toLocaleDateString()}
        </Text>
        <Text style={[styles.detailText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          Expires {new Date(item.expiresAt).toLocaleDateString()}
        </Text>
        {item.acceptedAt && (
          <Text style={[styles.detailText, { color: '#10B981' }]}>
            Accepted {new Date(item.acceptedAt).toLocaleDateString()}
          </Text>
        )}
      </View>

      <View style={styles.invitationActions}>
        {item.status === 'pending' && (
          <>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => resendInvitation(item.id)}
            >
              <Ionicons name="refresh-outline" size={16} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.primary }]}>Resend</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => cancelInvitation(item.id)}
            >
              <Ionicons name="close-circle-outline" size={16} color="#EF4444" />
              <Text style={[styles.actionText, { color: '#EF4444' }]}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
        {item.status === 'expired' && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => resendInvitation(item.id)}
          >
            <Ionicons name="refresh-outline" size={16} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.primary }]}>Resend</Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );

  const renderInviteLinkItem = ({ item }: { item: InviteLink }) => (
    <Card style={[styles.linkCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
      <View style={styles.linkHeader}>
        <View style={styles.linkInfo}>
          <Text style={[styles.linkName, { color: isDark ? colors.surface : colors.onBackground }]}>
            {item.name}
          </Text>
          <View style={styles.linkMeta}>
            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) + '20' }]}>
              <Text style={[styles.roleText, { color: getRoleColor(item.role) }]}>
                {item.role.toUpperCase()}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: item.isActive ? '#10B98120' : '#EF444420' }]}>
              <Text style={[styles.statusText, { color: item.isActive ? '#10B981' : '#EF4444' }]}>
                {item.isActive ? 'ACTIVE' : 'INACTIVE'}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.toggleButton, { backgroundColor: item.isActive ? '#10B981' : '#E5E7EB' }]}
          onPress={() => toggleInviteLink(item.id)}
        >
          <Text style={[styles.toggleText, { color: item.isActive ? '#FFFFFF' : '#6B7280' }]}>
            {item.isActive ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.linkUrlContainer}>
        <Text style={[styles.linkUrl, { color: colors.primary }]} numberOfLines={1}>
          {item.link}
        </Text>
        <TouchableOpacity
          style={styles.copyButton}
          onPress={() => copyToClipboard(item.link)}
        >
          <Ionicons name="copy-outline" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.linkStats}>
        <Text style={[styles.statText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          Uses: {item.uses}{item.maxUses ? `/${item.maxUses}` : ''}
        </Text>
        <Text style={[styles.statText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          Created {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        {item.expiresAt && (
          <Text style={[styles.statText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Expires {new Date(item.expiresAt).toLocaleDateString()}
          </Text>
        )}
      </View>

      <View style={styles.linkActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/invite/links/${item.id}/edit` as any)}
        >
          <Ionicons name="create-outline" size={16} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => deleteInviteLink(item.id)}
        >
          <Ionicons name="trash-outline" size={16} color="#EF4444" />
          <Text style={[styles.actionText, { color: '#EF4444' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderInviteForm = () => (
    <Card style={[styles.formCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
      <Text style={[styles.formTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
        Send Invitation
      </Text>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: isDark ? colors.surface : colors.onBackground }]}>
          Email Address *
        </Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: isDark ? '#374151' : '#F9FAFB',
            color: isDark ? colors.surface : colors.onBackground,
            borderColor: isDark ? '#4B5563' : '#E5E7EB'
          }]}
          value={inviteForm.email}
          onChangeText={(text) => setInviteForm(prev => ({ ...prev, email: text }))}
          placeholder="Enter email address"
          placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: isDark ? colors.surface : colors.onBackground }]}>
          Name (Optional)
        </Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: isDark ? '#374151' : '#F9FAFB',
            color: isDark ? colors.surface : colors.onBackground,
            borderColor: isDark ? '#4B5563' : '#E5E7EB'
          }]}
          value={inviteForm.name}
          onChangeText={(text) => setInviteForm(prev => ({ ...prev, name: text }))}
          placeholder="Enter full name"
          placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: isDark ? colors.surface : colors.onBackground }]}>
          Role *
        </Text>
        <View style={styles.roleOptions}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role.value}
              style={[
                styles.roleOption,
                inviteForm.role === role.value && styles.selectedRoleOption,
                { 
                  backgroundColor: inviteForm.role === role.value ? colors.primary + '20' : (isDark ? '#374151' : '#F9FAFB'),
                  borderColor: inviteForm.role === role.value ? colors.primary : (isDark ? '#4B5563' : '#E5E7EB')
                }
              ]}
              onPress={() => setInviteForm(prev => ({ ...prev, role: role.value as any }))}
            >
              <Text style={[
                styles.roleOptionText,
                inviteForm.role === role.value && styles.selectedRoleOptionText,
                { color: inviteForm.role === role.value ? colors.primary : (isDark ? colors.surface : colors.onBackground) }
              ]}>
                {role.label}
              </Text>
              <Text style={[styles.roleOptionDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                {role.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: isDark ? colors.surface : colors.onBackground }]}>
          Personal Message (Optional)
        </Text>
        <TextInput
          style={[styles.textArea, { 
            backgroundColor: isDark ? '#374151' : '#F9FAFB',
            color: isDark ? colors.surface : colors.onBackground,
            borderColor: isDark ? '#4B5563' : '#E5E7EB'
          }]}
          value={inviteForm.message}
          onChangeText={(text) => setInviteForm(prev => ({ ...prev, message: text }))}
          placeholder="Add a personal message to the invitation"
          placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.formActions}>
        <Button
          title="Cancel"
          onPress={() => setShowInviteForm(false)}
          style={styles.cancelButton}
        />
        <Button
          title="Send Invitation"
          onPress={sendInvitation}
          style={styles.sendButton}
        />
      </View>
    </Card>
  );

  const renderSettingsTab = () => (
    <View style={styles.tabContent}>
      <Card style={[styles.settingsCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <Text style={[styles.settingsTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Invitation Settings
        </Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: isDark ? colors.surface : colors.onBackground }]}>
              Default Invitation Expiry
            </Text>
            <Text style={[styles.settingDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Days before invitations expire
            </Text>
          </View>
          <TouchableOpacity
            style={styles.settingValue}
            onPress={() => Alert.alert('Setting', 'Expiry setting will be implemented')}
          >
            <Text style={[styles.settingValueText, { color: colors.primary }]}>7 days</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: isDark ? colors.surface : colors.onBackground }]}>
              Allow Public Links
            </Text>
            <Text style={[styles.settingDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Enable creation of public invitation links
            </Text>
          </View>
          <TouchableOpacity
            style={styles.settingValue}
            onPress={() => Alert.alert('Setting', 'Public links setting will be implemented')}
          >
            <Text style={[styles.settingValueText, { color: colors.primary }]}>Enabled</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: isDark ? colors.surface : colors.onBackground }]}>
              Require Email Verification
            </Text>
            <Text style={[styles.settingDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Users must verify email before joining
            </Text>
          </View>
          <TouchableOpacity
            style={styles.settingValue}
            onPress={() => Alert.alert('Setting', 'Email verification setting will be implemented')}
          >
            <Text style={[styles.settingValueText, { color: colors.primary }]}>Required</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: isDark ? colors.surface : colors.onBackground }]}>
              Default Role for Links
            </Text>
            <Text style={[styles.settingDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Default role for public invitation links
            </Text>
          </View>
          <TouchableOpacity
            style={styles.settingValue}
            onPress={() => Alert.alert('Setting', 'Default role setting will be implemented')}
          >
            <Text style={[styles.settingValueText, { color: colors.primary }]}>Agent</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </View>
  );

  const renderInvitationsTab = () => (
    <View style={styles.tabContent}>
      {!showInviteForm && (
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            User Invitations ({invitations.length})
          </Text>
          <Button
            title="Send Invite"
            onPress={() => setShowInviteForm(true)}
            style={styles.inviteButton}
          />
        </View>
      )}

      {showInviteForm ? (
        renderInviteForm()
      ) : (
        <FlatList
          data={invitations}
          renderItem={renderInvitationItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="mail-outline" size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
              <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                No invitations sent
              </Text>
            </View>
          }
        />
      )}
    </View>
  );

  const renderLinksTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Invite Links ({inviteLinks.length})
        </Text>
        <Button
          title="Create Link"
          onPress={createInviteLink}
          style={styles.createButton}
        />
      </View>

      <FlatList
        data={inviteLinks}
        renderItem={renderInviteLinkItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="link-outline" size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
            <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              No invite links created
            </Text>
          </View>
        }
      />
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'invitations':
        return renderInvitationsTab();
      case 'links':
        return renderLinksTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return renderInvitationsTab();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          User Invitations
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => Alert.alert('Help', 'User invitation help will be implemented')}
          >
            <Ionicons name="help-circle-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              activeTab === tab.key && styles.activeTabButton,
              { borderColor: isDark ? '#374151' : '#E5E7EB' }
            ]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={16} 
              color={activeTab === tab.key ? colors.primary : (isDark ? '#6B7280' : '#9CA3AF')} 
            />
            <Text style={[
              styles.tabText,
              activeTab === tab.key && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View style={styles.contentContainer}>
        {renderTabContent()}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.nohemi.bold,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  helpButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.primary + '10',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  activeTabButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.nohemi.semiBold,
  },
  inviteButton: {
    paddingHorizontal: 16,
  },
  createButton: {
    paddingHorizontal: 16,
  },
  invitationCard: {
    margin: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  invitationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  invitationInfo: {
    flex: 1,
  },
  invitationEmail: {
    fontSize: 16,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 4,
  },
  invitationName: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    marginBottom: 8,
  },
  invitationMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  roleText: {
    fontSize: 10,
    fontFamily: fonts.satoshi.bold,
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontFamily: fonts.satoshi.bold,
    textTransform: 'uppercase',
  },
  invitationMessage: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    fontStyle: 'italic',
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  invitationDetails: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
    marginBottom: 2,
  },
  invitationActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
  },
  linkCard: {
    margin: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  linkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  linkInfo: {
    flex: 1,
  },
  linkName: {
    fontSize: 16,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 8,
  },
  linkMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 48,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 12,
    fontFamily: fonts.nohemi.bold,
  },
  linkUrlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  linkUrl: {
    flex: 1,
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
    color: colors.primary,
  },
  copyButton: {
    padding: 4,
  },
  linkStats: {
    marginBottom: 12,
  },
  statText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
    marginBottom: 2,
  },
  linkActions: {
    flexDirection: 'row',
    gap: 12,
  },
  formCard: {
    margin: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  formTitle: {
    fontSize: 18,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    minHeight: 80,
  },
  roleOptions: {
    gap: 8,
  },
  roleOption: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  selectedRoleOption: {
    borderWidth: 2,
  },
  roleOptionText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 2,
  },
  selectedRoleOptionText: {
    fontFamily: fonts.nohemi.semiBold,
  },
  roleOptionDescription: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
  },
  sendButton: {
    flex: 1,
  },
  settingsCard: {
    margin: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  settingsTitle: {
    fontSize: 18,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  settingValue: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  settingValueText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    color: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: fonts.satoshi.medium,
    marginTop: 12,
  },
});
