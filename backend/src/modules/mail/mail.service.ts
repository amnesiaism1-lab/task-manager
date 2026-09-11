import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
  category?: 'verification' | 'password_reset' | 'invitation' | 'system_test';
}

export interface OutboxMailRecord extends MailMessage {
  id: string;
  sentAt: string;
  sent: boolean;
  reason?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly configured: boolean;
  private readonly transporter: Transporter | null;
  private readonly from: string;
  private readonly frontendUrl: string;
  private readonly outbox: OutboxMailRecord[] = [];

  constructor(private readonly config: ConfigService) {
    const host = config.get<string>('MAIL_HOST');
    const user = config.get<string>('MAIL_USER');
    const password = config.get<string>('MAIL_PASSWORD');
    this.configured = Boolean(host && user && password);
    this.from = config.get<string>('MAIL_FROM', user || 'no-reply@taskmanager.dev');
    this.frontendUrl = config.get<string>('FRONTEND_URL', 'http://localhost:5173');

    this.transporter = this.configured
      ? nodemailer.createTransport({
          host,
          port: config.get<number>('MAIL_PORT', 587),
          secure: config.get('MAIL_SECURE', 'false') === 'true',
          auth: { user, pass: password },
        })
      : null;
  }

  isConfigured(): boolean {
    return this.configured;
  }

  getRecentMails(): OutboxMailRecord[] {
    return [...this.outbox].reverse();
  }

  async send(message: MailMessage) {
    const recordId = `mail-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const sentAt = new Date().toISOString();

    if (!this.configured) {
      this.logger.log(`\n================= [EMAIL DISPATCHED (DEV/LOCAL)] =================\nTo: ${message.to}\nSubject: ${message.subject}\nBody: ${message.text}\n==================================================================`);
      
      const record: OutboxMailRecord = {
        ...message,
        id: recordId,
        sentAt,
        sent: true,
        reason: 'simulated_dev_delivery',
      };
      this.recordOutbox(record);
      return { sent: true, mode: 'simulated', id: recordId };
    }

    try {
      await this.transporter!.sendMail({
        from: this.from,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html || this.generateDefaultHtml(message.subject, message.text),
      });

      const record: OutboxMailRecord = {
        ...message,
        id: recordId,
        sentAt,
        sent: true,
      };
      this.recordOutbox(record);
      return { sent: true, mode: 'smtp', id: recordId };
    } catch (err: any) {
      this.logger.error(`Failed to send email to ${message.to}: ${err.message}`, err.stack);
      const record: OutboxMailRecord = {
        ...message,
        id: recordId,
        sentAt,
        sent: false,
        reason: err.message,
      };
      this.recordOutbox(record);
      return { sent: false, reason: err.message };
    }
  }

  async sendVerificationEmail(to: string, token: string, fullName?: string) {
    const actionUrl = `${this.frontendUrl}/?verifyToken=${encodeURIComponent(token)}&email=${encodeURIComponent(to)}`;
    const subject = 'Verify your Task Manager account';
    const text = `Hello ${fullName || 'there'},\n\nPlease verify your email address by opening the following link:\n${actionUrl}\n\nAlternatively, enter this verification token in the app: ${token}\n\nThis token expires in 24 hours.`;
    const html = this.renderEmailLayout({
      title: 'Verify Your Email Address',
      greeting: `Hello ${fullName || 'there'},`,
      intro: 'Thank you for signing up for Task Manager Pro. Please click the button below to verify your email address and activate your workspace access.',
      buttonText: 'Verify Email Address',
      buttonUrl: actionUrl,
      tokenLabel: 'Verification Token',
      tokenValue: token,
      footerNote: 'This link and verification token expire in 24 hours. If you did not sign up for Task Manager, you can safely ignore this email.',
    });

    return this.send({ to, subject, text, html, category: 'verification' });
  }

  async sendPasswordResetEmail(to: string, token: string, fullName?: string) {
    const actionUrl = `${this.frontendUrl}/?resetToken=${encodeURIComponent(token)}&email=${encodeURIComponent(to)}`;
    const subject = 'Reset your Task Manager password';
    const text = `Hello ${fullName || 'there'},\n\nWe received a request to reset your password. Open the link below to set a new password:\n${actionUrl}\n\nAlternatively, use this reset token: ${token}\n\nThis token expires in 1 hour.`;
    const html = this.renderEmailLayout({
      title: 'Reset Your Password',
      greeting: `Hello ${fullName || 'there'},`,
      intro: 'We received a request to reset your password for your Task Manager account. Click the button below to choose a new password.',
      buttonText: 'Reset Password',
      buttonUrl: actionUrl,
      tokenLabel: 'Password Reset Token',
      tokenValue: token,
      footerNote: 'This link expires in 1 hour. If you did not request a password reset, please secure your account immediately.',
    });

    return this.send({ to, subject, text, html, category: 'password_reset' });
  }

  async sendInvitationEmail(to: string, token: string, orgName: string, inviterName?: string, invitationId?: string) {
    const params = new URLSearchParams({ invitationToken: token, email: to });
    if (invitationId) {
      params.set('invitationId', invitationId);
    }
    const actionUrl = `${this.frontendUrl}/?${params.toString()}`;
    const subject = `You've been invited to join ${orgName} on Task Manager`;
    const text = `Hello,\n\n${inviterName || 'An administrator'} has invited you to join ${orgName} on Task Manager.\n\nAccept your invitation here:\n${actionUrl}\n\nInvitation token: ${token}\n\nThis invitation expires in 7 days.`;
    const html = this.renderEmailLayout({
      title: `Join ${orgName}`,
      greeting: 'Hello,',
      intro: `<strong>${inviterName || 'An administrator'}</strong> has invited you to join the <strong>${orgName}</strong> organization on Task Manager Pro.`,
      buttonText: 'Accept Invitation & Join',
      buttonUrl: actionUrl,
      tokenLabel: 'Invitation Token',
      tokenValue: token,
      footerNote: 'This invitation is valid for 7 days. Once accepted, you will have access to the assigned projects and boards.',
    });

    return this.send({ to, subject, text, html, category: 'invitation' });
  }

  async sendTestEmail(to: string, customSubject?: string) {
    const subject = customSubject?.trim() || 'Task Manager Pro — SMTP Configuration Test';
    const text = `This is a test email sent from Task Manager Pro.\nTime: ${new Date().toISOString()}\nSMTP Configured: ${this.configured}`;
    const html = this.renderEmailLayout({
      title: 'SMTP Mail Delivery Test',
      greeting: 'Hello Administrator,',
      intro: 'Your email delivery configuration is working properly! All verification emails, password resets, and organization invitations will be sent via this gateway.',
      buttonText: 'Open Task Manager',
      buttonUrl: this.frontendUrl,
      footerNote: `Test dispatched on ${new Date().toLocaleString()} (UTC). Mode: ${this.configured ? 'Live SMTP Transport' : 'Simulated Development Outbox'}.`,
    });

    return this.send({ to, subject, text, html, category: 'system_test' });
  }

  private recordOutbox(record: OutboxMailRecord) {
    this.outbox.push(record);
    if (this.outbox.length > 50) {
      this.outbox.shift();
    }
  }

  private renderEmailLayout(params: {
    title: string;
    greeting: string;
    intro: string;
    buttonText: string;
    buttonUrl: string;
    tokenLabel?: string;
    tokenValue?: string;
    footerNote: string;
  }): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${params.title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9; }
    .container { max-width: 580px; margin: 40px auto; background-color: #111827; border-radius: 12px; border: 1px solid #1f2937; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
    .header { background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #1f2937; }
    .logo { display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; background: linear-gradient(135deg, #6366f1, #3b82f6); border-radius: 10px; font-weight: 800; font-size: 20px; color: #ffffff; margin-bottom: 12px; }
    .brand-name { font-size: 18px; font-weight: 700; color: #f8fafc; letter-spacing: -0.02em; margin: 0; }
    .content { padding: 32px; }
    h2 { margin: 0 0 16px; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em; }
    p { margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #cbd5e1; }
    .btn-wrap { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; background: linear-gradient(135deg, #4f46e5, #3b82f6); color: #ffffff !important; text-decoration: none; padding: 14px 28px; font-size: 15px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4); }
    .token-box { background-color: #0f172a; border: 1px dashed #334155; border-radius: 8px; padding: 16px; text-align: center; margin: 24px 0; }
    .token-label { font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
    .token-value { font-family: 'Courier New', Courier, monospace; font-size: 18px; font-weight: 700; color: #38bdf8; word-break: break-all; }
    .footer { padding: 24px 32px; background-color: #0b0f19; border-top: 1px solid #1f2937; text-align: center; font-size: 13px; line-height: 1.5; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">TM</div>
      <p class="brand-name">Task Manager Pro</p>
    </div>
    <div class="content">
      <h2>${params.title}</h2>
      <p>${params.greeting}</p>
      <p>${params.intro}</p>
      
      <div class="btn-wrap">
        <a href="${params.buttonUrl}" class="btn" target="_blank">${params.buttonText}</a>
      </div>

      ${params.tokenValue ? `
        <div class="token-box">
          <div class="token-label">${params.tokenLabel || 'Code / Token'}</div>
          <div class="token-value">${params.tokenValue}</div>
        </div>
      ` : ''}

      <p style="font-size: 13px; color: #94a3b8; margin-top: 24px;">
        If the button above does not work, copy and paste this link into your browser:<br>
        <a href="${params.buttonUrl}" style="color: #60a5fa; word-break: break-all;">${params.buttonUrl}</a>
      </p>
    </div>
    <div class="footer">
      ${params.footerNote}<br>
      &copy; ${new Date().getFullYear()} Task Manager Pro. All rights reserved.
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  private generateDefaultHtml(subject: string, text: string): string {
    return `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background-color: #0b0f19; color: #f8fafc; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #111827; padding: 24px; border-radius: 8px; border: 1px solid #1f2937;">
    <h2 style="color: #6366f1;">${subject}</h2>
    <p style="white-space: pre-line; line-height: 1.6; color: #cbd5e1;">${text}</p>
  </div>
</body>
</html>
    `.trim();
  }
}