import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useAsyncStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const getStoredValue = useCallback(async () => {
    try {
      setLoading(true);
      const item = await AsyncStorage.getItem(key);
      
      if (item) {
        try {
          const value = JSON.parse(item);
          setStoredValue(value);
        } catch (parseError) {
          setError(parseError instanceof Error ? parseError : new Error(String(parseError)));
          setStoredValue(initialValue);
        }
      } else {
        setStoredValue(initialValue);
      }
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [key, initialValue]);

  useEffect(() => {
    getStoredValue();
  }, [getStoredValue]);

  const setValue = async (value: T) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      await AsyncStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    }
  };

  const removeValue = async () => {
    try {
      await AsyncStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    }
  };

  const refreshValue = async () => {
    await getStoredValue();
  };

  return { value: storedValue, setValue, removeValue, refreshValue, loading, error };
} 