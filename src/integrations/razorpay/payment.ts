import { supabase } from '@/integrations/supabase/client';

// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: string;
}

export interface PaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  customer_phone?: string;
}

export interface LeadPackage {
  id: string;
  name: string;
  leads: number;
  price: number;
  description: string;
}

// Lead packages configuration
export const LEAD_PACKAGES: LeadPackage[] = [
  {
    id: 'basic',
    name: 'Basic Package',
    leads: 100,
    price: 99,
    description: '100 verified leads with contact information'
  },
  {
    id: 'pro',
    name: 'Pro Package',
    leads: 500,
    price: 399,
    description: '500 verified leads with detailed information'
  },
  {
    id: 'enterprise',
    name: 'Enterprise Package',
    leads: 1000,
    price: 699,
    description: '1000 premium leads with full contact details'
  }
];

// Load Razorpay script
export const loadRazorpayScript = (): Promise<void> => {
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

// Create payment order
export const createPaymentOrder = async (
  packageId: string,
  userId: string,
  userEmail: string
): Promise<PaymentOrder> => {
  const package_ = LEAD_PACKAGES.find(pkg => pkg.id === packageId);
  if (!package_) {
    throw new Error('Invalid package selected');
  }

  console.log('Creating payment order for:', { packageId, userId, userEmail, package_ });

  // Create order in Supabase
  const { data: orderData, error: orderError } = await supabase
    .from('payment_orders')
    .insert({
      user_id: userId,
      user_email: userEmail,
      package_id: packageId,
      amount: package_.price * 100, // Convert to paise for Razorpay
      currency: 'INR',
      status: 'created',
      leads_count: package_.leads
    })
    .select()
    .single();

  if (orderError) {
    console.error('Failed to create payment order:', orderError);
    throw new Error(`Failed to create payment order: ${orderError.message}`);
  }

  console.log('Payment order created:', orderData);

  return {
    id: orderData.id,
    amount: orderData.amount,
    currency: orderData.currency,
    receipt: orderData.id,
    status: orderData.status,
    created_at: orderData.created_at
  };
};

// Initialize Razorpay payment
export const initializePayment = async (
  order: PaymentOrder,
  userEmail: string,
  userName: string,
  onSuccess: (response: PaymentResponse) => void,
  onFailure: (error: any) => void
): Promise<void> => {
  try {
    await loadRazorpayScript();

    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    
    if (!razorpayKey) {
      throw new Error('Razorpay Key ID is not configured. Please add VITE_RAZORPAY_KEY_ID to your environment variables.');
    }

    const options = {
      key: razorpayKey,
      amount: order.amount,
      currency: order.currency,
      name: 'Tasknova Lead Generator',
      description: 'Lead Generation Service',
      handler: onSuccess,
      prefill: {
        name: userName,
        email: userEmail
      },
      theme: {
        color: '#3B82F6'
      },
      modal: {
        ondismiss: onFailure
      }
    };

    console.log('Razorpay Options:', { ...options, key: '***' }); // Log for debugging

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (error) {
    console.error('Failed to initialize Razorpay:', error);
    onFailure(error);
  }
};

// Verify payment signature
export const verifyPayment = async (
  paymentId: string,
  orderId: string,
  signature: string
): Promise<boolean> => {
  try {
    const response = await fetch('https://faqucbwepvzgavqrvttt.supabase.co/functions/v1/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
      },
      body: JSON.stringify({
        payment_id: paymentId,
        order_id: orderId,
        signature: signature
      })
    });

    const result = await response.json();
    return result.verified;
  } catch (error) {
    console.error('Payment verification failed:', error);
    return false;
  }
};

// Update payment status
export const updatePaymentStatus = async (
  orderId: string,
  paymentId: string,
  status: 'success' | 'failed',
  signature?: string,
  customerPhone?: string
): Promise<void> => {
  const updateData: any = {
    payment_id: paymentId,
    status: status,
    signature: signature,
    updated_at: new Date().toISOString()
  };

  // Add phone number if provided
  if (customerPhone) {
    updateData.customer_phone = customerPhone;
  }

  const { error } = await supabase
    .from('payment_orders')
    .update(updateData)
    .eq('id', orderId);

  if (error) {
    throw new Error('Failed to update payment status');
  }
};


// Fetch payment details from Razorpay API
export const fetchPaymentDetails = async (paymentId: string): Promise<{
  phone?: string;
  email?: string;
  name?: string;
  amount?: number;
  currency?: string;
  status?: string;
  method?: string;
  created_at?: string;
}> => {
  try {
    // Temporary: Use direct Razorpay API call until Edge Function is properly configured
    const workingKeyId = 'rzp_live_5BF0PAwVBSBu3E';
    const workingKeySecret = 'R6jA3yA5gRyTG7K5oRz1wHjO';
    const credentials = Buffer.from(`${workingKeyId}:${workingKeySecret}`).toString('base64');
    
    const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch payment details: ${response.status}`);
    }

    const paymentDetails = await response.json();
    
    return {
      phone: paymentDetails.contact,
      email: paymentDetails.email,
      name: paymentDetails.name,
      amount: paymentDetails.amount,
      currency: paymentDetails.currency,
      status: paymentDetails.status,
      method: paymentDetails.method,
      created_at: paymentDetails.created_at
    };
  } catch (error) {
    console.error('Failed to fetch payment details:', error);
    throw error;
  }
};


// Get user's payment history
export const getPaymentHistory = async (userId: string) => {
  const { data, error } = await supabase
    .from('payment_orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Failed to fetch payment history');
  }

  return data;
};

// Update existing payment orders with phone numbers from Razorpay API
export const updateExistingPaymentsWithPhoneNumbers = async (): Promise<{
  updated: number;
  failed: number;
  errors: string[];
}> => {
  const results = {
    updated: 0,
    failed: 0,
    errors: [] as string[]
  };

  try {
    // Get all payment orders that have payment_id but no customer_phone
    const { data: orders, error } = await supabase
      .from('payment_orders')
      .select('id, payment_id, customer_phone')
      .not('payment_id', 'is', null)
      .or('customer_phone.is.null,customer_phone.eq.');

    if (error) {
      throw new Error(`Failed to fetch payment orders: ${error.message}`);
    }

    console.log(`Found ${orders?.length || 0} payment orders to update`);

    if (!orders || orders.length === 0) {
      return results;
    }

    // Process each order
    for (const order of orders) {
      try {
        if (!order.payment_id) continue;

        // Fetch payment details from Razorpay
        const paymentDetails = await fetchPaymentDetails(order.payment_id);
        
        if (paymentDetails.phone) {
          // Update the order with phone number
          const { error: updateError } = await supabase
            .from('payment_orders')
            .update({ 
              customer_phone: paymentDetails.phone,
              updated_at: new Date().toISOString()
            })
            .eq('id', order.id);

          if (updateError) {
            console.error(`Failed to update order ${order.id}:`, updateError);
            results.failed++;
            results.errors.push(`Order ${order.id}: ${updateError.message}`);
          } else {
            console.log(`✅ Updated order ${order.id} with phone: ${paymentDetails.phone}`);
            results.updated++;
          }
        } else {
          console.log(`⚠️ No phone number found for payment ${order.payment_id}`);
          results.failed++;
          results.errors.push(`Payment ${order.payment_id}: No phone number available`);
        }
      } catch (orderError) {
        console.error(`Failed to process order ${order.id}:`, orderError);
        results.failed++;
        results.errors.push(`Order ${order.id}: ${orderError instanceof Error ? orderError.message : 'Unknown error'}`);
      }
    }

    console.log(`Update complete: ${results.updated} updated, ${results.failed} failed`);
    return results;

  } catch (error) {
    console.error('Failed to update existing payments:', error);
    throw error;
  }
};
