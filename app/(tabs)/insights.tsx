import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Dimensions, Pressable, StatusBar, Platform, Text } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import { useAsyncStorage } from '@/hooks/useAsyncStorage';
import { format, startOfWeek, addDays } from 'date-fns';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Stack } from 'expo-router';
import { useHealthConnect } from '@/hooks/useHealthConnect';

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

// Simple bar component for custom charts
type BarProps = {
  height: number;
  width: number;
  color: string;
  label: string;
};

const Bar = ({ height, width, color, label }: BarProps) => {
  return (
    <View style={{ alignItems: 'center', marginHorizontal: 4 }}>
      <View style={{ height, width, backgroundColor: color, borderRadius: 4 }} />
      <Text style={{ fontSize: 10, marginTop: 4, transform: [{ rotate: '-45deg' }] }}>{label}</Text>
    </View>
  );
};

export default function InsightsScreen() {
  const colorScheme = useColorScheme() || 'light';
  const themeColors = Colors[colorScheme || 'light'];
  const { value: logEntries, refreshValue: refreshEntries, loading } = useAsyncStorage<LogEntry[]>('log-entries', MOCK_DATA);
  const [chartWidth, setChartWidth] = useState(Dimensions.get('window').width - 64);
  const [activeTab, setActiveTab] = useState('daily'); // Set to daily by default
  const [selectedMetric, setSelectedMetric] = useState('all');
  
  // Initialize with mock data if no entries exist
  useEffect(() => {
    if (!loading && (!logEntries || logEntries.length === 0)) {
      refreshEntries();
    }
  }, [loading, logEntries]);

  // Generate dates for the current week
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 0 });
  const weekDays = [...Array(7)].map((_, i) => {
    const date = addDays(startOfCurrentWeek, i);
    const isToday = format(date, 'yyyy-MM-dd') === MOCK_DATE;
    return {
      date,
      dayShort: format(date, 'E').charAt(0),
      isToday,
      isActive: isToday, // Only today is active
    };
  });

  // Format data aggregated from log entries
  const getAggregatedData = () => {
    if (!logEntries || loading) return { water: 0, stress: 0, sleep: 0 };

    // Only use entries for today
    const todayEntries = logEntries.filter(entry => entry.date === MOCK_DATE);
    
    const totalWater = todayEntries.reduce((sum, entry) => sum + (entry.waterAmount || 0), 0);
    const avgWater = todayEntries.length ? totalWater / todayEntries.length : 0;
    
    const totalStress = todayEntries.reduce((sum, entry) => sum + (entry.stressLevel || 0), 0);
    const avgStress = todayEntries.length ? totalStress / todayEntries.length : 0;
    
    return {
      water: Math.round(avgWater),
      stress: avgStress.toFixed(1),
      sleep: 4.5 // Low sleep hours
    };
  };

  const data = getAggregatedData();

  // Mock health data for today with minimal values
  const mockHealthData = {
    weeklyProgress: 12, // Very low progress
    weeklySteps: 1245, // Very few steps
    caloriesBurned: 98, // Very few calories
    sleepHours: 4.5, // Low sleep
    activeDays: 1, // Only today
    currentStreak: 1, // Just started
    totalPoints: 150, // Low points
    morningWalkDistance: 0.5, // Short walk
    morningWalkCalories: 25 // Few calories burned
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

  return (
    <View style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#f6f6f6' }}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.statusBarPlaceholder} />
      
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Insights</ThemedText>
          <View style={styles.userIcon}>
            <ThemedText style={styles.userInitial}>J</ThemedText>
          </View>
        </View>

        {/* Period Selector */}
        <View style={styles.tabSelector}>
          <Pressable 
            style={[styles.tabButton, activeTab === 'daily' && styles.activeTabButton]}
            onPress={() => setActiveTab('daily')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'daily' && styles.activeTabText]}>Daily</ThemedText>
          </Pressable>
          <Pressable 
            style={[styles.tabButton, activeTab === 'weekly' && styles.activeTabButton]}
            onPress={() => setActiveTab('weekly')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'weekly' && styles.activeTabText]}>Weekly</ThemedText>
          </Pressable>
          <Pressable 
            style={[styles.tabButton, activeTab === 'monthly' && styles.activeTabButton]}
            onPress={() => setActiveTab('monthly')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'monthly' && styles.activeTabText]}>Monthly</ThemedText>
          </Pressable>
        </View>

        {/* Main Progress Circle */}
        <View style={[styles.mainCard, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff' }]}>
          <View style={[styles.progressSection, { padding: 20 }]}>
            {renderCircularProgress(mockHealthData.weeklyProgress, '#4CAF50', 
              <View style={[styles.innerProgressContent, { padding: 10 }]}>
                <ThemedText style={[styles.progressPercent, { fontSize: 24, marginBottom: 4 }]}>{mockHealthData.weeklyProgress}%</ThemedText>
                <ThemedText style={[styles.progressSubtext, { fontSize: 14 }]}>{mockHealthData.weeklySteps.toLocaleString()} steps</ThemedText>
              </View>
            )}
          </View>

          <View style={styles.mainMetrics}>
            <View style={styles.metricItem}>
              <IconSymbol name="flame.fill" size={16} color="#FF9500" />
              <ThemedText style={styles.metricValue}>{mockHealthData.caloriesBurned}</ThemedText>
              <ThemedText style={styles.metricLabel}>Calories</ThemedText>
            </View>
            
            <View style={styles.metricItem}>
              <IconSymbol name="moon.fill" size={16} color="#9C27B0" />
              <ThemedText style={styles.metricValue}>{mockHealthData.sleepHours}h</ThemedText>
              <ThemedText style={styles.metricLabel}>Sleep</ThemedText>
            </View>
            
            <View style={styles.metricItem}>
              <IconSymbol name="drop.fill" size={16} color="#2196F3" />
              <ThemedText style={styles.metricValue}>{data.water}</ThemedText>
              <ThemedText style={styles.metricLabel}>Water (ml)</ThemedText>
            </View>
          </View>
        </View>

        {/* Weekly Activity */}
        <View style={[styles.weeklyCard, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff' }]}>
          <ThemedText style={styles.cardTitle}>Today's Activity</ThemedText>
          
          <View style={styles.weekCalendar}>
            {weekDays.map((day, index) => (
              <View key={index} style={styles.calendarDay}>
                <ThemedText 
                  style={[
                    styles.calendarDayText, 
                    day.isToday && styles.todayText
                  ]}
                >
                  {day.dayShort}
                </ThemedText>
                <View style={[
                  styles.activityDot, 
                  { 
                    backgroundColor: day.isActive ? '#4CAF50' : 'transparent',
                    borderColor: day.isActive ? '#4CAF50' : colorScheme === 'dark' ? '#555' : '#ddd'
                  }
                ]} />
              </View>
            ))}
          </View>
          
          <View style={styles.weekStats}>
            <View style={styles.statBlock}>
              <ThemedText style={styles.statNumber}>{mockHealthData.activeDays}</ThemedText>
              <ThemedText style={styles.statLabel}>Active Days</ThemedText>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statBlock}>
              <ThemedText style={styles.statNumber}>{mockHealthData.currentStreak}</ThemedText>
              <ThemedText style={styles.statLabel}>Day Streak</ThemedText>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statBlock}>
              <ThemedText style={styles.statNumber}>{mockHealthData.totalPoints}</ThemedText>
              <ThemedText style={styles.statLabel}>Total Points</ThemedText>
            </View>
          </View>
        </View>

        {/* Recent Activities */}
        <View style={[styles.activitiesCard, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff' }]}>
          <ThemedText style={styles.cardTitle}>Today's Activities</ThemedText>
          
          <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
              <IconSymbol name="figure.walk" size={18} color="#4CAF50" />
            </View>
            <View style={styles.activityInfo}>
              <ThemedText style={styles.activityTitle}>Morning Walk</ThemedText>
              <ThemedText style={styles.activityTime}>{format(today, 'h:mm a')}</ThemedText>
            </View>
            <View style={styles.activityStats}>
              <ThemedText style={styles.activityMetric}>{mockHealthData.morningWalkDistance} km</ThemedText>
              <ThemedText style={styles.activitySubMetric}>{mockHealthData.morningWalkCalories} cal</ThemedText>
            </View>
          </View>
          
          <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: 'rgba(33, 150, 243, 0.1)' }]}>
              <IconSymbol name="drop.fill" size={18} color="#2196F3" />
            </View>
            <View style={styles.activityInfo}>
              <ThemedText style={styles.activityTitle}>Water Intake</ThemedText>
              <ThemedText style={styles.activityTime}>{format(today, 'h:mm a')}</ThemedText>
            </View>
            <View style={styles.activityStats}>
              <ThemedText style={styles.activityMetric}>{data.water} ml</ThemedText>
              <ThemedText style={styles.activitySubMetric}>{(data.water / 250).toFixed(1)} cups</ThemedText>
            </View>
          </View>
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
  contentContainer: {
    padding: 16,
    paddingBottom: 30,
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
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(200, 200, 200, 0.2)',
    borderRadius: 8,
    marginBottom: 16,
    padding: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTabButton: {
    backgroundColor: '#2196F3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: '600',
    color: '#fff',
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
    marginBottom: 20,
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
  mainMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  weeklyCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  weekCalendar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  calendarDay: {
    alignItems: 'center',
  },
  calendarDayText: {
    fontSize: 14,
    marginBottom: 4,
  },
  todayText: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  activityDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  weekStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(200, 200, 200, 0.3)',
    paddingTop: 16,
  },
  statBlock: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.7,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: 'rgba(200, 200, 200, 0.3)',
    alignSelf: 'center',
  },
  activitiesCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 12,
    opacity: 0.7,
  },
  activityStats: {
    alignItems: 'flex-end',
  },
  activityMetric: {
    fontSize: 16,
    fontWeight: '600',
  },
  activitySubMetric: {
    fontSize: 12,
    opacity: 0.7,
  },
}); 