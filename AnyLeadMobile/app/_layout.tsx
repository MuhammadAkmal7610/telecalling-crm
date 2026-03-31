import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { AuthProvider } from '@/src/contexts/AuthContext';
import { WorkspaceProvider } from '@/src/contexts/WorkspaceContext';
import { ToastProvider } from '@/src/contexts/ToastContext';
import { PopupProvider } from '@/src/contexts/PopupContext';
import { Toast } from '@/src/components/common/Toast';
import { Popup } from '@/src/components/common/Popup';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Hide splash screen immediately since we're not loading custom fonts
    SplashScreen.hideAsync();
  }, []);

  return (
    <AuthProvider>
      <ToastProvider>
        <PopupProvider>
          <WorkspaceProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <Stack>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(main)" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
              </Stack>
              <StatusBar style="auto" />
              <Toast />
            </ThemeProvider>
          </WorkspaceProvider>
        </PopupProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
