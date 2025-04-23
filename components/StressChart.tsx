import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import Svg, { Circle, G, Path, Line } from 'react-native-svg';
import Colors from '@/constants/Colors';

interface StressChartProps {
  stressLevel: number; // 1-5 scale where 1 is low and 5 is high
  stressData?: number[];
  colorScheme: 'light' | 'dark';
}

export const StressChart: React.FC<StressChartProps> = ({ 
  stressLevel, 
  stressData = [],
  colorScheme
}) => {
  const getStressLabel = () => {
    if (stressLevel <= 1) return 'Very Low';
    if (stressLevel === 2) return 'Low';
    if (stressLevel === 3) return 'Moderate';
    if (stressLevel === 4) return 'High';
    return 'Very High';
  };
  
  const getStressColor = () => {
    if (stressLevel <= 1) return '#06D6A0';
    if (stressLevel === 2) return '#4ECDC4';
    if (stressLevel === 3) return '#FFD166';
    if (stressLevel === 4) return '#FF9F1C';
    return '#FF6B6B';
  };

  // Convert stress level to angle for gauge (0-180 degrees)
  const angle = (stressLevel / 5) * 180;
  const radians = (angle - 90) * (Math.PI / 180);
  const handX = 50 + 30 * Math.cos(radians);
  const handY = 50 + 30 * Math.sin(radians);

  return (
    <View style={styles.container}>
      <Svg width={100} height={80} viewBox="0 0 100 100">
        {/* Stress gauge */}
        <G>
          {/* Gauge background */}
          <Path
            d="M20,80 A40,40 0 0,1 80,80"
            stroke={Colors[colorScheme].borderColor}
            strokeWidth="4"
            fill="transparent"
          />
          
          {/* Green section (low stress) */}
          <Path
            d="M20,80 A40,40 0 0,1 40,51"
            stroke="#06D6A0"
            strokeWidth="4"
            fill="transparent"
          />
          
          {/* Yellow section (medium stress) */}
          <Path
            d="M40,51 A40,40 0 0,1 60,51"
            stroke="#FFD166"
            strokeWidth="4"
            fill="transparent"
          />
          
          {/* Red section (high stress) */}
          <Path
            d="M60,51 A40,40 0 0,1 80,80"
            stroke="#FF6B6B"
            strokeWidth="4"
            fill="transparent"
          />
          
          {/* Gauge needle */}
          <Line
            x1="50"
            y1="80"
            x2={handX}
            y2={handY}
            stroke={getStressColor()}
            strokeWidth="2"
            strokeLinecap="round"
          />
          
          <Circle
            cx="50"
            cy="80"
            r="4"
            fill={getStressColor()}
          />
        </G>
      </Svg>
      
      <ThemedText style={[styles.stressValue, { color: getStressColor() }]}>
        {getStressLabel()}
      </ThemedText>
      
      {stressData.length > 0 && (
        <View style={styles.weekData}>
          {stressData.map((level, index) => (
            <View key={index} style={styles.dayContainer}>
              <View 
                style={[
                  styles.stressIndicator, 
                  { 
                    backgroundColor: level <= 1 ? '#06D6A0' : 
                                     level === 2 ? '#4ECDC4' :
                                     level === 3 ? '#FFD166' :
                                     level === 4 ? '#FF9F1C' : '#FF6B6B'
                  }
                ]} 
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stressValue: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 5,
  },
  weekData: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  dayContainer: {
    alignItems: 'center',
  },
  stressIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  }
}); 