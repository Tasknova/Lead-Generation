import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { payment_id, order_id, signature } = body

    // If only payment_id is provided, just fetch payment details
    if (payment_id && !order_id && !signature) {
      let customerPhone = null;
      let customerEmail = null;
      let customerName = null;
      let paymentAmount = null;
      let paymentStatus = null;
      let paymentMethod = null;
      let paymentCreatedAt = null;

      try {
        const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
        const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
        
        if (!razorpayKeyId || !razorpayKeySecret) {
          return new Response(
            JSON.stringify({ error: 'Razorpay credentials not configured' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        const credentials = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
        const apiUrl = `https://api.razorpay.com/v1/payments/${payment_id}`;
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const paymentDetails = await response.json();
          customerPhone = paymentDetails.contact;
          customerEmail = paymentDetails.email;
          customerName = paymentDetails.name;
          paymentAmount = paymentDetails.amount;
          paymentStatus = paymentDetails.status;
          paymentMethod = paymentDetails.method;
          paymentCreatedAt = paymentDetails.created_at;
        } else {
          const errorText = await response.text();
          return new Response(
            JSON.stringify({ error: `Razorpay API error: ${response.status}` }),
            { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      } catch (error) {
        console.error('Failed to fetch payment details from Razorpay:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch payment details' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          payment_id: payment_id,
          phone_number: customerPhone,
          email: customerEmail,
          name: customerName,
          amount: paymentAmount,
          currency: 'INR',
          status: paymentStatus,
          method: paymentMethod,
          created_at: paymentCreatedAt
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Original verification logic
    if (!payment_id || !order_id || !signature) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: order, error: orderError } = await supabaseClient
      .from('payment_orders')
      .select('*')
      .eq('id', order_id)
      .single()

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch payment details from Razorpay API to get phone number
    let customerPhone = null;
    try {
      const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
      const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
      
      if (razorpayKeyId && razorpayKeySecret) {
        const credentials = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
        const response = await fetch(`https://api.razorpay.com/v1/payments/${payment_id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const paymentDetails = await response.json();
          customerPhone = paymentDetails.contact;
          console.log('Phone number fetched from Razorpay:', customerPhone);
        }
      }
    } catch (error) {
      console.error('Failed to fetch payment details from Razorpay:', error);
    }

    const { error: updateError } = await supabaseClient
      .from('payment_orders')
      .update({
        payment_id: payment_id,
        status: 'success',
        signature: signature,
        customer_phone: customerPhone,
        updated_at: new Date().toISOString()
      })
      .eq('id', order_id)

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to update payment status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        verified: true, 
        message: 'Payment verified successfully',
        customer_phone: customerPhone
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})