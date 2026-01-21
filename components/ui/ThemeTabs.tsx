import React, { useState, useRef, ReactNode, useEffect } from 'react';
import {
  View,
  ScrollView,
  Animated,
  Dimensions,
  TouchableOpacity,
  ViewStyle,
  BackHandler,
} from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { withOpacity } from '@/lib/unistyles';

import AnimatedView from './AnimatedView';
import ThemedText from './ThemedText';

type ThemeTabsProps = {
  children: ReactNode;
  headerComponent?: ReactNode;
  footerComponent?: ReactNode;
  type?: 'scrollview' | 'fixed';
  className?: string;
  style?: ViewStyle;
  scrollEnabled?: boolean;
};

type ThemeTabProps = {
  name: string;
  children: ReactNode;
  type?: 'scrollview' | 'flatlist' | 'view';
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ThemeTab: React.FC<ThemeTabProps> = ({ children }) => {
  return <View style={{ width: SCREEN_WIDTH, height: '100%' }}>{children}</View>;
};

const ThemeTabs: React.FC<ThemeTabsProps> = ({
  children,
  headerComponent,
  footerComponent,
  style,
  type = 'fixed',
  scrollEnabled = true,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const tabContentRef = useRef<ScrollView>(null);
  const mainScrollRef = useRef<ScrollView>(null);

  // Add back button handler
  {
    /*useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (activeTab > 0) {
                handleTabPress(activeTab - 1);
                return true; // Prevent default back action
            }
            return false; // Allow default back action
        });

        return () => backHandler.remove();
    }, [activeTab]);*/
  }

  // Filter out only ThemeTab components from children
  const tabs = React.Children.toArray(children).filter(
    (child): child is React.ReactElement<ThemeTabProps> =>
      React.isValidElement(child) && child.type === ThemeTab
  );

  const handleTabPress = (index: number) => {
    setActiveTab(index);
    tabContentRef.current?.scrollTo({
      x: index * SCREEN_WIDTH,
      animated: true,
    });
  };

  const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
    useNativeDriver: false,
  });

  const handleScrollEnd = (event: any) => {
    const position = event.nativeEvent.contentOffset.x;
    const index = Math.round(position / SCREEN_WIDTH);
    setActiveTab(index);
  };

  // Calculate sticky header indices correctly based on whether headerComponent exists
  const stickyHeaderIndices = headerComponent ? [1] : [0];

  return (
    <View style={styles.container}>
      <ScrollView
        ref={mainScrollRef}
        stickyHeaderIndices={stickyHeaderIndices}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        style={styles.mainScroll}>
        {/* Header Component - Will scroll up */}
        {headerComponent && <View>{headerComponent}</View>}

        {/* Tab Bar - This will be sticky */}
        <View style={styles.tabBarWrapper}>
          {type === 'scrollview' ? (
            <ScrollView
              showsHorizontalScrollIndicator={false}
              horizontal
              style={styles.tabBarScroll}>
              {tabs.map((tab, index) => {
                if (!React.isValidElement(tab)) return null;
                return (
                  <Animated.View key={index}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={styles.tabButton}
                      onPress={() => handleTabPress(index)}>
                      <ThemedText
                        style={[styles.tabText, activeTab === index && styles.tabTextActive]}>
                        {tab.props.name}
                      </ThemedText>
                      {activeTab === index && <View style={styles.tabIndicator} />}
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </ScrollView>
          ) : (
            <View style={styles.tabBarFixed}>
              {tabs.map((tab, index) => {
                if (!React.isValidElement(tab)) return null;
                return (
                  <Animated.View key={index} style={styles.tabButtonWrapper}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={styles.tabButtonFixed}
                      onPress={() => handleTabPress(index)}>
                      <ThemedText
                        style={[styles.tabText, activeTab === index && styles.tabTextActive]}>
                        {tab.props.name}
                      </ThemedText>
                      {activeTab === index && <View style={styles.tabIndicator} />}
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          )}
        </View>

        {/* Tab Content - Horizontal scrollable area */}
        <View style={styles.tabContent}>
          {scrollEnabled ? (
            <ScrollView
              ref={tabContentRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              onMomentumScrollEnd={handleScrollEnd}
              style={styles.tabContentScroll}
              scrollEnabled={scrollEnabled}>
              {tabs}
            </ScrollView>
          ) : (
            <AnimatedView
              key={activeTab}
              duration={600}
              animation="fadeIn"
              style={[styles.tabContentFixed, { width: SCREEN_WIDTH }]}>
              {tabs[activeTab]}
            </AnimatedView>
          )}
        </View>

        {footerComponent && <View>{footerComponent}</View>}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  mainScroll: {
    flex: 1,
  },
  tabBarWrapper: {
    zIndex: 10,
  },
  tabBarScroll: {
    height: 48,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.secondary,
    backgroundColor: theme.colors.primary,
  },
  tabBarFixed: {
    height: 48,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: withOpacity('white', 0.2),
    backgroundColor: theme.colors.primary,
  },
  tabButton: {
    position: 'relative',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  tabButtonWrapper: {
    flex: 1,
  },
  tabButtonFixed: {
    position: 'relative',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  tabText: {
    fontSize: 16,
  },
  tabTextActive: {
    color: theme.colors.highlight,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    width: '100%',
    backgroundColor: theme.colors.highlight,
  },
  tabContent: {
    flex: 1,
  },
  tabContentScroll: {
    flex: 1,
  },
  tabContentFixed: {
    flex: 1,
  },
}));

export default ThemeTabs;
