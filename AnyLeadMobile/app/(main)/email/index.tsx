/**
 * app/(main)/email/index.tsx
 *
 * Expo Router screen for Email Campaigns.
 * Wraps the fully-featured EmailCampaignsScreen component using the correct
 * context providers available in the mobile app.
 */
import React from 'react';
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
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Mail,
  Send,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  Eye,
  Search,
  Calendar,
  CheckCircle,
  Clock,
  X,
  Zap,
  Target,
  FileText,
  ChevronRight,
  Filter,
  MoreVertical,
} from 'lucide-react-native';
import { useApi } from '@/hooks/useApi';
import { useWorkspace } from '@/src/contexts/WorkspaceContext';
import { EmptyWorkspaceState } from '@/src/components/common/EmptyWorkspaceState';
import { colors } from '@/src/theme/theme';

const PRIMARY = '#08A698';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EmailCampaign {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'paused' | 'cancelled';
  sent_count?: number;
  total_recipients?: number;
  delivered_count?: number;
  opened_count?: number;
  clicked_count?: number;
  template_id?: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content?: string;
  category: string;
  status: 'active' | 'draft';
}

interface EmailAnalytics {
  totalEmails: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft':      return '#6B7280';
    case 'scheduled':  return '#3B82F6';
    case 'running':    return '#F59E0B';
    case 'completed':  return '#10B981';
    case 'paused':     return '#F97316';
    case 'cancelled':  return '#EF4444';
    default:           return '#6B7280';
  }
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function EmailCampaignsScreen() {
  const router = useRouter();
  const { apiFetch } = useApi();
  const { currentWorkspace } = useWorkspace();
  const isDark = useColorScheme() === 'dark';

  const [activeTab, setActiveTab] = React.useState<'campaigns' | 'templates' | 'automation' | 'analytics'>('campaigns');
  const [campaigns, setCampaigns] = React.useState<EmailCampaign[]>([]);
  const [templates, setTemplates] = React.useState<EmailTemplate[]>([]);
  const [analytics, setAnalytics] = React.useState<EmailAnalytics | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');

  // Modal state
  const [showCampaignModal, setShowCampaignModal] = React.useState(false);
  const [showTemplateModal, setShowTemplateModal] = React.useState(false);
  const [selectedCampaign, setSelectedCampaign] = React.useState<EmailCampaign | null>(null);
  const [selectedTemplate, setSelectedTemplate] = React.useState<EmailTemplate | null>(null);

  const tabs = [
    { id: 'campaigns' as const, label: 'Campaigns', icon: Send },
    { id: 'templates' as const, label: 'Templates', icon: FileText },
    { id: 'automation' as const, label: 'Automation', icon: Zap },
    { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 },
  ];

  // ── Data fetching ────────────────────────────────────────────────────────────

  const workspaceHeader: Record<string, string> = currentWorkspace
    ? { 'x-workspace-id': currentWorkspace.id }
    : {};

  const fetchCampaigns = async () => {
    try {
      const qs = statusFilter ? `?status=${statusFilter}` : '';
      const res = await apiFetch(`/email/campaigns${qs}`, { headers: workspaceHeader });
      if (res.ok) {
        const data = await res.json();
        setCampaigns(Array.isArray(data) ? data : data.data || []);
      }
    } catch (e) {
      console.error('fetchCampaigns', e);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await apiFetch('/email/templates', { headers: workspaceHeader });
      if (res.ok) {
        const data = await res.json();
        setTemplates(Array.isArray(data) ? data : data.data || []);
      }
    } catch (e) {
      console.error('fetchTemplates', e);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await apiFetch('/email/analytics', { headers: workspaceHeader });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data?.data || data);
      }
    } catch (e) {
      console.error('fetchAnalytics', e);
    }
  };

  const loadData = async () => {
    setLoading(true);
    if (activeTab === 'campaigns') await fetchCampaigns();
    else if (activeTab === 'templates') await fetchTemplates();
    else if (activeTab === 'analytics') await fetchAnalytics();
    setLoading(false);
  };

  React.useEffect(() => { 
    if (currentWorkspace) {
      loadData(); 
    } else {
      setLoading(false);
    }
  }, [activeTab, currentWorkspace]);

  const onRefresh = async () => {
    if (currentWorkspace) {
      setRefreshing(true);
      await loadData();
      setRefreshing(false);
    }
  };

  // ── Create Campaign ──────────────────────────────────────────────────────────

  const CampaignModal = () => {
    const [form, setForm] = React.useState({
      name: selectedCampaign?.name || '',
      description: selectedCampaign?.description || '',
      template_id: selectedCampaign?.template_id || '',
      sender_email: '',
      sender_name: '',
      reply_to_email: '',
      schedule_type: 'immediate',
      track_opens: true,
      track_clicks: true,
    });

    const handleSubmit = async () => {
      if (!form.name || !form.sender_email || !form.sender_name) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }
      try {
        const method = selectedCampaign ? 'PATCH' : 'POST';
        const path = selectedCampaign
          ? `/email/campaigns/${selectedCampaign.id}`
          : '/email/campaigns';
        const res = await apiFetch(path, {
          method,
          body: JSON.stringify({ ...form, workspace_id: currentWorkspace?.id }),
          headers: workspaceHeader,
        });
        if (res.ok) {
          setShowCampaignModal(false);
          setSelectedCampaign(null);
          fetchCampaigns();
          Alert.alert('Success', `Campaign ${selectedCampaign ? 'updated' : 'created'}!`);
        } else {
          Alert.alert('Error', 'Failed to save campaign');
        }
      } catch {
        Alert.alert('Error', 'Network error – please try again');
      }
    };

    return (
      <Modal visible={showCampaignModal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{selectedCampaign ? 'Edit Campaign' : 'New Campaign'}</Text>
            <TouchableOpacity onPress={() => { setShowCampaignModal(false); setSelectedCampaign(null); }}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {[
              { label: 'Campaign Name *', key: 'name', placeholder: 'Summer Outreach' },
              { label: 'Description', key: 'description', placeholder: 'Describe your campaign', multiline: true },
              { label: 'Sender Email *', key: 'sender_email', placeholder: 'sender@company.com', keyboard: 'email-address' as const },
              { label: 'Sender Name *', key: 'sender_name', placeholder: 'Company Name' },
              { label: 'Reply-to Email', key: 'reply_to_email', placeholder: 'replies@company.com', keyboard: 'email-address' as const },
            ].map(({ label, key, placeholder, multiline, keyboard }) => (
              <View key={key} style={styles.formGroup}>
                <Text style={styles.label}>{label}</Text>
                <TextInput
                  style={[styles.input, multiline && styles.textArea]}
                  value={(form as any)[key]}
                  onChangeText={(v) => setForm(f => ({ ...f, [key]: v }))}
                  placeholder={placeholder}
                  placeholderTextColor="#9CA3AF"
                  multiline={!!multiline}
                  numberOfLines={multiline ? 3 : 1}
                  keyboardType={keyboard || 'default'}
                  autoCapitalize="none"
                />
              </View>
            ))}
            {(['track_opens', 'track_clicks'] as const).map((k) => (
              <View key={k} style={styles.switchRow}>
                <Text style={styles.switchLabel}>{k === 'track_opens' ? 'Track Opens' : 'Track Clicks'}</Text>
                <Switch
                  value={form[k]}
                  onValueChange={(v) => setForm(f => ({ ...f, [k]: v }))}
                  trackColor={{ false: '#E5E7EB', true: PRIMARY }}
                />
              </View>
            ))}
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={() => { setShowCampaignModal(false); setSelectedCampaign(null); }}>
                <Text style={styles.btnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={handleSubmit}>
                <Text style={styles.btnPrimaryText}>{selectedCampaign ? 'Update' : 'Create'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    );
  };

  // ── Create Template ──────────────────────────────────────────────────────────

  const TemplateModal = () => {
    const [form, setForm] = React.useState({
      name: selectedTemplate?.name || '',
      subject: selectedTemplate?.subject || '',
      content: selectedTemplate?.content || '',
      category: selectedTemplate?.category || 'marketing',
    });

    const handleSubmit = async () => {
      if (!form.name || !form.subject || !form.content) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }
      try {
        const method = selectedTemplate ? 'PATCH' : 'POST';
        const path = selectedTemplate ? `/email/templates/${selectedTemplate.id}` : '/email/templates';
        const res = await apiFetch(path, {
          method,
          body: JSON.stringify({ ...form, workspace_id: currentWorkspace?.id }),
          headers: workspaceHeader,
        });
        if (res.ok) {
          setShowTemplateModal(false);
          setSelectedTemplate(null);
          fetchTemplates();
          Alert.alert('Success', `Template ${selectedTemplate ? 'updated' : 'created'}!`);
        } else {
          Alert.alert('Error', 'Failed to save template');
        }
      } catch {
        Alert.alert('Error', 'Network error – please try again');
      }
    };

    return (
      <Modal visible={showTemplateModal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{selectedTemplate ? 'Edit Template' : 'New Template'}</Text>
            <TouchableOpacity onPress={() => { setShowTemplateModal(false); setSelectedTemplate(null); }}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Template Name *</Text>
              <TextInput style={styles.input} value={form.name} onChangeText={(v) => setForm(f => ({ ...f, name: v }))} placeholder="Welcome Email" placeholderTextColor="#9CA3AF" />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Subject *</Text>
              <TextInput style={styles.input} value={form.subject} onChangeText={(v) => setForm(f => ({ ...f, subject: v }))} placeholder="Welcome to our platform!" placeholderTextColor="#9CA3AF" />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Body Content *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={form.content}
                onChangeText={(v) => setForm(f => ({ ...f, content: v }))}
                placeholder={'Dear {{name}},\n\nWelcome!\n\nBest regards,\nThe Team'}
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={8}
                textAlignVertical="top"
              />
            </View>
            <View style={styles.infoBox}>
              <FileText size={18} color={PRIMARY} />
              <Text style={styles.infoText}>Use {'{{name}}'}, {'{{email}}'}, {'{{company}}'} as variable placeholders.</Text>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={() => { setShowTemplateModal(false); setSelectedTemplate(null); }}>
                <Text style={styles.btnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={handleSubmit}>
                <Text style={styles.btnPrimaryText}>{selectedTemplate ? 'Update' : 'Create'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    );
  };

  // ── Render Campaign Item ─────────────────────────────────────────────────────

  const renderCampaign = ({ item }: { item: EmailCampaign }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => { setSelectedCampaign(item); setShowCampaignModal(true); }}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) + '22' }]}>
          <Text style={[styles.badgeText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>
      {item.description ? <Text style={styles.cardSubtitle}>{item.description}</Text> : null}
      <View style={styles.statsRow}>
        <View style={styles.statItem}><CheckCircle size={14} color="#10B981" /><Text style={styles.statValue}>{item.delivered_count ?? 0}</Text><Text style={styles.statLabel}>delivered</Text></View>
        <View style={styles.statItem}><Eye size={14} color="#3B82F6" /><Text style={styles.statValue}>{item.opened_count ?? 0}</Text><Text style={styles.statLabel}>opened</Text></View>
        <View style={styles.statItem}><Target size={14} color="#8B5CF6" /><Text style={styles.statValue}>{item.clicked_count ?? 0}</Text><Text style={styles.statLabel}>clicked</Text></View>
      </View>
      {(item.status === 'draft' || item.status === 'paused') && (
        <TouchableOpacity
          style={styles.executeBtn}
          onPress={async () => {
            try {
              const res = await apiFetch(`/email/campaigns/${item.id}/execute`, { method: 'POST', headers: workspaceHeader });
              if (res.ok) { fetchCampaigns(); Alert.alert('Success', 'Campaign started!'); }
              else Alert.alert('Error', 'Failed to start campaign');
            } catch { Alert.alert('Error', 'Network error'); }
          }}
        >
          <Play size={16} color="#fff" />
          <Text style={styles.executeBtnText}>Start Campaign</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  // ── Render Template Item ─────────────────────────────────────────────────────

  const renderTemplate = ({ item }: { item: EmailTemplate }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => { setSelectedTemplate(item); setShowTemplateModal(true); }}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <View style={[styles.badge, { backgroundColor: item.status === 'active' ? '#10B98122' : '#6B728022' }]}>
          <Text style={[styles.badgeText, { color: item.status === 'active' ? '#10B981' : '#6B7280' }]}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.cardSubtitle}>{item.subject}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.categoryTag}>{item.category}</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => { setSelectedTemplate(item); setShowTemplateModal(true); }}>
            <Edit size={18} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() =>
              Alert.alert('Delete Template', 'Are you sure?', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete', style: 'destructive', onPress: async () => {
                    try {
                      await apiFetch(`/email/templates/${item.id}`, { method: 'DELETE', headers: workspaceHeader });
                      fetchTemplates();
                    } catch { Alert.alert('Error', 'Failed to delete'); }
                  },
                },
              ])
            }
          >
            <Trash2 size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  // ── Analytics Tab ────────────────────────────────────────────────────────────

  const AnalyticsView = () => {
    if (!analytics) return (
      <View style={styles.empty}>
        <ActivityIndicator color={PRIMARY} />
        <Text style={styles.emptyText}>Loading analytics…</Text>
      </View>
    );
    return (
      <View style={styles.metricsGrid}>
        {[
          { label: 'Total Emails', value: analytics.totalEmails, color: '#3B82F6', icon: Mail },
          { label: 'Delivery Rate', value: `${analytics.deliveryRate?.toFixed(1)}%`, color: '#10B981', icon: CheckCircle },
          { label: 'Open Rate', value: `${analytics.openRate?.toFixed(1)}%`, color: '#8B5CF6', icon: Eye },
          { label: 'Click Rate', value: `${analytics.clickRate?.toFixed(1)}%`, color: '#F59E0B', icon: Target },
        ].map(({ label, value, color, icon: Icon }) => (
          <View key={label} style={[styles.metricCard, { borderLeftColor: color }]}>
            <Icon size={20} color={color} />
            <Text style={[styles.metricValue, { color }]}>{value}</Text>
            <Text style={styles.metricLabel}>{label}</Text>
          </View>
        ))}
      </View>
    );
  };

  // ── Main Render ──────────────────────────────────────────────────────────────

  const bg = isDark ? '#111827' : '#F9FAFB';

  if (!loading && !currentWorkspace) {
    return <EmptyWorkspaceState />;
  }

  return (
    <View style={[styles.screen, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? '#1F2937' : '#fff' }]}>
        <View>
          <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#111' }]}>Email Marketing</Text>
          {currentWorkspace && (
            <Text style={[styles.headerSub, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{currentWorkspace.name}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => {
            if (activeTab === 'campaigns') { setSelectedCampaign(null); setShowCampaignModal(true); }
            else if (activeTab === 'templates') { setSelectedTemplate(null); setShowTemplateModal(true); }
          }}
        >
          <Plus size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: isDark ? '#1F2937' : '#fff' }]}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <TouchableOpacity
            key={id}
            style={[styles.tab, activeTab === id && styles.activeTab]}
            onPress={() => setActiveTab(id)}
          >
            <Icon size={16} color={activeTab === id ? PRIMARY : '#9CA3AF'} />
            <Text style={[styles.tabText, { color: activeTab === id ? PRIMARY : '#9CA3AF' }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search */}
      {(activeTab === 'campaigns' || activeTab === 'templates') && (
        <View style={[styles.searchBar, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
          <Search size={18} color="#9CA3AF" />
          <TextInput
            style={[styles.searchInput, { color: isDark ? '#fff' : '#111' }]}
            placeholder="Search…"
            placeholderTextColor="#9CA3AF"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          {searchTerm ? (
            <TouchableOpacity onPress={() => setSearchTerm('')}><X size={18} color="#9CA3AF" /></TouchableOpacity>
          ) : null}
        </View>
      )}

      {/* Content */}
      {loading ? (
        <View style={styles.empty}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.emptyText}>Loading…</Text>
        </View>
      ) : (
        <>
          {activeTab === 'campaigns' && (
            <FlatList
              data={campaigns.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))}
              renderItem={renderCampaign}
              keyExtractor={(i) => i.id}
              contentContainerStyle={{ padding: 16 }}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              ListEmptyComponent={(
                <View style={styles.empty}>
                  <Mail size={48} color="#9CA3AF" />
                  <Text style={styles.emptyTitle}>No email campaigns yet</Text>
                  <Text style={styles.emptyText}>Tap + to create your first campaign</Text>
                </View>
              )}
            />
          )}
          {activeTab === 'templates' && (
            <FlatList
              data={templates.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))}
              renderItem={renderTemplate}
              keyExtractor={(i) => i.id}
              contentContainerStyle={{ padding: 16 }}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              ListEmptyComponent={(
                <View style={styles.empty}>
                  <FileText size={48} color="#9CA3AF" />
                  <Text style={styles.emptyTitle}>No templates yet</Text>
                  <Text style={styles.emptyText}>Tap + to create your first template</Text>
                </View>
              )}
            />
          )}
          {activeTab === 'automation' && (
            <View style={styles.empty}>
              <Zap size={48} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>Email Automation</Text>
              <Text style={styles.emptyText}>Create drip campaigns and follow-up sequences in the web app</Text>
            </View>
          )}
          {activeTab === 'analytics' && (
            <ScrollView contentContainerStyle={{ padding: 16 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
              <AnalyticsView />
            </ScrollView>
          )}
        </>
      )}

      {/* Modals */}
      <CampaignModal />
      <TemplateModal />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 22, fontWeight: '700' },
  headerSub: { fontSize: 13, marginTop: 2 },
  createBtn: { backgroundColor: PRIMARY, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 12 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: PRIMARY },
  tabText: { fontSize: 12, fontWeight: '500' },
  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 12, marginBottom: 4, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  searchInput: { flex: 1, fontSize: 15 },
  // Cards
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#111', flex: 1 },
  cardSubtitle: { color: '#6B7280', fontSize: 13, marginBottom: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  statsRow: { flexDirection: 'row', gap: 16, marginTop: 8 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statValue: { fontSize: 13, fontWeight: '600', color: '#374151' },
  statLabel: { fontSize: 11, color: '#9CA3AF' },
  executeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: PRIMARY, borderRadius: 8, paddingVertical: 8, marginTop: 12 },
  executeBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  categoryTag: { backgroundColor: '#EEF2FF', color: '#6366F1', fontSize: 12, fontWeight: '600', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  actions: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 4 },
  // Analytics
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metricCard: { flex: 1, minWidth: '45%', backgroundColor: '#fff', borderRadius: 12, padding: 16, borderLeftWidth: 4, alignItems: 'center', gap: 6, elevation: 2 },
  metricValue: { fontSize: 22, fontWeight: '700' },
  metricLabel: { fontSize: 12, color: '#6B7280', textAlign: 'center' },
  // Empty
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#374151' },
  emptyText: { color: '#9CA3AF', textAlign: 'center', fontSize: 14 },
  // Modal
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalBody: { flex: 1, padding: 20 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, fontSize: 15, color: '#111' },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', marginBottom: 8 },
  switchLabel: { fontSize: 15, color: '#374151' },
  infoBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#F0FDFC', borderRadius: 10, padding: 14, marginBottom: 16 },
  infoText: { flex: 1, color: '#0F766E', fontSize: 13 },
  modalActions: { flexDirection: 'row', gap: 12, padding: 20 },
  btn: { flex: 1, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  btnPrimary: { backgroundColor: PRIMARY },
  btnSecondary: { backgroundColor: '#F3F4F6' },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  btnSecondaryText: { color: '#374151', fontWeight: '600', fontSize: 15 },
});
