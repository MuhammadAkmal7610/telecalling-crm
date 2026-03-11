import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '../../../src/components/common/Card';
import { colors, fonts } from '../../../src/theme/theme';
import { useAuth } from '../../../src/contexts/AuthContext';
import { ApiService } from '../../../src/services/ApiService';
import { Ionicons } from '@expo/vector-icons';

interface Workspace {
  id: string;
  name: string;
  description: string;
  organizationId: string;
  status: 'active' | 'inactive' | 'suspended';
  settings: {
    timezone: string;
    currency: string;
    dateFormat: string;
    language: string;
  };
  limits: {
    users: number;
    leads: number;
    storage: number; // in MB
    apiCalls: number; // per month
  };
  usage: {
    users: number;
    leads: number;
    storage: number;
    apiCalls: number;
  };
  features: {
    analytics: boolean;
    automation: boolean;
    integrations: boolean;
    customFields: boolean;
    apiAccess: boolean;
  };
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
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
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark');
  
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
    // Mock organizations data
    const mockOrganizations: Organization[] = [
      {
        id: 'org1',
        name: 'Tech Solutions Inc',
        domain: 'techsolutions.com',
        plan: 'professional',
        status: 'active',
        workspaces: [],
        billing: {
          nextBillingDate: new Date(Date.now() + 2592000000).toISOString(),
          amount: 299,
          currency: 'USD'
        },
        createdAt: new Date(Date.now() - 31536000000).toISOString()
      },
      {
        id: 'org2',
        name: 'Sales Corp',
        domain: 'salescorp.com',
        plan: 'enterprise',
        status: 'active',
        workspaces: [],
        billing: {
          nextBillingDate: new Date(Date.now() + 86400000).toISOString(),
          amount: 599,
          currency: 'USD'
        },
        createdAt: new Date(Date.now() - 63072000000).toISOString()
      }
    ];
    setOrganizations(mockOrganizations);
  };

  const loadWorkspaces = async () => {
    // Mock workspaces data
    const mockWorkspaces: Workspace[] = [
      {
        id: 'ws1',
        name: 'Main Sales Team',
        description: 'Primary workspace for sales operations',
        organizationId: 'org1',
        status: 'active',
        settings: {
          timezone: 'America/New_York',
          currency: 'USD',
          dateFormat: 'MM/DD/YYYY',
          language: 'en'
        },
        limits: {
          users: 50,
          leads: 10000,
          storage: 5000,
          apiCalls: 100000
        },
        usage: {
          users: 23,
          leads: 3456,
          storage: 1234,
          apiCalls: 45678
        },
        features: {
          analytics: true,
          automation: true,
          integrations: true,
          customFields: true,
          apiAccess: true
        },
        createdAt: new Date(Date.now() - 2592000000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        owner: {
          id: 'user1',
          name: 'John Smith',
          email: 'john@techsolutions.com'
        }
      },
      {
        id: 'ws2',
        name: 'Support Team',
        description: 'Customer support and service workspace',
        organizationId: 'org1',
        status: 'active',
        settings: {
          timezone: 'America/Los_Angeles',
          currency: 'USD',
          dateFormat: 'MM/DD/YYYY',
          language: 'en'
        },
        limits: {
          users: 20,
          leads: 5000,
          storage: 2000,
          apiCalls: 50000
        },
        usage: {
          users: 8,
          leads: 1234,
          storage: 567,
          apiCalls: 12345
        },
        features: {
          analytics: true,
          automation: false,
          integrations: true,
          customFields: false,
          apiAccess: false
        },
        createdAt: new Date(Date.now() - 5184000000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
        owner: {
          id: 'user2',
          name: 'Sarah Johnson',
          email: 'sarah@techsolutions.com'
        }
      },
      {
        id: 'ws3',
        name: 'Marketing',
        description: 'Marketing campaigns and lead generation',
        organizationId: 'org2',
        status: 'inactive',
        settings: {
          timezone: 'Europe/London',
          currency: 'GBP',
          dateFormat: 'DD/MM/YYYY',
          language: 'en'
        },
        limits: {
          users: 15,
          leads: 3000,
          storage: 1500,
          apiCalls: 30000
        },
        usage: {
          users: 5,
          leads: 567,
          storage: 234,
          apiCalls: 6789
        },
        features: {
          analytics: true,
          automation: true,
          integrations: true,
          customFields: true,
          apiAccess: true
        },
        createdAt: new Date(Date.now() - 7776000000).toISOString(),
        updatedAt: new Date(Date.now() - 604800000).toISOString(),
        owner: {
          id: 'user3',
          name: 'Michael Chen',
          email: 'michael@salescorp.com'
        }
      }
    ];
    setWorkspaces(mockWorkspaces);
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

  const renderWorkspaceItem = ({ item }: { item: Workspace }) => {
    const userUsage = getUsagePercentage(item.usage.users, item.limits.users);
    const leadUsage = getUsagePercentage(item.usage.leads, item.limits.leads);
    const storageUsage = getUsagePercentage(item.usage.storage, item.limits.storage);

    return (
      <Card style={[styles.workspaceCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <View style={styles.workspaceHeader}>
          <View style={styles.workspaceInfo}>
            <Text style={[styles.workspaceName, { color: isDark ? colors.surface : colors.onBackground }]}>
              {item.name}
            </Text>
            <Text style={[styles.workspaceDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {item.description}
            </Text>
            <View style={styles.workspaceMeta}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {item.status}
                </Text>
              </View>
              <Text style={[styles.ownerText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Owner: {item.owner.name}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.statusToggle, { backgroundColor: item.status === 'active' ? '#10B981' : '#E5E7EB' }]}
            onPress={() => toggleWorkspaceStatus(item.id)}
          >
            <Text style={[styles.toggleText, { color: item.status === 'active' ? '#FFFFFF' : '#6B7280' }]}>
              {item.status === 'active' ? 'Active' : 'Inactive'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.usageSection}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Resource Usage
          </Text>
          
          <View style={styles.usageItem}>
            <View style={styles.usageHeader}>
              <Text style={[styles.usageLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Users
              </Text>
              <Text style={[styles.usageText, { color: isDark ? colors.surface : colors.onBackground }]}>
                {item.usage.users}/{item.limits.users}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressBackground, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]}>
                <View 
                  style={[styles.progressFill, { 
                    width: `${userUsage}%`, 
                    backgroundColor: getUsageColor(userUsage) 
                  }]} 
                />
              </View>
              <Text style={[styles.percentageText, { color: getUsageColor(userUsage) }]}>
                {userUsage.toFixed(0)}%
              </Text>
            </View>
          </View>

          <View style={styles.usageItem}>
            <View style={styles.usageHeader}>
              <Text style={[styles.usageLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Leads
              </Text>
              <Text style={[styles.usageText, { color: isDark ? colors.surface : colors.onBackground }]}>
                {item.usage.leads.toLocaleString()}/{item.limits.leads.toLocaleString()}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressBackground, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]}>
                <View 
                  style={[styles.progressFill, { 
                    width: `${leadUsage}%`, 
                    backgroundColor: getUsageColor(leadUsage) 
                  }]} 
                />
              </View>
              <Text style={[styles.percentageText, { color: getUsageColor(leadUsage) }]}>
                {leadUsage.toFixed(0)}%
              </Text>
            </View>
          </View>

          <View style={styles.usageItem}>
            <View style={styles.usageHeader}>
              <Text style={[styles.usageLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Storage
              </Text>
              <Text style={[styles.usageText, { color: isDark ? colors.surface : colors.onBackground }]}>
                {item.usage.storage}MB/{item.limits.storage}MB
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressBackground, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]}>
                <View 
                  style={[styles.progressFill, { 
                    width: `${storageUsage}%`, 
                    backgroundColor: getUsageColor(storageUsage) 
                  }]} 
                />
              </View>
              <Text style={[styles.percentageText, { color: getUsageColor(storageUsage) }]}>
                {storageUsage.toFixed(0)}%
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.featuresSection}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Features
          </Text>
          <View style={styles.featuresGrid}>
            {Object.entries(item.features).map(([key, enabled]) => (
              <View key={key} style={styles.featureItem}>
                <Ionicons 
                  name={enabled ? 'checkmark-circle' : 'close-circle'} 
                  size={16} 
                  color={enabled ? '#10B981' : '#EF4444'} 
                />
                <Text style={[styles.featureText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Text>
              </View>
            ))}
          </View>
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
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => deleteWorkspace(item.id)}
          >
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
            <Text style={[styles.actionText, { color: '#EF4444' }]}>Delete</Text>
          </TouchableOpacity>
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
        refreshControl={{
          refreshing,
          onRefresh,
        }}
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
