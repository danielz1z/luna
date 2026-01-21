import React from 'react';
import { View, Animated, Easing, Dimensions } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import useThemeColors from '@/app/contexts/ThemeColors';

const windowWidth = Dimensions.get('window').width;

type SkeletonVariant = 'list' | 'grid' | 'article' | 'chat';

interface SkeletonLoaderProps {
  variant: SkeletonVariant;
  count?: number;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ variant, count = 1, className = '' }) => {
  const colors = useThemeColors();
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: false,
        }),
      ])
    ).start();

    return () => {
      animatedValue.stopAnimation();
    };
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const renderListItem = () => (
    <View style={styles.listRow}>
      <Animated.View
        style={[styles.avatar, { opacity, backgroundColor: colors.secondary }]}
      />
      <View style={styles.listTextContainer}>
        <Animated.View
          style={[styles.listLine1, { opacity, backgroundColor: colors.secondary }]}
        />
        <Animated.View
          style={[styles.listLine2, { opacity, backgroundColor: colors.secondary }]}
        />
      </View>
    </View>
  );

  const renderGridItem = () => (
    <View style={styles.gridItem}>
      <Animated.View
        style={[styles.gridSquare, { opacity, backgroundColor: colors.secondary }]}
      />
      <Animated.View
        style={[styles.gridLine1, { opacity, backgroundColor: colors.secondary }]}
      />
      <Animated.View
        style={[styles.gridLine2, { opacity, backgroundColor: colors.secondary }]}
      />
    </View>
  );

  const renderArticle = () => (
    <View style={styles.articleContainer}>
      <Animated.View
        style={[
          styles.articleImage,
          { opacity, backgroundColor: colors.secondary },
        ]}
      />
      <View style={styles.articleContent}>
        <Animated.View
          style={[styles.articleTitle, { opacity, backgroundColor: colors.secondary }]}
        />
        <Animated.View
          style={[styles.articleSubtitle, { opacity, backgroundColor: colors.secondary }]}
        />
        <Animated.View
          style={[styles.articleLine, { opacity, backgroundColor: colors.secondary }]}
        />
        <Animated.View
          style={[styles.articleLine, { opacity, backgroundColor: colors.secondary }]}
        />
        <Animated.View
          style={[styles.articleLineLast, { opacity, backgroundColor: colors.secondary }]}
        />
      </View>
    </View>
  );

  const renderChat = () => (
    <View style={styles.chatContainer}>
      <View style={styles.chatRowLeft}>
        <View style={styles.chatBubbleWrapperWide}>
          <Animated.View
            style={[styles.chatBubbleSmall, { opacity, backgroundColor: colors.secondary }]}
          />
        </View>
      </View>
      <View style={styles.chatRowRight}>
        <View style={styles.chatBubbleWrapperWide}>
          <Animated.View
            style={[styles.chatBubbleLarge, { opacity, backgroundColor: colors.secondary }]}
          />
        </View>
      </View>
      <View style={styles.chatRowLeft}>
        <View style={styles.chatBubbleWrapperNarrow}>
          <Animated.View
            style={[styles.chatBubbleSmall, { opacity, backgroundColor: colors.secondary }]}
          />
        </View>
      </View>
    </View>
  );

  const renderContent = () => {
    switch (variant) {
      case 'list':
        return Array(count)
          .fill(null)
          .map((_, index) => <React.Fragment key={index}>{renderListItem()}</React.Fragment>);
      case 'grid':
        return (
          <View style={styles.gridWrap}>
            {Array(count)
              .fill(null)
              .map((_, index) => (
                <React.Fragment key={index}>{renderGridItem()}</React.Fragment>
              ))}
          </View>
        );
      case 'article':
        return renderArticle();
      case 'chat':
        return renderChat();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderContent()}
    </View>
  );
};

export default SkeletonLoader;

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },

  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  avatar: {
    height: 64,
    width: 64,
    borderRadius: 8,
  },
  listTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  listLine1: {
    marginBottom: 8,
    height: 20,
    width: '75%',
    borderRadius: 6,
  },
  listLine2: {
    height: 16,
    width: '50%',
    borderRadius: 6,
  },

  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '50%',
    padding: 8,
  },
  gridSquare: {
    marginBottom: 8,
    aspectRatio: 1,
    borderRadius: 8,
  },
  gridLine1: {
    marginBottom: 4,
    height: 16,
    width: '75%',
    borderRadius: 6,
  },
  gridLine2: {
    height: 16,
    width: '50%',
    borderRadius: 6,
  },

  articleContainer: {
    flex: 1,
  },
  articleImage: {
    width: windowWidth,
    height: windowWidth,
  },
  articleContent: {
    flex: 1,
    padding: 16,
  },
  articleTitle: {
    marginBottom: 16,
    height: 32,
    width: '75%',
    borderRadius: 6,
  },
  articleSubtitle: {
    marginBottom: 16,
    height: 24,
    width: '50%',
    borderRadius: 6,
  },
  articleLine: {
    marginBottom: 8,
    height: 16,
    width: '100%',
    borderRadius: 6,
  },
  articleLineLast: {
    height: 16,
    width: '75%',
    borderRadius: 6,
  },

  chatContainer: {
    padding: 16,
  },
  chatRowLeft: {
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  chatRowRight: {
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  chatBubbleWrapperWide: {
    width: '75%',
  },
  chatBubbleWrapperNarrow: {
    width: '50%',
  },
  chatBubbleSmall: {
    height: 48,
    borderRadius: 16,
  },
  chatBubbleLarge: {
    height: 64,
    borderRadius: 16,
  },
}));
