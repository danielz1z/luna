import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { View, Image, Pressable, Dimensions, Text, ScrollView } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { CardScroller } from './CardScroller';
import Icon from './Icon';

import { palette } from '@/lib/unistyles';

interface MultipleImagePickerProps {
  onImageSelect?: (uri: string) => void;
  hasMainImage?: boolean;
}

const windowWidth = Dimensions.get('window').width;

export const MultipleImagePicker: React.FC<MultipleImagePickerProps> = ({
  onImageSelect,
  hasMainImage = true,
}) => {
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);

  const handleDelete = (index?: number) => {
    if (typeof index === 'undefined') {
      setMainImage(null);
    } else {
      setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const pickImage = async (isMain: boolean = false) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      aspect: [5, 4],
      quality: 1,
      allowsMultipleSelection: true,
      selectionLimit: isMain ? 1 : 4,
    });

    if (!result.canceled) {
      if (isMain) {
        const uri = result.assets[0].uri;
        setMainImage(uri);
        onImageSelect?.(uri);
      } else {
        const newImages = result.assets.map((asset) => asset.uri);
        setAdditionalImages((prev) => {
          const combined = [...prev, ...newImages];
          return combined.slice(0, 4); // Limit to 4 images
        });
      }
    }
  };

  return (
    <>
      <Text style={styles.label}>Images</Text>
      <CardScroller>
        {mainImage ? (
          <View style={styles.tileWrapper}>
            <Pressable
              onPress={() => pickImage(true)}
              style={styles.tile}
              android_ripple={{ color: 'rgba(0,0,0,0.3)', borderless: false }}>
              <Image style={styles.tileImage} source={{ uri: mainImage }} />
            </Pressable>
            <Pressable
              onPress={() => handleDelete()}
              style={styles.deleteButton}>
              <Icon name="Trash2" size={18} />
            </Pressable>
          </View>
        ) : (
          hasMainImage && (
            <Pressable
              onPress={() => pickImage(true)}
              style={styles.tileEmpty}
              android_ripple={{ color: 'rgba(0,0,0,0.3)', borderless: false }}>
              <Icon name="Camera" size={24} />
              <Text style={styles.mainPhotoText}>
                Main photo
              </Text>
            </Pressable>
          )
        )}
        {[...Array(4)].map((_, index) => {
          const image = additionalImages[index];
          return (
            <View key={index} style={styles.tileWrapper}>
              {image ? (
                <>
                  <Pressable
                    onPress={() => pickImage(false)}
                    style={styles.tile}
                    android_ripple={{ color: 'rgba(0,0,0,0.3)', borderless: false }}>
                    <Image style={styles.tileImage} source={{ uri: image }} />
                  </Pressable>
                  <Pressable
                    onPress={() => handleDelete(index)}
                    style={styles.deleteButton}>
                    <Icon name="Trash2" size={18} />
                  </Pressable>
                </>
              ) : (
                <Pressable
                  onPress={() => pickImage(false)}
                  style={styles.tilePlaceholder}
                  android_ripple={{ color: 'rgba(0,0,0,0.3)', borderless: false }}>
                  <Icon name="Plus" size={24} />
                </Pressable>
              )}
            </View>
          );
        })}
      </CardScroller>
    </>
  );
};

const styles = StyleSheet.create((theme) => ({
  label: {
    fontSize: 14,
    color: theme.colors.text,
  },
  tileWrapper: {
    position: 'relative',
  },
  tile: {
    height: 112,
    width: 112,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.text,
    overflow: 'hidden',
  },
  tileEmpty: {
    height: 112,
    width: 112,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.text,
    overflow: "hidden",
    padding: 16,
  },
  tilePlaceholder: {
    height: 112,
    width: 112,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.text,
    overflow: "hidden",
    padding: 16,
    opacity: 0.4,
  },
  tileImage: {
    height: '100%',
    width: '100%',
  },
  deleteButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    height: 28,
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: palette.white,
  },
  mainPhotoText: {
    position: 'absolute',
    bottom: 16,
    width: '100%',
    textAlign: 'center',
    fontSize: 12,
    color: theme.colors.text,
  },
}));

export default MultipleImagePicker;
