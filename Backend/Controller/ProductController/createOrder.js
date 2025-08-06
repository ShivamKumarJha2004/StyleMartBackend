import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Controller to create a new Razorpay order
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createOrder = async (req, res) => {
  try {
    // Initialize Razorpay instance with API keys
    const razorpay = new Razorpay({
      key_id: process.env.Razor_Pay_Key_ID,
      key_secret: process.env.Razor_Pay_Key_Secret
    });

    // Get order details from request body
    const { amount, currency = 'INR', receipt, notes = {} } = req.body;

    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid amount is required'
      });
    }

    // Amount should be in smallest currency unit (paise for INR)
    // Convert rupees to paise (1 rupee = 100 paise)
    const amountInPaise = Math.round(amount * 100);

    // Create order options
    const options = {
      amount: amountInPaise,
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes
    };

    // Create Razorpay order
    const order = await razorpay.orders.create(options);

    // Return order details
    return res.status(200).json({
      success: true,
      order,
      key_id: process.env.Razor_Pay_Key_ID // Send key_id for frontend initialization
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create order',
      message: error.message
    });
  }
};

export default createOrder;