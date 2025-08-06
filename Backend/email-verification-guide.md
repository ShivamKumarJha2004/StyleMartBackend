# StyleMart Email Verification and Password Reset API Guide

This document provides information on how to use the email verification and password reset APIs in the StyleMart application.

## Setup

Before using these APIs, make sure to update the `.env` file with your email service credentials:

```
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=StyleMart <your-email@gmail.com>
```

**Note:** For Gmail, you need to use an App Password instead of your regular password. You can generate one in your Google Account settings under Security > 2-Step Verification > App passwords.

## API Endpoints

### 1. User Registration with Email Verification

**Endpoint:** `POST /api/signUp`

**Request Body:**
```json
{
  "username": "John Doe",
  "email": "john.doe@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "message": "Registration successful. Please verify your email to activate your account."
}
```

After registration, a verification code will be sent to the user's email address.

### 2. Resend Verification Code

**Endpoint:** `POST /api/send-verification-code`

**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification code sent to your email"
}
```

### 3. Verify Email

**Endpoint:** `POST /api/verify-email`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "verificationCode": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

### 4. User Login

**Endpoint:** `POST /api/login`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "securepassword123"
}
```

**Success Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "name": "John Doe"
}
```

**Error Response (Email Not Verified):**
```json
{
  "success": false,
  "error": "Please verify your email before logging in",
  "needsVerification": true
}
```

### 5. Forgot Password

**Endpoint:** `POST /api/forgot-password`

**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset code sent to your email"
}
```

### 6. Reset Password

**Endpoint:** `POST /api/reset-password`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "resetCode": "123456",
  "newPassword": "newSecurePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

## Error Handling

All API endpoints return appropriate error messages with status codes:

- `400` - Bad Request (invalid input, expired code, etc.)
- `401` - Unauthorized (invalid credentials)
- `403` - Forbidden (email not verified)
- `404` - Not Found (user not found)
- `500` - Internal Server Error

## Security Considerations

1. Verification and reset codes expire after 30 minutes
2. Codes are stored as hashed values in the database
3. JWT tokens are used for authentication
4. Email verification is required before accessing protected routes

## Frontend Implementation

When implementing these APIs in your frontend application:

1. After user registration, show a message asking the user to check their email
2. Provide a form to enter the verification code
3. If login returns `needsVerification: true`, show a verification form and option to resend the code
4. For password reset, implement a multi-step form (email entry → code entry → new password)

## Troubleshooting

- If emails are not being sent, check your email service configuration in the `.env` file
- For Gmail, make sure you're using an App Password and have enabled less secure apps
- Verification codes are case-sensitive and must be entered exactly as received
- Check server logs for detailed error messages if you encounter issues