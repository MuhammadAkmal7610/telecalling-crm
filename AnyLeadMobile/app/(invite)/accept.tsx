import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, useColorScheme, ScrollView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Card, Button } from '@/src/components/common/Card';
import { colors, fonts } from '@/src/theme/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { ApiService } from '@/src/services/ApiService';
import { Ionicons } from '@expo/vector-icons';

interface InvitationDetails {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'manager' | 'sales' | 'agent' | 'viewer';
  organizationName: string;
  organizationId: string;
  workspaceName?: string;
  workspaceId?: string;
  invitedBy: string;
  invitedByName: string;
  message?: string;
  permissions: {
    canManageUsers: boolean;
    canManageSettings: boolean;
    canViewReports: boolean;
    canManageLeads: boolean;
    canManageCampaigns: boolean;
  };
  createdAt: string;
  expiresAt: string;
}

export default function InviteAcceptanceScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams();
  const { user, signIn } = useAuth();
  const isDark = useColorScheme() === 'dark';
  
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!user);

  useEffect(() => {
    if (token) {
      loadInvitation(token as string);
    } else {
      setError('Invalid invitation link');
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    setIsAuthenticated(!!user);
  }, [user]);

  const loadInvitation = async (invitationToken: string) => {
    try {
      setLoading(true);
      setError(null);

      // Mock API call to validate invitation
      // In a real app, you'd call your API
      const mockInvitation: InvitationDetails = {
        id: '1',
        email: 'john.doe@example.com',
        name: 'John Doe',
        role: 'sales',
        organizationName: 'Tech Solutions Inc',
        organizationId: 'org1',
        workspaceName: 'Main Sales Team',
        workspaceId: 'ws1',
        invitedBy: 'user123',
        invitedByName: 'Sarah Johnson',
        message: 'Welcome to our team! We\'re excited to have you join us to help grow our customer base.',
        permissions: {
          canManageUsers: false,
          canManageSettings: false,
          canViewReports: true,
          canManageLeads: true,
          canManageCampaigns: false
        },
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        expiresAt: new Date(Date.now() + 604800000).toISOString()
      };

      // Simulate API delay
      setTimeout(() => {
        setInvitation(mockInvitation);
        setLoading(false);
      }, 1000);

    } catch (error) {
      console.error('Error loading invitation:', error);
      setError('Failed to load invitation');
      setLoading(false);
    }
  };

  const acceptInvitation = async () => {
    if (!invitation) return;

    try {
      setAccepting(true);

      if (!isAuthenticated) {
        // Redirect to sign up with invitation context
        router.push({
          pathname: '/(auth)/sign-up',
          params: {
            invitationToken: token,
            email: invitation.email,
            name: invitation.name || ''
          }
        } as any);
        return;
      }

      // User is authenticated, accept the invitation
      // In a real app, you'd call your API to accept the invitation
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

      Alert.alert(
        'Welcome!',
        `You've successfully joined ${invitation.organizationName} as a ${invitation.role}!`,
        [
          {
            text: 'Get Started',
            onPress: () => router.replace('/(main)/dashboard' as any)
          }
        ]
      );

    } catch (error) {
      console.error('Error accepting invitation:', error);
      Alert.alert('Error', 'Failed to accept invitation. Please try again.');
    } finally {
      setAccepting(false);
    }
  };

  const declineInvitation = () => {
    Alert.alert(
      'Decline Invitation',
      'Are you sure you want to decline this invitation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Invitation Declined', 'The invitation has been declined.');
            router.replace('/' as any);
          }
        }
      ]
    );
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

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin': return 'Full access to all features and settings';
      case 'manager': return 'Manage team members and view comprehensive reports';
      case 'sales': return 'Manage leads, campaigns, and customer interactions';
      case 'agent': return 'Basic lead management and communication tools';
      case 'viewer': return 'View-only access to reports and data';
      default: return 'Standard user access';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: isDark ? colors.surface : colors.onBackground }]}>
            Loading invitation...
          </Text>
        </View>
      </View>
    );
  }

  if (error || !invitation) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={[styles.errorTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Invalid Invitation
          </Text>
          <Text style={[styles.errorMessage, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {error || 'This invitation link is invalid or has expired.'}
          </Text>
          <Button
            title="Go to Homepage"
            onPress={() => router.replace('/' as any)}
            style={styles.homeButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          You're Invited!
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Organization Card */}
        <Card style={[styles.organizationCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
          <View style={styles.organizationHeader}>
            <View style={styles.organizationIcon}>
              <Ionicons name="business-outline" size={32} color={colors.primary} />
            </View>
            <View style={styles.organizationInfo}>
              <Text style={[styles.organizationName, { color: isDark ? colors.surface : colors.onBackground }]}>
                {invitation.organizationName}
              </Text>
              {invitation.workspaceName && (
                <Text style={[styles.workspaceName, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  {invitation.workspaceName}
                </Text>
              )}
            </View>
          </View>

          {invitation.message && (
            <View style={styles.messageContainer}>
              <Text style={[styles.messageLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Message from {invitation.invitedByName}:
              </Text>
              <Text style={[styles.messageText, { color: isDark ? colors.surface : colors.onBackground }]}>
                "{invitation.message}"
              </Text>
            </View>
          )}
        </Card>

        {/* Role Card */}
        <Card style={[styles.roleCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
          <Text style={[styles.roleTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Your Role
          </Text>
          
          <View style={styles.roleContainer}>
            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(invitation.role) + '20' }]}>
              <Text style={[styles.roleText, { color: getRoleColor(invitation.role) }]}>
                {invitation.role.toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.roleDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {getRoleDescription(invitation.role)}
            </Text>
          </View>

          <View style={styles.permissionsContainer}>
            <Text style={[styles.permissionsTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
              Permissions:
            </Text>
            <View style={styles.permissionsList}>
              {invitation.permissions.canManageLeads && (
                <View style={styles.permissionItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={[styles.permissionText, { color: isDark ? colors.surface : colors.onBackground }]}>
                    Manage Leads
                  </Text>
                </View>
              )}
              {invitation.permissions.canViewReports && (
                <View style={styles.permissionItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={[styles.permissionText, { color: isDark ? colors.surface : colors.onBackground }]}>
                    View Reports
                  </Text>
                </View>
              )}
              {invitation.permissions.canManageCampaigns && (
                <View style={styles.permissionItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={[styles.permissionText, { color: isDark ? colors.surface : colors.onBackground }]}>
                    Manage Campaigns
                  </Text>
                </View>
              )}
              {invitation.permissions.canManageUsers && (
                <View style={styles.permissionItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={[styles.permissionText, { color: isDark ? colors.surface : colors.onBackground }]}>
                    Manage Users
                  </Text>
                </View>
              )}
              {invitation.permissions.canManageSettings && (
                <View style={styles.permissionItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={[styles.permissionText, { color: isDark ? colors.surface : colors.onBackground }]}>
                    Manage Settings
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Card>

        {/* User Info Card */}
        <Card style={[styles.userInfoCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
          <Text style={[styles.userInfoTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Account Information
          </Text>
          
          <View style={styles.userInfoItem}>
            <Text style={[styles.userInfoLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Email:
            </Text>
            <Text style={[styles.userInfoValue, { color: isDark ? colors.surface : colors.onBackground }]}>
              {invitation.email}
            </Text>
          </View>

          {invitation.name && (
            <View style={styles.userInfoItem}>
              <Text style={[styles.userInfoLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Name:
              </Text>
              <Text style={[styles.userInfoValue, { color: isDark ? colors.surface : colors.onBackground }]}>
                {invitation.name}
              </Text>
            </View>
          )}

          <View style={styles.userInfoItem}>
            <Text style={[styles.userInfoLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Invited by:
            </Text>
            <Text style={[styles.userInfoValue, { color: isDark ? colors.surface : colors.onBackground }]}>
              {invitation.invitedByName}
            </Text>
          </View>

          <View style={styles.userInfoItem}>
            <Text style={[styles.userInfoLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Expires:
            </Text>
            <Text style={[styles.userInfoValue, { color: isDark ? colors.surface : colors.onBackground }]}>
              {new Date(invitation.expiresAt).toLocaleDateString()}
            </Text>
          </View>
        </Card>

        {/* Authentication Status */}
        {!isAuthenticated && (
          <Card style={[styles.authCard, { backgroundColor: '#FEF3C7' }]}>
            <View style={styles.authContent}>
              <Ionicons name="information-circle-outline" size={24} color="#F59E0B" />
              <View style={styles.authText}>
                <Text style={[styles.authTitle, { color: '#92400E' }]}>
                  Sign Up Required
                </Text>
                <Text style={[styles.authDescription, { color: '#78350F' }]}>
                  You need to create an account to accept this invitation.
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <Button
            title={isAuthenticated ? 'Accept Invitation' : 'Sign Up & Accept'}
            onPress={acceptInvitation}
            loading={accepting}
            style={styles.acceptButton}
          />
          <TouchableOpacity
            style={styles.declineButton}
            onPress={declineInvitation}
          >
            <Text style={styles.declineText}>Decline Invitation</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: fonts.satoshi.medium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: fonts.nohemi.semiBold,
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    fontFamily: fonts.satoshi.regular,
    textAlign: 'center',
    marginBottom: 24,
  },
  homeButton: {
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 40,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.nohemi.bold,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  organizationCard: {
    marginBottom: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  organizationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  organizationIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  organizationInfo: {
    flex: 1,
  },
  organizationName: {
    fontSize: 20,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 4,
  },
  workspaceName: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
  messageContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  messageLabel: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    fontStyle: 'italic',
  },
  roleCard: {
    marginBottom: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  roleTitle: {
    fontSize: 18,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 16,
  },
  roleContainer: {
    marginBottom: 20,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  roleText: {
    fontSize: 12,
    fontFamily: fonts.nohemi.bold,
    textTransform: 'uppercase',
  },
  roleDescription: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
  permissionsContainer: {
    marginTop: 16,
  },
  permissionsTitle: {
    fontSize: 16,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 12,
  },
  permissionsList: {
    gap: 8,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  permissionText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
  userInfoCard: {
    marginBottom: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  userInfoTitle: {
    fontSize: 18,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 16,
  },
  userInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfoLabel: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
  },
  userInfoValue: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
  authCard: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  authContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  authText: {
    flex: 1,
  },
  authTitle: {
    fontSize: 14,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 2,
  },
  authDescription: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  actionContainer: {
    paddingBottom: 40,
  },
  acceptButton: {
    marginBottom: 12,
  },
  declineButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  declineText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    color: '#EF4444',
  },
});
