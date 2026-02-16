// utils/email.js
import nodemailer from 'nodemailer';

// Create transporter - configure your email service here
const createTransporter = () => {
  // Gmail example (requires App Password)
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  // Generic SMTP
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true' || false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send OTP email
export const sendOTPEmail = async (email, otp) => {
  try {
    // Skip sending in development if no email config
    if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
      console.log(`🔐 DEV MODE - OTP for ${email}: ${otp} (Expires in 10 minutes)`);
      return true;
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'CodeCraft - Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You requested a password reset for your CodeCraft account.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #666;">Your OTP Code:</p>
            <p style="font-size: 32px; font-weight: bold; color: #0066cc; margin: 10px 0; letter-spacing: 5px;">${otp}</p>
          </div>
          
          <p style="color: #666;">This OTP will expire in <strong>10 minutes</strong>.</p>
          <p style="color: #666;">If you didn't request this, please ignore this email.</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 12px; color: #999;">CodeCraft Security Team</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}. Message ID: ${info.messageId}`);
    return true;

  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    // In development, we still log the OTP to console for testing
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔐 DEV MODE FALLBACK - OTP for ${email}: ${otp} (Expires in 10 minutes)`);
      return true;
    }
    throw new Error('Failed to send OTP email');
  }
};

// Send password reset success email
export const sendPasswordResetSuccessEmail = async (email, name) => {
  try {
    if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
      console.log(`✅ Password reset email would be sent to ${email}`);
      return true;
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'CodeCraft - Password Reset Successful',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Successful</h2>
          <p>Hi ${name},</p>
          <p>Your password has been successfully reset.</p>
          <p style="color: #666;">You can now login with your new password.</p>
          
          <div style="background-color: #f0f8ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0066cc;">
            <p style="margin: 0; color: #0066cc;"><strong>Security Tip:</strong> Never share your password with anyone.</p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 12px; color: #999;">CodeCraft Security Team</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Confirmation email sent to ${email}. Message ID: ${info.messageId}`);
    return true;

  } catch (error) {
    console.error('❌ Confirmation email error:', error.message);
    // Don't throw error for confirmation emails
    return false;
  }
};
