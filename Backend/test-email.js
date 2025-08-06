import dotenv from 'dotenv';
import { sendVerificationEmail, sendPasswordResetEmail } from './utils/emailService.js';

// Load environment variables
dotenv.config();

/**
 * Test script to verify email sending functionality
 * 
 * Usage: 
 * 1. Update the .env file with your email credentials
 * 2. Run this script with: node test-email.js
 */

const testEmail = async () => {
  try {
    // Replace with the email address you want to test with
    const testEmailAddress = 'test@example.com';
    
    console.log('Sending test verification email...');
    await sendVerificationEmail(testEmailAddress, 'Test User', '123456');
    console.log('✅ Verification email sent successfully!');
    
    console.log('\nSending test password reset email...');
    await sendPasswordResetEmail(testEmailAddress, 'Test User', '654321');
    console.log('✅ Password reset email sent successfully!');
    
    console.log('\n📧 Email test completed successfully!');
    console.log('Check your email service logs or the test email inbox to verify the emails were sent correctly.');
  } catch (error) {
    console.error('❌ Error sending test emails:', error);
    console.log('\nPlease check your .env configuration:');
    console.log('- EMAIL_SERVICE should be set to your email service (e.g., "gmail")');
    console.log('- EMAIL_USER should be your email address');
    console.log('- EMAIL_PASSWORD should be your app password (for Gmail) or account password');
    console.log('- EMAIL_FROM should be set correctly');
  }
};

// Run the test
testEmail();