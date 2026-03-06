"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { fetchProbe42Data } from "@/actions/lead"
import {
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building2,
  FileText,
  Globe,
  Calendar,
  Users,
  Receipt,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Props {
  leadId: string           // internal DB uuid
  leadPublicId: string     // LD-2026-001 format (for links)
  cin: string
  probe42Fetched: boolean
  probe42FetchedAt: string | null
  probe42Data: any
  probe42LegalName: string | null
  probe42Status: string | null
  probe42Classification: string | null
  probe42PaidUpCapital: number | null
  probe42Pan: string | null
  probe42Website: string | null
  probe42IncorpDate: string | null
  probe42DirectorCount: number | null
  probe42GstCount: number | null
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-3 border-b border-foreground/5 last:border-0">
      <span className="text-xs text-foreground/50 uppercase tracking-wide w-44 shrink-0">{label}</span>
      <span className="text-sm text-foreground font-medium">{value}</span>
    </div>
  )
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string | null }) {
  return (
    <div className="glass rounded-xl p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="text-xs text-foreground/50 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold mt-0.5">{value ?? "—"}</p>
      </div>
    </div>
  )
}

export function CompanyDetailsFetcher({
  leadId,
  leadPublicId,
  cin,
  probe42Fetched,
  probe42FetchedAt,
  probe42Data,
  probe42LegalName,
  probe42Status,
  probe42Classification,
  probe42PaidUpCapital,
  probe42Pan,
  probe42Website,
  probe42IncorpDate,
  probe42DirectorCount,
  probe42GstCount,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [fetched, setFetched] = useState(probe42Fetched)

  const handleFetch = () => {
    startTransition(async () => {
      const result = await fetchProbe42Data(leadId)
      if (result.success) {
        toast.success("Company data fetched successfully")
        setFetched(true)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to fetch company data")
      }
    })
  }

  const formatCapital = (val: number | null) => {
    if (!val) return null
    const crore = val / 10000000
    return `₹${crore.toLocaleString("en-IN", { maximumFractionDigits: 2 })} Cr`
  }

  const formatDate = (iso: string | null) => {
    if (!iso) return null
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  // GST details from raw data
  const gstDetails: Array<{ gstin: string; state: string; status: string }> =
    probe42Data?.gst_details || []

  return (
    <div className="space-y-4">

      {/* Status banner */}
      {fetched ? (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20">
          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              Probe42 data fetched
            </p>
            {probe42FetchedAt && (
              <p className="text-xs text-foreground/50 mt-0.5">
                Last updated {new Date(probe42FetchedAt).toLocaleString("en-IN")}
              </p>
            )}
          </div>
          <button
            onClick={handleFetch}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium border border-foreground/20 hover:bg-foreground/5 transition-all disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            Re-fetch
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
              No Probe42 data yet
            </p>
            <p className="text-xs text-foreground/50 mt-0.5">
              Fetch company data from Probe42 to pre-fill the assessment
            </p>
          </div>
          <button
            onClick={handleFetch}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-4 h-9 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Fetching...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Fetch Data
              </>
            )}
          </button>
        </div>
      )}

      {/* Loading overlay */}
      {isPending && (
        <div className="glass rounded-xl p-8 flex flex-col items-center gap-3 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-foreground/70">Fetching company data from Probe42...</p>
          <p className="text-xs text-foreground/40">This may take a few seconds</p>
        </div>
      )}

      {/* Data display */}
      {fetched && !isPending && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              icon={Building2}
              label="Directors"
              value={probe42DirectorCount?.toString() ?? null}
            />
            <StatCard
              icon={Receipt}
              label="GST Registrations"
              value={probe42GstCount?.toString() ?? null}
            />
            <StatCard
              icon={FileText}
              label="Paid-up Capital"
              value={formatCapital(probe42PaidUpCapital)}
            />
            <StatCard
              icon={Calendar}
              label="Incorporated"
              value={formatDate(probe42IncorpDate)}
            />
          </div>

          {/* Company details */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Company Information
            </h3>
            <div>
              <InfoRow label="Legal Name" value={probe42LegalName} />
              <InfoRow label="CIN" value={cin} />
              <InfoRow label="PAN" value={probe42Pan} />
              <InfoRow label="Status" value={probe42Status} />
              <InfoRow label="Classification" value={probe42Classification} />
              <InfoRow label="Incorporation Date" value={formatDate(probe42IncorpDate)} />
              <InfoRow
                label="Website"
                value={probe42Website}
              />
              <InfoRow
                label="Registered Address"
                value={probe42Data?.company?.registered_address?.full_address}
              />
            </div>
          </div>

          {/* GST Details */}
          {gstDetails.length > 0 && (
            <div className="glass rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-primary" />
                GST Registrations ({gstDetails.length})
              </h3>
              <div className="grid gap-2">
                {gstDetails.map((gst, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-background/50"
                  >
                    <span className="font-mono text-sm">{gst.gstin}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-foreground/50">{gst.state}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          gst.status?.toLowerCase() === "active"
                            ? "bg-green-500/10 text-green-600"
                            : "bg-foreground/10 text-foreground/50"
                        }`}
                      >
                        {gst.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Proceed to assessment */}
          <div className="flex justify-end pt-2">
            <Link
              href={`/dashboard/leads/${leadPublicId}/assessment`}
              className="inline-flex items-center gap-2 px-6 h-12 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 active:scale-95 transition-all"
            >
              Proceed to Assessment
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </>
      )}
    </div>
  )
}