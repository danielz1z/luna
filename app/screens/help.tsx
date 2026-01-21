import React from 'react';
import { View, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import AnimatedView from '@/components/ui/AnimatedView';
import { Button } from '@/components/ui/Button';
import Expandable from '@/components/ui/Expandable';
import Header from '@/components/ui/Header';
import Icon from '@/components/ui/Icon';
import ThemedText from '@/components/ui/ThemedText';
import Section from '@/components/layout/Section';

// FAQ data
const faqData = [
  {
    id: '1',
    question: 'How do I start a conversation with Luna?',
    answer:
      'Starting a conversation with Luna is easy. Simply tap on the mic icon to start voice input, or use the text input at the bottom of the screen to type your message. Luna will respond instantly to your queries.',
  },
  {
    id: '2',
    question: 'What can Luna help me with?',
    answer:
      'Luna can assist with a wide range of tasks including answering questions, providing information, generating content, suggesting ideas, translating text, explaining concepts, and having natural conversations. Just ask, and Luna will try to help!',
  },
  {
    id: '3',
    question: 'Does Luna remember our previous conversations?',
    answer:
      "Yes, Luna maintains context within the same session, so you can refer back to information from earlier in your conversation. For privacy reasons, conversations aren't stored permanently unless you explicitly save them.",
  },
  {
    id: '4',
    question: "How accurate is Luna's information?",
    answer:
      "Luna strives to provide accurate and helpful information. However, it's trained on data with a cutoff date and may not have information about very recent events. Always verify critical information from official sources.",
  },
  {
    id: '5',
    question: "Can I change Luna's voice or personality?",
    answer:
      "Yes! You can customize Luna's voice by going to Settings > AI Voice and selecting from the available options. Each voice has a unique tone and style to match your preferences.",
  },
  {
    id: '6',
    question: 'Is my conversation with Luna private?',
    answer:
      'Your privacy is important to us. Conversations with Luna are encrypted and not shared with third parties. We only store conversations temporarily to improve our service, and you can delete your conversation history at any time from Settings.',
  },
];

// Contact information
const contactInfo = [
  {
    id: 'email',
    type: 'Email',
    value: 'support@luna-ai.com',
    icon: 'Mail' as const,
    action: () => Linking.openURL('mailto:support@luna-ai.com'),
  },
  {
    id: 'phone',
    type: 'Phone',
    value: '+1 (800) 123-LUNA',
    icon: 'Phone' as const,
    action: () => Linking.openURL('tel:+18001235862'),
  },
  {
    id: 'hours',
    type: 'Support Hours',
    value: '24/7 AI Support Available',
    icon: 'Clock' as const,
    action: undefined,
  },
];

export default function HelpScreen() {
  return (
    <View style={styles.root}>
      <Header title="Help & Support" showBackButton />

      <ScrollView showsVerticalScrollIndicator={false}>
        <AnimatedView animation="fadeIn" duration={400}>
          {/* FAQ Section */}
          <Section
            title="Frequently Asked Questions"
            titleSize="xl"
            style={styles.sectionHeader}
          />

          <View style={styles.sectionBody}>
            {faqData.map((faq) => (
              <Expandable key={faq.id} title={faq.question} style={styles.expandable}>
                <ThemedText style={styles.faqAnswer}>
                  {faq.answer}
                </ThemedText>
              </Expandable>
            ))}
          </View>

          {/* Contact Section */}
          <Section
            title="Contact Us"
            titleSize="xl"
            style={styles.sectionHeaderSpaced}
            subtitle="We're here to help with any questions or concerns"
          />

          <View style={styles.contactSection}>
            {contactInfo.map((contact) => (
              <TouchableOpacity
                key={contact.id}
                onPress={contact.action}
                disabled={!contact.action}
                style={styles.contactRow}>
                <View style={styles.contactIconWrap}>
                  <Icon name={contact.icon} size={20} />
                </View>
                <View>
                  <ThemedText style={styles.contactType}>
                    {contact.type}
                  </ThemedText>
                  <ThemedText style={styles.contactValue}>{contact.value}</ThemedText>
                </View>
                {contact.action && (
                  <Icon name="ChevronRight" size={20} color={undefined} style={styles.chevron} />
                )}
              </TouchableOpacity>
            ))}

            <View style={styles.emailButtonSpacer}>
              <Button
                title="Email Us"
                iconStart="Mail"
                onPress={() => Linking.openURL('mailto:support@luna-ai.com')}
              />
            </View>
          </View>
        </AnimatedView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  sectionHeader: {
    paddingHorizontal: theme.spacing.global,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionHeaderSpaced: {
    paddingHorizontal: theme.spacing.global,
    paddingTop: 24,
    paddingBottom: 8,
    marginTop: 56,
  },
  sectionBody: {
    paddingHorizontal: theme.spacing.global,
  },
  expandable: {
    paddingVertical: 4,
  },
  faqAnswer: {
    lineHeight: 24,
    color: theme.colors.text,
  },
  contactSection: {
    paddingHorizontal: theme.spacing.global,
    paddingBottom: 32,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.secondary,
    paddingVertical: 16,
  },
  contactIconWrap: {
    marginRight: 16,
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    backgroundColor: theme.colors.secondary,
  },
  contactType: {
    fontSize: 14,
    color: theme.colors.subtext,
  },
  contactValue: {
    fontWeight: '500',
  },
  chevron: {
    marginLeft: 'auto',
    opacity: 0.6,
  },
  emailButtonSpacer: {
    marginTop: 32,
  },
}));
