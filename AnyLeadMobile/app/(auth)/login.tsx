import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, useColorScheme, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthBackground } from '@/src/components/AuthBackground';
import { colors, fonts } from '@/src/theme/theme';
import { useAuth } from '@/src/contexts/AuthContext';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { signIn } = useAuth();
    const isDark = useColorScheme() === 'dark';

    const textColor = isDark ? colors.surface : colors.onBackground;
    const secondaryTextColor = isDark ? '#A1A1AA' : '#4B5563';

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter your email and password');
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await signIn(email, password);
            if (error) {
                Alert.alert('Login Failed', error.message);
                setIsLoading(false);
            }
            // On success, AuthContext and (auth)/_layout.tsx handle the redirect automatically.
        } catch (err: any) {
            Alert.alert('Error', err.message || 'An unexpected error occurred');
            setIsLoading(false);
        }
    };

    return (
        <AuthBackground>
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={[styles.title, { color: textColor }]}>Welcome Back</Text>
                    <Text style={[styles.subtitle, { color: secondaryTextColor }]}>Sign in to continue to AnyLead</Text>

                    <View style={styles.spacer48} />

                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: textColor }]}>Email Address</Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    color: textColor,
                                    borderColor: isDark ? '#3F3F46' : '#D1D5DB',
                                    backgroundColor: isDark ? '#27272A' : '#FFFFFF',
                                }
                            ]}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor={secondaryTextColor}
                        />
                    </View>

                    <View style={styles.spacer16} />

                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: textColor }]}>Password</Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    color: textColor,
                                    borderColor: isDark ? '#3F3F46' : '#D1D5DB',
                                    backgroundColor: isDark ? '#27272A' : '#FFFFFF',
                                }
                            ]}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            placeholderTextColor={secondaryTextColor}
                        />
                    </View>

                    <View style={styles.forgotPasswordContainer}>
                        <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.spacer24} />

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: colors.primary }]}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.buttonText}>Login</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.spacer24} />

                    <View style={styles.signupContainer}>
                        <Text style={[styles.signupText, { color: secondaryTextColor }]}>Don&apos;t have an account? </Text>
                        <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                            <Text style={styles.signupLink}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </AuthBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        paddingTop: 80,
        justifyContent: 'center',
    },
    content: {
        alignItems: 'center',
        width: '100%',
    },
    title: {
        fontFamily: fonts.nohemi.bold,
        fontSize: 32,
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: fonts.satoshi.regular,
        fontSize: 16,
    },
    inputContainer: {
        width: '100%',
    },
    label: {
        fontFamily: fonts.satoshi.medium,
        fontSize: 14,
        marginBottom: 6,
    },
    input: {
        fontFamily: fonts.satoshi.regular,
        fontSize: 16,
        width: '100%',
        height: 56,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    spacer48: {
        height: 48,
    },
    spacer24: {
        height: 24,
    },
    spacer16: {
        height: 16,
    },
    forgotPasswordContainer: {
        width: '100%',
        alignItems: 'flex-end',
        marginTop: 8,
    },
    forgotPasswordText: {
        fontFamily: fonts.satoshi.medium,
        color: colors.primary,
        fontSize: 14,
    },
    button: {
        width: '100%',
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontFamily: fonts.nohemi.bold,
        color: '#FFFFFF',
        fontSize: 16,
    },
    signupContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    signupText: {
        fontFamily: fonts.satoshi.regular,
        fontSize: 14,
    },
    signupLink: {
        fontFamily: fonts.satoshi.bold,
        color: colors.primary,
        fontSize: 14,
    },
});
