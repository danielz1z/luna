import { Stack, router } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import useThemeColors from '../contexts/ThemeColors';
import { palette } from '@/lib/unistyles';

import Icon from '@/components/ui/Icon';
import ThemedScroller from '@/components/ui/ThemeScroller';
import ThemedText from '@/components/ui/ThemedText';

const Subscription = () => {
  const insets = useSafeAreaInsets();
  const [isLoading, setLoading] = useState(true);

  // Simulate a loading delay
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 0);
  }, []);

  const colors = useThemeColors();
  const [selectedPlan, setSelectedPlan] = useState('Annual'); // State to keep track of the selected plan
  const handleSelect = (plan: React.SetStateAction<string>) => {
    setSelectedPlan(plan); // Update the selected plan
  };
  const actionSheetRef = useRef<ActionSheetRef>(null);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false, // Disabling the header
          presentation: 'card',
          animation: 'slide_from_bottom',
        }}
      />

      {isLoading ? (
        <Text>Loading</Text>
      ) : (
        <>
          <View
            style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
            >
            <View style={styles.root}>
            <View style={styles.topBar}>
              <View style={styles.brandRow}>
                <ThemedText style={styles.brand}>Luna</ThemedText>
                <View style={styles.proBadge}>
                  <Text style={styles.proBadgeText}>PRO</Text>
                </View>
              </View>
              <View>
                <Pressable onPress={() => router.dismiss()} style={styles.closeButton}>
                  <Icon name="X" size={25} />
                </Pressable>
              </View>
            </View>
            <ThemedScroller contentContainerStyle={styles.scrollerContent}>
              <View style={styles.scrollerSpacer} />
              <RowItem isFree isPro label="Unlimited Chat Messages" />
              <RowItem isFree isPro label="Image Generation" />
              <RowItem isFree isPro label="Text to Speech" />
              <RowItem isPro label="Priority Response Times" />
              <RowItem isPro label="Advanced Image Generation" />
              <RowItem isPro label="Voice Conversations" />
              <RowItem isPro label="Custom AI Assistants" />
              <RowItem isPro label="Document Analysis & Summaries" />
              <RowItem isPro label="Code Explanation & Generation" />
              <RowItem isPro label="API Access" />
            </ThemedScroller>
            <View style={styles.footer}>
              <Pressable
                onPress={() => actionSheetRef.current?.show()}
                style={styles.ctaButton}>
                <Text style={styles.ctaText}>Start free trial</Text>
              </Pressable>
              <Text style={styles.footerNote}>Recurring billing. Cancel anytime</Text>
            </View>
            </View>
          </View>

          <ActionSheet
            ref={actionSheetRef}
            isModal={false}
            gestureEnabled
            overdrawEnabled={false}
            closable
            containerStyle={{
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              backgroundColor: colors.bg,
            }}>
            <View style={styles.sheetContent}>
              <View style={styles.sheetHeader}>
                <ThemedText style={styles.sheetHeaderText}>30 Day free trial</ThemedText>
                <ThemedText style={styles.sheetHeaderText}>$0.00</ThemedText>
              </View>

              <SelectPlan
                onSelect={() => handleSelect('Annual')}
                isSelected={selectedPlan === 'Annual'}
                period="Annual"
                badge="Save 43%"
                price="$39.99/year after trial"
                save="($3.33 per month)"
              />
              <SelectPlan
                onSelect={() => handleSelect('Monthly')}
                isSelected={selectedPlan === 'Monthly'}
                period="Monthly"
                price="$6.99/month after trial"
                badge={undefined}
                save={undefined}
              />
            </View>
            <View style={styles.sheetFooter}>
              <Pressable style={styles.ctaButton}>
                <Text style={styles.ctaText}>Start free trial</Text>
              </Pressable>
              <ThemedText style={styles.sheetNote}>Recurring billing. Cancel anytime</ThemedText>
            </View>
          </ActionSheet>
        </>
      )}
    </>
  );
};

const SelectPlan = (props: {
  badge: any;
  save: any;
  price: any;
  period: any;
  isSelected: any;
  onSelect: any;
}) => {
  const { badge, save, price, period, isSelected, onSelect } = props;

  return (
    <Pressable
      onPress={onSelect}
      style={[styles.planRow, isSelected ? styles.planRowSelected : styles.planRowUnselected]}>
      <View>
        <View style={styles.planTopRow}>
          <Text style={styles.planPeriod}>{period}</Text>
          {badge && (
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>{badge}</Text>
            </View>
          )}
        </View>
        <Text style={styles.planPrice}>
          {price} {save && <Text style={styles.planSave}>{save}</Text>}
        </Text>
      </View>
      <View style={[styles.radioOuter, isSelected ? styles.radioOuterSelected : styles.radioOuterUnselected]}>
        <View style={[styles.radioInner, isSelected ? styles.radioInnerSelected : styles.radioInnerUnselected]} />
      </View>
    </Pressable>
  );
};

const RowItem = (props: { label: any; isFree?: any; isPro?: any }) => {
  const { label, isFree, isPro } = props;
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureLabel}>
        <ThemedText style={styles.featureText}>{label}</ThemedText>
      </View>
      <View style={styles.featureChecks}>
        <View style={styles.featureCheck}>
          {isFree && <Icon name="Check" size={25} />}
        </View>

        <View style={styles.featureCheckPro}>
          {isPro && <Icon name="Check" size={25} color="white" />}
        </View>
      </View>
    </View>
  );
};

export default Subscription;

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brand: {
    fontFamily: theme.fonts.bold,
    fontSize: 30,
  },
  proBadge: {
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.highlight,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  proBadgeText: {
    fontFamily: theme.fonts.bold,
    color: palette.white,
  },
  closeButton: {
    height: 48,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    backgroundColor: theme.colors.secondary,
  },
  scrollerContent: {
    paddingHorizontal: 16,
  },
  scrollerSpacer: {
    height: 24,
    width: '100%',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.secondary,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  ctaButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: palette.sky500,
    paddingVertical: 16,
  },
  ctaText: {
    fontSize: 16,
    color: palette.white,
  },
  footerNote: {
    marginTop: 12,
    color: theme.colors.subtext,
  },
  sheetContent: {
    paddingHorizontal: 20,
  },
  sheetHeader: {
    marginBottom: 24,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetHeaderText: {
    fontSize: 18,
    fontFamily: theme.fonts.bold,
  },
  sheetFooter: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sheetNote: {
    marginVertical: 12,
  },
  planRow: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  planRowSelected: {
    borderColor: theme.colors.highlight,
  },
  planRowUnselected: {
    borderColor: theme.colors.secondary,
  },
  planTopRow: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  planPeriod: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  planBadge: {
    marginLeft: 8,
    borderRadius: 6,
    backgroundColor: theme.colors.highlight,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  planBadgeText: {
    fontSize: 12,
    color: palette.white,
  },
  planPrice: {
    fontSize: 14,
    color: theme.colors.text,
  },
  planSave: {
    fontSize: 12,
    color: theme.colors.highlight,
  },
  radioOuter: {
    height: 24,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    borderWidth: 1,
    backgroundColor: theme.colors.secondary,
  },
  radioOuterSelected: {
    borderColor: palette.sky500,
  },
  radioOuterUnselected: {
    borderColor: 'transparent',
  },
  radioInner: {
    height: 16,
    width: 16,
    borderRadius: 9999,
    borderWidth: 1,
  },
  radioInnerSelected: {
    borderColor: palette.sky500,
    backgroundColor: palette.sky500,
  },
  radioInnerUnselected: {
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  featureRow: {
    width: '100%',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.secondary,
  },
  featureLabel: {
    flex: 1,
    paddingVertical: 24,
  },
  featureText: {
    fontSize: 16,
  },
  featureChecks: {
    width: 150,
    flexDirection: 'row',
  },
  featureCheck: {
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCheckPro: {
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.highlight,
  },
}));
