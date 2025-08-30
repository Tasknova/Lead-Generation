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
    const paymentId = payment_id || 'pay_RB7E7ybb9hlfVO'
    
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    
    if (!razorpayKeyId || !razorpayKeySecret) {
      return new Response(
        JSON.stringify({ error: 'Missing Razorpay credentials' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const credentials = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    const apiUrl = `https://api.razorpay.com/v1/payments/${paymentId}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const paymentDetails = await response.json();
      
      return new Response(
        JSON.stringify({
          success: true,
          payment_id: paymentId,
          phone_number: paymentDetails.contact,
          email: paymentDetails.email,
          name: paymentDetails.name,
          amount: paymentDetails.amount,
          currency: paymentDetails.currency,
          status: paymentDetails.status,
          method: paymentDetails.method,
          created_at: paymentDetails.created_at
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({
          error: 'Razorpay API call failed',
          status: response.status,
          error_details: errorText
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
