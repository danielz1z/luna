import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import AnimatedView from '@/components/AnimatedView';
import Avatar from '@/components/Avatar';
import Header from '@/components/Header';
import ListLink from '@/components/ListLink';
import ThemedScroller from '@/components/ThemeScroller';
import ThemedText from '@/components/ThemedText';
import { shadowPresets } from '@/utils/useShadow';

export default function ProfileScreen() {
  return (
    <AnimatedView
      style={styles.root}
      animation="fadeIn"
      duration={350}
      playOnlyOnce={false}>
      <Header showBackButton title="Profile" />
      <ThemedScroller>
        <View style={styles.headerSection}>
          <View style={styles.profileRow}>
            <View style={styles.profileInfo}>
              <ThemedText style={styles.name}>John Doe</ThemedText>
              <View style={styles.emailRow}>
                <ThemedText style={styles.email}>johndoe@gmail.com</ThemedText>
              </View>
            </View>
            <Avatar src={require('@/assets/img/user-4.jpg')} size="md" />
          </View>
        </View>

        <View
          style={[shadowPresets.medium, styles.card]}
        >
          <ListLink
            style={styles.listLink}
            hasBorder
            title="Settings"
            icon="Settings"
            href="/screens/edit-profile"
          />
          <ListLink
            style={styles.listLink}
            hasBorder
            title="Upgrade to plus"
            icon="MapPin"
            href="/screens/subscription"
          />
          <ListLink
            style={styles.listLink}
            hasBorder
            title="Ai Voice"
            icon="MicVocal"
            href="/screens/ai-voice"
          />
          <ListLink
            style={styles.listLink}
            hasBorder
            title="Help"
            icon="HelpCircle"
            href="/screens/help"
          />
          <ListLink
            style={styles.listLink}
            title="Logout"
            icon="LogOut"
            href="/screens/welcome"
          />
        </View>
      </ThemedScroller>
    </AnimatedView>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  headerSection: {
    width: '100%',
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: theme.spacing.global,
  },
  profileRow: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontFamily: theme.fonts.bold,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  email: {
    fontSize: 14,
    color: theme.colors.subtext,
  },
  card: {
    borderRadius: 16,
    backgroundColor: theme.colors.secondary,
    marginHorizontal: theme.spacing.global,
  },
  listLink: {
    paddingHorizontal: 20,
  },
}));
