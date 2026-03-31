import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, useColorScheme, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '@/src/components/common/Card';
import { colors, fonts } from '@/src/theme/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { ApiService } from '@/src/services/ApiService';
import { Ionicons } from '@expo/vector-icons';

interface CallScript {
  id: string;
  title: string;
  content: string;
  leadStatus: string;
  category: string;
  isDefault: boolean;
}

export default function CallScriptsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDark = useColorScheme() === 'dark';
  const [scripts, setScripts] = useState<CallScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingScript, setEditingScript] = useState<CallScript | null>(null);

  const categories = [
    { value: 'all', label: 'All Scripts' },
    { value: 'new', label: 'New Leads' },
    { value: 'followup', label: 'Follow Up' },
    { value: 'closing', label: 'Closing' },
    { value: 'objection', label: 'Objection Handling' },
    { value: 'custom', label: 'Custom' }
  ];

  const defaultScripts: CallScript[] = [
    {
      id: '1',
      title: 'Initial Contact - New Lead',
      content: "Hello [Lead Name], this is [Your Name] from [Your Company]. I'm calling because we noticed you might be interested in our services. Do you have a moment to discuss how we can help you?\n\nKey Points:\n• Introduce yourself and company\n• Mention why you're calling\n• Ask if it's a good time to talk\n• Be prepared to give a 30-second pitch",
      leadStatus: 'new',
      category: 'new',
      isDefault: true
    },
    {
      id: '2',
      title: 'Follow Up - Previous Contact',
      content: "Hi [Lead Name], this is [Your Name] from [Your Company]. I'm following up on our previous conversation. I wanted to see if you had any questions about our services and if there's a good time to discuss further.\n\nKey Points:\n• Reference previous conversation\n• Ask about their thoughts/questions\n• Suggest next steps\n• Be persistent but not pushy",
      leadStatus: 'contacted',
      category: 'followup',
      isDefault: true
    },
    {
      id: '3',
      title: 'Qualified Lead - Demo Request',
      content: "Hello [Lead Name], great news! Based on our previous discussions, it looks like our solution would be a great fit for your needs. I'd like to schedule a demo to show you exactly how it works.\n\nKey Points:\n• Acknowledge their interest\n• Highlight key benefits for them\n• Propose specific demo times\n• Confirm what they want to see",
      leadStatus: 'qualified',
      category: 'closing',
      isDefault: true
    },
    {
      id: '4',
      title: 'Price Objection Response',
      content: "I understand that pricing is important. Let me show you the value you're getting and how our solution actually saves you money in the long run.\n\nKey Points:\n• Acknowledge their concern\n• Focus on ROI and value\n• Break down the cost vs benefits\n• Offer flexible payment options if available",
      leadStatus: 'contacted',
      category: 'objection',
      isDefault: true
    },
    {
      id: '5',
      title: 'Not Interested Response',
      content: "I understand you might not be interested right now, and that's perfectly fine. Could I ask what specifically doesn't meet your needs? This helps me understand better.\n\nKey Points:\n• Respect their decision\n• Ask for feedback (optional)\n• Leave door open for future\n• Thank them for their time",
      leadStatus: 'lost',
      category: 'objection',
      isDefault: true
    }
  ];

  useEffect(() => {
    loadScripts();
  }, []);

  const loadScripts = async () => {
    try {
      setLoading(true);
      // For now, use default scripts. In future, load from API
      setScripts(defaultScripts);
    } catch (error) {
      console.error('Error loading scripts:', error);
      Alert.alert('Error', 'Failed to load scripts');
    } finally {
      setLoading(false);
    }
  };

  const filteredScripts = scripts.filter(script => {
    const matchesSearch = script.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         script.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || script.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderScriptItem = ({ item }: { item: CallScript }) => (
    <Card style={styles.scriptCard}>
      <View style={styles.scriptHeader}>
        <View style={styles.scriptTitleContainer}>
          <Text style={[styles.scriptTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            {item.title}
          </Text>
          <View style={styles.scriptBadges}>
            {item.isDefault && (
              <View style={[styles.badge, styles.defaultBadge]}>
                <Text style={styles.badgeText}>Default</Text>
              </View>
            )}
            <View style={[styles.badge, { backgroundColor: getCategoryColor(item.category) }]}>
              <Text style={styles.badgeText}>{getCategoryLabel(item.category)}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setEditingScript(item)}
        >
          <Ionicons name="create-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      <Text style={[styles.scriptContent, { color: isDark ? '#9CA3AF' : '#6B7280' }]} numberOfLines={3}>
        {item.content}
      </Text>
      
      <View style={styles.scriptActions}>
        <Button
          title="Use Script"
          onPress={() => useScript(item)}
          style={styles.useButton}
        />
        <TouchableOpacity
          style={styles.expandButton}
          onPress={() => viewScript(item)}
        >
          <Text style={[styles.expandText, { color: colors.primary }]}>View Full</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const useScript = (script: CallScript) => {
    // Navigate to dialer with the script pre-loaded
    router.push({
      pathname: '/dialer',
      params: { scriptId: script.id }
    } as any);
  };

  const viewScript = (script: CallScript) => {
    router.push({
      pathname: '/dialer/scripts/view',
      params: { scriptId: script.id }
    } as any);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      new: '#10B981',
      followup: '#3B82F6',
      closing: '#8B5CF6',
      objection: '#F59E0B',
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
          Call Scripts
        </Text>
        <Button
          title="Create Script"
          onPress={() => router.push('/dialer/scripts/create' as any)}
        />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchInput, { borderColor: isDark ? '#374151' : '#E5E7EB' }]}>
          <Ionicons name="search-outline" size={20} color={isDark ? '#6B7280' : '#9CA3AF'} />
          <TextInput
            style={[styles.searchText, { color: isDark ? colors.surface : colors.onBackground }]}
            placeholder="Search scripts..."
            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === item.value && styles.selectedCategoryChip,
                { borderColor: isDark ? '#374151' : '#E5E7EB' }
              ]}
              onPress={() => setSelectedCategory(item.value)}
            >
              <Text style={[
                styles.categoryChipText,
                selectedCategory === item.value && styles.selectedCategoryChipText
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Scripts List */}
      <FlatList
        data={filteredScripts}
        renderItem={renderScriptItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color={isDark ? '#6B7280' : '#9CA3AF'} />
            <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              No scripts found
            </Text>
            <Button
              title="Create Your First Script"
              onPress={() => router.push('/dialer/scripts/create' as any)}
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
  categoriesContainer: {
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginLeft: 20,
  },
  selectedCategoryChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    color: '#6B7280',
  },
  selectedCategoryChipText: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  scriptCard: {
    padding: 16,
    marginBottom: 12,
  },
  scriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  scriptTitleContainer: {
    flex: 1,
  },
  scriptTitle: {
    fontSize: 16,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 6,
  },
  scriptBadges: {
    flexDirection: 'row',
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
  scriptContent: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    lineHeight: 20,
    marginBottom: 12,
  },
  scriptActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  useButton: {
    flex: 1,
    marginRight: 12,
  },
  expandButton: {
    paddingVertical: 8,
  },
  expandText: {
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
