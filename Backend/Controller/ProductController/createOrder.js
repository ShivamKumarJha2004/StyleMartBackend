import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Razorpay with your key ID and secret
const razorpay = new Razorpay({
  key_id: process.env.Razor_Pay_Key_ID,
  key_secret: process.env.Razor_Pay_Key_Secret
});

/**
 * Controller to create a new Razorpay order
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt = 'order_receipt', notes = {} } = req.body;
    
    // Validate required fields
    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }
    
    // Create order options
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt,
      notes
    };
    
    // Create order using Razorpay
    const order = await razorpay.orders.create(options);
    
    // Return success response with order details
    return res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create order',
      message: error.message
    });
  }
};

export default createOrder;