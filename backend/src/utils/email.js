// utils/email.js
import nodemailer from 'nodemailer';

const getEmailUser = () => process.env.EMAIL_USER || process.env.SMTP_USER;
const getEmailPassword = () => process.env.EMAIL_PASSWORD || process.env.SMTP_PASS;
const getEmailFrom = () => process.env.EMAIL_FROM || getEmailUser();
const hasEmailConfig = () => Boolean(getEmailUser() && getEmailPassword());

const formatBookingDate = (date, timezone = 'UTC') => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: timezone,
    }).format(new Date(date));
  } catch (error) {
    return new Date(date).toLocaleString();
  }
};

// Create transporter - configure your email service here
const createTransporter = () => {
  // Gmail example (requires App Password)
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: getEmailUser(),
        pass: getEmailPassword()
      }
    });
  }

  // Generic SMTP
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true' || false,
    auth: {
      user: getEmailUser(),
      pass: getEmailPassword()
    }
  });
};

// Send OTP email
export const sendOTPEmail = async (email, otp) => {
  try {
    // Skip sending in development if no email config
    if (process.env.NODE_ENV === 'development' && !hasEmailConfig()) {
      console.log(`🔐 DEV MODE - OTP for ${email}: ${otp} (Expires in 10 minutes)`);
      return true;
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: getEmailFrom(),
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
    if (process.env.NODE_ENV === 'development' && !hasEmailConfig()) {
      console.log(`✅ Password reset email would be sent to ${email}`);
      return true;
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: getEmailFrom(),
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

export const sendMentorBookingEmails = async ({
  studentName,
  studentEmail,
  studentPhone,
  mentorName,
  mentorEmail,
  queryCategory,
  topic,
  notes,
  preferredDate,
  timezone,
  duration,
  meetingMode,
}) => {
  const sessionTime = formatBookingDate(preferredDate, timezone);

  if (!hasEmailConfig()) {
    console.log('📨 Mentor booking emails skipped: email config missing');
    console.log({
      studentName,
      studentEmail,
      mentorName,
      mentorEmail,
      queryCategory,
      topic,
      sessionTime,
      duration,
      meetingMode,
    });

    return {
      studentEmailSent: false,
      mentorEmailSent: false,
      skippedReason: 'email_not_configured',
      lastError: '',
    };
  }

  const transporter = createTransporter();
  const from = getEmailFrom();

  const summaryHtml = `
    <div style="background:#f8fafc;padding:18px;border-radius:12px;margin:20px 0;">
      <p><strong>Topic:</strong> ${topic}</p>
      <p><strong>Category:</strong> ${queryCategory}</p>
      <p><strong>Preferred time:</strong> ${sessionTime}</p>
      <p><strong>Timezone:</strong> ${timezone}</p>
      <p><strong>Duration:</strong> ${duration} minutes</p>
      <p><strong>Meeting mode:</strong> ${meetingMode}</p>
      <p><strong>Student phone:</strong> ${studentPhone}</p>
      <p><strong>Problem statement:</strong><br />${notes}</p>
    </div>
  `;

  const status = {
    studentEmailSent: false,
    mentorEmailSent: false,
    skippedReason: '',
    lastError: '',
  };

  try {
    await transporter.sendMail({
      from,
      to: studentEmail,
      subject: `CodeCraft - Session booked with ${mentorName}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#111827;">Mentor session booked</h2>
          <p>Hi ${studentName},</p>
          <p>Your mentor session request with <strong>${mentorName}</strong> has been submitted.</p>
          ${summaryHtml}
          <p>We also notified ${mentorName} so both of you can coordinate the session.</p>
          <p style="color:#6b7280;font-size:12px;">CodeCraft Mentor Desk</p>
        </div>
      `,
    });
    status.studentEmailSent = true;
  } catch (error) {
    status.lastError = error.message || 'Failed to send student booking email';
  }

  if (!mentorEmail) {
    status.skippedReason = 'mentor_email_missing';
    return status;
  }

  try {
    await transporter.sendMail({
      from,
      to: mentorEmail,
      subject: `CodeCraft - New session request from ${studentName}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#111827;">New mentor session request</h2>
          <p><strong>${studentName}</strong> booked a mentor session with you.</p>
          <p><strong>Student email:</strong> ${studentEmail}</p>
          ${summaryHtml}
          <p>Please connect with the student using the contact details above.</p>
          <p style="color:#6b7280;font-size:12px;">CodeCraft Mentor Desk</p>
        </div>
      `,
    });
    status.mentorEmailSent = true;
  } catch (error) {
    status.lastError = status.lastError || error.message || 'Failed to send mentor booking email';
  }

  return status;
};
