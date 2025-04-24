import { useState, useEffect } from 'react';
import { NativeModules, Platform } from 'react-native';

const { HealthConnect } = NativeModules;

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

export const useHealthConnect = () => {
  const [healthData, setHealthData] = useState<HealthData>(defaultHealthData);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS === 'android') {
      initializeHealthConnect();
    } else {
      setError('Health Connect is only available on Android devices');
    }
  }, []);

  const initializeHealthConnect = async () => {
    try {
      if (!HealthConnect) {
        setError('Health Connect module is not available');
        return;
      }

      const isAvailable = await HealthConnect.checkAvailability();
      if (!isAvailable) {
        setError('Health Connect is not available on this device');
        return;
      }

      const hasPermissions = await HealthConnect.requestPermissions();
      if (!hasPermissions) {
        setError('Health Connect permissions not granted');
        return;
      }

      setIsInitialized(true);
      await fetchHealthData();
    } catch (err) {
      setError('Failed to initialize Health Connect');
      console.error(err);
    }
  };

  const fetchHealthData = async () => {
    if (!isInitialized || !HealthConnect) {
      return;
    }

    try {
      const data = await HealthConnect.getHealthData();
      setHealthData(prevData => ({
        ...prevData,
        ...data,
        sleepDuration: `${Math.floor(data.sleepHours)}h ${Math.round((data.sleepHours % 1) * 60)}m`,
        waterIntakeCups: Math.round(data.waterIntake / 250) // Assuming 250ml per cup
      }));
    } catch (err) {
      setError('Failed to fetch health data');
      console.error(err);
    }
  };

  const syncData = async () => {
    if (!HealthConnect) {
      setError('Health Connect module is not available');
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