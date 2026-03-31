import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, useColorScheme, RefreshControl, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '@/src/components/common/Card';
import { colors, fonts } from '@/src/theme/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { ApiService } from '@/src/services/ApiService';
import { Ionicons } from '@expo/vector-icons';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'manager' | 'sales' | 'agent';
  status: 'active' | 'inactive' | 'suspended';
  organizationId: string;
  workspaceId: string;
  lastLogin?: string;
  createdAt: string;
  permissions: string[];
  teams: string[];
  profile: {
    phone?: string;
    avatar?: string;
    department?: string;
    location?: string;
  };
  statistics: {
    leadsCreated: number;
    dealsClosed: number;
    revenueGenerated: number;
    activitiesLogged: number;
  };
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
}

interface Team {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  lead: string;
  createdAt: string;
}

export default function UserManagementScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'teams'>('users');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const tabs = [
    { key: 'users', label: 'Users', icon: 'people-outline' },
    { key: 'roles', label: 'Roles', icon: 'shield-outline' },
    { key: 'teams', label: 'Teams', icon: 'git-branch-outline' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadUsers(),
        loadRoles(),
        loadTeams()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await ApiService.getUsers();
      if (response && response.data) {
        // Backend returns `{ data, total, page, limit }`
        const backendUsers = response.data.data || [];
        const mappedUsers: User[] = backendUsers.map((u: any) => ({
          id: u.id,
          name: u.name || u.email,
          email: u.email,
          role: (u.role?.toLowerCase() || 'agent') as any,
          status: (u.status?.toLowerCase() === 'invited' ? 'inactive' : u.status?.toLowerCase() === 'deleted' ? 'suspended' : 'active') as any,
          organizationId: u.organization_id || '',
          workspaceId: u.workspace_id || '',
          lastLogin: u.updated_at,
          createdAt: u.created_at,
          permissions: u.permission_template ? [u.permission_template.name] : [],
          teams: [],
          profile: {
            phone: u.phone || undefined,
            department: u.license_type || undefined,
          },
          statistics: {
            leadsCreated: 0,
            dealsClosed: 0,
            revenueGenerated: 0,
            activitiesLogged: 0
          }
        }));
        setUsers(mappedUsers);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const loadRoles = async () => {
    // Mock roles data
    const mockRoles: Role[] = [
      {
        id: '1',
        name: 'Super Admin',
        description: 'Full system access with all permissions',
        permissions: ['*'],
        userCount: 1,
        isSystem: true
      },
      {
        id: '2',
        name: 'Admin',
        description: 'Organization and workspace management',
        permissions: ['user_management', 'workspace_management', 'billing_management', 'report_view'],
        userCount: 2,
        isSystem: true
      },
      {
        id: '3',
        name: 'Manager',
        description: 'Team management and lead oversight',
        permissions: ['team_management', 'lead_management', 'report_view', 'activity_view'],
        userCount: 5,
        isSystem: false
      },
      {
        id: '4',
        name: 'Sales',
        description: 'Lead management and sales activities',
        permissions: ['lead_management', 'activity_logging', 'report_view'],
        userCount: 12,
        isSystem: false
      },
      {
        id: '5',
        name: 'Agent',
        description: 'Basic lead viewing and activity logging',
        permissions: ['lead_view', 'activity_logging'],
        userCount: 8,
        isSystem: false
      }
    ];
    setRoles(mockRoles);
  };

  const loadTeams = async () => {
    // Mock teams data
    const mockTeams: Team[] = [
      {
        id: '1',
        name: 'Sales Team',
        description: 'Main sales team handling enterprise clients',
        memberCount: 8,
        lead: 'Sarah Johnson',
        createdAt: new Date(Date.now() - 25920000000).toISOString()
      },
      {
        id: '2',
        name: 'Support Team',
        description: 'Customer support and service team',
        memberCount: 5,
        lead: 'John Smith',
        createdAt: new Date(Date.now() - 51840000000).toISOString()
      },
      {
        id: '3',
        name: 'Marketing Team',
        description: 'Marketing and lead generation team',
        memberCount: 4,
        lead: 'Michael Chen',
        createdAt: new Date(Date.now() - 77760000000).toISOString()
      }
    ];
    setTeams(mockTeams);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const toggleUserStatus = async (userId: string) => {
    try {
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
          : user
      ));
      Alert.alert('Success', 'User status updated');
    } catch (error) {
      console.error('Error updating user status:', error);
      Alert.alert('Error', 'Failed to update user status');
    }
  };

  const deleteUser = async (userId: string) => {
    Alert.alert(
      'Delete User',
      'Are you sure you want to delete this user? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setUsers(prev => prev.filter(user => user.id !== userId));
              Alert.alert('Success', 'User deleted successfully');
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('Error', 'Failed to delete user');
            }
          }
        }
      ]
    );
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return '#DC2626';
      case 'admin': return '#F59E0B';
      case 'manager': return '#3B82F6';
      case 'sales': return '#10B981';
      case 'agent': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'inactive': return '#F59E0B';
      case 'suspended': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getAvatarColor = (name: string) => {
    const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const filteredUsers = users.filter(user => {
    const roleMatch = selectedRole === 'all' || user.role === selectedRole;
    const statusMatch = selectedStatus === 'all' || user.status === selectedStatus;
    return roleMatch && statusMatch;
  });

  const renderUserItem = ({ item }: { item: User }) => (
    <Card style={[styles.userCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
      <View style={styles.userHeader}>
        <View style={[styles.userAvatar, { backgroundColor: getAvatarColor(item.name) }]}>
          <Text style={[styles.avatarText, { color: '#FFFFFF' }]}>
            {item.name.split(' ').map(n => n[0]).join('')}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: isDark ? colors.surface : colors.onBackground }]}>
            {item.name}
          </Text>
          <Text style={[styles.userEmail, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {item.email}
          </Text>
          <View style={styles.userMeta}>
            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) + '20' }]}>
              <Text style={[styles.roleText, { color: getRoleColor(item.role) }]}>
                {item.role.replace('_', ' ')}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {item.status}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.statusToggle, { backgroundColor: item.status === 'active' ? '#10B981' : '#E5E7EB' }]}
          onPress={() => toggleUserStatus(item.id)}
        >
          <Text style={[styles.statusText, { color: item.status === 'active' ? '#FFFFFF' : '#6B7280' }]}>
            {item.status === 'active' ? 'Active' : 'Inactive'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.userStats}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: isDark ? colors.surface : colors.onBackground }]}>
            {item.statistics.leadsCreated}
          </Text>
          <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Leads
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: isDark ? colors.surface : colors.onBackground }]}>
            {item.statistics.dealsClosed}
          </Text>
          <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Deals
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: isDark ? colors.surface : colors.onBackground }]}>
            ${(item.statistics.revenueGenerated / 1000).toFixed(0)}k
          </Text>
          <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Revenue
          </Text>
        </View>
      </View>

      <View style={styles.userFooter}>
        <Text style={[styles.lastLogin, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
          Last login: {item.lastLogin ? new Date(item.lastLogin).toLocaleDateString() : 'Never'}
        </Text>
        <View style={styles.userActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/enterprise/users/${item.id}/edit` as any)}
          >
            <Ionicons name="create-outline" size={16} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/enterprise/users/${item.id}/permissions` as any)}
          >
            <Ionicons name="shield-outline" size={16} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => deleteUser(item.id)}
          >
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  const renderRoleItem = ({ item }: { item: Role }) => (
    <Card style={[styles.roleCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
      <View style={styles.roleHeader}>
        <View style={styles.roleInfo}>
          <Text style={[styles.roleName, { color: isDark ? colors.surface : colors.onBackground }]}>
            {item.name}
          </Text>
          <Text style={[styles.roleDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {item.description}
          </Text>
        </View>
        <View style={styles.roleMeta}>
          <Text style={[styles.userCount, { color: isDark ? colors.surface : colors.onBackground }]}>
            {item.userCount} users
          </Text>
          {item.isSystem && (
            <View style={[styles.systemBadge, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.systemText, { color: colors.primary }]}>System</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.permissionsContainer}>
        <Text style={[styles.permissionsTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Permissions:
        </Text>
        <View style={styles.permissionsList}>
          {item.permissions.slice(0, 3).map((permission, index) => (
            <View key={index} style={[styles.permissionBadge, { backgroundColor: colors.primary + '10' }]}>
              <Text style={[styles.permissionText, { color: colors.primary }]}>
                {permission === '*' ? 'All Permissions' : permission.replace('_', ' ')}
              </Text>
            </View>
          ))}
          {item.permissions.length > 3 && (
            <Text style={[styles.morePermissions, { color: colors.primary }]}>
              +{item.permissions.length - 3} more
            </Text>
          )}
        </View>
      </View>

      <View style={styles.roleActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/enterprise/roles/${item.id}/edit` as any)}
        >
          <Ionicons name="create-outline" size={16} color={colors.primary} />
        </TouchableOpacity>
        {!item.isSystem && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert('Delete Role', 'Delete role functionality will be implemented')}
          >
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );

  const renderTeamItem = ({ item }: { item: Team }) => (
    <Card style={[styles.teamCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
      <View style={styles.teamHeader}>
        <View style={styles.teamInfo}>
          <Text style={[styles.teamName, { color: isDark ? colors.surface : colors.onBackground }]}>
            {item.name}
          </Text>
          <Text style={[styles.teamDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {item.description}
          </Text>
        </View>
        <View style={styles.teamMeta}>
          <Text style={[styles.memberCount, { color: isDark ? colors.surface : colors.onBackground }]}>
            {item.memberCount} members
          </Text>
          <Text style={[styles.teamLead, { color: colors.primary }]}>
            Lead: {item.lead}
          </Text>
        </View>
      </View>

      <View style={styles.teamActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/enterprise/teams/${item.id}/members` as any)}
        >
          <Ionicons name="people-outline" size={16} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/enterprise/teams/${item.id}/edit` as any)}
        >
          <Ionicons name="create-outline" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderUsersTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterGroup}>
            <Text style={[styles.filterLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Role:
            </Text>
            <ScrollView horizontal style={styles.filterScroll}>
              {['all', 'super_admin', 'admin', 'manager', 'sales', 'agent'].map(role => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.filterChip,
                    selectedRole === role && styles.selectedFilterChip,
                    { borderColor: isDark ? '#374151' : '#E5E7EB' }
                  ]}
                  onPress={() => setSelectedRole(role)}
                >
                  <Text style={[
                    styles.filterChipText,
                    selectedRole === role && styles.selectedFilterChipText
                  ]}>
                    {role === 'all' ? 'All Roles' : role.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <View style={styles.filterGroup}>
            <Text style={[styles.filterLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Status:
            </Text>
            <ScrollView horizontal style={styles.filterScroll}>
              {statusOptions.map(status => (
                <TouchableOpacity
                  key={status.value}
                  style={[
                    styles.filterChip,
                    selectedStatus === status.value && styles.selectedFilterChip,
                    { borderColor: isDark ? '#374151' : '#E5E7EB' }
                  ]}
                  onPress={() => setSelectedStatus(status.value)}
                >
                  <Text style={[
                    styles.filterChipText,
                    selectedStatus === status.value && styles.selectedFilterChipText
                  ]}>
                    {status.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Users ({filteredUsers.length})
        </Text>
        <Button
          title="Add User"
          onPress={() => router.push('/enterprise/users/create' as any)}
          style={styles.createButton}
        />
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
            <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              No users found
            </Text>
          </View>
        }
      />
    </View>
  );

  const renderRolesTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Roles & Permissions
        </Text>
        <Button
          title="Create Role"
          onPress={() => router.push('/enterprise/roles/create' as any)}
          style={styles.createButton}
        />
      </View>

      <FlatList
        data={roles}
        renderItem={renderRoleItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="shield-outline" size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
            <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              No roles found
            </Text>
          </View>
        }
      />
    </View>
  );

  const renderTeamsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Teams
        </Text>
        <Button
          title="Create Team"
          onPress={() => router.push('/enterprise/teams/create' as any)}
          style={styles.createButton}
        />
      </View>

      <FlatList
        data={teams}
        renderItem={renderTeamItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="git-branch-outline" size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
            <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              No teams found
            </Text>
          </View>
        }
      />
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return renderUsersTab();
      case 'roles':
        return renderRolesTab();
      case 'teams':
        return renderTeamsTab();
      default:
        return renderUsersTab();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          User Management
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.importButton}
            onPress={() => Alert.alert('Import Users', 'Bulk user import will be implemented')}
          >
            <Ionicons name="download-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
          <Button
            title="Add User"
            onPress={() => router.push('/enterprise/users/create' as any)}
            style={styles.addButton}
          />
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
  importButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.primary + '10',
  },
  addButton: {
    paddingHorizontal: 16,
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
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterGroup: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 6,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  selectedFilterChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    color: '#6B7280',
  },
  selectedFilterChipText: {
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
  createButton: {
    paddingHorizontal: 16,
  },
  userCard: {
    margin: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontFamily: fonts.nohemi.bold,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    marginBottom: 6,
  },
  userMeta: {
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
  statusToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
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
  userFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastLogin: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 6,
  },
  roleCard: {
    margin: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  roleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    fontSize: 16,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
  roleMeta: {
    alignItems: 'flex-end',
  },
  userCount: {
    fontSize: 14,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 4,
  },
  systemBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  systemText: {
    fontSize: 10,
    fontFamily: fonts.satoshi.bold,
  },
  permissionsContainer: {
    marginBottom: 12,
  },
  permissionsTitle: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 8,
  },
  permissionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  permissionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  permissionText: {
    fontSize: 10,
    fontFamily: fonts.satoshi.medium,
  },
  morePermissions: {
    fontSize: 10,
    fontFamily: fonts.satoshi.medium,
  },
  roleActions: {
    flexDirection: 'row',
    gap: 8,
  },
  teamCard: {
    margin: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 4,
  },
  teamDescription: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
  teamMeta: {
    alignItems: 'flex-end',
  },
  memberCount: {
    fontSize: 14,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 4,
  },
  teamLead: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
  },
  teamActions: {
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
