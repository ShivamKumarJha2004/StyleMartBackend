import user from "../../../Model/UserSchema.js";
import jwt from 'jsonwebtoken';

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

    // Create a new user instance
    const newUser = new user({
      name: req.body.username,
      email: req.body.email,
      password: req.body.password, // Consider hashing the password before saving
      cartData: cart,
    });

    // Save the new user to the database
    await newUser.save();

    // Create a token for the newly registered user
    const data = {
      user: {
        id: newUser._id, // Use newUser._id instead of user.id
      },
    };

    const token = jwt.sign(data, 'secret_ecom', { expiresIn: '1h' }); // Consider using an environment variable for the secret

    res.json({
      success: true,
      token,
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
      const pswdcomp = req.body.password === users.password;
      if (pswdcomp) {
        const data = {
          user: {
            id: users.id,
          },
        };
        const token = jwt.sign(data, 'secret_ecom');
        res.json({
          success: true,
          token,
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