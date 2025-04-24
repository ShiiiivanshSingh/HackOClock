import { useState } from 'react';

type MockData = {
  waterIntake: number;
  sleepHours: number;
  steps: number;
  stressLevel: number;
  caloriesBurned: number;
  hoursSlept: number;
  weeklyProgress: number;
  activeDays: number;
  currentStreak: number;
  heartRate: number;
  weeklySteps: number;
  totalPoints: number;
  morningWalkDistance: number;
  morningWalkCalories: number;
  waterIntakeCups: number;
  sleepDuration: string;
  sleepQuality: string;
};

// fixed mock data that never changes
const staticMockData: MockData = {
  waterIntake: 2000,
  sleepHours: 7.5,
  steps: 8500,
  stressLevel: 1,
  caloriesBurned: 1850,
  hoursSlept: 45,
  weeklyProgress: 75,
  activeDays: 5,
  currentStreak: 3,
  heartRate: 72,
  weeklySteps: 42000,
  totalPoints: 450,
  morningWalkDistance: 2.5,
  morningWalkCalories: 180,
  waterIntakeCups: 8,
  sleepDuration: "7h 30m",
  sleepQuality: "Good"
};

export const useMockData = () => {
  return staticMockData;
}; 