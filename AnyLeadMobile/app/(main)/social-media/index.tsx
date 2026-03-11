import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '../../../src/components/common/Card';
import { colors, fonts } from '../../../src/theme/theme';
import { useAuth } from '../../../src/contexts/AuthContext';
import { ApiService } from '../../../src/services/ApiService';
import { Ionicons } from '@expo/vector-icons';

interface SocialLead {
  id: string;
  source: 'facebook' | 'whatsapp' | 'website' | 'instagram' | 'twitter' | 'linkedin';
  sourceId: string;
  name: string;
  email?: string;
  phone?: string;
  message: string;
  platformData: {
    profileUrl?: string;
    postId?: string;
    pageName?: string;
    campaignId?: string;
    formId?: string;
  };
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  assignedToName?: string;
  createdAt: string;
  lastActivity?: string;
  tags: string[];
}

interface SocialAccount {
  id: string;
  platform: 'facebook' | 'whatsapp' | 'instagram' | 'twitter' | 'linkedin';
  name: string;
  accountId: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  permissions: string[];
  lastSync?: string;
  stats: {
    leadsGenerated: number;
    postsPublished: number;
    engagementRate: number;
    followers: number;
  };
  settings: {
    autoImport: boolean;
    autoRespond: boolean;
    defaultAssignee?: string;
    tags: string[];
  };
}

interface SocialPost {
  id: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  content: {
    text: string;
    images?: string[];
    videos?: string[];
    links?: string[];
  };
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduledFor?: string;
  publishedAt?: string;
  stats?: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  createdAt: string;
  createdBy: string;
}

export default function SocialMediaScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark');
  
  const [leads, setLeads] = useState<SocialLead[]>([]);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'leads' | 'accounts' | 'posts'>('leads');
  const [selectedSource, setSelectedSource] = useState<string>('all');

  const tabs = [
    { key: 'leads', label: 'Leads', icon: 'person-add-outline' },
    { key: 'accounts', label: 'Accounts', icon: 'link-outline' },
    { key: 'posts', label: 'Posts', icon: 'create-outline' }
  ];

  const sources = [
    { value: 'all', label: 'All Sources', icon: 'grid-outline' },
    { value: 'facebook', label: 'Facebook', icon: 'logo-facebook' },
    { value: 'whatsapp', label: 'WhatsApp', icon: 'logo-whatsapp' },
    { value: 'website', label: 'Website', icon: 'globe-outline' },
    { value: 'instagram', label: 'Instagram', icon: 'logo-instagram' },
    { value: 'twitter', label: 'Twitter', icon: 'logo-twitter' },
    { value: 'linkedin', label: 'LinkedIn', icon: 'logo-linkedin' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadLeads(),
        loadAccounts(),
        loadPosts()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadLeads = async () => {
    // Mock social media leads
    const mockLeads: SocialLead[] = [
      {
        id: '1',
        source: 'facebook',
        sourceId: 'fb_lead_123',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        phone: '+1234567890',
        message: 'Hi, I\'m interested in your CRM solution for my small business. Can you provide more information?',
        platformData: {
          profileUrl: 'https://facebook.com/sarah.johnson',
          postId: 'post_456',
          pageName: 'Tech Solutions',
          campaignId: 'campaign_789'
        },
        status: 'new',
        priority: 'high',
        assignedTo: user?.id,
        assignedToName: user?.name,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        tags: ['facebook', 'crm', 'small-business']
      },
      {
        id: '2',
        source: 'whatsapp',
        sourceId: 'wa_lead_456',
        name: 'Michael Chen',
        phone: '+1234567891',
        message: 'Hello! I saw your ad on Instagram and would like to know about pricing for enterprise plans.',
        platformData: {
          profileUrl: 'https://wa.me/1234567891',
          campaignId: 'instagram_ad_1'
        },
        status: 'contacted',
        priority: 'medium',
        assignedTo: user?.id,
        assignedToName: user?.name,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        lastActivity: new Date(Date.now() - 1800000).toISOString(),
        tags: ['whatsapp', 'pricing', 'enterprise']
      },
      {
        id: '3',
        source: 'website',
        sourceId: 'web_lead_789',
        name: 'Emily Davis',
        email: 'emily@example.com',
        phone: '+1234567892',
        message: 'I filled out the contact form on your website. Looking for a demo of your sales automation features.',
        platformData: {
          formId: 'contact_form_1',
          pageName: 'Homepage'
        },
        status: 'qualified',
        priority: 'high',
        createdAt: new Date(Date.now() - 10800000).toISOString(),
        lastActivity: new Date(Date.now() - 3600000).toISOString(),
        tags: ['website', 'demo', 'automation']
      },
      {
        id: '4',
        source: 'instagram',
        sourceId: 'ig_lead_012',
        name: 'David Wilson',
        email: 'david@example.com',
        message: 'Interested in your lead management system. How does it compare to other CRMs?',
        platformData: {
          profileUrl: 'https://instagram.com/david.wilson',
          postId: 'ig_post_345',
          campaignId: 'ig_campaign_2'
        },
        status: 'new',
        priority: 'medium',
        createdAt: new Date(Date.now() - 14400000).toISOString(),
        tags: ['instagram', 'lead-management', 'comparison']
      }
    ];
    setLeads(mockLeads);
  };

  const loadAccounts = async () => {
    // Mock social media accounts
    const mockAccounts: SocialAccount[] = [
      {
        id: '1',
        platform: 'facebook',
        name: 'Tech Solutions Official',
        accountId: 'fb_page_123',
        status: 'connected',
        permissions: ['pages_read_engagement', 'pages_manage_posts', 'leads_retrieval'],
        lastSync: new Date(Date.now() - 1800000).toISOString(),
        stats: {
          leadsGenerated: 45,
          postsPublished: 23,
          engagementRate: 3.2,
          followers: 5432
        },
        settings: {
          autoImport: true,
          autoRespond: false,
          defaultAssignee: user?.id,
          tags: ['facebook', 'official']
        }
      },
      {
        id: '2',
        platform: 'whatsapp',
        name: 'Business WhatsApp',
        accountId: 'wa_business_456',
        status: 'connected',
        permissions: ['messages', 'contacts'],
        lastSync: new Date(Date.now() - 900000).toISOString(),
        stats: {
          leadsGenerated: 23,
          postsPublished: 0,
          engagementRate: 85.6,
          followers: 156
        },
        settings: {
          autoImport: true,
          autoRespond: true,
          defaultAssignee: user?.id,
          tags: ['whatsapp', 'business']
        }
      },
      {
        id: '3',
        platform: 'instagram',
        name: '@techsolutions',
        accountId: 'ig_business_789',
        status: 'error',
        permissions: ['basic', 'content_publish'],
        lastSync: new Date(Date.now() - 86400000).toISOString(),
        stats: {
          leadsGenerated: 12,
          postsPublished: 18,
          engagementRate: 4.1,
          followers: 2341
        },
        settings: {
          autoImport: false,
          autoRespond: false,
          tags: ['instagram', 'business']
        }
      }
    ];
    setAccounts(mockAccounts);
  };

  const loadPosts = async () => {
    // Mock social media posts
    const mockPosts: SocialPost[] = [
      {
        id: '1',
        platform: 'facebook',
        content: {
          text: '🚀 Transform your sales process with our AI-powered CRM! Schedule a free demo today and see how we can help you close more deals. #CRM #SalesAutomation #BusinessGrowth',
          images: ['https://example.com/crm-post-1.jpg'],
          links: ['https://yourcrm.com/demo']
        },
        status: 'published',
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        stats: {
          likes: 45,
          comments: 12,
          shares: 8,
          views: 1250
        },
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        createdBy: user?.id || '1'
      },
      {
        id: '2',
        platform: 'instagram',
        content: {
          text: 'Did you know? Businesses using our CRM see an average 40% increase in sales productivity. 📈',
          images: ['https://example.com/stats-graph.jpg']
        },
        status: 'scheduled',
        scheduledFor: new Date(Date.now() + 86400000).toISOString(),
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        createdBy: user?.id || '1'
      },
      {
        id: '3',
        platform: 'twitter',
        content: {
          text: 'New feature alert! 🎉 Advanced workflow automation is now live. Automate your lead follow-ups and never miss an opportunity again. #CRM #Automation',
          links: ['https://yourcrm.com/features']
        },
        status: 'published',
        publishedAt: new Date(Date.now() - 10800000).toISOString(),
        stats: {
          likes: 23,
          comments: 5,
          shares: 12,
          views: 890
        },
        createdAt: new Date(Date.now() - 14400000).toISOString(),
        createdBy: user?.id || '1'
      }
    ];
    setPosts(mockPosts);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const updateLeadStatus = async (leadId: string, status: SocialLead['status']) => {
    try {
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, status, lastActivity: new Date().toISOString() } : lead
      ));
      Alert.alert('Success', 'Lead status updated');
    } catch (error) {
      console.error('Error updating lead status:', error);
      Alert.alert('Error', 'Failed to update lead status');
    }
  };

  const syncAccount = async (accountId: string) => {
    try {
      Alert.alert('Syncing', 'Syncing account data...');
      // Simulate sync
      setTimeout(() => {
        setAccounts(prev => prev.map(account => 
          account.id === accountId ? { ...account, lastSync: new Date().toISOString() } : account
        ));
        Alert.alert('Success', 'Account synced successfully');
      }, 2000);
    } catch (error) {
      console.error('Error syncing account:', error);
      Alert.alert('Error', 'Failed to sync account');
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'facebook': return 'logo-facebook';
      case 'whatsapp': return 'logo-whatsapp';
      case 'instagram': return 'logo-instagram';
      case 'twitter': return 'logo-twitter';
      case 'linkedin': return 'logo-linkedin';
      case 'website': return 'globe-outline';
      default: return 'person-outline';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'facebook': return '#1877F2';
      case 'whatsapp': return '#25D366';
      case 'instagram': return '#E4405F';
      case 'twitter': return '#1DA1F2';
      case 'linkedin': return '#0077B5';
      case 'website': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return '#3B82F6';
      case 'contacted': return '#F59E0B';
      case 'qualified': return '#8B5CF6';
      case 'converted': return '#10B981';
      case 'lost': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#DC2626';
      case 'high': return '#F59E0B';
      case 'medium': return '#3B82F6';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return 'logo-facebook';
      case 'whatsapp': return 'logo-whatsapp';
      case 'instagram': return 'logo-instagram';
      case 'twitter': return 'logo-twitter';
      case 'linkedin': return 'logo-linkedin';
      default: return 'business-outline';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'connected': return '#10B981';
      case 'disconnected': return '#6B7280';
      case 'error': return '#EF4444';
      case 'pending': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const filteredLeads = selectedSource === 'all' 
    ? leads 
    : leads.filter(lead => lead.source === selectedSource);

  const renderLeadItem = ({ item }: { item: SocialLead }) => (
    <Card style={[styles.leadCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
      <View style={styles.leadHeader}>
        <View style={styles.leadInfo}>
          <View style={styles.sourceContainer}>
            <Ionicons 
              name={getSourceIcon(item.source) as any} 
              size={20} 
              color={getSourceColor(item.source)} 
            />
            <Text style={[styles.sourceText, { color: getSourceColor(item.source) }]}>
              {item.source.charAt(0).toUpperCase() + item.source.slice(1)}
            </Text>
          </View>
          <Text style={[styles.leadName, { color: isDark ? colors.surface : colors.onBackground }]}>
            {item.name}
          </Text>
          {item.email && (
            <Text style={[styles.leadEmail, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {item.email}
            </Text>
          )}
          {item.phone && (
            <Text style={[styles.leadPhone, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {item.phone}
            </Text>
          )}
        </View>
        <View style={styles.leadMeta}>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
            <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
              {item.priority.toUpperCase()}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.messageContainer}>
        <Text style={[styles.messageText, { color: isDark ? colors.surface : colors.onBackground }]}>
          {item.message}
        </Text>
      </View>

      {item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <View key={index} style={[styles.tag, { backgroundColor: colors.primary + '10' }]}>
              <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.leadFooter}>
        <Text style={[styles.leadDate, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <View style={styles.leadActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/social-media/leads/${item.id}` as any)}
          >
            <Ionicons name="eye-outline" size={16} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => updateLeadStatus(item.id, 'contacted')}
          >
            <Ionicons name="checkmark-circle-outline" size={16} color="#10B981" />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  const renderAccountItem = ({ item }: { item: SocialAccount }) => (
    <Card style={[styles.accountCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
      <View style={styles.accountHeader}>
        <View style={styles.accountInfo}>
          <View style={styles.platformContainer}>
            <Ionicons 
              name={getPlatformIcon(item.platform) as any} 
              size={24} 
              color={getSourceColor(item.platform)} 
            />
            <Text style={[styles.accountName, { color: isDark ? colors.surface : colors.onBackground }]}>
              {item.name}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusBadgeColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusBadgeColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.syncButton}
          onPress={() => syncAccount(item.id)}
        >
          <Ionicons name="sync-outline" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.accountStats}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: isDark ? colors.surface : colors.onBackground }]}>
            {item.stats.leadsGenerated}
          </Text>
          <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Leads
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: isDark ? colors.surface : colors.onBackground }]}>
            {item.stats.postsPublished}
          </Text>
          <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Posts
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: isDark ? colors.surface : colors.onBackground }]}>
            {item.stats.engagementRate}%
          </Text>
          <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Engagement
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: isDark ? colors.surface : colors.onBackground }]}>
            {item.stats.followers}
          </Text>
          <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Followers
          </Text>
        </View>
      </View>

      <View style={styles.accountSettings}>
        <View style={styles.settingItem}>
          <Ionicons 
            name={item.settings.autoImport ? 'checkmark-circle' : 'close-circle'} 
            size={16} 
            color={item.settings.autoImport ? '#10B981' : '#EF4444'} 
          />
          <Text style={[styles.settingText, { color: isDark ? colors.surface : colors.onBackground }]}>
            Auto Import Leads
          </Text>
        </View>
        <View style={styles.settingItem}>
          <Ionicons 
            name={item.settings.autoRespond ? 'checkmark-circle' : 'close-circle'} 
            size={16} 
            color={item.settings.autoRespond ? '#10B981' : '#EF4444'} 
          />
          <Text style={[styles.settingText, { color: isDark ? colors.surface : colors.onBackground }]}>
            Auto Respond
          </Text>
        </View>
      </View>

      <View style={styles.accountActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/social-media/accounts/${item.id}/settings` as any)}
        >
          <Ionicons name="cog-outline" size={16} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/social-media/accounts/${item.id}/analytics` as any)}
        >
          <Ionicons name="bar-chart-outline" size={16} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>Analytics</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderPostItem = ({ item }: { item: SocialPost }) => (
    <Card style={[styles.postCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
      <View style={styles.postHeader}>
        <View style={styles.postInfo}>
          <View style={styles.platformContainer}>
            <Ionicons 
              name={getPlatformIcon(item.platform) as any} 
              size={20} 
              color={getSourceColor(item.platform)} 
            />
            <Text style={[styles.platformText, { color: getSourceColor(item.platform) }]}>
              {item.platform.charAt(0).toUpperCase() + item.platform.slice(1)}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.postContent}>
        <Text style={[styles.postText, { color: isDark ? colors.surface : colors.onBackground }]}>
          {item.content.text}
        </Text>
        {item.content.images && item.content.images.length > 0 && (
          <View style={styles.mediaContainer}>
            <Text style={[styles.mediaText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              📷 {item.content.images.length} image(s)
            </Text>
          </View>
        )}
      </View>

      {item.stats && (
        <View style={styles.postStats}>
          <View style={styles.postStatItem}>
            <Ionicons name="heart-outline" size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
            <Text style={[styles.postStatText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {item.stats.likes}
            </Text>
          </View>
          <View style={styles.postStatItem}>
            <Ionicons name="chatbubble-outline" size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
            <Text style={[styles.postStatText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {item.stats.comments}
            </Text>
          </View>
          <View style={styles.postStatItem}>
            <Ionicons name="share-outline" size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
            <Text style={[styles.postStatText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {item.stats.shares}
            </Text>
          </View>
          {item.stats.views && (
            <View style={styles.postStatItem}>
              <Ionicons name="eye-outline" size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
              <Text style={[styles.postStatText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                {item.stats.views}
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.postFooter}>
        <Text style={[styles.postDate, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
          {item.scheduledFor 
            ? `Scheduled: ${new Date(item.scheduledFor).toLocaleDateString()}`
            : item.publishedAt 
              ? `Published: ${new Date(item.publishedAt).toLocaleDateString()}`
              : `Created: ${new Date(item.createdAt).toLocaleDateString()}`
          }
        </Text>
        <View style={styles.postActions}>
          {item.status === 'draft' && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push(`/social-media/posts/${item.id}/edit` as any)}
            >
              <Ionicons name="create-outline" size={16} color={colors.primary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/social-media/posts/${item.id}/analytics` as any)}
          >
            <Ionicons name="bar-chart-outline" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  const renderLeadsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sourceFilter}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {sources.map((source) => (
            <TouchableOpacity
              key={source.value}
              style={[
                styles.sourceChip,
                selectedSource === source.value && styles.selectedSourceChip,
                { borderColor: isDark ? '#374151' : '#E5E7EB' }
              ]}
              onPress={() => setSelectedSource(source.value)}
            >
              <Ionicons 
                name={source.icon as any} 
                size={14} 
                color={selectedSource === source.value ? colors.primary : (isDark ? '#6B7280' : '#9CA3AF')} 
              />
              <Text style={[
                styles.sourceChipText,
                selectedSource === source.value && styles.selectedSourceChipText
              ]}>
                {source.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Social Leads ({filteredLeads.length})
        </Text>
        <Button
          title="Import Settings"
          onPress={() => router.push('/social-media/import-settings' as any)}
          style={styles.importButton}
        />
      </View>

      <FlatList
        data={filteredLeads}
        renderItem={renderLeadItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={{
          refreshing,
          onRefresh,
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="person-add-outline" size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
            <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              No social media leads found
            </Text>
          </View>
        }
      />
    </View>
  );

  const renderAccountsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Connected Accounts ({accounts.length})
        </Text>
        <Button
          title="Connect Account"
          onPress={() => router.push('/social-media/accounts/connect' as any)}
          style={styles.connectButton}
        />
      </View>

      <FlatList
        data={accounts}
        renderItem={renderAccountItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="link-outline" size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
            <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              No connected accounts
            </Text>
          </View>
        }
      />
    </View>
  );

  const renderPostsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Social Posts ({posts.length})
        </Text>
        <Button
          title="Create Post"
          onPress={() => router.push('/social-media/posts/create' as any)}
          style={styles.createButton}
        />
      </View>

      <FlatList
        data={posts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="create-outline" size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
            <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              No posts created
            </Text>
          </View>
        }
      />
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'leads':
        return renderLeadsTab();
      case 'accounts':
        return renderAccountsTab();
      case 'posts':
        return renderPostsTab();
      default:
        return renderLeadsTab();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          Social Media Integration
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.analyticsButton}
            onPress={() => router.push('/social-media/analytics' as any)}
          >
            <Ionicons name="bar-chart-outline" size={20} color={colors.primary} />
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
  analyticsButton: {
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
  sourceFilter: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sourceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    gap: 4,
  },
  selectedSourceChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sourceChipText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    color: '#6B7280',
  },
  selectedSourceChipText: {
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
  importButton: {
    paddingHorizontal: 16,
  },
  connectButton: {
    paddingHorizontal: 16,
  },
  createButton: {
    paddingHorizontal: 16,
  },
  leadCard: {
    margin: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  leadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  leadInfo: {
    flex: 1,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sourceText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    marginLeft: 6,
  },
  leadName: {
    fontSize: 16,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 2,
  },
  leadEmail: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    marginBottom: 2,
  },
  leadPhone: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
  leadMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    fontFamily: fonts.satoshi.bold,
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontFamily: fonts.satoshi.bold,
    textTransform: 'uppercase',
  },
  messageContainer: {
    marginBottom: 12,
  },
  messageText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 10,
    fontFamily: fonts.satoshi.medium,
  },
  leadFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  leadDate: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  leadActions: {
    flexDirection: 'row',
    gap: 8,
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
  accountCard: {
    margin: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  accountInfo: {
    flex: 1,
  },
  platformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  accountName: {
    fontSize: 16,
    fontFamily: fonts.nohemi.medium,
    marginLeft: 8,
  },
  syncButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.primary + '10',
  },
  accountStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontFamily: fonts.nohemi.bold,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
  },
  accountSettings: {
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  settingText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    marginLeft: 8,
  },
  accountActions: {
    flexDirection: 'row',
    gap: 16,
  },
  postCard: {
    margin: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  postInfo: {
    flex: 1,
  },
  platformText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    marginLeft: 6,
  },
  postContent: {
    marginBottom: 12,
  },
  postText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    lineHeight: 20,
    marginBottom: 8,
  },
  mediaContainer: {
    marginTop: 8,
  },
  mediaText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  postStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  postStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postStatText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  postDate: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  postActions: {
    flexDirection: 'row',
    gap: 8,
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
