import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { View, Image, TouchableOpacity } from 'react-native';

import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import Expandable from '@/components/Expandable';
import Header from '@/components/Header';
import Icon from '@/components/Icon';
import ThemedScroller from '@/components/ThemeScroller';
import ThemeToggle from '@/components/ThemeToggle';
import ThemedText from '@/components/ThemedText';
import Toggle from '@/components/Toggle';
import Checkbox from '@/components/forms/Checkbox';
import FormTabs, { FormTab } from '@/components/forms/FormTabs';
import Input from '@/components/forms/Input';
import Select from '@/components/forms/Select';
import Divider from '@/components/layout/Divider';
import Section from '@/components/layout/Section';

export default function EditProfileScreen() {
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
        rightComponents={[<Button title="Save changes" />]}
      />
      <ThemedScroller className="px-8">
        <View className="mb-8 mt-8 flex-col items-center">
          <TouchableOpacity onPress={pickImage} className="relative" activeOpacity={0.9}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                className="h-28 w-28 rounded-full border border-light-primary dark:border-dark-primary"
              />
            ) : (
              <View className="h-24 w-24 items-center justify-center rounded-full bg-light-secondary dark:bg-dark-secondary">
                <Icon name="Plus" size={25} className="text-light-subtext dark:text-dark-subtext" />
              </View>
            )}
          </TouchableOpacity>
          <View className="mt-4">
            <Button
              variant="ghost"
              title={profileImage ? 'Change photo' : 'Upload photo'}
              className="bg-light-secondary text-sm dark:bg-dark-secondary"
              onPress={pickImage}
            />

            {profileImage && (
              <Button
                className="mt-2"
                title="Remove photo"
                variant="ghost"
                onPress={() => setProfileImage(null)}
              />
            )}
          </View>
        </View>
        <View className="rounded-2xl bg-light-secondary p-global dark:bg-dark-secondary/50">
          <Section
            titleSize="xl"
            className="pb-8 pt-0"
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
