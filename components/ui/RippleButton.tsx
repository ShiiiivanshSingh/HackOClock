import React from 'react';
import { Pressable, PressableProps, StyleSheet, View, ViewStyle } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface RippleButtonProps extends PressableProps {
  style?: ViewStyle;
  children: React.ReactNode;
  rippleColor?: string;
  hapticFeedback?: boolean;
  hapticStyle?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';
}

export default function RippleButton({
  style,
  children,
  rippleColor,
  hapticFeedback = true,
  hapticStyle = 'light',
  onPress,
  ...rest
}: RippleButtonProps) {
  const colorScheme = useColorScheme() || 'light';
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  
  const defaultRippleColor = colorScheme === 'dark' 
    ? 'rgba(255, 255, 255, 0.12)' 
    : 'rgba(0, 0, 0, 0.06)';
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });
  
  const handleHapticFeedback = () => {
    if (!hapticFeedback) return;
    
    switch (hapticStyle) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
    }
  };
  
  const handlePress = (e: any) => {
    handleHapticFeedback();
    if (onPress) onPress(e);
  };
  
  return (
    <Pressable
      style={[styles.button, style]}
      onPress={handlePress}
      onPressIn={() => {
        scale.value = withTiming(0.98, { duration: 100 });
        opacity.value = withTiming(1, { duration: 150 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 200 });
        opacity.value = withTiming(0, { duration: 300 });
      }}
      {...rest}
    >
      <Animated.View style={[StyleSheet.absoluteFill, styles.ripple, { backgroundColor: rippleColor || defaultRippleColor }, animatedStyle]} />
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  ripple: {
    borderRadius: 8,
  },
}); 