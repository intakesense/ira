// IRA Platform - Email Service
// Centralized email sending with Resend API
// ✅ Fire-and-forget pattern (doesn't block core operations)
// ✅ Structured error logging
// ✅ Rate limit handling (2 emails/second)
// ✅ Plain text fallback support

import { Resend } from 'resend'
import {
  getLeadAssignmentEmailHTML,
  getLeadAssignmentEmailText,
  getAssessmentSubmittedEmailHTML,
  getAssessmentSubmittedEmailText,
  getAssessmentRejectedEmailHTML,
  getAssessmentRejectedEmailText,
  getOrganicSubmissionEmailHTML,
  getOrganicSubmissionEmailText,
  getEmailVerificationEmailHTML,
  getEmailVerificationEmailText,
  getSubmissionApprovedEmailHTML,
  getSubmissionApprovedEmailText,
  getSubmissionRejectedEmailHTML,
  getSubmissionRejectedEmailText,
  getPaymentLinkEmailHTML,
  getPaymentLinkEmailText,
  type PaymentLinkEmailData,
  type LeadAssignmentEmailData,
  type AssessmentSubmittedEmailData,
  type AssessmentRejectedEmailData,
  type OrganicSubmissionEmailData,
  type EmailVerificationEmailData,
  type SubmissionApprovedEmailData,
  type SubmissionRejectedEmailData
} from './email-templates'
import {
  // ... existing imports
  getClientCredentialsEmailHTML,
  getClientCredentialsEmailText,
  type ClientCredentialsEmailData,
} from './email-templates'

// ============================================
// CONFIGURATION
// ============================================

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'IRA Platform <noreply@irascore.com>'

/**
 * Get the base URL for email links (environment-aware)
 * - Production: Uses NEXT_PUBLIC_APP_URL
 * - Development: Uses BETTER_AUTH_URL or localhost
 */
export function getAppBaseUrl(): string {
  // In production, use the public app URL
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_APP_URL || 'https://irascore.com'
  }

  // In development, use BETTER_AUTH_URL (localhost)
  return process.env.BETTER_AUTH_URL || 'http://localhost:3000'
}

if (!RESEND_API_KEY) {
  console.warn('[Email] RESEND_API_KEY not configured. Email notifications will be disabled.')
}

// Initialize Resend client (only if API key is configured)
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null

// ============================================
// TYPE DEFINITIONS
// ============================================

interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Throttle email sending to respect Resend's 2 emails/second limit
 * @param emails Array of email send promises
 * @param batchSize Number of emails per batch (default: 2)
 * @param delayMs Delay between batches in ms (default: 1000)
 */
export async function sendEmailsBatched<T>(
  emails: (() => Promise<T>)[],
  batchSize = 2,
  delayMs = 1000
): Promise<PromiseSettledResult<T>[]> {
  const results: PromiseSettledResult<T>[] = []

  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize)
    const batchResults = await Promise.allSettled(
      batch.map(fn => fn())
    )
    results.push(...batchResults)

    // Delay before next batch (skip on last batch)
    if (i + batchSize < emails.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  return results
}

/**
 * Send a single email using Resend API
 * Internal helper function
 */
async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<EmailResult> {
  // If Resend is not configured, log warning and return early
  if (!resend) {
    console.warn('[Email] Skipping email send - Resend not configured', { to, subject })
    return {
      success: false,
      error: 'Resend API key not configured'
    }
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text
    })

    if (result.error) {
      console.error('[Email] Failed to send email:', {
        to,
        subject,
        error: result.error
      })
      return {
        success: false,
        error: result.error.message
      }
    }

    console.log('[Email] Sent successfully:', {
      to,
      subject,
      messageId: result.data?.id
    })

    return {
      success: true,
      messageId: result.data?.id
    }
  } catch (error) {
    console.error('[Email] Unexpected error sending email:', {
      to,
      subject,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// ============================================
// PUBLIC EMAIL FUNCTIONS
// ============================================

/**
 * Send lead assignment notification to assessor
 * Called when a reviewer assigns a lead to an assessor
 */
export async function sendLeadAssignmentEmail(
  data: LeadAssignmentEmailData
): Promise<EmailResult> {
  const subject = `New Lead Assigned: ${data.companyName} (${data.leadId})`
  const html = getLeadAssignmentEmailHTML(data)
  const text = getLeadAssignmentEmailText(data)

  if (!data.assessorEmail) {
    console.error('[Email] No assessor email provided', { data })
    return {
      success: false,
      error: 'Assessor email not provided'
    }
  }

  return sendEmail(data.assessorEmail, subject, html, text)
}

/**
 * Send assessment submission notification to reviewer(s)
 * Called when an assessor submits an assessment for review
 */
export async function sendAssessmentSubmittedEmail(
  data: AssessmentSubmittedEmailData
): Promise<EmailResult> {
  const subject = `Assessment Ready for Review: ${data.companyName} (${data.leadId})`
  const html = getAssessmentSubmittedEmailHTML(data)
  const text = getAssessmentSubmittedEmailText(data)

  if (!data.reviewerEmail) {
    console.error('[Email] No reviewer email provided', { data })
    return {
      success: false,
      error: 'Reviewer email not provided'
    }
  }

  return sendEmail(data.reviewerEmail, subject, html, text)
}

/**
 * Send assessment rejection notification to assessor
 * Called when a reviewer rejects an assessment and requests revisions
 */
export async function sendAssessmentRejectedEmail(
  data: AssessmentRejectedEmailData
): Promise<EmailResult> {
  const subject = `Assessment Revision Required: ${data.companyName} (${data.leadId})`
  const html = getAssessmentRejectedEmailHTML(data)
  const text = getAssessmentRejectedEmailText(data)

  if (!data.assessorEmail) {
    console.error('[Email] No assessor email provided', { data })
    return {
      success: false,
      error: 'Assessor email not provided'
    }
  }

  return sendEmail(data.assessorEmail, subject, html, text)
}

/**
 * Send organic submission notification to reviewer
 * Called when someone submits their details on the website
 */
export async function sendOrganicSubmissionEmail(
  data: OrganicSubmissionEmailData
): Promise<EmailResult> {
  const subject = `New Organic Lead Submission: ${data.companyName}`
  const html = getOrganicSubmissionEmailHTML(data)
  const text = getOrganicSubmissionEmailText(data)

  if (!data.reviewerEmail) {
    console.error('[Email] No reviewer email provided', { data })
    return {
      success: false,
      error: 'Reviewer email not provided'
    }
  }

  return sendEmail(data.reviewerEmail, subject, html, text)
}

/**
 * Send email verification to lead contact
 * Called when a lead is created (organic or manual) or when verification is resent
 */
export async function sendEmailVerificationEmail(
  data: EmailVerificationEmailData
): Promise<EmailResult> {
  const subject = `Verify Your Email Address - ${data.companyName}`
  const html = getEmailVerificationEmailHTML(data)
  const text = getEmailVerificationEmailText(data)

  if (!data.contactEmail) {
    console.error('[Email] No contact email provided', { data })
    return {
      success: false,
      error: 'Contact email not provided'
    }
  }

  return sendEmail(data.contactEmail, subject, html, text)
}

/**
 * Send submission approved notification to submitter
 * Called when a reviewer converts a submission to a lead
 */
export async function sendSubmissionApprovedEmail(
  data: SubmissionApprovedEmailData
): Promise<EmailResult> {
  const subject = `Your Submission Has Been Approved - ${data.companyName}`
  const html = getSubmissionApprovedEmailHTML(data)
  const text = getSubmissionApprovedEmailText(data)

  if (!data.contactEmail) {
    console.error('[Email] No contact email provided', { data })
    return {
      success: false,
      error: 'Contact email not provided'
    }
  }

  return sendEmail(data.contactEmail, subject, html, text)
}

/**
 * Send submission rejected notification to submitter
 * Called when a reviewer rejects a submission
 */
export async function sendSubmissionRejectedEmail(
  data: SubmissionRejectedEmailData
): Promise<EmailResult> {
  const subject = `Update on Your Submission - ${data.companyName}`
  const html = getSubmissionRejectedEmailHTML(data)
  const text = getSubmissionRejectedEmailText(data)

  if (!data.contactEmail) {
    console.error('[Email] No contact email provided', { data })
    return {
      success: false,
      error: 'Contact email not provided'
    }
  }

  return sendEmail(data.contactEmail, subject, html, text)
}

/**
 * Send emails to multiple recipients with rate limiting
 * Useful for sending to all reviewers
 */
export async function sendBulkEmails(
  emails: Array<{
    to: string
    subject: string
    html: string
    text: string
  }>
): Promise<EmailResult[]> {
  const emailFunctions = emails.map(({ to, subject, html, text }) =>
    () => sendEmail(to, subject, html, text)
  )

  const results = await sendEmailsBatched(emailFunctions)

  return results.map(result => {
    if (result.status === 'fulfilled') {
      return result.value
    } else {
      return {
        success: false,
        error: result.reason instanceof Error ? result.reason.message : 'Unknown error'
      }
    }
  })
}


/** Send payment link to customer
 * Called when a payment link is generated via Razorpay
 */
export async function sendPaymentLinkEmail(
  data: PaymentLinkEmailData
): Promise<EmailResult> {
  const subject = data.amount 
    ? `Your IRA Score Improvement Plan – IRA Platform`
    : 'Payment Request - IRA Platform'
    
  const html = getPaymentLinkEmailHTML(data)
  const text = getPaymentLinkEmailText(data)

  if (!data.recipientEmail) {
    console.error('[Email] No recipient email provided', { data })
    return {
      success: false,
      error: 'Recipient email not provided'
    }
  }

  return sendEmail(data.recipientEmail, subject, html, text)
}

/**
 * Send lient credentials when client made the payment.
 */

export async function sendClientCredentialsEmail(
  data: ClientCredentialsEmailData
): Promise<EmailResult> {
  const subject = `Your IPO Readiness Portal Access - ${data.companyName}`
  const html = getClientCredentialsEmailHTML(data)
  const text = getClientCredentialsEmailText(data)

  if (!data.recipientEmail) {
    return { success: false, error: 'Recipient email not provided' }
  }

  return sendEmail(data.recipientEmail, subject, html, text)
}