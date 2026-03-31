import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { useEffect } from 'react';

export default function AuthLayout() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.replace('/(main)/dashboard');
        }
    }, [user, loading]);

    return (
        <Stack>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="signup" options={{ headerShown: false }} />
            <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
        </Stack>
    );
}
