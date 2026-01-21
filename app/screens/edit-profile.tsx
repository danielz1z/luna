import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { StyleSheet } from 'react-native-unistyles';

import { Button } from '@/components/ui/Button';
import Header from '@/components/ui/Header';
import Icon from '@/components/ui/Icon';
import ThemedScroller from '@/components/ui/ThemeScroller';
import Input from '@/components/forms/Input';
import Section from '@/components/layout/Section';

export default function EditProfileScreen() {
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  return (
    <>
      <Header
        title="Profile settings"
        showBackButton
        rightComponents={[<Button key="save-btn" title="Save changes" />]}
      />
      <ThemedScroller>
        <View style={styles.photoSection}>
          <TouchableOpacity onPress={pickImage} style={styles.photoPressable} activeOpacity={0.9}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Icon name="Plus" size={25} />
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.photoActions}>
            <Button
              variant="ghost"
              title={profileImage ? 'Change photo' : 'Upload photo'}
              onPress={pickImage}
            />

            {profileImage && (
              <View style={styles.removePhotoSpacer}>
                <Button
                  title="Remove photo"
                  variant="ghost"
                  onPress={() => setProfileImage(null)}
                />
              </View>
            )}
          </View>
        </View>
        <View style={styles.card}>
          <Section
            titleSize="xl"
            style={styles.cardHeader}
            title="Personal information"
            subtitle="Manage your personal information"
          />
          <Input
            label="First Name"
            variant="underlined"
            value="John"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Last Name"
            value="Doe"
            variant="underlined"
            containerClassName="flex-1"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Email"
            variant="underlined"
            keyboardType="email-address"
            value="john.doe@example.com"
            autoCapitalize="none"
          />
        </View>
      </ThemedScroller>
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  photoSection: {
    marginTop: 32,
    marginBottom: 32,
    flexDirection: 'column',
    alignItems: 'center',
  },
  photoPressable: {
    position: 'relative',
  },
  photo: {
    height: 112,
    width: 112,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  photoPlaceholder: {
    height: 96,
    width: 96,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    backgroundColor: theme.colors.secondary,
  },
  photoActions: {
    marginTop: 16,
  },
  removePhotoSpacer: {
    marginTop: 8,
  },
  card: {
    borderRadius: 16,
    backgroundColor: theme.colors.secondary,
    padding: theme.spacing.global,
  },
  cardHeader: {
    paddingBottom: 32,
    paddingTop: 0,
  },
}));
