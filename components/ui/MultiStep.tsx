import React, {
  ReactNode,
  useState,
  useRef,
  useEffect,
  Children,
  isValidElement,
  cloneElement,
} from 'react';
import {
  View,
  Pressable,
  Animated,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button } from '@/components/ui/Button';
import Header from '@/components/ui/Header';
import Icon from '@/components/ui/Icon';
import ThemedText from '@/components/ui/ThemedText';
import BackHandlerManager from '@/utils/BackHandlerManager';
import { useThemeColors } from '@/app/contexts/ThemeColors';
import { palette, withOpacity } from '@/lib/unistyles';

// Step component that will be used as children
export interface StepProps {
  title: string;
  optional?: boolean;
  children: ReactNode;
}

export const Step: React.FC<StepProps> = ({ children }) => {
  return <>{children}</>; // Just render children, this is mainly for type safety
};

// Add this to help with type checking
const isStepComponent = (child: any): child is React.ReactElement<StepProps> => {
  return (
    isValidElement(child) &&
    (child.type === Step || (typeof child.type === 'function' && child.type.name === 'Step'))
  );
};

interface StepData {
  key: string;
  title: string;
  optional?: boolean;
  component: ReactNode;
}

interface MultiStepProps {
  children: ReactNode;
  onComplete: () => void;
  onClose?: () => void;
  showHeader?: boolean;
  showStepIndicator?: boolean;
  className?: string;
  onStepChange?: (nextStep: number) => boolean;
  style?: StyleProp<ViewStyle>;
}

export default function MultiStep({
  children,
  onComplete,
  onClose,
  showHeader = true,
  showStepIndicator = true,
  className = '',
  onStepChange,
  style,
}: MultiStepProps) {
  const colors = useThemeColors();
  // Filter and validate children to only include Step components
  const validChildren = Children.toArray(children).filter(isStepComponent);

  // Extract step data from children
  const steps: StepData[] = validChildren.map((child, index) => {
    const {
      title,
      optional,
      children: stepContent,
    } = (child as React.ReactElement<StepProps>).props;
    return {
      key: `step-${index}`,
      title: title || `Step ${index + 1}`,
      optional,
      component: stepContent,
    };
  });

  // Ensure we have at least one step
  if (steps.length === 0) {
    steps.push({
      key: 'empty-step',
      title: 'Empty',
      component: (
        <View>
          <ThemedText>No steps provided</ThemedText>
        </View>
      ),
    });
  }

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  // Store a reference to the handler ID for reliable cleanup
  const handlerIdRef = useRef<string | null>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnims = useRef(steps.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Reset and start fade/slide animations
    fadeAnim.setValue(0);
    slideAnim.setValue(50);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate progress indicators
    steps.forEach((_, index) => {
      Animated.timing(progressAnims[index], {
        toValue: index <= currentStepIndex ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  }, [currentStepIndex]);

  // Access the back handler manager
  const backManager = BackHandlerManager.getInstance();

  // Clean up function to ensure handlers are properly removed
  const cleanupBackHandler = () => {
    // Remove the handler if it exists
    if (handlerIdRef.current) {
      backManager.unregisterHandler(handlerIdRef.current);
      handlerIdRef.current = null;
    }
  };

  // Add back button handler using our manager
  useEffect(() => {
    // Clean up any existing handler first
    cleanupBackHandler();

    // Create a unique ID for this component instance
    const handlerId = `multi-step-${Date.now()}`;
    handlerIdRef.current = handlerId;

    // This effect handles both hardware back button presses and ensures proper cleanup
    const handleBackPress = () => {
      if (!isFirstStep) {
        handleBack();
        return true; // Prevent default behavior
      }
      // If we're on first step and have onClose, use it
      if (isFirstStep && onClose) {
        onClose();
        return true; // Prevent default behavior
      }
      return false; // Let the system handle it
    };

    // Register the handler with our manager
    backManager.registerHandler(handlerId, handleBackPress);

    // Make this the active handler
    backManager.setActiveHandler(handlerId);

    // Return cleanup function
    return cleanupBackHandler;
  }, [currentStepIndex, isFirstStep, onClose]);

  // Add an extra cleanup effect that runs only on unmount
  useEffect(() => {
    return () => {
      cleanupBackHandler();

      // For absolute safety, reset all handlers in the manager on unmount
      // This helps when transitioning between screens
      backManager.resetAll();
    };
  }, []);

  const handleNext = () => {
    if (isLastStep) {
      // Make sure to clean up back handlers before completing
      cleanupBackHandler();
      onComplete();
    } else {
      const nextStep = currentStepIndex + 1;
      const canProceed = onStepChange ? onStepChange(nextStep) : true;

      if (canProceed) {
        setCurrentStepIndex(nextStep);
      }
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep.optional && !isLastStep) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {showHeader && (
        <Header
          rightComponents={[
            onClose ? (
              <Pressable
                key="close"
                onPress={onClose}
                style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
                hitSlop={8}>
                <Icon name="X" size={24} color={colors.text} />
              </Pressable>
            ) : undefined,
          ]}
          leftComponent={[
            currentStep.optional && !isLastStep && (
              <Button key="skip" title="Skip" variant="ghost" onPress={handleSkip} size="small" />
            ),
            !isFirstStep && (
              <Icon
                name="ArrowLeft"
                key="back"
                size={24}
                color={colors.text}
                onPress={handleBack}
              />
            ),
          ].filter(Boolean)}
        />
      )}

      {showStepIndicator && (
        <View style={styles.stepIndicatorWrapper}>
          <View style={styles.stepIndicatorInner}>
            {steps.map((step, index) => (
              <React.Fragment key={step.key}>
                <View style={styles.stepIndicatorItem}>
                  <View style={styles.stepIndicatorTrack}>
                    <Animated.View
                      style={[
                        styles.stepIndicatorProgress,
                        {
                          width: progressAnims[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%'],
                          }),
                        },
                      ]}
                    />
                  </View>
                </View>
              </React.Fragment>
            ))}
          </View>
        </View>
      )}

      <View style={styles.contentWrapper}>
        <Animated.View
          style={[
            styles.animatedStep,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}>
          {currentStep.component}
        </Animated.View>
      </View>
      <View style={styles.footer}>
        <View style={styles.footerButtonWrapper}>
          <Button
            key="next"
            title={isLastStep ? 'Complete' : 'Next'}
            onPress={handleNext}
            size="large"
            rounded="full"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  closeButton: {
    borderRadius: 9999,
    padding: 8,
  },
  closeButtonPressed: {
    backgroundColor: theme.colors.secondary,
  },
  stepIndicatorWrapper: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  stepIndicatorInner: {
    width: '100%',
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: 9999,
  },
  stepIndicatorItem: {
    marginHorizontal: 1,
    flex: 1,
    alignItems: 'center',
  },
  stepIndicatorTrack: {
    height: 4,
    width: '100%',
    backgroundColor: theme.colors.secondary,
  },
  stepIndicatorProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 4,
    backgroundColor: theme.colors.text,
  },
  contentWrapper: {
    flex: 1,
  },
  animatedStep: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  footerButtonWrapper: {
    width: '100%',
  },
}));
