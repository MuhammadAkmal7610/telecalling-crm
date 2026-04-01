import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, FlatList, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/src/components/common/Card';
import { colors, fonts } from '@/src/theme/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { ApiService } from '@/src/services/ApiService';
import { Ionicons } from '@expo/vector-icons';

interface ChatConversation {
  id: string;
  leadId: string;
  leadName: string;
  leadPhone: string;
  assignedTo: string;
  assignedToName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messageCount: number;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
}

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  activeChats: number;
  totalMessages: number;
  responseRate: number;
  avgResponseTime: number;
}

type ViewMode = 'all' | 'by_team' | 'unassigned';

export default function WhatsAppSyncScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeamMember, setSelectedTeamMember] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, [viewMode, selectedTeamMember]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadConversations(), loadTeamMembers()]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConversations = async () => {
    if (!user?.organization_id) return;
    try {
      const params: string[] = [`viewMode=${viewMode}`];
      if (selectedTeamMember) params.push(`teamMemberId=${selectedTeamMember}`);
      const queryString = params.join('&');
      const { data, error } = await ApiService.get(`/whatsapp/conversations?${queryString}`);
      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setConversations(getMockConversations());
    }
  };

  const loadTeamMembers = async () => {
    if (!user?.organization_id) return;
    try {
      const { data, error } = await ApiService.get('/users/team');
      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error loading team members:', error);
    }
  };

  const getMockConversations = (): ChatConversation[] => [
    {
      id: '1',
      leadId: 'lead1',
      leadName: 'John Smith',
      leadPhone: '+1234567890',
      assignedTo: 'user1',
      assignedToName: 'Sarah Johnson',
      lastMessage: 'Thank you for your interest! Let me send you the details.',
      lastMessageTime: new Date(Date.now() - 300000).toISOString(),
      unreadCount: 2,
      messageCount: 15,
      status: 'qualified',
    },
    {
      id: '2',
      leadId: 'lead2',
      leadName: 'Emily Davis',
      leadPhone: '+0987654321',
      assignedTo: 'user2',
      assignedToName: 'Mike Wilson',
      lastMessage: 'When can we schedule a demo?',
      lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
      unreadCount: 0,
      messageCount: 8,
      status: 'contacted',
    },
    {
      id: '3',
      leadId: 'lead3',
      leadName: 'Robert Brown',
      leadPhone: '+1122334455',
      assignedTo: 'user1',
      assignedToName: 'Sarah Johnson',
      lastMessage: 'I need more information about pricing.',
      lastMessageTime: new Date(Date.now() - 7200000).toISOString(),
      unreadCount: 1,
      messageCount: 23,
      status: 'qualified',
    },
    {
      id: '4',
      leadId: 'lead4',
      leadName: 'Lisa Anderson',
      leadPhone: '+5566778899',
      assignedTo: null as any,
      assignedToName: 'Unassigned',
      lastMessage: 'Hello, I saw your ad on Facebook.',
      lastMessageTime: new Date(Date.now() - 1800000).toISOString(),
      unreadCount: 1,
      messageCount: 1,
      status: 'new',
    },
  ];

  const getFilteredConversations = () => {
    let filtered = conversations;
    
    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.leadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.leadPhone.includes(searchQuery) ||
        c.assignedToName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const getTeamStats = () => {
    const totalChats = conversations.length;
    const unassigned = conversations.filter(c => !c.assignedTo || c.assignedTo === null).length;
    const withUnread = conversations.filter(c => c.unreadCount > 0).length;
    const todayMessages = conversations.reduce((sum, c) => sum + c.messageCount, 0);

    return { totalChats, unassigned, withUnread, todayMessages };
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const teamStats = getTeamStats();

  const renderConversationItem = ({ item }: { item: ChatConversation }) => (
    <Card style={[styles.conversationCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
      <View style={styles.conversationHeader}>
        <View style={styles.leadInfo}>
          <Text style={[styles.leadName, { color: isDark ? colors.surface : colors.onBackground }]}>
            {item.leadName}
          </Text>
          <Text style={[styles.leadPhone, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {item.leadPhone}
          </Text>
        </View>
        <View style={styles.conversationMeta}>
          <Text style={[styles.timeText, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
            {formatTime(item.lastMessageTime)}
          </Text>
          {item.unreadCount > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>

      <Text style={[styles.lastMessage, { color: isDark ? '#9CA3AF' : '#6B7280' }]} numberOfLines={1}>
        {item.lastMessage}
      </Text>

      <View style={styles.conversationFooter}>
        <View style={styles.assignedInfo}>
          <Ionicons name="person-outline" size={14} color={isDark ? '#6B7280' : '#9CA3AF'} />
          <Text style={[styles.assignedText, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
            {item.assignedToName}
          </Text>
        </View>
        <View style={styles.messageCount}>
          <Ionicons name="chatbubble-outline" size={14} color={isDark ? '#6B7280' : '#9CA3AF'} />
          <Text style={[styles.messageCountText, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
            {item.messageCount} messages
          </Text>
        </View>
        <View style={[styles.statusBadge, { 
          backgroundColor: item.status === 'new' ? '#3B82F620' : 
                           item.status === 'qualified' ? '#10B98120' : 
                           item.status === 'converted' ? '#8B5CF620' : '#6B728020'
        }]}>
          <Text style={[styles.statusText, { 
            color: item.status === 'new' ? '#3B82F6' : 
                   item.status === 'qualified' ? '#10B981' : 
                   item.status === 'converted' ? '#8B5CF6' : '#6B7280'
          }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>
    </Card>
  );

  const renderTeamMemberCard = (member: TeamMember) => (
    <TouchableOpacity
      key={member.id}
      style={[
        styles.teamMemberCard,
        selectedTeamMember === member.id && styles.selectedTeamMember,
        { backgroundColor: isDark ? '#374151' : '#F9FAFB' }
      ]}
      onPress={() => setSelectedTeamMember(selectedTeamMember === member.id ? null : member.id)}
    >
      <View style={[styles.teamMemberAvatar, { backgroundColor: colors.primary + '20' }]}>
        <Text style={[styles.avatarText, { color: colors.primary }]}>
          {member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
        </Text>
      </View>
      <View style={styles.teamMemberInfo}>
        <Text style={[styles.teamMemberName, { color: isDark ? colors.surface : colors.onBackground }]}>
          {member.name}
        </Text>
        <Text style={[styles.teamMemberStats, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          {member.activeChats} chats • {member.responseRate}% response
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
        <View style={styles.loadingContainer}>
          <Ionicons name="chatbubbles-outline" size={48} color={colors.primary} />
          <Text style={[styles.loadingText, { color: isDark ? colors.surface : colors.onBackground }]}>
            Loading WhatsApp Sync...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          WhatsApp Chat Sync
        </Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadData}
        >
          <Ionicons name="refresh-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: isDark ? colors.surface : colors.onBackground }]}>
            {teamStats.totalChats}
          </Text>
          <Text style={[styles.statLabel, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
            Total Chats
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#3B82F6' }]}>
            {teamStats.unassigned}
          </Text>
          <Text style={[styles.statLabel, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
            Unassigned
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#F59E0B' }]}>
            {teamStats.withUnread}
          </Text>
          <Text style={[styles.statLabel, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
            Unread
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#10B981' }]}>
            {teamStats.todayMessages}
          </Text>
          <Text style={[styles.statLabel, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
            Today
          </Text>
        </View>
      </View>

      {/* View Mode Tabs */}
      <View style={styles.tabsContainer}>
        {(['all', 'by_team', 'unassigned'] as ViewMode[]).map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[
              styles.tabButton,
              viewMode === mode && styles.activeTabButton,
              { borderColor: isDark ? '#374151' : '#E5E7EB' }
            ]}
            onPress={() => setViewMode(mode)}
          >
            <Text style={[
              styles.tabText,
              viewMode === mode && styles.activeTabText
            ]}>
              {mode === 'all' ? 'All Chats' : mode === 'by_team' ? 'By Team' : 'Unassigned'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <Ionicons name="search-outline" size={20} color={isDark ? '#6B7280' : '#9CA3AF'} />
        <TextInput
          style={[styles.searchInput, { color: isDark ? colors.surface : colors.onBackground }]}
          placeholder="Search by lead name, phone, or agent..."
          placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Team Members (for by_team view) */}
      {viewMode === 'by_team' && (
        <View style={styles.teamSection}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Team Members
          </Text>
          <FlatList
            data={teamMembers}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => renderTeamMemberCard(item)}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.teamList}
          />
        </View>
      )}

      {/* Conversations List */}
      <FlatList
        data={getFilteredConversations()}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.conversationsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
            <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              No conversations found
            </Text>
          </View>
        }
      />
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
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.primary + '10',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: fonts.satoshi.medium,
    marginTop: 12,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F620',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontFamily: fonts.nohemi.bold,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: fonts.satoshi.regular,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontFamily: fonts.satoshi.medium,
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontFamily: fonts.nohemi.semiBold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 10,
    borderRadius: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
  teamSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.nohemi.semiBold,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  teamList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  teamMemberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    gap: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTeamMember: {
    borderColor: colors.primary,
  },
  teamMemberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontFamily: fonts.nohemi.bold,
  },
  teamMemberInfo: {
    flex: 1,
  },
  teamMemberName: {
    fontSize: 14,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 2,
  },
  teamMemberStats: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  conversationsList: {
    padding: 20,
    paddingTop: 0,
  },
  conversationCard: {
    marginBottom: 12,
    padding: 16,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  leadInfo: {
    flex: 1,
  },
  leadName: {
    fontSize: 16,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 2,
  },
  leadPhone: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  conversationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    fontSize: 12,
    fontFamily: fonts.nohemi.bold,
    color: '#FFFFFF',
  },
  lastMessage: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    marginBottom: 12,
  },
  conversationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB30',
  },
  assignedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  assignedText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  messageCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  messageCountText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  statusText: {
    fontSize: 10,
    fontFamily: fonts.nohemi.bold,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: fonts.satoshi.medium,
    marginTop: 12,
  },
});