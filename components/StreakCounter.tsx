import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import Svg, { Circle, G, Path } from 'react-native-svg';
import Colors from '@/constants/Colors';

interface StreakCounterProps {
  streak: number;
  colorScheme: 'light' | 'dark';
}

export const StreakCounter: React.FC<StreakCounterProps> = ({ 
  streak, 
  colorScheme
}) => {
  return (
    <View style={styles.container}>
      <Svg width={80} height={80} viewBox="0 0 100 100">
        {/* Flame icon */}
        <G>
          <Path
            d="M50,20 C55,35 65,40 65,55 C65,70 55,80 50,80 C45,80 35,70 35,55 C35,45 42,40 42,35 C42,30 50,20 50,20 Z"
            fill="#FFD166"
            opacity={0.8}
          />
          <Path
            d="M50,40 C52,45 56,47 56,52 C56,58 52,62 50,62 C48,62 44,58 44,52 C44,48 47,45 47,43 C47,41 50,40 50,40 Z"
            fill="#FFFFFF"
            opacity={0.6}
          />
        </G>
      </Svg>
      
      <View style={styles.streakContainer}>
        <ThemedText style={styles.streakValue}>{streak}</ThemedText>
        <ThemedText style={styles.streakLabel}>
          {streak === 1 ? 'DAY' : 'DAYS'}
        </ThemedText>
      </View>
      
      <View style={styles.streakDots}>
        {[...Array(7)].map((_, i) => (
          <View 
            key={i} 
            style={[
              styles.dot,
              { 
                backgroundColor: i < streak ? '#FFD166' : Colors[colorScheme].borderColor
              }
            ]} 
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  streakContainer: {
    alignItems: 'center',
    marginTop: -20,
  },
  streakValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  streakLabel: {
    fontSize: 12,
    opacity: 0.7,
    letterSpacing: 1,
  },
  streakDots: {
    flexDirection: 'row',
    marginTop: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 2,
  }
}); 