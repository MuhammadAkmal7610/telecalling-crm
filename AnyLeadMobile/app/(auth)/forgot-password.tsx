import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthBackground } from '@/src/components/AuthBackground';
import { colors, fonts } from '@/src/theme/theme';

export default function ForgotPasswordScreen() {
    const router = useRouter();

    return (
        <AuthBackground>
            <View style={styles.container}>
                <Text style={styles.title}>Forgot Password</Text>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.back()}
                >
                    <Text style={styles.buttonText}>Back to Login</Text>
                </TouchableOpacity>
            </View>
        </AuthBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontFamily: fonts.nohemi.bold,
        fontSize: 28,
        color: colors.onSurface,
        marginBottom: 24,
    },
    button: {
        backgroundColor: colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonText: {
        fontFamily: fonts.satoshi.bold,
        color: '#FFF',
        fontSize: 16,
    }
});
