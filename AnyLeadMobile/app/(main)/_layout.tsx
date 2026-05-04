import { Drawer } from 'expo-router/drawer';
import { View, Text, StyleSheet, useColorScheme, TouchableOpacity, ScrollView, Image } from 'react-native';
import { colors, fonts, spacing } from '@/src/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/contexts/AuthContext';
import { useNotifications } from '@/src/contexts/NotificationContext';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';

const LogoImg = require('@/assets/images/logo.png');

function CustomDrawerContent(props: any) {
    const isDark = useColorScheme() === 'dark';
    const { user, signOut } = useAuth();
    const { unreadCount } = useNotifications();
    const router = useRouter();

    return (
        <View style={{ flex: 1, backgroundColor: isDark ? '#0F172A' : '#FFFFFF' }}>
            <DrawerContentScrollView {...props}>
                {/* Brand Section */}
                <View style={styles.brandHeader}>
                    <Image source={LogoImg} style={styles.brandLogo} resizeMode="contain" />
                    <Text style={[styles.brandName, { color: isDark ? '#F8FAFC' : '#1E293B' }]}>Wave</Text>
                </View>

                {/* Header User Section */}
                <View style={styles.drawerHeader}>
                    <LinearGradient
                        colors={colors.gradientPrimary}
                        style={styles.drawerAvatar}
                    >
                        <Text style={styles.drawerAvatarText}>{user?.name?.charAt(0) || 'U'}</Text>
                    </LinearGradient>
                    <View style={styles.drawerUserInfo}>
                        <Text style={[styles.drawerUserName, { color: isDark ? '#F8FAFC' : '#1E293B' }]} numberOfLines={1}>
                            {user?.name || 'User'}
                        </Text>
                        <Text style={[styles.drawerUserEmail, { color: isDark ? '#94A3B8' : '#64748B' }]} numberOfLines={1}>
                            {user?.email || 'user@example.com'}
                        </Text>
                    </View>
                </View>

                {/* Notifications Quick Link if any */}
                {unreadCount > 0 && (
                    <TouchableOpacity 
                        style={styles.notificationBanner}
                        onPress={() => router.push('/notifications' as any)}
                    >
                        <Ionicons name="notifications" size={18} color="#FFFFFF" />
                        <Text style={styles.notificationBannerText}>
                            {unreadCount} new notifications
                        </Text>
                        <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                )}

                <View style={styles.drawerDivider} />

                {/* Main Menu Items */}
                <DrawerItemList {...props} />
            </DrawerContentScrollView>

            {/* Bottom Section - Logout */}
            <View style={[styles.drawerFooter, { borderTopColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
                <TouchableOpacity 
                    style={styles.logoutBtn}
                    onPress={() => signOut()}
                >
                    <Ionicons name="log-out-outline" size={22} color="#EF4444" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default function MainLayout() {
    const isDark = useColorScheme() === 'dark';
    const { user, signOut, loading } = useAuth();
    const { unreadCount } = useNotifications();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/(auth)/login');
        }
    }, [user, loading]);

    if (!user) return null;

    return (
        <Drawer
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                drawerStyle: {
                    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                },
                drawerActiveTintColor: colors.primary,
                drawerInactiveTintColor: isDark ? '#9CA3AF' : '#6B7280',
                drawerLabelStyle: {
                    fontSize: 16,
                    fontFamily: 'System',
                },
                headerTintColor: isDark ? '#FFFFFF' : '#000000',
                headerRight: () => (
                    <TouchableOpacity 
                        style={{ marginRight: 16, position: 'relative' }}
                        onPress={() => router.push('/notifications' as any)}
                    >
                        <Ionicons name="notifications-outline" size={24} color={isDark ? '#F8FAFC' : '#1E293B'} />
                        {unreadCount > 0 && (
                            <View style={styles.headerBadge}>
                                <Text style={styles.headerBadgeText}>{unreadCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ),
            }}
        >
            {/* --- PRIMARY SECTIONS --- */}
            <Drawer.Screen
                name="dashboard"
                options={{
                    drawerLabel: 'Dashboard',
                    title: 'Dashboard',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="grid-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="notifications"
                options={{
                    drawerLabel: 'Notifications',
                    title: 'Notifications',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="notifications-outline" size={size} color={color} />
                    ),
                }}
            />

            {/* --- SALES & LEADS --- */}
            <Drawer.Screen
                name="leads/index"
                options={{
                    drawerLabel: 'Leads',
                    title: 'Leads',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="people-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="campaigns/index"
                options={{
                    drawerLabel: 'Campaigns',
                    title: 'Campaigns',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="megaphone-outline" size={size} color={color} />
                    ),
                }}
            />

            {/* --- COMMUNICATION --- */}
            <Drawer.Screen
                name="dialer/index"
                options={{
                    drawerLabel: 'Dialer',
                    title: 'Dialer',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="call-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="messages"
                options={{
                    drawerLabel: 'Messages',
                    title: 'Messages',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="chatbubble-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="whatsapp/integration"
                options={{
                    drawerLabel: 'WhatsApp',
                    title: 'WhatsApp Integration',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="logo-whatsapp" size={size} color={color} />
                    ),
                }}
            />

            {/* --- ANALYTICS --- */}
            <Drawer.Screen
                name="analytics/index"
                options={{
                    drawerLabel: 'Analytics',
                    title: 'Analytics',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="bar-chart-outline" size={size} color={color} />
                    ),
                }}
            />

            {/* --- WORKSPACE --- */}
            <Drawer.Screen
                name="automation/index"
                options={{
                    drawerLabel: 'Automation',
                    title: 'Automation',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="flash-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="enterprise/users/index"
                options={{
                    drawerLabel: 'Users',
                    title: 'User Management',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="people-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="settings"
                options={{
                    drawerLabel: 'Settings',
                    title: 'Settings',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="settings-outline" size={size} color={color} />
                    ),
                }}
            />

            {/* --- HIDDEN PAGES --- */}
            {[
                'leads/create', 'leads/[id]/index', 'leads/[id]/edit', 'leads/advanced', 
                'leads/pipeline', 'leads/import-export', 'leads/search', 'leads/assign',
                'email/index', 'email/settings', 'call-scripts', 'activities',
                'analytics/reports/index', 'analytics/leaderboard', 'analytics/hourly', 
                'analytics/transactions', 'automation/assignment/index', 'automation/schedules/index',
                'automation/distribution/index', 'automation/welcome-messages/index', 'automation/workflows/create',
                'automation/assignment', 'automation/schedules', 'automation/distribution', 'automation/welcome-messages',
                'enterprise/workspaces/index', 'enterprise/integrations/index', 'social-media/index',
                'settings/advanced', 'settings/help', 'settings/sync', 'settings/about', 
                'settings/legal', 'settings/appearance', 'settings/language', 'settings/notifications',
                'settings/profile', 'settings/security', 'settings/setup-validation', 'invite/index',
                'whatsapp/sync', 'whatsapp/campaigns', 'whatsapp/create-campaign', 'whatsapp/settings',
                'dialer/feedback', 'dialer/reminders', 'dialer/settings', 'dialer/sync-options',
                'dialer/scripts/index', 'dialer/scripts', 'messages/compose', 'messages/templates/index', 
                'messages/templates', 'campaigns/create',
                'test-popups'
            ].map(name => (
                <Drawer.Screen
                    key={name}
                    name={name as any}
                    options={{
                        drawerLabel: () => null,
                        drawerItemStyle: { display: 'none', height: 0, marginVertical: 0 },
                    }}
                />
            ))}
        </Drawer>
    );
}

const styles = StyleSheet.create({
    brandHeader: {
        padding: 24,
        paddingBottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    brandLogo: {
        width: 32,
        height: 32,
    },
    brandName: {
        fontSize: 22,
        fontFamily: fonts.nohemi.bold,
        letterSpacing: 0.5,
    },
    drawerHeader: {
        padding: 24,
        paddingTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    drawerAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    drawerAvatarText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontFamily: fonts.nohemi.bold,
    },
    drawerUserInfo: {
        flex: 1,
    },
    drawerUserName: {
        fontSize: 18,
        fontFamily: fonts.nohemi.semiBold,
        marginBottom: 2,
    },
    drawerUserEmail: {
        fontSize: 13,
        fontFamily: fonts.satoshi.regular,
    },
    notificationBanner: {
        backgroundColor: colors.primary,
        marginHorizontal: 16,
        marginVertical: 8,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    notificationBannerText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontFamily: fonts.satoshi.bold,
        flex: 1,
        marginLeft: 10,
    },
    drawerDivider: {
        height: 1,
        backgroundColor: '#E2E8F020',
        marginVertical: 10,
        marginHorizontal: 16,
    },
    drawerFooter: {
        padding: 20,
        borderTopWidth: 1,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    logoutText: {
        color: '#EF4444',
        fontSize: 16,
        fontFamily: fonts.satoshi.bold,
        marginLeft: 12,
    },
    drawerBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#EF4444',
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    drawerBadgeText: {
        color: '#FFFFFF',
        fontSize: 9,
        fontFamily: fonts.satoshi.bold,
    },
    headerBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: '#EF4444',
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
        paddingHorizontal: 2,
    },
    headerBadgeText: {
        color: '#FFFFFF',
        fontSize: 8,
        fontFamily: fonts.satoshi.bold,
    },
});
