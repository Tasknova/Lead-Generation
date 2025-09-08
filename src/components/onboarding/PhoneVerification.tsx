import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Phone, CheckCircle } from 'lucide-react';

interface PhoneVerificationProps {
  phone: string;
  onVerified: (verified: boolean) => void;
  onCodeSent: (sent: boolean) => void;
}

const PhoneVerification: React.FC<PhoneVerificationProps> = ({ 
  phone, 
  onVerified, 
  onCodeSent 
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const { toast } = useToast();

  const handleSendCode = async () => {
    if (!phone.trim()) {
      toast({
        title: "Phone number required",
        description: "Please enter your phone number first.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      // Simulate sending verification code
      // In a real implementation, you would integrate with a service like Twilio
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Verification code sent",
        description: "Please check your phone for the verification code.",
      });
      
      setCodeSent(true);
      onCodeSent(true);
    } catch (error: any) {
      toast({
        title: "Failed to send code",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      toast({
        title: "Verification code required",
        description: "Please enter the verification code.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      // Simulate verification
      // In a real implementation, you would verify with the service
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Accept any 6-digit code as valid for demo purposes
      if (verificationCode.length === 6) {
        toast({
          title: "Phone verified!",
          description: "Your phone number has been successfully verified.",
        });
        onVerified(true);
      } else {
        throw new Error("Invalid verification code");
      }
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid verification code.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Phone className="h-4 w-4" />
        <Label>Phone Verification</Label>
      </div>
      
      {!codeSent ? (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            We'll send a verification code to {phone}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={handleSendCode}
            disabled={isSending}
            className="w-full"
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Code...
              </>
            ) : (
              "Send Verification Code"
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Enter the 6-digit code sent to {phone}
          </p>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="123456"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleVerifyCode}
              disabled={isVerifying || verificationCode.length !== 6}
            >
              {isVerifying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Verify"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhoneVerification;
