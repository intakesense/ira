/**
 * Probe42 API Client
 *
 * Handles communication with Probe42 Company Data API
 * Documentation: https://api.probe42.in/probe_pro_sandbox/
 */

import { AppError, ErrorCode } from "./errors";

const PROBE42_API_BASE =
  process.env.PROBE42_BASE_URL || "https://api.probe42.in/probe_pro_sandbox";
const PROBE42_API_KEY = process.env.PROBE42_API_KEY;
const PROBE42_API_VERSION = "1.3";

// ============================================================================
// Types - Based on actual API response
// ============================================================================

export interface Probe42CompanyData {
  metadata: {
    api_version: string;
    last_updated: string;
    identifier_changed: boolean;
  };
  data: {
    company: {
      cin: string;
      legal_name: string;
      efiling_status: string;
      incorporation_date: string;
      paid_up_capital: number;
      authorized_capital: number;
      active_compliance: string;
      pan: string;
      email: string | null;
      website: string | null;
      classification: string;
      status: string;
      last_agm_date: string | null;
      last_filing_date: string | null;
      registered_address: {
        full_address: string;
        city: string;
        state: string;
        pincode: string;
      };
    };
    description: {
      desc_thousand_char: string;
    };
    authorized_signatories: Array<{
      name: string;
      pan: string | null;
      din: string | null;
      designation: string;
      date_of_appointment: string | null;
      date_of_cessation: string | null;
      nationality: string | null;
    }>;
    financials: Array<{
      year_ending: string;
      total_revenue: number;
      net_profit: number;
      total_assets: number;
      total_liabilities: number;
      year?: string;
      nature?: string;
      stated_on?: string;
      filing_type?: string;
      filing_standard?: string;
      ratios?: {
        revenue_growth?: number;
        gross_profit_margin?: number;
        net_margin?: number;
        ebitda_margin?: number;
        return_on_equity?: number;
        return_on_capital_employed?: number;
        debt_ratio?: number;
        debt_by_equity?: number;
        interest_coverage_ratio?: number;
        current_ratio?: number;
        quick_ratio?: number;
        inventory_by_sales_days?: number;
        debtors_by_sales_days?: number;
        payables_by_sales_days?: number;
        cash_conversion_cycle?: number;
        sales_by_net_fixed_assets?: number;
      };
      bs?: {
        assets?: {
          tangible_assets?: number;
          producing_properties?: number | null;
          intangible_assets?: number;
          preproducing_properties?: number | null;
          tangible_assets_capital_work_in_progress?: number;
          intangible_assets_under_development?: number | null;
          noncurrent_investments?: number;
          deferred_tax_assets_net?: number;
          foreign_curr_monetary_item_trans_diff_asset_account?: number | null;
          long_term_loans_and_advances?: number;
          other_noncurrent_assets?: number;
          current_investments?: number;
          inventories?: number;
          trade_receivables?: number;
          cash_and_bank_balances?: number;
          short_term_loans_and_advances?: number;
          other_current_assets?: number;
          given_assets_total?: number;
        };
        liabilities?: {
          share_capital?: number;
          reserves_and_surplus?: number;
          money_received_against_share_warrants?: number | null;
          share_application_money_pending_allotment?: number | null;
          deferred_government_grants?: number | null;
          minority_interest?: number;
          long_term_borrowings?: number;
          deferred_tax_liabilities_net?: number | null;
          foreign_curr_monetary_item_trans_diff_liability_account?:
            | number
            | null;
          other_long_term_liabilities?: number;
          long_term_provisions?: number;
          short_term_borrowings?: number;
          trade_payables?: number;
          other_current_liabilities?: number;
          short_term_provisions?: number;
          given_liabilities_total?: number;
        };
        subTotals?: {
          total_equity?: number;
          total_non_current_liabilities?: number;
          total_current_liabilities?: number;
          net_fixed_assets?: number;
          total_current_assets?: number;
          capital_wip?: number;
          total_debt?: number;
          total_other_non_current_assets?: number;
        };
      };
    }>;
    nfbc_financials: Array<{
      pnl?: {
        total_revenue?: number;
        profit_after_tax?: number;
      };
    }>;
    key_indicators: Record<string, unknown>;
    gst_details: Array<{
      gstin: string;
      state: string;
      status: string;
    }>;
  };
}

// ============================================================================
// LLP Response Type (Comprehensive Details)
// ============================================================================

export interface Probe42LLPData {
  metadata: { api_version: string; last_updated: string }
  data: {
    llp: {
      llpin: string
      legal_name: string
      efiling_status: string | null
      incorporation_date: string | null
      total_obligation_of_contribution: number
      classification: string
      email: string | null
      registered_address: {
        full_address?: string | null
        city?: string | null
        state?: string | null
        pincode?: string | number | null
      }
      last_annual_returns_filed_date?: string | null
      last_financial_reporting_date?: string | null
    }
    directors: Array<{
      name: string
      din: string | null
      designation: string
      date_of_appointment: string | null
      date_of_cessation: string | null
    }>
  }
}

// Helper: LLPIN always contains a hyphen; CINs never do
function isLLPIN(identifier: string): boolean {
  return identifier.includes('-')
}

// ============================================================================
// API Client
// ============================================================================

class Probe42Client {
  private apiKey: string;
  private baseUrl: string;
  private apiVersion: string;

  constructor(apiKey?: string) {
    if (!apiKey && !PROBE42_API_KEY) {
      throw new AppError(
        ErrorCode.CONFIGURATION_ERROR,
        "Probe42 API key not configured",
        500,
        { service: "probe42" },
      );
    }

    this.apiKey = apiKey || PROBE42_API_KEY!;
    this.baseUrl = PROBE42_API_BASE;
    this.apiVersion = PROBE42_API_VERSION;
  }

  /**
   * Fetch comprehensive company details by CIN
   */
  async getCompanyDetails(cin: string): Promise<Probe42CompanyData> {
    if (!cin || cin.trim().length === 0) {
      throw new AppError(ErrorCode.INVALID_INPUT, "CIN is required", 400, {
        field: "cin",
      });
    }

    const url = `${this.baseUrl}/companies/${cin}/comprehensive-details`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "x-api-key": this.apiKey,
          Accept: "application/json",
          "x-api-version": this.apiVersion,
        },
        cache: "no-store", // Don't cache company data
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new AppError(
            ErrorCode.UNAUTHORIZED,
            "Invalid Probe42 API key",
            401,
            { status: response.status },
          );
        }

        if (response.status === 404) {
          // Distinguish Error 16 ("Company does not exist") from
          // Error 18 ("CIN not probed yet — call update() first")
          let bodyText = ''
          try { bodyText = await response.text() } catch { /* ignore */ }
          if (bodyText.toLowerCase().includes('not probed') || bodyText.toLowerCase().includes('probe request')) {
            throw new AppError(
              ErrorCode.COMPANY_NOT_PROBED,
              `Company with CIN ${cin} has not been probed yet. Trigger an update first.`,
              404,
              { cin, body: bodyText }
            )
          }
          throw new AppError(
            ErrorCode.NOT_FOUND,
            `Company with CIN ${cin} not found in Probe42`,
            404,
            { cin, status: response.status },
          );
        }

        if (response.status === 429) {
          throw new AppError(
            ErrorCode.RATE_LIMIT_EXCEEDED,
            "Probe42 API rate limit exceeded",
            429,
            { status: response.status },
          );
        }

        throw new AppError(
          ErrorCode.EXTERNAL_API_ERROR,
          `Probe42 API error: ${response.statusText}`,
          502,
          { status: response.status, cin },
        );
      }

      const data = await response.json();
      return data as Probe42CompanyData;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      // Network or parsing errors
      throw new AppError(
        ErrorCode.EXTERNAL_API_ERROR,
        "Failed to fetch company data from Probe42",
        502,
        {
          originalError: error instanceof Error ? error.message : String(error),
          cin,
        },
      );
    }
  }

  /**
   * Extract key company information for IRA platform
   */
  extractKeyInfo(data: Probe42CompanyData) {
    const {
      company,
      description,
      authorized_signatories,
      financials,
      gst_details,
      nfbc_financials,
    } = data.data;

    // Get active directors
    const activeDirectors =
      authorized_signatories
        ?.filter(
          (s) =>
            !s.date_of_cessation &&
            s.designation?.toLowerCase().includes("director"),
        )
        .map((s) => ({
          name: s.name,
          designation: s.designation,
          din: s.din,
          dateOfAppointment: s.date_of_appointment,
        })) || [];

    // Transform ALL financials with full nested structure
    let transformedFinancials: any[] = [];

    try {
      transformedFinancials =
        financials?.map((f, index) => {
          const transformed = {
            year: f.year_ending,
            totalRevenue: f.total_revenue,
            netProfit: f.net_profit,
            totalAssets: f.total_assets,
            totalLiabilities: f.total_liabilities,
            bs: f.bs
              ? {
                  subTotals: f.bs.subTotals
                    ? {
                        totalEquity: f.bs.subTotals.total_equity,
                        totalNonCurrentLiabilities:
                          f.bs.subTotals.total_non_current_liabilities,
                        totalCurrentLiabilities:
                          f.bs.subTotals.total_current_liabilities,
                        netFixedAssets: f.bs.subTotals.net_fixed_assets,
                        totalCurrentAssets: f.bs.subTotals.total_current_assets,
                        capitalWip: f.bs.subTotals.capital_wip,
                        totalDebt: f.bs.subTotals.total_debt,
                        totalOtherNonCurrentAssets:
                          f.bs.subTotals.total_other_non_current_assets,
                      }
                    : undefined,
                }
              : undefined,
            ratios: f.ratios,
          };

          return transformed;
        }) || [];
    } catch (error) {
      console.error("ERROR transforming financials:", error);
      transformedFinancials = [];
    }

    // Transform NBFC financials
    let nbfcFinancials: any[] = [];

    try {
      nbfcFinancials =
        nfbc_financials?.map((f) => {
          return {
            totalRevenue: f.pnl?.total_revenue,
            profit_after_tax: f.pnl?.profit_after_tax,
          };
        }) || [];
    } catch (error) {
      console.error("ERROR transforming NBFC financials:", error);
      nbfcFinancials = [];
    }

    const result = {
      cin: company.cin,
      legalName: company.legal_name,
      status: company.efiling_status,
      incorporationDate: company.incorporation_date,
      classification: company.classification,
      paidUpCapital: company.paid_up_capital,
      authorizedCapital: company.authorized_capital,
      activeCompliance: company.active_compliance,
      lastAgmDate: company.last_agm_date,
      lastFilingDate: company.last_filing_date,
      pan: company.pan,
      email: company.email,
      website: company.website,
      registeredAddress: company.registered_address.full_address,
      city: company.registered_address.city,
      state: company.registered_address.state,
      pincode: company.registered_address.pincode,
      businessDescription: description?.desc_thousand_char,
      activeDirectorsCount: activeDirectors.length,
      activeDirectors: activeDirectors.slice(0, 5),
      financials: transformedFinancials,
      nbfcFinancials: nbfcFinancials,
      gstRegistrationsCount: gst_details?.length || 0,
      lastUpdated: data.metadata.last_updated,
      apiVersion: data.metadata.api_version,
    };

    return result;
  }

  /**
   * Fetch comprehensive LLP details by LLPIN
   */
  async getLLPDetails(llpin: string): Promise<Probe42LLPData> {
    const url = `${this.baseUrl}/llps/${llpin}/comprehensive-details`

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey,
          'Accept': 'application/json',
          'x-api-version': this.apiVersion,
        },
        cache: 'no-store',
      })

      if (!response.ok) {
        if (response.status === 404) {
          let bodyText = ''
          try { bodyText = await response.text() } catch { /* ignore */ }
          if (bodyText.toLowerCase().includes('not probed') || bodyText.toLowerCase().includes('probe request')) {
            throw new AppError(
              ErrorCode.COMPANY_NOT_PROBED,
              `LLP with LLPIN ${llpin} has not been probed yet. Trigger an update first.`,
              404,
              { llpin, body: bodyText }
            )
          }
          throw new AppError(ErrorCode.NOT_FOUND, `LLP with LLPIN ${llpin} not found in Probe42`, 404, { llpin })
        }
        throw new AppError(ErrorCode.EXTERNAL_API_ERROR, `Probe42 LLP API error: ${response.statusText}`, 502, { llpin })
      }

      return await response.json() as Probe42LLPData
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new AppError(ErrorCode.EXTERNAL_API_ERROR, 'Failed to fetch LLP data from Probe42', 502, {
        originalError: error instanceof Error ? error.message : String(error), llpin
      })
    }
  }

  /**
   * Extract key LLP info — same output shape as extractKeyInfo for unified handling
   */
  extractLLPKeyInfo(data: Probe42LLPData) {
    const { llp, directors } = data.data

    const activeDirectors = directors
      ?.filter(d => !d.date_of_cessation)
      .map(d => ({
        name: d.name,
        designation: d.designation,
        din: d.din,
        dateOfAppointment: d.date_of_appointment,
      })) || []

    const addr = llp.registered_address
    const registeredAddress = (addr.full_address as string | undefined | null) ||
      [addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')

    return {
      cin: llp.llpin,
      legalName: llp.legal_name,
      status: llp.efiling_status || null,
      incorporationDate: llp.incorporation_date,
      classification: llp.classification,
      paidUpCapital: null as number | null,
      authorizedCapital: llp.total_obligation_of_contribution,
      activeCompliance: llp.efiling_status || null,
      lastAgmDate: llp.last_annual_returns_filed_date || null,
      lastFilingDate: llp.last_financial_reporting_date || null,
      pan: null as string | null,
      email: llp.email,
      website: null as string | null,
      registeredAddress,
      city: String(addr.city || ''),
      state: String(addr.state || ''),
      pincode: String(addr.pincode || ''),
      businessDescription: undefined as string | undefined,
      activeDirectorsCount: activeDirectors.length,
      activeDirectors: activeDirectors.slice(0, 5),
      latestFinancials: null as null,
      gstRegistrationsCount: 0,
      lastUpdated: data.metadata.last_updated,
      apiVersion: data.metadata.api_version,
    }
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let probe42Client: Probe42Client | null = null;

export function getProbe42Client(apiKey?: string): Probe42Client {
  if (!probe42Client) {
    probe42Client = new Probe42Client(apiKey);
  }
  return probe42Client;
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Fetch and extract key company information by CIN
 */
export async function fetchCompanyByCIN(cin: string) {
  const client = getProbe42Client();
  const data = await client.getCompanyDetails(cin);
  return client.extractKeyInfo(data);
}

/**
 * Fetch comprehensive data for either a company (CIN) or LLP (LLPIN).
 * Returns the same normalized shape as fetchCompanyByCIN.
 */
export async function fetchEntityByIdentifier(identifier: string) {
  const client = getProbe42Client()
  if (isLLPIN(identifier)) {
    const data = await client.getLLPDetails(identifier)
    return client.extractLLPKeyInfo(data)
  }
  const data = await client.getCompanyDetails(identifier)
  return client.extractKeyInfo(data)
}

/**
 * Check data status for a company — returns when data was last updated
 * Returns null for last_details_updated if data has never been fetched / needs update
 */
export async function checkCompanyDataStatus(cin: string): Promise<{
  last_fin_year_end: string | null
  last_details_updated: string | null
}> {
  const client = getProbe42Client()
  const entityPath = isLLPIN(cin) ? 'llps' : 'companies'
  const url = `${client['baseUrl']}/${entityPath}/${cin}/datastatus`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': client['apiKey'],
        'Accept': 'application/json',
        'x-api-version': client['apiVersion'],
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new AppError(ErrorCode.NOT_FOUND, `Company ${cin} not found`, 404, { cin })
      }
      throw new AppError(ErrorCode.EXTERNAL_API_ERROR, `Probe42 datastatus error: ${response.statusText}`, 502, { cin })
    }

    return await response.json()
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError(ErrorCode.EXTERNAL_API_ERROR, 'Failed to check company data status', 502, {
      originalError: error instanceof Error ? error.message : String(error), cin
    })
  }
}

/**
 * Trigger an async data update for a company
 * Probe42 will POST to postbackUrl when update completes (~4 working hours)
 */
export async function triggerProbe42Update(cin: string, postbackUrl: string): Promise<{
  cin: string
  request_id: string
  status: 'REQUESTED'
}> {
  const client = getProbe42Client()
  const entityPath = isLLPIN(cin) ? 'llps' : 'companies'
  const url = `${client['baseUrl']}/${entityPath}/${cin}/update`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'x-api-key': client['apiKey'],
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-api-version': client['apiVersion'],
      },
      body: JSON.stringify({ postback_url: postbackUrl }),
      cache: 'no-store',
    })

    if (!response.ok) {
      if (response.status === 422) {
        // Error 8: "This Company/LLP is inactive" — stop all future update calls
        // Error 9: "Changed CIN" — handled generically for now
        let bodyText = ''
        try { bodyText = await response.text() } catch { /* ignore */ }
        if (bodyText.toLowerCase().includes('inactive')) {
          throw new AppError(
            ErrorCode.COMPANY_INACTIVE,
            'Company is inactive. No further update calls should be made.',
            422,
            { cin, body: bodyText }
          )
        }
      }
      throw new AppError(ErrorCode.EXTERNAL_API_ERROR, `Probe42 update trigger error: ${response.statusText}`, 502, { cin })
    }

    return await response.json()
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError(ErrorCode.EXTERNAL_API_ERROR, 'Failed to trigger Probe42 update', 502, {
      originalError: error instanceof Error ? error.message : String(error), cin
    })
  }
}

/**
 * Poll the status of a previously triggered update request
 */
export async function getProbe42UpdateStatus(cin: string, requestId: string): Promise<{
  status: 'REQUESTED' | 'FULFILLED' | 'CANCELLED' | 'FAILED'
}> {
  const client = getProbe42Client()
  const entityPath = isLLPIN(cin) ? 'llps' : 'companies'
  const url = `${client['baseUrl']}/${entityPath}/${cin}/get-update-status?request_id=${encodeURIComponent(requestId)}`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': client['apiKey'],
        'Accept': 'application/json',
        'x-api-version': client['apiVersion'],
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new AppError(ErrorCode.EXTERNAL_API_ERROR, `Probe42 update status error: ${response.statusText}`, 502, { cin, requestId })
    }

    return await response.json()
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError(ErrorCode.EXTERNAL_API_ERROR, 'Failed to get Probe42 update status', 502, {
      originalError: error instanceof Error ? error.message : String(error), cin
    })
  }
}

/**
 * Download PDF report from Probe42
 * Returns base64 encoded PDF
 */
export async function downloadProbe42Report(cin: string): Promise<string> {
  const client = getProbe42Client();

  if (!cin || cin.trim().length === 0) {
    throw new AppError(ErrorCode.INVALID_INPUT, "CIN is required", 400, {
      field: "cin",
    });
  }

  // Use the probe_reports_sandbox endpoint (different from base URL)
  const reportsBaseUrl = PROBE42_API_BASE.replace(
    "probe_pro_sandbox",
    "probe_reports_sandbox",
  );
  const url = `${reportsBaseUrl}/companies/${cin}/reports?type=pdf&client_name=IRA&unit=INR&format=base64`;

  try {
    // Add 30 second timeout for PDF downloads (they can be large)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-api-key": client["apiKey"],
        Accept: "application/json",
        "x-api-version": client["apiVersion"],
      },
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        throw new AppError(
          ErrorCode.NOT_FOUND,
          `Report for CIN ${cin} not found in Probe42`,
          404,
          { cin, status: response.status },
        );
      }

      throw new AppError(
        ErrorCode.EXTERNAL_API_ERROR,
        `Probe42 Report API error: ${response.statusText}`,
        502,
        { status: response.status, cin },
      );
    }

    // The API returns raw base64 string, not JSON
    const base64String = await response.text();

    if (!base64String || base64String.trim().length === 0) {
      throw new AppError(
        ErrorCode.EXTERNAL_API_ERROR,
        "Empty response from Probe42 Report API",
        502,
        { cin },
      );
    }

    return base64String.trim();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    // Handle timeout
    if (error instanceof Error && error.name === "AbortError") {
      throw new AppError(
        ErrorCode.EXTERNAL_API_ERROR,
        "Report download timed out - please try again",
        504,
        { cin, timeout: "30s" },
      );
    }

    throw new AppError(
      ErrorCode.EXTERNAL_API_ERROR,
      "Failed to download report from Probe42",
      502,
      {
        originalError: error instanceof Error ? error.message : String(error),
        cin,
      },
    );
  }
}

/**
 * Download reference document (MOA/AOA) from Probe42
 * Returns base64 encoded PDF
 */
export async function downloadReferenceDocument(
  cin: string,
  type: "MoA" | "AoA",
): Promise<string> {
  const client = getProbe42Client();

  if (!cin || cin.trim().length === 0) {
    throw new AppError(ErrorCode.INVALID_INPUT, "CIN is required", 400, {
      field: "cin",
    });
  }

  // Use the probe_reports_sandbox endpoint for reference documents
  const reportsBaseUrl = PROBE42_API_BASE.replace(
    "probe_pro_sandbox",
    "probe_reports_sandbox",
  );
  const url = `${reportsBaseUrl}/companies/${cin}/reference-document?type=${type}&identifier_type=CIN`;

  try {
    // Add 30 second timeout for PDF downloads
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-api-key": client["apiKey"],
        Accept: "application/json",
        "x-api-version": client["apiVersion"],
      },
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        throw new AppError(
          ErrorCode.NOT_FOUND,
          `${type} document for CIN ${cin} not found`,
          404,
          { cin, type, status: response.status },
        );
      }

      throw new AppError(
        ErrorCode.EXTERNAL_API_ERROR,
        `Probe42 Reference Document API error: ${response.statusText}`,
        502,
        { status: response.status, cin, type },
      );
    }

    // The API returns binary PDF (application/octet-stream)
    const arrayBuffer = await response.arrayBuffer();

    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new AppError(
        ErrorCode.EXTERNAL_API_ERROR,
        `Empty response from ${type} download`,
        502,
        { cin, type },
      );
    }

    // Verify it's a valid PDF
    const bytes = new Uint8Array(arrayBuffer);
    const pdfSignature = String.fromCharCode(...bytes.slice(0, 4));

    if (pdfSignature !== "%PDF") {
      throw new AppError(
        ErrorCode.EXTERNAL_API_ERROR,
        `Invalid PDF file received for ${type}`,
        502,
        { cin, type, signature: pdfSignature },
      );
    }

    // Convert to base64
    const buffer = Buffer.from(arrayBuffer);
    const base64String = buffer.toString("base64");

    return base64String;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    // Handle timeout
    if (error instanceof Error && error.name === "AbortError") {
      throw new AppError(
        ErrorCode.EXTERNAL_API_ERROR,
        `${type} download timed out - please try again`,
        504,
        { cin, type, timeout: "30s" },
      );
    }

    throw new AppError(
      ErrorCode.EXTERNAL_API_ERROR,
      `Failed to download ${type} from Probe42`,
      502,
      {
        originalError: error instanceof Error ? error.message : String(error),
        cin,
        type,
      },
    );
  }
}
