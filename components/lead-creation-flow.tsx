'use client'

import { useState, useTransition, useCallback } from 'react'
import { Building2, FileText, Loader2, Clock } from 'lucide-react'
import { CompanySearchInput } from './company-search-input'
import { CompanySearchResults } from './company-search-results'
import { CompanyDetailsPreview } from './company-details-preview'
import { LeadForm } from './lead-form'
import { getCompanyDetails, type SearchResult, type LeadFormData } from '@/actions/probe42'
import { toast } from 'sonner'

interface Signatory {
  name: string
  designation: string
  din?: string | null
  pan?: string | null
  date_of_appointment?: string | null
  date_of_cessation?: string | null
  nationality?: string | null
  [key: string]: unknown
}

type Mode = 'search' | 'manual' | 'preview'

export function LeadCreationFlow() {
  const [mode, setMode] = useState<Mode>('search')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [isResultsOpen, setIsResultsOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isFetchingDetails, startFetchTransition] = useTransition()
  const [prefilledData, setPrefilledData] = useState<LeadFormData | undefined>()
  const [rawCompanyData, setRawCompanyData] = useState<Record<string, unknown> | undefined>(undefined)
  const [signatories, setSignatories] = useState<Signatory[]>([])
  const [dataLastUpdated, setDataLastUpdated] = useState<string | null>(null)

  const handleSearchResults = useCallback((results: SearchResult[], hasMore: boolean) => {
    setSearchResults(results)
    setHasMore(hasMore)
    setIsResultsOpen(results.length > 0)
  }, [])

  const handleDirectIdentifier = async (identifier: string, type: 'CIN' | 'PAN' | 'LLPIN') => {
    // Direct identifier detected, fetch company details immediately
    toast.info(`Fetching details for ${type}: ${identifier}`)
    startFetchTransition(async () => {
      const result = await getCompanyDetails(identifier, type)

      if (result.success && result.data) {
        setPrefilledData(result.data)
        setRawCompanyData(result.rawData)
        setSignatories((result.signatories || []) as Signatory[])
        setDataLastUpdated((result as { dataLastUpdated?: string | null }).dataLastUpdated ?? null)
        setMode('preview')
        toast.success('Company details loaded successfully')
      } else {
        toast.error(result.error || 'Failed to fetch company details')
      }
    })
  }

  const handleSelectCompany = async (searchResult: SearchResult) => {
    setIsResultsOpen(false)

    toast.info(`Loading ${searchResult.legalName}...`)

    startFetchTransition(async () => {
      const type = searchResult.type === 'company' ? 'CIN' : 'LLPIN'
      const result = await getCompanyDetails(searchResult.identifier, type)

      if (result.success && result.data) {
        setPrefilledData(result.data)
        setRawCompanyData(result.rawData)
        setSignatories((result.signatories || []) as Signatory[])
        setDataLastUpdated((result as { dataLastUpdated?: string | null }).dataLastUpdated ?? null)
        setMode('preview')
        toast.success('Company details loaded successfully')
      } else {
        toast.error(result.error || 'Failed to fetch company details')
      }
    })
  }

  const handleBackToSearch = () => {
    setMode('search')
    setPrefilledData(undefined)
    setRawCompanyData(undefined)
    setSignatories([])
    setDataLastUpdated(null)
  }

  const handleProceedToForm = () => {
    setMode('manual')
  }

  return (
    <div>
      {mode === 'search' && (
        <>
          {/* Search Mode */}
          <div className="space-y-6">
            {/* Search Input Container */}
            <div className="glass rounded-xl p-4 md:p-6">
              {/* Info Section */}
              <div className="flex items-start gap-4 mb-4">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="size-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm md:text-base mb-1">
                    Search for Company
                  </h3>
                  <p className="text-xs md:text-sm text-foreground/60">
                    Search by company name or directly enter CIN/PAN/LLPIN to auto-fill company details
                  </p>
                </div>
              </div>

              {/* Search Input */}
              <CompanySearchInput
                onSearchResults={handleSearchResults}
                onDirectIdentifier={handleDirectIdentifier}
                onSearchStateChange={setIsSearching}
                onQueryChange={setSearchQuery}
                disabled={isFetchingDetails}
              />

              {/* Inline Search Results */}
              <CompanySearchResults
                query={searchQuery}
                results={searchResults}
                isOpen={isResultsOpen}
                onClose={() => setIsResultsOpen(false)}
                onSelectCompany={handleSelectCompany}
                hasMore={hasMore}
                isLoading={isSearching}
              />

              {isFetchingDetails && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-foreground/60">
                  <Loader2 className="size-4 animate-spin" />
                  <span>Loading company details...</span>
                </div>
              )}
            </div>

            {/* Manual Entry Option */}
            <div className="text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-foreground/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-4 text-foreground/60">Or</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMode('manual')}
                disabled={isFetchingDetails}
                className="mt-4 flex items-center justify-center gap-2 w-full md:w-auto md:mx-auto h-12 md:h-10 px-6 rounded-lg border border-foreground/10 text-sm font-medium hover:bg-foreground/5 active:bg-foreground/10 transition-colors disabled:opacity-50"
              >
                <FileText className="size-4" />
                Enter details manually
              </button>
            </div>
          </div>
        </>
      )}

      {mode === 'preview' && prefilledData && (
        <>
          {/* Company Details Preview */}
          <div className="space-y-6">
            {/* Back to Search Button */}
            <button
              type="button"
              onClick={handleBackToSearch}
              className="flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors"
            >
              <svg
                className="size-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to search
            </button>

            {/* Info Banner */}
            <div className="glass rounded-xl p-4 bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-3">
                <Building2 className="size-5 text-primary shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Company Details from Probe42</p>
                  <p className="text-xs text-foreground/60 mt-1">
                    Review the company information below. You can edit fields in the next step.
                  </p>
                  {dataLastUpdated ? (
                    <p className="text-xs text-foreground/50 mt-1 flex items-center gap-1">
                      <Clock className="size-3 shrink-0" />
                      Probe42 data as of{' '}
                      {new Date(dataLastUpdated).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Company Details */}
            <CompanyDetailsPreview
              data={prefilledData}
              rawData={rawCompanyData}
              signatories={signatories}
            />

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleBackToSearch}
                className="flex-1 h-12 md:h-10 rounded-lg border border-foreground/10 text-sm font-medium hover:bg-foreground/5 active:bg-foreground/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProceedToForm}
                className="flex-1 h-12 md:h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 active:scale-[0.98] transition-all"
              >
                Proceed to Form
              </button>
            </div>
          </div>
        </>
      )}

      {mode === 'manual' && (
        <>
          {/* Manual/Prefilled Form */}
          <div className="space-y-6">
            {/* Back to Search Button */}
            <button
              type="button"
              onClick={handleBackToSearch}
              className="flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors"
            >
              <svg
                className="size-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to search
            </button>

            {prefilledData && (
              <div className="glass rounded-xl p-4 bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-3">
                  <Building2 className="size-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Auto-filled from Probe42</p>
                    <p className="text-xs text-foreground/60 mt-1">
                      Company details have been pre-filled. You can edit any field before creating the lead.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Lead Form */}
            <div className="glass rounded-2xl p-4 md:p-8">
              <LeadForm
                initialData={prefilledData}
                rawCompanyData={rawCompanyData}
                onCancel={prefilledData ? handleBackToSearch : undefined}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
