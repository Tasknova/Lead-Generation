import fetch from 'node-fetch';

async function testPaymentAPI() {
  const paymentId = 'pay_RB7E7ybb9hlfVO'; // Random payment ID from database
  
  try {
    console.log('Testing payment API with payment ID:', paymentId);
    
    const response = await fetch('https://faqucbwepvzgavqrvttt.supabase.co/functions/v1/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhcXVjYndlcHZ6Z2F2cXJ2dHR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NTA0OTAsImV4cCI6MjA3MjEzNjQ5MH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'
      },
      body: JSON.stringify({
        payment_id: paymentId
      })
    });

    console.log('Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('Success! Payment details:');
      console.log(JSON.stringify(result, null, 2));
      
      if (result.success) {
        console.log('\n📱 Phone Number:', result.phone_number || 'Not provided');
        console.log('📧 Email:', result.email || 'Not provided');
        console.log('👤 Name:', result.name || 'Not provided');
        console.log('💰 Amount:', result.amount ? `${result.amount / 100} ${result.currency}` : 'Not available');
        console.log('📊 Status:', result.status || 'Not available');
        console.log('💳 Method:', result.method || 'Not available');
      }
    } else {
      const errorText = await response.text();
      console.error('Error response:', errorText);
    }
  } catch (error) {
    console.error('Request failed:', error.message);
  }
}

testPaymentAPI();
