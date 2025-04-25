import { useState, useEffect } from 'react';
import { NativeModules, Platform } from 'react-native';
import { format } from 'date-fns';

const { HealthConnect } = NativeModules;

type LogEntry = {
  date: string;
  waterAmount: number;
  stressLevel: number;
};

type HealthData = {
  waterIntake: number;
  waterIntakeCups: number;
  sleepHours: number;
  steps: number;
  stressLevel: number;
  caloriesBurned: number;
  hoursSlept: number;
  heartRate: number;
  sleepDuration: string;
  sleepQuality: string;
  weeklyProgress: number;
  weeklySteps: number;
  activeDays: number;
  currentStreak: number;
  totalPoints: number;
  morningWalkDistance: number;
  morningWalkCalories: number;
};

const defaultHealthData: HealthData = {
  waterIntake: 0,
  waterIntakeCups: 0,
  sleepHours: 0,
  steps: 0,
  stressLevel: 0,
  caloriesBurned: 0,
  hoursSlept: 0,
  heartRate: 0,
  sleepDuration: '0h 0m',
  sleepQuality: 'Unknown',
  weeklyProgress: 0,
  weeklySteps: 0,
  activeDays: 0,
  currentStreak: 0,
  totalPoints: 0,
  morningWalkDistance: 0,
  morningWalkCalories: 0
};

export const useHealthConnect = (logEntries: LogEntry[] = []) => {
  const [healthData, setHealthData] = useState<HealthData>(defaultHealthData);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS === 'android') {
      initializeHealthConnect();
    } else {
      setError('Health Connect is only available on Android devices');
      // On non-Android platforms, use log entries as fallback data
      updateHealthDataWithLogEntries();
    }
  }, []);

  // Update health data whenever log entries change
  useEffect(() => {
    updateHealthDataWithLogEntries();
  }, [logEntries]);

  const updateHealthDataWithLogEntries = () => {
    if (!logEntries || logEntries.length === 0) return;
    
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayEntry = logEntries.find(entry => entry.date === today);
    
    if (todayEntry) {
      // Ensure waterAmount is a valid number
      const waterAmount = typeof todayEntry.waterAmount === 'number' 
        ? todayEntry.waterAmount 
        : parseInt(String(todayEntry.waterAmount), 10) || 0;
      
      setHealthData(prevData => ({
        ...prevData,
        waterIntake: waterAmount,
        stressLevel: todayEntry.stressLevel || 0,
        waterIntakeCups: Math.round(waterAmount / 250)
      }));
    }
  };

  const initializeHealthConnect = async () => {
    try {
      if (!HealthConnect) {
        setError('Health Connect module is not available');
        updateHealthDataWithLogEntries();
        return;
      }

      const isAvailable = await HealthConnect.checkAvailability();
      if (!isAvailable) {
        setError('Health Connect is not available on this device');
        updateHealthDataWithLogEntries();
        return;
      }

      const hasPermissions = await HealthConnect.requestPermissions();
      if (!hasPermissions) {
        setError('Health Connect permissions not granted');
        updateHealthDataWithLogEntries();
        return;
      }

      setIsInitialized(true);
      await fetchHealthData();
    } catch (err) {
      setError('Failed to initialize Health Connect');
      updateHealthDataWithLogEntries();
    }
  };

  const fetchHealthData = async () => {
    if (!isInitialized || !HealthConnect) {
      return;
    }

    try {
      const data = await HealthConnect.getHealthData();
      setHealthData(prevData => {
        const updatedData = {
          ...prevData,
          ...data,
          sleepDuration: `${Math.floor(data.sleepHours)}h ${Math.round((data.sleepHours % 1) * 60)}m`,
          waterIntakeCups: Math.round(data.waterIntake / 250) // Assuming 250ml per cup
        };
        
        // Supplement with log entry data (prioritizing log entries)
        const today = format(new Date(), 'yyyy-MM-dd');
        const todayEntry = logEntries.find(entry => entry.date === today);
        
        if (todayEntry) {
          updatedData.waterIntake = todayEntry.waterAmount;
          updatedData.waterIntakeCups = Math.round(todayEntry.waterAmount / 250);
          updatedData.stressLevel = todayEntry.stressLevel;
        }
        
        return updatedData;
      });
    } catch (err) {
      setError('Failed to fetch health data');
      updateHealthDataWithLogEntries();
    }
  };

  const syncData = async () => {
    if (!HealthConnect) {
      setError('Health Connect module is not available');
      updateHealthDataWithLogEntries();
      return;
    }

    if (!isInitialized) {
      await initializeHealthConnect();
      return;
    }

    await fetchHealthData();
  };

  return {
    healthData,
    isInitialized,
    error,
    syncData
  };
}; 