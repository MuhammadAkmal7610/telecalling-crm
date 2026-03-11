import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '../../../src/components/common/Card';
import { colors, fonts } from '../../../src/theme/theme';
import { useAuth } from '../../../src/contexts/AuthContext';
import { ApiService } from '../../../src/services/ApiService';
import { Ionicons } from '@expo/vector-icons';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'communication' | 'productivity' | 'analytics' | 'storage' | 'crm' | 'marketing';
  icon: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  features: string[];
  pricing: 'free' | 'paid' | 'freemium';
  setupRequired: boolean;
  configuration?: Record<string, any>;
  lastSync?: string;
  usage?: {
    requestsThisMonth: number;
    limit: number;
  };
}

interface APITemplate {
  id: string;
  name: string;
  description: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  headers: Record<string, string>;
  parameters: {
    name: string;
    type: 'string' | 'number' | 'boolean';
    required: boolean;
    description: string;
  }[];
  response: {
    successCode: number;
    sampleData: any;
  };
  category: string;
  usage: number;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
}

export default function IntegrationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [apiTemplates, setApiTemplates] = useState<APITemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'integrations' | 'api' | 'webhooks'>('integrations');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const tabs = [
    { key: 'integrations', label: 'Integrations', icon: 'link-outline' },
    { key: 'api', label: 'API Templates', icon: 'code-outline' },
    { key: 'webhooks', label: 'Webhooks', icon: 'sync-outline' }
  ];

  const categories = [
    { value: 'all', label: 'All', icon: 'grid-outline' },
    { value: 'communication', label: 'Communication', icon: 'mail-outline' },
    { value: 'productivity', label: 'Productivity', icon: 'calendar-outline' },
    { value: 'analytics', label: 'Analytics', icon: 'bar-chart-outline' },
    { value: 'storage', label: 'Storage', icon: 'folder-outline' },
    { value: 'crm', label: 'CRM', icon: 'people-outline' },
    { value: 'marketing', label: 'Marketing', icon: 'megaphone-outline' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadIntegrations(),
        loadAPITemplates()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadIntegrations = async () => {
    // Mock integrations data
    const mockIntegrations: Integration[] = [
      {
        id: '1',
        name: 'Slack',
        description: 'Get notifications and updates in your Slack channels',
        category: 'communication',
        icon: 'logo-slack',
        status: 'connected',
        features: ['Real-time notifications', 'Channel updates', 'Direct messages'],
        pricing: 'freemium',
        setupRequired: false,
        lastSync: new Date().toISOString(),
        usage: {
          requestsThisMonth: 234,
          limit: 1000
        }
      },
      {
        id: '2',
        name: 'Google Calendar',
        description: 'Sync meetings and schedules with Google Calendar',
        category: 'productivity',
        icon: 'calendar-outline',
        status: 'connected',
        features: ['Meeting sync', 'Event creation', 'Availability checking'],
        pricing: 'free',
        setupRequired: false,
        lastSync: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '3',
        name: 'Mailchimp',
        description: 'Email marketing and campaign management',
        category: 'marketing',
        icon: 'mail-outline',
        status: 'disconnected',
        features: ['Email campaigns', 'List management', 'Analytics'],
        pricing: 'freemium',
        setupRequired: true
      },
      {
        id: '4',
        name: 'Zapier',
        description: 'Connect with 3000+ apps for automation',
        category: 'productivity',
        icon: 'flash-outline',
        status: 'connected',
        features: ['Workflow automation', 'Multi-app connections', 'Custom triggers'],
        pricing: 'paid',
        setupRequired: false,
        usage: {
          requestsThisMonth: 567,
          limit: 5000
        }
      },
      {
        id: '5',
        name: 'Google Drive',
        description: 'Store and share files in Google Drive',
        category: 'storage',
        icon: 'folder-outline',
        status: 'error',
        features: ['File storage', 'Document sharing', 'Backup'],
        pricing: 'free',
        setupRequired: true
      },
      {
        id: '6',
        name: 'Salesforce',
        description: 'Sync data with Salesforce CRM',
        category: 'crm',
        icon: 'business-outline',
        status: 'disconnected',
        features: ['Lead sync', 'Contact management', 'Deal tracking'],
        pricing: 'paid',
        setupRequired: true
      },
      {
        id: '7',
        name: 'Google Analytics',
        description: 'Track website and app analytics',
        category: 'analytics',
        icon: 'bar-chart-outline',
        status: 'connected',
        features: ['Traffic analysis', 'Conversion tracking', 'Custom reports'],
        pricing: 'free',
        setupRequired: false,
        lastSync: new Date(Date.now() - 1800000).toISOString()
      }
    ];
    setIntegrations(mockIntegrations);
  };

  const loadAPITemplates = async () => {
    // Mock API templates data
    const mockAPITemplates: APITemplate[] = [
      {
        id: '1',
        name: 'Create Lead',
        description: 'Create a new lead in the CRM',
        method: 'POST',
        endpoint: '/api/v1/leads',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_API_KEY'
        },
        parameters: [
          {
            name: 'name',
            type: 'string',
            required: true,
            description: 'Lead full name'
          },
          {
            name: 'email',
            type: 'string',
            required: true,
            description: 'Lead email address'
          },
          {
            name: 'phone',
            type: 'string',
            required: false,
            description: 'Lead phone number'
          }
        ],
        response: {
          successCode: 201,
          sampleData: {
            id: 'lead_123',
            name: 'John Doe',
            email: 'john@example.com',
            created_at: '2024-01-01T00:00:00Z'
          }
        },
        category: 'Leads',
        usage: 145,
        isPublic: true,
        createdBy: 'system',
        createdAt: new Date(Date.now() - 2592000000).toISOString()
      },
      {
        id: '2',
        name: 'Update Lead Status',
        description: 'Update the status of an existing lead',
        method: 'PUT',
        endpoint: '/api/v1/leads/{id}',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_API_KEY'
        },
        parameters: [
          {
            name: 'status',
            type: 'string',
            required: true,
            description: 'New lead status'
          }
        ],
        response: {
          successCode: 200,
          sampleData: {
            id: 'lead_123',
            status: 'qualified',
            updated_at: '2024-01-01T00:00:00Z'
          }
        },
        category: 'Leads',
        usage: 89,
        isPublic: true,
        createdBy: 'system',
        createdAt: new Date(Date.now() - 5184000000).toISOString()
      },
      {
        id: '3',
        name: 'Get Activities',
        description: 'Retrieve activities for a specific lead or user',
        method: 'GET',
        endpoint: '/api/v1/activities',
        headers: {
          'Authorization': 'Bearer YOUR_API_KEY'
        },
        parameters: [
          {
            name: 'lead_id',
            type: 'string',
            required: false,
            description: 'Filter by lead ID'
          },
          {
            name: 'limit',
            type: 'number',
            required: false,
            description: 'Number of results to return'
          }
        ],
        response: {
          successCode: 200,
          sampleData: {
            activities: [
              {
                id: 'act_123',
                type: 'call',
                description: 'Initial call with prospect',
                created_at: '2024-01-01T00:00:00Z'
              }
            ]
          }
        },
        category: 'Activities',
        usage: 234,
        isPublic: true,
        createdBy: 'system',
        createdAt: new Date(Date.now() - 7776000000).toISOString()
      }
    ];
    setApiTemplates(mockAPITemplates);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const connectIntegration = async (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (integration?.setupRequired) {
      router.push(`/enterprise/integrations/${integrationId}/setup` as any);
    } else {
      try {
        setIntegrations(prev => prev.map(i => 
          i.id === integrationId ? { ...i, status: 'connected' as const } : i
        ));
        Alert.alert('Success', `${integration.name} connected successfully`);
      } catch (error) {
        console.error('Error connecting integration:', error);
        Alert.alert('Error', 'Failed to connect integration');
      }
    }
  };

  const disconnectIntegration = async (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    Alert.alert(
      'Disconnect Integration',
      `Are you sure you want to disconnect ${integration?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              setIntegrations(prev => prev.map(i => 
                i.id === integrationId ? { ...i, status: 'disconnected' as const } : i
              ));
              Alert.alert('Success', `${integration?.name} disconnected`);
            } catch (error) {
              console.error('Error disconnecting integration:', error);
              Alert.alert('Error', 'Failed to disconnect integration');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return '#10B981';
      case 'disconnected': return '#6B7280';
      case 'error': return '#EF4444';
      case 'pending': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getPricingColor = (pricing: string) => {
    switch (pricing) {
      case 'free': return '#10B981';
      case 'freemium': return '#3B82F6';
      case 'paid': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return '#10B981';
      case 'POST': return '#3B82F6';
      case 'PUT': return '#F59E0B';
      case 'DELETE': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const filteredIntegrations = selectedCategory === 'all' 
    ? integrations 
    : integrations.filter(i => i.category === selectedCategory);

  const renderIntegrationItem = ({ item }: { item: Integration }) => (
    <Card style={[styles.integrationCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
      <View style={styles.integrationHeader}>
        <View style={styles.integrationInfo}>
          <View style={styles.integrationIcon}>
            <Ionicons name={item.icon as any} size={24} color={colors.primary} />
          </View>
          <View style={styles.integrationDetails}>
            <Text style={[styles.integrationName, { color: isDark ? colors.surface : colors.onBackground }]}>
              {item.name}
            </Text>
            <Text style={[styles.integrationDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {item.description}
            </Text>
            <View style={styles.integrationMeta}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {item.status}
                </Text>
              </View>
              <View style={[styles.pricingBadge, { backgroundColor: getPricingColor(item.pricing) + '20' }]}>
                <Text style={[styles.pricingText, { color: getPricingColor(item.pricing) }]}>
                  {item.pricing}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.integrationFeatures}>
        <Text style={[styles.featuresTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Features:
        </Text>
        <View style={styles.featuresList}>
          {item.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={12} color="#10B981" />
              <Text style={[styles.featureText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                {feature}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {item.usage && (
        <View style={styles.usageSection}>
          <View style={styles.usageHeader}>
            <Text style={[styles.usageLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              API Usage
            </Text>
            <Text style={[styles.usageText, { color: isDark ? colors.surface : colors.onBackground }]}>
              {item.usage.requestsThisMonth}/{item.usage.limit}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressBackground, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]}>
              <View 
                style={[styles.progressFill, { 
                  width: `${(item.usage.requestsThisMonth / item.usage.limit) * 100}%`, 
                  backgroundColor: colors.primary 
                }]} 
              />
            </View>
          </View>
        </View>
      )}

      {item.lastSync && (
        <Text style={[styles.lastSync, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
          Last sync: {new Date(item.lastSync).toLocaleString()}
        </Text>
      )}

      <View style={styles.integrationActions}>
        {item.status === 'connected' ? (
          <>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push(`/enterprise/integrations/${item.id}/configure` as any)}
            >
              <Ionicons name="cog-outline" size={16} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.primary }]}>Configure</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => disconnectIntegration(item.id)}
            >
              <Ionicons name="link-outline" size={16} color="#EF4444" />
              <Text style={[styles.actionText, { color: '#EF4444' }]}>Disconnect</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.connectButton}
            onPress={() => connectIntegration(item.id)}
          >
            <Ionicons name="link-outline" size={16} color="#FFFFFF" />
            <Text style={styles.connectText}>Connect</Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );

  const renderAPITemplateItem = ({ item }: { item: APITemplate }) => (
    <Card style={[styles.apiCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
      <View style={styles.apiHeader}>
        <View style={styles.apiMethod}>
          <Text style={[styles.methodText, { color: getMethodColor(item.method) }]}>
            {item.method}
          </Text>
        </View>
        <View style={styles.apiInfo}>
          <Text style={[styles.apiName, { color: isDark ? colors.surface : colors.onBackground }]}>
            {item.name}
          </Text>
          <Text style={[styles.apiDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {item.description}
          </Text>
          <Text style={[styles.apiEndpoint, { color: colors.primary }]}>
            {item.endpoint}
          </Text>
        </View>
      </View>

      <View style={styles.apiStats}>
        <Text style={[styles.apiCategory, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          Category: {item.category}
        </Text>
        <Text style={[styles.apiUsage, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          Used {item.usage} times
        </Text>
      </View>

      <View style={styles.apiParameters}>
        <Text style={[styles.parametersTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Parameters:
        </Text>
        {item.parameters.slice(0, 2).map((param, index) => (
          <View key={index} style={styles.parameterItem}>
            <Text style={[styles.parameterName, { color: isDark ? colors.surface : colors.onBackground }]}>
              {param.name}
            </Text>
            <Text style={[styles.parameterType, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {param.type}
            </Text>
            {param.required && (
              <Text style={[styles.requiredText, { color: '#EF4444' }]}>*</Text>
            )}
          </View>
        ))}
        {item.parameters.length > 2 && (
          <Text style={[styles.moreParameters, { color: colors.primary }]}>
            +{item.parameters.length - 2} more parameters
          </Text>
        )}
      </View>

      <View style={styles.apiActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/enterprise/api/${item.id}/docs` as any)}
        >
          <Ionicons name="document-text-outline" size={16} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>Docs</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/enterprise/api/${item.id}/test` as any)}
        >
          <Ionicons name="play-circle-outline" size={16} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>Test</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderWebhooksTab = () => (
    <View style={styles.tabContent}>
      <Card style={styles.webhooksCard}>
        <Text style={[styles.webhooksTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Webhook Management
        </Text>
        <Text style={[styles.webhooksDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          Configure webhooks to receive real-time notifications when events occur in your CRM
        </Text>
        <View style={styles.webhooksPlaceholder}>
          <Ionicons name="sync-outline" size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
          <Text style={[styles.placeholderText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Webhook configuration coming soon
          </Text>
        </View>
      </Card>
    </View>
  );

  const renderIntegrationsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.categoryFilter}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.value}
              style={[
                styles.categoryChip,
                selectedCategory === category.value && styles.selectedCategoryChip,
                { borderColor: isDark ? '#374151' : '#E5E7EB' }
              ]}
              onPress={() => setSelectedCategory(category.value)}
            >
              <Ionicons 
                name={category.icon as any} 
                size={14} 
                color={selectedCategory === category.value ? colors.primary : (isDark ? '#6B7280' : '#9CA3AF')} 
              />
              <Text style={[
                styles.categoryChipText,
                selectedCategory === category.value && styles.selectedCategoryChipText
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Available Integrations ({filteredIntegrations.length})
        </Text>
        <Button
          title="Browse All"
          onPress={() => router.push('/enterprise/integrations/marketplace' as any)}
          style={styles.browseButton}
        />
      </View>

      <FlatList
        data={filteredIntegrations}
        renderItem={renderIntegrationItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={{
          refreshing,
          onRefresh,
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="link-outline" size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
            <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              No integrations found
            </Text>
          </View>
        }
      />
    </View>
  );

  const renderAPITab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          API Templates ({apiTemplates.length})
        </Text>
        <Button
          title="Create Template"
          onPress={() => router.push('/enterprise/api/create' as any)}
          style={styles.createButton}
        />
      </View>

      <FlatList
        data={apiTemplates}
        renderItem={renderAPITemplateItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="code-outline" size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
            <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              No API templates found
            </Text>
          </View>
        }
      />
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'integrations':
        return renderIntegrationsTab();
      case 'api':
        return renderAPITab();
      case 'webhooks':
        return renderWebhooksTab();
      default:
        return renderIntegrationsTab();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          Integrations
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.docsButton}
            onPress={() => router.push('/enterprise/integrations/docs' as any)}
          >
            <Ionicons name="document-text-outline" size={20} color={colors.primary} />
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
  docsButton: {
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
  categoryFilter: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    gap: 4,
  },
  selectedCategoryChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    color: '#6B7280',
  },
  selectedCategoryChipText: {
    color: '#FFFFFF',
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
  browseButton: {
    paddingHorizontal: 16,
  },
  createButton: {
    paddingHorizontal: 16,
  },
  integrationCard: {
    margin: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  integrationHeader: {
    marginBottom: 16,
  },
  integrationInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  integrationIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  integrationDetails: {
    flex: 1,
  },
  integrationName: {
    fontSize: 16,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 4,
  },
  integrationDescription: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    marginBottom: 8,
  },
  integrationMeta: {
    flexDirection: 'row',
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
  pricingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  pricingText: {
    fontSize: 10,
    fontFamily: fonts.satoshi.bold,
    textTransform: 'uppercase',
  },
  integrationFeatures: {
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 8,
  },
  featuresList: {
    gap: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  usageSection: {
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
    height: 6,
    borderRadius: 3,
  },
  progressBackground: {
    flex: 1,
    height: '100%',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  lastSync: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
    marginBottom: 12,
  },
  integrationActions: {
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
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.primary,
    gap: 6,
  },
  connectText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    color: '#FFFFFF',
  },
  apiCard: {
    margin: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  apiHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  apiMethod: {
    width: 60,
    alignItems: 'center',
    marginRight: 12,
  },
  methodText: {
    fontSize: 12,
    fontFamily: fonts.nohemi.bold,
  },
  apiInfo: {
    flex: 1,
  },
  apiName: {
    fontSize: 16,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 4,
  },
  apiDescription: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    marginBottom: 4,
  },
  apiEndpoint: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
  },
  apiStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  apiCategory: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  apiUsage: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  apiParameters: {
    marginBottom: 12,
  },
  parametersTitle: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 8,
  },
  parameterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  parameterName: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
  },
  parameterType: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  requiredText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.bold,
  },
  moreParameters: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
  },
  apiActions: {
    flexDirection: 'row',
    gap: 12,
  },
  webhooksCard: {
    margin: 20,
    padding: 20,
    alignItems: 'center',
  },
  webhooksTitle: {
    fontSize: 18,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 8,
  },
  webhooksDescription: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    textAlign: 'center',
    marginBottom: 20,
  },
  webhooksPlaceholder: {
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    fontFamily: fonts.satoshi.medium,
    marginTop: 12,
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
