import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  useWindowDimensions,
  Modal,
} from 'react-native';
import { Image } from 'expo-image';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation } from 'convex/react';
import { ConvexError } from 'convex/values';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';

import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import Header from '@/components/ui/Header';
import DrawerButton from '@/components/ui/DrawerButton';
import ThemedText from '@/components/ui/ThemedText';
import Icon from '@/components/ui/Icon';
import { palette, withOpacity } from '@/lib/unistyles';

const COST_PER_IMAGE = 50;

type Resolution = '512' | '768' | '1024';

const resolutions: { value: Resolution; label: string }[] = [
  { value: '512', label: '512×512' },
  { value: '768', label: '768×768' },
  { value: '1024', label: '1024×1024' },
];

export default function ImagesScreen() {
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [prompt, setPrompt] = useState('');
  const [resolution, setResolution] = useState<Resolution>('1024');
  const [activeJobId, setActiveJobId] = useState<Id<'imageJobs'> | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const userImages = useQuery(api.queries.listUserImages, { limit: 50 });
  const activeJob = useQuery(
    api.queries.getImageJob,
    activeJobId ? { jobId: activeJobId } : 'skip'
  );
  const userCredits = useQuery(api.queries.getUserCredits);
  const createJob = useMutation(api.imageJobs.create);

  const numColumns = 2;
  const spacing = 12;
  const imageSize = (width - 32 - spacing * (numColumns - 1)) / numColumns;

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    if (userCredits !== undefined && userCredits < COST_PER_IMAGE) {
      setError('Insufficient credits');
      return;
    }

    setError(null);

    try {
      const jobId = await createJob({
        prompt: prompt.trim(),
        resolution,
      });
      setActiveJobId(jobId);
      setPrompt('');
    } catch (err) {
      if (err instanceof ConvexError) {
        setError(err.data as string);
      } else {
        setError('Failed to start generation');
      }
    }
  }, [prompt, resolution, userCredits, createJob]);

  React.useEffect(() => {
    if (activeJob?.status === 'completed' || activeJob?.status === 'failed') {
      const timer = setTimeout(() => {
        setActiveJobId(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [activeJob?.status]);

  const renderJobStatus = () => {
    if (!activeJob) return null;

    return (
      <Animated.View
        entering={SlideInDown.springify().damping(15)}
        exiting={SlideOutDown.springify().damping(15)}
        style={styles.jobStatusContainer}>
        {activeJob.status === 'pending' && (
          <View style={styles.jobStatusRow}>
            <ActivityIndicator size="small" color={theme.colors.highlight} />
            <ThemedText style={styles.jobStatusText}>Queued...</ThemedText>
          </View>
        )}

        {activeJob.status === 'processing' && (
          <View style={styles.jobStatusRow}>
            <ActivityIndicator size="small" color={theme.colors.highlight} />
            <ThemedText style={styles.jobStatusText}>Generating...</ThemedText>
          </View>
        )}

        {activeJob.status === 'completed' && activeJob.imageUrl && (
          <View style={styles.jobCompletedContainer}>
            <View style={styles.jobStatusRow}>
              <Icon name="Check" size={18} color={theme.colors.success} />
              <ThemedText style={[styles.jobStatusText, { color: theme.colors.success }]}>
                Complete!
              </ThemedText>
            </View>
            <Pressable onPress={() => setSelectedImage(activeJob.imageUrl)}>
              <Image
                source={{ uri: activeJob.imageUrl }}
                style={styles.jobPreviewImage}
                contentFit="cover"
              />
            </Pressable>
          </View>
        )}

        {activeJob.status === 'failed' && (
          <View style={styles.jobStatusRow}>
            <Icon name="AlertCircle" size={18} color={theme.colors.error} />
            <ThemedText style={[styles.jobStatusText, { color: theme.colors.error }]}>
              {activeJob.error || 'Generation failed'}
            </ThemedText>
          </View>
        )}
      </Animated.View>
    );
  };

  const renderGalleryItem = useCallback(
    ({ item, index }: { item: NonNullable<typeof userImages>[number]; index: number }) => {
      if (!item.imageUrl) return null;

      return (
        <Animated.View
          entering={FadeIn.delay(index * 50).duration(300)}
          style={[styles.galleryItem, { width: imageSize, height: imageSize }]}>
          <Pressable
            onPress={() => setSelectedImage(item.imageUrl)}
            style={styles.galleryItemPressable}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.galleryImage}
              contentFit="cover"
              transition={200}
            />
            <View style={styles.galleryItemOverlay}>
              <Text style={styles.galleryItemResolution}>{item.resolution}px</Text>
            </View>
          </Pressable>
        </Animated.View>
      );
    },
    [imageSize]
  );

  const leftComponent = [
    <DrawerButton key="drawer-button" />,
    <ThemedText key="title" style={styles.headerTitle}>
      Generate<Text style={styles.headerTitleAccent}>.</Text>
    </ThemedText>,
  ];

  const rightComponent = userCredits !== undefined && (
    <View style={styles.creditsContainer}>
      <Icon name="Coins" size={16} color={theme.colors.highlight} />
      <ThemedText style={styles.creditsText}>{userCredits}</ThemedText>
    </View>
  );

  return (
    <View style={styles.root}>
      <Header
        title=""
        leftComponent={leftComponent}
        rightComponents={rightComponent ? [rightComponent] : []}
      />

      <FlatList
        data={userImages ?? []}
        keyExtractor={(item) => item._id}
        numColumns={numColumns}
        contentContainerStyle={[styles.galleryContainer, { paddingBottom: insets.bottom + 280 }]}
        columnWrapperStyle={styles.galleryRow}
        renderItem={renderGalleryItem}
        ListHeaderComponent={
          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.promptInput}
                placeholder="Describe your image..."
                placeholderTextColor={theme.colors.placeholder}
                value={prompt}
                onChangeText={setPrompt}
                multiline
                maxLength={1000}
              />
              <Text style={styles.charCount}>{prompt.length}/1000</Text>
            </View>

            <View style={styles.resolutionSection}>
              <ThemedText style={styles.sectionLabel}>Resolution</ThemedText>
              <View style={styles.resolutionRow}>
                {resolutions.map((res) => (
                  <Pressable
                    key={res.value}
                    onPress={() => setResolution(res.value)}
                    style={[
                      styles.resolutionChip,
                      resolution === res.value && styles.resolutionChipSelected,
                    ]}>
                    <Text
                      style={[
                        styles.resolutionChipText,
                        resolution === res.value && styles.resolutionChipTextSelected,
                      ]}>
                      {res.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.costRow}>
              <Icon name="Sparkles" size={16} color={theme.colors.highlight} />
              <ThemedText style={styles.costText}>
                Cost: <Text style={styles.costAmount}>{COST_PER_IMAGE} credits</Text>
              </ThemedText>
            </View>

            {error && (
              <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.errorContainer}>
                <Icon name="AlertCircle" size={16} color={theme.colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </Animated.View>
            )}

            <Pressable
              onPress={handleGenerate}
              disabled={
                !prompt.trim() ||
                activeJob?.status === 'processing' ||
                activeJob?.status === 'pending'
              }
              style={({ pressed }) => [
                styles.generateButton,
                pressed && styles.generateButtonPressed,
                (!prompt.trim() ||
                  activeJob?.status === 'processing' ||
                  activeJob?.status === 'pending') &&
                  styles.generateButtonDisabled,
              ]}>
              {activeJob?.status === 'processing' || activeJob?.status === 'pending' ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Icon name="Wand2" size={20} color="white" />
                  <Text style={styles.generateButtonText}>Generate Image</Text>
                </>
              )}
            </Pressable>

            {renderJobStatus()}

            {userImages && userImages.length > 0 && (
              <View style={styles.galleryHeader}>
                <ThemedText style={styles.galleryTitle}>Your Creations</ThemedText>
                <ThemedText style={styles.galleryCount}>{userImages.length} images</ThemedText>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          !userImages ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.highlight} />
            </View>
          ) : userImages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="ImageOff" size={48} color={theme.colors.subtext} />
              <ThemedText style={styles.emptyText}>No images yet</ThemedText>
              <ThemedText style={styles.emptySubtext}>Generate your first image above!</ThemedText>
            </View>
          ) : null
        }
      />

      <Modal
        visible={!!selectedImage}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setSelectedImage(null)}>
          <View style={styles.modalContent}>
            {selectedImage && (
              <Image
                source={{ uri: selectedImage }}
                style={styles.modalImage}
                contentFit="contain"
              />
            )}
            <Pressable style={styles.modalCloseButton} onPress={() => setSelectedImage(null)}>
              <Icon name="X" size={24} color="white" />
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  headerTitle: {
    marginLeft: 16,
    fontFamily: 'Outfit_700Bold',
    fontSize: 24,
  },
  headerTitleAccent: {
    color: theme.colors.highlight,
  },
  creditsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: withOpacity(theme.colors.highlight, 0.15),
  },
  creditsText: {
    fontSize: 14,
    fontFamily: 'Outfit_700Bold',
    color: theme.colors.highlight,
  },
  formSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  promptInput: {
    minHeight: 100,
    padding: 16,
    paddingBottom: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.secondary,
    color: theme.colors.text,
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    textAlignVertical: 'top',
  },
  charCount: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    fontSize: 12,
    color: theme.colors.subtext,
  },
  resolutionSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'Outfit_700Bold',
    color: theme.colors.subtext,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  resolutionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  resolutionChip: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  resolutionChipSelected: {
    backgroundColor: withOpacity(theme.colors.highlight, 0.15),
    borderColor: theme.colors.highlight,
  },
  resolutionChipText: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: theme.colors.subtext,
  },
  resolutionChipTextSelected: {
    color: theme.colors.highlight,
    fontFamily: 'Outfit_700Bold',
  },
  costRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: withOpacity(theme.colors.highlight, 0.08),
  },
  costText: {
    fontSize: 14,
    color: theme.colors.subtext,
  },
  costAmount: {
    fontFamily: 'Outfit_700Bold',
    color: theme.colors.highlight,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: withOpacity(theme.colors.error, 0.1),
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.error,
    flex: 1,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: theme.colors.highlight,
  },
  generateButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  generateButtonDisabled: {
    opacity: 0.5,
  },
  generateButtonText: {
    fontSize: 16,
    fontFamily: 'Outfit_700Bold',
    color: 'white',
  },
  jobStatusContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: theme.colors.secondary,
  },
  jobStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  jobStatusText: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
  },
  jobCompletedContainer: {
    gap: 12,
  },
  jobPreviewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    borderCurve: 'continuous',
  },
  galleryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  galleryTitle: {
    fontSize: 18,
    fontFamily: 'Outfit_700Bold',
  },
  galleryCount: {
    fontSize: 14,
    color: theme.colors.subtext,
  },
  galleryContainer: {
    paddingHorizontal: 16,
  },
  galleryRow: {
    gap: 12,
    marginBottom: 12,
  },
  galleryItem: {
    borderRadius: 16,
    overflow: 'hidden',
    borderCurve: 'continuous',
  },
  galleryItemPressable: {
    flex: 1,
  },
  galleryImage: {
    flex: 1,
    borderRadius: 16,
    borderCurve: 'continuous',
  },
  galleryItemOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: withOpacity(palette.black, 0.5),
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  galleryItemResolution: {
    fontSize: 11,
    fontFamily: 'Outfit_400Regular',
    color: 'white',
    textAlign: 'center',
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Outfit_700Bold',
    color: theme.colors.subtext,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.subtext,
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: withOpacity(palette.black, 0.9),
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '90%',
    height: '80%',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: withOpacity(palette.white, 0.2),
    justifyContent: 'center',
    alignItems: 'center',
  },
}));
