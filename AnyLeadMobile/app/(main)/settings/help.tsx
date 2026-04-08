import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Input } from '@/src/components/common/Card';
import { colors, fonts } from '@/src/theme/theme';
import { Ionicons } from '@expo/vector-icons';

const FAQS = [
  { q: 'How do I add a new lead?', a: 'Tap the "+" button on the leads screen or dashboard to open the creation form.' },
  { q: 'Can I export lead data?', a: 'Yes, go to Advanced Settings > Data Import & Export to manage your data.' },
  { q: 'How do I change my password?', a: 'Go to Settings > Security to update your account password.' },
  { q: 'Is my data synchronized offline?', a: 'Yes, the app caches data for offline access and syncs when connection is restored.' },
];

export default function HelpScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const [search, setSearch] = useState('');

  const ContactBtn = ({ icon, title, subtitle, color, onPress }: { icon: string; title: string; subtitle: string; color: string; onPress: () => void }) => (
    <TouchableOpacity style={[styles.contactBtn, { backgroundColor: isDark ? '#1F2937' : '#fff' }]} onPress={onPress}>
      <View style={[styles.contactIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.contactTitle, { color: isDark ? colors.surface : colors.onBackground }]}>{title}</Text>
        <Text style={[styles.contactSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={isDark ? '#6B7280' : '#9CA3AF'} />
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/settings')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDark ? colors.surface : colors.onBackground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>Help Center</Text>
      </View>

      <View style={styles.searchSection}>
        <Input 
          placeholder="Search for help topics..."
          value={search}
          onChangeText={setSearch}
          icon="search-outline"
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>Contact Support</Text>
        <ContactBtn 
          icon="chatbubbles-outline" 
          title="Live Chat" 
          subtitle="Speak with our support team" 
          color="#3B82F6"
          onPress={() => {}}
        />
        <ContactBtn 
          icon="mail-outline" 
          title="Email Us" 
          subtitle="support@anylead.com" 
          color="#10B981"
          onPress={() => Linking.openURL('mailto:support@anylead.com')}
        />
        <ContactBtn 
          icon="call-outline" 
          title="Call Us" 
          subtitle="+1 (800) 123-4567" 
          color="#F59E0B"
          onPress={() => Linking.openURL('tel:+18001234567')}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.surface : colors.onBackground }]}>Frequently Asked Questions</Text>
        <Card style={styles.faqCard}>
          {FAQS.map((faq, index) => (
            <TouchableOpacity key={index} style={[styles.faqItem, index === FAQS.length - 1 && { borderBottomWidth: 0 }]}>
              <Text style={[styles.faqQuestion, { color: isDark ? colors.surface : colors.onBackground }]}>{faq.q}</Text>
              <Text style={[styles.faqAnswer, { color: isDark ? '#9CA3AF' : '#6B7280' }]} numberOfLines={2}>{faq.a}</Text>
            </TouchableOpacity>
          ))}
        </Card>
      </View>

      <TouchableOpacity style={styles.moreBtn}>
        <Text style={[styles.moreBtnText, { color: colors.primary }]}>View all FAQs</Text>
        <Ionicons name="arrow-forward" size={16} color={colors.primary} />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 20, paddingTop: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backButton: { marginRight: 16 },
  title: { fontSize: 24, fontFamily: fonts.nohemi.bold },
  searchSection: { marginBottom: 24 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 16, fontFamily: fonts.nohemi.semiBold, marginBottom: 16, paddingHorizontal: 4 },
  contactBtn: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB10' },
  contactIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  contactTitle: { fontSize: 15, fontFamily: fonts.satoshi.medium, marginBottom: 2 },
  contactSubtitle: { fontSize: 13, fontFamily: fonts.satoshi.regular },
  faqCard: { paddingHorizontal: 16 },
  faqItem: { paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB10' },
  faqQuestion: { fontSize: 15, fontFamily: fonts.satoshi.medium, marginBottom: 6 },
  faqAnswer: { fontSize: 13, fontFamily: fonts.satoshi.regular, lineHeight: 18 },
  moreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 40, gap: 4 },
  moreBtnText: { fontSize: 15, fontFamily: fonts.satoshi.bold },
});
