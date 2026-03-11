import { Redirect } from 'expo-router';

export default function Index() {
    // For now, always redirect to login. We will add auth state logic later.
    return <Redirect href="/(auth)/login" />;
}
