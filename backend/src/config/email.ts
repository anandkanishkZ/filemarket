import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"FileMarket" <${process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${options.to}`);
      return true;
    } catch (error) {
      logger.error('Error sending email:', error);
      return false;
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to FileMarket!</h1>
        <p>Hi ${name},</p>
        <p>Thank you for joining FileMarket. You now have access to thousands of premium digital files.</p>
        <p>Start exploring our collection and find the perfect files for your projects.</p>
        <a href="${process.env.FRONTEND_URL}/browse" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Browse Files</a>
        <p>Best regards,<br>The FileMarket Team</p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Welcome to FileMarket!',
      html,
      text: `Hi ${name}, Welcome to FileMarket! Start exploring our collection at ${process.env.FRONTEND_URL}/browse`,
    });
  }

  async sendPurchaseConfirmation(email: string, name: string, fileName: string, amount: number): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Purchase Confirmation</h1>
        <p>Hi ${name},</p>
        <p>Thank you for your purchase! Your order has been confirmed.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order Details:</h3>
          <p><strong>File:</strong> ${fileName}</p>
          <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
          <p><strong>Status:</strong> Confirmed</p>
        </div>
        <p>You can download your file from your dashboard once the payment is processed.</p>
        <a href="${process.env.FRONTEND_URL}/dashboard" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Go to Dashboard</a>
        <p>Best regards,<br>The FileMarket Team</p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Purchase Confirmation - FileMarket',
      html,
      text: `Hi ${name}, Your purchase of ${fileName} for $${amount.toFixed(2)} has been confirmed.`,
    });
  }

  async sendPasswordResetEmail(email: string, name: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Password Reset Request</h1>
        <p>Hi ${name},</p>
        <p>You requested to reset your password. Click the button below to set a new password:</p>
        <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
        <p>This link will expire in 1 hour for security reasons.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>The FileMarket Team</p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Password Reset - FileMarket',
      html,
      text: `Hi ${name}, Reset your password at: ${resetUrl}`,
    });
  }
}

export const emailService = new EmailService();