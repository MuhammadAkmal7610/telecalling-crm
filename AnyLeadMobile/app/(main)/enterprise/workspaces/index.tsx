import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, useColorScheme, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '@/src/components/common/Card';
import { colors, fonts } from '@/src/theme/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { ApiService } from '@/src/services/ApiService';
import { Ionicons } from '@expo/vector-icons';

interface Workspace {
  id: string;
  name: string;
  description?: string;
  organization_id?: string;
  is_default?: boolean;
  created_at?: string;
  myRole?: string;
  // Mock fields for UI layout
  status?: string;
  limits?: any;
  usage?: any;
  features?: any;
  owner?: any;
}

interface Organization {
  id: string;
  name: string;
  domain: string;
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'trial' | 'expired' | 'cancelled';
  workspaces: Workspace[];
  billing: {
    nextBillingDate: string;
    amount: number;
    currency: string;
  };
  createdAt: string;
}

export default function WorkspaceManagementScreen() {
  const router = useRouter();
  const { user, updateUserWorkspace } = useAuth();
  const isDark = useColorScheme() === 'dark';
  
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'workspaces' | 'organizations' | 'billing'>('workspaces');

  const tabs = [
    { key: 'workspaces', label: 'Workspaces', icon: 'business-outline' },
    { key: 'organizations', label: 'Organizations', icon: 'grid-outline' },
    { key: 'billing', label: 'Billing', icon: 'card-outline' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadOrganizations(),
        loadWorkspaces()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadOrganizations = async () => {
    setOrganizations([]);
  };

  const loadWorkspaces = async () => {
    try {
      const { data, error } = await ApiService.getMyWorkspaces();
      if (!error && data) {
        setWorkspaces(data);
      } else {
        setWorkspaces([]);
      }
    } catch {
      setWorkspaces([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const toggleWorkspaceStatus = async (workspaceId: string) => {
    try {
      setWorkspaces(prev => prev.map(workspace => 
        workspace.id === workspaceId 
          ? { ...workspace, status: workspace.status === 'active' ? 'inactive' : 'active' }
          : workspace
      ));
      Alert.alert('Success', 'Workspace status updated');
    } catch (error) {
      console.error('Error updating workspace status:', error);
      Alert.alert('Error', 'Failed to update workspace status');
    }
  };

  const deleteWorkspace = async (workspaceId: string) => {
    Alert.alert(
      'Delete Workspace',
      'Are you sure you want to delete this workspace? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setWorkspaces(prev => prev.filter(workspace => workspace.id !== workspaceId));
              Alert.alert('Success', 'Workspace deleted successfully');
            } catch (error) {
              console.error('Error deleting workspace:', error);
              Alert.alert('Error', 'Failed to delete workspace');
            }
          }
        }
      ]
    );
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return '#6B7280';
      case 'starter': return '#10B981';
      case 'professional': return '#3B82F6';
      case 'enterprise': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'inactive': return '#F59E0B';
      case 'suspended': return '#EF4444';
      case 'trial': return '#3B82F6';
      case 'expired': return '#EF4444';
      case 'cancelled': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return '#EF4444';
    if (percentage >= 70) return '#F59E0B';
    return '#10B981';
  };

  const handleSelectWorkspace = async (workspaceId: string) => {
    try {
      setLoading(true);
      
      // If already active, just go back to dashboard
      if (user?.workspace_id === workspaceId) {
        router.replace('/dashboard' as any);
        return;
      }

      const { error } = await updateUserWorkspace(workspaceId);
      if (error) {
        Alert.alert('Error', 'Failed to update active workspace');
      } else {
        router.replace('/dashboard' as any);
      }
    } catch {
      Alert.alert('Error', 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const renderWorkspaceItem = ({ item }: { item: Workspace }) => {
    const isActive = user?.workspace_id === item.id;

    return (
      <Card style={[styles.workspaceCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderColor: isActive ? colors.primary : 'transparent', borderWidth: isActive ? 2 : 0 }]}>
        <View style={styles.workspaceHeader}>
          <View style={styles.workspaceInfo}>
            <Text style={[styles.workspaceName, { color: isDark ? colors.surface : colors.onBackground }]}>
              {item.name}
            </Text>
            {item.description ? (
              <Text style={[styles.workspaceDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                {item.description}
              </Text>
            ) : null}
            <View style={styles.workspaceMeta}>
              <View style={[styles.statusBadge, { backgroundColor: (isActive ? '#10B981' : '#6B7280') + '20' }]}>
                <Text style={[styles.statusText, { color: isActive ? '#10B981' : '#6B7280' }]}>
                  {isActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
              {item.myRole && (
                <Text style={[styles.ownerText, { color: isDark ? '#9CA3AF' : '#6B7280', textTransform: 'capitalize' }]}>
                  Role: {item.myRole}
                </Text>
              )}
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.statusToggle, { backgroundColor: isActive ? '#10B981' : colors.primary }]}
            onPress={() => handleSelectWorkspace(item.id)}
          >
            <Text style={[styles.toggleText, { color: '#FFFFFF' }]}>
              {isActive ? 'Current' : 'Select'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.workspaceActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/enterprise/workspaces/${item.id}/settings` as any)}
          >
            <Ionicons name="cog-outline" size={16} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.primary }]}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/enterprise/workspaces/${item.id}/members` as any)}
          >
            <Ionicons name="people-outline" size={16} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.primary }]}>Members</Text>
          </TouchableOpacity>
          {item.myRole === 'admin' && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => deleteWorkspace(item.id)}
            >
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
              <Text style={[styles.actionText, { color: '#EF4444' }]}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </Card>
    );
  };

  const renderOrganizationItem = ({ item }: { item: Organization }) => (
    <Card style={[styles.organizationCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
      <View style={styles.organizationHeader}>
        <View style={styles.organizationInfo}>
          <Text style={[styles.organizationName, { color: isDark ? colors.surface : colors.onBackground }]}>
            {item.name}
          </Text>
          <Text style={[styles.organizationDomain, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {item.domain}
          </Text>
          <View style={styles.organizationMeta}>
            <View style={[styles.planBadge, { backgroundColor: getPlanColor(item.plan) + '20' }]}>
              <Text style={[styles.planText, { color: getPlanColor(item.plan) }]}>
                {item.plan.toUpperCase()}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {item.status}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.billingSection}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Billing Information
        </Text>
        <View style={styles.billingInfo}>
          <Text style={[styles.billingAmount, { color: isDark ? colors.surface : colors.onBackground }]}>
            ${item.billing.amount} {item.billing.currency}
          </Text>
          <Text style={[styles.billingDate, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Next billing: {new Date(item.billing.nextBillingDate).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.organizationActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/enterprise/organizations/${item.id}/edit` as any)}
        >
          <Ionicons name="create-outline" size={16} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/enterprise/organizations/${item.id}/billing` as any)}
        >
          <Ionicons name="card-outline" size={16} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>Billing</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderBillingTab = () => (
    <View style={styles.tabContent}>
      <Card style={styles.billingOverviewCard}>
        <Text style={[styles.overviewTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Billing Overview
        </Text>
        <View style={styles.billingStats}>
          <View style={styles.billingStatItem}>
            <Text style={[styles.billingStatValue, { color: isDark ? colors.surface : colors.onBackground }]}>
              $898
            </Text>
            <Text style={[styles.billingStatLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Total Monthly
            </Text>
          </View>
          <View style={styles.billingStatItem}>
            <Text style={[styles.billingStatValue, { color: '#10B981' }]}>
              2
            </Text>
            <Text style={[styles.billingStatLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Active Orgs
            </Text>
          </View>
          <View style={styles.billingStatItem}>
            <Text style={[styles.billingStatValue, { color: colors.primary }]}>
              3
            </Text>
            <Text style={[styles.billingStatLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Workspaces
            </Text>
          </View>
        </View>
      </Card>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Recent Invoices
        </Text>
        <Button
          title="View All"
          onPress={() => router.push('/enterprise/billing/invoices' as any)}
          style={styles.viewAllButton}
        />
      </View>

      <Card style={styles.invoiceCard}>
        <Text style={[styles.invoicePlaceholder, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          Invoice history and billing management will be implemented here
        </Text>
      </Card>
    </View>
  );

  const renderWorkspacesTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Workspaces ({workspaces.length})
        </Text>
        <Button
          title="Create Workspace"
          onPress={() => router.push('/enterprise/workspaces/create' as any)}
          style={styles.createButton}
        />
      </View>

      <FlatList
        data={workspaces}
        renderItem={renderWorkspaceItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="business-outline" size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
            <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              No workspaces found
            </Text>
          </View>
        }
      />
    </View>
  );

  const renderOrganizationsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Organizations ({organizations.length})
        </Text>
        <Button
          title="Create Organization"
          onPress={() => router.push('/enterprise/organizations/create' as any)}
          style={styles.createButton}
        />
      </View>

      <FlatList
        data={organizations}
        renderItem={renderOrganizationItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="grid-outline" size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
            <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              No organizations found
            </Text>
          </View>
        }
      />
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'workspaces':
        return renderWorkspacesTab();
      case 'organizations':
        return renderOrganizationsTab();
      case 'billing':
        return renderBillingTab();
      default:
        return renderWorkspacesTab();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          Workspace Management
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push('/enterprise/settings' as any)}
          >
            <Ionicons name="cog-outline" size={20} color={colors.primary} />
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
  settingsButton: {
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
  createButton: {
    paddingHorizontal: 16,
  },
  viewAllButton: {
    paddingHorizontal: 16,
  },
  workspaceCard: {
    margin: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  workspaceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  workspaceInfo: {
    flex: 1,
  },
  workspaceName: {
    fontSize: 16,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 4,
  },
  workspaceDescription: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    marginBottom: 8,
  },
  workspaceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  ownerText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  statusToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  toggleText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.bold,
  },
  usageSection: {
    marginBottom: 16,
  },
  usageItem: {
    marginBottom: 12,
  },
  usageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  usageLabel: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
  },
  usageText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBackground: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  percentageText: {
    fontSize: 10,
    fontFamily: fonts.satoshi.medium,
    minWidth: 30,
    textAlign: 'right',
  },
  featuresSection: {
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: '48%',
  },
  featureText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  workspaceActions: {
    flexDirection: 'row',
    gap: 16,
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
  organizationCard: {
    margin: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  organizationHeader: {
    marginBottom: 16,
  },
  organizationInfo: {
    flex: 1,
  },
  organizationName: {
    fontSize: 16,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 4,
  },
  organizationDomain: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    marginBottom: 8,
  },
  organizationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  planText: {
    fontSize: 10,
    fontFamily: fonts.satoshi.bold,
    textTransform: 'uppercase',
  },
  billingSection: {
    marginBottom: 16,
  },
  billingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billingAmount: {
    fontSize: 16,
    fontFamily: fonts.nohemi.bold,
  },
  billingDate: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  organizationActions: {
    flexDirection: 'row',
    gap: 16,
  },
  billingOverviewCard: {
    margin: 20,
    padding: 16,
  },
  overviewTitle: {
    fontSize: 16,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 16,
  },
  billingStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  billingStatItem: {
    alignItems: 'center',
  },
  billingStatValue: {
    fontSize: 20,
    fontFamily: fonts.nohemi.bold,
    marginBottom: 4,
  },
  billingStatLabel: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
  },
  invoiceCard: {
    margin: 20,
    padding: 20,
    alignItems: 'center',
  },
  invoicePlaceholder: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    textAlign: 'center',
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
