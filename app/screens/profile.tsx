import { View, Image, ScrollView } from 'react-native';

import AnimatedView from '@/components/AnimatedView';
import Avatar from '@/components/Avatar';
import Header, { HeaderIcon } from '@/components/Header';
import ListLink from '@/components/ListLink';
import ThemedScroller from '@/components/ThemeScroller';
import ThemedText from '@/components/ThemedText';
import { shadowPresets } from '@/utils/useShadow';

export default function ProfileScreen() {
  return (
    <AnimatedView
      className="flex-1 bg-light-primary dark:bg-dark-primary"
      animation="fadeIn"
      duration={350}
      playOnlyOnce={false}>
      <Header showBackButton title="Profile" />
      <ThemedScroller className="px-6">
        <View className=" w-full pb-10 pt-10">
          <View className="mb-4 flex-row items-center">
            <View className="ml-4 flex-1">
              <ThemedText className="text-2xl font-bold">John Doe</ThemedText>
              <View className="flex flex-row items-center">
                <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                  johndoe@gmail.com
                </ThemedText>
              </View>
            </View>
            <Avatar src={require('@/assets/img/user-4.jpg')} size="md" />
          </View>
        </View>

        <View
          style={shadowPresets.medium}
          className="rounded-2xl bg-light-secondary dark:bg-dark-secondary/50  ">
          <ListLink
            className="px-5"
            hasBorder
            title="Settings"
            icon="Settings"
            href="/screens/edit-profile"
          />
          <ListLink
            className="px-5"
            hasBorder
            title="Upgrade to plus"
            icon="MapPin"
            href="/screens/subscription"
          />
          <ListLink
            className="px-5"
            hasBorder
            title="Ai Voice"
            icon="MicVocal"
            href="/screens/ai-voice"
          />
          <ListLink
            className="px-5"
            hasBorder
            title="Help"
            icon="HelpCircle"
            href="/screens/help"
          />
          <ListLink className="px-5" title="Logout" icon="LogOut" href="/screens/welcome" />
        </View>
      </ThemedScroller>
    </AnimatedView>
  );
}
