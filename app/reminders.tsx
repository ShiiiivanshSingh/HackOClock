import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Switch, Pressable, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useAsyncStorage } from '@/hooks/useAsyncStorage';

// Types for reminder settings
type ReminderFrequency = '30min' | '1hr' | '2hr' | '3hr' | '4hr';
type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
type TimeRange = {
  start: string;
  end: string;
};

type WaterSettings = {
  enabled: boolean;
  frequency: ReminderFrequency;
  timeRange: TimeRange;
  days: DayOfWeek[];
};

type ActivitySettings = {
  enabled: boolean;
  frequency: ReminderFrequency;
  timeRange: TimeRange;
  days: DayOfWeek[];
};

type SleepSettings = {
  enabled: boolean;
  time: string;
  days: DayOfWeek[];
};

type ReminderSettings = {
  water: WaterSettings;
  activity: ActivitySettings;
  sleep: SleepSettings;
};

export default function RemindersScreen() {
  const colorScheme = useColorScheme() || 'light';
  const tintColor = Colors[colorScheme].tint;
  const router = useRouter();
  const dividerColor = colorScheme === 'dark' ? Colors[colorScheme].borderColor : '#e0e0e0';
  
  // Default settings
  const defaultSettings: ReminderSettings = {
    water: {
      enabled: true,
      frequency: '2hr',
      timeRange: { start: '08:00', end: '20:00' },
      days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    },
    activity: {
      enabled: true,
      frequency: '1hr',
      timeRange: { start: '09:00', end: '17:00' },
      days: ['mon', 'tue', 'wed', 'thu', 'fri'],
    },
    sleep: {
      enabled: true,
      time: '22:30',
      days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sun'],
    },
  };
  
  // Get reminder settings from AsyncStorage with defaults
  const { value: settings, setValue: saveSettings, loading } = 
    useAsyncStorage<ReminderSettings>('reminder-settings', defaultSettings);
  
  // State for reminders
  const [waterEnabled, setWaterEnabled] = useState(true);
  const [waterFrequency, setWaterFrequency] = useState<ReminderFrequency>('2hr');
  const [waterDays, setWaterDays] = useState<DayOfWeek[]>(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
  
  const [activityEnabled, setActivityEnabled] = useState(true);
  const [activityFrequency, setActivityFrequency] = useState<ReminderFrequency>('1hr');
  const [activityDays, setActivityDays] = useState<DayOfWeek[]>(['mon', 'tue', 'wed', 'thu', 'fri']);
  
  const [sleepEnabled, setSleepEnabled] = useState(true);
  const [sleepTime, setSleepTime] = useState('22:30');
  const [sleepDays, setSleepDays] = useState<DayOfWeek[]>(['mon', 'tue', 'wed', 'thu', 'fri', 'sun']);

  // Load settings from storage when component mounts
  useEffect(() => {
    if (!loading) {
      // Water reminders
      setWaterEnabled(settings.water.enabled);
      setWaterFrequency(settings.water.frequency);
      setWaterDays(settings.water.days);
      
      // Activity reminders
      setActivityEnabled(settings.activity.enabled);
      setActivityFrequency(settings.activity.frequency);
      setActivityDays(settings.activity.days);
      
      // Sleep reminders
      setSleepEnabled(settings.sleep.enabled);
      setSleepTime(settings.sleep.time);
      setSleepDays(settings.sleep.days);
    }
  }, [loading, settings]);

  // Update a specific setting and save to AsyncStorage
  const updateSetting = async (
    category: keyof ReminderSettings,
    key: string,
    value: any
  ) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Update local state based on category and key
      if (category === 'water') {
        if (key === 'enabled') setWaterEnabled(value);
        else if (key === 'frequency') setWaterFrequency(value as ReminderFrequency);
        else if (key === 'days') setWaterDays(value as DayOfWeek[]);
      } 
      else if (category === 'activity') {
        if (key === 'enabled') setActivityEnabled(value);
        else if (key === 'frequency') setActivityFrequency(value as ReminderFrequency);
        else if (key === 'days') setActivityDays(value as DayOfWeek[]);
      }
      else if (category === 'sleep') {
        if (key === 'enabled') setSleepEnabled(value);
        else if (key === 'time') setSleepTime(value as string);
        else if (key === 'days') setSleepDays(value as DayOfWeek[]);
      }
      
      // Update settings in AsyncStorage
      const updatedSettings = { ...settings };
      
      if (category === 'water') {
        updatedSettings.water = { 
          ...updatedSettings.water, 
          [key]: value 
        };
      } else if (category === 'activity') {
        updatedSettings.activity = { 
          ...updatedSettings.activity, 
          [key]: value 
        };
      } else if (category === 'sleep') {
        updatedSettings.sleep = { 
          ...updatedSettings.sleep, 
          [key]: value 
        };
      }
      
      await saveSettings(updatedSettings);
      
      // Show save feedback (in a real app, this would schedule actual reminders)
      if (key === 'enabled') {
        const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
        Alert.alert(
          `${categoryName} Reminders ${value ? 'Enabled' : 'Disabled'}`,
          `${categoryName} reminders have been ${value ? 'enabled' : 'disabled'}.`
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save reminder settings');
      console.error(error);
    }
  };
  
  // Helper to format frequency text
  const formatFrequency = (freq: ReminderFrequency): string => {
    switch (freq) {
      case '30min': return 'Every 30 minutes';
      case '1hr': return 'Every hour';
      case '2hr': return 'Every 2 hours';
      case '3hr': return 'Every 3 hours';
      case '4hr': return 'Every 4 hours';
      default: return 'Custom';
    }
  };
  
  // Toggle a day in an array of days
  const toggleDay = (days: DayOfWeek[], day: DayOfWeek, category: keyof ReminderSettings) => {
    const newDays = days.includes(day)
      ? days.filter(d => d !== day)
      : [...days, day];
    
    updateSetting(category, 'days', newDays);
  };
  
  // Render day selector buttons
  const renderDaySelector = (
    selectedDays: DayOfWeek[], 
    category: keyof ReminderSettings
  ) => {
    const days: {key: DayOfWeek, label: string}[] = [
      {key: 'mon', label: 'M'},
      {key: 'tue', label: 'T'},
      {key: 'wed', label: 'W'},
      {key: 'thu', label: 'T'},
      {key: 'fri', label: 'F'},
      {key: 'sat', label: 'S'},
      {key: 'sun', label: 'S'},
    ];
    
    return (
      <View style={styles.daySelector}>
        {days.map(({key, label}) => (
          <Pressable 
            key={key}
            style={[
              styles.dayButton,
              selectedDays.includes(key) && {
                backgroundColor: tintColor, 
                borderColor: tintColor
              }
            ]}
            onPress={() => toggleDay(selectedDays, key, category)}
          >
            <ThemedText
              style={[
                styles.dayText,
                selectedDays.includes(key) && { color: '#fff' }
              ]}
            >
              {label}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Pressable 
          onPress={() => router.back()}
          hitSlop={20}
          style={styles.backButton}
        >
          <IconSymbol size={20} name="chevron.left" color={tintColor} />
          <ThemedText style={[styles.backText, { color: tintColor }]}>Back</ThemedText>
        </Pressable>
        <ThemedText style={styles.title}>Reminders</ThemedText>
      </View>

      {/* Water Reminders */}
      <View style={styles.section}>
        <ThemedView style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.reminderTitleContainer}>
              <IconSymbol size={22} name="drop.fill" color="#0a7ea4" />
              <ThemedText style={styles.cardTitle}>Water Reminders</ThemedText>
            </View>
            <Switch
              trackColor={{ false: '#767577', true: '#a1d8e6' }}
              thumbColor={waterEnabled ? tintColor : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={(value) => updateSetting('water', 'enabled', value)}
              value={waterEnabled}
            />
          </View>
          
          {waterEnabled && (
            <>
              <View style={[styles.divider, { backgroundColor: dividerColor }]} />
              
              <View style={styles.settingRow}>
                <ThemedText style={styles.settingLabel}>Frequency</ThemedText>
                <Pressable 
                  style={styles.valueSelector}
                  onPress={() => {
                    // In a real app, this would open a picker
                    const frequencies: ReminderFrequency[] = ['30min', '1hr', '2hr', '3hr', '4hr'];
                    const nextIndex = (frequencies.indexOf(waterFrequency) + 1) % frequencies.length;
                    updateSetting('water', 'frequency', frequencies[nextIndex]);
                  }}
                >
                  <ThemedText style={styles.valueText}>{formatFrequency(waterFrequency)}</ThemedText>
                  <IconSymbol size={16} name="chevron.right" color={Colors[colorScheme].text} />
                </Pressable>
              </View>
              
              <View style={[styles.divider, { backgroundColor: dividerColor }]} />
              
              <View style={styles.settingRow}>
                <ThemedText style={styles.settingLabel}>Active Days</ThemedText>
              </View>
              
              {renderDaySelector(waterDays, 'water')}
            </>
          )}
        </ThemedView>
      </View>

      {/* Activity Reminders */}
      <View style={styles.section}>
        <ThemedView style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.reminderTitleContainer}>
              <IconSymbol size={22} name="figure.walk" color="#4CAF50" />
              <ThemedText style={styles.cardTitle}>Activity Reminders</ThemedText>
            </View>
            <Switch
              trackColor={{ false: '#767577', true: '#a1d8e6' }}
              thumbColor={activityEnabled ? tintColor : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={(value) => updateSetting('activity', 'enabled', value)}
              value={activityEnabled}
            />
          </View>
          
          {activityEnabled && (
            <>
              <View style={[styles.divider, { backgroundColor: dividerColor }]} />
              
              <View style={styles.settingRow}>
                <ThemedText style={styles.settingLabel}>Frequency</ThemedText>
                <Pressable 
                  style={styles.valueSelector}
                  onPress={() => {
                    // In a real app, this would open a picker
                    const frequencies: ReminderFrequency[] = ['30min', '1hr', '2hr', '3hr', '4hr'];
                    const nextIndex = (frequencies.indexOf(activityFrequency) + 1) % frequencies.length;
                    updateSetting('activity', 'frequency', frequencies[nextIndex]);
                  }}
                >
                  <ThemedText style={styles.valueText}>{formatFrequency(activityFrequency)}</ThemedText>
                  <IconSymbol size={16} name="chevron.right" color={Colors[colorScheme].text} />
                </Pressable>
              </View>
              
              <View style={[styles.divider, { backgroundColor: dividerColor }]} />
              
              <View style={styles.settingRow}>
                <ThemedText style={styles.settingLabel}>Active Days</ThemedText>
              </View>
              
              {renderDaySelector(activityDays, 'activity')}
            </>
          )}
        </ThemedView>
      </View>

      {/* Sleep Reminders */}
      <View style={styles.section}>
        <ThemedView style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.reminderTitleContainer}>
              <IconSymbol size={22} name="bed.double.fill" color="#7e5ae6" />
              <ThemedText style={styles.cardTitle}>Sleep Reminders</ThemedText>
            </View>
            <Switch
              trackColor={{ false: '#767577', true: '#a1d8e6' }}
              thumbColor={sleepEnabled ? tintColor : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={(value) => updateSetting('sleep', 'enabled', value)}
              value={sleepEnabled}
            />
          </View>
          
          {sleepEnabled && (
            <>
              <View style={[styles.divider, { backgroundColor: dividerColor }]} />
              
              <View style={styles.settingRow}>
                <ThemedText style={styles.settingLabel}>Reminder Time</ThemedText>
                <Pressable 
                  style={styles.valueSelector}
                  onPress={() => {
                    // In a real app, this would open a time picker
                    // For now, just cycle between a few options
                    const times = ['21:30', '22:00', '22:30', '23:00'];
                    const nextIndex = (times.indexOf(sleepTime) + 1) % times.length;
                    updateSetting('sleep', 'time', times[nextIndex]);
                  }}
                >
                  <ThemedText style={styles.valueText}>{sleepTime}</ThemedText>
                  <IconSymbol size={16} name="chevron.right" color={Colors[colorScheme].text} />
                </Pressable>
              </View>
              
              <View style={[styles.divider, { backgroundColor: dividerColor }]} />
              
              <View style={styles.settingRow}>
                <ThemedText style={styles.settingLabel}>Active Days</ThemedText>
              </View>
              
              {renderDaySelector(sleepDays, 'sleep')}
            </>
          )}
        </ThemedView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  backText: {
    fontSize: 16,
    marginLeft: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  valueSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  valueText: {
    fontSize: 16,
    opacity: 0.8,
  },
  daySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 8,
  },
  dayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 