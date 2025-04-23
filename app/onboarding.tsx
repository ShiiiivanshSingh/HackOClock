import React, { useState, useRef } from 'react';
import { StyleSheet, View, Pressable, ScrollView, Dimensions, Image } from 'react-native';
import { useFonts } from 'expo-font';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/IconSymbol';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const colorScheme = useColorScheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const tintColor = Colors[colorScheme ?? 'light'].tint;

  const slides = [
    {
      title: 'Track Your Hydration',
      text: 'Log your daily water intake with just a tap and get reminders to stay hydrated throughout the day.',
      icon: 'drop' as const,
      iconColor: '#0a7ea4'
    },
    {
      title: 'Monitor Your Sleep',
      text: 'Connect with Google Fit to automatically track your sleep duration and quality.',
      icon: 'bed.double' as const,
      iconColor: '#7e5ae6'
    },
    {
      title: 'Stay Active',
      text: 'Track your steps and activity levels to maintain a healthy lifestyle.',
      icon: 'figure.walk' as const,
      iconColor: '#4CAF50'
    },
    {
      title: 'Manage Stress',
      text: 'Log and monitor your stress levels to better understand your mental wellbeing.',
      icon: 'brain' as const,
      iconColor: '#FF9800'
    }
  ];

  const handleScroll = (event: any) => {
    const pageIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    if (pageIndex !== currentPage) {
      setCurrentPage(pageIndex);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const goToNextSlide = () => {
    if (currentPage < slides.length - 1) {
      scrollViewRef.current?.scrollTo({ x: width * (currentPage + 1), animated: true });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      // Last slide, navigate to main app
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    }
  };

  const skipOnboarding = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.scrollView}
      >
        {slides.map((slide, index) => (
          <View key={index} style={styles.slide}>
            <View style={styles.iconContainer}>
              <IconSymbol size={80} name={slide.icon} color={slide.iconColor} />
            </View>
            <ThemedText style={styles.title}>{slide.title}</ThemedText>
            <ThemedText style={styles.text}>{slide.text}</ThemedText>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.paginationContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentPage ? { backgroundColor: tintColor, width: 24 } : null
              ]}
            />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          {currentPage < slides.length - 1 ? (
            <>
              <Pressable style={styles.skipButton} onPress={skipOnboarding}>
                <ThemedText style={styles.skipText}>Skip</ThemedText>
              </Pressable>
              <Pressable style={[styles.nextButton, { backgroundColor: tintColor }]} onPress={goToNextSlide}>
                <ThemedText style={styles.nextText}>Next</ThemedText>
              </Pressable>
            </>
          ) : (
            <Pressable style={[styles.getStartedButton, { backgroundColor: tintColor }]} onPress={goToNextSlide}>
              <ThemedText style={styles.getStartedText}>Get Started</ThemedText>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  iconContainer: {
    marginBottom: 40,
    padding: 30,
    borderRadius: 100,
    backgroundColor: '#f5f5f7',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 24,
  },
  footer: {
    padding: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: '#D8D8D8',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  skipText: {
    fontSize: 16,
    opacity: 0.7,
  },
  nextButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  nextText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  getStartedButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
}); 