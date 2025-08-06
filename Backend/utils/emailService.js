import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a transporter using the configured email service
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Send an email using the configured transporter
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - Email content in HTML format
 * @returns {Promise} - Resolves with info about the sent email or rejects with error
 */
export const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Generate a random verification code
 * @param {number} length - Length of the verification code (default: 6)
 * @returns {string} - Random verification code
 */
export const generateVerificationCode = (length = 6) => {
  const digits = '0123456789';
  let code = '';
  
  for (let i = 0; i < length; i++) {
    code += digits[Math.floor(Math.random() * 10)];
  }
  
  return code;
};

/**
 * Send a verification email to the user
 * @param {string} to - Recipient email address
 * @param {string} name - User's name
 * @param {string} verificationCode - Verification code
 * @returns {Promise} - Resolves with info about the sent email or rejects with error
 */
export const sendVerificationEmail = async (to, name, verificationCode) => {
  const subject = 'Verify Your StyleMart Account';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #333; text-align: center;">Welcome to StyleMart!</h2>
      <p>Hello ${name},</p>
      <p>Thank you for registering with StyleMart. To complete your registration, please use the verification code below:</p>
      <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
        ${verificationCode}
      </div>
      <p>This code will expire in 30 minutes.</p>
      <p>If you did not request this verification, please ignore this email.</p>
      <p>Best regards,<br>The StyleMart Team</p>
    </div>
  `;

  return sendEmail(to, subject, html);
};

/**
 * Send a password reset email to the user
 * @param {string} to - Recipient email address
 * @param {string} name - User's name
 * @param {string} resetCode - Password reset code
 * @returns {Promise} - Resolves with info about the sent email or rejects with error
 */
export const sendPasswordResetEmail = async (to, name, resetCode) => {
  const subject = 'Reset Your StyleMart Password';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #333; text-align: center;">StyleMart Password Reset</h2>
      <p>Hello ${name},</p>
      <p>We received a request to reset your password. Please use the code below to reset your password:</p>
      <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
        ${resetCode}
      </div>
      <p>This code will expire in 30 minutes.</p>
      <p>If you did not request a password reset, please ignore this email or contact our support team if you have concerns.</p>
      <p>Best regards,<br>The StyleMart Team</p>
    </div>
  `;

  return sendEmail(to, subject, html);
};