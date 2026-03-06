import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getLead } from "@/actions/lead"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { CompanyDetailsFetcher } from "./company-details-fetcher"

type Props = {
  params: Promise<{ id: string }>
}

export default async function CompanyDetailsPage({ params }: Props) {
  const resolvedParams = await params
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  const leadResult = await getLead(resolvedParams.id)

  if (!leadResult.success || !leadResult.data) {
    return (
      <div className="p-4 md:p-6">
        <div className="glass rounded-xl p-6 text-center">
          <p className="text-sm text-foreground/70">Lead not found</p>
        </div>
      </div>
    )
  }

  const lead = leadResult.data

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/dashboard/leads/${lead.leadId}`}
          className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Lead
        </Link>

        <div className="glass rounded-xl p-4 md:p-6">
          <h2 className="text-base md:text-lg font-semibold">{lead.companyName}</h2>
          <p className="text-sm text-foreground/70 mt-1">{lead.leadId} · {lead.cin}</p>
        </div>
      </div>

      {/* Client component handles fetch trigger + display */}
      <CompanyDetailsFetcher
        leadId={lead.id}
        leadPublicId={lead.leadId}
        cin={lead.cin}
        probe42Fetched={lead.probe42Fetched}
        probe42FetchedAt={lead.probe42FetchedAt?.toISOString() ?? null}
        probe42Data={lead.probe42Data as any}
        probe42LegalName={lead.probe42LegalName}
        probe42Status={lead.probe42Status}
        probe42Classification={lead.probe42Classification}
        probe42PaidUpCapital={lead.probe42PaidUpCapital ? Number(lead.probe42PaidUpCapital) : null}
        probe42Pan={lead.probe42Pan}
        probe42Website={lead.probe42Website}
        probe42IncorpDate={lead.probe42IncorpDate?.toISOString() ?? null}
        probe42DirectorCount={lead.probe42DirectorCount}
        probe42GstCount={lead.probe42GstCount}
      />
    </div>
  )
}