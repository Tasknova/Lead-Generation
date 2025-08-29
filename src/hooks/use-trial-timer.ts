import { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface TrialTimerState {
  timeLeft: TimeLeft;
  isExpired: boolean;
  trialEndDate: number | null;
}

export const useTrialTimer = (): TrialTimerState => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);
  const [trialEndDate, setTrialEndDate] = useState<number | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      
      // Get or set trial end date in localStorage
      let storedTrialEnd = localStorage.getItem('trialEndDate');
      let endDate: number;
      
      if (!storedTrialEnd) {
        // Set trial end to 7 days from now if not already set
        endDate = new Date(now + (7 * 24 * 60 * 60 * 1000)).getTime();
        localStorage.setItem('trialEndDate', endDate.toString());
      } else {
        endDate = parseInt(storedTrialEnd);
      }
      
      setTrialEndDate(endDate);
      const difference = endDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
        setIsExpired(false);
      } else {
        // If countdown has ended
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsExpired(true);
      }
    };

    // Calculate immediately
    calculateTimeLeft();
    
    // Set up interval for updates
    const timer = setInterval(calculateTimeLeft, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(timer);
  }, []);

  return { timeLeft, isExpired, trialEndDate };
};

// Utility function to reset the trial timer
export const resetTrialTimer = () => {
  const now = new Date().getTime();
  const endDate = new Date(now + (7 * 24 * 60 * 60 * 1000)).getTime();
  localStorage.setItem('trialEndDate', endDate.toString());
  return endDate;
};

// Utility function to get remaining time in milliseconds
export const getTrialTimeRemaining = (): number => {
  const storedTrialEnd = localStorage.getItem('trialEndDate');
  if (!storedTrialEnd) return 0;
  
  const now = new Date().getTime();
  const endDate = parseInt(storedTrialEnd);
  return Math.max(0, endDate - now);
};
