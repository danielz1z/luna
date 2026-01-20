import React from 'react';
import { View, Image } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button } from '@/components/Button';
import Header from '@/components/Header';
import ShowRating from '@/components/ShowRating';
import ThemeFooter from '@/components/ThemeFooter';
import ThemedScroller from '@/components/ThemeScroller';
import ThemedText from '@/components/ThemedText';
const ProviderScreen = () => {
  return (
    <>
      <Header showBackButton />
      <ThemedScroller>
        <View style={styles.hero}>
          <View style={styles.logoWrap}>
            <Image source={require('@/assets/img/logo-3.png')} style={styles.logo} />
          </View>
          <ThemedText style={styles.title}>Gemini Pro</ThemedText>
          <ThemedText style={styles.subtext}>by Google</ThemedText>
          <ThemedText style={styles.description}>
            Multimodal AI for creative and technical tasks. Lorem ipsum dolor sit amet consectetur
            adipisicing elit. Quisquam, quos.
          </ThemedText>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statsCell}>
            <ShowRating rating={4.5} size="lg" />
            <ThemedText style={[styles.subtext, styles.mt1]}>1k+ Reviews</ThemedText>
          </View>
          <View style={styles.statsCell}>
            <ThemedText style={styles.statsValue}>#1</ThemedText>
            <ThemedText style={[styles.subtext, styles.mt1]}>in Lifestyle</ThemedText>
          </View>
          <View style={styles.statsCell}>
            <ThemedText style={styles.statsValue}>5M+</ThemedText>
            <ThemedText style={[styles.subtext, styles.mt1]}>Conversations</ThemedText>
          </View>
        </View>
        <ThemedText style={styles.ratingsTitle}>Ratings</ThemedText>
        <RatingProgress rating={5} progress={75} />
        <RatingProgress rating={4} progress={25} />
        <RatingProgress rating={3} progress={10} />
        <RatingProgress rating={2} progress={15} />
        <RatingProgress rating={1} progress={10} />
      </ThemedScroller>
      <ThemeFooter>
        <Button title="Chat" variant="primary" rounded="full" />
      </ThemeFooter>
    </>
  );
};

const RatingProgress = (props: any) => {
  return (
    <View style={styles.ratingRow}>
      <ShowRating rating={props.rating} size="md" />
      <View style={styles.ratingTrack}>
        <View
          style={[styles.ratingFill, { width: `${props.progress}%` }]}
        />
      </View>
    </View>
  );
};

export default ProviderScreen;

const styles = StyleSheet.create((theme) => ({
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    padding: 24,
  },
  logoWrap: {
    marginBottom: 16,
    height: 96,
    width: 96,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: theme.colors.secondary,
  },
  logo: {
    height: 56,
    width: 56,
  },
  title: {
    fontSize: 24,
    fontFamily: theme.fonts.bold,
  },
  subtext: {
    fontSize: 14,
    color: theme.colors.subtext,
  },
  description: {
    marginVertical: 16,
    textAlign: 'center',
    fontSize: 16,
  },
  statsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 28,
  },
  statsCell: {
    flex: 1,
    alignItems: 'center',
  },
  statsValue: {
    fontSize: 18,
    fontFamily: theme.fonts.bold,
  },
  mt1: {
    marginTop: 4,
  },
  ratingsTitle: {
    marginVertical: 16,
    fontSize: 18,
    fontFamily: theme.fonts.bold,
  },
  ratingRow: {
    marginVertical: 8,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingTrack: {
    marginLeft: 16,
    height: 4,
    flex: 1,
    borderRadius: 9999,
    backgroundColor: theme.colors.border,
    overflow: 'hidden',
  },
  ratingFill: {
    height: 4,
    borderRadius: 9999,
    backgroundColor: theme.colors.text,
  },
}));
