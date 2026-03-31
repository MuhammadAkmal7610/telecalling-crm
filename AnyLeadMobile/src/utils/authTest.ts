import { supabase } from '../lib/supabase';
import { ApiService } from '../services/ApiService';

/**
 * Test function to verify authentication is working properly
 * This can be called from any component to test the auth flow
 */
export async function testAuthentication(): Promise<{
  sessionValid: boolean;
  apiWorking: boolean;
  error?: string;
}> {
  try {
    // Test 1: Check if we have a valid session
    const { data, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !data.session) {
      return {
        sessionValid: false,
        apiWorking: false,
        error: sessionError?.message || 'No active session found'
      };
    }

    const session = data.session;
    
    // Test 2: Try to make an API request with the session
    const { data: apiData, error: apiError } = await ApiService.getUserProfile();
    
    if (apiError) {
      return {
        sessionValid: true, // Session exists but API failed
        apiWorking: false,
        error: apiError.message || 'API request failed'
      };
    }

    if (!apiData) {
      return {
        sessionValid: true,
        apiWorking: false,
        error: 'No user data returned from API'
      };
    }

    // Test successful
    return {
      sessionValid: true,
      apiWorking: true
    };

  } catch (error: any) {
    return {
      sessionValid: false,
      apiWorking: false,
      error: error.message || 'Authentication test failed'
    };
  }
}

/**
 * Debug function to log authentication state
 * Useful for troubleshooting auth issues
 */
export function logAuthState() {
  console.log('=== Authentication Debug Info ===');
  
  // Check current session
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error('Session error:', error);
    } else {
      console.log('Current session:', {
        hasSession: !!data.session,
        userId: data.session?.user?.id,
        email: data.session?.user?.email,
        accessToken: data.session?.access_token ? 'Present' : 'Missing'
      });
    }
  });

  // Check auth state changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state change:', {
      event,
      hasSession: !!session,
      userId: session?.user?.id,
      email: session?.user?.email
    });
  });

  // Cleanup subscription after 5 seconds
  setTimeout(() => {
    subscription.unsubscribe();
    console.log('=== End Authentication Debug Info ===');
  }, 5000);
}