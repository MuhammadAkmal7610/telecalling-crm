import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '@/src/components/common/Card';
import { colors, fonts } from '@/src/theme/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { ApiService } from '@/src/services/ApiService';
import { Ionicons } from '@expo/vector-icons';

interface DetailedReport {
  id: string;
  name: string;
  type: 'lead' | 'sales' | 'activity' | 'performance';
  description: string;
  generatedAt: string;
  data: any;
}

interface ReportTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: string;
  color: string;
}

export default function DetailedReportsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  
  const [reports, setReports] = useState<DetailedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [generating, setGenerating] = useState(false);

  const reportTypes = [
    { value: 'all', label: 'All Reports' },
    { value: 'lead', label: 'Lead Reports' },
    { value: 'sales', label: 'Sales Reports' },
    { value: 'activity', label: 'Activity Reports' },
    { value: 'performance', label: 'Performance Reports' }
  ];

  const reportTemplates: ReportTemplate[] = [
    {
      id: '1',
      name: 'Lead Conversion Report',
      type: 'lead',
      description: 'Detailed analysis of lead conversion rates and pipeline performance',
      icon: 'funnel-outline',
      color: '#10B981'
    },
    {
      id: '2',
      name: 'Sales Performance Report',
      type: 'sales',
      description: 'Comprehensive sales metrics and revenue analysis',
      icon: 'trending-up-outline',
      color: '#3B82F6'
    },
    {
      id: '3',
      name: 'Activity Summary Report',
      type: 'activity',
      description: 'Complete breakdown of all user activities and engagements',
      icon: 'pulse-outline',
      color: '#8B5CF6'
    },
    {
      id: '4',
      name: 'Team Performance Report',
      type: 'performance',
      description: 'Individual and team performance metrics and KPIs',
      icon: 'people-outline',
      color: '#F59E0B'
    },
    {
      id: '5',
      name: 'Campaign Effectiveness Report',
      type: 'sales',
      description: 'Analysis of marketing campaign performance and ROI',
      icon: 'megaphone-outline',
      color: '#EC4899'
    },
    {
      id: '6',
      name: 'Lead Source Analysis',
      type: 'lead',
      description: 'Detailed breakdown of lead sources and their effectiveness',
      icon: 'link-outline',
      color: '#059669'
    }
  ];

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      // For now, use mock data. In future, fetch from API
      const mockReports: DetailedReport[] = [
        {
          id: '1',
          name: 'Monthly Lead Report',
          type: 'lead',
          description: 'Lead generation and conversion metrics for October 2024',
          generatedAt: new Date().toISOString(),
          data: {}
        },
        {
          id: '2',
          name: 'Q3 Sales Performance',
          type: 'sales',
          description: 'Quarterly sales performance and revenue analysis',
          generatedAt: new Date(Date.now() - 86400000).toISOString(),
          data: {}
        },
        {
          id: '3',
          name: 'Weekly Activity Summary',
          type: 'activity',
          description: 'User activities and engagement metrics for this week',
          generatedAt: new Date(Date.now() - 172800000).toISOString(),
          data: {}
        }
      ];
      setReports(mockReports);
    } catch (error) {
      console.error('Error loading reports:', error);
      Alert.alert('Error', 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (template: ReportTemplate) => {
    setGenerating(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newReport: DetailedReport = {
        id: Date.now().toString(),
        name: template.name,
        type: template.type as any,
        description: template.description,
        generatedAt: new Date().toISOString(),
        data: {}
      };
      
      setReports(prev => [newReport, ...prev]);
      Alert.alert('Success', `${template.name} generated successfully`);
    } catch (error) {
      console.error('Error generating report:', error);
      Alert.alert('Error', 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const viewReport = (report: DetailedReport) => {
    router.push({
      pathname: '/analytics/reports/view',
      params: { reportId: report.id }
    } as any);
  };

  const deleteReport = async (reportId: string) => {
    Alert.alert(
      'Delete Report',
      'Are you sure you want to delete this report?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setReports(prev => prev.filter(r => r.id !== reportId));
              Alert.alert('Success', 'Report deleted successfully');
            } catch (error) {
              console.error('Error deleting report:', error);
              Alert.alert('Error', 'Failed to delete report');
            }
          }
        }
      ]
    );
  };

  const exportReport = async (report: DetailedReport) => {
    Alert.alert(
      'Export Report',
      `Export ${report.name} as PDF or Excel?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'PDF',
          onPress: () => {
            Alert.alert('Success', 'Report exported as PDF');
          }
        },
        {
          text: 'Excel',
          onPress: () => {
            Alert.alert('Success', 'Report exported as Excel');
          }
        }
      ]
    );
  };

  const filteredReports = reports.filter(report => 
    selectedType === 'all' || report.type === selectedType
  );

  const renderReportTemplate = (template: ReportTemplate) => (
    <Card key={template.id} style={styles.templateCard}>
      <View style={styles.templateHeader}>
        <View style={[styles.templateIcon, { backgroundColor: template.color + '10' }]}>
          <Ionicons name={template.icon as any} size={24} color={template.color} />
        </View>
        <View style={styles.templateInfo}>
          <Text style={[styles.templateName, { color: isDark ? colors.surface : colors.onBackground }]}>
            {template.name}
          </Text>
          <Text style={[styles.templateDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {template.description}
          </Text>
        </View>
      </View>
      <Button
        title="Generate Report"
        onPress={() => generateReport(template)}
        loading={generating}
        style={styles.generateButton}
      />
    </Card>
  );

  const renderReportItem = (report: DetailedReport) => (
    <Card key={report.id} style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <View style={styles.reportInfo}>
          <Text style={[styles.reportName, { color: isDark ? colors.surface : colors.onBackground }]}>
            {report.name}
          </Text>
          <Text style={[styles.reportDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {report.description}
          </Text>
          <Text style={[styles.reportDate, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
            Generated {new Date(report.generatedAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={[styles.reportTypeBadge, { backgroundColor: getReportTypeColor(report.type) + '20' }]}>
          <Text style={[styles.reportTypeText, { color: getReportTypeColor(report.type) }]}>
            {report.type}
          </Text>
        </View>
      </View>
      <View style={styles.reportActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary + '10' }]}
          onPress={() => viewReport(report)}
        >
          <Ionicons name="eye-outline" size={16} color={colors.primary} />
          <Text style={[styles.actionButtonText, { color: colors.primary }]}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#10B98120' }]}
          onPress={() => exportReport(report)}
        >
          <Ionicons name="download-outline" size={16} color="#10B981" />
          <Text style={[styles.actionButtonText, { color: '#10B981' }]}>Export</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#EF444420' }]}
          onPress={() => deleteReport(report.id)}
        >
          <Ionicons name="trash-outline" size={16} color="#EF4444" />
          <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const getReportTypeColor = (type: string) => {
    const colors = {
      lead: '#10B981',
      sales: '#3B82F6',
      activity: '#8B5CF6',
      performance: '#F59E0B'
    };
    return colors[type] || '#6B7280';
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          Detailed Reports
        </Text>
        <TouchableOpacity
          style={styles.scheduleButton}
          onPress={() => router.push('/analytics/reports/schedule' as any)}
        >
          <Ionicons name="calendar-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Report Type Filter */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {reportTypes.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.filterButton,
                selectedType === type.value && styles.selectedFilterButton,
                { borderColor: isDark ? '#374151' : '#E5E7EB' }
              ]}
              onPress={() => setSelectedType(type.value)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedType === type.value && styles.selectedFilterButtonText
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Report Templates */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Generate New Report
        </Text>
        {reportTemplates.map(renderReportTemplate)}
      </View>

      {/* Generated Reports */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Generated Reports
        </Text>
        {filteredReports.length > 0 ? (
          filteredReports.map(renderReportItem)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
            <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {selectedType === 'all' ? 'No reports generated yet' : `No ${selectedType} reports found`}
            </Text>
            <Text style={[styles.emptySubtext, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
              Generate your first report using the templates above
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.nohemi.bold,
  },
  scheduleButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.primary + '10',
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  selectedFilterButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    color: '#6B7280',
  },
  selectedFilterButtonText: {
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 16,
  },
  templateCard: {
    padding: 16,
    marginBottom: 12,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  templateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    lineHeight: 20,
  },
  generateButton: {
    marginTop: 8,
  },
  reportCard: {
    padding: 16,
    marginBottom: 12,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportName: {
    fontSize: 16,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 4,
  },
  reportDescription: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
  },
  reportTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reportTypeText: {
    fontSize: 10,
    fontFamily: fonts.satoshi.medium,
    textTransform: 'uppercase',
  },
  reportActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: fonts.satoshi.medium,
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    textAlign: 'center',
  },
});
