import User from '../../../Model/UserSchema.js';
import { generateVerificationCode, sendVerificationEmail, sendPasswordResetEmail } from '../../../utils/emailService.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Temporary storage for pre-registration data
const preRegistrationData = new Map();

/**
 * Send verification code for pre-registration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const sendPreRegistrationCode = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    
    // Check if required fields are provided
    if (!email || !username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email, username and password are required',
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists',
      });
    }
    
    // Generate verification code
    const verificationCode = generateVerificationCode();
    
    // Hash the verification code
    const salt = await bcrypt.genSalt(10);
    const hashedToken = await bcrypt.hash(verificationCode, salt);
    
    // Hash the password
    const passwordSalt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, passwordSalt);
    
    // Store pre-registration data with expiry time (30 minutes)
    preRegistrationData.set(email, {
      username,
      hashedPassword,
      verificationToken: hashedToken,
      verificationCode, // Store plain code for email sending
      expiryTime: new Date(Date.now() + 30 * 60 * 1000)
    });
    
    // Send verification email
    await sendVerificationEmail(email, username, verificationCode);
    
    res.json({
      success: true,
      message: 'Verification code sent to your email. Please verify to complete registration.',
    });
  } catch (error) {
    console.error('Error sending pre-registration code:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
};

/**
 * Send verification email to existing user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const sendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }
    
    // Generate verification code
    const verificationCode = generateVerificationCode();
    
    // Hash the verification code before storing
    const salt = await bcrypt.genSalt(10);
    const hashedToken = await bcrypt.hash(verificationCode, salt);
    
    // Set verification token and expiry (30 minutes from now)
    user.verificationToken = hashedToken;
    user.verificationTokenExpiry = new Date(Date.now() + 30 * 60 * 1000);
    
    await user.save();
    
    // Send verification email
    await sendVerificationEmail(email, user.name, verificationCode);
    
    res.json({
      success: true,
      message: 'Verification code sent to your email',
    });
  } catch (error) {
    console.error('Error sending verification code:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
};

/**
 * Complete registration after email verification
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const completeRegistration = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;
    
    // Check if pre-registration data exists for this email
    if (!preRegistrationData.has(email)) {
      return res.status(400).json({
        success: false,
        error: 'No pending registration found for this email or verification expired',
      });
    }
    
    const userData = preRegistrationData.get(email);
    
    // Check if verification code has expired
    if (userData.expiryTime < new Date()) {
      preRegistrationData.delete(email); // Clean up expired data
      return res.status(400).json({
        success: false,
        error: 'Verification code has expired. Please register again.',
      });
    }
    
    // Compare verification code
    const isValid = await bcrypt.compare(verificationCode, userData.verificationToken);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification code',
      });
    }
    
    // Initialize the cart with 300 items
    let cart = {};
    for (let i = 0; i < 300; i++) {
      cart[i] = 0;
    }
    
    // Create a new user with verified status
    const newUser = new User({
      name: userData.username,
      email: email,
      password: userData.hashedPassword,
      cartData: cart,
      isVerified: true, // User is already verified
    });
    
    // Save the new user to the database
    await newUser.save();
    
    // Clean up pre-registration data
    preRegistrationData.delete(email);
    
    // Create a token for the newly registered user
    const data = {
      user: {
        id: newUser._id,
      },
    };
    
    const token = jwt.sign(data, process.env.JWT_SECRET || 'secret_ecom', { expiresIn: '1h' });
    
    res.json({
      success: true,
      token,
      message: 'Registration completed successfully',
    });
  } catch (error) {
    console.error('Error completing registration:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
};

/**
 * Verify existing user's email with verification code
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const verifyEmail = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;
    
    // Find user by email
    const user = await User.findOne({ 
      email,
      verificationTokenExpiry: { $gt: new Date() } // Token should not be expired
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification code',
      });
    }
    
    // Compare verification code
    const isValid = await bcrypt.compare(verificationCode, user.verificationToken);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification code',
      });
    }
    
    // Mark user as verified and clear verification token
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
};

/**
 * Send password reset code to user's email
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const sendPasswordResetCode = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }
    
    // Generate reset code
    const resetCode = generateVerificationCode();
    
    // Hash the reset code before storing
    const salt = await bcrypt.genSalt(10);
    const hashedToken = await bcrypt.hash(resetCode, salt);
    
    // Set reset token and expiry (30 minutes from now)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiry = new Date(Date.now() + 30 * 60 * 1000);
    
    await user.save();
    
    // Send password reset email
    await sendPasswordResetEmail(email, user.name, resetCode);
    
    res.json({
      success: true,
      message: 'Password reset code sent to your email',
    });
  } catch (error) {
    console.error('Error sending password reset code:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
};

/**
 * Reset user's password with reset code
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;
    
    // Find user by email with valid reset token
    const user = await User.findOne({ 
      email,
      resetPasswordExpiry: { $gt: new Date() } // Token should not be expired
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset code',
      });
    }
    
    // Compare reset code
    const isValid = await bcrypt.compare(resetCode, user.resetPasswordToken);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid reset code',
      });
    }
    
    // Update password and clear reset token
    // In a production envir  user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
};