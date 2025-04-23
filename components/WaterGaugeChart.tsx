import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, G } from 'react-native-svg';
import { ThemedText } from './ThemedText';
import Colors from '@/constants/Colors';

interface WaterGaugeChartProps {
  waterAmount: number;
  waterGoal: number;
  colorScheme: 'light' | 'dark';
}

export const WaterGaugeChart: React.FC<WaterGaugeChartProps> = ({ 
  waterAmount, 
  waterGoal,
  colorScheme
}) => {
  const percentage = Math.min(Math.round((waterAmount / waterGoal) * 100), 100);
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;
  
  const getWaterEmoji = () => {
    if (percentage < 25) return '💧';
    if (percentage < 50) return '🚰';
    if (percentage < 75) return '💦';
    return '🌊';
  };

  return (
    <View style={styles.container}>
      <Svg width={150} height={150} viewBox="0 0 120 120">
        <G rotation="-90" origin="60, 60">
          {/* Background Circle */}
          <Circle
            cx="60"
            cy="60"
            r={radius}
            stroke={Colors[colorScheme].borderColor}
            strokeWidth="5"
            fill="transparent"
          />
          
          {/* Progress Circle */}
          <Circle
            cx="60"
            cy="60"
            r={radius}
            stroke="#4ECDC4"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            fill="transparent"
          />
        </G>
        
        {/* Droplet shape in the middle */}
        <Path
          d="M60,40 C60,40 40,60 40,75 C40,90 60,90 60,75 C60,90 80,90 80,75 C80,60 60,40 60,40 Z"
          fill="rgba(78, 205, 196, 0.3)"
        />
      </Svg>
      
      <View style={styles.percentageContainer}>
        <ThemedText style={styles.percentage}>{percentage}%</ThemedText>
        <ThemedText style={styles.emoji}>{getWaterEmoji()}</ThemedText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentage: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  emoji: {
    fontSize: 24,
    marginTop: 5,
  }
}); 