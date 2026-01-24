import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Slot } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';

export default function AppLayout() {
  const { isSignedIn, isLoaded } = useAuth();
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

  if (!isSignedIn) return <Redirect href="/(auth)/login" />;

  return <Slot />;
}
