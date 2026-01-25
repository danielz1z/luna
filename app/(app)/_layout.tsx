import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Slot } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';
import { AuthModalProvider } from '@/app/contexts/AuthModalContext';
import AuthModal from '@/components/auth/AuthModal';

export default function AppLayout() {
  const { isLoaded } = useAuth();
  const { theme } = useUnistyles();

  if (!isLoaded) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.primary,
        }}>
        <ActivityIndicator size="large" color={theme.colors.highlight} />
      </View>
    );
  }

  return (
    <AuthModalProvider>
      <Slot />
      <AuthModal />
    </AuthModalProvider>
  );
}
