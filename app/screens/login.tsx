import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import { Button } from '@/components/Button';
import ThemedText from '@/components/ThemedText';
import Input from '@/components/forms/Input';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
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

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleLogin = () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (isEmailValid && isPasswordValid) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        // Navigate to home screen after successful login
        router.replace('/(drawer)/(tabs)/');
      }, 1500);
    }
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top + 80 }]}>
      <View style={styles.content}>
        <ThemedText style={styles.brand}>Luna.</ThemedText>
        <ThemedText style={styles.title}>Welcome back</ThemedText>
        <ThemedText style={styles.subtitle}>
          Sign in to your account
        </ThemedText>

        <Input
          label="Email"
          variant="underlined"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (emailError) validateEmail(text);
          }}
          error={emailError}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <Input
          label="Password"
          variant="underlined"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (passwordError) validatePassword(text);
          }}
          error={passwordError}
          isPassword
          autoCapitalize="none"
        />

        <Link style={styles.forgotLink} href="/screens/forgot-password">
          Forgot Password?
        </Link>

        <View style={styles.buttonSpacer}>
          <Button title="Login" onPress={handleLogin} loading={isLoading} size="large" />
        </View>

        <View style={styles.footerRow}>
          <ThemedText style={styles.footerText}>
            Don't have an account?{' '}
          </ThemedText>
          <Link href="/screens/signup" asChild>
            <Pressable>
              <ThemedText style={styles.underline}>Sign up</ThemedText>
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
  brand: {
    marginBottom: 56,
    fontFamily: theme.fonts.bold,
    fontSize: 36,
  },
  title: {
    marginBottom: 4,
    fontSize: 30,
    fontFamily: theme.fonts.bold,
  },
  subtitle: {
    marginBottom: 56,
    color: theme.colors.subtext,
  },
  forgotLink: {
    marginBottom: 16,
    fontSize: 14,
    color: theme.colors.text,
    textDecorationLine: 'underline',
  },
  buttonSpacer: {
    marginBottom: 24,
  },
  footerRow: {
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
