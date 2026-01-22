import * as ImagePicker from 'expo-image-picker';
import { useState, useEffect, useRef } from 'react';
import { Pressable, Platform, Keyboard, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { TextInput, ScrollView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native-unistyles';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  useAnimatedKeyboard,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AnimatedView, { AnimationType } from './AnimatedView';
import { CardScroller } from './CardScroller';
import Icon, { IconName } from './Icon';
import ThemedText from './ThemedText';

import { useUnistyles } from 'react-native-unistyles';
import { palette, withOpacity } from '@/lib/unistyles';

type ChatInputProps = {
  attachVisible?: boolean;
  setAttachVisible?: (visible: boolean) => void;
  onSendMessage?: (text: string, images?: string[]) => void;
};

export const ChatInput = (props: ChatInputProps) => {
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();
  // Add internal state to handle toggle independently
  const [isAttachVisible, setIsAttachVisible] = useState(props.attachVisible || false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const rotation = useSharedValue(0);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [inputText, setInputText] = useState('');
  const [inputHeight, setInputHeight] = useState(40); // Initial height that works better
  // Add a state to track whether items should be removed after animation completes
  const [shouldRemoveItems, setShouldRemoveItems] = useState(false);

  // Maximum height corresponds to 5 lines of text (approximately)
  const MAX_INPUT_HEIGHT = 120;

  // Monitor keyboard visibility
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Keep internal state in sync with props
  useEffect(() => {
    if (props.attachVisible !== undefined) {
      setIsAttachVisible(props.attachVisible);
      // Reset shouldRemoveItems when attaching becomes visible
      if (props.attachVisible) {
        setShouldRemoveItems(false);
      }
    }
  }, [props.attachVisible]);

  // Function to handle toggling
  const handleToggle = () => {
    if (isAttachVisible) {
      // Start exit animation
      setIsAnimatingOut(true);
      // Rotate icon back to 0 degrees
      rotation.value = withTiming(0, { duration: 250 });
      // After animation completes, actually hide the component
      setTimeout(() => {
        setShouldRemoveItems(true);
        // Add a small delay before fully removing the component
        setTimeout(() => {
          setIsAttachVisible(false);
          setIsAnimatingOut(false);
          // Reset shouldRemoveItems for next time
          setShouldRemoveItems(false);
        }, 50);
      }, 300); // Animation duration + a little buffer
    } else {
      // Show immediately
      setIsAttachVisible(true);
      setIsAnimatingOut(false);
      setShouldRemoveItems(false);
      // Rotate icon to 45 degrees
      rotation.value = withTiming(135, { duration: 350 });
    }

    // Call parent handler
    props.setAttachVisible?.(!isAttachVisible);
  };

  const iconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const pickImage = async () => {
    // When Image button is clicked, add a delay before closing the menu
    setTimeout(() => {
      // Close the picker menu and animate the icon back
      setIsAnimatingOut(true);
      rotation.value = withTiming(0, { duration: 250 });

      // After animation completes, actually hide the component
      setTimeout(() => {
        setShouldRemoveItems(true);
        // Add a small delay before fully removing the component
        setTimeout(() => {
          setIsAttachVisible(false);
          setIsAnimatingOut(false);
          // Reset shouldRemoveItems for next time
          setShouldRemoveItems(false);
        }, 50);
      }, 300);

      // Call parent handler if needed
      props.setAttachVisible?.(false);
    }, 500); // Add 500ms delay before starting to hide

    // Ask for permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    // No editing, only one image at a time, in original quality
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    // If not cancelled and has assets
    if (!result.canceled && result.assets && result.assets.length > 0) {
      // Add the new image uri to the selectedImages array
      setSelectedImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setSelectedImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // Handle content size change
  const handleContentSizeChange = (event: any) => {
    const contentHeight = Math.max(
      40,
      Math.min(event.nativeEvent.contentSize.height, MAX_INPUT_HEIGHT)
    );
    setInputHeight(contentHeight);
  };

  // Handle message send
  const handleSendMessage = () => {
    if (props.onSendMessage && (inputText.trim() || selectedImages.length > 0)) {
      props.onSendMessage(inputText, selectedImages.length > 0 ? selectedImages : undefined);
      setInputText('');
      setSelectedImages([]);
    }
  };
  const { bottom } = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      {selectedImages.length > 0 && (
        <View>
          <ScrollableImageList images={selectedImages} onRemove={removeImage} />
        </View>
      )}

      {/**add seected images here */}
      {(isAttachVisible || isAnimatingOut) && !shouldRemoveItems && (
        <View style={styles.attachRow}>
          <AnimatedPickerItem
            icon="Image"
            label="Image"
            delay={0}
            isExiting={isAnimatingOut}
            onPress={pickImage}
          />

          <AnimatedPickerItem icon="Camera" label="Camera" delay={40} isExiting={isAnimatingOut} />

          <AnimatedPickerItem icon="File" label="File" delay={80} isExiting={isAnimatingOut} />
        </View>
      )}
      <View style={styles.composer}>
        <TextInput
          placeholder="Ask me anything..."
          placeholderTextColor={theme.colors.text}
          style={[styles.input, { height: 60 }]}
          value={inputText}
          onChangeText={setInputText}
          onContentSizeChange={handleContentSizeChange}
        />
        <View style={styles.toolbar}>
          <View style={styles.toolbarGroup}>
            <Pressable onPress={handleToggle} style={styles.iconButton}>
              <Animated.View style={iconStyle}>
                <Icon name="Plus" size={18} />
              </Animated.View>
            </Pressable>
            <Pressable style={styles.iconButton}>
              <Icon name="Globe" size={18} />
            </Pressable>
            <Pressable style={styles.iconButton}>
              <Icon name="Telescope" size={18} />
            </Pressable>
          </View>
          <View style={styles.toolbarGroup}>
            <Pressable style={styles.iconButton}>
              <Icon name="Mic" size={18} />
            </Pressable>
            <Pressable onPress={handleSendMessage} style={styles.sendIconButton}>
              <Icon name="Send" size={17} color={theme.colors.invert} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

const ScrollableImageList = ({
  images,
  onRemove,
}: {
  images: string[];
  onRemove: (index: number) => void;
}) => {
  return (
    <CardScroller style={styles.imageScroller} space={5}>
      {images.map((uri, index) => (
        <AnimatedView
          key={`${uri}-${index}`}
          animation="scaleIn"
          duration={200}
          delay={200}
          style={styles.imageItemContainer}>
          <Image source={{ uri }} style={styles.image} />
          <Pressable onPress={() => onRemove(index)} style={styles.removeImageButton}>
            <Icon name="X" size={12} color="white" />
          </Pressable>
        </AnimatedView>
      ))}
    </CardScroller>
  );
};

const AnimatedPickerItem = (props: {
  icon: IconName;
  label: string;
  delay: number;
  isExiting: boolean;
  onPress?: () => void;
}) => {
  const animation: AnimationType = props.isExiting ? 'slideOutBottom' : 'slideInBottom';

  return (
    <AnimatedView
      animation={animation}
      duration={350}
      delay={props.isExiting ? 0 : props.delay}
      style={styles.pickerItemWrapper}
      shouldResetAnimation>
      <TouchableOpacity style={styles.pickerItem} onPress={props.onPress}>
        <Icon name={props.icon} size={18} />
        <ThemedText style={styles.pickerItemLabel}>{props.label}</ThemedText>
      </TouchableOpacity>
    </AnimatedView>
  );
};

const styles = StyleSheet.create((theme) => ({
  root: {
    width: '100%',
    paddingHorizontal: theme.spacing.global,
  },
  attachRow: {
    marginBottom: 8,
    width: '100%',
    flexDirection: 'row',
  },
  composer: {
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    shadowOffset: { width: 0, height: 2 },
    borderRadius: 24,
    backgroundColor: theme.colors.secondary,
  },
  input: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    color: theme.colors.text,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    backgroundColor: theme.isDark
      ? withOpacity(palette.black, 0.3)
      : withOpacity(palette.neutral200, 0.5),
    padding: 8,
  },
  toolbarGroup: {
    flexDirection: 'row',
    columnGap: 8,
  },
  iconButton: {
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
  },
  sendIconButton: {
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    backgroundColor: theme.colors.text,
  },
  sendButton: {
    backgroundColor: theme.colors.text,
  },
  imageScroller: {
    marginBottom: 4,
    paddingBottom: 0,
  },
  imageItemContainer: {
    position: 'relative',
  },
  image: {
    height: 80,
    width: 80,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    right: 4,
    top: 4,
    height: 24,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    backgroundColor: withOpacity(palette.black, 0.5),
  },
  pickerItemWrapper: {
    marginRight: 4,
  },
  pickerItem: {
    elevation: 15,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10.84,
    shadowOffset: { width: 0, height: 10 },
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: theme.colors.secondary,
    padding: 16,
  },
  pickerItemLabel: {
    marginLeft: 8,
  },
}));
