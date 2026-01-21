import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link } from 'expo-router';
import { View, Text, TouchableOpacity, Dimensions, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { StyleSheet } from 'react-native-unistyles';

import ImageCarousel from './ImageCarousel';
import ThemedText from './ThemedText';

import useThemeColors from '@/app/contexts/ThemeColors';

const windowWidth = Dimensions.get('window').width;

interface SliderCardProps {
  title: string;
  description?: string;
  image: string | string[];
  href: string;
  className?: string;
  button?: string;
  rating?: string;
  distance?: any;
  price?: string;
}

const SliderCard = ({
  title,
  description,
  image,
  href,
  rating,
  distance,
  price,
  className = '',
  ...props
}: SliderCardProps) => {
  const colors = useThemeColors();
  const images = Array.isArray(image) ? image : [image];

  return (
    <View style={styles.container} {...props}>
      <View style={styles.carouselWrapper}>
        <ImageCarousel
          images={images}
          height={300}
          //width={windowWidth - 32}
          rounded="xl"
          style={styles.carousel}
        />
      </View>
      <Link href={href} asChild>
        <TouchableOpacity>
          <View style={styles.headerRow}>
            <ThemedText style={styles.title}>{title}</ThemedText>
            {rating && (
              <View style={styles.ratingRow}>
                <MaterialIcons name="star" size={18} color={colors.text} />
                <ThemedText style={styles.ratingText}>{rating}</ThemedText>
              </View>
            )}
          </View>
          <Text style={styles.distanceText}>{distance} miles away</Text>
          <ThemedText style={styles.priceText}>
            {price} <ThemedText style={styles.priceUnit}>night</ThemedText>
          </ThemedText>
        </TouchableOpacity>
      </Link>
    </View>
  );
};

export default SliderCard;

const styles = StyleSheet.create((theme) => ({
  container: {
    marginBottom: 0,
    width: '100%',
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.global,
  },
  carouselWrapper: {
    position: 'relative',
    width: '100%',
  },
  carousel: {
    borderRadius: 16,
  },
  headerRow: {
    marginTop: 8,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 1,
    fontSize: 16,
  },
  distanceText: {
    fontSize: 14,
    color: theme.colors.subtext,
  },
  priceText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '700',
  },
  priceUnit: {
    fontWeight: '400',
  },
}));
