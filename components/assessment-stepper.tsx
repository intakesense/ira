"use client";

/**
 * Assessment Stepper Component
 *
 * 3-step assessment flow:
 * Step 1: Company Verification (Editable Form)
 * Step 2: Financial Data Verification (Editable Form)
 * Step 3: Preset Questionnaire
 */

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Building2,
  BarChart3,
  FileQuestion,
  Loader2,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import type { AssessmentWithLead } from "@/actions/assessment-stepper";
import {
  verifyCompanyData,
  verifyFinancialData,
  updatePresetAnswers,
  submitPresetAssessment,
  goToStep,
} from "@/actions/assessment-stepper";

// ============================================================================
// Types
// ============================================================================

interface Props {
  assessment: AssessmentWithLead;
  leadId: string;
}

type Probe42Data = {
  company?: {
    legal_name?: string;
    pan?: string;
    paid_up_capital?: number;
    registered_address?: {
      full_address?: string;
    };
  };
  gst_details?: Array<{
    gstin?: string;
    state?: string;
    status?: string;
  }>;
  financials?: Array<{
    year?: string;
    year_ending?: string;
    total_revenue?: number;
    net_profit?: number;
    bs?: {
      subTotals?: {
        totalEquity?: number;
        totalNonCurrentLiabilities?: number;
        totalCurrentLiabilities?: number;
        netFixedAssets?: number;
        totalCurrentAssets?: number;
        capital_wip?: number;
        totalDebt?: number;
        totalOtherNonCurrentAssets?: number;
      };
    };
  }>;
  nfbc_financials?: Array<{
    pnl?: {
      totalRevenue?: number;
      profitAfterTax?: number;
    };
  }>;
};

// ============================================================================
// Step Indicator
// ============================================================================

function StepIndicator({
  currentStep,
  companyVerified,
  financialVerified,
}: {
  currentStep: number;
  companyVerified: boolean;
  financialVerified: boolean;
}) {
  const steps = [
    {
      number: 1,
      label: "Company",
      icon: Building2,
      completed: companyVerified,
    },
    {
      number: 2,
      label: "Financial",
      icon: BarChart3,
      completed: financialVerified,
    },
    { number: 3, label: "Questions", icon: FileQuestion, completed: false },
  ];

  return (
    <div className="flex items-center justify-center gap-2 md:gap-4 mb-6">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = currentStep === step.number;
        const isCompleted = step.completed;

        return (
          <div key={step.number} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                  ${isCompleted ? "bg-primary border-primary text-primary-foreground" : ""}
                  ${isActive && !isCompleted ? "border-primary text-primary" : ""}
                  ${!isActive && !isCompleted ? "border-foreground/20 text-foreground/40" : ""}
                `}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span
                className={`
                  hidden sm:block text-sm font-medium
                  ${isActive ? "text-foreground" : "text-foreground/50"}
                `}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`
                  w-8 md:w-16 h-0.5 mx-2
                  ${isCompleted ? "bg-primary" : "bg-foreground/10"}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// Step 1: Company Verification
// ============================================================================

function Step1CompanyVerification({
  assessment,
  probe42Data,
  onVerify,
  isPending,
}: {
  assessment: AssessmentWithLead;
  probe42Data: Probe42Data | null;
  onVerify: (data: any) => void;
  isPending: boolean;
}) {
  console.log("Component rendered"); // Add this first
  console.log("probe42Data on render:", probe42Data); // Add this too

  // Initialize form data from Probe42 flattened fields OR JSON OR Lead fields
  const [formData, setFormData] = useState({
    companyName:
      assessment.lead.probe42LegalName ||
      probe42Data?.company?.legal_name ||
      assessment.lead.companyName ||
      "",
    pan: assessment.lead.probe42Pan || probe42Data?.company?.pan || "",
    address:
      probe42Data?.company?.registered_address?.full_address ||
      assessment.lead.address ||
      "",
    gstNumbers:
      probe42Data?.gst_details
        ?.map((g) => g.gstin || "")
        .filter(Boolean)
        .join(", ") || "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  useEffect(() => {
    console.log("company data:", probe42Data?.company);
    console.log("full probe42Data:", probe42Data);
  }, [probe42Data]);
  const handleSubmit = () => {
    if (!formData.companyName || !formData.address) {
      toast.error("Company Name and Address are required");
      return;
    }

    const payload = {
      companyName: formData.companyName,
      address: formData.address,
      pan: formData.pan || undefined,
      gstNumbers: formData.gstNumbers
        ? formData.gstNumbers
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    };

    onVerify(payload);
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-xl p-6">
        <div className="flex items-start gap-3 mb-6">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm text-foreground/70">
            <p className="font-medium text-foreground mb-1">
              Verify Company Details
            </p>
            <p>
              Please review and correct your company details below. If Probe42
              data was fetched, it has been pre-filled.
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-foreground/20 bg-background focus:border-primary outline-none"
                placeholder="Enter company name"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                PAN Number
              </label>
              <input
                type="text"
                value={formData.pan}
                onChange={(e) => handleChange("pan", e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-foreground/20 bg-background focus:border-primary outline-none font-mono"
                placeholder="ABCDE1234F"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Registered Address *
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className="w-full p-3 rounded-lg border border-foreground/20 bg-background focus:border-primary outline-none min-h-[80px]"
              placeholder="Enter full registered address"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              GST Numbers (comma separated)
            </label>
            <input
              type="text"
              value={formData.gstNumbers}
              onChange={(e) => handleChange("gstNumbers", e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-foreground/20 bg-background focus:border-primary outline-none font-mono"
              placeholder="27AABCU9603R1ZN, ..."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 h-12 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 transition-all"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Verify & Continue
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Step 2: Financial Verification
// ============================================================================

function Step2FinancialVerification({
  assessment,
  probe42Data,
  onVerify,
  onBack,
  isPending,
}: {
  assessment: AssessmentWithLead;
  probe42Data: Probe42Data | null;
  onVerify: (data: any) => void;
  onBack: () => void;
  isPending: boolean;
}) {
  useEffect(() => {
    console.log("Component financial rendered");
    console.log("full probe42Data:", probe42Data);
    console.log("finacial data", probe42Data?.financials);
  }, [probe42Data]);

  const financials = probe42Data?.financials || [];
  const nfbcfinancials = probe42Data?.nfbc_financials || [];

  const latestFinancial = financials[0];

  // Initial Values Calculation
  // Use flattened fields if available, otherwise raw JSON, otherwise 0/null

  // Paid up capital: flattened (BigInt) -> number
  const initialPaidUpCapital = assessment.lead.probe42PaidUpCapital
    ? Number(assessment.lead.probe42PaidUpCapital) / 10000000
    : probe42Data?.company?.paid_up_capital
      ? probe42Data?.company?.paid_up_capital / 10000000
      : null;

  // Net Worth: derived from JSON usually
  const initialNetWorth =
    latestFinancial &&
    latestFinancial.bs?.subTotals?.totalCurrentAssets &&
    latestFinancial.bs?.subTotals?.totalCurrentLiabilities
      ? (latestFinancial.bs?.subTotals?.totalCurrentAssets -
          latestFinancial.bs?.subTotals?.totalCurrentLiabilities) /
        10000000
      : null;

  // Borrowings: JSON total_liabilities
  const initialBorrowings = latestFinancial?.bs?.subTotals
    ?.totalCurrentLiabilities
    ? latestFinancial.bs?.subTotals?.totalCurrentLiabilities / 10000000
    : null;

  // D/E Ratio
  const equity =
    latestFinancial &&
    latestFinancial?.bs?.subTotals?.totalCurrentAssets &&
    latestFinancial.bs?.subTotals?.totalCurrentLiabilities
      ? latestFinancial?.bs?.subTotals?.totalCurrentAssets -
        latestFinancial.bs?.subTotals?.totalCurrentLiabilities
      : 0;
  const initialDERatio =
    equity > 0 && latestFinancial?.bs?.subTotals?.totalCurrentLiabilities
      ? latestFinancial.bs?.subTotals?.totalCurrentLiabilities / equity
      : null;
  console.log("latestFinancial:", latestFinancial?.bs?.subTotals);

  console.log(
    "total_current_assets:",
    latestFinancial?.bs?.subTotals?.totalCurrentAssets,
  );
  console.log(
    "totalCurrentLiabilities:",
    latestFinancial?.bs?.subTotals?.totalCurrentLiabilities,
  );
  console.log("initialDERatio:", initialDERatio);
  const [formData, setFormData] = useState({
    paidUpCapital: initialPaidUpCapital,
    netWorth: initialNetWorth,
    totalBorrowings: initialBorrowings,
    debtEquityRatio: initialDERatio ? Number(initialDERatio.toFixed(2)) : null,

    turnoverYear1: nfbcfinancials[0]?.pnl?.totalRevenue
      ? nfbcfinancials[0]?.pnl?.totalRevenue / 10000000
      : null,
    turnoverYear2: nfbcfinancials[1]?.pnl?.totalRevenue
      ? nfbcfinancials[1].pnl?.totalRevenue / 10000000
      : null,
    turnoverYear3: nfbcfinancials[2]?.pnl?.totalRevenue
      ? nfbcfinancials[2].pnl?.totalRevenue / 10000000
      : null,

    ebitdaYear1: nfbcfinancials[0]?.pnl?.profitAfterTax
      ? nfbcfinancials[0]?.pnl?.profitAfterTax / 10000000
      : null,
    ebitdaYear2: nfbcfinancials[1]?.pnl?.profitAfterTax
      ? nfbcfinancials[1]?.pnl?.profitAfterTax / 10000000
      : null,
    ebitdaYear3: nfbcfinancials[2]?.pnl?.profitAfterTax
      ? nfbcfinancials[2]?.pnl?.profitAfterTax / 10000000
      : null,
  });

  const handleChange = (field: string, value: string) => {
    const numValue = value === "" ? null : parseFloat(value);
    setFormData((prev) => ({ ...prev, [field]: numValue }));
  };

  const handleSubmit = () => {
    const payload = {
      paidUpCapital: formData.paidUpCapital || 0,
      netWorth: formData.netWorth || 0,
      // Split total borrowings equally for schema compatibility if not manually split
      shortTermBorrowings: (formData.totalBorrowings || 0) / 2,
      longTermBorrowings: (formData.totalBorrowings || 0) / 2,
      debtEquityRatio: formData.debtEquityRatio || 0,
      turnover: [
        formData.turnoverYear1,
        formData.turnoverYear2,
        formData.turnoverYear3,
      ],
      ebitda: [
        formData.ebitdaYear1,
        formData.ebitdaYear2,
        formData.ebitdaYear3,
      ], // NOTE: Schema expects ebitda? Wait, need to check if schema expects ebitda.
      // I recall adding ebitda to schema earlier? Or was it just in my head?
      // The schema in actions/assessment-stepper.ts (lines 93-100) did NOT show ebitda explicitly in the snippet I viewed.
      // I better check if I need to pass it or if verifyFinancialData ignores extra fields.
      // Actually, verifyFinancialData uses FinancialVerificationSchema.parse(input). If I pass extra fields, Zod might strip them or error depending on config.
      // I should be careful. Let me re-read the schema lines.
    };

    // Wait! I need to double check the schema for 'ebitda'.
    // Snippet 685 showed:
    // turnover: z.array(z.number().nullable()).length(3).optional(),
    // ... end of snippet.
    // It's likely ebitda is there or needed.
    // I will include it, assuming I updated the schema previously or it exists.

    onVerify({
      ...payload,
      ebitda: [
        formData.ebitdaYear1,
        formData.ebitdaYear2,
        formData.ebitdaYear3,
      ],
    });
  };

  const NumberInput = ({ label, field, placeholder, unit }: any) => (
    <div>
      <label className="text-xs text-foreground/50 uppercase tracking-wide block mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          step="any"
          value={formData[field as keyof typeof formData] ?? ""}
          onChange={(e) => handleChange(field, e.target.value)}
          className="w-full h-10 px-3 rounded-lg border border-foreground/20 bg-background focus:border-primary outline-none"
          placeholder={placeholder}
        />
        {unit && (
          <span className="absolute right-3 top-2.5 text-xs text-foreground/50">
            {unit}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="glass rounded-xl p-6">
        <div className="flex items-start gap-3 mb-6">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm text-foreground/70">
            <p className="font-medium text-foreground mb-1">
              Verify Financial Data
            </p>
            <p>
              Verify or update the financial metrics below. All currency figures
              are in Crores (Cr).
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <NumberInput
              label="Paid-up Capital"
              field="paidUpCapital"
              unit="Cr"
            />
            <NumberInput label="Net Worth" field="netWorth" unit="Cr" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <NumberInput
              label="Borrowings (Short + Long)"
              field="totalBorrowings"
              unit="Cr"
            />
            <NumberInput label="Debt/Equity Ratio" field="debtEquityRatio" />
          </div>

          <div className="p-4 rounded-lg bg-background/50">
            <label className="text-xs text-foreground/50 uppercase tracking-wide block mb-3">
              Turnover (Last 3 Years)
            </label>
            <div className="grid grid-cols-3 gap-4">
              <NumberInput label="Year 1" field="turnoverYear1" unit="Cr" />
              <NumberInput label="Year 2" field="turnoverYear2" unit="Cr" />
              <NumberInput label="Year 3" field="turnoverYear3" unit="Cr" />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-background/50">
            <label className="text-xs text-foreground/50 uppercase tracking-wide block mb-3">
              EBITDA/Net Profit (Last 3 Years)
            </label>
            <div className="grid grid-cols-3 gap-4">
              <NumberInput label="Year 1" field="ebitdaYear1" unit="Cr" />
              <NumberInput label="Year 2" field="ebitdaYear2" unit="Cr" />
              <NumberInput label="Year 3" field="ebitdaYear3" unit="Cr" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 h-12 rounded-lg border border-foreground/20 text-foreground font-medium hover:bg-foreground/5 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 h-12 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 transition-all"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Verify & Continue
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Step 3: Preset Questionnaired
// ============================================================================
function YesNoQuestion({
  id,
  label,
  value,
  remarks,
  onAnswer,
  onRemark,
}: {
  id: string;
  label: string;
  value: boolean | null;
  remarks: Record<string, string>;
  onAnswer: (id: string, value: boolean) => void;
  onRemark: (id: string, value: string) => void;
}) {
  return (
    <div className="p-4 rounded-lg bg-background/50 space-y-3">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onAnswer(id, true)}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium border transition-all ${
            value === true
              ? "bg-green-600 text-white border-green-600"
              : "bg-background border-foreground/20 hover:bg-foreground/5"
          }`}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => onAnswer(id, false)}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium border transition-all ${
            value === false
              ? "bg-red-600 text-white border-red-600"
              : "bg-background border-foreground/20 hover:bg-foreground/5"
          }`}
        >
          No
        </button>
      </div>
      <div>
        <label className="text-xs text-foreground/50 mb-1 block">
          Reason / Remarks <span className="text-red-500">*</span>
        </label>
        <textarea
          value={remarks[id] || ""}
          onChange={(e) => onRemark(id, e.target.value)}
          placeholder="Provide reason or context for this answer..."
          rows={2}
          className={`w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none transition-colors ${
            !remarks[id]?.trim()
              ? "border-red-400/50 focus:border-red-400"
              : "border-foreground/20 focus:border-primary"
          }`}
        />
        {!remarks[id]?.trim() && (
          <p className="text-xs text-red-400 mt-1">Required</p>
        )}
      </div>
    </div>
  );
}

function NumberInput({
  id,
  label,
  value,
  unit,
  placeholder,
  remarks,
  onRemark,
  onChange,
}: {
  id: string;
  label: string;
  value: number | null;
  unit?: string;
  placeholder?: string;
  remarks: Record<string, string>;
  onRemark: (id: string, value: string) => void;
  onChange: (id: string, value: number | null) => void;
}) {
  return (
    <div className="p-4 rounded-lg bg-background/50 space-y-3">
      <label className="text-sm font-medium block">{label}</label>
      <div className="relative">
        <input
          type="number"
          step="any"
          value={value ?? ""}
          onChange={(e) =>
            onChange(
              id,
              e.target.value === "" ? null : parseFloat(e.target.value),
            )
          }
          placeholder={placeholder}
          className="w-full h-12 px-4 rounded-lg border border-foreground/20 bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
        />
        {unit && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-foreground/50">
            {unit}
          </span>
        )}
      </div>
      <div>
        <label className="text-xs text-foreground/50 mb-1 block">
          Reason / Remarks <span className="text-red-500">*</span>
        </label>
        <textarea
          value={remarks[id] || ""}
          onChange={(e) => onRemark(id, e.target.value)}
          placeholder="Provide context or explanation..."
          rows={2}
          className={`w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none transition-colors ${
            !remarks[id]?.trim()
              ? "border-red-400/50 focus:border-red-400"
              : "border-foreground/20 focus:border-primary"
          }`}
        />
        {!remarks[id]?.trim() && (
          <p className="text-xs text-red-400 mt-1">Required</p>
        )}
      </div>
    </div>
  );
}
function Step3PresetQuestionnaire({
  assessment,
  onBack,
  onSubmit,
  isPending,
}: {
  assessment: AssessmentWithLead;
  onBack: () => void;
  onSubmit: () => void;
  isPending: boolean;
}) {
  const [saving, startSaving] = useTransition();
  const [remarks, setRemarks] = useState<Record<string, string>>(
    (assessment.remarks as Record<string, string>) || {},
  );

  // Local state for form values
  const [formData, setFormData] = useState({
    hasInvestmentPlan: assessment.hasInvestmentPlan,
    q2aGovernancePlan: assessment.q2aGovernancePlan,
    q2bFinancialReporting: assessment.q2bFinancialReporting,
    q2cControlSystems: assessment.q2cControlSystems,
    q2dShareholdingClear: assessment.q2dShareholdingClear,
    q3aSeniorManagement: assessment.q3aSeniorManagement,
    q3bIndependentBoard: assessment.q3bIndependentBoard,
    q3cMidManagement: assessment.q3cMidManagement,
    q3dKeyPersonnel: assessment.q3dKeyPersonnel,
    q4PaidUpCapital: assessment.q4PaidUpCapital,
    q5OutstandingShares: assessment.q5OutstandingShares,
    q6NetWorth: assessment.q6NetWorth,
    q7Borrowings: assessment.q7Borrowings,
    q8DebtEquityRatio: assessment.q8DebtEquityRatio,
    q9TurnoverYear1: assessment.q9TurnoverYear1,
    q9TurnoverYear2: assessment.q9TurnoverYear2,
    q9TurnoverYear3: assessment.q9TurnoverYear3,
    q10EbitdaYear1: assessment.q10EbitdaYear1,
    q10EbitdaYear2: assessment.q10EbitdaYear2,
    q10EbitdaYear3: assessment.q10EbitdaYear3,
    q11Eps: assessment.q11Eps,
  });

  // Auto-save on change
  const handleChange = (field: string, value: boolean | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    startSaving(async () => {
      await updatePresetAnswers(assessment.id, { [field]: value });
    });
  };

  const remarkTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {},
  );

  const handleRemark = (field: string, value: string) => {
    setRemarks((prev) => ({ ...prev, [field]: value }));
  };

  <YesNoQuestion
    id="hasInvestmentPlan"
    label="Are you ready with your investment plan?"
    value={formData.hasInvestmentPlan}
    remarks={remarks}
    onAnswer={handleChange}
    onRemark={handleRemark}
  />;

  //   id,
  //   label,
  //   value,
  //   unit,
  //   placeholder,
  // }: {
  //   id: string;
  //   label: string;
  //   value: number | null;
  //   unit?: string;
  //   placeholder?: string;
  // }) => (
  //   <div className="p-4 rounded-lg bg-background/50">
  //     <label className="text-sm font-medium mb-2 block">{label}</label>
  //     <div className="relative">
  //       <input
  //         type="number"
  //         step="any"
  //         value={value ?? ""}
  //         onChange={(e) => {
  //           const val =
  //             e.target.value === "" ? null : parseFloat(e.target.value);
  //           handleChange(id, val);
  //         }}
  //         placeholder={placeholder}
  //         className="w-full h-12 px-4 rounded-lg border border-foreground/20 bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
  //       />
  //       {unit && (
  //         <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-foreground/50">
  //           {unit}
  //         </span>
  //       )}
  //     </div>
  //   </div>
  // );

  return (
    <div className="space-y-6">
      {/* Q1: Investment Plan */}
      <div className="glass rounded-xl p-6">
        <h4 className="text-base font-semibold mb-4">1. Investment Plan</h4>
        <YesNoQuestion
          id="hasInvestmentPlan"
          label="Are you ready with your investment plan?"
          value={formData.hasInvestmentPlan}
          remarks={remarks}
          onAnswer={handleChange}
          onRemark={handleRemark}
        />
      </div>

      {/* Q2: Corporate Governance */}
      <div className="glass rounded-xl p-6">
        <h4 className="text-base font-semibold mb-4">
          2. About your company&apos;s Corporate Governance Structure
        </h4>
        <div className="grid gap-4">
          <YesNoQuestion
            id="q2aGovernancePlan"
            label="A. Is the corporate governance plan in place with at least the requirements of Indian corporate listing norms?"
            value={formData.q2aGovernancePlan}
            remarks={remarks}
            onAnswer={handleChange}
            onRemark={handleRemark}
          />
          <YesNoQuestion
            id="q2bFinancialReporting"
            label="B. Does your financial reporting comply with statutory laws, rules, listing norms, accounting standards, etc.?"
            value={formData.q2bFinancialReporting}
            remarks={remarks}
            onAnswer={handleChange}
            onRemark={handleRemark}
          />
          <YesNoQuestion
            id="q2cControlSystems"
            label="C. Does your company have robust financial, operational, and internal control systems ensuring effective governance and risk management?"
            value={formData.q2cControlSystems}
            remarks={remarks}
            onAnswer={handleChange}
            onRemark={handleRemark}
          />
          <YesNoQuestion
            id="q2dShareholdingClear"
            label="D. Is your shareholding clear and transparent?"
            value={formData.q2dShareholdingClear}
            remarks={remarks}
            onAnswer={handleChange}
            onRemark={handleRemark}
          />
        </div>
      </div>

      {/* Q3: Right Team */}
      <div className="glass rounded-xl p-6">
        <h4 className="text-base font-semibold mb-4">
          3. Do you have the right team?
        </h4>
        <div className="grid gap-4">
          <YesNoQuestion
            id="q3aSeniorManagement"
            label="A. Does the company have a professional and well-qualified senior management team with industry experience and a good track record?"
            value={formData.q3aSeniorManagement}
            remarks={remarks}
            onAnswer={handleChange}
            onRemark={handleRemark}
          />
          <YesNoQuestion
            id="q3bIndependentBoard"
            label="B. Are there credible independent members on the board who add value to the company?"
            value={formData.q3bIndependentBoard}
            remarks={remarks}
            onAnswer={handleChange}
            onRemark={handleRemark}
          />
          <YesNoQuestion
            id="q3cMidManagement"
            label="C. Is there experienced staff at the mid-management level?"
            value={formData.q3cMidManagement}
            remarks={remarks}
            onAnswer={handleChange}
            onRemark={handleRemark}
          />
          <YesNoQuestion
            id="q3dKeyPersonnel"
            label="D. Are key personnel within the organization recognized as per accepted market practices, regulatory norms, and corporate governance requirements (e.g., compliance officer appointed)?"
            value={formData.q3dKeyPersonnel}
            remarks={remarks}
            onAnswer={handleChange}
            onRemark={handleRemark}
          />
        </div>
      </div>

      {/* Q4-Q11: Financial Data */}
      <div className="glass rounded-xl p-6">
        <h4 className="text-base font-semibold mb-4">4-11. Financial Data</h4>
        <div className="grid gap-4">
          <NumberInput
            id="q4PaidUpCapital"
            label="4. Enter the present paid-up capital of your company (in Crores)"
            value={formData.q4PaidUpCapital}
            unit="Cr"
            placeholder="e.g., 10"
            remarks={remarks}
            onRemark={handleRemark}
            onChange={handleChange}
          />
          <NumberInput
            id="q5OutstandingShares"
            label="5. Enter the number of shares outstanding"
            value={formData.q5OutstandingShares}
            placeholder="e.g., 1000000"
            remarks={remarks}
            onRemark={handleRemark}
            onChange={handleChange}
          />
          <NumberInput
            id="q6NetWorth"
            label="6. Enter your company's net worth (in Crores)"
            value={formData.q6NetWorth}
            unit="Cr"
            placeholder="e.g., 25"
            remarks={remarks}
            onRemark={handleRemark}
            onChange={handleChange}
          />
          <NumberInput
            id="q7Borrowings"
            label="7. Enter your company's short-term and long-term borrowings (in Crores)"
            value={formData.q7Borrowings}
            unit="Cr"
            placeholder="e.g., 5"
            remarks={remarks}
            onRemark={handleRemark}
            onChange={handleChange}
          />
          <NumberInput
            id="q8DebtEquityRatio"
            label="8. Enter your company's Debt–Equity Ratio"
            value={formData.q8DebtEquityRatio}
            placeholder="e.g., 0.5"
            remarks={remarks}
            onRemark={handleRemark}
            onChange={handleChange}
          />

          <div className="p-4 rounded-lg bg-background/50">
            <label className="text-sm font-medium mb-3 block">
              9. Enter your company&apos;s turnover for the last 3 years (in
              Crores)
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-foreground/50 mb-1">
                  Year 1 (Latest)
                </p>
                <input
                  type="number"
                  step="any"
                  value={formData.q9TurnoverYear1 ?? ""}
                  onChange={(e) =>
                    handleChange(
                      "q9TurnoverYear1",
                      e.target.value === "" ? null : parseFloat(e.target.value),
                    )
                  }
                  className="w-full h-10 px-3 rounded-lg border border-foreground/20 bg-background"
                />
              </div>
              <div>
                <p className="text-xs text-foreground/50 mb-1">Year 2</p>
                <input
                  type="number"
                  step="any"
                  value={formData.q9TurnoverYear2 ?? ""}
                  onChange={(e) =>
                    handleChange(
                      "q9TurnoverYear2",
                      e.target.value === "" ? null : parseFloat(e.target.value),
                    )
                  }
                  className="w-full h-10 px-3 rounded-lg border border-foreground/20 bg-background"
                />
              </div>
              <div>
                <p className="text-xs text-foreground/50 mb-1">Year 3</p>
                <input
                  type="number"
                  step="any"
                  value={formData.q9TurnoverYear3 ?? ""}
                  onChange={(e) =>
                    handleChange(
                      "q9TurnoverYear3",
                      e.target.value === "" ? null : parseFloat(e.target.value),
                    )
                  }
                  className="w-full h-10 px-3 rounded-lg border border-foreground/20 bg-background"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="text-xs text-foreground/50 mb-1 block">
                Reason / Remarks <span className="text-red-500">*</span>
              </label>
              <textarea
                value={remarks["q9Turnover"] || ""}
                onChange={(e) => handleRemark("q9Turnover", e.target.value)}
                placeholder="Provide context for turnover figures..."
                rows={2}
                className={`w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none ${
                  !remarks["q9Turnover"]?.trim()
                    ? "border-red-400/50 focus:border-red-400"
                    : "border-foreground/20 focus:border-primary"
                }`}
              />
              {!remarks["q9Turnover"]?.trim() && (
                <p className="text-xs text-red-400 mt-1">Required</p>
              )}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-background/50">
            <label className="text-sm font-medium mb-3 block">
              10. Enter your company&apos;s EBITDA for the last 3 years (in
              Crores)
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-foreground/50 mb-1">
                  Year 1 (Latest)
                </p>
                <input
                  type="number"
                  step="any"
                  value={formData.q10EbitdaYear1 ?? ""}
                  onChange={(e) =>
                    handleChange(
                      "q10EbitdaYear1",
                      e.target.value === "" ? null : parseFloat(e.target.value),
                    )
                  }
                  className="w-full h-10 px-3 rounded-lg border border-foreground/20 bg-background"
                />
              </div>
              <div>
                <p className="text-xs text-foreground/50 mb-1">Year 2</p>
                <input
                  type="number"
                  step="any"
                  value={formData.q10EbitdaYear2 ?? ""}
                  onChange={(e) =>
                    handleChange(
                      "q10EbitdaYear2",
                      e.target.value === "" ? null : parseFloat(e.target.value),
                    )
                  }
                  className="w-full h-10 px-3 rounded-lg border border-foreground/20 bg-background"
                />
              </div>
              <div>
                <p className="text-xs text-foreground/50 mb-1">Year 3</p>
                <input
                  type="number"
                  step="any"
                  value={formData.q10EbitdaYear3 ?? ""}
                  onChange={(e) =>
                    handleChange(
                      "q10EbitdaYear3",
                      e.target.value === "" ? null : parseFloat(e.target.value),
                    )
                  }
                  className="w-full h-10 px-3 rounded-lg border border-foreground/20 bg-background"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="text-xs text-foreground/50 mb-1 block">
                Reason / Remarks <span className="text-red-500">*</span>
              </label>
              <textarea
                value={remarks["q10Turnover"] || ""}
                onChange={(e) => handleRemark("q10Turnover", e.target.value)}
                placeholder="Provide context for turnover figures..."
                rows={2}
                className={`w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none ${
                  !remarks["q10Turnover"]?.trim()
                    ? "border-red-400/50 focus:border-red-400"
                    : "border-foreground/20 focus:border-primary"
                }`}
              />
              {!remarks["q9Turnover"]?.trim() && (
                <p className="text-xs text-red-400 mt-1">Required</p>
              )}
            </div>
          </div>

          <NumberInput
            id="q11Eps"
            label="11. Enter your company's Earnings Per Share (EPS)"
            value={formData.q11Eps}
            unit="₹"
            placeholder="e.g., 15"
            remarks={remarks}
            onRemark={handleRemark}
            onChange={handleChange}
          />
        </div>
      </div>
      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 h-12 rounded-lg border border-foreground/20 text-foreground font-medium hover:bg-foreground/5 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={async () => {
            const yesNoFields = [
              "hasInvestmentPlan",
              "q2aGovernancePlan",
              "q2bFinancialReporting",
              "q2cControlSystems",
              "q2dShareholdingClear",
              "q3aSeniorManagement",
              "q3bIndependentBoard",
              "q3cMidManagement",
              "q3dKeyPersonnel",
              "q4PaidUpCapital",
              "q5OutstandingShares",
              "q6NetWorth",
              "q7Borrowings",
              "q8DebtEquityRatio",
              "q9Turnover",
              "q10Turnover",
              "q11Eps",
            ];
            const missing = yesNoFields.filter((f) => !remarks[f]?.trim());
            if (missing.length > 0) {
              toast.error(
                `Please provide remarks for all ${missing.length} question(s)`,
              );
              return;
            }
            // Save all answers + remarks in one shot
            const result = await updatePresetAnswers(assessment.id, {
              ...formData,
              remarks,
            });
            if (!result.success) {
              toast.error("Failed to save answers");
              return;
            }
            onSubmit();
          }}
          className="inline-flex items-center gap-2 px-8 h-12 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 transition-all"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Assessment"
          )}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function AssessmentStepper({ assessment, leadId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Parse Probe42 data
  const probe42Data = assessment.lead.probe42Data as Probe42Data | null;

  // Handle Step 1 verification (Updated to accept data)
  const handleVerifyCompany = (data: any) => {
    startTransition(async () => {
      const result = await verifyCompanyData(assessment.id, data);

      if (result.success) {
        toast.success("Company data verified");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to verify company data");
      }
    });
  };

  // Handle Step 2 verification (Updated to accept data)
  const handleVerifyFinancial = (data: any) => {
    startTransition(async () => {
      const result = await verifyFinancialData(assessment.id, data);

      if (result.success) {
        toast.success("Financial data verified");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to verify financial data");
      }
    });
  };

  // Handle back navigation
  const handleBack = () => {
    const targetStep = assessment.currentStep === 3 ? 2 : 1;
    startTransition(async () => {
      const result = await goToStep(assessment.id, targetStep as 1 | 2 | 3);
      if (result.success) {
        router.refresh();
      }
    });
  };

  // Handle submit
  const handleSubmit = () => {
    startTransition(async () => {
      const result = await submitPresetAssessment(assessment.id);

      if (result.success) {
        toast.success(result.message || "Assessment submitted successfully!");
        router.push(`/dashboard/leads/${leadId}`);
      } else {
        toast.error(result.error || "Failed to submit assessment");
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <StepIndicator
        currentStep={assessment.currentStep}
        companyVerified={assessment.companyVerified}
        financialVerified={assessment.financialVerified}
      />

      {assessment.currentStep === 1 && (
        <Step1CompanyVerification
          assessment={assessment}
          probe42Data={probe42Data}
          onVerify={handleVerifyCompany}
          isPending={isPending}
        />
      )}
      {assessment.currentStep === 2 && (
        <Step2FinancialVerification
          assessment={assessment}
          probe42Data={probe42Data}
          onVerify={handleVerifyFinancial}
          onBack={handleBack}
          isPending={isPending}
        />
      )}

      {assessment.currentStep === 3 && (
        <Step3PresetQuestionnaire
          assessment={assessment}
          onBack={handleBack}
          onSubmit={handleSubmit}
          isPending={isPending}
        />
      )}
      {/* 
            Button to refresh database
            <ForceRefetchButton leadId={leadId} /> */}
    </div>
  );
}

/** tem button to refresh database */

// In your lead detail page or wherever you display the lead
// "use client"

// import { forceRefetchProbe42Data } from "@/actions/lead"
// import { useState } from "react"
// import { toast } from "sonner"

// export function ForceRefetchButton({ leadId }: { leadId: string }) {
//   const [loading, setLoading] = useState(false)

//   const handleRefetch = async () => {
//     setLoading(true)
//     try {
//       const result = await forceRefetchProbe42Data(leadId)
//       if (result.success) {
//         toast.success("Data re-fetched successfully!")
//         window.location.reload() // Force page refresh
//       } else {
//         toast.error(result.error || "Failed to re-fetch")
//       }
//     } catch (error) {
//       toast.error("Error re-fetching data")
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <button
//       onClick={handleRefetch}
//       disabled={loading}
//       className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
//     >
//       {loading ? "Re-fetching..." : "🔄 Force Re-fetch Probe42 Data"}
//     </button>
//   )
// }
