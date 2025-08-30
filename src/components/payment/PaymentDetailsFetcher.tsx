import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fetchPaymentDetails } from '@/integrations/razorpay/payment';
import { useToast } from '@/hooks/use-toast';

interface PaymentDetails {
  phone?: string;
  email?: string;
  name?: string;
  amount?: number;
  currency?: string;
  status?: string;
  method?: string;
  created_at?: string;
}

export default function PaymentDetailsFetcher() {
  const [paymentId, setPaymentId] = useState('pay_RBWI1CcqwfYJ7I'); // Your payment ID
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFetchPaymentDetails = async () => {
    if (!paymentId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a payment ID",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const details = await fetchPaymentDetails(paymentId);
      setPaymentDetails(details);
      toast({
        title: "Success",
        description: "Payment details fetched successfully",
      });
    } catch (error) {
      console.error('Failed to fetch payment details:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch payment details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Fetch Payment Details</CardTitle>
          <CardDescription>
            Enter a Razorpay payment ID to fetch customer details including phone number and email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payment-id">Payment ID</Label>
            <Input
              id="payment-id"
              value={paymentId}
              onChange={(e) => setPaymentId(e.target.value)}
              placeholder="Enter Razorpay payment ID"
            />
          </div>
          
          <Button 
            onClick={handleFetchPaymentDetails} 
            disabled={loading}
            className="w-full"
          >
            {loading ? "Fetching..." : "Fetch Payment Details"}
          </Button>
        </CardContent>
      </Card>

      {paymentDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>
              Customer information from Razorpay
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Phone Number</Label>
                <p className="text-lg font-semibold">
                  {paymentDetails.phone || "Not provided"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Email</Label>
                <p className="text-lg font-semibold">
                  {paymentDetails.email || "Not provided"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Name</Label>
                <p className="text-lg font-semibold">
                  {paymentDetails.name || "Not provided"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Amount</Label>
                <p className="text-lg font-semibold">
                  {paymentDetails.amount ? `${paymentDetails.amount / 100} ${paymentDetails.currency}` : "Not available"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Status</Label>
                <p className="text-lg font-semibold">
                  {paymentDetails.status || "Not available"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Payment Method</Label>
                <p className="text-lg font-semibold">
                  {paymentDetails.method || "Not available"}
                </p>
              </div>
            </div>
            
            {paymentDetails.created_at && (
              <div>
                <Label className="text-sm font-medium text-gray-500">Created At</Label>
                <p className="text-sm">
                  {new Date(paymentDetails.created_at * 1000).toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
