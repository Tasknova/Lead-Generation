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
    id: 'test',
    name: 'Test Package',
    leads: 1,
    price: 1,
    description: '₹1 test payment to verify integration'
  },
  {
    id: 'basic',
    name: 'Basic Package',
    leads: 100,
    price: 20,
    description: '100 verified leads with contact information'
  },
  {
    id: 'pro',
    name: 'Pro Package',
    leads: 500,
    price: 50,
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
       const isTestPackage = selectedPackage.id === 'test';
       const currency = isTestPackage ? 'INR' : 'USD';
       const amount = isTestPackage ? selectedPackage.price * 100 : selectedPackage.price * 100; // paise for INR, cents for USD

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
           leads_count: selectedPackage.leads
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
                 updated_at: new Date().toISOString()
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
          {/* Package Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {LEAD_PACKAGES.map((pkg) => (
              <Card
                key={pkg.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedPackage?.id === pkg.id
                    ? 'ring-2 ring-blue-500 bg-blue-50'
                    : pkg.id === 'test'
                    ? 'border-green-500 bg-green-50 hover:bg-green-100'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handlePackageSelect(pkg)}
              >
                <CardHeader className="text-center pb-3">
                  <div className="flex justify-center mb-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      pkg.id === 'test' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      <Users className={`h-6 w-6 ${
                        pkg.id === 'test' ? 'text-green-600' : 'text-blue-600'
                      }`} />
                    </div>
                  </div>
                  <CardTitle className="text-lg">{pkg.name}</CardTitle>
                  {pkg.id === 'test' && (
                    <Badge variant="outline" className="mb-2 text-green-600 border-green-500">
                      🧪 TEST MODE
                    </Badge>
                  )}
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <div className={`text-3xl font-bold mb-2 ${
                    pkg.id === 'test' ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {pkg.id === 'test' ? '₹' : '$'}{pkg.price}
                  </div>
                  <Badge variant="secondary" className="mb-3">
                    {pkg.leads} Lead{pkg.leads > 1 ? 's' : ''}
                  </Badge>
                  {selectedPackage?.id === pkg.id && (
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                  )}
                </CardContent>
              </Card>
            ))}
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
                       {selectedPackage.id === 'test' ? '₹' : '$'}{selectedPackage.price}
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
                   Pay {selectedPackage?.id === 'test' ? '₹' : '$'}{selectedPackage?.price || 0}
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
