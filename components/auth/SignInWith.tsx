import { useSSO, isClerkAPIResponseError } from '@clerk/clerk-expo';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import ThemedText from '@/components/ui/ThemedText';

// Warm up browser for faster OAuth on Android
export const useWarmUpBrowser = () => {
  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

// Complete any pending auth sessions
WebBrowser.maybeCompleteAuthSession();

type OAuthStrategy = 'oauth_google' | 'oauth_apple';

interface SignInWithProps {
  strategy: OAuthStrategy;
  onSuccess?: () => void;
}

const strategyLabels: Record<OAuthStrategy, string> = {
  oauth_google: 'Continue with Google',
  oauth_apple: 'Continue with Apple',
};

export default function SignInWith({ strategy, onSuccess }: SignInWithProps) {
  useWarmUpBrowser();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { startSSOFlow } = useSSO();
  const { theme } = useUnistyles();

  const onPress = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      // CRITICAL: Use the SAME parameters everywhere for consistent URI
      const redirectUrl = AuthSession.makeRedirectUri({
        scheme: 'luna',
        path: 'oauth-callback',
      });

      const { createdSessionId, setActive, signIn, signUp } = await startSSOFlow({
        strategy,
        redirectUrl,
      });

      if (createdSessionId) {
        setActive!({ session: createdSessionId });
        if (onSuccess) {
          onSuccess();
        } else {
          // Default: navigate to app (backward compatible)
          router.replace('/(app)/(drawer)');
        }
      } else if (signIn || signUp) {
        Alert.alert(
          'Additional Steps Required',
          'Please complete the additional security steps to continue.',
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      console.error('OAuth error:', JSON.stringify(err, null, 2));

      // Silent handling of user cancellation
      if (err instanceof Error) {
        if (
          err.message.includes('cancelled') ||
          err.message.includes('dismissed') ||
          err.message.includes('user_cancelled')
        ) {
          console.log('User cancelled OAuth flow');
          setIsLoading(false);
          return;
        }
      }

      // Show error for actual failures
      let errorMessage = 'Something went wrong. Please try again.';
      if (isClerkAPIResponseError(err)) {
        const firstError = err.errors[0];
        if (firstError) {
          errorMessage = firstError.longMessage || firstError.message;
        }
      }

      Alert.alert(`${strategyLabels[strategy]} Failed`, errorMessage, [{ text: 'Try Again' }]);
    } finally {
      setIsLoading(false);
    }
  }, [strategy, startSSOFlow, isLoading, router]);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLoading}
      style={[styles.button, isLoading && styles.buttonDisabled]}>
      {isLoading ? (
        <ActivityIndicator color={theme.colors.text} />
      ) : (
        <ThemedText style={styles.buttonText}>{strategyLabels[strategy]}</ThemedText>
      )}
    </TouchableOpacity>
  );
}

// Theme-adaptive styles (works in light AND dark mode)
const styles = StyleSheet.create((theme) => ({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'transparent',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: theme.fonts.regular,
  },
}));
