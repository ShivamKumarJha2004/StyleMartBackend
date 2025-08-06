import Order from '../../Model/OrderSchema.js';

/**
 * Controller to save order data after successful payment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const saveOrder = async (req, res) => {
  try {
    const {
      userId,
      products,
      totalAmount,
      shippingAddress,
      paymentInfo
    } = req.body;
    
    // Validate required fields
    if (!userId || !products || !totalAmount || !paymentInfo) {
      return res.status(400).json({
        success: false,
        error: 'Missing required order details'
      });
    }
    
    // Create new order
    const newOrder = new Order({
      userId,
      products,
      totalAmount,
      shippingAddress,
      paymentInfo,
      orderStatus: 'processing'
    });
    
    // Save order to database
    const savedOrder = await newOrder.save();
    
    return res.status(201).json({
      success: true,
      message: 'Order saved successfully',
      order: savedOrder
    });
  } catch (error) {
    console.error('Error saving order:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to save order',
      message: error.message
    });
  }
};

export default saveOrder;