import { StyleSheet, ScrollView, View, Pressable, Switch, Alert, Modal, ViewStyle, TextStyle } from 'react-native';
import React, { useState, useEffect } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useAsyncStorage } from '@/hooks/useAsyncStorage';

// Define styles type
type Styles = {
  container: ViewStyle;
  contentContainer: ViewStyle;
  header: ViewStyle;
  title: TextStyle;
  section: ViewStyle;
  sectionHeader: TextStyle;
  card: ViewStyle;
  settingRow: ViewStyle;
  pressableRow: ViewStyle;
  settingInfo: ViewStyle;
  iconContainer: ViewStyle;
  settingLabel: TextStyle;
  settingDescription: TextStyle;
  divider: ViewStyle;
  button: ViewStyle;
  buttonText: TextStyle;
  modalOverlay: ViewStyle;
  modalContent: ViewStyle;
  modalTitle: TextStyle;
  optionsList: ViewStyle;
  optionItem: ViewStyle;
  optionText: TextStyle;
};

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

type OptionModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (value: number) => void;
  options: { value: number; label: string }[];
  selectedValue: number;
  title: string;
  color: string;
};

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    marginLeft: 4,
  },
  card: {
    borderRadius: 20,
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
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  pressableRow: {
    opacity: 1,
    transform: [{ scale: 1 }],
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontSize: 17,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  optionsList: {
    paddingHorizontal: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 4,
  },
  optionText: {
    fontSize: 17,
  },
});

const OptionModal = ({ visible, onClose, onSelect, options, selectedValue, title, color }: OptionModalProps) => {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#1c1c1e' : '#fff';
  const overlayColor = colorScheme === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable 
        style={[styles.modalOverlay, { backgroundColor: overlayColor }]} 
        onPress={onClose}
      >
        <View style={[styles.modalContent, { backgroundColor }]}>
          <ThemedText style={styles.modalTitle}>{title}</ThemedText>
          <View style={styles.optionsList}>
            {options.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.optionItem,
                  selectedValue === option.value && { backgroundColor: `${color}15` }
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onSelect(option.value);
                  onClose();
                }}
              >
                <ThemedText style={[
                  styles.optionText,
                  selectedValue === option.value && { color, fontWeight: '600' }
                ]}>
                  {option.label}
                </ThemedText>
                {selectedValue === option.value && (
                  <IconSymbol 
                    size={20} 
                    name="checkmark" 
                    color={color} 
                  />
                )}
              </Pressable>
            ))}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

export default function SettingsScreen() {
  const colorScheme = useColorScheme() || 'light';
  const tintColor = Colors[colorScheme].tint;
  const router = useRouter();
  const dividerColor = colorScheme === 'dark' ? Colors[colorScheme].borderColor : '#e0e0e0';

  // Modal visibility state
  const [activeModal, setActiveModal] = useState<'water' | 'sleep' | 'steps' | null>(null);

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

  // Options for dropdowns
  const waterOptions = [
    { value: 2000, label: '2000 ml' },
    { value: 2500, label: '2500 ml' },
    { value: 3000, label: '3000 ml' },
    { value: 3500, label: '3500 ml' },
  ];

  const sleepOptions = [
    { value: 6, label: '6 hours' },
    { value: 7, label: '7 hours' },
    { value: 8, label: '8 hours' },
    { value: 9, label: '9 hours' },
  ];

  const stepOptions = [
    { value: 6000, label: '6,000 steps' },
    { value: 8000, label: '8,000 steps' },
    { value: 10000, label: '10,000 steps' },
    { value: 12000, label: '12,000 steps' },
  ];

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

  const showSettingUpdateAlert = (settingName: string, value: any) => {
    let message = '';
    switch (settingName) {
      case 'waterGoal':
        message = `Water goal updated to ${value} ml per day`;
        break;
      case 'sleepGoal':
        message = `Sleep goal updated to ${value} hours per night`;
        break;
      case 'stepGoal':
        message = `Step goal updated to ${value.toLocaleString()} steps per day`;
        break;
      case 'waterReminders':
        message = `Water reminders ${value ? 'enabled' : 'disabled'}`;
        break;
      case 'breakReminders':
        message = `Break reminders ${value ? 'enabled' : 'disabled'}`;
        break;
      case 'sleepReminders':
        message = `Sleep reminders ${value ? 'enabled' : 'disabled'}`;
        break;
      case 'darkMode':
        message = `Dark mode ${value ? 'enabled' : 'disabled'}`;
        break;
      case 'syncEnabled':
        message = `Auto-sync ${value ? 'enabled' : 'disabled'}`;
        break;
      default:
        message = 'Setting updated successfully';
    }
    
    Alert.alert(
      'Setting Updated',
      message,
      [{ text: 'OK', style: 'default' }],
      { cancelable: true }
    );
  };

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
      
      // Show alert notification
      showSettingUpdateAlert(key, value);
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to save settings',
        [{ text: 'OK', style: 'default' }],
        { cancelable: true }
      );
      console.error(error);
    }
  };

  const handleSignOut = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { 
          text: 'Cancel',
          style: 'cancel'
        },
        { 
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Success',
              'You have been signed out successfully.',
              [{ text: 'OK', style: 'default' }],
              { cancelable: true }
            );
          }
        }
      ],
      { cancelable: true }
    );
  };

  const sendTestNotification = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // First show a confirmation
    Alert.alert(
      'Send Test Notification?',
      'This will simulate a notification to test the notification system.',
      [
        { 
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Send',
          style: 'default',
          onPress: () => {
            // Wait a short moment before showing the "notification"
            setTimeout(() => {
              Alert.alert(
                '🔔 Test Notification',
                'This is a test notification from HackOClock. If you see this, the notification system is working!',
                [
                  {
                    text: 'Dismiss',
                    style: 'cancel'
                  },
                  {
                    text: 'Open App',
                    style: 'default',
                    onPress: () => {
                      Alert.alert(
                        'Success',
                        'Notification interaction successful! In a real notification, this would open the relevant screen.',
                        [{ text: 'OK', style: 'default' }],
                        { cancelable: true }
                      );
                    }
                  }
                ],
                { cancelable: true }
              );
            }, 1000); // 1 second delay to simulate notification delivery
          }
        }
      ],
      { cancelable: true }
    );
  };

  return (
    <>
      <ScrollView 
        style={[
          styles.container,
          { backgroundColor: colorScheme === 'dark' ? '#000' : '#f6f6f6' }
        ]} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText style={styles.title}>Settings</ThemedText>
        </View>

        {/* Goals Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionHeader}>Goals</ThemedText>
          
          <ThemedView style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff' }]}>
            <Pressable 
              style={[styles.settingRow, styles.pressableRow]}
              onPress={() => setActiveModal('water')}
            >
              <View style={styles.settingInfo}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(10, 126, 164, 0.1)' }]}>
                  <IconSymbol size={20} name="drop.fill" color="#0a7ea4" />
                </View>
                <View>
                  <ThemedText style={styles.settingLabel}>Water Goal</ThemedText>
                  <ThemedText style={styles.settingDescription}>{waterGoal} ml per day</ThemedText>
                </View>
              </View>
              <IconSymbol size={18} name="chevron.right" color={Colors[colorScheme].text} />
            </Pressable>

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            <Pressable 
              style={[styles.settingRow, styles.pressableRow]}
              onPress={() => setActiveModal('sleep')}
            >
              <View style={styles.settingInfo}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(126, 90, 230, 0.1)' }]}>
                  <IconSymbol size={20} name="bed.double.fill" color="#7e5ae6" />
                </View>
                <View>
                  <ThemedText style={styles.settingLabel}>Sleep Goal</ThemedText>
                  <ThemedText style={styles.settingDescription}>{sleepGoal} hours per night</ThemedText>
                </View>
              </View>
              <IconSymbol size={18} name="chevron.right" color={Colors[colorScheme].text} />
            </Pressable>

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            <Pressable 
              style={[styles.settingRow, styles.pressableRow]}
              onPress={() => setActiveModal('steps')}
            >
              <View style={styles.settingInfo}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
                  <IconSymbol size={20} name="figure.walk" color="#4CAF50" />
                </View>
                <View>
                  <ThemedText style={styles.settingLabel}>Step Goal</ThemedText>
                  <ThemedText style={styles.settingDescription}>{stepGoal.toLocaleString()} steps per day</ThemedText>
                </View>
              </View>
              <IconSymbol size={18} name="chevron.right" color={Colors[colorScheme].text} />
            </Pressable>
          </ThemedView>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionHeader}>Notifications</ThemedText>
          
          <ThemedView style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff' }]}>
            <Pressable 
              style={[styles.settingRow, styles.pressableRow]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/reminders');
              }}
            >
              <View style={styles.settingInfo}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(10, 126, 164, 0.1)' }]}>
                  <IconSymbol size={20} name="bell.fill" color="#0a7ea4" />
                </View>
                <View>
                  <ThemedText style={styles.settingLabel}>Manage All Reminders</ThemedText>
                  <ThemedText style={styles.settingDescription}>Advanced reminder settings</ThemedText>
                </View>
              </View>
              <IconSymbol size={18} name="chevron.right" color={Colors[colorScheme].text} />
            </Pressable>

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            <Pressable 
              style={[styles.settingRow, styles.pressableRow]}
              onPress={sendTestNotification}
            >
              <View style={styles.settingInfo}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 149, 0, 0.1)' }]}>
                  <IconSymbol size={20} name="bell.badge.fill" color="#FF9500" />
                </View>
                <View>
                  <ThemedText style={styles.settingLabel}>Test Notifications</ThemedText>
                  <ThemedText style={styles.settingDescription}>Send a test notification</ThemedText>
                </View>
              </View>
              <IconSymbol size={18} name="paperplane.fill" color="#FF9500" />
            </Pressable>

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />
            
            {[
              {
                icon: "drop.fill",
                color: "#0a7ea4",
                label: "Water Reminders",
                description: "Every 2 hours, 8 AM - 8 PM",
                value: waterReminders,
                setter: setWaterReminders,
                key: 'waterReminders'
              },
              {
                icon: "figure.walk",
                color: "#4CAF50",
                label: "Break Reminders",
                description: "Every 1 hour, during work hours",
                value: breakReminders,
                setter: setBreakReminders,
                key: 'breakReminders'
              },
              {
                icon: "bed.double.fill",
                color: "#7e5ae6",
                label: "Sleep Wind-down",
                description: "30 minutes before bedtime",
                value: sleepReminders,
                setter: setSleepReminders,
                key: 'sleepReminders'
              }
            ].map((item, index, array) => (
              <React.Fragment key={item.key}>
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
                      <IconSymbol size={18} name={item.icon} color={item.color} />
                    </View>
                    <View>
                      <ThemedText style={styles.settingLabel}>{item.label}</ThemedText>
                      <ThemedText style={styles.settingDescription}>{item.description}</ThemedText>
                    </View>
                  </View>
                  <Switch
                    trackColor={{ false: '#767577', true: `${item.color}40` }}
                    thumbColor={item.value ? item.color : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={(value) => updateSetting(item.key as keyof UserSettings, value, item.setter)}
                    value={item.value}
                  />
                </View>
                {index < array.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: dividerColor }]} />
                )}
              </React.Fragment>
            ))}
          </ThemedView>
        </View>

        {/* App Preferences Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionHeader}>App Preferences</ThemedText>
          
          <ThemedView style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff' }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(153, 102, 255, 0.1)' }]}>
                  <IconSymbol size={18} name="moon.stars.fill" color="#9966FF" />
                </View>
                <ThemedText style={styles.settingLabel}>Dark Mode</ThemedText>
              </View>
              <Switch
                trackColor={{ false: '#767577', true: '#9966FF40' }}
                thumbColor={isDarkMode ? '#9966FF' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={(value) => updateSetting('darkMode', value, setIsDarkMode)}
                value={isDarkMode}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(10, 126, 164, 0.1)' }]}>
                  <IconSymbol size={18} name="arrow.clockwise" color="#0a7ea4" />
                </View>
                <View>
                  <ThemedText style={styles.settingLabel}>Auto-sync</ThemedText>
                  <ThemedText style={styles.settingDescription}>Sync data automatically</ThemedText>
                </View>
              </View>
              <Switch
                trackColor={{ false: '#767577', true: '#0a7ea440' }}
                thumbColor={syncEnabled ? '#0a7ea4' : '#f4f3f4'}
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
          
          <ThemedView style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff' }]}>
            {[
              {
                label: "Privacy Policy",
                color: tintColor,
                onPress: () => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert('Privacy Policy', 'This would open the privacy policy in a web view.');
                }
              },
              {
                label: "Terms of Service",
                color: tintColor,
                onPress: () => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert('Terms of Service', 'This would open the terms of service in a web view.');
                }
              },
              {
                label: "Sign Out",
                color: '#FF3B30',
                onPress: handleSignOut
              }
            ].map((item, index, array) => (
              <React.Fragment key={item.label}>
                <Pressable 
                  style={[styles.button, styles.pressableRow]}
                  onPress={item.onPress}
                >
                  <ThemedText style={[styles.buttonText, { color: item.color }]}>{item.label}</ThemedText>
                </Pressable>
                {index < array.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: dividerColor }]} />
                )}
              </React.Fragment>
            ))}
          </ThemedView>
        </View>
      </ScrollView>

      {/* Option Modals */}
      <OptionModal
        visible={activeModal === 'water'}
        onClose={() => setActiveModal(null)}
        onSelect={(value) => {
          updateSetting('waterGoal', value, setWaterGoal);
          setActiveModal(null);
        }}
        options={waterOptions}
        selectedValue={waterGoal}
        title="Water Goal"
        color="#0a7ea4"
      />

      <OptionModal
        visible={activeModal === 'sleep'}
        onClose={() => setActiveModal(null)}
        onSelect={(value) => {
          updateSetting('sleepGoal', value, setSleepGoal);
          setActiveModal(null);
        }}
        options={sleepOptions}
        selectedValue={sleepGoal}
        title="Sleep Goal"
        color="#7e5ae6"
      />

      <OptionModal
        visible={activeModal === 'steps'}
        onClose={() => setActiveModal(null)}
        onSelect={(value) => {
          updateSetting('stepGoal', value, setStepGoal);
          setActiveModal(null);
        }}
        options={stepOptions}
        selectedValue={stepGoal}
        title="Step Goal"
        color="#4CAF50"
      />
    </>
  );
} 