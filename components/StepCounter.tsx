import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import Colors from '@/constants/Colors';

interface StepCounterProps {
  steps: number;
  goal: number;
  colorScheme: 'light' | 'dark';
}

export const StepCounter: React.FC<StepCounterProps> = ({ 
  steps, 
  goal,
  colorScheme
}) => {
  const percentage = Math.min(Math.round((steps / goal) * 100), 100);
  
  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <View>
          <ThemedText style={styles.value}>{steps.toLocaleString()}</ThemedText>
          <ThemedText style={styles.label}>Steps Today</ThemedText>
        </View>
        
        <View style={styles.goalContainer}>
          <ThemedText style={styles.percentage}>{percentage}%</ThemedText>
          <ThemedText style={styles.goal}>of {goal.toLocaleString()}</ThemedText>
        </View>
      </View>
      
      <View style={[styles.progressBackground, { backgroundColor: Colors[colorScheme].borderColor }]}>
        <View 
          style={[
            styles.progressFill,
            { 
              width: `${percentage}%`,
              backgroundColor: '#FF9F1C' 
            }
          ]} 
        />
      </View>
      
      <View style={styles.milestones}>
        <ThemedText style={styles.milestone}>0</ThemedText>
        <ThemedText style={styles.milestone}>2.5k</ThemedText>
        <ThemedText style={styles.milestone}>5k</ThemedText>
        <ThemedText style={styles.milestone}>7.5k</ThemedText>
        <ThemedText style={styles.milestone}>10k</ThemedText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    opacity: 0.7,
  },
  goalContainer: {
    alignItems: 'flex-end',
  },
  percentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9F1C',
  },
  goal: {
    fontSize: 12,
    opacity: 0.7,
  },
  progressBackground: {
    height: 8,
    borderRadius: 4,
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  milestones: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  milestone: {
    fontSize: 10,
    opacity: 0.5,
  }
}); 