import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, useColorScheme, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '@/src/components/common/Card';
import { colors, fonts } from '@/src/theme/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { ApiService } from '@/src/services/ApiService';
import { Ionicons } from '@expo/vector-icons';

interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  type: 'sms' | 'whatsapp';
  category: string;
  variables: string[];
  isDefault: boolean;
}

export default function MessageTemplatesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'sms' | 'whatsapp'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const messageTypes = [
    { value: 'all', label: 'All Messages' },
    { value: 'sms', label: 'SMS' },
    { value: 'whatsapp', label: 'WhatsApp' }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'greeting', label: 'Greeting' },
    { value: 'followup', label: 'Follow Up' },
    { value: 'promotion', label: 'Promotion' },
    { value: 'appointment', label: 'Appointment' },
    { value: 'custom', label: 'Custom' }
  ];

  const defaultTemplates: MessageTemplate[] = [
    {
      id: '1',
      name: 'Initial Greeting',
      content: 'Hello [Lead Name], this is [Your Name] from [Your Company]. I wanted to reach out regarding your inquiry. Is this a good time to chat?',
      type: 'sms',
      category: 'greeting',
      variables: ['Lead Name', 'Your Name', 'Your Company'],
      isDefault: true
    },
    {
      id: '2',
      name: 'Follow Up After Call',
      content: 'Hi [Lead Name], great speaking with you earlier! As discussed, I\'m sending you the information about [Product/Service]. Let me know if you have any questions.',
      type: 'whatsapp',
      category: 'followup',
      variables: ['Lead Name', 'Product/Service'],
      isDefault: true
    },
    {
      id: '3',
      name: 'Appointment Reminder',
      content: 'Hi [Lead Name], this is a reminder about our scheduled call on [Date] at [Time]. I\'m looking forward to discussing [Topic]. Please let me know if you need to reschedule.',
      type: 'sms',
      category: 'appointment',
      variables: ['Lead Name', 'Date', 'Time', 'Topic'],
      isDefault: true
    },
    {
      id: '4',
      name: 'Promotional Offer',
      content: 'Hello [Lead Name]! Special offer just for you: Get [Discount]% off on [Product/Service]. Limited time offer. Reply YES to know more!',
      type: 'sms',
      category: 'promotion',
      variables: ['Lead Name', 'Discount', 'Product/Service'],
      isDefault: true
    },
    {
      id: '5',
      name: 'Thank You Message',
      content: 'Thank you for your time today, [Lead Name]! It was great learning about your needs. I\'ll send over the promised information by [Time]. Have a great day!',
      type: 'whatsapp',
      category: 'followup',
      variables: ['Lead Name', 'Time'],
      isDefault: true
    },
    {
      id: '6',
      name: 'Meeting Confirmation',
      content: 'Hi [Lead Name], confirming our meeting on [Date] at [Time]. We\'ll be discussing [Agenda]. The meeting link is: [Meeting Link]. See you there!',
      type: 'whatsapp',
      category: 'appointment',
      variables: ['Lead Name', 'Date', 'Time', 'Agenda', 'Meeting Link'],
      isDefault: true
    }
  ];

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      // For now, use default templates. In future, load from API
      setTemplates(defaultTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      Alert.alert('Error', 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || template.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const renderTemplateItem = ({ item }: { item: MessageTemplate }) => (
    <Card style={styles.templateCard}>
      <View style={styles.templateHeader}>
        <View style={styles.templateTitleContainer}>
          <Text style={[styles.templateName, { color: isDark ? colors.surface : colors.onBackground }]}>
            {item.name}
          </Text>
          <View style={styles.templateBadges}>
            {item.isDefault && (
              <View style={[styles.badge, styles.defaultBadge]}>
                <Text style={styles.badgeText}>Default</Text>
              </View>
            )}
            <View style={[styles.badge, { backgroundColor: item.type === 'sms' ? '#3B82F6' : '#10B981' }]}>
              <Text style={styles.badgeText}>{item.type.toUpperCase()}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: getCategoryColor(item.category) }]}>
              <Text style={styles.badgeText}>{getCategoryLabel(item.category)}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => editTemplate(item)}
        >
          <Ionicons name="create-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      <Text style={[styles.templateContent, { color: isDark ? '#9CA3AF' : '#6B7280' }]} numberOfLines={3}>
        {item.content}
      </Text>
      
      {item.variables.length > 0 && (
        <View style={styles.variablesContainer}>
          <Text style={[styles.variablesLabel, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
            Variables: {item.variables.join(', ')}
          </Text>
        </View>
      )}
      
      <View style={styles.templateActions}>
        <Button
          title="Use Template"
          onPress={() => useTemplate(item)}
          style={styles.useButton}
        />
        <TouchableOpacity
          style={styles.previewButton}
          onPress={() => previewTemplate(item)}
        >
          <Text style={[styles.previewText, { color: colors.primary }]}>Preview</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const useTemplate = (template: MessageTemplate) => {
    // Navigate to message composer with template pre-loaded
    router.push({
      pathname: '/messages/compose',
      params: { templateId: template.id, type: template.type }
    } as any);
  };

  const previewTemplate = (template: MessageTemplate) => {
    router.push({
      pathname: '/messages/templates/preview',
      params: { templateId: template.id }
    } as any);
  };

  const editTemplate = (template: MessageTemplate) => {
    router.push({
      pathname: '/messages/templates/edit',
      params: { templateId: template.id }
    } as any);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      greeting: '#10B981',
      followup: '#3B82F6',
      promotion: '#8B5CF6',
      appointment: '#F59E0B',
      custom: '#6B7280'
    };
    return colors[category] || '#6B7280';
  };

  const getCategoryLabel = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          Message Templates
        </Text>
        <Button
          title="Create Template"
          onPress={() => router.push('/messages/templates/create' as any)}
        />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchInput, { borderColor: isDark ? '#374151' : '#E5E7EB' }]}>
          <Ionicons name="search-outline" size={20} color={isDark ? '#6B7280' : '#9CA3AF'} />
          <TextInput
            style={[styles.searchText, { color: isDark ? colors.surface : colors.onBackground }]}
            placeholder="Search templates..."
            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Message Types */}
      <View style={styles.filterContainer}>
        <FlatList
          data={messageTypes}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedType === item.value && styles.selectedFilterChip,
                { borderColor: isDark ? '#374151' : '#E5E7EB' }
              ]}
              onPress={() => setSelectedType(item.value as any)}
            >
              <Text style={[
                styles.filterChipText,
                selectedType === item.value && styles.selectedFilterChipText
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Categories */}
      <View style={styles.filterContainer}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedCategory === item.value && styles.selectedFilterChip,
                { borderColor: isDark ? '#374151' : '#E5E7EB' }
              ]}
              onPress={() => setSelectedCategory(item.value)}
            >
              <Text style={[
                styles.filterChipText,
                selectedCategory === item.value && styles.selectedFilterChipText
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Templates List */}
      <FlatList
        data={filteredTemplates}
        renderItem={renderTemplateItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-outline" size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
            <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              No templates found
            </Text>
            <Button
              title="Create Your First Template"
              onPress={() => router.push('/messages/templates/create' as any)}
            />
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
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchText: {
    flex: 1,
    fontSize: 16,
    fontFamily: fonts.satoshi.regular,
    marginLeft: 8,
  },
  filterContainer: {
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginLeft: 20,
  },
  selectedFilterChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    color: '#6B7280',
  },
  selectedFilterChipText: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  templateCard: {
    padding: 16,
    marginBottom: 12,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  templateTitleContainer: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 6,
  },
  templateBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  defaultBadge: {
    backgroundColor: colors.primary,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: fonts.satoshi.medium,
    color: '#FFFFFF',
  },
  actionButton: {
    padding: 4,
  },
  templateContent: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    lineHeight: 20,
    marginBottom: 8,
  },
  variablesContainer: {
    marginBottom: 12,
  },
  variablesLabel: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    fontStyle: 'italic',
  },
  templateActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  useButton: {
    flex: 1,
    marginRight: 12,
  },
  previewButton: {
    paddingVertical: 8,
  },
  previewText: {
    fontSize: 14,
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
    marginBottom: 20,
  },
});
