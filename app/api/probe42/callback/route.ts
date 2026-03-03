/**
 * Probe42 Callback Webhook
 *
 * Probe42 POSTs to this endpoint when an async data update completes.
 * This endpoint must return 200 — Probe42 retries 3 times on non-200 responses.
 *
 * Expected body: { cin: string, request_id: string, status: "FULFILLED" | "FAILED" }
 * Note: "cin" field contains either a CIN (company) or LLPIN (LLP).
 */

import { NextRequest } from 'next/server'
import { revalidateTag } from 'next/cache'
import prisma from '@/lib/prisma'
import { fetchEntityByIdentifier } from '@/lib/probe42'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cin, request_id, status } = body

    if (!cin || !request_id) {
      // Always return 200 so Probe42 doesn't retry needlessly
      console.error('[Probe42 Callback] Missing cin or request_id', body)
      return Response.json({ ok: true })
    }

    // Find the lead matching this CIN
    const lead = await prisma.lead.findUnique({
      where: { cin },
      select: {
        id: true,
        cin: true,
        probe42UpdateRequestId: true,
        probe42UpdateStatus: true,
      },
    })

    if (!lead) {
      console.warn(`[Probe42 Callback] No lead found for CIN ${cin}`)
      return Response.json({ ok: true })
    }

    // Basic integrity check — request_id must match what we stored
    if (lead.probe42UpdateRequestId !== request_id) {
      console.warn(`[Probe42 Callback] request_id mismatch for CIN ${cin}`)
      return Response.json({ ok: true })
    }

    if (status === 'FULFILLED') {
      // Fetch the freshly updated comprehensive data — handles both CIN and LLPIN
      const companyData = await fetchEntityByIdentifier(cin)

      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          probe42Fetched: true,
          probe42FetchedAt: new Date(),
          probe42LegalName: companyData.legalName,
          probe42Status: companyData.status,
          probe42Classification: companyData.classification,
          probe42PaidUpCapital: companyData.paidUpCapital,
          probe42AuthCapital: companyData.authorizedCapital,
          probe42Pan: companyData.pan,
          probe42Website: companyData.website,
          probe42IncorpDate: companyData.incorporationDate ? new Date(companyData.incorporationDate) : null,
          probe42ComplianceStatus: companyData.activeCompliance,
          probe42DirectorCount: companyData.activeDirectorsCount,
          probe42GstCount: companyData.gstRegistrationsCount,
          probe42Data: JSON.parse(JSON.stringify(companyData)),
          probe42UpdateStatus: 'FULFILLED',
        },
      })

      // No userId available in webhook context — log without user reference
      await prisma.auditLog.create({
        data: {
          leadId: lead.id,
          userId: 'system',
          action: 'PROBE42_DATA_UPDATED_VIA_CALLBACK',
          details: { cin, request_id, fetchedAt: new Date().toISOString() },
        },
      }).catch(() => {
        // Audit log failure is non-critical — userId 'system' may not exist as foreign key
        // This is acceptable for webhook-initiated updates
      })

      revalidateTag(`lead-${lead.id}`, 'layout')
      console.log(`[Probe42 Callback] Data updated for lead ${lead.id} (CIN/LLPIN: ${cin})`)

    } else if (status === 'FAILED' || status === 'CANCELLED') {
      // Doc says FAILED; handle CANCELLED too for safety
      await prisma.lead.update({
        where: { id: lead.id },
        data: { probe42UpdateStatus: 'FAILED', probe42UpdateRequestId: null },
      })
      console.log(`[Probe42 Callback] Update ${status} for lead ${lead.id} (CIN/LLPIN: ${cin})`)
    }

    return Response.json({ ok: true })
  } catch (error) {
    // Log but still return 200 — we don't want Probe42 to retry on our processing errors
    console.error('[Probe42 Callback] Error processing callback:', error)
    return Response.json({ ok: true })
  }
}
