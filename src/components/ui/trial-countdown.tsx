import React from 'react';
import { useTrialTimer } from '@/hooks/use-trial-timer';
import { Card, CardContent } from '@/components/ui/card';

interface TrialCountdownProps {
  showExpiredMessage?: boolean;
  className?: string;
}

export const TrialCountdown: React.FC<TrialCountdownProps> = ({ 
  showExpiredMessage = true, 
  className = "" 
}) => {
  const { timeLeft, isExpired } = useTrialTimer();

  if (isExpired && showExpiredMessage) {
    return (
      <div className={`bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">⏰ Trial Offer Expired</h3>
          <p className="text-sm text-red-700">The trial offer has ended. Please select a paid package to continue.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-red-800 mb-2">⏰ Limited Time Trial Offer</h3>
        <div className="flex justify-center space-x-4 text-sm">
          <div className="bg-white rounded-lg px-3 py-2 shadow-sm">
            <div className="text-2xl font-bold text-red-600">{timeLeft.days}</div>
            <div className="text-gray-600">Days</div>
          </div>
          <div className="bg-white rounded-lg px-3 py-2 shadow-sm">
            <div className="text-2xl font-bold text-red-600">{timeLeft.hours}</div>
            <div className="text-gray-600">Hours</div>
          </div>
          <div className="bg-white rounded-lg px-3 py-2 shadow-sm">
            <div className="text-2xl font-bold text-red-600">{timeLeft.minutes}</div>
            <div className="text-gray-600">Minutes</div>
          </div>
          <div className="bg-white rounded-lg px-3 py-2 shadow-sm">
            <div className="text-2xl font-bold text-red-600">{timeLeft.seconds}</div>
            <div className="text-gray-600">Seconds</div>
          </div>
        </div>
        <p className="text-sm text-red-700 mt-2">Get 10 leads for just ₹9 - Offer ends soon!</p>
      </div>
    </div>
  );
};
