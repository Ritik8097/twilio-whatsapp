const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');

// Twilio Credentials
const accountSid = 'AC0d9223de0faa24039835e6207d902a51';  // Get this from your Twilio dashboard
const authToken = 'af8d77309311b0d1a0b74cbd5e9fecda';    // Get this from your Twilio dashboard
const client = new twilio(accountSid, authToken);

// Initialize Express
const app = express();
app.use(bodyParser.json());

app.get('/',(req,res)=>{
  res.send('hi')
})

// Endpoint to receive Shopify webhook
app.post('/webhook', (req, res) => {
  const orderData = req.body;

  // Extract customer phone number (if available) and order ID
  const customerPhoneNumber = orderData.shipping_address.phone; // Ensure phone numbers are collected
  const orderId = orderData.id;

  // Check if the order is fulfilled
  if (orderData.fulfillment_status === 'fulfilled') {
    // Send WhatsApp message
    const messageBody = `Your order with ID ${orderId} has been dispatched! Track your order for more details.`;

    client.messages
      .create({
        from: 'whatsapp:+14155238886', // Your Twilio WhatsApp number
        to: `whatsapp:${customerPhoneNumber}`, // Customer's WhatsApp number
        body: messageBody,
      })
      .then((message) => {
        console.log(`WhatsApp message sent with SID: ${message.sid}`);
        res.status(200).send('Webhook received and WhatsApp message sent.');
      })
      .catch((err) => {
        console.error('Error sending WhatsApp message:', err);
        res.status(500).send('Failed to send WhatsApp message.');
      });
  } else {
    res.status(200).send('Order is not yet fulfilled.');
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
