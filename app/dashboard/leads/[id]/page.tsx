import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getLead, getAssessors } from "@/actions/lead"
import { getStatusDisplay } from "@/lib/types"
import { AssignAssessorForm } from "@/components/assign-assessor-form"
import { getDocuments } from "@/actions/documents"
import { UploadDocumentButton } from "@/components/documents/upload-document-button"
import { DocumentList } from "@/components/documents/document-list"
import { Probe42DataCard } from "@/components/probe42-data-card"
import { EditLeadButton } from "@/components/edit-lead-button"

type Props = {
  params: Promise<{ id: string }>
}

export default async function LeadDetailPage(props: Props) {
  const params = await props.params

  // 1. Verify authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  // 2. Fetch lead
  const leadResult = await getLead(params.id)

  if (!leadResult.success) {
    return (
      <div className="p-6">
        <div className="glass rounded-2xl p-6 text-center">
          <p className="text-danger">{leadResult.error}</p>
          <Link
            href="/dashboard/leads"
            className="mt-4 inline-block text-sm text-primary hover:text-primary/80"
          >
            ← Back to Leads
          </Link>
        </div>
      </div>
    )
  }

  const lead = leadResult.data
  const isReviewer = session.user.role === "REVIEWER"
  const status = getStatusDisplay(lead.status)

  // 3. Fetch assessors if reviewer
  let assessors: Array<{ id: string; name: string; email: string }> = []
  if (isReviewer) {
    const assessorsResult = await getAssessors()
    if (assessorsResult.success) {
      assessors = assessorsResult.data
    }
  }

  // 4. Fetch documents
  const documentsResult = await getDocuments(lead.id)
  const documents = documentsResult.success ? documentsResult.data : []

  // Check if MOA and AOA are already downloaded
  const hasMoa = documents.some(doc => doc.fileName.includes(`MoA_${lead.cin}`))
  const hasAoa = documents.some(doc => doc.fileName.includes(`AoA_${lead.cin}`))

  return (
    <div className="p-4 md:p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-2xl font-bold">{lead.companyName}</div>
        <span
          className={`inline-flex rounded-full px-4 py-1.5 text-sm font-medium ${status.color}`}
        >
          {status.label}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Contact & Key Information */}
          <div className="glass space-y-4 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">Contact & Key Information</h2>
                {/* Subtle Probe42 data enrichment indicator */}
                {!lead.probe42Fetched && (
                  <span className="text-xs text-foreground/40" title="Company data not enriched from Probe42">
                    ⓘ Manual entry
                  </span>
                )}
              </div>
              {isReviewer && <EditLeadButton lead={lead} />}
            </div>

            <div className="grid gap-3 text-sm">
              {/* Contact Person */}
              <div className="flex items-center justify-between py-2 border-t border-foreground/10">
                <span className="text-foreground/60">Contact Person</span>
                <span className="font-medium">{lead.contactPerson || 'N/A'}</span>
              </div>

              {/* Email */}
              <div className="flex items-center justify-between py-2 border-t border-foreground/10">
                <span className="text-foreground/60">Email</span>
                <span className="font-medium text-xs">{lead.email || 'N/A'}</span>
              </div>

              {/* Phone */}
              <div className="flex items-center justify-between py-2 border-t border-foreground/10">
                <span className="text-foreground/60">Phone</span>
                <span className="font-medium font-mono">{lead.phone || 'N/A'}</span>
              </div>

              {/* CIN */}
              <div className="flex items-center justify-between py-2 border-t border-foreground/10">
                <span className="text-foreground/60">CIN</span>
                <span className="font-medium font-mono text-xs">{lead.cin}</span>
              </div>

              {/* Status */}
              {lead.probe42Status && (
                <div className="flex items-center justify-between py-2 border-t border-foreground/10">
                  <span className="text-foreground/60">Status</span>
                  <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                    {lead.probe42Status}
                  </span>
                </div>
              )}

              {/* Classification */}
              {lead.probe42Classification && (
                <div className="flex items-center justify-between py-2 border-t border-foreground/10">
                  <span className="text-foreground/60">Classification</span>
                  <span className="font-medium text-right">{lead.probe42Classification}</span>
                </div>
              )}

              {/* Paid-up Capital */}
              {lead.probe42PaidUpCapital && (
                <div className="flex items-center justify-between py-2 border-t border-foreground/10">
                  <span className="text-foreground/60">Paid-up Capital</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0,
                    }).format(Number(lead.probe42PaidUpCapital))}
                  </span>
                </div>
              )}

              {/* Authorized Capital */}
              {lead.probe42AuthCapital && (
                <div className="flex items-center justify-between py-2 border-t border-foreground/10">
                  <span className="text-foreground/60">Authorized Capital</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0,
                    }).format(Number(lead.probe42AuthCapital))}
                  </span>
                </div>
              )}

              {/* Registered Address */}
              {lead.address && (
                <div className="py-2 border-t border-foreground/10">
                  <span className="text-foreground/60 text-sm block mb-1">Registered Address</span>
                  <span className="text-sm text-foreground/70 leading-relaxed">{lead.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="glass space-y-4 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Documents</h2>
              <UploadDocumentButton leadId={lead.id} />
            </div>

            <DocumentList
              documents={documents}
              userRole={session.user.role as 'ASSESSOR' | 'REVIEWER'}
              userId={session.user.id}
            />
          </div>

          {/* Assessment Status */}
          {lead.assessment && (
            <div className="glass space-y-4 rounded-2xl p-6">
              <h2 className="text-lg font-semibold">Assessment</h2>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-foreground/70">Status</p>
                  <p className="mt-1 text-sm font-medium capitalize">
                    {lead.assessment.status.toLowerCase()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-foreground/70">Score</p>
                  <p className="mt-1 text-sm font-medium">
                    {lead.assessment.percentage
                      ? `${lead.assessment.percentage.toFixed(1)}%`
                      : "Not scored"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-foreground/70">Rating</p>
                  <p className="mt-1 text-sm font-medium">
                    {lead.assessment.rating
                      ? lead.assessment.rating.replace(/_/g, " ").toLowerCase()
                      : "Not rated"}
                  </p>
                </div>
              </div>

              {/* Actions for Assessor */}
              {session.user.role === "ASSESSOR" &&
                lead.assignedAssessor?.id === session.user.id && (
                  <div className="flex flex-col gap-2">
                    {lead.assessment.status === "DRAFT" && (
                      <Link
                        href={`/dashboard/leads/${lead.leadId}/assessment`}
                        className="inline-flex items-center justify-center rounded-lg bg-primary px-4 h-10 text-sm font-medium text-primary-foreground hover:bg-primary/90 active:scale-95 transition-transform"
                      >
                        {lead.assessment.currentStep === 1 && !lead.assessment.companyVerified
                          ? "Start Assessment"
                          : lead.assessment.currentStep === 2 && !lead.assessment.financialVerified
                            ? "Continue - Step 2"
                            : lead.assessment.currentStep === 3
                              ? "Continue - Questionnaire"
                              : "Continue Assessment"}
                      </Link>
                    )}
                    {lead.assessment.status === "SUBMITTED" && (
                      <div className="text-sm text-foreground/70">
                        Waiting for reviewer approval
                      </div>
                    )}
                    {lead.assessment.status === "REJECTED" && (
                      <Link
                        href={`/dashboard/leads/${lead.leadId}/assessment`}
                        className="inline-flex items-center justify-center rounded-lg bg-yellow-500 px-4 h-10 text-sm font-medium text-black hover:bg-yellow-500/90 active:scale-95 transition-transform"
                      >
                        Revise Assessment
                      </Link>
                    )}
                  </div>
                )}

              {/* Actions for Reviewer */}
              {isReviewer && (
                <div className="flex flex-col gap-2">
                  {lead.assessment.status === "SUBMITTED" && (
                    <Link
                      href={`/dashboard/leads/${lead.leadId}/review`}
                      className="inline-flex items-center justify-center rounded-lg bg-primary px-4 h-10 text-sm font-medium text-primary-foreground hover:bg-primary/90 active:scale-95 transition-transform"
                    >
                      Review Assessment
                    </Link>
                  )}
                  {lead.assessment.status === "APPROVED" && (
                    <div className="text-sm text-green-500 font-medium">
                      ✓ Assessment Approved
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Probe42 Company Details - Collapsible */}
          <Probe42DataCard lead={lead} hasMoa={hasMoa} hasAoa={hasAoa} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assignment */}
          <div className="glass space-y-4 rounded-2xl p-6">
            <h2 className="text-lg font-semibold">Assignment</h2>

            {lead.assignedAssessor ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-foreground/70">Assigned To</p>
                  <p className="mt-1 font-medium">{lead.assignedAssessor.name}</p>
                  <p className="text-sm text-foreground/60">
                    {lead.assignedAssessor.email}
                  </p>
                </div>

                {isReviewer && (
                  <details className="pt-2">
                    <summary className="cursor-pointer text-sm text-primary hover:text-primary/80">
                      Change assessor
                    </summary>
                    <div className="mt-3">
                      <AssignAssessorForm
                        leadId={lead.leadId}
                        assessors={assessors}
                        currentAssessorId={lead.assignedAssessor.id}
                        leadUpdatedAt={lead.updatedAt}
                      />
                    </div>
                  </details>
                )}
              </div>
            ) : (
              <div>
                {isReviewer ? (
                  <>
                    <p className="text-sm text-foreground/60">
                      No assessor assigned yet
                    </p>
                    <div className="mt-4">
                      <AssignAssessorForm
                        leadId={lead.leadId}
                        assessors={assessors}
                        leadUpdatedAt={lead.updatedAt}
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-foreground/60">
                    Waiting for assignment
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Created By */}
          <div className="glass space-y-4 rounded-2xl p-6">
            <h2 className="text-lg font-semibold">Created By</h2>
            <div>
              <p className="font-medium">{lead.createdBy.name}</p>
              <p className="text-sm text-foreground/60">{lead.createdBy.email}</p>
              <p className="mt-2 text-xs text-foreground/60">
                {new Date(lead.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
