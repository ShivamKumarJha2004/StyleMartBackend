import Product from '../../Model/ProductSchema.js';

/**
 * Get all products with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Get products with pagination
    const products = await Product.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
};

/**
 * Add a new product
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const addProduct = async (req, res) => {
  try {
    const { name, image, category, description, new_price, old_price } = req.body;

    // Validate required fields
    if (!name || !image || !category || !description || !new_price || !old_price) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required',
      });
    }

    // Get the last product ID to increment
    let id = 1;
    const lastProduct = await Product.findOne().sort({ id: -1 });
    if (lastProduct) {
      id = lastProduct.id + 1;
    }

    // Create new product
    const newProduct = new Product({
      id,
      name,
      image,
      category,
      description,
      new_price,
      old_price,
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      product: newProduct,
    });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
};

/**
 * Update an existing product
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image, category, description, new_price, old_price, available } = req.body;

    // Find product by ID
    const product = await Product.findOne({ id: parseInt(id) });
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    if (name) product.name = name;
    if (image) product.image = image;
    if (category) product.category = category;
    if (description) product.description = description;
    if (new_price) product.new_price = new_price;
    if (old_price) product.old_price = old_price;
    if (available !== undefined) product.available = available;

    await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
};

/**
 * Delete a product
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete product
    const product = await Product.findOneAndDelete({ id: parseInt(id) });
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
};

/**
 * Get product by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find product by ID
    const product = await Product.findOne({ id: parseInt(id) });
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
};