import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Platform, Dimensions, useWindowDimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAsyncStorage } from '@/hooks/useAsyncStorage';
import { format } from 'date-fns';
import { useHealthConnect } from '@/hooks/useHealthConnect';

type StressLevel = 'Low' | 'Medium' | 'High';
type LogEntry = {
  date: string;
  waterAmount: number;
  stressLevel: number;
};

export default function Dashboard() {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;
  const isLargeScreen = width > 480;
  
  const colorScheme = useColorScheme() || 'light';
  const router = useRouter();
  const today = format(new Date(), 'yyyy-MM-dd');
  const { value: savedEntries, loading } = useAsyncStorage<LogEntry[]>('log-entries', []);
  
  const [greeting, setGreeting] = useState("Today");
  const [lastSynced, setLastSynced] = useState("Never");

  // Replace useMockData with useHealthConnect
  const { healthData, isInitialized, error, syncData } = useHealthConnect();
  
  const waterGoal = 3000;
  const sleepGoal = "8-9 hours";
  const stepsGoal = 10000;

  useEffect(() => {
    if (!loading) {
      loadTodayData();
    }
  }, [loading, savedEntries]);

  const loadTodayData = () => {
    const todayEntry = savedEntries.find(entry => entry.date === today);
    
    if (todayEntry) {
      // Use saved entry data if available
    }
    
    if (savedEntries.length > 0) {
      setLastSynced('Just now');
    }
  };
  
  const handleNavigation = (tab: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (tab === 'log' || tab === 'insights' || tab === 'settings') {
      router.navigate(`/(tabs)/${tab}`);
    } else if (tab === 'reminders') {
      router.push('/reminders');
    }
  };

  const handleSync = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await syncData();
    setLastSynced("Just now");
  };

  const getStressEmoji = (level: StressLevel): string => {
    switch(level) {
      case 'Low': return '😊';
      case 'Medium': return '😐';
      case 'High': return '😫';
      default: return '😐';
    }
  };
  
  const getStressLevel = (value: number): StressLevel => {
    if (value < 2) return 'Low';
    if (value < 3) return 'Medium';
    return 'High';
  };

  const waterPercentage = Math.min(Math.round((healthData.waterIntake / waterGoal) * 100), 100);
  const sleepPercentage = Math.min(Math.round((healthData.sleepHours / 9) * 100), 100);
  const stepsPercentage = Math.min(Math.round((healthData.steps / stepsGoal) * 100), 100);

  const renderWaterProgress = () => {
    const size = isSmallScreen ? 90 : 100;
    const strokeWidth = isSmallScreen ? 8 : 10;
    const innerSize = size - (strokeWidth * 2);
    const radius = size / 2;
    
    return (
      <View style={styles.circularProgress}>
        <View style={[
          styles.progressBackground, 
          { 
            width: size, 
            height: size, 
            borderRadius: radius,
            borderWidth: strokeWidth,
            borderColor: colorScheme === 'dark' ? '#333' : '#e6e6e6'
          }
        ]} />
        <View style={[
          styles.progressForeground,
          {
            width: size,
            height: size,
            borderRadius: radius,
            borderWidth: strokeWidth,
            borderColor: '#2196F3',
            borderTopColor: 'transparent',
            borderRightColor: 'transparent',
            transform: [{ rotate: `${45 + (waterPercentage * 3.6)}deg` }],
            opacity: waterPercentage > 0 ? 1 : 0
          }
        ]} />
        <View style={[
          styles.circularProgressContent,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff'
          }
        ]}>
          <ThemedText style={[
            styles.cardValue,
            { fontSize: isSmallScreen ? 22 : 26 }
          ]}>
            {healthData.waterIntake}
          </ThemedText>
          <ThemedText style={styles.mlText}>
            ml
          </ThemedText>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#f6f6f6' }}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.statusBarPlaceholder} />
      
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.title}>{greeting}</ThemedText>
        </View>
        <Pressable onPress={() => handleNavigation('settings')}>
          <IconSymbol name="gear" size={24} color={Colors[colorScheme].text} />
        </Pressable>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          isLargeScreen && { paddingHorizontal: 24 }
        ]}
      >
        {/* Main Card */}
        <View style={[styles.mainCard, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff' }]}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardHeaderTitle}>Hydration</ThemedText>
            <ThemedText style={styles.cardHeaderSubtitle}>Remaining = Goal - Consumed</ThemedText>
          </View>
          
          <View style={styles.mainCardContent}>
            <View style={styles.progressSection}>
              {renderWaterProgress()}
            </View>
            
            <View style={styles.statsSection}>
              <View style={styles.statRow}>
                <IconSymbol name="target" size={20} color="#2196F3" />
                <ThemedText style={styles.statLabel}>Goal:</ThemedText>
                <ThemedText style={styles.statValue}>{waterGoal} ml</ThemedText>
              </View>
              
              <View style={styles.statRow}>
                <IconSymbol name="drop.fill" size={20} color="#2196F3" />
                <ThemedText style={styles.statLabel}>Today:</ThemedText>
                <ThemedText style={styles.statValue}>{waterGoal - healthData.waterIntake} ml</ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Steps and Sleep Row */}
        <View style={styles.metricRow}>
          {/* Steps Card */}
          <Pressable 
            style={[styles.metricCard, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff' }]}
            onPress={() => handleNavigation('insights')}
          >
            <ThemedText style={styles.metricTitle}>Steps</ThemedText>
            <View style={styles.metricContent}>
              <IconSymbol name="figure.walk" size={24} color="#4CAF50" />
              <ThemedText style={styles.metricValue}>{healthData.steps.toLocaleString()}</ThemedText>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${stepsPercentage}%`, backgroundColor: '#4CAF50' }]} />
            </View>
            <ThemedText style={styles.metricSubtitle}>Goal: {stepsGoal.toLocaleString()}</ThemedText>
          </Pressable>

          {/* Sleep Card */}
          <Pressable 
            style={[styles.metricCard, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff' }]}
            onPress={() => handleNavigation('log')}
          >
            <ThemedText style={styles.metricTitle}>Sleep</ThemedText>
            <View style={styles.metricContent}>
              <IconSymbol name="moon.stars.fill" size={24} color="#9C27B0" />
              <ThemedText style={styles.metricValue}>{healthData.sleepHours} hr</ThemedText>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${sleepPercentage}%`, backgroundColor: '#9C27B0' }]} />
            </View>
            <ThemedText style={styles.metricSubtitle}>Goal: {sleepGoal}</ThemedText>
          </Pressable>
        </View>

        {/* Mood Card */}
        <Pressable 
          style={[styles.moodCard, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff' }]}
          onPress={() => handleNavigation('log')}
        >
          <View style={styles.moodHeader}>
            <ThemedText style={styles.moodTitle}>Current Mood</ThemedText>
            <IconSymbol name="plus" size={20} color="#2196F3" />
          </View>
          <View style={[styles.moodContent, { paddingVertical: 12, paddingHorizontal: 16 }]}>
            <ThemedText style={[styles.moodEmoji, { paddingVertical: 12, paddingHorizontal: 16 }]}>{getStressEmoji(getStressLevel(healthData.stressLevel))}</ThemedText>
            <ThemedText style={styles.moodLabel}>{getStressLevel(healthData.stressLevel)}</ThemedText>
          </View>
        </Pressable>

        {/* Heart Rate Card */}
        <Pressable 
          style={[styles.heartCard, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff' }]}
          onPress={() => handleNavigation('insights')}
        >
          <View style={styles.heartCardContent}>
            <View>
              <ThemedText style={styles.heartTitle}>Heart Rate</ThemedText>
              <ThemedText style={styles.bpmValue}>{healthData.heartRate} BPM</ThemedText>
            </View>
            <IconSymbol name="heart.fill" size={32} color="#FF5252" />
          </View>
        </Pressable>

        {/* Sync Section */}
        <View style={styles.syncSection}>
          <ThemedText style={styles.lastSyncedText}>Last synced: {lastSynced}</ThemedText>
          <Pressable 
            style={styles.syncButton}
            onPress={handleSync}
          >
            <ThemedText style={styles.syncButtonText}>Sync Now</ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBarPlaceholder: {
    height: Platform.OS === 'ios' ? 50 : 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 8,
  },
  mainCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  cardHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardHeaderSubtitle: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  mainCardContent: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
  },
  progressSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsSection: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 14,
    marginLeft: 8,
    marginRight: 4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  circularProgress: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  progressBackground: {
    position: 'absolute',
    borderStyle: 'solid',
  },
  progressForeground: {
    position: 'absolute',
    borderStyle: 'solid',
  },
  circularProgressContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardValue: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mlText: {
    fontSize: 11,
    opacity: 0.7,
    marginTop: 2,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    paddingBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  metricContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  metricSubtitle: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(120, 120, 120, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  moodCard: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  moodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  moodTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  moodContent: {
    padding: 16,
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  moodLabel: {
    fontSize: 18,
    fontWeight: '500',
  },
  heartCard: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  heartCardContent: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heartTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  bpmValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  syncSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  lastSyncedText: {
    fontSize: 12,
    opacity: 0.7,
  },
  syncButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 24,
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
