import { Drawer } from 'expo-router/drawer';
import { useColorScheme } from 'react-native';
import { colors } from '@/src/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function MainLayout() {
    const isDark = useColorScheme() === 'dark';
    const { user, signOut, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/(auth)/login');
        }
    }, [user, loading]);

    if (!user) return null;

    return (
        <Drawer
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
                headerStyle: {
                    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                },
                headerTintColor: isDark ? '#FFFFFF' : '#000000',
            }}
        >
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
                name="leads"
                options={{
                    drawerLabel: 'Leads',
                    title: 'Leads',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="people-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="leads/create"
                options={{
                    drawerLabel: () => null,
                    title: 'Create Lead',
                    drawerItemStyle: { display: 'none' },
                }}
            />
            <Drawer.Screen
                name="leads/[id]/index"
                options={{
                    drawerLabel: () => null,
                    title: 'Lead Details',
                    drawerItemStyle: { display: 'none' },
                }}
            />
            <Drawer.Screen
                name="leads/[id]/edit"
                options={{
                    drawerLabel: () => null,
                    title: 'Edit Lead',
                    drawerItemStyle: { display: 'none' },
                }}
            />
            <Drawer.Screen
                name="leads/advanced"
                options={{
                    drawerLabel: 'Advanced Leads',
                    title: 'Advanced Leads',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="search-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="leads/pipeline"
                options={{
                    drawerLabel: 'Pipeline',
                    title: 'Lead Pipeline',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="funnel-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="leads/import-export"
                options={{
                    drawerLabel: 'Import/Export',
                    title: 'Import & Export',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="swap-vertical-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="campaigns"
                options={{
                    drawerLabel: 'Campaigns',
                    title: 'Campaigns',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="megaphone-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="email"
                options={{
                    drawerLabel: 'Email Campaigns',
                    title: 'Email Marketing',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="mail-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="dialer"
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
                name="call-scripts"
                options={{
                    drawerLabel: 'Call Scripts',
                    title: 'Call Scripts',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="document-text-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="analytics"
                options={{
                    drawerLabel: 'Analytics',
                    title: 'Analytics & Reports',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="bar-chart-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="analytics/reports"
                options={{
                    drawerLabel: 'Reports',
                    title: 'Detailed Reports',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="document-text-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="analytics/leaderboard"
                options={{
                    drawerLabel: 'Leaderboard',
                    title: 'Team Leaderboard',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="podium-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="automation"
                options={{
                    drawerLabel: 'Automation',
                    title: 'Automation & Workflows',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="flash-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="automation/assignment"
                options={{
                    drawerLabel: 'Auto-Assignment',
                    title: 'Auto-Assignment Rules',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="people-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="automation/schedules"
                options={{
                    drawerLabel: 'Schedules',
                    title: 'Scheduling System',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="time-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="enterprise/users"
                options={{
                    drawerLabel: 'User Management',
                    title: 'User Management',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="people-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="enterprise/workspaces"
                options={{
                    drawerLabel: 'Workspaces',
                    title: 'Workspace Management',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="business-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="enterprise/integrations"
                options={{
                    drawerLabel: 'Integrations',
                    title: 'Integrations & API',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="link-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="social-media"
                options={{
                    drawerLabel: 'Social Media',
                    title: 'Social Media Integration',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="share-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="settings/advanced"
                options={{
                    drawerLabel: 'Advanced Settings',
                    title: 'Advanced Settings',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="cog-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="invite"
                options={{
                    drawerLabel: 'User Invitations',
                    title: 'User Invitations',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="mail-outline" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="whatsapp/integration"
                options={{
                    drawerLabel: 'WhatsApp Integration',
                    title: 'WhatsApp Integration',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="logo-whatsapp" size={size} color={color} />
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
        </Drawer>
    );
}
