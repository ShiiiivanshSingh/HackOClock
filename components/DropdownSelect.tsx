import React, { useState } from 'react';
import { StyleSheet, View, Modal, Pressable, FlatList, Dimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DropdownOption {
  label: string;
  value: any;
  icon?: string;
  emoji?: string;
}

interface DropdownSelectProps {
  options: DropdownOption[];
  selectedValue: any;
  onSelect: (value: any) => void;
  title?: string;
  placeholder?: string;
}

export function DropdownSelect({
  options,
  selectedValue,
  onSelect,
  title = 'Select an option',
  placeholder = 'Select...'
}: DropdownSelectProps) {
  const colorScheme = useColorScheme();
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find(option => option.value === selectedValue);

  const handleSelect = (value: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelect(value);
    setModalVisible(false);
  };

  const openModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setModalVisible(true);
  };

  return (
    <>
      <Pressable
        style={[
          styles.dropdownButton,
          { backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : '#F5F5F5' }
        ]}
        onPress={openModal}
      >
        <View style={styles.selectedContainer}>
          {selectedOption?.emoji && (
            <ThemedText style={styles.emoji}>{selectedOption.emoji}</ThemedText>
          )}
          {selectedOption?.icon && (
            <IconSymbol name={selectedOption.icon} size={20} color="#4CAF50" />
          )}
          <ThemedText style={styles.selectedText}>
            {selectedOption ? selectedOption.label : placeholder}
          </ThemedText>
        </View>
        <IconSymbol name="chevron.down" size={16} color="#999" />
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Pressable style={styles.backdrop} onPress={() => setModalVisible(false)} />
          
          <BlurView
            intensity={colorScheme === 'dark' ? 50 : 80}
            tint={colorScheme === 'dark' ? 'dark' : 'light'}
            style={styles.blurContainer}
          >
            <View style={[
              styles.modalContent,
              { backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#FFFFFF' }
            ]}>
              <View style={styles.header}>
                <ThemedText style={styles.title}>{title}</ThemedText>
                <Pressable onPress={() => setModalVisible(false)} style={styles.closeButton}>
                  <IconSymbol name="xmark" size={20} color="#999" />
                </Pressable>
              </View>
              
              <FlatList
                data={options}
                keyExtractor={(item) => item.value.toString()}
                renderItem={({ item }) => (
                  <Pressable
                    style={[
                      styles.optionItem,
                      selectedValue === item.value && styles.selectedItem
                    ]}
                    onPress={() => handleSelect(item.value)}
                  >
                    <View style={styles.optionContent}>
                      {item.emoji && (
                        <ThemedText style={styles.emoji}>{item.emoji}</ThemedText>
                      )}
                      {item.icon && (
                        <IconSymbol 
                          name={item.icon} 
                          size={20} 
                          color={selectedValue === item.value ? "#4CAF50" : "#999"} 
                        />
                      )}
                      <ThemedText style={[
                        styles.optionLabel,
                        selectedValue === item.value && styles.selectedOptionLabel
                      ]}>
                        {item.label}
                      </ThemedText>
                    </View>
                    
                    {selectedValue === item.value && (
                      <IconSymbol name="checkmark" size={18} color="#4CAF50" />
                    )}
                  </Pressable>
                )}
                contentContainerStyle={styles.optionsList}
              />
            </View>
          </BlurView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.2)',
  },
  selectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedText: {
    fontSize: 16,
  },
  emoji: {
    fontSize: 22,
    marginRight: 12,
  },
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
    borderRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  optionsList: {
    paddingVertical: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 16,
  },
  selectedItem: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  selectedOptionLabel: {
    fontWeight: '600',
    color: '#4CAF50',
  },
}); 