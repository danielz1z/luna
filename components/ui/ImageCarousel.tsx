import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  Image,
  Dimensions,
  Pressable,
  LayoutChangeEvent,
  ImageSourcePropType,
  ViewStyle,
} from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import ThemedText from '@/components/ui/ThemedText';

import { palette, withOpacity } from '@/lib/unistyles';

interface ImageCarouselProps {
  images: string[] | ImageSourcePropType[];
  width?: number;
  height?: number;
  showPagination?: boolean;
  paginationStyle?: 'dots' | 'numbers';
  onImagePress?: (index: number) => void;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  loop?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  style?: ViewStyle;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  width: propWidth,
  height = 200,
  showPagination = true,
  paginationStyle = 'dots',
  onImagePress,
  autoPlay = false,
  autoPlayInterval = 3000,
  loop = true,
  rounded = 'none',
  style,
}) => {
  const [containerWidth, setContainerWidth] = useState(propWidth || Dimensions.get('window').width);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = React.useRef<FlatList>(null);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  const roundedValue = getRoundedValue(rounded);

  const handleImageChange = (contentOffsetX: number) => {
    const index = Math.round(contentOffsetX / containerWidth);
    setActiveIndex(index);
  };

  const handleImagePress = () => {
    if (onImagePress) {
      onImagePress(activeIndex);
    }
  };

  const renderPagination = () => {
    if (!showPagination || images.length <= 1) return null;

    return (
      <View style={styles.paginationContainer}>
        {paginationStyle === 'dots' ? (
          images.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === activeIndex ? styles.dotActive : styles.dotInactive]}
            />
          ))
        ) : (
          <View style={styles.paginationBadge}>
            <ThemedText style={styles.paginationText}>
              {activeIndex + 1} / {images.length}
            </ThemedText>
          </View>
        )}
      </View>
    );
  };

  const renderItem = ({ item, index }: { item: string | ImageSourcePropType; index: number }) => (
    <Pressable onPress={handleImagePress} style={{ width: containerWidth, height }}>
      <Image
        source={typeof item === 'string' ? { uri: item } : item}
        style={[
          styles.image,
          {
            width: containerWidth,
            height,
          },
        ]}
        resizeMode="cover"
      />
    </Pressable>
  );

  return (
    <View
      style={[
        styles.container,
        { borderRadius: roundedValue },
        {
          height,
          overflow: 'hidden',
        },
        style,
      ]}
      onLayout={handleLayout}>
      <FlatList
        ref={flatListRef}
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        onMomentumScrollEnd={(e) => {
          const contentOffsetX = e.nativeEvent.contentOffset.x;
          handleImageChange(contentOffsetX);
        }}
        style={{ height }}
        contentContainerStyle={{ width: containerWidth * images.length }}
      />
      {renderPagination()}
    </View>
  );
};

const styles = StyleSheet.create(() => ({
  container: {
    position: 'relative',
  },
  image: {
    backgroundColor: palette.gray200,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 16,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    marginHorizontal: 4,
    height: 8,
    width: 8,
    borderRadius: 9999,
  },
  dotActive: {
    backgroundColor: palette.white,
  },
  dotInactive: {
    backgroundColor: withOpacity(palette.white, 0.4),
  },
  paginationBadge: {
    borderRadius: 9999,
    backgroundColor: withOpacity(palette.black, 0.5),
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  paginationText: {
    color: palette.white,
  },
}));

const getRoundedValue = (rounded: NonNullable<ImageCarouselProps['rounded']>) => {
  switch (rounded) {
    case 'none':
      return 0;
    case 'sm':
      return 2;
    case 'md':
      return 6;
    case 'lg':
      return 8;
    case 'xl':
      return 12;
    case '2xl':
      return 16;
    case 'full':
      return 9999;
    default:
      return 0;
  }
};

export default ImageCarousel;
