import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Loader2, CreditCard, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTrialTimer } from '@/hooks/use-trial-timer';
import { TrialCountdown } from '@/components/ui/trial-countdown';


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

  const { toast } = useToast();
  
  // Use the custom trial timer hook
  const { timeLeft, isExpired } = useTrialTimer();

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

  // Reset modal when closed
  const handleClose = () => {
    onClose();
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
        const amount = selectedPackage.price * 100; // Convert to paise for Razorpay (₹1 = 100 paise)

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
             is_free_request: isTrialPackage // Set is_free_request to true for trial packages
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
          prefill: {
            name: user.user_metadata?.full_name || user.email!,
            email: user.email!
          },
          handler: async (response: any) => {
            try {
              console.log('Payment successful:', response);
              console.log('Full Razorpay response:', JSON.stringify(response, null, 2));
              
              // Fetch phone number from Razorpay API for all payments
              let customerPhone = null;
              try {
                const { fetchPaymentDetails } = await import('@/integrations/razorpay/payment');
                const paymentDetails = await fetchPaymentDetails(response.razorpay_payment_id);
                customerPhone = paymentDetails.phone;
                console.log('📱 Phone number fetched from Razorpay:', customerPhone);
              } catch (phoneError) {
                console.error('Failed to fetch phone number from Razorpay:', phoneError);
              }
              
              

              // For all payments, update the order with payment details and phone number
              const updateData: any = {
                payment_id: response.razorpay_payment_id,
                status: 'success',
                signature: response.razorpay_signature || '',
                updated_at: new Date().toISOString(),
                                 is_free_request: isTrialPackage
              };

              // Add phone number if available
              if (customerPhone) {
                updateData.customer_phone = customerPhone;
              }

              console.log('🔧 Updating payment order with data:', updateData);
              console.log('🔧 Order ID:', orderData?.id);
              console.log('🔧 Order Data available:', !!orderData);
              console.log('🔧 Full Order Data:', orderData);

              const { data: updateResult, error: updateError } = await supabase
                .from('payment_orders')
                .update(updateData)
                .eq('id', orderData.id)
                .select();

              if (updateError) {
                console.error('❌ Database update failed:', updateError);
                throw new Error(`Database update failed: ${updateError.message}`);
              }

              console.log('✅ Payment order updated successfully:', updateResult);
              console.log('📱 Phone number stored in database:', customerPhone);

              toast({
                title: 'Payment Successful!',
                description: `You can now generate ${selectedPackage.leads} leads.${customerPhone ? ` Phone: ${customerPhone}` : ''}`,
              });

              onSuccess();
              onClose();
            } catch (error) {
              console.error('❌ Payment update error:', error);
              console.error('❌ Error details:', {
                message: error.message,
                stack: error.stack,
                orderId: orderData?.id,
                paymentId: response?.razorpay_payment_id
              });
              
              toast({
                title: 'Payment Error',
                description: `Payment completed but failed to update status: ${error.message}`,
                variant: 'destructive',
              });
            }
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
          <TrialCountdown className="mb-6" />

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
                        {`${pkg.leads} Lead${pkg.leads > 1 ? 's' : ''}`}
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
                       <Badge variant="outline">
                         {`${selectedPackage.leads} Leads`}
                       </Badge>
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
