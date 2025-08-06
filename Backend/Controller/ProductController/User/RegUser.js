import user from "../../../Model/UserSchema.js";
import jwt from 'jsonwebtoken';
import { generateVerificationCode, sendVerificationEmail } from '../../../utils/emailService.js';
import bcrypt from 'bcrypt';

const RegUser = async (req, res) => {
  try {
    // Check if the user already exists
    let existingUser = await user.findOne({ email: req.body.email });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Existing User Found with Same Email address",
      });
    }

    // Initialize the cart with 300 items
    let cart = {};
    for (let i = 0; i < 300; i++) {
      cart[i] = 0;
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    
    // Hash the verification code
    const salt = await bcrypt.genSalt(10);
    const hashedToken = await bcrypt.hash(verificationCode, salt);
    
    // Create a new user instance
    const newUser = new user({
      name: req.body.username,
      email: req.body.email,
      password: req.body.password, // Consider hashing the password before saving
      cartData: cart,
      isVerified: false,
      verificationToken: hashedToken,
      verificationTokenExpiry: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes expiry
    });

    // Save the new user to the database
    await newUser.save();

    // Send verification email
    await sendVerificationEmail(req.body.email, req.body.username, verificationCode);

    // Create a token for the newly registered user
    const data = {
      user: {
        id: newUser._id, // Use newUser._id instead of user.id
      },
    };

    const token = jwt.sign(data, process.env.JWT_SECRET || 'secret_ecom', { expiresIn: '1h' });

    res.json({
      success: true,
      token,
      message: "Registration successful. Please verify your email to activate your account."
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
}
  //login 

  const userLogin = async (req, res) => {
    let users = await user.findOne({
      email: req.body.email,
    });
  
    if (users) {
      // Check if user is verified
      if (!users.isVerified) {
        return res.status(401).json({
          success: false,
          error: 'Please verify your email before logging in',
          needsVerification: true
        });
      }

      const pswdcomp = req.body.password === users.password;
      if (pswdcomp) {
        const data = {
          user: {
            id: users.id,
          },
        };
        const token = jwt.sign(data, process.env.JWT_SECRET || 'secret_ecom');
        res.json({
          success: true,
          token,
          name: users.name,
        });
      } else {
        res.json({
          success: false,
          error: 'Wrong Password',
        });
      }
    } else {
      res.json({
        success: false,
        error: 'Wrong Email Id',
      });
    }
  };
  
  export { RegUser, userLogin };