import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { payment_id } = await req.json()

    if (!payment_id) {
      return new Response(
        JSON.stringify({ error: 'Payment ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get Razorpay credentials from environment variables
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    
    if (!razorpayKeyId || !razorpayKeySecret) {
      return new Response(
        JSON.stringify({ error: 'Razorpay credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Create Basic Auth credentials
    const credentials = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    const apiUrl = `https://api.razorpay.com/v1/payments/${payment_id}`;
    
    console.log('Fetching payment details for:', payment_id);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Razorpay API error:', errorText);
      return new Response(
        JSON.stringify({ error: `Razorpay API error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const paymentDetails = await response.json();
    console.log('Payment details fetched successfully:', {
      payment_id: paymentDetails.id,
      contact: paymentDetails.contact,
      email: paymentDetails.email,
      name: paymentDetails.name,
      amount: paymentDetails.amount,
      currency: paymentDetails.currency,
      status: paymentDetails.status,
      method: paymentDetails.method,
      created_at: paymentDetails.created_at
    });

    // Extract relevant information
    const extractedDetails = {
      phone: paymentDetails.contact,
      email: paymentDetails.email,
      name: paymentDetails.name,
      amount: paymentDetails.amount,
      currency: paymentDetails.currency,
      status: paymentDetails.status,
      method: paymentDetails.method,
      created_at: paymentDetails.created_at
    };

    return new Response(
      JSON.stringify({ 
        success: true,
        payment_details: extractedDetails
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error fetching payment details:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
