import * as ImagePicker from 'expo-image-picker';
import { useState, useEffect, useRef } from 'react';
import { Pressable, Image, Platform, Keyboard, TouchableOpacity, View } from 'react-native';
import { TextInput, ScrollView } from 'react-native-gesture-handler';
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

import useThemeColors from '@/app/contexts/ThemeColors';
import { shadowPresets } from '@/utils/useShadow';

type ChatInputProps = {
  attachVisible?: boolean;
  setAttachVisible?: (visible: boolean) => void;
  onSendMessage?: (text: string, images?: string[]) => void;
};

export const ChatInput = (props: ChatInputProps) => {
  const colors = useThemeColors();
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
    <View style={{ paddingBottom: insets.bottom }} className="w-full px-global ">
      {selectedImages.length > 0 && (
        <View className="mb-0">
          <ScrollableImageList images={selectedImages} onRemove={removeImage} />
        </View>
      )}

      {/**add seected images here */}
      {(isAttachVisible || isAnimatingOut) && !shouldRemoveItems && (
        <View className="mb-2 w-full flex-row">
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
      <View
        style={{ ...shadowPresets.card }}
        className={` rounded-3xl  bg-light-secondary dark:bg-dark-secondary `}>
        <TextInput
          placeholder="Ask me anything..."
          placeholderTextColor={colors.text}
          className="px-6 py-5 text-black dark:text-white"
          value={inputText}
          onChangeText={setInputText}
          style={{
            height: 60,
          }}
          onContentSizeChange={handleContentSizeChange}
        />
        <View className="flex-row justify-between rounded-b-3xl bg-neutral-200/50 p-2 dark:bg-black/30">
          <View className="flex-row gap-x-2">
            <Pressable
              onPress={handleToggle}
              className="h-10 w-10 items-center justify-center rounded-full">
              <Animated.View style={iconStyle}>
                <Icon name="Plus" size={18} />
              </Animated.View>
            </Pressable>
            <Pressable className="h-10 w-10 items-center justify-center rounded-full">
              <Icon name="Globe" size={18} />
            </Pressable>
            <Pressable className="h-10 w-10 items-center justify-center rounded-full">
              <Icon name="Telescope" size={18} />
            </Pressable>
          </View>
          <View className="flex-row gap-x-2">
            <Pressable className="h-10 w-10 items-center justify-center rounded-full">
              <Icon name="Mic" size={18} />
            </Pressable>
            <Pressable
              onPress={handleSendMessage}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-dark-primary dark:bg-white">
              <Icon name="Send" size={17} color={colors.invert} />
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
    <CardScroller className="mb-1 pb-0" space={5}>
      {images.map((uri, index) => (
        <AnimatedView
          key={`${uri}-${index}`}
          animation="scaleIn"
          duration={200}
          delay={200}
          className="relative">
          <Image source={{ uri }} className="h-20 w-20 rounded-xl" />
          <Pressable
            onPress={() => onRemove(index)}
            className="absolute right-1 top-1 h-6 w-6 items-center justify-center rounded-full bg-black/50">
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
      className="mr-1"
      shouldResetAnimation>
      <TouchableOpacity
        style={{ ...shadowPresets.large }}
        className="flex-row items-center justify-center rounded-2xl bg-light-secondary p-4 dark:bg-dark-secondary"
        onPress={props.onPress}>
        <Icon name={props.icon} size={18} />
        <ThemedText className="ml-2">{props.label}</ThemedText>
      </TouchableOpacity>
    </AnimatedView>
  );
};
