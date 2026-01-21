import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { useState } from 'react';
import { Pressable, TouchableOpacity, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import AnimatedView from './AnimatedView';
import Icon from './Icon';



export const AiCircle = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const toggleSpeaking = () => {
    setIsSpeaking((prev) => !prev);
  };
  return (
    <View style={styles.container}>
      <AnimatedView animation="scaleIn" duration={200} shouldResetAnimation>
        <View style={styles.circleWrapper}>
          <View style={styles.outerCircle}>
            <LinearGradient
              colors={['#D883E4', '#016BF0', '#3DE3E0', '#E57DDF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.gradientCircle}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={toggleSpeaking}
                style={styles.innerCircle}>
                <Icon name={isSpeaking ? 'Pause' : 'Mic'} size={34} strokeWidth={1.2} />
              </TouchableOpacity>
            </LinearGradient>
          </View>
          {isSpeaking && (
            <LottieView
              autoPlay
              style={styles.lottie}
              source={require('@/assets/lottie/speaking.json')}
            />
          )}
        </View>
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
  circleWrapper: {
    position: 'relative',
    height: 250,
    width: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerCircle: {
    elevation: 15,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10.84,
    shadowOffset: { width: 0, height: 10 },
    position: 'relative',
    zIndex: 9999,
    height: 140,
    width: 140,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    backgroundColor: theme.colors.secondary,
  },
  gradientCircle: {
    elevation: 15,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10.84,
    shadowOffset: { width: 0, height: 10 },
    height: 140,
    width: 140,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
  },
  innerCircle: {
    height: 120,
    width: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    backgroundColor: theme.colors.secondary,
  },
  lottie: {
    width: 250,
    height: 250,
    opacity: 0.4,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 500,
  },
}));
