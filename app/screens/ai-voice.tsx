import LottieView from 'lottie-react-native';
import React, { useState, useRef } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  Text,
  Dimensions,
  Pressable,
  Animated,
  Easing,
} from 'react-native';

import useThemeColors from '../contexts/ThemeColors';

import { Button } from '@/components/Button';
import Header from '@/components/Header';
import Icon from '@/components/Icon';
import { VoiceSelectCard } from '@/components/VoiceSelectCard';
import Section from '@/components/layout/Section';
import { shadowPresets } from '@/utils/useShadow';

// Add type for VoiceItem props
type VoiceItemProps = {
  name: string;
  description: string;
  isSelected: boolean;
  onSelect: (name: string) => void;
};

export default function AiVoiceScreen() {
  // Add state to track which voice is selected
  const [selectedVoice, setSelectedVoice] = useState('John');

  // Function to handle selection
  const handleSelectVoice = (voiceName: string) => {
    setSelectedVoice(voiceName);
  };

  return (
    <View className="flex-1 bg-light-primary dark:bg-dark-primary">
      <Header showBackButton rightComponents={[<Button title="Save" />]} />

      <ScrollView className="flex-1 px-global">
        <Section
          title="Ai Voice"
          titleSize="3xl"
          className="mb-8 py-8 pl-3"
          subtitle="Pick the voice that matches your style"
        />
        {/*<VoiceItem 
          isSelected={selectedVoice === "John"} 
          name="John" 
          description="Deep and rich tone" 
          onSelect={handleSelectVoice}
        />
        <VoiceItem 
          isSelected={selectedVoice === "Jessica"} 
          name="Jessica" 
          description="Friendly and warm" 
          onSelect={handleSelectVoice}
        />
        <VoiceItem 
          isSelected={selectedVoice === "Larry"} 
          name="Larry" 
          description="British gentleman" 
          onSelect={handleSelectVoice}
        />
        <VoiceItem 
          isSelected={selectedVoice === "Monday"} 
          name="Monday" 
          description="Always annoyed" 
          onSelect={handleSelectVoice}
        />
        <VoiceItem 
          isSelected={selectedVoice === "Tomas"} 
          name="Tomas" 
          description="Chill and relaxed" 
          onSelect={handleSelectVoice}
        />
        <VoiceItem 
          isSelected={selectedVoice === "Jerry"} 
          name="Jerry" 
          description="Sarcastic and funny" 
          onSelect={handleSelectVoice}
        />
        <VoiceItem 
          isSelected={selectedVoice === "Amanda"}
          name="Amanda"
          description="Confident and strong"
          onSelect={handleSelectVoice}        />*/}
        <View className="flex flex-row flex-wrap ">
          <VoiceSelectCard
            isSelected={selectedVoice === 'John'}
            name="John"
            description="Deep and rich tone"
            onSelect={handleSelectVoice}
          />
          <VoiceSelectCard
            isSelected={selectedVoice === 'Jessica'}
            name="Jessica"
            description="Friendly and warm"
            onSelect={handleSelectVoice}
          />
          <VoiceSelectCard
            isSelected={selectedVoice === 'Larry'}
            name="Larry"
            description="British gentleman"
            onSelect={handleSelectVoice}
          />
          <VoiceSelectCard
            isSelected={selectedVoice === 'Monday'}
            name="Monday"
            description="Always annoyed"
            onSelect={handleSelectVoice}
          />
          <VoiceSelectCard
            isSelected={selectedVoice === 'Tomas'}
            name="Tomas"
            description="Chill and relaxed"
            onSelect={handleSelectVoice}
          />
          <VoiceSelectCard
            isSelected={selectedVoice === 'Jerry'}
            name="Jerry"
            description="Sarcastic and funny"
            onSelect={handleSelectVoice}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const VoiceItem = (props: VoiceItemProps) => {
  const colors = useThemeColors();
  const [isVisible, setIsVisible] = useState(true);
  const slideAnim = useRef(new Animated.Value(-80)).current;
  const isSelected = props.isSelected;

  const toggleVisibility = () => {
    const toValue = isVisible ? -20 : -80;
    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false,
    }).start();
    setIsVisible(!isVisible);
  };

  // Function to handle the "Use" button click
  const handleUse = () => {
    props.onSelect(props.name);
  };

  return (
    <View className="relative mb-3">
      <Pressable
        className={`relative z-50 w-full flex-row items-center rounded-2xl p-global ${props.isSelected ? 'bg-teal-300' : 'bg-light-secondary dark:bg-dark-secondary'}`}
        onPress={toggleVisibility}
        style={{ ...shadowPresets.card }}>
        <View>
          <Text
            className={`font-outfit-bold text-xl ${props.isSelected ? 'text-black dark:text-black' : 'text-black dark:text-white'}`}>
            {props.name}
          </Text>
          <Text
            className={`text-sm opacity-70 ${props.isSelected ? 'text-black dark:text-black' : 'text-black dark:text-white'}`}>
            {props.description}
          </Text>
        </View>
        <View className="ml-auto items-center justify-center">
          <Icon
            name={isVisible ? 'Play' : 'Pause'}
            size={20}
            color={isSelected ? colors.invert : colors.icon}
          />
        </View>
      </Pressable>
      <Animated.View
        style={{ marginTop: slideAnim }}
        className="relative w-full flex-row items-end overflow-hidden rounded-2xl bg-light-secondary px-0 pb-3 pt-8 dark:bg-dark-darker">
        <LottieView
          autoPlay
          style={{
            width: '80%',
            height: 45,
            position: 'absolute',
            left: -5,
            bottom: 5,
            zIndex: 40,
          }}
          source={require('@/assets/lottie/waves.json')}
        />
        <View className="relative z-50 w-full flex-row items-center justify-end pr-global">
          <Button
            title="Use"
            size="small"
            className="bg-dark-primary dark:bg-light-primary"
            textClassName="text-white dark:text-black"
            variant="secondary"
            onPress={handleUse}
          />
        </View>
      </Animated.View>
    </View>
  );
};
