import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, useColorScheme, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '../../src/components/common/Card';
import { colors, fonts } from '../../src/theme/theme';
import { useAuth } from '../../src/contexts/AuthContext';
import { ApiService } from '../../src/services/ApiService';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

interface ImportResult {
  total: number;
  imported: number;
  failed: number;
  errors: string[];
}

export default function LeadImportExportScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleImportCSV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const file = result.assets[0];
      await processImportFile(file);
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  const processImportFile = async (file: any) => {
    setImporting(true);
    try {
      // Read file content
      const fileContent = await FileSystem.readAsStringAsync(file.uri);
      
      // Parse CSV (simple implementation)
      const lines = fileContent.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        Alert.alert('Error', 'File is empty or invalid');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const leads: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const lead: any = {
          organization_id: user?.organization_id,
          workspace_id: user?.workspace_id,
          created_by: user?.id,
        };

        headers.forEach((header, index) => {
          const value = values[index];
          if (value) {
            switch (header) {
              case 'name':
                lead.name = value;
                break;
              case 'email':
                lead.email = value;
                break;
              case 'phone':
                lead.phone = value;
                break;
              case 'source':
                lead.source = value;
                break;
              case 'status':
                lead.status = value;
                break;
              case 'company':
                lead.company = value;
                break;
              case 'notes':
                lead.notes = value;
                break;
              default:
                lead[header] = value;
            }
          }
        });

        if (lead.name) {
          leads.push(lead);
        }
      }

      // Import leads to database
      let imported = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const lead of leads) {
        try {
          await ApiService.createLead(lead);
          imported++;
        } catch (error) {
          failed++;
          errors.push(`Failed to import ${lead.name}: ${error}`);
        }
      }

      setImportResult({
        total: leads.length,
        imported,
        failed,
        errors
      });

      Alert.alert(
        'Import Complete',
        `Successfully imported ${imported} out of ${leads.length} leads`
      );
    } catch (error) {
      console.error('Error processing file:', error);
      Alert.alert('Error', 'Failed to process file');
    } finally {
      setImporting(false);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      // Fetch all leads
      const response = await ApiService.getLeads(user?.workspace_id);
      const leads = response.data || [];

      if (leads.length === 0) {
        Alert.alert('Info', 'No leads to export');
        return;
      }

      // Generate CSV content
      const headers = ['Name', 'Email', 'Phone', 'Company', 'Status', 'Source', 'Created At'];
      const csvContent = [
        headers.join(','),
        ...leads.map(lead => [
          `"${lead.name || ''}"`,
          `"${lead.email || ''}"`,
          `"${lead.phone || ''}"`,
          `"${lead.company || ''}"`,
          `"${lead.status || ''}"`,
          `"${lead.source || ''}"`,
          `"${new Date(lead.created_at).toLocaleDateString()}"`
        ].join(','))
      ].join('\n');

      // Create file
      const fileName = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Share file (if available) or show info
      Alert.alert(
        'Export Complete',
        `Exported ${leads.length} leads to ${fileName}\n\nFile saved to app documents.`,
        [
          { text: 'OK' },
          {
            text: 'View Leads',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Error exporting leads:', error);
      Alert.alert('Error', 'Failed to export leads');
    } finally {
      setExporting(false);
    }
  };

  const downloadSampleCSV = () => {
    const sampleContent = `Name,Email,Phone,Company,Status,Source,Notes
John Doe,john@example.com,555-0123,Acme Corp,new,website,Interested in product
Jane Smith,jane@example.com,555-0124,Tech Inc,contacted,referral,Follow up next week
Bob Wilson,bob@example.com,555-0125,Startup Co,qualified,email,Scheduled demo`;

    Alert.alert(
      'Sample CSV Format',
      'Here\'s the sample CSV format:\n\n' + sampleContent + '\n\nRequired fields: Name\nOptional: Email, Phone, Company, Status, Source, Notes'
    );
  };

  const renderImportResult = () => {
    if (!importResult) return null;

    return (
      <Card style={styles.resultCard}>
        <Text style={[styles.resultTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          Import Results
        </Text>
        <View style={styles.resultStats}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {importResult.total}
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Total
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              {importResult.imported}
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Imported
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>
              {importResult.failed}
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Failed
            </Text>
          </View>
        </View>
        
        {importResult.errors.length > 0 && (
          <View style={styles.errorsContainer}>
            <Text style={[styles.errorsTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
              Errors:
            </Text>
            {importResult.errors.slice(0, 3).map((error, index) => (
              <Text key={index} style={[styles.errorText, { color: '#EF4444' }]}>
                • {error}
              </Text>
            ))}
            {importResult.errors.length > 3 && (
              <Text style={[styles.errorText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                ... and {importResult.errors.length - 3} more errors
              </Text>
            )}
          </View>
        )}
      </Card>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          Import & Export
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          Manage your leads data
        </Text>
      </View>

      {/* Import Section */}
      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="download-outline" size={24} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Import Leads
          </Text>
        </View>
        
        <Text style={[styles.sectionDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          Import leads from a CSV file. Make sure your file follows the required format.
        </Text>

        <View style={styles.actionButtons}>
          <Button
            title="Choose CSV File"
            onPress={handleImportCSV}
            loading={importing}
            style={styles.primaryButton}
          />
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: isDark ? '#374151' : '#E5E7EB' }]}
            onPress={downloadSampleCSV}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
              Download Sample
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Export Section */}
      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="upload-outline" size={24} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Export Leads
          </Text>
        </View>
        
        <Text style={[styles.sectionDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          Export all your leads to a CSV file for backup or analysis.
        </Text>

        <Button
          title="Export to CSV"
          onPress={handleExportCSV}
          loading={exporting}
          style={styles.primaryButton}
        />
      </Card>

      {/* Import Results */}
      {renderImportResult()}

      {/* Instructions */}
      <Card style={styles.instructionsCard}>
        <Text style={[styles.instructionsTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          CSV Format Instructions
        </Text>
        
        <View style={styles.instructionsList}>
          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={[styles.instructionText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              First row must contain column headers
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={[styles.instructionText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Required field: Name
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={[styles.instructionText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Optional fields: Email, Phone, Company, Status, Source, Notes
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={[styles.instructionText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Use commas to separate values
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={[styles.instructionText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Maximum file size: 10MB
            </Text>
          </View>
        </View>
      </Card>

      {/* Back Button */}
      <View style={styles.buttonContainer}>
        <Button
          title="Back to Leads"
          onPress={() => router.back()}
          variant="secondary"
        />
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
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.nohemi.bold,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
  },
  sectionCard: {
    padding: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.nohemi.semiBold,
    marginLeft: 8,
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    lineHeight: 20,
    marginBottom: 20,
  },
  actionButtons: {
    gap: 12,
  },
  primaryButton: {
    marginBottom: 8,
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
  },
  resultCard: {
    padding: 20,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 16,
  },
  resultStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: fonts.nohemi.bold,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
  },
  errorsContainer: {
    marginTop: 16,
  },
  errorsTitle: {
    fontSize: 14,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    fontFamily: fonts.satoshi.regular,
    marginBottom: 4,
  },
  instructionsCard: {
    padding: 20,
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 16,
  },
  instructionsList: {
    gap: 8,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  instructionText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    marginLeft: 8,
    flex: 1,
  },
  buttonContainer: {
    marginTop: 20,
  },
});
