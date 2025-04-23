import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Polyline, Line, Text } from 'react-native-svg';
import { ThemedText } from './ThemedText';
import Colors from '@/constants/Colors';

interface LineChartProps {
  data: number[];
  labels: string[];
  color: string;
  colorScheme: 'light' | 'dark';
}

export const LineChart: React.FC<LineChartProps> = ({ 
  data, 
  labels, 
  color,
  colorScheme
}) => {
  if (data.length === 0) return null;
  
  const chartWidth = 300;
  const chartHeight = 100;
  const paddingX = 20;
  const paddingY = 20;
  const width = chartWidth - (paddingX * 2);
  const height = chartHeight - (paddingY * 2);
  
  const max = Math.max(...data);
  
  // Calculate positions for the line
  const points = data.map((value, index) => {
    const x = paddingX + (index * (width / (data.length - 1)));
    const y = chartHeight - paddingY - (value / max * height);
    return `${x},${y}`;
  }).join(' ');

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>7-Day Trend</ThemedText>
      
      <Svg width={chartWidth} height={chartHeight}>
        {/* X-axis */}
        <Line
          x1={paddingX}
          y1={chartHeight - paddingY}
          x2={chartWidth - paddingX}
          y2={chartHeight - paddingY}
          stroke={Colors[colorScheme].borderColor}
          strokeWidth="1"
        />
        
        {/* Data line */}
        <Polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
        />
        
        {/* Labels */}
        {labels.map((label, index) => (
          <Text
            key={index}
            x={paddingX + (index * (width / (data.length - 1)))}
            y={chartHeight - 5}
            textAnchor="middle"
            fontSize="9"
            fill={Colors[colorScheme].text}
          >
            {label}
          </Text>
        ))}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 5,
  }
}); 