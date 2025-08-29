// Utility functions for timer management

export const getTrialEndDate = (): number | null => {
  const stored = localStorage.getItem('trialEndDate');
  return stored ? parseInt(stored) : null;
};

export const setTrialEndDate = (endDate: number): void => {
  localStorage.setItem('trialEndDate', endDate.toString());
};

export const clearTrialTimer = (): void => {
  localStorage.removeItem('trialEndDate');
};

export const isTrialExpired = (): boolean => {
  const endDate = getTrialEndDate();
  if (!endDate) return false;
  
  const now = new Date().getTime();
  return now >= endDate;
};

export const getTrialTimeRemaining = (): number => {
  const endDate = getTrialEndDate();
  if (!endDate) return 0;
  
  const now = new Date().getTime();
  return Math.max(0, endDate - now);
};

export const formatTimeRemaining = (milliseconds: number): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} => {
  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
  const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
  
  return { days, hours, minutes, seconds };
};

// Test function to simulate timer behavior
export const testTimer = (): void => {
  console.log('=== Timer Test ===');
  console.log('Current trial end date:', getTrialEndDate());
  console.log('Is trial expired:', isTrialExpired());
  console.log('Time remaining (ms):', getTrialTimeRemaining());
  console.log('Formatted time:', formatTimeRemaining(getTrialTimeRemaining()));
  console.log('==================');
};
