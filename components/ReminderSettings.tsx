import React, { useState } from 'react';
import { StyleSheet, View, Pressable, Switch } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import * as Haptics from 'expo-haptics';
import GlassmorphicTimePicker from './GlassmorphicTimePicker';

interface Reminder {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: React.ComponentProps<typeof IconSymbol>['name'];
  iconColor: string;
  enabled: boolean;
  time: {
    hours: number;
    minutes: number;
  };
  frequency: string;
}

export default function ReminderSettings() {
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: '1',
      type: 'water',
      title: 'Water Reminders',
      description: 'Every 2 hours, 8 AM - 8 PM',
      icon: 'drop.fill',
      iconColor: '#0a7ea4',
      enabled: true,
      time: { hours: 8, minutes: 0 },
      frequency: 'Every 2 hours'
    },
    {
      id: '2',
      type: 'break',
      title: 'Break Reminders',
      description: 'Every hour, during work hours',
      icon: 'figure.walk',
      iconColor: '#4CAF50',
      enabled: true,
      time: { hours: 9, minutes: 0 },
      frequency: 'Every hour'
    },
    {
      id: '3',
      type: 'sleep',
      title: 'Sleep Wind-down',
      description: '30 minutes before bedtime',
      icon: 'bed.double.fill',
      iconColor: '#7e5ae6',
      enabled: true,
      time: { hours: 21, minutes: 30 },
      frequency: 'Daily'
    }
  ]);
  
  const [activeTimePicker, setActiveTimePicker] = useState<string | null>(null);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  const toggleReminder = (id: string, value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setReminders(prev => 
      prev.map(reminder => 
        reminder.id === id 
          ? { ...reminder, enabled: value } 
          : reminder
      )
    );
  };

  const openTimePicker = (reminder: Reminder) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setEditingReminder(reminder);
    setActiveTimePicker(reminder.id);
  };

  const handleTimeSelected = (hours: number, minutes: number) => {
    if (!editingReminder) return;
    
    // Update the reminder with the new time
    setReminders(prev => 
      prev.map(reminder => 
        reminder.id === editingReminder.id 
          ? { 
              ...reminder, 
              time: { hours, minutes },
              description: updateReminderDescription(reminder, hours, minutes)
            } 
          : reminder
      )
    );
    
    setEditingReminder(null);
    setActiveTimePicker(null);
  };

  // Helper to update the description based on new time
  const updateReminderDescription = (reminder: Reminder, hours: number, minutes: number): string => {
    const timeString = `${hours}:${minutes.toString().padStart(2, '0')}`;
    
    switch(reminder.type) {
      case 'water':
        return `Every 2 hours, starting at ${timeString}`;
      case 'break':
        return `Every hour, during work hours (${timeString} - 17:00)`;
      case 'sleep':
        return `${timeString}, 30 minutes before bedtime`;
      default:
        return reminder.description;
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Reminders</ThemedText>
      
      {reminders.map((reminder) => (
        <ThemedView key={reminder.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <IconSymbol size={24} name={reminder.icon} color={reminder.iconColor} />
            </View>
            <View style={styles.titleContainer}>
              <ThemedText style={styles.reminderTitle}>{reminder.title}</ThemedText>
              <ThemedText style={styles.reminderDescription}>{reminder.description}</ThemedText>
            </View>
            <Switch
              trackColor={{ false: '#767577', true: '#a1d8e6' }}
              thumbColor={reminder.enabled ? tintColor : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={(value) => toggleReminder(reminder.id, value)}
              value={reminder.enabled}
            />
          </View>
          
          <View style={styles.actionRow}>
            <View style={styles.timeDisplay}>
              <IconSymbol size={16} name="clock" color={Colors[colorScheme ?? 'light'].text} />
              <ThemedText style={styles.timeText}>
                {reminder.time.hours.toString().padStart(2, '0')}:{reminder.time.minutes.toString().padStart(2, '0')}
              </ThemedText>
            </View>
            
            <Pressable 
              style={styles.editButton}
              onPress={() => openTimePicker(reminder)}
              accessibilityLabel={`Edit ${reminder.title}`}
              accessibilityHint="Opens time picker to change reminder time"
            >
              <ThemedText style={[styles.editButtonText, { color: tintColor }]}>Edit</ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      ))}
      
      {/* Time Picker Modal */}
      {editingReminder && (
        <GlassmorphicTimePicker
          visible={!!activeTimePicker}
          onClose={() => {
            setActiveTimePicker(null);
            setEditingReminder(null);
          }}
          onSelectTime={handleTimeSelected}
          initialHours={editingReminder.time.hours}
          initialMinutes={editingReminder.time.minutes}
          title={`Set Time for ${editingReminder.title}`}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f5f5f7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 16,
  },
  reminderTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  reminderDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 15,
    marginLeft: 8,
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 