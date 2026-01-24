import { Link, router } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import { View, Pressable, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import { useUnistyles } from 'react-native-unistyles';
import { CardScroller } from '@/components/ui/CardScroller';
import { Chip } from '@/components/ui/Chip';
import Icon from '@/components/ui/Icon';
import ThemedScroller from '@/components/ui/ThemeScroller';
import ThemedText from '@/components/ui/ThemedText';

type SearchCategory = 'top-picks' | 'featured' | 'trending' | 'productivity' | 'education';

const SearchScreen = () => {
  const { theme } = useUnistyles();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<SearchCategory>('top-picks');
  const inputRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();

  const aiModels = [
    {
      id: 1,
      name: 'GPT-4 Turbo',
      creator: 'OpenAI',
      description: 'Most advanced reasoning with extended context window',
      image: require('@/assets/img/logo-1.png'),
      category: 'top-picks',
    },
    {
      id: 2,
      name: 'Claude 3 Opus',
      creator: 'Anthropic',
      description: 'High-performance vision and reasoning capabilities',
      image: require('@/assets/img/logo-2.png'),
      category: 'featured',
    },
    {
      id: 3,
      name: 'Gemini Pro',
      creator: 'Google',
      description: 'Multimodal AI for creative and technical tasks',
      image: require('@/assets/img/logo-3.png'),
      category: 'trending',
    },
    {
      id: 4,
      name: 'Midjourney',
      creator: 'Midjourney Inc',
      description: 'Text-to-image generation with artistic quality',
      image: require('@/assets/img/logo-4.png'),
      category: 'top-picks',
    },
    {
      id: 5,
      name: 'GitHub Copilot',
      creator: 'Microsoft',
      description: 'AI pair programmer for code completion',
      image: require('@/assets/img/logo-5.png'),
      category: 'productivity',
    },
    {
      id: 6,
      name: 'Perplexity',
      creator: 'Perplexity AI',
      description: 'Real-time knowledge search with citations',
      image: require('@/assets/img/logo-2.png'),
      category: 'education',
    },
    {
      id: 7,
      name: 'DALL-E 3',
      creator: 'OpenAI',
      description: 'Photorealistic image generation from text',
      image: require('@/assets/img/logo-1.png'),
      category: 'trending',
    },
    {
      id: 8,
      name: 'Whisper',
      creator: 'OpenAI',
      description: 'Speech recognition with multilingual support',
      image: require('@/assets/img/logo-3.png'),
      category: 'productivity',
    },
    {
      id: 9,
      name: 'Duolingo Max',
      creator: 'Duolingo',
      description: 'AI-powered language learning assistant',
      image: require('@/assets/img/logo-4.png'),
      category: 'education',
    },
  ];

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  const filterData = (data: any[]) => {
    if (!searchQuery) return data;
    return data.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getFilteredResults = () => {
    const filteredModels = filterData(aiModels);
    return filteredModels.filter(
      (model) => category === 'top-picks' || model.category === category
    );
  };

  const results = getFilteredResults();

  return (
    <>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View
          style={{
            elevation: 10,
            shadowColor: '#000',
            shadowOpacity: 0.15,
            shadowRadius: 6.84,
            shadowOffset: { width: 0, height: 4 },
          }}>
          <View style={styles.searchBar}>
            <Icon
              name="ArrowLeft"
              onPress={() => router.back()}
              style={styles.backIcon}
              size={20}
            />

            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Search AI models..."
              placeholderTextColor={theme.colors.placeholder}
              onChangeText={setSearchQuery}
              value={searchQuery}
              returnKeyType="done"
              autoFocus={false}
            />

            {searchQuery.length > 0 && (
              <Pressable
                onPress={() => {
                  setSearchQuery('');
                  inputRef.current?.focus();
                }}
                style={styles.clearButton}>
                <Icon name="X" size={20} />
              </Pressable>
            )}
          </View>
        </View>

        <CardScroller style={styles.chipScroller} space={5}>
          <Chip
            label="Top Picks"
            isSelected={category === 'top-picks'}
            onPress={() => setCategory('top-picks')}
          />
          <Chip
            label="Featured"
            isSelected={category === 'featured'}
            onPress={() => setCategory('featured')}
          />
          <Chip
            label="Trending"
            isSelected={category === 'trending'}
            onPress={() => setCategory('trending')}
          />
          <Chip
            label="Productivity"
            isSelected={category === 'productivity'}
            onPress={() => setCategory('productivity')}
          />
          <Chip
            label="Education"
            isSelected={category === 'education'}
            onPress={() => setCategory('education')}
          />
        </CardScroller>
      </View>

      <ThemedScroller keyboardShouldPersistTaps="handled">
        <View style={styles.resultsWrap}>
          {results.length > 0 ? (
            results.map((item) => (
              <Link key={item.id} href="/screens/provider" asChild>
                <Pressable style={styles.resultRow}>
                  <View style={styles.resultIconWrap}>
                    <Image source={item.image} style={styles.resultIcon} />
                  </View>
                  <View style={styles.flex1}>
                    <ThemedText style={styles.resultName}>{item.name}</ThemedText>
                    <ThemedText style={styles.resultDescription} numberOfLines={1}>
                      {item.description}
                    </ThemedText>
                    <ThemedText style={styles.resultCreator}>by {item.creator}</ThemedText>
                  </View>
                </Pressable>
              </Link>
            ))
          ) : (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyTitle}>No results found</ThemedText>
              <ThemedText style={styles.emptySubtitle}>
                Try different keywords or categories
              </ThemedText>
            </View>
          )}
        </View>
      </ThemedScroller>
    </>
  );
};

export default SearchScreen;

const styles = StyleSheet.create((theme) => ({
  header: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.global,
  },
  searchBar: {
    position: 'relative',
    borderRadius: 9999,
    backgroundColor: theme.colors.primary,
  },
  backIcon: {
    position: 'absolute',
    left: 6,
    top: 6,
    zIndex: 50,
  },
  input: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingLeft: 40,
    paddingRight: 12,
    color: theme.colors.text,
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 50,
    opacity: 0.5,
  },
  chipScroller: {
    marginTop: 8,
  },
  resultsWrap: {
    marginBottom: 16,
    padding: theme.spacing.global,
  },
  resultRow: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 8,
  },
  resultIconWrap: {
    marginRight: 20,
    height: 56,
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: theme.colors.secondary,
  },
  resultIcon: {
    height: 32,
    width: 32,
  },
  flex1: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontFamily: theme.fonts.bold,
  },
  resultDescription: {
    marginBottom: 4,
    fontSize: 14,
  },
  resultCreator: {
    fontSize: 14,
    color: theme.colors.subtext,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 18,
    fontFamily: theme.fonts.bold,
  },
  emptySubtitle: {
    textAlign: 'center',
    color: theme.colors.subtext,
  },
}));
