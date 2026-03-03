'use server'

import { z, ZodError } from 'zod'
import { verifyAuth } from '@/lib/dal'
import { Errors, AppError, ErrorCode } from '@/lib/errors'
import type { ActionResponse } from '@/lib/types'
import { PROBE42 } from '@/lib/constants'

// ============================================================================
// Configuration
// ============================================================================

const PROBE42_BASE_URL =
  process.env.PROBE42_BASE_URL || 'https://api.probe42.in/probe_pro_sandbox'
const PROBE42_API_KEY = process.env.PROBE42_API_KEY || ''

if (!PROBE42_API_KEY) {
  throw new Error('PROBE42_API_KEY environment variable is required')
}

// ============================================================================
// Error Handler
// ============================================================================

function handleActionError(error: unknown): ActionResponse<never> {
  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      context: error.context,
    }
  }

  if (error instanceof ZodError) {
    return {
      success: false,
      error: error.issues[0]?.message || 'Invalid input',
      code: ErrorCode.INVALID_INPUT,
    }
  }

  if (error instanceof Error) {
    console.error('Unexpected error:', error)
    return {
      success: false,
      error: error.message,
      code: ErrorCode.UNKNOWN_ERROR,
    }
  }

  return {
    success: false,
    error: 'An unexpected error occurred',
    code: ErrorCode.UNKNOWN_ERROR,
  }
}

// ============================================================================
// Zod Schemas for Probe42 API Responses
// ============================================================================

const SearchCompanySchema = z.object({
  legal_name: z.string(),
  cin: z.string(),
  status: z.string(),
})

const SearchLLPSchema = z.object({
  legal_name: z.string(),
  llpin: z.string(),
})

const SearchResponseSchema = z.object({
  metadata: z.object({
    api_version: z.string(),
  }),
  data: z.object({
    entities: z.object({
      companies: z.array(SearchCompanySchema),
      llps: z.array(SearchLLPSchema),
    }),
    has_more: z.boolean(),
    company_count: z.number(),
    llp_count: z.number(),
    total_count: z.number(),
  }),
})

const AddressSchema = z.object({
  full_address: z.string().nullable().optional(),
  address_line1: z.string().nullable().optional(),
  address_line2: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  pincode: z.union([z.string(), z.number()]).nullable().optional(),
  state: z.string().nullable().optional(),
})

const AuthorizedSignatorySchema = z.object({
  pan: z.string().nullable(),
  din: z.string().nullable(),
  name: z.string(),
  designation: z.string(),
  date_of_birth: z.string().nullable(),
  din_status: z.string().nullable(),
  gender: z.string().nullable(),
  age: z.number().nullable(),
  date_of_appointment: z.string().nullable(),
  date_of_appointment_for_current_designation: z.string().nullable(),
  date_of_cessation: z.string().nullable(),
  nationality: z.string().nullable(),
  father_name: z.string().nullable(),
  address: z.object({
    address_line1: z.string().nullable(),
    address_line2: z.string().nullable(),
    city: z.string().nullable(),
    state: z.string().nullable(),
    pincode: z.string().nullable(),
    country: z.string().nullable(),
  }),
  dsc_status: z.string().nullable(),
  dsc_expiry_date: z.string().nullable(),
})

const CompanyDetailsSchema = z.object({
  metadata: z.object({
    api_version: z.string(),
    last_updated: z.string(),
  }),
  data: z.object({
    company: z.object({
      authorized_capital: z.number(),
      cin: z.string(),
      efiling_status: z.string().nullable(),
      active_compliance: z.string().nullable(),
      cirp_status: z.string().nullable(),
      incorporation_date: z.string().nullable(),
      legal_name: z.string(),
      paid_up_capital: z.number().nullable(),
      sum_of_charges: z.number().nullable(),
      registered_address: AddressSchema,
      business_address: AddressSchema.nullable().optional(),
      classification: z.string(),
      status: z.enum(['Listed', 'Unlisted', 'Undefined']),
      next_cin: z.string().nullable(),
      last_agm_date: z.string().nullable(),
      last_filing_date: z.string().nullable(),
      email: z.string().nullable(),
      pan: z.string().nullable(),
      website: z.string().nullable(),
      lei: z.object({
        number: z.string().nullable(),
        status: z.string().nullable(),
      }),
    }),
    authorized_signatories: z.array(AuthorizedSignatorySchema),
    gst_details: z.array(z.object({
      gstin: z.string(),
      state: z.string(),
      status: z.string(),
    })).optional().nullable(),
    open_charges: z.array(
      z.object({
        id: z.number(),
        date: z.string(),
        holder_name: z.string().nullable(),
        amount: z.number(),
        type: z.enum(['Creation', 'Modification']),
      })
    ),
  }),
})

const LLPDetailsSchema = z.object({
  metadata: z.object({
    api_version: z.string(),
    last_updated: z.string(),
  }),
  data: z.object({
    llp: z.object({
      total_obligation_of_contribution: z.number(),
      llpin: z.string(),
      efiling_status: z.string().nullable(),
      incorporation_date: z.string().nullable(),
      cirp_status: z.string().nullable(),
      legal_name: z.string(),
      sum_of_charges: z.number().nullable(),
      registered_address: AddressSchema,
      classification: z.enum(['Limited Liability Partnership']),
      last_annual_returns_filed_date: z.string().nullable(),
      last_financial_reporting_date: z.string().nullable(),
      email: z.string().nullable(),
      lei: z.object({
        number: z.string().nullable(),
        status: z.string().nullable(),
      }),
    }),
    directors: z.array(AuthorizedSignatorySchema),
    open_charges: z.array(
      z.object({
        id: z.number(),
        date: z.string(),
        holder_name: z.string(),
        amount: z.number(),
        type: z.enum(['Creation', 'Modification']),
      })
    ),
  }),
})

// ============================================================================
// Types
// ============================================================================

export type SearchResult = {
  type: 'company' | 'llp'
  legalName: string
  identifier: string // CIN or LLPIN
  status?: string
}

export type CompanyDetails = z.infer<typeof CompanyDetailsSchema>['data']['company']

export type LeadFormData = {
  companyName: string
  cin: string
  sector: string
  contactPerson: string | null
  contactEmail: string | null
  contactPhone: string | null
  address: string | null
  incorporationDate: string | null
  classification: string | null
  status: string | null
  paidUpCapital: number | null
  authorizedCapital: number | null
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatAddress(address: z.infer<typeof AddressSchema>): string {
  if (address.full_address) return address.full_address

  const parts = [
    address.address_line1,
    address.address_line2,
    address.city,
    address.state,
    address.pincode,
  ].filter(Boolean)

  return parts.join(', ') || ''
}

function mapSectorFromClassification(classification: string): string {
  const lowerClass = classification.toLowerCase()

  // Use sector mappings from constants
  for (const [sector, keywords] of Object.entries(PROBE42.SECTOR_MAPPINGS)) {
    if (keywords.some((keyword) => lowerClass.includes(keyword))) {
      return sector
    }
  }

  // Log unmapped classifications for monitoring
  console.warn('Unmapped classification:', classification)

  return 'OTHER'
}

function isCINFormat(query: string): boolean {
  return PROBE42.PATTERNS.CIN.test(query.toUpperCase())
}

function isLLPINFormat(query: string): boolean {
  return PROBE42.PATTERNS.LLPIN.test(query.toUpperCase())
}

function isPANFormat(query: string): boolean {
  return PROBE42.PATTERNS.PAN.test(query.toUpperCase())
}

// ============================================================================
// HTTP Utilities
// ============================================================================

/**
 * Fetch with timeout support
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = PROBE42.API_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    return response
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw Errors.EXTERNAL_API_ERROR('Request timeout - Probe42 API did not respond in time')
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

// ============================================================================
// Input Validation Schemas
// ============================================================================

const SearchQuerySchema = z.object({
  query: z
    .string()
    .min(PROBE42.MIN_SEARCH_LENGTH, `Search query must be at least ${PROBE42.MIN_SEARCH_LENGTH} characters`)
    .trim(),
})

const GetCompanyDetailsSchema = z.object({
  identifier: z.string().min(1, 'Identifier is required').trim(),
  type: z.enum(['CIN', 'PAN', 'LLPIN']).default('CIN'),
})

// ============================================================================
// Server Actions
// ============================================================================

/**
 * Search for companies/LLPs by name or detect direct identifier (CIN/PAN/LLPIN)
 */
export async function searchCompanies(query: string): Promise<
  | { success: false; error: string }
  | {
      success: true
      isDirectIdentifier: true
      identifier: string
      identifierType: 'CIN' | 'PAN' | 'LLPIN'
      results: SearchResult[]
    }
  | {
      success: true
      isDirectIdentifier: false
      results: SearchResult[]
      hasMore: boolean
      totalCount: number
    }
> {
  try {
    await verifyAuth()

    // Validate input with Zod
    const validated = SearchQuerySchema.parse({ query })
    const trimmedQuery = validated.query

    // Check if query is direct identifier (CIN/LLPIN/PAN)
    if (
      isCINFormat(trimmedQuery) ||
      isLLPINFormat(trimmedQuery) ||
      isPANFormat(trimmedQuery)
    ) {
      // Don't search, indicate this should use direct details API
      return {
        success: true,
        isDirectIdentifier: true,
        identifier: trimmedQuery.toUpperCase(),
        identifierType: isCINFormat(trimmedQuery)
          ? 'CIN'
          : isLLPINFormat(trimmedQuery)
            ? 'LLPIN'
            : 'PAN',
        results: [],
      }
    }

    // Build filters object for nameStartsWith
    const filters = {
      nameStartsWith: trimmedQuery,
    }

    const searchUrl = `${PROBE42_BASE_URL}/entities?limit=${PROBE42.SEARCH_LIMIT}&filters=${encodeURIComponent(JSON.stringify(filters))}`

    const response = await fetchWithTimeout(searchUrl, {
      method: 'GET',
      headers: {
        'x-api-key': PROBE42_API_KEY,
        'Accept': 'application/json',
        'x-api-version': '1.3',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Probe42 search error:', response.status, errorText)
      throw Errors.EXTERNAL_API_ERROR(
        `Probe42 API error: ${response.status} ${response.statusText}`
      )
    }

    const rawData = await response.json()
    const data = SearchResponseSchema.parse(rawData)

    // Transform to unified format
    const results: SearchResult[] = [
      ...data.data.entities.companies.map((c) => ({
        type: 'company' as const,
        legalName: c.legal_name,
        identifier: c.cin,
        status: c.status,
      })),
      ...data.data.entities.llps.map((l) => ({
        type: 'llp' as const,
        legalName: l.legal_name,
        identifier: l.llpin,
      })),
    ]

    return {
      success: true,
      isDirectIdentifier: false,
      results,
      hasMore: data.data.has_more,
      totalCount: data.data.total_count,
    }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }
    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0]?.message || 'Invalid input' }
    }
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Get detailed company information by CIN/PAN/LLPIN
 */
export async function getCompanyDetails(
  identifier: string,
  type: 'CIN' | 'PAN' | 'LLPIN' = 'CIN'
) {
  try {
    await verifyAuth()

    // Validate input with Zod
    const validated = GetCompanyDetailsSchema.parse({ identifier, type })

    // Determine endpoint based on type
    let endpoint = ''
    const upperIdentifier = validated.identifier.toUpperCase()

    switch (validated.type) {
      case 'CIN':
        endpoint = `${PROBE42_BASE_URL}/companies/${upperIdentifier}/comprehensive-details`
        break
      case 'PAN':
        endpoint = `${PROBE42_BASE_URL}/companies/${upperIdentifier}/comprehensive-details?identifier_type=PAN`
        break
      case 'LLPIN':
        endpoint = `${PROBE42_BASE_URL}/llps/${upperIdentifier}/comprehensive-details`
        break
    }

    const response = await fetchWithTimeout(endpoint, {
      method: 'GET',
      headers: {
        'x-api-key': PROBE42_API_KEY,
        'Accept': 'application/json',
        'x-api-version': '1.3',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Probe42 details error:', response.status, errorText)

      if (response.status === 404) {
        return {
          success: false,
          error: 'Company not found. Please check the identifier.',
        }
      }

      throw Errors.EXTERNAL_API_ERROR(
        `Probe42 API error: ${response.status} ${response.statusText}`
      )
    }

    const rawData = await response.json()

    // Parse based on entity type (Company vs LLP)
    if (type === 'LLPIN') {
      // LLP Response
      const data = LLPDetailsSchema.parse(rawData)
      const llp = data.data.llp
      const directors = data.data.directors

      // Find primary contact (first active director)
      const primaryDirector = directors.find((d) => !d.date_of_cessation) || directors[0]

      // Map to Lead form data
      const leadData: LeadFormData = {
        companyName: llp.legal_name,
        cin: llp.llpin, // Store LLPIN in cin field
        sector: mapSectorFromClassification(llp.classification),
        contactPerson: primaryDirector?.name || null,
        contactEmail: llp.email || null,
        contactPhone: null, // Not available in API
        address: formatAddress(llp.registered_address),
        incorporationDate: llp.incorporation_date,
        classification: llp.classification,
        status: null, // LLP doesn't have Listed/Unlisted status
        paidUpCapital: null, // LLP doesn't have paid-up capital
        authorizedCapital: llp.total_obligation_of_contribution,
      }

      return {
        success: true,
        data: leadData,
        rawData: llp,
        signatories: directors.slice(0, PROBE42.MAX_SIGNATORIES_DISPLAY),
        dataLastUpdated: (rawData as { metadata?: { last_updated?: string } }).metadata?.last_updated ?? null,
      }
    } else {
      // Company Response (CIN or PAN)
      const data = CompanyDetailsSchema.parse(rawData)
      const company = data.data.company
      const signatories = data.data.authorized_signatories

      // Find primary contact (first active signatory)
      const primarySignatory = signatories.find((s) => !s.date_of_cessation) || signatories[0]

      // Map to Lead form data
      const leadData: LeadFormData = {
        companyName: company.legal_name,
        cin: company.cin,
        sector: mapSectorFromClassification(company.classification),
        contactPerson: primarySignatory?.name || null,
        contactEmail: company.email || null,
        contactPhone: null, // Not available in API
        address: formatAddress(company.registered_address),
        incorporationDate: company.incorporation_date,
        classification: company.classification,
        status: company.status,
        paidUpCapital: company.paid_up_capital,
        authorizedCapital: company.authorized_capital,
      }

      // Calculate director and GST counts
      const activeDirectorCount = signatories.filter(
        (s) => !s.date_of_cessation && s.designation?.toLowerCase().includes('director')
      ).length

      const gstCount = data.data.gst_details?.length || 0

      // Enhance company object with calculated fields for lead creation
      const enhancedCompanyData = {
        ...company,
        director_count: activeDirectorCount,
        gst_count: gstCount,
      }

      return {
        success: true,
        data: leadData,
        rawData: enhancedCompanyData,
        signatories: signatories.slice(0, PROBE42.MAX_SIGNATORIES_DISPLAY),
        dataLastUpdated: (rawData as { metadata?: { last_updated?: string } }).metadata?.last_updated ?? null,
      }
    }
  } catch (error) {
    console.error('Get company details error:', error)
    return handleActionError(error)
  }
}

/**
 * Validate identifier format
 */
export async function validateIdentifier(identifier: string): Promise<{
  isValid: boolean
  type: 'CIN' | 'PAN' | 'LLPIN' | null
  error?: string
}> {
  const trimmed = identifier.trim().toUpperCase()

  if (isCINFormat(trimmed)) {
    return { isValid: true, type: 'CIN' }
  }

  if (isLLPINFormat(trimmed)) {
    return { isValid: true, type: 'LLPIN' }
  }

  if (isPANFormat(trimmed)) {
    return { isValid: true, type: 'PAN' }
  }

  return {
    isValid: false,
    type: null,
    error:
      'Invalid format. Expected CIN (21 chars, starts with U/L), LLPIN (AAA-1234), or PAN (10 chars)',
  }
}