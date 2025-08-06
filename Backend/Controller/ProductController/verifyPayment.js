import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Controller to verify Razorpay payment signature
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const verifyPayment = async (req, res) => {
  try {
    // Get payment details from request body
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required payment verification parameters'
      });
    }
    
    // Create a signature using the order ID and payment ID
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    
    // Create a HMAC SHA256 hash using the secret key
    const expectedSignature = crypto
      .createHmac('sha256', process.env.Razor_Pay_Key_Secret)
      .update(body)
      .digest('hex');
    
    // Compare the generated signature with the one received from Razorpay
    const isAuthentic = expectedSignature === razorpay_signature;
    
    if (isAuthentic) {
      // Payment is verified
      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully'
      });
    } else {
      // Payment verification failed
      return res.status(400).json({
        success: false,
        error: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

export default verifyPayment;