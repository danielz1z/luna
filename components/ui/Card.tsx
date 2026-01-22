import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import {
  View,
  Text,
  Image,
  Pressable,
  ImageBackground,
  TouchableOpacity,
  ViewStyle,
  Dimensions,
  ImageSourcePropType,
} from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { palette } from '@/lib/unistyles';

import { Button } from './Button';
import Favorite from './Favorite';
import Icon from './Icon';
import ThemedText from './ThemedText';

import { useUnistyles } from 'react-native-unistyles';


const { width: windowWidth } = Dimensions.get('window');
interface CardProps {
  title: string;
  description?: string;
  hasShadow?: boolean;
  image: string | ImageSourcePropType;
  href?: string;
  onPress?: () => void;
  variant?: 'classic' | 'overlay' | 'compact' | 'minimal';
  className?: string;
  button?: string;
  onButtonPress?: () => void;
  price?: string;
  rating?: number;
  badge?: string;
  badgeColor?: string;
  icon?: string;
  iconColor?: string;
  imageHeight?: number;
  showOverlay?: boolean;
  hasFavorite?: boolean;
  overlayGradient?: readonly [string, string];
  width?: any;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  children?: React.ReactNode;
  style?: ViewStyle;
}

const Card: React.FC<CardProps> = ({
  title,
  description,
  image,
  hasShadow = false,
  href,
  onPress,
  variant = 'classic',
  className = 'w-full',
  button,
  onButtonPress,
  price,
  rating,
  badge,
  hasFavorite = false,
  badgeColor = '#000000',
  imageHeight = 200,
  showOverlay = true,
  overlayGradient = ['transparent', 'rgba(0,0,0,0.3)'] as readonly [string, string],
  rounded = 'lg',
  width = '100%',
  children,
  style,
  ...props
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  const getRoundedValue = () => {
    switch (rounded) {
      case 'none':
        return 0;
      case 'sm':
        return 4;
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
        return 8;
    }
  };

  const renderBadge = () => {
    if (!badge) return null;
    return (
      <View
        style={[styles.badge, { backgroundColor: badgeColor, borderRadius: getRoundedValue() }]}>
        <Text style={styles.badgeText}>{badge}</Text>
      </View>
    );
  };

  const { theme } = useUnistyles();

  const renderRating = () => {
    if (!rating) return null;
    return (
      <View style={styles.ratingContainer}>
        <MaterialIcons name="star" size={16} color={theme.colors.text} />
        <ThemedText style={styles.ratingText}>{rating}</ThemedText>
      </View>
    );
  };

  const renderPrice = () => {
    if (!price) return null;
    return (
      <ThemedText
        style={[
          styles.priceText,
          variant === 'overlay' ? styles.priceOverlay : styles.priceDefault,
        ]}>
        {price}
      </ThemedText>
    );
  };

  const renderContent = () => {
    const roundedValue = getRoundedValue();

    const cardContent = (
      <View
        style={[
          styles.cardContainer,
          { borderRadius: roundedValue },
          hasShadow && styles.cardShadow,
          style,
        ]}>
        <View style={styles.imageContainer}>
          {hasFavorite && (
            <View style={styles.favoriteContainer}>
              <Favorite initialState={false} productName={title} size={24} />
            </View>
          )}
          {variant === 'overlay' ? (
            <ImageBackground
              source={typeof image === 'string' ? { uri: image } : image}
              style={[
                styles.imageBackground,
                { height: imageHeight || 200, borderRadius: roundedValue },
              ]}>
              {showOverlay && (
                <LinearGradient colors={overlayGradient} style={styles.gradientOverlay}>
                  <View style={styles.overlayContent}>
                    <Text style={styles.overlayTitle}>{title}</Text>
                    {description && (
                      <Text numberOfLines={1} style={styles.overlayDescription}>
                        {description}
                      </Text>
                    )}
                    {(price || rating) && (
                      <View style={styles.overlayPriceRating}>
                        {renderPrice()}
                        {renderRating()}
                      </View>
                    )}
                  </View>
                </LinearGradient>
              )}
            </ImageBackground>
          ) : (
            <Image
              source={typeof image === 'string' ? { uri: image } : image}
              style={[
                styles.image,
                {
                  height: imageHeight || 200,
                  borderRadius: roundedValue,
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                },
              ]}
            />
          )}
          {renderBadge()}
        </View>

        {variant !== 'overlay' && (
          <View style={styles.contentContainer}>
            <ThemedText style={styles.title}>{title}</ThemedText>

            {description && (
              <ThemedText numberOfLines={1} style={styles.description}>
                {description}
              </ThemedText>
            )}
            {(price || rating) && (
              <View style={styles.priceRatingContainer}>
                {renderPrice()}
                {renderRating()}
              </View>
            )}
            {children}
            {button && (
              <View style={styles.buttonContainer}>
                <Button title={button} size="small" onPress={onButtonPress} />
              </View>
            )}
          </View>
        )}
      </View>
    );

    if (href) {
      return (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push(href)}
          style={[variant === 'overlay' && styles.overlayWrapper, { width }]}>
          {cardContent}
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
        style={[variant === 'overlay' && styles.overlayWrapper, { width }]}>
        {cardContent}
      </TouchableOpacity>
    );
  };

  return renderContent();
};

const styles = StyleSheet.create((theme) => ({
  cardShadow: {
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    shadowOffset: { width: 0, height: 2 },
  },
  badge: {
    position: 'absolute',
    right: 8,
    top: 8,
    zIndex: 10,
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: palette.white,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 0,
    fontSize: 12,
    fontWeight: '600',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
  },
  priceOverlay: {
    color: palette.white,
  },
  priceDefault: {
    color: theme.colors.text,
  },
  cardContainer: {
    flex: 1,
    backgroundColor: theme.colors.secondary,
  },
  imageContainer: {
    position: 'relative',
  },
  favoriteContainer: {
    position: 'absolute',
    right: 8,
    top: 8,
    zIndex: 50,
  },
  imageBackground: {
    width: '100%',
    overflow: 'hidden',
  },
  gradientOverlay: {
    position: 'relative',
    flex: 1,
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  overlayContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  overlayTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.white,
  },
  overlayDescription: {
    fontSize: 12,
    color: palette.white,
  },
  overlayPriceRating: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  image: {
    width: '100%',
  },
  contentContainer: {
    width: '100%',
    flex: 1,
    padding: 12,
  },
  title: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    fontSize: 12,
    color: palette.gray600,
  },
  priceRatingContainer: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonContainer: {
    marginTop: 12,
  },
  overlayWrapper: {
    height: 'auto',
  },
}));

export default Card;
