import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { G, Circle, Path, Rect } from 'react-native-svg';
import { ThemedText } from './ThemedText';
import Colors from '@/constants/Colors';

interface SleepDurationChartProps {
  sleepHours: number;
  sleepData?: number[];
  colorScheme: 'light' | 'dark';
}

export const SleepDurationChart: React.FC<SleepDurationChartProps> = ({ 
  sleepHours,
  sleepData = [],
  colorScheme
}) => {
  // Calculate quality score based on sleep duration
  const getSleepQuality = () => {
    if (sleepHours < 6) return 'Poor';
    if (sleepHours < 7) return 'Fair';
    if (sleepHours < 8) return 'Good';
    return 'Excellent';
  };
  
  const getQualityColor = () => {
    if (sleepHours < 6) return '#FF6B6B';
    if (sleepHours < 7) return '#FFD166';
    if (sleepHours < 8) return '#06D6A0';
    return '#118AB2';
  };

  return (
    <View style={styles.container}>
      <Svg width={100} height={100} viewBox="0 0 100 100">
        {/* Moon shape */}
        <G>
          <Circle
            cx="50"
            cy="50"
            r="35"
            fill="#6C63FF"
            opacity={0.2}
          />
          <Path
            d="M50,15 A35,35 0 1,1 35,71 A25,25 0 1,0 50,15"
            fill="#6C63FF"
            opacity={0.5}
          />
        </G>
        
        {/* Sleep quality indicator */}
        <Circle
          cx="50"
          cy="50"
          r="20"
          fill={getQualityColor()}
          opacity={0.8}
        />
      </Svg>
      
      {sleepData.length > 0 && (
        <View style={styles.weekChart}>
          {sleepData.map((hours, index) => {
            const height = (hours / 10) * 30; // Scale to max height of 30
            return (
              <View key={index} style={styles.barContainer}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      height, 
                      backgroundColor: hours < 6 ? '#FF6B6B' : 
                                      hours < 7 ? '#FFD166' : 
                                      hours < 8 ? '#06D6A0' : '#118AB2' 
                    }
                  ]} 
                />
              </View>
            );
          })}
        </View>
      )}
      
      <View style={styles.qualityIndicator}>
        <ThemedText style={[styles.qualityText, { color: getQualityColor() }]}>
          {getSleepQuality()}
        </ThemedText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 30,
    marginTop: 10,
    width: '100%',
    justifyContent: 'space-around',
  },
  barContainer: {
    width: 4,
    height: 30,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 4,
    borderRadius: 2,
  },
  qualityIndicator: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
  },
  qualityText: {
    fontSize: 14,
    fontWeight: '600',
  }
}); 