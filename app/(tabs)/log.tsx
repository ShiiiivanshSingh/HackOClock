import { StyleSheet, View, ScrollView, Pressable, Alert, SafeAreaView, StatusBar, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAsyncStorage } from '@/hooks/useAsyncStorage';
import { format } from 'date-fns';
import { Stack } from 'expo-router';

type LogEntry = {
  date: string;
  waterAmount: number;
  stressLevel: number;
};

export default function LogScreen() {
  const colorScheme = useColorScheme() || 'light';
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const { value: savedEntries, setValue: setSavedEntries, loading } = useAsyncStorage<LogEntry[]>('log-entries', []);
  const [waterAmount, setWaterAmount] = useState(0);
  const [stressLevel, setStressLevel] = useState(2);
  const [isSaving, setIsSaving] = useState(false);
  const [stepsToday, setStepsToday] = useState(Math.floor(Math.random() * 5000) + 1000);
  const [caloriesBurned, setCaloriesBurned] = useState(Math.floor(Math.random() * 500) + 200);
  const [minutesActive, setMinutesActive] = useState(Math.floor(Math.random() * 60) + 10);

  useEffect(() => {
    if (!loading) {
      // Check if there's an entry for today already
      const todayEntry = savedEntries.find(entry => entry.date === today);
      if (todayEntry) {
        setWaterAmount(todayEntry.waterAmount);
        setStressLevel(todayEntry.stressLevel);
      }
    }
  }, [loading, savedEntries, today]);

  const stressEmojis = ['😌', '😊', '😐', '😟', '😫'];
  const moodLabels = ['Very relaxed', 'Relaxed', 'Neutral', 'Stressed', 'Very stressed'];
  
  const handleWaterChange = (amount: number) => {
    setWaterAmount(amount);
  };

  const handleStressSelect = (level: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStressLevel(level);
  };

  const saveEntry = async () => {
    try {
      setIsSaving(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      const existingEntryIndex = savedEntries.findIndex(entry => entry.date === today);
      const newEntry = { date: today, waterAmount, stressLevel };
      
      let updatedEntries;
      if (existingEntryIndex >= 0) {
        updatedEntries = [...savedEntries];
        updatedEntries[existingEntryIndex] = newEntry;
      } else {
        updatedEntries = [...savedEntries, newEntry];
      }
      
      await setSavedEntries(updatedEntries);
      Alert.alert('Success', 'Your entry has been saved');
    } catch (error) {
      Alert.alert('Error', 'Failed to save your entry');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderCircularProgress = (percent: number, color: string, innerContent: React.ReactNode) => {
    return (
      <View style={styles.circularProgressContainer}>
        <View style={[styles.circularTrack, { borderColor: color, opacity: 0.3 }]} />
        <View 
          style={[
            styles.circularProgress, 
            { 
              borderColor: color, 
              borderLeftColor: 'transparent',
              borderBottomColor: 'transparent',
              transform: [{ rotate: `${45 + (percent * 3.6)}deg` }]
            }
          ]} 
        />
        {innerContent}
      </View>
    );
  };

  const getDayOfWeek = () => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return days[new Date().getDay()];
  };

  // Calculate how many days this week had activities logged
  const daysLoggedThisWeek = Math.min(new Date().getDay() + 1, 5);  // Sample data

  return (
    <View style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#f6f6f6' }}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.statusBarPlaceholder} />
      
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Today</ThemedText>
          <View style={styles.userIcon}>
            <ThemedText style={styles.userInitial}>J</ThemedText>
          </View>
        </View>

        {/* Main Progress Circle */}
        <View style={[styles.mainCard, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff' }]}>
          <View style={styles.progressSection}>
            {renderCircularProgress(66, '#4CAF50', 
              <View style={[styles.innerProgressContent, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff' }]}>
               <ThemedText style={[styles.progressPercent, { color: '#4CAF50', fontSize: 30, padding: 17 }]}>66%</ThemedText>
                <ThemedText style={[styles.progressSubtext, { color: '#666', fontSize: 14, padding: 2 }]}>{stepsToday}</ThemedText>
               </View>
            )}
          </View>

          <View style={styles.statsRow}>
            <Pressable style={styles.statItem}>
              <IconSymbol name="heart.fill" size={16} color="#FF3B30" />
              <ThemedText style={styles.statLabel}>Heart Pts</ThemedText>
            </Pressable>
            
            <Pressable style={styles.statItem}>
              <IconSymbol name="figure.walk" size={16} color="#4CAF50" />
              <ThemedText style={styles.statLabel}>Steps</ThemedText>
            </Pressable>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <ThemedText style={styles.metricValue}>{caloriesBurned}</ThemedText>
              <ThemedText style={styles.metricLabel}>cal</ThemedText>
            </View>
            
            <View style={styles.metric}>
              <ThemedText style={styles.metricValue}>2</ThemedText>
              <ThemedText style={styles.metricLabel}>miles</ThemedText>
            </View>
            
            <View style={styles.metric}>
              <ThemedText style={styles.metricValue}>{minutesActive}</ThemedText>
              <ThemedText style={styles.metricLabel}>Move Min</ThemedText>
            </View>
          </View>
        </View>

        {/* Sleep Tracking */}
        <Pressable style={[styles.actionCard, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff' }]}>
          <View style={styles.actionCardContent}>
            <View>
              <ThemedText style={styles.actionTitle}>Last sleep</ThemedText>
              <ThemedText style={styles.actionSubtitle}>+1 Today</ThemedText>
              
              <View style={styles.sleepInfo}>
                <ThemedText style={styles.sleepHours}>7h 30m</ThemedText>
                <ThemedText style={styles.sleepDescription}>Asleep</ThemedText>
              </View>
            </View>
            
            <IconSymbol name="chevron.right" size={18} color="#aaa" />
          </View>
        </Pressable>

        {/* Weekly Goals */}
        <Pressable style={[styles.actionCard, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff' }]}>
          <View style={styles.actionCardContent}>
            <View>
              <ThemedText style={styles.actionTitle}>Your daily goals</ThemedText>
              <ThemedText style={styles.actionSubtitle}>Last 7 days</ThemedText>
              
              <View style={styles.weeklyStats}>
                <View style={styles.weeklyStatsNumber}>
                  <ThemedText style={styles.weeklyProgress}>{daysLoggedThisWeek}/7</ThemedText>
                  <ThemedText style={styles.weeklySubtext}>Achieved</ThemedText>
                </View>
                
                <View style={styles.weekDays}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <View 
                      key={index} 
                      style={[
                        styles.dayCircle,
                        { backgroundColor: index < daysLoggedThisWeek ? '#4CAF50' : 'transparent' }
                      ]}
                    >
                      <ThemedText style={[
                        styles.dayText, 
                        index < daysLoggedThisWeek && { color: '#fff' }
                      ]}>
                        {day}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            </View>
            
            <IconSymbol name="chevron.right" size={18} color="#aaa" />
          </View>
        </Pressable>

        {/* Water & Mood Tracking */}
        <View style={[styles.actionCard, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff' }]}>
          <ThemedText style={styles.sectionTitle}>Log for today</ThemedText>
          
          <View style={styles.inputSection}>
            <ThemedText style={styles.inputLabel}>Water Intake</ThemedText>
            <View style={styles.waterInput}>
              <Pressable 
                style={styles.waterButton}
                onPress={() => handleWaterChange(Math.max(0, waterAmount - 250))}
              >
                <IconSymbol name="minus" size={18} color="#4CAF50" />
              </Pressable>
              
              <View style={styles.waterValue}>
                <ThemedText style={styles.waterAmount}>{waterAmount}</ThemedText>
                <ThemedText style={styles.waterUnit}>ml</ThemedText>
              </View>
              
              <Pressable 
                style={styles.waterButton}
                onPress={() => handleWaterChange(waterAmount + 250)}
              >
                <IconSymbol name="plus" size={18} color="#4CAF50" />
              </Pressable>
            </View>
          </View>
          
          <View style={styles.inputSection}>
            <ThemedText style={styles.inputLabel}>Mood</ThemedText>
            <View style={styles.moodSelector}>
              {stressEmojis.map((emoji, index) => (
                <Pressable 
                  key={index}
                  onPress={() => handleStressSelect(index)}
                  style={[
                    styles.moodButton,
                    stressLevel === index && styles.selectedMood,
                  ]}
                >
                  <ThemedText style={styles.moodEmoji}>{emoji}</ThemedText>
                </Pressable>
              ))}
            </View>
            <ThemedText style={styles.moodLabel}>{moodLabels[stressLevel]}</ThemedText>
          </View>
        </View>

        {/* Save Button */}
        <Pressable 
          style={styles.saveButton}
          onPress={saveEntry}
          disabled={isSaving}
        >
          <ThemedText style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : 'Save Entry'}
          </ThemedText>
        </Pressable>
      </ScrollView>
      
      {/* Floating Add Button */}
      <View style={styles.floatingButtonContainer}>
        <Pressable style={styles.floatingButton}>
          <IconSymbol name="plus" size={24} color="#fff" />
        </Pressable>
      </View>
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
  contentContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  userIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInitial: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  mainCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  circularProgressContainer: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circularTrack: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 8,
    position: 'absolute',
  },
  circularProgress: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 8,
    position: 'absolute',
  },
  innerProgressContent: {
    alignItems: 'center',
  },
  progressPercent: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  progressSubtext: {
    fontSize: 16,
    opacity: 0.8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(200, 200, 200, 0.2)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  statLabel: {
    fontSize: 14,
    marginLeft: 6,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  metricLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  actionCard: {
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionSubtitle: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  sleepInfo: {
    marginTop: 12,
  },
  sleepHours: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  sleepDescription: {
    fontSize: 12,
    opacity: 0.7,
  },
  weeklyStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  weeklyStatsNumber: {
    marginRight: 16,
  },
  weeklyProgress: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  weeklySubtext: {
    fontSize: 12,
    opacity: 0.7,
  },
  weekDays: {
    flexDirection: 'row',
  },
  dayCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  dayText: {
    fontSize: 10,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  waterInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waterValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 16,
    minWidth: 120,
    justifyContent: 'center',
  },
  waterAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  waterUnit: {
    fontSize: 16,
    marginLeft: 4,
    opacity: 0.7,
  },
  moodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  moodButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(200, 200, 200, 0.2)',
  },
  selectedMood: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  moodEmoji: {
    fontSize: 24,
  },
  moodLabel: {
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.8,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  floatingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
}); 