import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  PanResponder, 
  Animated, 
  Dimensions, 
  Pressable,
  LayoutChangeEvent
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.7;
const KNOB_SIZE = 30;

interface CircularWaterTrackerProps {
  value: number;
  maxValue: number;
  onChange: (value: number) => void;
  waterUnit?: string;
}

export default function CircularWaterTracker({
  value,
  maxValue,
  onChange,
  waterUnit = 'ml'
}: CircularWaterTrackerProps) {
  const colorScheme = useColorScheme() || 'light';
  const tintColor = Colors[colorScheme].tint;
  
  const [circleCenter, setCircleCenter] = useState({ x: 0, y: 0 });
  const [circleRadius, setCircleRadius] = useState(0);
  const [startAngle, setStartAngle] = useState(Math.PI); // Start at 180 degrees (bottom)
  const [endAngle, setEndAngle] = useState(Math.PI); // Initially same as start
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  
  // Animated values for water drops
  const drop1Opacity = useRef(new Animated.Value(0)).current;
  const drop2Opacity = useRef(new Animated.Value(0)).current;
  const drop3Opacity = useRef(new Animated.Value(0)).current;
  
  // Knob position animated value
  const knobPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  useEffect(() => {
    // Calculate the end angle based on the current value (0 to maxValue)
    const percentage = value / maxValue;
    const newEndAngle = Math.PI + (Math.PI * percentage);
    setEndAngle(newEndAngle);
    
    // Calculate knob position
    if (circleRadius > 0) {
      const knobX = circleCenter.x + Math.cos(newEndAngle) * circleRadius;
      const knobY = circleCenter.y + Math.sin(newEndAngle) * circleRadius;
      knobPosition.setValue({ x: knobX - KNOB_SIZE / 2, y: knobY - KNOB_SIZE / 2 });
    }
    
    // Animate water drops when value changes significantly
    if (percentage > 0.1 && percentage % 0.2 < 0.05) {
      animateWaterDrops();
    }
  }, [value, maxValue, circleRadius, circleCenter]);

  const animateWaterDrops = () => {
    // Randomly select which drop to animate
    const dropToAnimate = Math.floor(Math.random() * 3);
    const dropOpacity = [drop1Opacity, drop2Opacity, drop3Opacity][dropToAnimate];
    
    Animated.sequence([
      Animated.timing(dropOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(dropOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true
      })
    ]).start();
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width: layoutWidth, height: layoutHeight } = event.nativeEvent.layout;
    setLayout({ width: layoutWidth, height: layoutHeight });
    
    // Calculate circle center
    const centerX = layoutWidth / 2;
    const centerY = layoutHeight / 2;
    setCircleCenter({ x: centerX, y: centerY });
    
    // Calculate radius (slightly smaller than half width to account for stroke width)
    const radius = (CIRCLE_SIZE / 2) - 15;
    setCircleRadius(radius);
    
    // Recalculate knob position
    const percentage = value / maxValue;
    const angle = Math.PI + (Math.PI * percentage);
    const knobX = centerX + Math.cos(angle) * radius;
    const knobY = centerY + Math.sin(angle) * radius;
    knobPosition.setValue({ x: knobX - KNOB_SIZE / 2, y: knobY - KNOB_SIZE / 2 });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      },
      onPanResponderMove: (_, gestureState) => {
        if (circleRadius <= 0) return;
        
        // Calculate angle from gesture position relative to circle center
        const touchX = gestureState.moveX - layout.width / 2 + CIRCLE_SIZE / 2;
        const touchY = gestureState.moveY - layout.height / 2 + CIRCLE_SIZE / 2;
        
        // Calculate angle from center to touch point
        let angle = Math.atan2(touchY - circleCenter.y, touchX - circleCenter.x);
        
        // Restrict to bottom half of the circle (PI to 2*PI)
        if (angle < 0) angle = 2 * Math.PI + angle;
        if (angle < Math.PI) angle = Math.PI;
        if (angle > 2 * Math.PI) angle = 2 * Math.PI;
        
        // Calculate the new value based on the angle
        const percentage = (angle - Math.PI) / Math.PI;
        const newValue = Math.round(percentage * maxValue);
        
        // Update the value
        if (newValue !== value) {
          onChange(newValue);
          if (Math.abs(newValue - value) > maxValue * 0.05) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }
      },
      onPanResponderRelease: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    })
  ).current;

  const generateArcPath = (centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number) => {
    // SVG arc path
    const start = {
      x: centerX + radius * Math.cos(startAngle),
      y: centerY + radius * Math.sin(startAngle)
    };
    
    const end = {
      x: centerX + radius * Math.cos(endAngle),
      y: centerY + radius * Math.sin(endAngle)
    };
    
    const largeArcFlag = endAngle - startAngle <= Math.PI ? 0 : 1;
    
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  };

  const generateFilledArcPath = () => {
    if (circleRadius <= 0) return '';
    
    // Calculate the arc path for the filled portion
    return generateArcPath(
      circleCenter.x,
      circleCenter.y,
      circleRadius,
      startAngle,
      endAngle
    );
  };

  const generateEmptyArcPath = () => {
    if (circleRadius <= 0) return '';
    
    // Calculate the arc path for the empty portion
    return generateArcPath(
      circleCenter.x,
      circleCenter.y,
      circleRadius,
      endAngle,
      startAngle + 2 * Math.PI
    );
  };

  // Position for the three animated water drops
  const dropPositions = [
    { left: CIRCLE_SIZE * 0.3, top: CIRCLE_SIZE * 0.7 },
    { left: CIRCLE_SIZE * 0.5, top: CIRCLE_SIZE * 0.8 },
    { left: CIRCLE_SIZE * 0.7, top: CIRCLE_SIZE * 0.75 }
  ];

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <View style={styles.circleContainer}>
        {/* Empty Arc */}
        <View style={[
          styles.arcContainer, 
          { 
            width: CIRCLE_SIZE, 
            height: CIRCLE_SIZE,
            borderRadius: CIRCLE_SIZE / 2,
            borderWidth: 12,
            borderColor: '#e8f4f8',
          }
        ]} />
        
        {/* Filled Water Level Indicator */}
        <View style={[
          styles.waterFillContainer,
          {
            width: CIRCLE_SIZE,
            height: CIRCLE_SIZE * (value / maxValue),
            borderTopLeftRadius: value / maxValue > 0.5 ? 0 : CIRCLE_SIZE / 2,
            borderTopRightRadius: value / maxValue > 0.5 ? 0 : CIRCLE_SIZE / 2,
            borderBottomLeftRadius: CIRCLE_SIZE / 2,
            borderBottomRightRadius: CIRCLE_SIZE / 2,
            backgroundColor: tintColor,
            bottom: 0,
          }
        ]} />
        
        {/* Animated Water Drops */}
        {dropPositions.map((position, index) => (
          <Animated.View 
            key={`drop-${index}`}
            style={[
              styles.waterDrop,
              position,
              { opacity: [drop1Opacity, drop2Opacity, drop3Opacity][index] }
            ]}
          >
            <IconSymbol size={20} name="drop.fill" color={tintColor} />
          </Animated.View>
        ))}
        
        {/* Current Value Indicator */}
        <View style={styles.valueContainer}>
          <ThemedText style={styles.valueText}>{value}</ThemedText>
          <ThemedText style={styles.unitText}>{waterUnit}</ThemedText>
          <ThemedText style={styles.maxValueText}>of {maxValue} {waterUnit}</ThemedText>
        </View>
        
        {/* Draggable Knob */}
        <Animated.View
          style={[
            styles.knob,
            {
              transform: [
                { translateX: knobPosition.x },
                { translateY: knobPosition.y }
              ]
            }
          ]}
          {...panResponder.panHandlers}
        >
          <View style={[styles.knobInner, { backgroundColor: tintColor }]} />
        </Animated.View>
      </View>
      
      {/* Quick Add Buttons */}
      <View style={styles.buttonsContainer}>
        <Pressable 
          style={styles.quickAddButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onChange(Math.max(0, value - 250));
          }}
          accessibilityLabel="Decrease by 250 milliliters"
        >
          <ThemedText style={styles.buttonText}>-250 {waterUnit}</ThemedText>
        </Pressable>
        
        <Pressable 
          style={[styles.quickAddButton, styles.primaryButton, { backgroundColor: tintColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onChange(Math.min(maxValue, value + 250));
          }}
          accessibilityLabel="Increase by 250 milliliters"
        >
          <ThemedText style={[styles.buttonText, styles.primaryButtonText]}>+250 {waterUnit}</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  circleContainer: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  arcContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  waterFillContainer: {
    position: 'absolute',
    width: '100%',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  valueContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  unitText: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: -4,
  },
  maxValueText: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 4,
  },
  knob: {
    position: 'absolute',
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  knobInner: {
    width: KNOB_SIZE - 8,
    height: KNOB_SIZE - 8,
    borderRadius: (KNOB_SIZE - 8) / 2,
  },
  waterDrop: {
    position: 'absolute',
    width: 20,
    height: 20,
    opacity: 0,
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    width: '100%',
    justifyContent: 'space-around',
  },
  quickAddButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  primaryButton: {
    backgroundColor: '#0a7ea4',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  primaryButtonText: {
    color: 'white',
  },
}); 