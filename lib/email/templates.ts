import type { Feedback, Project, FeedbackCategory } from "@/db/schema";

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface NewFeedbackEmailData {
  feedback: Feedback & { project: Pick<Project, 'name' | 'domain'> };
  adminName: string;
  dashboardUrl: string;
}

interface ResponseEmailData {
  feedback: Feedback & { project: Pick<Project, 'name' | 'domain'> };
  response: string;
  adminName: string;
}

interface SummaryEmailData {
  adminName: string;
  period: 'daily' | 'weekly';
  stats: {
    totalFeedback: number;
    unreadCount: number;
    categories: Record<FeedbackCategory, number>;
    topProjects: Array<{ projectName: string; count: number }>;
  };
  dashboardUrl: string;
}

export function createNewFeedbackEmail(data: NewFeedbackEmailData): EmailTemplate {
  const { feedback, adminName, dashboardUrl } = data;
  const categoryEmoji = {
    general: '💬',
    bug: '🐛', 
    feature: '✨',
    praise: '🎉'
  };

  const subject = `New ${feedback.category} feedback from ${feedback.project.name}`;
  
  const html = `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #1f2937; margin: 0; font-size: 24px;">
          ${categoryEmoji[feedback.category]} New Feedback Received
        </h1>
        <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 16px;">
          From ${feedback.project.name} (${feedback.project.domain})
        </p>
      </div>

      <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <div style="margin-bottom: 16px;">
          <span style="background-color: #3b82f6; color: white; padding: 4px 12px; border-radius: 6px; font-size: 14px; font-weight: 500; text-transform: capitalize;">
            ${feedback.category}
          </span>
        </div>
        
        <blockquote style="margin: 0; padding: 0; font-size: 16px; line-height: 1.6; color: #1f2937;">
          "${feedback.message}"
        </blockquote>
      </div>

      <div style="margin-bottom: 24px;">
        <h3 style="color: #1f2937; margin: 0 0 12px 0; font-size: 16px;">Details</h3>
        <table style="width: 100%; font-size: 14px; color: #6b7280;">
          <tr>
            <td style="padding: 4px 0; width: 100px;"><strong>Page:</strong></td>
            <td style="padding: 4px 0;"><a href="${feedback.pageUrl}" style="color: #3b82f6; text-decoration: none;">${feedback.pageUrl}</a></td>
          </tr>
          ${feedback.userEmail ? `
          <tr>
            <td style="padding: 4px 0;"><strong>Email:</strong></td>
            <td style="padding: 4px 0;">${feedback.userEmail}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 4px 0;"><strong>Time:</strong></td>
            <td style="padding: 4px 0;">${new Date(feedback.createdAt).toLocaleString()}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center;">
        <a href="${dashboardUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
          View in Dashboard
        </a>
      </div>

      <div style="margin-top: 32px; text-align: center; color: #9ca3af; font-size: 14px;">
        <p>Hi ${adminName}, you're receiving this because you manage ${feedback.project.name}.</p>
        <p style="margin: 0;">
          <a href="${dashboardUrl}/settings" style="color: #6b7280; text-decoration: none;">Manage email preferences</a>
        </p>
      </div>
    </div>
  `;

  const text = `
    New ${feedback.category} feedback from ${feedback.project.name}

    "${feedback.message}"

    Details:
    - Page: ${feedback.pageUrl}
    ${feedback.userEmail ? `- Email: ${feedback.userEmail}` : ''}
    - Time: ${new Date(feedback.createdAt).toLocaleString()}

    View in dashboard: ${dashboardUrl}

    ---
    Hi ${adminName}, you're receiving this because you manage ${feedback.project.name}.
  `;

  return { subject, html, text };
}

export function createResponseEmail(data: ResponseEmailData): EmailTemplate {
  const { feedback, response, adminName } = data;

  const subject = `Response to your feedback on ${feedback.project.name}`;

  const html = `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #1f2937; margin: 0; font-size: 24px;">
          💬 Response to Your Feedback
        </h1>
        <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 16px;">
          From the ${feedback.project.name} team
        </p>
      </div>

      <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #6b7280;">
        <p style="margin: 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Your Original Feedback</p>
        <blockquote style="margin: 0; padding: 0; font-size: 15px; line-height: 1.5; color: #4b5563;">
          "${feedback.message}"
        </blockquote>
      </div>

      <div style="background-color: #eff6ff; border-radius: 8px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #3b82f6;">
        <p style="margin: 0; font-size: 14px; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Team Response</p>
        <div style="font-size: 16px; line-height: 1.6; color: #1f2937;">
          ${response.split('\n').map(paragraph => `<p style="margin: 0 0 16px 0;">${paragraph}</p>`).join('')}
        </div>
        <p style="margin: 16px 0 0 0; font-size: 14px; color: #6b7280;">
          — ${adminName}
        </p>
      </div>

      <div style="margin-top: 32px; text-align: center; color: #9ca3af; font-size: 14px;">
        <p>Thank you for your feedback! It helps us improve ${feedback.project.name}.</p>
        <p style="margin: 8px 0 0 0;">
          <a href="${feedback.pageUrl}" style="color: #6b7280; text-decoration: none;">Visit ${feedback.project.domain}</a>
        </p>
      </div>
    </div>
  `;

  const text = `
    Response to Your Feedback - ${feedback.project.name}

    Your original feedback:
    "${feedback.message}"

    Our response:
    ${response}

    — ${adminName}

    Thank you for your feedback! It helps us improve ${feedback.project.name}.
    Visit: ${feedback.pageUrl}
  `;

  return { subject, html, text };
}

export function createSummaryEmail(data: SummaryEmailData): EmailTemplate {
  const { adminName, period, stats, dashboardUrl } = data;
  
  const subject = `${period === 'daily' ? 'Daily' : 'Weekly'} feedback summary - ${stats.totalFeedback} new submissions`;

  const topProjectsList = stats.topProjects
    .map(p => `<li style="margin: 4px 0;">${p.projectName}: ${p.count} feedback</li>`)
    .join('');

  const categoryList = Object.entries(stats.categories)
    .filter(([, count]) => count > 0)
    .map(([category, count]) => {
      const emoji = { general: '💬', bug: '🐛', feature: '✨', praise: '🎉' }[category as FeedbackCategory];
      return `<li style="margin: 4px 0;">${emoji} ${category}: ${count}</li>`;
    })
    .join('');

  const html = `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #1f2937; margin: 0; font-size: 24px;">
          📊 ${period === 'daily' ? 'Daily' : 'Weekly'} Feedback Summary
        </h1>
        <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 16px;">
          ${stats.totalFeedback} new submissions this ${period.replace('ly', '')}
        </p>
      </div>

      <div style="display: grid; gap: 16px; margin-bottom: 32px;">
        <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: #3b82f6; margin-bottom: 4px;">${stats.totalFeedback}</div>
          <div style="font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Total Feedback</div>
        </div>

        ${stats.unreadCount > 0 ? `
        <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: #d97706; margin-bottom: 4px;">${stats.unreadCount}</div>
          <div style="font-size: 14px; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px;">Needs Attention</div>
        </div>
        ` : ''}
      </div>

      ${stats.topProjects.length > 0 ? `
      <div style="margin-bottom: 24px;">
        <h3 style="color: #1f2937; margin: 0 0 12px 0; font-size: 16px;">Top Projects</h3>
        <ul style="margin: 0; padding: 0; list-style: none; color: #6b7280;">
          ${topProjectsList}
        </ul>
      </div>
      ` : ''}

      ${categoryList ? `
      <div style="margin-bottom: 24px;">
        <h3 style="color: #1f2937; margin: 0 0 12px 0; font-size: 16px;">Feedback Categories</h3>
        <ul style="margin: 0; padding: 0; list-style: none; color: #6b7280;">
          ${categoryList}
        </ul>
      </div>
      ` : ''}

      <div style="text-align: center;">
        <a href="${dashboardUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
          View Full Dashboard
        </a>
      </div>

      <div style="margin-top: 32px; text-align: center; color: #9ca3af; font-size: 14px;">
        <p>Hi ${adminName}, this is your ${period} feedback summary.</p>
        <p style="margin: 0;">
          <a href="${dashboardUrl}/settings" style="color: #6b7280; text-decoration: none;">Manage email preferences</a>
        </p>
      </div>
    </div>
  `;

  const text = `
    ${period === 'daily' ? 'Daily' : 'Weekly'} Feedback Summary

    ${stats.totalFeedback} new submissions this ${period.replace('ly', '')}
    ${stats.unreadCount > 0 ? `${stats.unreadCount} need attention` : ''}

    ${stats.topProjects.length > 0 ? `
    Top Projects:
    ${stats.topProjects.map(p => `- ${p.projectName}: ${p.count} feedback`).join('\n')}
    ` : ''}

    ${Object.entries(stats.categories).filter(([, count]) => count > 0).length > 0 ? `
    Categories:
    ${Object.entries(stats.categories)
      .filter(([, count]) => count > 0)
      .map(([category, count]) => `- ${category}: ${count}`)
      .join('\n')}
    ` : ''}

    View dashboard: ${dashboardUrl}

    Hi ${adminName}, this is your ${period} feedback summary.
  `;

  return { subject, html, text };
}