import { StyleSheet, ScrollView, View, Pressable, Switch, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useAsyncStorage } from '@/hooks/useAsyncStorage';

// Define settings type
type UserSettings = {
  waterGoal: number;
  sleepGoal: number;
  stepGoal: number;
  waterReminders: boolean;
  breakReminders: boolean;
  sleepReminders: boolean;
  darkMode: boolean;
  syncEnabled: boolean;
};

export default function SettingsScreen() {
  const colorScheme = useColorScheme() || 'light';
  const tintColor = Colors[colorScheme].tint;
  const router = useRouter();
  const dividerColor = colorScheme === 'dark' ? Colors[colorScheme].borderColor : '#e0e0e0';

  // Get settings from AsyncStorage with defaults
  const { value: settings, setValue: saveSettings, loading } = 
    useAsyncStorage<UserSettings>('user-settings', {
      waterGoal: 3000,
      sleepGoal: 8,
      stepGoal: 10000,
      waterReminders: true,
      breakReminders: true,
      sleepReminders: true,
      darkMode: colorScheme === 'dark',
      syncEnabled: true,
    });

  // State for settings
  const [waterGoal, setWaterGoal] = useState(3000);
  const [sleepGoal, setSleepGoal] = useState(8);
  const [stepGoal, setStepGoal] = useState(10000);
  
  const [waterReminders, setWaterReminders] = useState(true);
  const [breakReminders, setBreakReminders] = useState(true);
  const [sleepReminders, setSleepReminders] = useState(true);
  
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
  const [syncEnabled, setSyncEnabled] = useState(true);

  // Load settings from storage when component mounts
  useEffect(() => {
    if (!loading) {
      setWaterGoal(settings.waterGoal);
      setSleepGoal(settings.sleepGoal);
      setStepGoal(settings.stepGoal);
      setWaterReminders(settings.waterReminders);
      setBreakReminders(settings.breakReminders);
      setSleepReminders(settings.sleepReminders);
      setIsDarkMode(settings.darkMode);
      setSyncEnabled(settings.syncEnabled);
    }
  }, [loading, settings]);

  const updateSetting = async <K extends keyof UserSettings>(
    key: K, 
    value: UserSettings[K], 
    setter: React.Dispatch<React.SetStateAction<any>>
  ) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setter(value);
      
      // Update settings in AsyncStorage
      const updatedSettings = { ...settings, [key]: value };
      await saveSettings(updatedSettings);
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
      console.error(error);
    }
  };

  const handleSignOut = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Sign Out', 
        style: 'destructive',
        onPress: () => {
          // In a real app, this would clear auth tokens and navigate to login
          Alert.alert('Signed Out', 'You have been signed out successfully.');
        }
      }
    ]);
  };

  // Preset options for reminder frequencies
  const reminderOptions = ['Every 1 hr', 'Every 2 hrs', 'Every 3 hrs', 'Morning only', 'Evening only'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Settings</ThemedText>
      </View>

      {/* Goals Section */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionHeader}>Goals</ThemedText>
        
        <ThemedView style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <IconSymbol size={18} name="drop.fill" color="#0a7ea4" />
              <ThemedText style={styles.settingLabel}>Water Goal</ThemedText>
            </View>
            <View style={styles.goalOptions}>
              <Pressable 
                style={[styles.goalPill, waterGoal === 2000 && styles.selectedGoal]} 
                onPress={() => updateSetting('waterGoal', 2000, setWaterGoal)}
              >
                <ThemedText style={styles.goalText}>2000 ml</ThemedText>
              </Pressable>
              <Pressable 
                style={[styles.goalPill, waterGoal === 2500 && styles.selectedGoal]} 
                onPress={() => updateSetting('waterGoal', 2500, setWaterGoal)}
              >
                <ThemedText style={styles.goalText}>2500 ml</ThemedText>
              </Pressable>
              <Pressable 
                style={[styles.goalPill, waterGoal === 3000 && styles.selectedGoal]} 
                onPress={() => updateSetting('waterGoal', 3000, setWaterGoal)}
              >
                <ThemedText style={styles.goalText}>3000 ml</ThemedText>
              </Pressable>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <IconSymbol size={18} name="bed.double.fill" color="#7e5ae6" />
              <ThemedText style={styles.settingLabel}>Sleep Goal</ThemedText>
            </View>
            <View style={styles.goalOptions}>
              <Pressable 
                style={[styles.goalPill, sleepGoal === 7 && styles.selectedGoal]} 
                onPress={() => updateSetting('sleepGoal', 7, setSleepGoal)}
              >
                <ThemedText style={styles.goalText}>7 hrs</ThemedText>
              </Pressable>
              <Pressable 
                style={[styles.goalPill, sleepGoal === 8 && styles.selectedGoal]} 
                onPress={() => updateSetting('sleepGoal', 8, setSleepGoal)}
              >
                <ThemedText style={styles.goalText}>8 hrs</ThemedText>
              </Pressable>
              <Pressable 
                style={[styles.goalPill, sleepGoal === 9 && styles.selectedGoal]} 
                onPress={() => updateSetting('sleepGoal', 9, setSleepGoal)}
              >
                <ThemedText style={styles.goalText}>9 hrs</ThemedText>
              </Pressable>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <IconSymbol size={18} name="figure.walk" color="#4CAF50" />
              <ThemedText style={styles.settingLabel}>Step Goal</ThemedText>
            </View>
            <View style={styles.goalOptions}>
              <Pressable 
                style={[styles.goalPill, stepGoal === 8000 && styles.selectedGoal]} 
                onPress={() => updateSetting('stepGoal', 8000, setStepGoal)}
              >
                <ThemedText style={styles.goalText}>8k</ThemedText>
              </Pressable>
              <Pressable 
                style={[styles.goalPill, stepGoal === 10000 && styles.selectedGoal]} 
                onPress={() => updateSetting('stepGoal', 10000, setStepGoal)}
              >
                <ThemedText style={styles.goalText}>10k</ThemedText>
              </Pressable>
              <Pressable 
                style={[styles.goalPill, stepGoal === 12000 && styles.selectedGoal]} 
                onPress={() => updateSetting('stepGoal', 12000, setStepGoal)}
              >
                <ThemedText style={styles.goalText}>12k</ThemedText>
              </Pressable>
            </View>
          </View>
        </ThemedView>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionHeader}>Notifications</ThemedText>
        
        <ThemedView style={styles.card}>
          <Pressable 
            style={styles.settingRow}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/reminders');
            }}
          >
            <View style={styles.settingInfo}>
              <IconSymbol size={18} name="bell.fill" color="#0a7ea4" />
              <View>
                <ThemedText style={styles.settingLabel}>Manage All Reminders</ThemedText>
                <ThemedText style={styles.settingDescription}>Advanced reminder settings</ThemedText>
              </View>
            </View>
            <IconSymbol size={18} name="chevron.right" color={Colors[colorScheme].text} />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: dividerColor }]} />
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <IconSymbol size={18} name="drop.fill" color="#0a7ea4" />
              <View>
                <ThemedText style={styles.settingLabel}>Water Reminders</ThemedText>
                <ThemedText style={styles.settingDescription}>Every 2 hours, 8 AM - 8 PM</ThemedText>
              </View>
            </View>
            <Switch
              trackColor={{ false: '#767577', true: '#a1d8e6' }}
              thumbColor={waterReminders ? tintColor : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={(value) => updateSetting('waterReminders', value, setWaterReminders)}
              value={waterReminders}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <IconSymbol size={18} name="figure.walk" color="#4CAF50" />
              <View>
                <ThemedText style={styles.settingLabel}>Break Reminders</ThemedText>
                <ThemedText style={styles.settingDescription}>Every 1 hour, during work hours</ThemedText>
              </View>
            </View>
            <Switch
              trackColor={{ false: '#767577', true: '#a1d8e6' }}
              thumbColor={breakReminders ? tintColor : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={(value) => updateSetting('breakReminders', value, setBreakReminders)}
              value={breakReminders}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <IconSymbol size={18} name="bed.double.fill" color="#7e5ae6" />
              <View>
                <ThemedText style={styles.settingLabel}>Sleep Wind-down</ThemedText>
                <ThemedText style={styles.settingDescription}>30 minutes before bedtime</ThemedText>
              </View>
            </View>
            <Switch
              trackColor={{ false: '#767577', true: '#a1d8e6' }}
              thumbColor={sleepReminders ? tintColor : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={(value) => updateSetting('sleepReminders', value, setSleepReminders)}
              value={sleepReminders}
            />
          </View>
        </ThemedView>
      </View>

      {/* App Preferences Section */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionHeader}>App Preferences</ThemedText>
        
        <ThemedView style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <IconSymbol size={18} name="moon.stars.fill" color="#9966FF" />
              <ThemedText style={styles.settingLabel}>Dark Mode</ThemedText>
            </View>
            <Switch
              trackColor={{ false: '#767577', true: '#a1d8e6' }}
              thumbColor={isDarkMode ? tintColor : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={(value) => updateSetting('darkMode', value, setIsDarkMode)}
              value={isDarkMode}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <IconSymbol size={18} name="arrow.clockwise" color="#0a7ea4" />
              <View>
                <ThemedText style={styles.settingLabel}>Auto-sync with Google Fit</ThemedText>
                <ThemedText style={styles.settingDescription}>Sync data automatically when app opens</ThemedText>
              </View>
            </View>
            <Switch
              trackColor={{ false: '#767577', true: '#a1d8e6' }}
              thumbColor={syncEnabled ? tintColor : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={(value) => updateSetting('syncEnabled', value, setSyncEnabled)}
              value={syncEnabled}
            />
          </View>
        </ThemedView>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionHeader}>Account</ThemedText>
        
        <ThemedView style={styles.card}>
          <Pressable 
            style={styles.button}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Alert.alert('Privacy Policy', 'This would open the privacy policy in a web view.');
            }}
          >
            <ThemedText style={[styles.buttonText, { color: tintColor }]}>Privacy Policy</ThemedText>
          </Pressable>
          
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />
          
          <Pressable 
            style={styles.button}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Alert.alert('Terms of Service', 'This would open the terms of service in a web view.');
            }}
          >
            <ThemedText style={[styles.buttonText, { color: tintColor }]}>Terms of Service</ThemedText>
          </Pressable>
          
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />
          
          <Pressable 
            style={styles.button}
            onPress={handleSignOut}
          >
            <ThemedText style={[styles.buttonText, { color: '#FF3B30' }]}>Sign Out</ThemedText>
          </Pressable>
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  goalOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  goalPill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedGoal: {
    backgroundColor: '#e0f2f7',
    borderWidth: 1,
    borderColor: '#0a7ea4',
  },
  goalText: {
    fontSize: 12,
    fontWeight: '500',
  },
  button: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
}); 