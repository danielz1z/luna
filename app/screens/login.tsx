import { Stack, Link, router } from 'expo-router';
import React, { useState } from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import useThemeColors from '@/app/contexts/ThemeColors';
import { Button } from '@/components/Button';
import ThemedText from '@/components/ThemedText';
import Input from '@/components/forms/Input';

export default function LoginScreen() {
  const colors = useThemeColors();
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

  const handleSocialLogin = (_provider: string) => {
    // Implement social login logic here
  };

  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="flex-1 bg-light-primary p-6 pt-20 dark:bg-dark-primary">
      <View className="mt-8">
        <ThemedText className="mb-14 font-outfit-bold text-4xl">Luna.</ThemedText>
        <ThemedText className="mb-1 text-3xl font-bold">Welcome back</ThemedText>
        <ThemedText className="mb-14 text-light-subtext dark:text-dark-subtext">
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

        <Link
          className="mb-4 text-sm text-black underline dark:text-white"
          href="/screens/forgot-password">
          Forgot Password?
        </Link>

        <Button
          title="Login"
          onPress={handleLogin}
          loading={isLoading}
          size="large"
          className="mb-6"
        />

        <View className="flex-row justify-center">
          <ThemedText className="text-light-subtext dark:text-dark-subtext">
            Don't have an account?{' '}
          </ThemedText>
          <Link href="/screens/signup" asChild>
            <Pressable>
              <ThemedText className="underline">Sign up</ThemedText>
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  googleIcon: {
    width: 20,
    height: 20,
    backgroundColor: '#4285F4',
    borderRadius: 2,
  },
});
