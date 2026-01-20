import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button } from '@/components/Button';
import Header from '@/components/Header';
import { VoiceSelectCard } from '@/components/VoiceSelectCard';
import Section from '@/components/layout/Section';

export default function AiVoiceScreen() {
  // Add state to track which voice is selected
  const [selectedVoice, setSelectedVoice] = useState('John');

  // Function to handle selection
  const handleSelectVoice = (voiceName: string) => {
    setSelectedVoice(voiceName);
  };

  return (
    <View style={styles.root}>
      <Header showBackButton rightComponents={[<Button title="Save" />]} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Section
          title="Ai Voice"
          titleSize="3xl"
          style={styles.section}
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
        <View style={styles.voiceGrid}>
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

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.global,
  },
  section: {
    marginBottom: 32,
    paddingVertical: 32,
    paddingLeft: 12,
  },
  voiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
}));
