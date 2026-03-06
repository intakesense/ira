// IRA Platform - Email Templates
// HTML email templates for notifications
// Uses inline styles for maximum email client compatibility

export interface LeadAssignmentEmailData {
  assessorName: string;
  assessorEmail: string;
  companyName: string;
  leadId: string;
  cin: string;
  reviewerName: string;
  actionUrl: string;
}

export interface AssessmentSubmittedEmailData {
  reviewerName: string;
  reviewerEmail: string;
  companyName: string;
  leadId: string;
  assessorName: string;
  totalScore: number;
  percentage: number;
  rating: string;
  actionUrl: string;
}

export interface AssessmentRejectedEmailData {
  assessorName: string;
  assessorEmail: string;
  companyName: string;
  leadId: string;
  reviewerName: string;
  comments: string;
  actionUrl: string;
}

export interface OrganicSubmissionEmailData {
  reviewerName: string;
  reviewerEmail: string;
  companyName: string;
  cin: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string | null;
}

export interface EmailVerificationEmailData {
  contactPerson: string;
  contactEmail: string;
  companyName: string;
  verificationToken: string;
}

export interface SubmissionApprovedEmailData {
  contactPerson: string;
  contactEmail: string;
  companyName: string;
  leadId: string;
}

export interface SubmissionRejectedEmailData {
  contactPerson: string;
  contactEmail: string;
  companyName: string;
  rejectionReason?: string;
}

export interface PaymentLinkEmailData {
  recipientEmail: string;
  amount?: string;
  description?: string;
  paymentLink: string;
  recipientName?: string;
  invoiceNumber?: string;
  dueDate?: string;
  items?: { label: string; amount: string }[];
}

/**
 * Email template for lead assignment notification (sent to assessor)
 */
export function getLeadAssignmentEmailHTML(
  data: LeadAssignmentEmailData,
): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Lead Assigned</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                New Lead Assigned
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">
                Hi <strong>${data.assessorName}</strong>,
              </p>

              <p style="margin: 0 0 30px 0; font-size: 16px; color: #555; line-height: 1.6;">
                You have been assigned a new lead by <strong>${data.reviewerName}</strong>. Please review the details below and start the assessment process.
              </p>

              <!-- Info Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8f9fa; border-left: 4px solid #667eea; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 12px 0; font-size: 15px; color: #666;">
                      <strong style="color: #333;">Company:</strong> ${data.companyName}
                    </p>
                    <p style="margin: 0 0 12px 0; font-size: 15px; color: #666;">
                      <strong style="color: #333;">Lead ID:</strong> ${data.leadId}
                    </p>
                    <p style="margin: 0; font-size: 15px; color: #666;">
                      <strong style="color: #333;">CIN:</strong> ${data.cin}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding: 10px 0 30px 0;">
                    <a href="${data.actionUrl}" style="display: inline-block; background-color: #667eea; color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 16px; font-weight: 600; letter-spacing: 0.3px; box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);">
                      Start Assessment
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 14px; color: #888; line-height: 1.6;">
                This is an automated notification from the IRA Platform. If you have any questions, please contact your reviewer.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0; font-size: 13px; color: #999;">
                IPO Readiness Assessment Platform
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Plain text version of lead assignment email (fallback)
 */
export function getLeadAssignmentEmailText(
  data: LeadAssignmentEmailData,
): string {
  return `
New Lead Assigned

Hi ${data.assessorName},

You have been assigned a new lead by ${data.reviewerName}. Please review the details below and start the assessment process.

Company: ${data.companyName}
Lead ID: ${data.leadId}
CIN: ${data.cin}

Start Assessment: ${data.actionUrl}

This is an automated notification from the IRA Platform. If you have any questions, please contact your reviewer.

---
IPO Readiness Assessment Platform
  `.trim();
}

/**
 * Email template for assessment submission notification (sent to reviewer)
 */
export function getAssessmentSubmittedEmailHTML(
  data: AssessmentSubmittedEmailData,
): string {
  // Determine rating color
  let ratingColor = "#28a745"; // IPO_READY - green
  let ratingText = "IPO Ready";

  if (data.rating === "NEEDS_IMPROVEMENT") {
    ratingColor = "#ffc107"; // yellow
    ratingText = "Needs Improvement";
  } else if (data.rating === "NOT_READY") {
    ratingColor = "#dc3545"; // red
    ratingText = "Not Ready";
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assessment Ready for Review</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                Assessment Ready for Review
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">
                Hi <strong>${data.reviewerName}</strong>,
              </p>

              <p style="margin: 0 0 30px 0; font-size: 16px; color: #555; line-height: 1.6;">
                <strong>${data.assessorName}</strong> has completed an assessment and submitted it for your review.
              </p>

              <!-- Info Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8f9fa; border-left: 4px solid #667eea; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 12px 0; font-size: 15px; color: #666;">
                      <strong style="color: #333;">Company:</strong> ${data.companyName}
                    </p>
                    <p style="margin: 0 0 12px 0; font-size: 15px; color: #666;">
                      <strong style="color: #333;">Lead ID:</strong> ${data.leadId}
                    </p>
                    <p style="margin: 0 0 12px 0; font-size: 15px; color: #666;">
                      <strong style="color: #333;">Assessor:</strong> ${data.assessorName}
                    </p>
                    <hr style="border: none; border-top: 1px solid #e9ecef; margin: 16px 0;">
                    <p style="margin: 0 0 12px 0; font-size: 15px; color: #666;">
                      <strong style="color: #333;">Total Score:</strong> ${data.totalScore}
                    </p>
                    <p style="margin: 0 0 12px 0; font-size: 15px; color: #666;">
                      <strong style="color: #333;">Percentage:</strong> ${data.percentage.toFixed(1)}%
                    </p>
                    <p style="margin: 0; font-size: 15px; color: #666;">
                      <strong style="color: #333;">Rating:</strong>
                      <span style="display: inline-block; padding: 4px 12px; background-color: ${ratingColor}; color: #ffffff; border-radius: 4px; font-size: 13px; font-weight: 600; margin-left: 8px;">
                        ${ratingText}
                      </span>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding: 10px 0 30px 0;">
                    <a href="${data.actionUrl}" style="display: inline-block; background-color: #667eea; color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 16px; font-weight: 600; letter-spacing: 0.3px; box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);">
                      Review Assessment
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 14px; color: #888; line-height: 1.6;">
                This is an automated notification from the IRA Platform. Please review the assessment at your earliest convenience.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0; font-size: 13px; color: #999;">
                IPO Readiness Assessment Platform
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Plain text version of assessment submitted email (fallback)
 */
export function getAssessmentSubmittedEmailText(
  data: AssessmentSubmittedEmailData,
): string {
  let ratingText = "IPO Ready";
  if (data.rating === "NEEDS_IMPROVEMENT") ratingText = "Needs Improvement";
  else if (data.rating === "NOT_READY") ratingText = "Not Ready";

  return `
Assessment Ready for Review

Hi ${data.reviewerName},

${data.assessorName} has completed an assessment and submitted it for your review.

Company: ${data.companyName}
Lead ID: ${data.leadId}
Assessor: ${data.assessorName}

Assessment Results:
- Total Score: ${data.totalScore}
- Percentage: ${data.percentage.toFixed(1)}%
- Rating: ${ratingText}

Review Assessment: ${data.actionUrl}

This is an automated notification from the IRA Platform. Please review the assessment at your earliest convenience.

---
IPO Readiness Assessment Platform
  `.trim();
}

/**
 * Email template for assessment rejection notification (sent to assessor)
 */
export function getAssessmentRejectedEmailHTML(
  data: AssessmentRejectedEmailData,
): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assessment Rejected - Revision Required</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                Assessment Revision Required
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">
                Hi <strong>${data.assessorName}</strong>,
              </p>

              <p style="margin: 0 0 30px 0; font-size: 16px; color: #555; line-height: 1.6;">
                <strong>${data.reviewerName}</strong> has reviewed your assessment and requested revisions. Please review the feedback below and resubmit.
              </p>

              <!-- Info Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8f9fa; border-left: 4px solid #dc3545; border-radius: 8px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 12px 0; font-size: 15px; color: #666;">
                      <strong style="color: #333;">Company:</strong> ${data.companyName}
                    </p>
                    <p style="margin: 0; font-size: 15px; color: #666;">
                      <strong style="color: #333;">Lead ID:</strong> ${data.leadId}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Feedback Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #856404; font-weight: 600;">
                      Reviewer Comments:
                    </p>
                    <p style="margin: 0; font-size: 15px; color: #333; white-space: pre-wrap; line-height: 1.6;">
${data.comments}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding: 10px 0 30px 0;">
                    <a href="${data.actionUrl}" style="display: inline-block; background-color: #667eea; color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 16px; font-weight: 600; letter-spacing: 0.3px; box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);">
                      Revise Assessment
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 14px; color: #888; line-height: 1.6;">
                This is an automated notification from the IRA Platform. If you have questions about the feedback, please contact your reviewer.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0; font-size: 13px; color: #999;">
                IPO Readiness Assessment Platform
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Plain text version of assessment rejected email (fallback)
 */
export function getAssessmentRejectedEmailText(
  data: AssessmentRejectedEmailData,
): string {
  return `
Assessment Revision Required

Hi ${data.assessorName},

${data.reviewerName} has reviewed your assessment and requested revisions. Please review the feedback below and resubmit.

Company: ${data.companyName}
Lead ID: ${data.leadId}

Reviewer Comments:
${data.comments}

Revise Assessment: ${data.actionUrl}

This is an automated notification from the IRA Platform. If you have questions about the feedback, please contact your reviewer.

---
IPO Readiness Assessment Platform
  `.trim();
}

/**
 * Email template for organic submission notification (sent to reviewer)
 */
export function getOrganicSubmissionEmailHTML(
  data: OrganicSubmissionEmailData,
): string {
  const baseUrl =
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";
  const submissionsUrl = `${baseUrl}/dashboard/organic-submissions`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Organic Lead Submission</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                New Website Lead Submission
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">
                Hi <strong>${data.reviewerName}</strong>,
              </p>

              <p style="margin: 0 0 30px 0; font-size: 16px; color: #555; line-height: 1.6;">
                A new company has submitted their details through the website eligibility checker. Please review the information below and decide whether to create a lead.
              </p>

              <!-- Company Info Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8f9fa; border-left: 4px solid #10b981; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 16px 0; font-size: 14px; color: #10b981; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      Company Details
                    </p>
                    <p style="margin: 0 0 12px 0; font-size: 15px; color: #666;">
                      <strong style="color: #333;">Company Name:</strong> ${data.companyName}
                    </p>
                    <p style="margin: 0; font-size: 15px; color: #666;">
                      <strong style="color: #333;">CIN:</strong> ${data.cin}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Contact Info Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8f9fa; border-left: 4px solid #667eea; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 16px 0; font-size: 14px; color: #667eea; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      Contact Information
                    </p>
                    <p style="margin: 0 0 12px 0; font-size: 15px; color: #666;">
                      <strong style="color: #333;">Name:</strong> ${data.contactPerson}
                    </p>
                    <p style="margin: 0 0 12px 0; font-size: 15px; color: #666;">
                      <strong style="color: #333;">Email:</strong>
                      <a href="mailto:${data.contactEmail}" style="color: #667eea; text-decoration: none;">
                        ${data.contactEmail}
                      </a>
                    </p>
                    ${
                      data.contactPhone
                        ? `
                    <p style="margin: 0; font-size: 15px; color: #666;">
                      <strong style="color: #333;">Phone:</strong>
                      <a href="tel:${data.contactPhone}" style="color: #667eea; text-decoration: none;">
                        ${data.contactPhone}
                      </a>
                    </p>
                    `
                        : ""
                    }
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding: 10px 0 30px 0;">
                    <a href="${submissionsUrl}" style="display: inline-block; background-color: #667eea; color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 16px; font-weight: 600; letter-spacing: 0.3px; box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);">
                      Review Submission
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 14px; color: #888; line-height: 1.6;">
                This is an automated notification from the IRA Platform. You can view all pending submissions in the dashboard.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0; font-size: 13px; color: #999;">
                IPO Readiness Assessment Platform
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Plain text version of organic submission email (fallback)
 */
export function getOrganicSubmissionEmailText(
  data: OrganicSubmissionEmailData,
): string {
  const baseUrl =
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";
  const submissionsUrl = `${baseUrl}/dashboard/organic-submissions`;

  return `
New Website Lead Submission

Hi ${data.reviewerName},

A new company has submitted their details through the website eligibility checker. Please review the information below and decide whether to create a lead.

COMPANY DETAILS
Company Name: ${data.companyName}
CIN: ${data.cin}

CONTACT INFORMATION
Name: ${data.contactPerson}
Email: ${data.contactEmail}${
    data.contactPhone
      ? `
Phone: ${data.contactPhone}`
      : ""
  }

Review Submission: ${submissionsUrl}

This is an automated notification from the IRA Platform. You can view all pending submissions in the dashboard.

---
IPO Readiness Assessment Platform
  `.trim();
}

/**
 * Email template for email verification (sent to lead contact)
 */
export function getEmailVerificationEmailHTML(
  data: EmailVerificationEmailData,
): string {
  const baseUrl =
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";
  const verificationUrl = `${baseUrl}/verify-email?token=${data.verificationToken}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email Address</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                Verify Your Email Address
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">
                Hi <strong>${data.contactPerson}</strong>,
              </p>

              <p style="margin: 0 0 30px 0; font-size: 16px; color: #555; line-height: 1.6;">
                Thank you for submitting <strong>${data.companyName}</strong> for IPO readiness assessment. To complete your submission and allow our team to review your application, please verify your email address.
              </p>

              <!-- Info Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8f9fa; border-left: 4px solid #667eea; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0; font-size: 15px; color: #666;">
                      <strong style="color: #333;">Company:</strong> ${data.companyName}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding: 10px 0 30px 0;">
                    <a href="${verificationUrl}" style="display: inline-block; background-color: #667eea; color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 16px; font-weight: 600; letter-spacing: 0.3px; box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Alternative Link -->
              <p style="margin: 0 0 20px 0; font-size: 14px; color: #666; line-height: 1.6; text-align: center;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 30px 0; font-size: 13px; color: #667eea; word-break: break-all; text-align: center;">
                ${verificationUrl}
              </p>

              <!-- Security Notice -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 8px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0; font-size: 14px; color: #856404; line-height: 1.6;">
                      <strong>Security Notice:</strong> This verification link will expire in 24 hours. If you didn't request this, please ignore this email.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 14px; color: #888; line-height: 1.6;">
                This is an automated email from the IRA Platform. For support, please contact <a href="mailto:support@ira-platform.com" style="color: #667eea; text-decoration: none;">support@ira-platform.com</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0; font-size: 13px; color: #999;">
                IPO Readiness Assessment Platform
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Plain text version of email verification email (fallback)
 */
export function getEmailVerificationEmailText(
  data: EmailVerificationEmailData,
): string {
  const baseUrl =
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";
  const verificationUrl = `${baseUrl}/verify-email?token=${data.verificationToken}`;

  return `
Verify Your Email Address

Hi ${data.contactPerson},

Thank you for submitting ${data.companyName} for IPO readiness assessment. To complete your submission and allow our team to review your application, please verify your email address.

Company: ${data.companyName}

Verify your email by clicking this link:
${verificationUrl}

SECURITY NOTICE: This verification link will expire in 24 hours. If you didn't request this, please ignore this email.

This is an automated email from the IRA Platform. For support, please contact support@ira-platform.com.

---
IPO Readiness Assessment Platform
  `.trim();
}

/**
 * Email template for submission approval (sent to company contact)
 */
export function getSubmissionApprovedEmailHTML(
  data: SubmissionApprovedEmailData,
): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Submission Approved</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                ✓ Submission Approved!
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">
                Hi <strong>${data.contactPerson}</strong>,
              </p>

              <p style="margin: 0 0 30px 0; font-size: 16px; color: #555; line-height: 1.6;">
                Great news! Your submission for <strong>${data.companyName}</strong> has been approved by our team. We've created a lead in our system and will begin the IPO readiness assessment process.
              </p>

              <!-- Info Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 12px 0; font-size: 15px; color: #666;">
                      <strong style="color: #333;">Company:</strong> ${data.companyName}
                    </p>
                    <p style="margin: 0; font-size: 15px; color: #666;">
                      <strong style="color: #333;">Lead ID:</strong> ${data.leadId}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Next Steps -->
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #333;">What Happens Next?</h3>
                <div style="space-y: 12px;">
                  <div style="display: flex; align-items: start; margin-bottom: 12px;">
                    <span style="display: inline-block; width: 24px; height: 24px; background-color: #10b981; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: bold; margin-right: 12px; flex-shrink: 0;">1</span>
                    <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.6;">Our team will conduct a comprehensive IPO readiness assessment</p>
                  </div>
                  <div style="display: flex; align-items: start; margin-bottom: 12px;">
                    <span style="display: inline-block; width: 24px; height: 24px; background-color: #10b981; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: bold; margin-right: 12px; flex-shrink: 0;">2</span>
                    <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.6;">We'll evaluate your company across multiple criteria</p>
                  </div>
                  <div style="display: flex; align-items: start;">
                    <span style="display: inline-block; width: 24px; height: 24px; background-color: #10b981; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: bold; margin-right: 12px; flex-shrink: 0;">3</span>
                    <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.6;">You'll receive a detailed report with our findings and recommendations</p>
                  </div>
                </div>
              </div>

              <p style="margin: 0 0 20px 0; font-size: 14px; color: #666; line-height: 1.6;">
                We'll keep you updated throughout the process. If you have any questions, please don't hesitate to reach out to us.
              </p>

              <p style="margin: 0; font-size: 14px; color: #888; line-height: 1.6; border-top: 1px solid #e9ecef; padding-top: 20px;">
                This is an automated email from the IRA Platform. For support, please contact <a href="mailto:support@irascore.com" style="color: #10b981; text-decoration: none;">support@irascore.com</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0; font-size: 13px; color: #999;">
                IPO Readiness Assessment Platform
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Plain text version of submission approval email
 */
export function getSubmissionApprovedEmailText(
  data: SubmissionApprovedEmailData,
): string {
  return `
Submission Approved!

Hi ${data.contactPerson},

Great news! Your submission for ${data.companyName} has been approved by our team. We've created a lead in our system and will begin the IPO readiness assessment process.

Company: ${data.companyName}
Lead ID: ${data.leadId}

WHAT HAPPENS NEXT?

1. Our team will conduct a comprehensive IPO readiness assessment
2. We'll evaluate your company across multiple criteria
3. You'll receive a detailed report with our findings and recommendations

We'll keep you updated throughout the process. If you have any questions, please don't hesitate to reach out to us.

This is an automated email from the IRA Platform. For support, please contact support@irascore.com.

---
IPO Readiness Assessment Platform
  `.trim();
}

/**
 * Email template for submission rejection (sent to company contact)
 */
export function getSubmissionRejectedEmailHTML(
  data: SubmissionRejectedEmailData,
): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Submission Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                Submission Update
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">
                Hi <strong>${data.contactPerson}</strong>,
              </p>

              <p style="margin: 0 0 30px 0; font-size: 16px; color: #555; line-height: 1.6;">
                Thank you for your interest in our IPO readiness assessment service. After reviewing your submission for <strong>${data.companyName}</strong>, we're unable to proceed with an assessment at this time.
              </p>

              ${
                data.rejectionReason
                  ? `
              <!-- Reason Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #92400e;">
                      Reason:
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #78350f; line-height: 1.6;">
                      ${data.rejectionReason}
                    </p>
                  </td>
                </tr>
              </table>
              `
                  : ""
              }

              <!-- Next Steps -->
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #333;">What You Can Do:</h3>
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #666; line-height: 1.8;">
                  <li>Review and address any concerns mentioned above</li>
                  <li>Feel free to resubmit your application in the future</li>
                  <li>Contact our support team if you have questions or need clarification</li>
                </ul>
              </div>

              <p style="margin: 0 0 20px 0; font-size: 14px; color: #666; line-height: 1.6;">
                We appreciate your interest in our services. If you believe this decision was made in error or if circumstances change, please don't hesitate to reach out to our team.
              </p>

              <p style="margin: 0; font-size: 14px; color: #888; line-height: 1.6; border-top: 1px solid #e9ecef; padding-top: 20px;">
                This is an automated email from the IRA Platform. For support, please contact <a href="mailto:support@irascore.com" style="color: #f59e0b; text-decoration: none;">support@irascore.com</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0; font-size: 13px; color: #999;">
                IPO Readiness Assessment Platform
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Plain text version of submission rejection email
 */
export function getSubmissionRejectedEmailText(
  data: SubmissionRejectedEmailData,
): string {
  return `
Submission Update

Hi ${data.contactPerson},

Thank you for your interest in our IPO readiness assessment service. After reviewing your submission for ${data.companyName}, we're unable to proceed with an assessment at this time.

${data.rejectionReason ? `REASON:\n${data.rejectionReason}\n\n` : ""}WHAT YOU CAN DO:

- Review and address any concerns mentioned above
- Feel free to resubmit your application in the future
- Contact our support team if you have questions or need clarification

We appreciate your interest in our services. If you believe this decision was made in error or if circumstances change, please don't hesitate to reach out to our team.

This is an automated email from the IRA Platform. For support, please contact support@irascore.com.

---
IPO Readiness Assessment Platform
  `.trim();
}

/**
 * Email template for payment link
 */

export function getPaymentLinkEmailHTML(data: PaymentLinkEmailData): string {
  const itemRows = data.items
    ? data.items
        .map(
          (item) => `
      <tr>
        <td style="padding: 10px 0; font-size: 14px; color: #555; border-bottom: 1px solid #f0f0f0;">${item.label}</td>
        <td style="padding: 10px 0; font-size: 14px; color: #555; text-align: right; border-bottom: 1px solid #f0f0f0;">${item.amount}</td>
      </tr>`
        )
        .join("")
    : "";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Request – IRA Platform</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f0f2f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 16px;">
              <table role="presentation" style="width: 100%; max-width: 560px; border-collapse: collapse;">

                <!-- Logo -->
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: inline-block; line-height: 48px; text-align: center;">
                      <span style="color: white; font-size: 22px; font-weight: 700;">I</span>
                    </div>
                    <p style="margin: 8px 0 0 0; font-size: 13px; color: #888; letter-spacing: 1px; text-transform: uppercase;">IRA Platform</p>
                  </td>
                </tr>

                <!-- Main Card -->
                <tr>
                  <td style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08);">

                    <!-- Card Header -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 36px 40px 28px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                          <h1 style="margin: 0 0 6px 0; color: white; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">Payment Request</h1>
                          ${data.invoiceNumber ? `<p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.75);">Invoice #${data.invoiceNumber}</p>` : ''}
                          ${data.dueDate ? `<p style="margin: 4px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.75);">Due by ${data.dueDate}</p>` : ''}
                        </td>
                      </tr>
                    </table>

                    <!-- Body -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 36px 40px;">

                          <p style="margin: 0 0 6px 0; font-size: 16px; color: #333;">
                            Hello${data.recipientName ? ` <strong>${data.recipientName}</strong>` : ''},
                          </p>
                          <p style="margin: 0 0 28px 0; font-size: 15px; line-height: 24px; color: #555;">
                            You have a new secure payment request. Please review the details below and complete your payment at your earliest convenience.
                          </p>

                          <!-- Order Summary -->
                          ${itemRows ? `
                          <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 700; color: #333; text-transform: uppercase; letter-spacing: 0.8px;">Your Order</p>
                          <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 0;">
                            ${itemRows}
                          </table>
                          ` : ''}

                          <!-- Total -->
                          ${data.amount ? `
                          <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 16px 0 32px 0; border-top: 2px solid #111;">
                            <tr>
                              <td style="padding: 14px 0 0 0; font-size: 16px; font-weight: 700; color: #111;">Total</td>
                              <td style="padding: 14px 0 0 0; font-size: 22px; font-weight: 700; color: #111; text-align: right;">₹${data.amount}</td>
                            </tr>
                          </table>
                          ` : ''}

                          <!-- Description -->
                          ${data.description ? `
                          <p style="margin: 0 0 28px 0; font-size: 14px; line-height: 22px; color: #666; padding: 14px 16px; background: #f9fafb; border-radius: 8px; border-left: 3px solid #667eea;">
                            ${data.description}
                          </p>
                          ` : ''}

                          <!-- CTA Button -->
                          <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                            <tr>
                              <td align="center">
                                <a href="${data.paymentLink}"
                                   style="display: inline-block; padding: 16px 48px; font-size: 16px; font-weight: 700; color: white; text-decoration: none; background: #10b981; border-radius: 8px; letter-spacing: 0.3px;">
                                    Make Payment →
                                </a>
                              </td>
                            </tr>
                          </table>

                          <p style="margin: 0 0 8px 0; font-size: 13px; color: #999; text-align: center;">Or copy this link into your browser:</p>
                          <p style="margin: 0 0 28px 0; padding: 10px 14px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; word-break: break-all; font-size: 12px; color: #3b82f6; text-align: center;">
                            ${data.paymentLink}
                          </p>

                          <!-- Info Box -->
                          <table role="presentation" style="width: 100%; border-collapse: collapse; background: #eff6ff; border-radius: 8px;">
                            <tr>
                              <td style="padding: 16px 20px;">
                                <p style="margin: 0 0 10px 0; font-size: 13px; font-weight: 700; color: #1d4ed8;">Payment Details</p>
                                <p style="margin: 0; font-size: 13px; color: #555; line-height: 26px;">
                                  ✅ &nbsp;Secure payment via Razorpay<br>
                                  ⏱ &nbsp;Link expires in 24 hours<br>
                                  💬 &nbsp;Questions? <a href="mailto:support@irascore.com" style="color: #3b82f6; text-decoration: none;">support@irascore.com</a>
                                </p>
                              </td>
                            </tr>
                          </table>

                        </td>
                      </tr>
                    </table>

                    <!-- Footer -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse; background: #f9fafb; border-top: 1px solid #e5e7eb;">
                      <tr>
                        <td style="padding: 24px 40px; text-align: center;">
                          <p style="margin: 0 0 4px 0; font-size: 12px; color: #999;">
                            This is an automated payment notification from IRA Platform.
                          </p>
                          <p style="margin: 0; font-size: 12px; color: #bbb;">
                            &copy; ${new Date().getFullYear()} IRA Platform. All rights reserved.
                          </p>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>

                <!-- Bottom note -->
                <tr>
                  <td align="center" style="padding: 20px 0 0 0;">
                    <p style="margin: 0; font-size: 12px; color: #aaa;">Thanks for being a valued customer.</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

export function getPaymentLinkEmailText(data: PaymentLinkEmailData): string {
  return `
Payment Request from IRA Platform

You have received a secure payment request.

${data.amount ? `Amount Due: ₹${data.amount}\n` : ""}
${data.description ? `${data.description}\n` : ""}

Complete your payment by clicking this link:
${data.paymentLink}

Payment Details:
- Secure payment via Razorpay
- Link expires in 24 hours
- Questions? Contact support@irascore.com

---
This is an automated payment notification from IRA Platform.
© ${new Date().getFullYear()} IRA Platform. All rights reserved.
  `.trim();
}

// Client email template

export interface ClientCredentialsEmailData {
  recipientEmail: string
  recipientName: string
  companyName: string
  loginUrl: string
  cin: string 
}

export function getClientCredentialsEmailHTML(data: ClientCredentialsEmailData): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to your IPO Readiness Portal</h2>
      <p>Dear ${data.recipientName},</p>
      <p>Your payment has been received. You can now access your IPO Readiness Dashboard.</p>
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Company:</strong> ${data.companyName}</p>
        <p><strong>Your Login ID (CIN):</strong> ${data.cin}</p>
      </div>
      <p>Click the button below to login. You will receive an OTP on this email to verify.</p>
      <a href="${data.loginUrl}" 
        style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
        Access Your Dashboard
      </a>
      <p style="margin-top: 16px; font-size: 13px; color: #6b7280;">
        Or copy this link: ${data.loginUrl}
      </p>
    </div>
  `
}


export function getClientCredentialsEmailText(data: ClientCredentialsEmailData): string {
  return `
Welcome to your IPO Readiness Portal

Dear ${data.recipientName},

Your payment has been received.

Company: ${data.companyName}
Your Login ID (CIN): ${data.cin}

Login here: ${data.loginUrl}

You will receive an OTP on this email to verify your identity.
  `
}
