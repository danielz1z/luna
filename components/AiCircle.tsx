import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { useState } from 'react';
import { Pressable, TouchableOpacity, View } from 'react-native';

import AnimatedView from './AnimatedView';
import Icon from './Icon';

import { shadowPresets } from '@/utils/useShadow';

export const AiCircle = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const toggleSpeaking = () => {
    setIsSpeaking((prev) => !prev);
  };
  return (
    <View className="flex-1 items-center justify-center">
      <AnimatedView animation="scaleIn" duration={200} shouldResetAnimation>
        <View
          //activeOpacity={0.5}
          className="relative h-[250px] w-[250px] items-center justify-center">
          <View
            style={shadowPresets.large}
            className="relative z-[9999] h-[140px] w-[140px] items-center justify-center rounded-full bg-light-secondary dark:bg-dark-primary">
            <LinearGradient
              colors={['#D883E4', '#016BF0', '#3DE3E0', '#E57DDF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              className="h-[140px] w-[140px] items-center justify-center rounded-full"
              style={{ ...shadowPresets.large }}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={toggleSpeaking}
                className="h-[120px] w-[120px] items-center justify-center rounded-full bg-light-secondary dark:bg-dark-primary">
                <Icon name={isSpeaking ? 'Pause' : 'Mic'} size={34} strokeWidth={1.2} />
              </TouchableOpacity>
            </LinearGradient>
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
        </View>
      </AnimatedView>
    </View>
  );
};
