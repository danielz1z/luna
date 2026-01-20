import LottieView from 'lottie-react-native';
import { useState } from 'react';
import { Pressable, TouchableOpacity, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import AnimatedView from './AnimatedView';

import { shadowPresets } from '@/utils/useShadow';

export const Sphere = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const toggleSpeaking = () => {
    setIsSpeaking((prev) => !prev);
  };
  return (
    <View style={styles.container}>
      <AnimatedView animation="scaleIn" duration={200} shouldResetAnimation>
        <TouchableOpacity
          //activeOpacity={0.5}
          style={styles.touchTarget}
          onPress={toggleSpeaking}>
          <View
            style={[shadowPresets.large, styles.sphere]}>
            <LottieView
              autoPlay
              style={{
                width: 250,
                height: 250,
                position: 'relative',
                zIndex: 1000,
              }}
              source={require('@/assets/lottie/sphere.json')}
            />
          </View>
          {isSpeaking && (
            <LottieView
              autoPlay
              style={{
                width: 250,
                height: 250,
                opacity: 0.4,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 500,
              }}
              source={require('@/assets/lottie/speaking.json')}
            />
          )}
        </TouchableOpacity>
      </AnimatedView>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchTarget: {
    position: 'relative',
    height: 250,
    width: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sphere: {
    position: 'relative',
    zIndex: 9999,
    height: 140,
    width: 140,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    backgroundColor: theme.colors.invert,
  },
}));
