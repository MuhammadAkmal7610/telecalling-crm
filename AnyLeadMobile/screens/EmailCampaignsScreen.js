import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Switch,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import {
  Mail,
  Send,
  Template,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  Eye,
  Search,
  Calendar,
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Save,
  Settings,
  Zap,
  Target,
  MessageSquare,
  FileText,
  ChevronRight,
  Filter,
  MoreVertical,
} from 'lucide-react-native';
import { useApi } from '../hooks/useApi';
import { useWorkspace } from '../context/WorkspaceContext';

const { width, height } = Dimensions.get('window');

const API_URL = 'http://localhost:3000/api/v1';

export default function EmailCampaignsScreen({ navigation }) {
  const { apiFetch } = useApi();
  const { currentWorkspace } = useWorkspace();
  
  const [activeTab, setActiveTab] = useState('campaigns');
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [automations, setAutomations] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal states
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const tabs = [
    { id: 'campaigns', label: 'Campaigns', icon: Send },
    { id: 'templates', label: 'Templates', icon: Template },
    { id: 'automation', label: 'Automation', icon: Zap },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  useEffect(() => {
    fetchEmailData();
  }, [activeTab, currentWorkspace]);

  const fetchEmailData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'campaigns') {
        await fetchCampaigns();
      } else if (activeTab === 'templates') {
        await fetchTemplates();
      } else if (activeTab === 'automation') {
        await fetchAutomations();
      } else if (activeTab === 'analytics') {
        await fetchAnalytics();
      }
    } catch (error) {
      console.error('Error fetching email data:', error);
      Alert.alert('Error', 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEmailData();
    setRefreshing(false);
  };

  const fetchCampaigns = async () => {
    const res = await apiFetch('/email/campaigns' + (statusFilter ? `?status=${statusFilter}` : ''));
    const data = await res.json();
    setCampaigns(data);
  };

  const fetchTemplates = async () => {
    const res = await apiFetch('/email/templates');
    const data = await res.json();
    setTemplates(data);
  };

  const fetchAutomations = async () => {
    const res = await apiFetch('/email/automation');
    const data = await res.json();
    setAutomations(data);
  };

  const fetchAnalytics = async () => {
    const res = await apiFetch('/email/analytics');
    const data = await res.json();
    setAnalytics(data);
  };

  const CampaignModal = () => {
    const [campaignData, setCampaignData] = useState({
      name: '',
      description: '',
      template_id: '',
      schedule_type: 'immediate',
      scheduled_at: '',
      sender_email: '',
      sender_name: '',
      reply_to_email: '',
      track_opens: true,
      track_clicks: true,
    });

    const handleSubmit = async () => {
      if (!campaignData.name || !campaignData.sender_email || !campaignData.sender_name) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      try {
        const res = await apiFetch('/email/campaigns', {
          method: 'POST',
          body: JSON.stringify(campaignData),
        });
        
        if (res.ok) {
          setShowCampaignModal(false);
          fetchCampaigns();
          Alert.alert('Success', 'Campaign created successfully!');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to create campaign');
      }
    };

    return (
      <Modal
        visible={showCampaignModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedCampaign ? 'Edit Campaign' : 'Create Campaign'}
            </Text>
            <TouchableOpacity onPress={() => setShowCampaignModal(false)}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Campaign Name *</Text>
              <TextInput
                style={styles.input}
                value={campaignData.name}
                onChangeText={(text) => setCampaignData({...campaignData, name: text})}
                placeholder="Enter campaign name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={campaignData.description}
                onChangeText={(text) => setCampaignData({...campaignData, description: text})}
                placeholder="Describe your campaign"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Template</Text>
              <View style={styles.pickerContainer}>
                <Text style={campaignData.template_id ? styles.pickerText : styles.pickerPlaceholder}>
                  {campaignData.template_id 
                    ? templates.find(t => t.id === campaignData.template_id)?.name || 'Select template'
                    : 'Select template'
                  }
                </Text>
                <ChevronRight size={20} color="#666" />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Schedule</Text>
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerText}>
                  {campaignData.schedule_type === 'immediate' ? 'Send Immediately' : 
                   campaignData.schedule_type === 'scheduled' ? 'Schedule Later' : 'Recurring'}
                </Text>
                <ChevronRight size={20} color="#666" />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Sender Email *</Text>
              <TextInput
                style={styles.input}
                value={campaignData.sender_email}
                onChangeText={(text) => setCampaignData({...campaignData, sender_email: text})}
                placeholder="sender@company.com"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Sender Name *</Text>
              <TextInput
                style={styles.input}
                value={campaignData.sender_name}
                onChangeText={(text) => setCampaignData({...campaignData, sender_name: text})}
                placeholder="Company Name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Reply-to Email</Text>
              <TextInput
                style={styles.input}
                value={campaignData.reply_to_email}
                onChangeText={(text) => setCampaignData({...campaignData, reply_to_email: text})}
                placeholder="replies@company.com"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.switchGroup}>
              <View style={styles.switchItem}>
                <Text style={styles.switchLabel}>Track opens</Text>
                <Switch
                  value={campaignData.track_opens}
                  onValueChange={(value) => setCampaignData({...campaignData, track_opens: value})}
                  trackColor={{ false: '#E5E7EB', true: '#08A698' }}
                  thumbColor={Platform.OS === 'ios' ? '#fff' : campaignData.track_opens ? '#08A698' : '#9CA3AF'}
                />
              </View>
              <View style={styles.switchItem}>
                <Text style={styles.switchLabel}>Track clicks</Text>
                <Switch
                  value={campaignData.track_clicks}
                  onValueChange={(value) => setCampaignData({...campaignData, track_clicks: value})}
                  trackColor={{ false: '#E5E7EB', true: '#08A698' }}
                  thumbColor={Platform.OS === 'ios' ? '#fff' : campaignData.track_clicks ? '#08A698' : '#9CA3AF'}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => setShowCampaignModal(false)}
              >
                <Text style={styles.buttonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={handleSubmit}
              >
                <Text style={styles.buttonPrimaryText}>
                  {selectedCampaign ? 'Update Campaign' : 'Create Campaign'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    );
  };

  const TemplateModal = () => {
    const [templateData, setTemplateData] = useState({
      name: '',
      subject: '',
      content: '',
      html_content: '',
      category: 'marketing',
      status: 'draft',
    });

    const handleSubmit = async () => {
      if (!templateData.name || !templateData.subject || !templateData.content) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      try {
        const res = await apiFetch('/email/templates', {
          method: 'POST',
          body: JSON.stringify(templateData),
        });
        
        if (res.ok) {
          setShowTemplateModal(false);
          fetchTemplates();
          Alert.alert('Success', 'Template created successfully!');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to create template');
      }
    };

    return (
      <Modal
        visible={showTemplateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedTemplate ? 'Edit Template' : 'Create Template'}
            </Text>
            <TouchableOpacity onPress={() => setShowTemplateModal(false)}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Template Name *</Text>
              <TextInput
                style={styles.input}
                value={templateData.name}
                onChangeText={(text) => setTemplateData({...templateData, name: text})}
                placeholder="Welcome Email"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerText}>
                  {templateData.category.charAt(0).toUpperCase() + templateData.category.slice(1)}
                </Text>
                <ChevronRight size={20} color="#666" />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Subject *</Text>
              <TextInput
                style={styles.input}
                value={templateData.subject}
                onChangeText={(text) => setTemplateData({...templateData, subject: text})}
                placeholder="Welcome to our platform!"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Text Content *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={templateData.content}
                onChangeText={(text) => setTemplateData({...templateData, content: text})}
                placeholder="Dear {{name}},\n\nWelcome to our platform!\n\nBest regards,\nThe Team"
                placeholderTextColor="#999"
                multiline
                numberOfLines={8}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.infoBox}>
              <FileText size={20} color="#08A698" />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Variables</Text>
                <Text style={styles.infoText}>
                  Use variables like {'{{'}name{'}'}, {'{{'}email{'}'}, {'{{'}company{'}'}} in your subject and content. 
                  These will be replaced with actual data when sending emails.
                </Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => setShowTemplateModal(false)}
              >
                <Text style={styles.buttonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={handleSubmit}
              >
                <Text style={styles.buttonPrimaryText}>
                  {selectedTemplate ? 'Update Template' : 'Create Template'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    );
  };

  const renderCampaignItem = ({ item }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'draft': return '#6B7280';
        case 'scheduled': return '#3B82F6';
        case 'running': return '#F59E0B';
        case 'completed': return '#10B981';
        case 'paused': return '#F97316';
        case 'cancelled': return '#EF4444';
        default: return '#6B7280';
      }
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case 'draft': return <FileText size={16} color={getStatusColor(status)} />;
        case 'scheduled': return <Calendar size={16} color={getStatusColor(status)} />;
        case 'running': return <Clock size={16} color={getStatusColor(status)} />;
        case 'completed': return <CheckCircle size={16} color={getStatusColor(status)} />;
        case 'paused': return <Pause size={16} color={getStatusColor(status)} />;
        case 'cancelled': return <X size={16} color={getStatusColor(status)} />;
        default: return <FileText size={16} color={getStatusColor(status)} />;
      }
    };

    return (
      <TouchableOpacity style={styles.campaignItem}>
        <View style={styles.campaignHeader}>
          <View style={styles.campaignTitle}>
            <Text style={styles.campaignName}>{item.name}</Text>
            {item.description && (
              <Text style={styles.campaignDescription}>{item.description}</Text>
            )}
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <MoreVertical size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.campaignStatus}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            {getStatusIcon(item.status)}
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.campaignStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.sent_count || 0} / {item.total_recipients || 0}</Text>
            <Text style={styles.statLabel}>sent / total</Text>
          </View>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <CheckCircle size={16} color="#10B981" />
              <Text style={styles.statValue}>{item.delivered_count || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Eye size={16} color="#3B82F6" />
              <Text style={styles.statValue}>{item.opened_count || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Target size={16} color="#8B5CF6" />
              <Text style={styles.statValue}>{item.clicked_count || 0}</Text>
            </View>
          </View>
        </View>

        <View style={styles.campaignActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              setSelectedCampaign(item);
              setShowAnalyticsModal(true);
            }}
          >
            <BarChart3 size={18} color="#666" />
            <Text style={styles.actionText}>Analytics</Text>
          </TouchableOpacity>
          {(item.status === 'draft' || item.status === 'paused') && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                // Execute campaign
                apiFetch(`/email/campaigns/${item.id}/execute`, { method: 'POST' })
                  .then(() => fetchCampaigns())
                  .catch(() => Alert.alert('Error', 'Failed to execute campaign'));
              }}
            >
              <Play size={18} color="#08A698" />
              <Text style={styles.actionText}>Execute</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderTemplateItem = ({ item }) => (
    <TouchableOpacity style={styles.templateItem}>
      <View style={styles.templateHeader}>
        <View style={styles.templateTitle}>
          <Text style={styles.templateName}>{item.name}</Text>
          <Text style={styles.templateSubject}>{item.subject}</Text>
        </View>
        <View style={[styles.statusBadge, { 
          backgroundColor: item.status === 'active' ? '#10B98120' : '#6B728020' 
        }]}>
          <Text style={[styles.statusText, { 
            color: item.status === 'active' ? '#10B981' : '#6B7280' 
          }]}>
            {item.status}
          </Text>
        </View>
      </View>
      
      <Text style={styles.templateContent} numberOfLines={2}>
        {item.content || 'No content'}
      </Text>

      <View style={styles.templateFooter}>
        <Text style={styles.templateCategory}>{item.category}</Text>
        <View style={styles.templateActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Edit size={18} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Trash2 size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderAnalytics = () => {
    if (!analytics) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#08A698" />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.analyticsContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={styles.metricIcon}>
              <Mail size={24} color="#3B82F6" />
            </View>
            <Text style={styles.metricValue}>{analytics.totalEmails}</Text>
            <Text style={styles.metricLabel}>Total Emails</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricIcon}>
              <CheckCircle size={24} color="#10B981" />
            </View>
            <Text style={styles.metricValue}>{analytics.deliveryRate.toFixed(1)}%</Text>
            <Text style={styles.metricLabel}>Delivery Rate</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricIcon}>
              <Eye size={24} color="#8B5CF6" />
            </View>
            <Text style={styles.metricValue}>{analytics.openRate.toFixed(1)}%</Text>
            <Text style={styles.metricLabel}>Open Rate</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricIcon}>
              <Target size={24} color="#F59E0B" />
            </View>
            <Text style={styles.metricValue}>{analytics.clickRate.toFixed(1)}%</Text>
            <Text style={styles.metricLabel}>Click Rate</Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Performance Overview</Text>
          <View style={styles.chartPlaceholder}>
            <BarChart3 size={32} color="#666" />
            <Text style={styles.chartPlaceholderText}>Performance charts will be displayed here</Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Email Marketing</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => {
            if (activeTab === 'campaigns') {
              setShowCampaignModal(true);
            } else if (activeTab === 'templates') {
              setShowTemplateModal(true);
            }
          }}
        >
          <Plus size={20} color="#fff" />
          <Text style={styles.createButtonText}>
            {activeTab === 'campaigns' ? 'Campaign' : activeTab === 'templates' ? 'Template' : 'Create'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && styles.activeTab
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Icon 
                size={18} 
                color={activeTab === tab.id ? '#08A698' : '#666'} 
              />
              <Text style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor="#999"
          />
        </View>
        {activeTab === 'campaigns' && (
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#08A698" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : (
          <>
            {activeTab === 'campaigns' && (
              <FlatList
                data={campaigns.filter(c => 
                  c.name.toLowerCase().includes(searchTerm.toLowerCase())
                )}
                renderItem={renderCampaignItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Mail size={48} color="#666" />
                    <Text style={styles.emptyTitle}>No campaigns found</Text>
                    <Text style={styles.emptyDescription}>Create your first email campaign to get started</Text>
                    <TouchableOpacity
                      style={styles.emptyButton}
                      onPress={() => setShowCampaignModal(true)}
                    >
                      <Text style={styles.emptyButtonText}>Create Campaign</Text>
                    </TouchableOpacity>
                  </View>
                }
              />
            )}

            {activeTab === 'templates' && (
              <FlatList
                data={templates.filter(t => 
                  t.name.toLowerCase().includes(searchTerm.toLowerCase())
                )}
                renderItem={renderTemplateItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Template size={48} color="#666" />
                    <Text style={styles.emptyTitle}>No templates found</Text>
                    <Text style={styles.emptyDescription}>Create your first email template to get started</Text>
                    <TouchableOpacity
                      style={styles.emptyButton}
                      onPress={() => setShowTemplateModal(true)}
                    >
                      <Text style={styles.emptyButtonText}>Create Template</Text>
                    </TouchableOpacity>
                  </View>
                }
              />
            )}

            {activeTab === 'automation' && (
              <View style={styles.emptyContainer}>
                <Zap size={48} color="#666" />
                <Text style={styles.emptyTitle}>Email Automation</Text>
                <Text style={styles.emptyDescription}>Create powerful automation workflows for your email campaigns</Text>
                <TouchableOpacity style={styles.emptyButton}>
                  <Text style={styles.emptyButtonText}>Create Automation</Text>
                </TouchableOpacity>
              </View>
            )}

            {activeTab === 'analytics' && renderAnalytics()}
          </>
        )}
      </ScrollView>

      {/* Modals */}
      <CampaignModal />
      <TemplateModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#08A698',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#08A698',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginLeft: 4,
  },
  activeTabText: {
    color: '#08A698',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#111827',
  },
  filterButton: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  campaignItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  campaignHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  campaignTitle: {
    flex: 1,
  },
  campaignName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  campaignDescription: {
    fontSize: 14,
    color: '#666',
  },
  moreButton: {
    padding: 4,
  },
  campaignStatus: {
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  campaignStats: {
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  campaignActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginLeft: 4,
  },
  templateItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  templateTitle: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  templateSubject: {
    fontSize: 14,
    color: '#666',
  },
  templateContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  templateFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  templateCategory: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  templateActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  analyticsContainer: {
    flex: 1,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    minWidth: (width - 52) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  chartPlaceholder: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  chartPlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  emptyButton: {
    backgroundColor: '#08A698',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal styles
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pickerText: {
    fontSize: 16,
    color: '#111827',
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  switchGroup: {
    marginBottom: 20,
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: '#111827',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#08A69810',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#08A698',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#08A698',
  },
  buttonSecondary: {
    backgroundColor: '#F3F4F6',
  },
  buttonPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondaryText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});
