import { useState, useEffect, useCallback } from 'react';
import { TimerState } from '../types';

export const useTimer = (initialMinutes: number = 25) => {
  const [timer, setTimer] = useState<TimerState>({
    minutes: initialMinutes,
    seconds: 0,
    isActive: false,
    totalMinutes: initialMinutes
  });

  useEffect(() => {
    let interval: number | null = null;

    if (timer.isActive && (timer.minutes > 0 || timer.seconds > 0)) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev.seconds > 0) {
            return { ...prev, seconds: prev.seconds - 1 };
          } else if (prev.minutes > 0) {
            return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
          } else {
            return { ...prev, isActive: false };
          }
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer.isActive, timer.minutes, timer.seconds]);

  const startTimer = useCallback(() => {
    setTimer(prev => ({ ...prev, isActive: true }));
  }, []);

  const pauseTimer = useCallback(() => {
    setTimer(prev => ({ ...prev, isActive: false }));
  }, []);

  const resetTimer = useCallback(() => {
    setTimer(prev => ({
      ...prev,
      minutes: prev.totalMinutes,
      seconds: 0,
      isActive: false
    }));
  }, []);

  const setTimerDuration = useCallback((minutes: number) => {
    setTimer({
      minutes,
      seconds: 0,
      isActive: false,
      totalMinutes: minutes
    });
  }, []);

  return {
    timer,
    startTimer,
    pauseTimer,
    resetTimer,
    setTimerDuration
  };
};