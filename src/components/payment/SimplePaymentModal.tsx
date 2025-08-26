import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Loader2, CreditCard, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface LeadPackage {
  id: string;
  name: string;
  leads: number;
  price: number;
  description: string;
}

// Lead packages configuration
const LEAD_PACKAGES: LeadPackage[] = [
  {
    id: 'trial',
    name: 'Trial Package',
    leads: 10,
    price: 9,
    description: '10 leads for 7 days - Limited time offer'
  },
  {
    id: 'basic',
    name: 'Basic Package',
    leads: 100,
    price: 999,
    description: '100 verified leads with contact information'
  },
  {
    id: 'pro',
    name: 'Pro Package',
    leads: 500,
    price: 3999,
    description: '500 verified leads with detailed information'
  }
];

// Load Razorpay script
const loadRazorpayScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay script'));
    document.head.appendChild(script);
  });
};

declare global {
  interface Window {
    Razorpay: any;
  }
}

const SimplePaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [selectedPackage, setSelectedPackage] = useState<LeadPackage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const { toast } = useToast();

  // Countdown timer for trial offer
  React.useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      
      // Get or set trial end date in localStorage
      let trialEnd = localStorage.getItem('trialEndDate');
      if (!trialEnd) {
        // Set trial end to 7 days from now if not already set
        const endDate = new Date(now + (7 * 24 * 60 * 60 * 1000)).getTime();
        localStorage.setItem('trialEndDate', endDate.toString());
        trialEnd = endDate.toString();
      }
      
      const difference = parseInt(trialEnd) - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        // If countdown has ended, show zeros
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handlePackageSelect = (pkg: LeadPackage) => {
    setSelectedPackage(pkg);
  };

  const handlePayment = async () => {
    if (!selectedPackage || !user) {
      toast({
        title: 'Error',
        description: 'Please select a package and ensure you are logged in.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    try {
      await loadRazorpayScript();

             // For development, use test keys if available
       let razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
       
       // If using live keys on localhost, show helpful error
       if (razorpayKey?.includes('rzp_live_') && window.location.hostname === 'localhost') {
         throw new Error('Live Razorpay keys require HTTPS and registered domain. Please use test keys (rzp_test_...) for localhost development.');
       }
       
       if (!razorpayKey) {
         throw new Error('Razorpay Key ID is not configured. Add VITE_RAZORPAY_KEY_ID to your .env file');
       }

             // Determine currency and amount based on package
       const isTrialPackage = selectedPackage.id === 'trial';
       const currency = 'INR'; // All packages now in INR
       const amount = selectedPackage.price * 100; // Convert to paise

               // Create order in database first
        const { data: orderData, error: orderError } = await supabase
          .from('payment_orders')
          .insert({
            user_id: user.id,
            user_email: user.email!,
            package_id: selectedPackage.id,
            amount: amount,
            currency: currency,
            status: 'created',
            leads_count: selectedPackage.leads,
            is_free_request: isTrialPackage // Set is_free_request to true for trial package
          })
          .select()
          .single();

       console.log('Created order in database:', orderData);

      if (orderError) {
        throw new Error(`Failed to create order: ${orderError.message}`);
      }

             console.log('Razorpay Key:', razorpayKey.substring(0, 10) + '...');
       console.log('Amount in paise:', selectedPackage.price * 100);
       console.log('Order ID:', orderData.id);

       const options = {
         key: razorpayKey,
         amount: amount, // Amount in paise (INR) or cents (USD)
         currency: currency,
         name: 'Tasknova Lead Generator',
         description: selectedPackage.description,
         // Remove order_id - let Razorpay create order automatically
                 handler: async (response: any) => {
           try {
             console.log('Payment successful:', response);
             
                           // Update payment status with Razorpay order details
              await supabase
                .from('payment_orders')
                .update({
                  payment_id: response.razorpay_payment_id,
                  status: 'success',
                  signature: response.razorpay_signature || '',
                  updated_at: new Date().toISOString(),
                  is_free_request: isTrialPackage // Ensure is_free_request flag is set for trial package
                })
                .eq('id', orderData.id);

            toast({
              title: 'Payment Successful!',
              description: `You can now generate ${selectedPackage.leads} leads.`,
            });

            onSuccess();
            onClose();
          } catch (error) {
            console.error('Payment update error:', error);
            toast({
              title: 'Payment Error',
              description: 'Payment completed but failed to update status.',
              variant: 'destructive',
            });
          }
        },
        prefill: {
          name: user.user_metadata?.full_name || user.email!,
          email: user.email!
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: () => {
            toast({
              title: 'Payment Cancelled',
              description: 'Payment was cancelled by user.',
              variant: 'destructive',
            });
            setIsProcessing(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment initialization error:', error);
      toast({
        title: 'Payment Error',
        description: error instanceof Error ? error.message : 'Failed to initialize payment.',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Choose Your Lead Package
          </DialogTitle>
          <p className="text-center text-gray-600 mt-2">
            Select a package to generate high-quality leads for your business
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Trial Countdown */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4 mb-6">
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

                     {/* Package Selection */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {LEAD_PACKAGES.map((pkg) => {
               const isTrial = pkg.id === 'trial';
               const isComingSoon = pkg.id === 'pro';
               
               return (
                 <Card
                   key={pkg.id}
                                       className={`transition-all duration-200 ${
                      isComingSoon 
                        ? 'cursor-not-allowed opacity-80 bg-gray-50 relative' 
                        : selectedPackage?.id === pkg.id
                        ? 'cursor-pointer ring-2 ring-blue-500 bg-blue-50'
                        : isTrial
                        ? 'cursor-pointer border-green-500 bg-green-50 hover:bg-green-100 hover:shadow-lg'
                        : 'cursor-pointer hover:bg-gray-50 hover:shadow-lg'
                    }`}
                   onClick={() => !isComingSoon && handlePackageSelect(pkg)}
                 >
                  <CardHeader className="text-center pb-3">
                    <div className="flex justify-center mb-2">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isTrial ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        <Users className={`h-6 w-6 ${
                          isTrial ? 'text-green-600' : 'text-blue-600'
                        }`} />
                      </div>
                    </div>
                                         <CardTitle className="text-lg">{pkg.name}</CardTitle>
                     <CardDescription>{pkg.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center pt-0">
                                         <div className={`text-3xl font-bold mb-2 ${
                       isTrial ? 'text-green-600' : 'text-blue-600'
                     }`}>
                                               ₹{pkg.price}
                     </div>
                    <Badge variant="secondary" className="mb-3">
                      {pkg.leads} Lead{pkg.leads > 1 ? 's' : ''}
                    </Badge>
                                         {selectedPackage?.id === pkg.id && !isComingSoon && (
                       <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                     )}
                   </CardContent>
                   
                   {/* Coming Soon Overlay */}
                   {isComingSoon && (
                     <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center rounded-lg">
                       <div className="text-center text-white">
                         <div className="text-lg font-bold mb-1">🚧</div>
                         <div className="text-sm font-semibold">Coming Soon</div>
                       </div>
                     </div>
                   )}
                 </Card>
               );
             })}
          </div>

          {/* Selected Package Summary */}
          {selectedPackage && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedPackage.name}</h3>
                    <p className="text-gray-600">{selectedPackage.description}</p>
                  </div>
                                     <div className="text-right">
                     <div className="text-2xl font-bold text-blue-600">
                                               ₹{selectedPackage.price}
                     </div>
                     <Badge variant="outline">{selectedPackage.leads} Leads</Badge>
                   </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Button */}
          <div className="flex justify-center">
            <Button
              size="lg"
              className="w-full max-w-md"
              onClick={handlePayment}
              disabled={!selectedPackage || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing Payment...
                </>
                             ) : (
                 <>
                   <CreditCard className="mr-2 h-5 w-5" />
                   Pay ₹{selectedPackage?.price || 0}
                 </>
               )}
            </Button>
          </div>

          {/* Security Notice */}
          <div className="text-center text-sm text-gray-500">
            <p>🔒 Secure payment powered by Razorpay</p>
            <p>Your payment information is encrypted and secure</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SimplePaymentModal;
