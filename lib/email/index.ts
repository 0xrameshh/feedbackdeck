import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from = 'noreply@yourdomain.com' }: EmailOptions) {
  if (!resend) {
    console.warn('Resend not configured, skipping email send');
    return { success: false, error: 'Resend not configured' };
  }
  
  try {
    const result = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}