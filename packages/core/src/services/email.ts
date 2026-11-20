import { isEmailConfigured, sendEmail } from "@platform/email";

/**
 * Email Notification Service
 * 
 * Service for sending email notifications for tickets
 * Integrate with email providers (SendGrid, Resend, AWS SES, etc.)
 */

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface EmailService {
  send(options: EmailOptions): Promise<void>;
}

/**
 * Ticket notification email templates
 */
export class TicketEmailTemplates {
  static ticketCreated(ticket: {
    ticketNumber: string;
    subject: string;
    requesterName?: string;
    requesterEmail?: string;
    priority: string;
  }): EmailOptions {
    return {
      to: ticket.requesterEmail || "",
      subject: `Ticket Created: ${ticket.ticketNumber} - ${ticket.subject}`,
      html: `
        <h2>Your support ticket has been created</h2>
        <p>Hello ${ticket.requesterName || "there"},</p>
        <p>We've received your support request and created ticket <strong>${ticket.ticketNumber}</strong>.</p>
        <p><strong>Subject:</strong> ${ticket.subject}</p>
        <p><strong>Priority:</strong> ${ticket.priority}</p>
        <p>Our support team will review your ticket and get back to you soon.</p>
        <p>You can track your ticket status at: <a href="${process.env.VITE_PUBLIC_SITE_URL || 'https://yourdomain.com'}/portal">Support Portal</a></p>
      `,
      text: `
        Your support ticket has been created
        
        Ticket Number: ${ticket.ticketNumber}
        Subject: ${ticket.subject}
        Priority: ${ticket.priority}
        
        Our support team will review your ticket and get back to you soon.
      `,
    };
  }

  static ticketAssigned(ticket: {
    ticketNumber: string;
    subject: string;
    assignedToName?: string;
  }): EmailOptions {
    return {
      to: ticket.assignedToName || "",
      subject: `Ticket Assigned: ${ticket.ticketNumber}`,
      html: `
        <h2>New ticket assigned to you</h2>
        <p>You've been assigned to ticket <strong>${ticket.ticketNumber}</strong>.</p>
        <p><strong>Subject:</strong> ${ticket.subject}</p>
        <p>Please review and respond to this ticket.</p>
      `,
    };
  }

  static ticketUpdated(ticket: {
    ticketNumber: string;
    subject: string;
    status: string;
    requesterEmail?: string;
  }): EmailOptions {
    return {
      to: ticket.requesterEmail || "",
      subject: `Ticket Updated: ${ticket.ticketNumber}`,
      html: `
        <h2>Your ticket has been updated</h2>
        <p>Ticket <strong>${ticket.ticketNumber}</strong> status has been updated to <strong>${ticket.status}</strong>.</p>
        <p><strong>Subject:</strong> ${ticket.subject}</p>
        <p>View your ticket: <a href="${process.env.VITE_PUBLIC_SITE_URL || 'https://yourdomain.com'}/portal">Support Portal</a></p>
      `,
    };
  }

  static ticketResolved(ticket: {
    ticketNumber: string;
    subject: string;
    requesterEmail?: string;
  }): EmailOptions {
    return {
      to: ticket.requesterEmail || "",
      subject: `Ticket Resolved: ${ticket.ticketNumber}`,
      html: `
        <h2>Your ticket has been resolved</h2>
        <p>Ticket <strong>${ticket.ticketNumber}</strong> has been marked as resolved.</p>
        <p><strong>Subject:</strong> ${ticket.subject}</p>
        <p>Thank you for contacting us. If you need further assistance, please reply to this email or create a new ticket.</p>
      `,
    };
  }
}

/**
 * Resend-backed email service.
 * Falls back to console logging when RESEND_API_KEY is not configured.
 */
export class ResendEmailService implements EmailService {
  async send(options: EmailOptions): Promise<void> {
    const env = {
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      EMAIL_FROM: process.env.EMAIL_FROM,
    };
    if (!isEmailConfigured(env)) {
      console.log("[Email Service] RESEND_API_KEY not set — logging instead:", {
        to: options.to,
        subject: options.subject,
      });
      return;
    }
    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    for (const to of recipients) {
      await sendEmail(env, {
        to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
    }
  }
}

/**
 * Get email service instance.
 */
export function getEmailService(): EmailService {
  return new ResendEmailService();
}
