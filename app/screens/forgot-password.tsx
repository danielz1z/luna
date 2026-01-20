import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { View, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import { Button } from '@/components/Button';
import ThemedText from '@/components/ThemedText';
import Input from '@/components/forms/Input';

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleResetPassword = () => {
    const isEmailValid = validateEmail(email);

    if (isEmailValid) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        // Show success message
        Alert.alert(
          'Password Reset Link Sent',
          "We've sent a password reset link to your email address. Please check your inbox.",
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }, 1500);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <ThemedText style={styles.title}>Reset Password</ThemedText>
        <ThemedText style={styles.subtitle}>
          Enter your email address and we'll send you a link to reset your password
        </ThemedText>

        <Input
          label="Email"
          value={email}
          variant="underlined"
          onChangeText={(text) => {
            setEmail(text);
            if (emailError) validateEmail(text);
          }}
          error={emailError}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <View style={styles.buttonSpacer}>
          <Button title="Send Reset Link" onPress={handleResetPassword} loading={isLoading} size="large" />
        </View>

        <View style={styles.footerRow}>
          <ThemedText style={styles.footerText}>
            Remember your password?{' '}
          </ThemedText>
          <Link href="/screens/login" asChild>
            <Pressable>
              <ThemedText style={styles.underline}>Log in</ThemedText>
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  content: {
    marginTop: 32,
  },
  title: {
    marginTop: 40,
    marginBottom: 4,
    fontSize: 30,
    fontFamily: theme.fonts.bold,
  },
  subtitle: {
    marginBottom: 56,
    color: theme.colors.subtext,
  },
  buttonSpacer: {
    marginTop: 16,
    marginBottom: 24,
  },
  footerRow: {
    marginTop: 32,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    color: theme.colors.subtext,
  },
  underline: {
    textDecorationLine: 'underline',
  },
}));
