// Rest Timer Manager - matching iOS RestTimerManager.swift
// Manages countdown timer between workout sets

import { useState, useEffect, useRef, useCallback } from 'react';
import * as Haptics from 'expo-haptics';

interface UseRestTimerReturn {
  isRunning: boolean;
  remainingTime: number;
  timeString: string;
  start: (duration: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  addTime: (seconds: number) => void;
}

export const useRestTimer = (): UseRestTimerReturn => {
  const [isRunning, setIsRunning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef<number | null>(null);

  // Format time as MM:SS
  const timeString = (() => {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  })();

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Handle timer completion
  const handleComplete = useCallback(() => {
    setIsRunning(false);
    setRemainingTime(0);
    endTimeRef.current = null;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Haptic feedback when timer completes
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  // Start the timer with a duration in seconds
  const start = useCallback((duration: number) => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const endTime = Date.now() + duration * 1000;
    endTimeRef.current = endTime;
    setRemainingTime(duration);
    setIsRunning(true);

    // Light haptic when starting
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((endTimeRef.current! - now) / 1000));

      if (remaining <= 0) {
        handleComplete();
      } else {
        setRemainingTime(remaining);
      }
    }, 100);
  }, [handleComplete]);

  // Pause the timer
  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  // Resume the timer
  const resume = useCallback(() => {
    if (remainingTime > 0 && !isRunning) {
      const endTime = Date.now() + remainingTime * 1000;
      endTimeRef.current = endTime;
      setIsRunning(true);

      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((endTimeRef.current! - now) / 1000));

        if (remaining <= 0) {
          handleComplete();
        } else {
          setRemainingTime(remaining);
        }
      }, 100);
    }
  }, [remainingTime, isRunning, handleComplete]);

  // Stop and reset the timer
  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setRemainingTime(0);
    endTimeRef.current = null;
  }, []);

  // Add time to the running timer
  const addTime = useCallback((seconds: number) => {
    if (endTimeRef.current) {
      endTimeRef.current += seconds * 1000;
      setRemainingTime((prev) => prev + seconds);

      // Light haptic when adding time
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  return {
    isRunning,
    remainingTime,
    timeString,
    start,
    pause,
    resume,
    stop,
    addTime,
  };
};

// Common rest timer durations (in seconds)
export const REST_DURATIONS = [
  { label: '30s', value: 30 },
  { label: '1:00', value: 60 },
  { label: '1:30', value: 90 },
  { label: '2:00', value: 120 },
  { label: '2:30', value: 150 },
  { label: '3:00', value: 180 },
];
