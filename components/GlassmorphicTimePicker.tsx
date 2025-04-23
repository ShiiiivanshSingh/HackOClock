import React, { useState } from 'react';
import { StyleSheet, View, Pressable, Modal, ScrollView, Dimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/IconSymbol';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TimePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectTime: (hours: number, minutes: number) => void;
  initialHours?: number;
  initialMinutes?: number;
  title?: string;
}

const TIME_ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;

export default function GlassmorphicTimePicker({
  visible,
  onClose,
  onSelectTime,
  initialHours = 9,
  initialMinutes = 0,
  title = 'Select Time'
}: TimePickerProps) {
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  
  const [hours, setHours] = useState(initialHours);
  const [minutes, setMinutes] = useState(initialMinutes);
  
  // Time options
  const hoursOptions = Array.from({ length: 24 }, (_, i) => i);
  const minutesOptions = Array.from({ length: 60 }, (_, i) => i);
  
  // Calculate initial scroll positions
  const initialHourScrollPos = initialHours * TIME_ITEM_HEIGHT;
  const initialMinuteScrollPos = initialMinutes * TIME_ITEM_HEIGHT;
  
  const handleConfirm = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSelectTime(hours, minutes);
    onClose();
  };

  // Preset frequency options for quick selection
  const frequencyPresets = [
    { label: 'Every hour', value: 'hourly' },
    { label: 'Every 2 hours', value: '2hours' },
    { label: 'Morning only', value: 'morning' },
    { label: 'Evening only', value: 'evening' },
    { label: 'Custom', value: 'custom' }
  ];

  const handleHourScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const selectedIndex = Math.round(offsetY / TIME_ITEM_HEIGHT);
    if (selectedIndex >= 0 && selectedIndex < hoursOptions.length) {
      if (hours !== selectedIndex) {
        setHours(selectedIndex);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const handleMinuteScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const selectedIndex = Math.round(offsetY / TIME_ITEM_HEIGHT);
    if (selectedIndex >= 0 && selectedIndex < minutesOptions.length) {
      if (minutes !== selectedIndex) {
        setMinutes(selectedIndex);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        <BlurView 
          intensity={colorScheme === 'dark' ? 50 : 80} 
          tint={colorScheme === 'dark' ? 'dark' : 'light'} 
          style={styles.blurContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <ThemedText style={styles.title}>{title}</ThemedText>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <IconSymbol size={24} name="xmark" color={Colors[colorScheme ?? 'light'].text} />
              </Pressable>
            </View>
            
            {/* Frequency Presets */}
            <View style={styles.presetContainer}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.presetScroll}
              >
                {frequencyPresets.map((preset) => (
                  <Pressable 
                    key={preset.value}
                    style={styles.presetChip}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      // Here you would handle the frequency preset selection
                    }}
                  >
                    <ThemedText style={styles.presetText}>{preset.label}</ThemedText>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
            
            {/* Time Picker Wheels */}
            <View style={styles.timePickerContainer}>
              <View style={styles.pickerLabelContainer}>
                <ThemedText style={styles.pickerLabel}>Hours</ThemedText>
                <ThemedText style={styles.pickerLabel}>Minutes</ThemedText>
              </View>
              
              <View style={styles.wheelContainer}>
                {/* Highlight for selected time */}
                <View style={styles.selectionHighlight} />
                
                {/* Hours Wheel */}
                <View style={styles.wheelWrapper}>
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    snapToInterval={TIME_ITEM_HEIGHT}
                    decelerationRate="fast"
                    onMomentumScrollEnd={handleHourScroll}
                    contentContainerStyle={{
                      paddingVertical: TIME_ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2)
                    }}
                    contentOffset={{ x: 0, y: initialHourScrollPos }}
                  >
                    {hoursOptions.map((hour) => (
                      <View key={`hour-${hour}`} style={styles.timeItem}>
                        <ThemedText 
                          style={[
                            styles.timeText,
                            hour === hours && styles.selectedTimeText
                          ]}
                        >
                          {hour.toString().padStart(2, '0')}
                        </ThemedText>
                      </View>
                    ))}
                  </ScrollView>
                </View>
                
                {/* Separator */}
                <ThemedText style={styles.timeSeparator}>:</ThemedText>
                
                {/* Minutes Wheel */}
                <View style={styles.wheelWrapper}>
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    snapToInterval={TIME_ITEM_HEIGHT}
                    decelerationRate="fast"
                    onMomentumScrollEnd={handleMinuteScroll}
                    contentContainerStyle={{
                      paddingVertical: TIME_ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2)
                    }}
                    contentOffset={{ x: 0, y: initialMinuteScrollPos }}
                  >
                    {minutesOptions.map((minute) => (
                      <View key={`minute-${minute}`} style={styles.timeItem}>
                        <ThemedText 
                          style={[
                            styles.timeText,
                            minute === minutes && styles.selectedTimeText
                          ]}
                        >
                          {minute.toString().padStart(2, '0')}
                        </ThemedText>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>
            
            {/* Selected Time Preview */}
            <View style={styles.previewContainer}>
              <ThemedText style={styles.previewLabel}>Selected Time:</ThemedText>
              <ThemedText style={styles.previewTime}>
                {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}
              </ThemedText>
            </View>
            
            {/* Action Buttons */}
            <View style={styles.actionContainer}>
              <Pressable 
                style={[styles.actionButton, styles.cancelButton]} 
                onPress={onClose}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </Pressable>
              <Pressable 
                style={[styles.actionButton, styles.confirmButton, { backgroundColor: tintColor }]} 
                onPress={handleConfirm}
              >
                <ThemedText style={styles.confirmButtonText}>Confirm</ThemedText>
              </Pressable>
            </View>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  blurContainer: {
    width: SCREEN_WIDTH * 0.9,
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  presetContainer: {
    marginBottom: 20,
  },
  presetScroll: {
    paddingVertical: 8,
  },
  presetChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.2)',
  },
  presetText: {
    fontSize: 14,
  },
  timePickerContainer: {
    marginBottom: 20,
  },
  pickerLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  wheelContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: TIME_ITEM_HEIGHT * VISIBLE_ITEMS,
    position: 'relative',
  },
  selectionHighlight: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: TIME_ITEM_HEIGHT,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    borderRadius: 10,
    top: TIME_ITEM_HEIGHT * 2,
  },
  wheelWrapper: {
    flex: 1,
    height: TIME_ITEM_HEIGHT * VISIBLE_ITEMS,
    overflow: 'hidden',
  },
  timeItem: {
    height: TIME_ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 22,
  },
  selectedTimeText: {
    fontWeight: 'bold',
    fontSize: 24,
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  previewContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  previewLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  previewTime: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    marginRight: 10,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  confirmButton: {
    backgroundColor: '#0a7ea4',
  },
  cancelButtonText: {
    fontSize: 16,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 