import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import { palette } from '@/lib/unistyles';
import { Button } from '@/components/ui/Button';
import ThemedText from '@/components/ui/ThemedText';
import Input from '@/components/forms/Input';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [strengthText, setStrengthText] = useState('');

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

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    const feedback = [];

    // Length check
    if (password.length >= 8) {
      strength += 25;
    } else {
      feedback.push('At least 8 characters');
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      strength += 25;
    } else {
      feedback.push('Add uppercase letter');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      strength += 25;
    } else {
      feedback.push('Add lowercase letter');
    }

    // Numbers or special characters check
    if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(password)) {
      strength += 25;
    } else {
      feedback.push('Add number or special character');
    }

    setPasswordStrength(strength);
    setStrengthText(feedback.join(' • ') || 'Strong password!');
    return strength >= 75;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    const isStrong = checkPasswordStrength(password);
    if (!isStrong) {
      setPasswordError('Please create a stronger password');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) {
      setConfirmPasswordError('Confirm password is required');
      return false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const handleSignup = () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

    if (isEmailValid && isPasswordValid && isConfirmPasswordValid) {
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

  const strengthColor =
    passwordStrength >= 75
      ? palette.green500
      : passwordStrength >= 50
        ? palette.yellow500
        : palette.red500;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <ThemedText style={styles.brand}>Luna.</ThemedText>
        <ThemedText style={styles.title}>Create account</ThemedText>

        <Input
          label="Email"
          //leftIcon="mail"
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
            checkPasswordStrength(text);
            if (passwordError) validatePassword(text);
          }}
          error={passwordError}
          isPassword
          autoCapitalize="none"
        />

        <Input
          label="Confirm password"
          variant="underlined"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (confirmPasswordError) validateConfirmPassword(text);
          }}
          error={confirmPasswordError}
          isPassword
          autoCapitalize="none"
        />
        {password.length > 0 && (
          <View style={styles.strengthWrap}>
            <View style={styles.strengthTrack}>
              <View
                style={[styles.strengthFill, { width: `${passwordStrength}%`, backgroundColor: strengthColor }]}
              />
            </View>
            <ThemedText style={styles.strengthText}>
              {strengthText}
            </ThemedText>
          </View>
        )}

        <View style={styles.buttonSpacer}>
          <Button title="Sign up" onPress={handleSignup} loading={isLoading} size="large" />
        </View>

        <View style={styles.footerRow}>
          <ThemedText style={styles.footerText}>
            Already have an account?{' '}
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
  brand: {
    marginBottom: 56,
    fontFamily: theme.fonts.bold,
    fontSize: 36,
  },
  title: {
    marginBottom: 40,
    fontSize: 20,
    fontFamily: theme.fonts.bold,
  },
  strengthWrap: {
    marginBottom: 16,
  },
  strengthTrack: {
    height: 4,
    width: '100%',
    overflow: 'hidden',
    borderRadius: 9999,
    backgroundColor: theme.colors.secondary,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 9999,
  },
  strengthText: {
    marginTop: 4,
    fontSize: 12,
    color: theme.colors.subtext,
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
