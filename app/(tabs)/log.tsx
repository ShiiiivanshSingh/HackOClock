import { StyleSheet, View, ScrollView, Pressable, Alert, SafeAreaView, StatusBar, Platform, TextInput } from 'react-native';
import React, { useState, useEffect } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAsyncStorage } from '@/hooks/useAsyncStorage';
import { format, parse, isEqual } from 'date-fns';
import { Stack, useRouter } from 'expo-router';
import { useHealthConnect } from '@/hooks/useHealthConnect';
import { DropdownSelect } from '@/components/DropdownSelect';

type LogEntry = {
  date: string;
  waterAmount: number;
  stressLevel: number;
};

// Mock data for today with minimal values
const today = new Date();
const MOCK_DATE = format(today, 'yyyy-MM-dd');
const MOCK_DATA: LogEntry[] = [
  {
    date: MOCK_DATE,
    waterAmount: 250, // Very low water intake
    stressLevel: 3 // Moderate stress
  }
];

export default function LogScreen() {
  const colorScheme = useColorScheme() || 'light';
  const router = useRouter();
  
  const { value: savedEntries, setValue: setSavedEntries, refreshValue: refreshEntries, loading } = useAsyncStorage<LogEntry[]>('log-entries', MOCK_DATA);
  const { healthData, syncData } = useHealthConnect(savedEntries);

  const [waterAmount, setWaterAmount] = useState(0);
  const [stressLevel, setStressLevel] = useState(2);
  const [isSaving, setIsSaving] = useState(false);
  
  // Mock fixed data for today
  const [stepsToday, setStepsToday] = useState(1245); // Very few steps
  const [caloriesBurned, setCaloriesBurned] = useState(98); // Very few calories
  const [minutesActive, setMinutesActive] = useState(15); // Very few minutes

  // Initialize with mock data on first load
  useEffect(() => {
    const initializeMockData = async () => {
      if (savedEntries.length === 0) {
        await setSavedEntries(MOCK_DATA);
        await refreshEntries();
      } else {
        // Clear any entries that aren't for today
        const filteredEntries = savedEntries.filter(entry => entry.date === MOCK_DATE);
        
        // If we don't have our mock entry, add it
        if (filteredEntries.length === 0) {
          await setSavedEntries(MOCK_DATA);
        } else if (filteredEntries.length !== savedEntries.length) {
          // If we have other entries, remove them
          await setSavedEntries(filteredEntries);
        }
        
        await refreshEntries();
      }
    };
    
    if (!loading) {
      initializeMockData();
    }
  }, [loading]);

  useEffect(() => {
    if (!loading) {
      // Check if there's an entry for today already
      const todayEntry = savedEntries.find(entry => entry.date === MOCK_DATE);
      if (todayEntry) {
        // Ensure water amount is a valid number
        const validWaterAmount = isNaN(todayEntry.waterAmount) ? 0 : todayEntry.waterAmount;
        setWaterAmount(validWaterAmount);
        setStressLevel(todayEntry.stressLevel);
      } else {
        // Set mock data for today
        const mockEntry = MOCK_DATA[0];
        setWaterAmount(mockEntry.waterAmount);
        setStressLevel(mockEntry.stressLevel);
      }
    }
  }, [loading, savedEntries]);

  const stressEmojis = ['😌', '😊', '😐', '😟', '😫'];
  const moodLabels = ['Very relaxed', 'Relaxed', 'Neutral', 'Stressed', 'Very stressed'];
  
  // Options for the dropdowns
  const waterOptions = [
    { label: 'No water', value: 0, icon: 'drop.slash' },
    { label: '250ml', value: 250, icon: 'drop' },
    { label: '500ml', value: 500, icon: 'drop' },
    { label: '750ml', value: 750, icon: 'drop' },
    { label: '1000ml', value: 1000, icon: 'drop.fill' },
    { label: '1500ml', value: 1500, icon: 'drop.fill' },
    { label: '2000ml', value: 2000, icon: 'drop.fill' },
  ];

  const moodOptions = stressEmojis.map((emoji, index) => ({
    label: moodLabels[index],
    value: index,
    emoji: emoji
  }));
  
  const handleWaterChange = (amount: number) => {
    try {
      // Ensure amount is a valid number and not less than 0
      const newAmount = isNaN(amount) ? 0 : Math.max(0, amount);
      
      // Update both the numeric state
      setWaterAmount(newAmount);
      
      // Provide haptic feedback for better user experience
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error in handleWaterChange:', error);
      Alert.alert('Error', 'There was an error updating your water amount');
    }
  };

  const handleStressSelect = (level: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setStressLevel(level);
    } catch (error) {
      console.error('Error in handleStressSelect:', error);
      Alert.alert('Error', 'There was an error updating your mood selection');
    }
  };

  const saveEntry = async () => {
    try {
      setIsSaving(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Ensure waterAmount is a valid number
      const numericWaterAmount = isNaN(waterAmount) ? 0 : parseInt(String(waterAmount), 10);
      
      const existingEntryIndex = savedEntries.findIndex(entry => entry.date === MOCK_DATE);
      const newEntry = { 
        date: MOCK_DATE, 
        waterAmount: numericWaterAmount, 
        stressLevel 
      };
      
      let updatedEntries;
      if (existingEntryIndex >= 0) {
        updatedEntries = [...savedEntries];
        updatedEntries[existingEntryIndex] = newEntry;
      } else {
        updatedEntries = [...savedEntries, newEntry];
      }
      
      // Filter to keep only entries for today
      updatedEntries = updatedEntries.filter(entry => entry.date === MOCK_DATE);
      
      try {
        // Save to storage first
        await setSavedEntries(updatedEntries);
        
        // Refresh entries to ensure latest data
        await refreshEntries();
        
        // Alert without blocking the UI
        Alert.alert('Success', 'Your entry has been saved');
        
        // Navigate back to home page to see changes
        router.replace('/(tabs)');
      } catch (saveError) {
        console.error('Error saving entry:', saveError);
        Alert.alert('Error', 'Failed to save your entry');
      }
    } catch (error) {
      console.error('Error in saveEntry:', error);
      Alert.alert('Error', 'Failed to save your entry');
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
    return ['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date().getDay()];
  };

  // Calculate how many days this week had activities logged
  const daysLoggedThisWeek = 1; // Only today
  
  // Get today's date string for comparison
  const todayDateStr = format(new Date(), 'yyyy-MM-dd');
  
  return (
    <View style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#f6f6f6' }}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.statusBarPlaceholder} />
      
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>
            Today
          </ThemedText>
          <View style={styles.userIcon}>
            <ThemedText style={styles.userInitial}>J</ThemedText>
          </View>
        </View>

        {/* Main Progress Circle */}
        <View style={[styles.mainCard, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff' }]}>
          <View style={styles.progressSection}>
            {renderCircularProgress(66, '#4CAF50', 
              <View style={[styles.innerProgressContent, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff' }]}>
               <ThemedText style={[styles.progressPercent, { color: '#4CAF50', fontSize: 30, padding: 17 }]}>12%</ThemedText>
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
                
                <View style={styles.weekProgress}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <View key={index} style={styles.dayContainer}>
                      <View style={[
                        styles.dayCircle,
                        { 
                          backgroundColor: (todayDateStr === MOCK_DATE && index <= 4) || 
                                         (todayDateStr !== MOCK_DATE && index < daysLoggedThisWeek) 
                            ? '#4CAF50' 
                            : 'transparent'
                        }
                      ]}>
                        <ThemedText style={[
                          styles.dayText, 
                          ((todayDateStr === MOCK_DATE && index <= 4) || 
                           (todayDateStr !== MOCK_DATE && index < daysLoggedThisWeek)) && { color: '#fff' }
                        ]}>
                          {day}
                        </ThemedText>
                      </View>
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
          <ThemedText style={styles.sectionTitle}>
            Log for Today
          </ThemedText>
          
          <View style={styles.inputSection}>
            <ThemedText style={styles.inputLabel}>Water Intake</ThemedText>
            <DropdownSelect
              options={waterOptions}
              selectedValue={waterAmount}
              onSelect={handleWaterChange}
              title="Select Water Intake"
              placeholder="Select water amount..."
            />
            
            {/* Water amount summary */}
            {waterAmount > 0 && (
              <View style={styles.waterSummary}>
                <IconSymbol name="drop.fill" size={20} color="#4CAF50" />
                <ThemedText style={styles.waterSummaryText}>
                  {waterAmount}ml ({(waterAmount / 250).toFixed(1)} cups)
                </ThemedText>
              </View>
            )}
          </View>
          
          <View style={styles.inputSection}>
            <ThemedText style={styles.inputLabel}>Mood</ThemedText>
            <DropdownSelect
              options={moodOptions}
              selectedValue={stressLevel}
              onSelect={handleStressSelect}
              title="Select Your Mood"
              placeholder="How are you feeling?"
            />
          </View>
        </View>

        {/* Save Button */}
        <Pressable 
          style={[styles.saveButton, isSaving ? styles.savingButton : null]}
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
        <Pressable style={styles.floatingButton} onPress={() => {
          // Reset to default values
          handleWaterChange(0);
          handleStressSelect(2);
        }}>
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
  weekProgress: {
    flexDirection: 'row',
  },
  dayContainer: {
    marginHorizontal: 2,
  },
  dayCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
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
  waterSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 8,
  },
  waterSummaryText: {
    marginLeft: 8,
    fontSize: 15,
    color: '#4CAF50',
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
  savingButton: {
    backgroundColor: '#2E7D32',
    opacity: 0.8,
  },
}); 