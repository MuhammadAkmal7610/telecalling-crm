import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, useColorScheme, ScrollView, TextInput, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '@/src/components/common/Card';
import { colors, fonts } from '@/src/theme/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { ApiService } from '@/src/services/ApiService';
import { Lead } from '@/src/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as XLSX from 'xlsx';

const STEPS = {
  UPLOAD: 'upload',
  MAPPING: 'mapping',
  ASSIGNMENT: 'assignment',
  SUCCESS: 'success'
};

interface ImportResult {
  total: number;
  imported: number;
  failed: number;
  errors: any[];
}

export default function LeadImportExportScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  
  const [currentStep, setCurrentStep] = useState(STEPS.UPLOAD);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [fileData, setFileData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [leadFields, setLeadFields] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<Record<string, number>>({});
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const fetchLeadFields = async () => {
    const { data, error } = await ApiService.getLeadFields();
    if (!error && data) {
      setLeadFields(data);
    }
  };

  const fetchUsers = async () => {
    const { data, error } = await ApiService.getUsers();
    if (!error && data) {
      // /users returns a paginated shape: { data: [...], total, page, limit }
      const usersArray: any[] = Array.isArray(data) ? data : (data.data ?? []);
      const validUsers = usersArray.filter((u: any) => u.role !== 'root');
      setUsers(validUsers);
      
      // Default: everything to first user
      if (validUsers.length > 0) {
        setAssignments({ [validUsers[0].id]: fileData.length });
      }
    }
  };

  const handleImportCSV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'text/csv', 
          'application/vnd.ms-excel', 
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const file = result.assets[0];
      console.log('Picked File:', file.name, file.size, file.mimeType);
      await processImportFile(file);
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  const processImportFile = async (file: any) => {
    setImporting(true);
    try {
      let data: any[] = [];
      
      if (Platform.OS === 'web') {
        // More robust approach for Web: use fetch to get blob
        const response = await fetch(file.uri);
        const blob = await response.blob();
        
        const reader = new FileReader();
        const promise = new Promise<any[]>((resolve, reject) => {
          reader.onload = (e) => {
            try {
              const bstr = e.target?.result;
              const workbook = XLSX.read(bstr, { type: 'binary' });
              const firstSheet = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[firstSheet];
              resolve(XLSX.utils.sheet_to_json(worksheet));
            } catch (err) {
              reject(err);
            }
          };
          reader.onerror = reject;
        });
        
        reader.readAsBinaryString(blob);
        data = await promise;
      } else {
        // Native approach: use FileSystem
        const base64 = await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const workbook = XLSX.read(base64, { type: 'base64' });
        const firstSheet = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheet];
        data = XLSX.utils.sheet_to_json(worksheet);
      }

      if (data.length === 0) {
        Alert.alert('Error', 'File is empty or invalid');
        return;
      }

      console.log('Parsed Data Count:', data.length);
      const sheetHeaders = Object.keys(data[0]);
      setHeaders(sheetHeaders);
      setFileData(data);

      // Auto-mapping
      const initialMapping: Record<string, string> = {};
      sheetHeaders.forEach(header => {
        const norm = header.toLowerCase().trim();
        if (norm === 'name' || norm === 'full name') initialMapping['name'] = header;
        if (norm === 'phone' || norm === 'mobile' || norm === 'number') initialMapping['phone'] = header;
        if (norm === 'email') initialMapping['email'] = header;
        if (norm === 'company' || norm === 'organization') initialMapping['company'] = header;
        if (norm === 'source') initialMapping['source'] = header;
        if (norm === 'status') initialMapping['status'] = header;
      });
      setMapping(initialMapping);

      await fetchLeadFields();
      setCurrentStep(STEPS.MAPPING);
    } catch (error) {
      console.error('Error processing file:', error);
      Alert.alert('Error', 'Failed to process file with XLSX parser. Please check the console for details.');
    } finally {
      setImporting(false);
    }
  };

  const startUpload = async () => {
    const totalAssigned = Object.values(assignments).reduce((a, b) => a + b, 0);
    if (totalAssigned !== fileData.length) {
      Alert.alert('Error', `Please assign all ${fileData.length} leads. Current: ${totalAssigned}`);
      return;
    }

    setLoading(true);
    try {
      const allLeads: any[] = [];
      let offset = 0;

      for (const u of users) {
        const count = assignments[u.id] || 0;
        if (count === 0) continue;

        const chunk = fileData.slice(offset, offset + count).map(row => {
          const lead: any = { 
            assignee_id: u.id, 
            source: 'Import',
            workspace_id: user?.workspace_id
          };
          Object.entries(mapping).forEach(([field, col]) => {
            if (col && row[col]) lead[field] = row[col];
          });
          return lead;
        });

        allLeads.push(...chunk);
        offset += count;
      }

      const { data, error } = await ApiService.bulkImportLeads(allLeads, user?.workspace_id);
      if (error) throw error;

      setImportResult({
        total: allLeads.length,
        imported: data.inserted || allLeads.length,
        failed: 0,
        errors: []
      });

      setCurrentStep(STEPS.SUCCESS);
      Alert.alert('Success', `Successfully imported ${allLeads.length} leads!`);
    } catch (error: any) {
      console.error('Import error:', error);
      Alert.alert('Error', error.message || 'Failed to upload leads');
    } finally {
      setLoading(false);
    }
  };

  const distributeLeadsEvenly = () => {
    if (users.length === 0) return;
    const countPerUser = Math.floor(fileData.length / users.length);
    const remainder = fileData.length % users.length;

    const newAssignments: Record<string, number> = {};
    users.forEach((u, i) => {
      newAssignments[u.id] = countPerUser + (i < remainder ? 1 : 0);
    });
    setAssignments(newAssignments);
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      // Fetch all leads
      const response = await ApiService.getLeads(user?.workspace_id);
      const leads: Lead[] = response.data || [];

      if (leads.length === 0) {
        Alert.alert('Info', 'No leads to export');
        return;
      }

      // Generate CSV content
      const headers = ['Name', 'Email', 'Phone', 'Company', 'Status', 'Source', 'Created At'];
      const csvContent = [
        headers.join(','),
        ...leads.map((lead: Lead) => [
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

  const renderStepIcon = (step: string, index: number) => {
    const stepOrder = [STEPS.UPLOAD, STEPS.MAPPING, STEPS.ASSIGNMENT, STEPS.SUCCESS];
    const currentIndex = stepOrder.indexOf(currentStep);
    const isDone = stepOrder.indexOf(step) < currentIndex;
    const isActive = step === currentStep;

    return (
      <View key={step} style={styles.stepItem}>
        <View style={[
          styles.stepCircle,
          { 
            backgroundColor: isDone ? colors.primary : 'transparent',
            borderColor: isDone || isActive ? colors.primary : '#E5E7EB'
          }
        ]}>
          {isDone ? (
            <Ionicons name="checkmark" size={16} color="white" />
          ) : (
            <Text style={{ color: isActive ? colors.primary : '#9CA3AF', fontWeight: 'bold' }}>{index + 1}</Text>
          )}
        </View>
        {index < 3 && <View style={[styles.stepLine, { backgroundColor: isDone ? colors.primary : '#E5E7EB' }]} />}
      </View>
    );
  };

  const renderMappingStep = () => (
    <View>
      <View style={styles.stepHeader}>
        <Text style={[styles.stepTitle, { color: isDark ? colors.surface : colors.onBackground }]}>Map Fields</Text>
        <Text style={[styles.stepSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Match your file columns to CRM fields</Text>
      </View>

      <Card style={styles.mappingCard}>
        {leadFields.map((field) => (
          <View key={field.id} style={styles.mappingRow}>
            <View style={styles.fieldNameContainer}>
              <Text style={[styles.fieldLabel, { color: isDark ? colors.surface : colors.onBackground }]}>
                {field.label} {field.is_required && <Text style={{ color: '#EF4444' }}>*</Text>}
              </Text>
              <Text style={styles.fieldType}>{field.type}</Text>
            </View>
            <View style={styles.mappingSelectContainer}>
              <View style={[styles.pickerOutline, { borderColor: mapping[field.name] ? colors.primary : '#E5E7EB' }]}>
                <TextInput
                  style={[styles.mappingInput, { color: isDark ? colors.surface : colors.onBackground }]}
                  placeholder="Select Column"
                  placeholderTextColor="#9CA3AF"
                  value={mapping[field.name] || ''}
                  editable={false}
                />
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.headerSuggestions}>
                {headers.map(h => (
                  <TouchableOpacity 
                    key={h} 
                    onPress={() => setMapping(prev => ({ ...prev, [field.name]: h }))}
                    style={[
                      styles.suggestionTag,
                      { backgroundColor: mapping[field.name] === h ? colors.primary : isDark ? '#374151' : '#F3F4F6' }
                    ]}
                  >
                    <Text style={[styles.suggestionText, { color: mapping[field.name] === h ? 'white' : isDark ? colors.surface : colors.onBackground }]}>
                      {h}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        ))}
      </Card>

      <View style={styles.wizardButtons}>
        <Button title="Back" onPress={() => setCurrentStep(STEPS.UPLOAD)} variant="secondary" style={{ flex: 1 }} />
        <Button 
          title="Next: Set Assignment" 
          onPress={() => {
            fetchUsers();
            setCurrentStep(STEPS.ASSIGNMENT);
          }} 
          style={{ flex: 2 }} 
        />
      </View>
    </View>
  );

  const renderAssignmentStep = () => {
    const totalAssigned = Object.values(assignments).reduce((a, b) => a + b, 0);
    const remaining = fileData.length - totalAssigned;

    return (
      <View>
        <View style={styles.stepHeader}>
          <Text style={[styles.stepTitle, { color: isDark ? colors.surface : colors.onBackground }]}>Assign Leads</Text>
          <Text style={[styles.stepSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Distribute {fileData.length} leads among {users.length} members
          </Text>
        </View>

        <Card style={styles.assignmentCard}>
          <View style={styles.assignmentStats}>
            <View style={styles.assignmentStatBox}>
              <Text style={styles.statLabel}>Assigned</Text>
              <Text style={[styles.statValue, { color: remaining === 0 ? '#10B981' : colors.primary }]}>{totalAssigned}</Text>
            </View>
            <View style={styles.assignmentStatBox}>
              <Text style={styles.statLabel}>Remaining</Text>
              <Text style={[styles.statValue, { color: remaining > 0 ? '#EF4444' : '#10B981' }]}>{remaining}</Text>
            </View>
            <TouchableOpacity onPress={distributeLeadsEvenly} style={styles.evenButton}>
              <Text style={styles.evenButtonText}>Distribute Evenly</Text>
            </TouchableOpacity>
          </View>

          {users.map((u) => (
            <View key={u.id} style={styles.userRow}>
              <View style={styles.userInfo}>
                <View style={styles.userAvatar}>
                  <Text style={styles.avatarText}>{u.name.substring(0, 1)}</Text>
                </View>
                <Text style={[styles.userName, { color: isDark ? colors.surface : colors.onBackground }]}>{u.name}</Text>
              </View>
              <TextInput
                style={[styles.assignInput, { color: isDark ? colors.surface : colors.onBackground }]}
                keyboardType="number-pad"
                value={(assignments[u.id] || 0).toString()}
                onChangeText={(val: string) => setAssignments(prev => ({ ...prev, [u.id]: parseInt(val) || 0 }))}
              />
            </View>
          ))}
        </Card>

        <View style={styles.wizardButtons}>
          <Button title="Back" onPress={() => setCurrentStep(STEPS.MAPPING)} variant="secondary" style={{ flex: 1 }} />
          <Button 
            title="Start Import" 
            onPress={startUpload} 
            loading={loading}
            disabled={remaining !== 0}
            style={{ flex: 2 }} 
          />
        </View>
      </View>
    );
  };

  const renderSuccessStep = () => (
    <View style={styles.successContainer}>
      <View style={styles.successIconBox}>
        <Ionicons name="checkmark-circle" size={80} color="#10B981" />
      </View>
      <Text style={[styles.successTitle, { color: isDark ? colors.surface : colors.onBackground }]}>Import Successful!</Text>
      <Text style={styles.successSubtitle}>
        {importResult?.imported} leads haven been added and assigned to your team.
      </Text>
      
      <Button 
        title="View My Leads" 
        onPress={() => router.push('/leads')} 
        style={styles.successButton}
      />
      <TouchableOpacity onPress={() => setCurrentStep(STEPS.UPLOAD)} style={styles.againButton}>
        <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Import More</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.stepperContainer}>
        {[STEPS.UPLOAD, STEPS.MAPPING, STEPS.ASSIGNMENT, STEPS.SUCCESS].map((step, i) => renderStepIcon(step, i))}
      </View>

      {currentStep === STEPS.UPLOAD && (
        <View>
          <View style={styles.header}>
            <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>Import & Export</Text>
            <Text style={[styles.subtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Upload CSV or Excel files to bring leads</Text>
          </View>

          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="cloud-upload-outline" size={32} color={colors.primary} />
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>Step 1: Upload File</Text>
                <Text style={styles.sectionDesc}>Supports CSV, XLSX, and XLS</Text>
              </View>
            </View>
            <Button 
              title="Select File" 
              onPress={handleImportCSV} 
              loading={importing}
              style={{ marginTop: 20 }}
            />
          </Card>

          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="cloud-download-outline" size={32} color="#6B7280" />
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>Step 2: Export Data</Text>
                <Text style={styles.sectionDesc}>Download your current leads as CSV</Text>
              </View>
            </View>
            <Button 
              title="Export to CSV" 
              onPress={handleExportCSV} 
              loading={exporting}
              variant="secondary"
              style={{ marginTop: 20 }}
            />
          </Card>
        </View>
      )}

      {currentStep === STEPS.MAPPING && renderMappingStep()}
      {currentStep === STEPS.ASSIGNMENT && renderAssignmentStep()}
      {currentStep === STEPS.SUCCESS && renderSuccessStep()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 100 },
  stepperContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 30 },
  stepItem: { flexDirection: 'row', alignItems: 'center' },
  stepCircle: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  stepLine: { width: 40, height: 2, marginHorizontal: 5 },
  header: { marginBottom: 24, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 14 },
  sectionCard: { padding: 20, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  sectionDesc: { fontSize: 13, color: '#9CA3AF' },
  
  stepHeader: { marginBottom: 20 },
  stepTitle: { fontSize: 20, fontWeight: 'bold' },
  stepSubtitle: { fontSize: 14 },
  
  mappingCard: { padding: 15 },
  mappingRow: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingBottom: 15 },
  fieldNameContainer: { marginBottom: 10 },
  fieldLabel: { fontSize: 15, fontWeight: '600' },
  fieldType: { fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase' },
  mappingSelectContainer: {},
  pickerOutline: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 10 },
  mappingInput: { fontSize: 14 },
  headerSuggestions: { flexDirection: 'row' },
  suggestionTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, marginRight: 8 },
  suggestionText: { fontSize: 12, fontWeight: '500' },
  
  assignmentCard: { padding: 15 },
  assignmentStats: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25, backgroundColor: '#F9FAFB', padding: 15, borderRadius: 12 },
  assignmentStatBox: { alignItems: 'center' },
  statLabel: { fontSize: 10, color: '#6B7280', textTransform: 'uppercase', marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: 'bold' },
  evenButton: { backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  evenButtonText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  userRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  userAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary + '20', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarText: { color: colors.primary, fontWeight: 'bold' },
  userName: { fontSize: 14, fontWeight: '500' },
  assignInput: { width: 80, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 8, textAlign: 'center', fontWeight: 'bold' },
  
  wizardButtons: { flexDirection: 'row', gap: 12, marginTop: 25 },
  
  successContainer: { alignItems: 'center', paddingVertical: 40 },
  successIconBox: { marginBottom: 20 },
  successTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  successSubtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 30, paddingHorizontal: 20 },
  successButton: { width: '80%', marginBottom: 15 },
  againButton: { padding: 10 },
});
