# Razorpay Integration Guide for StyleMart

This guide explains how to integrate Razorpay payment gateway with your StyleMart frontend application.

## Backend API Endpoints

The following API endpoints have been implemented for Razorpay integration:

1. **Create Order**
   - Endpoint: `/api/create-order`
   - Method: POST
   - Request Body:
     ```json
     {
       "amount": 500, // Amount in INR
       "currency": "INR", // Optional, defaults to INR
       "receipt": "order_receipt_123", // Optional
       "notes": {} // Optional, additional notes
     }
     ```
   - Response:
     ```json
     {
       "success": true,
       "order": {
         "id": "order_JDjRazOrpAyId123",
         "entity": "order",
         "amount": 50000,
         "amount_paid": 0,
         "amount_due": 50000,
         "currency": "INR",
         "receipt": "order_receipt_123",
         "status": "created",
         "attempts": 0,
         "notes": [],
         "created_at": 1234567890
       }
     }
     ```

2. **Verify Payment**
   - Endpoint: `/api/verify-payment`
   - Method: POST
   - Request Body:
     ```json
     {
       "razorpay_order_id": "order_JDjRazOrpAyId123",
       "razorpay_payment_id": "pay_JDjRazOrpAyId456",
       "razorpay_signature": "generated_signature_here"
     }
     ```
   - Response:
     ```json
     {
       "success": true,
       "message": "Payment verified successfully"
     }
     ```

3. **Save Order**
   - Endpoint: `/api/save-order`
   - Method: POST
   - Request Body:
     ```json
     {
       "userId": "user_id_here",
       "products": [
         {
           "productId": "product_id_here",
           "quantity": 2,
           "price": 250
         }
       ],
       "totalAmount": 500,
       "shippingAddress": {
         "name": "John Doe",
         "address": "123 Main St",
         "city": "Mumbai",
         "state": "Maharashtra",
         "pincode": "400001",
         "phone": "9876543210"
       },
       "paymentInfo": {
         "razorpayOrderId": "order_JDjRazOrpAyId123",
         "razorpayPaymentId": "pay_JDjRazOrpAyId456",
         "razorpaySignature": "generated_signature_here",
         "status": "completed"
       }
     }
     ```
   - Response:
     ```json
     {
       "success": true,
       "message": "Order saved successfully",
       "order": { /* Order details */ }
     }
     ```

## Frontend Integration Steps

### 1. Install Razorpay SDK

```bash
npm install razorpay
```

### 2. Create a Checkout Component

```jsx
import React, { useState } from 'react';
import axios from 'axios';

const Checkout = ({ amount, products, userId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Step 1: Create an order on your server
      const orderResponse = await axios.post('https://stylemartbackend.onrender.com/api/create-order', {
        amount: amount,
        receipt: `receipt_${Date.now()}`
      });
      
      if (!orderResponse.data.success) {
        throw new Error('Failed to create order');
      }
      
      const { order } = orderResponse.data;
      
      // Step 2: Initialize Razorpay checkout
      const options = {
        key: 'rzp_test_zyj1RQnfZ7lppl', // Your Razorpay Key ID
        amount: order.amount,
        currency: order.currency,
        name: 'StyleMart',
        description: 'Purchase from StyleMart',
        order_id: order.id,
        handler: async function(response) {
          // Step 3: Verify payment on your server
          const verifyResponse = await axios.post('https://stylemartbackend.onrender.com/api/verify-payment', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });
          
          if (verifyResponse.data.success) {
            // Step 4: Save order details
            const shippingAddress = {
              // Get shipping address from form or state
              name: 'John Doe',
              address: '123 Main St',
              city: 'Mumbai',
              state: 'Maharashtra',
              pincode: '400001',
              phone: '9876543210'
            };
            
            const saveOrderResponse = await axios.post('https://stylemartbackend.onrender.com/api/save-order', {
              userId,
              products,
              totalAmount: amount,
              shippingAddress,
              paymentInfo: {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                status: 'completed'
              }
            });
            
            if (saveOrderResponse.data.success) {
              // Order saved successfully, redirect to success page or show success message
              alert('Payment successful and order placed!');
              // Redirect to order success page
              // window.location.href = '/order-success';
            }
          } else {
            // Payment verification failed
            setError('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: 'John Doe', // Get from user profile
          email: 'john@example.com', // Get from user profile
          contact: '9876543210' // Get from user profile
        },
        theme: {
          color: '#3399cc'
        }
      };
      
      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
      
      // Handle Razorpay modal close
      razorpayInstance.on('payment.failed', function(response) {
        setError(`Payment failed: ${response.error.description}`);
      });
    } catch (error) {
      setError(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      <div className="order-summary">
        <h3>Order Summary</h3>
        <p>Total Amount: ₹{amount}</p>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <button 
        className="payment-button" 
        onClick={handlePayment} 
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </div>
  );
};

export default Checkout;
```

### 3. Include Razorpay Script in your HTML

Add the following script tag to your `index.html` file:

```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

### 4. Use the Checkout Component

```jsx
import React from 'react';
import Checkout from './components/Checkout';

const CartPage = () => {
  // Example data - in a real app, you would get this from your cart state
  const cartItems = [
    { id: 'product1', name: 'T-Shirt', price: 250, quantity: 2 }
  ];
  
  const userId = 'user123'; // Get from authentication state
  
  // Calculate total amount
  const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Format products for the order
  const products = cartItems.map(item => ({
    productId: item.id,
    quantity: item.quantity,
    price: item.price
  }));
  
  return (
    <div className="cart-page">
      <h1>Your Cart</h1>
      
      {/* Cart items list */}
      <div className="cart-items">
        {cartItems.map(item => (
          <div key={item.id} className="cart-item">
            <span>{item.name}</span>
            <span>₹{item.price} x {item.quantity}</span>
            <span>₹{item.price * item.quantity}</span>
          </div>
        ))}
      </div>
      
      {/* Checkout component */}
      <Checkout 
        amount={totalAmount} 
        products={products} 
        userId={userId} 
      />
    </div>
  );
};

export default CartPage;
```

## Important Notes

1. **Security**: Never expose your Razorpay Key Secret on the frontend. All sensitive operations like payment verification should happen on the server.

2. **Testing**: Use Razorpay test mode credentials for development and testing. You can use the following test card for payments:
   - Card Number: 4111 1111 1111 1111
   - Expiry: Any future date
   - CVV: Any 3-digit number
   - Name: Any name

3. **Error Handling**: Implement proper error handling for all API calls and payment processes.

4. **Webhooks**: For production, consider setting up Razorpay webhooks for more reliable payment status updates.

5. **Order Status**: Implement an order tracking system to allow users to view their order status.

## Troubleshooting

1. **Payment Failed**: Check the error message returned by Razorpay. Common issues include incorrect API keys or network problems.

2. **Verification Failed**: Ensure that you're using the correct Key Secret for verification and that all parameters are being passed correctly.

3. **CORS Issues**: Make sure your backend has proper CORS configuration to allow requests from your frontend domain.

4. **Order Not Saved**: Check that all required fields are being sent to the save-order endpoint and that the user is authenticated.