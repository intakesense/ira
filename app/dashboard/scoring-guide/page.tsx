import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { MAX_POSSIBLE_SCORE } from "@/lib/preset-questionnaire"
import {
    Calculator,
    CheckCircle2,
    HelpCircle,
    Target,
    TrendingUp,
    Users,
    Building2,
    PiggyBank
} from "lucide-react"

export const metadata = {
    title: "Scoring Guide | IRA Platform",
    description: "Understand how IPO readiness assessments are scored",
}

export default async function ScoringGuidePage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session) {
        redirect("/login")
    }

    // Only reviewers can access this page
    if (session.user.role !== "REVIEWER") {
        redirect("/dashboard")
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="glass rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Calculator className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold">Scoring Guide</h1>
                        <p className="text-sm text-foreground/60">
                            Understand how IPO readiness assessments are scored
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Overview */}
            <div className="glass rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Rating Tiers
                </h2>

                <div className="grid gap-4 md:grid-cols-3 mb-6">
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <p className="text-sm text-green-600 font-medium">IPO Ready</p>
                        <p className="text-2xl font-bold text-green-500">≥65%</p>
                        <p className="text-xs text-foreground/60 mt-1">Strong fundamentals, ready for listing</p>
                    </div>
                    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <p className="text-sm text-yellow-600 font-medium">Needs Improvement</p>
                        <p className="text-2xl font-bold text-yellow-500">45-65%</p>
                        <p className="text-xs text-foreground/60 mt-1">Has potential, needs work in some areas</p>
                    </div>
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="text-sm text-red-600 font-medium">Not Ready</p>
                        <p className="text-2xl font-bold text-red-500">&lt;45%</p>
                        <p className="text-xs text-foreground/60 mt-1">Significant gaps to address</p>
                    </div>
                </div>

                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-sm">
                        <strong>Maximum Score:</strong> {MAX_POSSIBLE_SCORE} points across 11 questions
                    </p>
                    <p className="text-xs text-foreground/60 mt-1">
                        Final percentage = (Total Score ÷ {MAX_POSSIBLE_SCORE}) × 100
                    </p>
                </div>
            </div>

            {/* How Scoring Works */}
            <div className="glass rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    How Scoring Works
                </h2>

                <div className="space-y-4 text-sm">
                    <div className="flex gap-3">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">1</div>
                        <div>
                            <p className="font-medium">Assessor Gathers Data</p>
                            <p className="text-foreground/60">Financial data is fetched from Probe42 and verified by the assessor</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">2</div>
                        <div>
                            <p className="font-medium">11 Questions Answered</p>
                            <p className="text-foreground/60">Mix of Yes/No questions and financial metrics with specific thresholds</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">3</div>
                        <div>
                            <p className="font-medium">Automatic Score Calculation</p>
                            <p className="text-foreground/60">Each answer is scored based on thresholds defined below</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">4</div>
                        <div>
                            <p className="font-medium">Rating Determined</p>
                            <p className="text-foreground/60">Total percentage determines IPO Ready / Needs Improvement / Not Ready</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Question 1: Investment Plan */}
            <div className="glass rounded-xl p-6">
                <div className="flex items-start gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Question 1: Investment Plan</h3>
                        <p className="text-sm text-foreground/70 mt-1">
                            Are you ready with your investment plan?
                        </p>
                        <p className="text-xs text-primary mt-2">Max Score: 5 points</p>
                    </div>
                </div>

                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-foreground/10">
                            <th className="text-left py-2 text-foreground/60 font-medium">Answer</th>
                            <th className="text-right py-2 text-foreground/60 font-medium">Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-foreground/5">
                            <td className="py-2">Yes</td>
                            <td className="py-2 text-right font-medium text-green-500">5</td>
                        </tr>
                        <tr>
                            <td className="py-2">No</td>
                            <td className="py-2 text-right font-medium text-red-500">0</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Question 2: Corporate Governance */}
            <div className="glass rounded-xl p-6">
                <div className="flex items-start gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                        <Building2 className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Question 2: Corporate Governance Structure</h3>
                        <p className="text-sm text-foreground/70 mt-1">
                            About your company&apos;s Corporate Governance Structure:
                        </p>
                        <p className="text-xs text-primary mt-2">Max Score: 10 points (2.5 each × 4 sub-questions)</p>
                    </div>
                </div>

                <div className="mb-4 space-y-3 text-sm">
                    <div className="p-3 rounded-lg bg-foreground/5">
                        <p className="font-medium text-foreground/80">A. Governance Plan</p>
                        <p className="text-foreground/60 mt-1">
                            Is the corporate governance plan in place with at least the requirements of Indian corporate listing norms?
                        </p>
                    </div>
                    <div className="p-3 rounded-lg bg-foreground/5">
                        <p className="font-medium text-foreground/80">B. Financial Reporting</p>
                        <p className="text-foreground/60 mt-1">
                            Does your financial reporting comply with statutory laws, rules, listing norms, accounting standards, etc.?
                        </p>
                    </div>
                    <div className="p-3 rounded-lg bg-foreground/5">
                        <p className="font-medium text-foreground/80">C. Control Systems</p>
                        <p className="text-foreground/60 mt-1">
                            Does your company have robust financial, operational, and internal control systems ensuring effective governance and risk management?
                        </p>
                    </div>
                    <div className="p-3 rounded-lg bg-foreground/5">
                        <p className="font-medium text-foreground/80">D. Shareholding Clarity</p>
                        <p className="text-foreground/60 mt-1">
                            Is your shareholding clear and transparent?
                        </p>
                    </div>
                </div>

                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-foreground/10">
                            <th className="text-left py-2 text-foreground/60 font-medium">Answer (per sub-question)</th>
                            <th className="text-right py-2 text-foreground/60 font-medium">Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-foreground/5">
                            <td className="py-2">Yes</td>
                            <td className="py-2 text-right font-medium text-green-500">2.5</td>
                        </tr>
                        <tr>
                            <td className="py-2">No</td>
                            <td className="py-2 text-right font-medium text-red-500">0</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Question 3: Right Team */}
            <div className="glass rounded-xl p-6">
                <div className="flex items-start gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                        <Users className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Question 3: Right Team</h3>
                        <p className="text-sm text-foreground/70 mt-1">
                            Do you have the right team?
                        </p>
                        <p className="text-xs text-primary mt-2">Max Score: 10 points (2.5 each × 4 sub-questions)</p>
                    </div>
                </div>

                <div className="mb-4 space-y-3 text-sm">
                    <div className="p-3 rounded-lg bg-foreground/5">
                        <p className="font-medium text-foreground/80">A. Senior Management</p>
                        <p className="text-foreground/60 mt-1">
                            Does the company have a professional and well-qualified senior management team with industry experience and a good track record?
                        </p>
                    </div>
                    <div className="p-3 rounded-lg bg-foreground/5">
                        <p className="font-medium text-foreground/80">B. Independent Board</p>
                        <p className="text-foreground/60 mt-1">
                            Are there credible independent members on the board who add value to the company?
                        </p>
                    </div>
                    <div className="p-3 rounded-lg bg-foreground/5">
                        <p className="font-medium text-foreground/80">C. Mid-Management</p>
                        <p className="text-foreground/60 mt-1">
                            Is there experienced staff at the mid-management level?
                        </p>
                    </div>
                    <div className="p-3 rounded-lg bg-foreground/5">
                        <p className="font-medium text-foreground/80">D. Key Personnel</p>
                        <p className="text-foreground/60 mt-1">
                            Are key personnel within the organization recognized as per accepted market practices, regulatory norms, and corporate governance requirements (e.g., compliance officer appointed)?
                        </p>
                    </div>
                </div>

                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-foreground/10">
                            <th className="text-left py-2 text-foreground/60 font-medium">Answer (per sub-question)</th>
                            <th className="text-right py-2 text-foreground/60 font-medium">Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-foreground/5">
                            <td className="py-2">Yes</td>
                            <td className="py-2 text-right font-medium text-green-500">2.5</td>
                        </tr>
                        <tr>
                            <td className="py-2">No</td>
                            <td className="py-2 text-right font-medium text-red-500">0</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Financial Metrics Q4-Q11 */}
            <div className="glass rounded-xl p-6">
                <div className="flex items-start gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                        <PiggyBank className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Questions 4-11: Financial Metrics</h3>
                        <p className="text-sm text-foreground/70 mt-1">
                            Financial data from company&apos;s audited balance sheet
                        </p>
                        <p className="text-xs text-primary mt-2">Max Score: 57.5 points total</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Q4: Paid-up Capital */}
                    <div className="border-b border-foreground/10 pb-4">
                        <p className="font-medium text-sm mb-2">Q4: Enter the present paid-up capital of your company as per the last audited balance sheet.</p>
                        <p className="text-xs text-foreground/60 mb-3">Max: 10 points</p>
                        <div className="grid grid-cols-5 gap-2 text-xs">
                            <div className="p-2 rounded bg-green-500/10 text-center">
                                <p className="font-medium">≥₹10 Cr</p>
                                <p className="text-green-500 font-bold">10</p>
                            </div>
                            <div className="p-2 rounded bg-green-500/10 text-center">
                                <p className="font-medium">≥₹5 Cr</p>
                                <p className="text-green-500">7.5</p>
                            </div>
                            <div className="p-2 rounded bg-yellow-500/10 text-center">
                                <p className="font-medium">≥₹3 Cr</p>
                                <p className="text-yellow-500">5</p>
                            </div>
                            <div className="p-2 rounded bg-orange-500/10 text-center">
                                <p className="font-medium">≥₹1 Cr</p>
                                <p className="text-orange-500">2.5</p>
                            </div>
                            <div className="p-2 rounded bg-red-500/10 text-center">
                                <p className="font-medium">&lt;₹1 Cr</p>
                                <p className="text-red-500">0</p>
                            </div>
                        </div>
                    </div>

                    {/* Q5: Outstanding Shares */}
                    <div className="border-b border-foreground/10 pb-4">
                        <p className="font-medium text-sm mb-2">Q5: Enter the number of shares outstanding as per the last audited balance sheet.</p>
                        <p className="text-xs text-foreground/60 mb-3">Max: 5 points</p>
                        <div className="grid grid-cols-5 gap-2 text-xs">
                            <div className="p-2 rounded bg-green-500/10 text-center">
                                <p className="font-medium">≥1 Cr</p>
                                <p className="text-green-500 font-bold">5</p>
                            </div>
                            <div className="p-2 rounded bg-green-500/10 text-center">
                                <p className="font-medium">≥50 L</p>
                                <p className="text-green-500">3.75</p>
                            </div>
                            <div className="p-2 rounded bg-yellow-500/10 text-center">
                                <p className="font-medium">≥10 L</p>
                                <p className="text-yellow-500">2.5</p>
                            </div>
                            <div className="p-2 rounded bg-orange-500/10 text-center">
                                <p className="font-medium">≥1 L</p>
                                <p className="text-orange-500">1.25</p>
                            </div>
                            <div className="p-2 rounded bg-red-500/10 text-center">
                                <p className="font-medium">&lt;1 L</p>
                                <p className="text-red-500">0</p>
                            </div>
                        </div>
                    </div>

                    {/* Q6: Net Worth */}
                    <div className="border-b border-foreground/10 pb-4">
                        <p className="font-medium text-sm mb-2">Q6: Enter your company&apos;s net worth.</p>
                        <p className="text-xs text-foreground/60 mb-3">Max: 10 points</p>
                        <div className="grid grid-cols-5 gap-2 text-xs">
                            <div className="p-2 rounded bg-green-500/10 text-center">
                                <p className="font-medium">≥₹10 Cr</p>
                                <p className="text-green-500 font-bold">10</p>
                            </div>
                            <div className="p-2 rounded bg-green-500/10 text-center">
                                <p className="font-medium">≥₹5 Cr</p>
                                <p className="text-green-500">7.5</p>
                            </div>
                            <div className="p-2 rounded bg-yellow-500/10 text-center">
                                <p className="font-medium">≥₹3 Cr</p>
                                <p className="text-yellow-500">5</p>
                            </div>
                            <div className="p-2 rounded bg-orange-500/10 text-center">
                                <p className="font-medium">≥₹1 Cr</p>
                                <p className="text-orange-500">2.5</p>
                            </div>
                            <div className="p-2 rounded bg-red-500/10 text-center">
                                <p className="font-medium">&lt;₹1 Cr</p>
                                <p className="text-red-500">0</p>
                            </div>
                        </div>
                    </div>

                    {/* Q7: Borrowings */}
                    <div className="border-b border-foreground/10 pb-4">
                        <p className="font-medium text-sm mb-2">Q7: Enter your company&apos;s short-term and long-term borrowings.</p>
                        <p className="text-xs text-foreground/60 mb-3">Max: 5 points (lower is better)</p>
                        <div className="grid grid-cols-5 gap-2 text-xs">
                            <div className="p-2 rounded bg-green-500/10 text-center">
                                <p className="font-medium">₹0</p>
                                <p className="text-green-500 font-bold">5</p>
                            </div>
                            <div className="p-2 rounded bg-green-500/10 text-center">
                                <p className="font-medium">&lt;₹1 Cr</p>
                                <p className="text-green-500">3.75</p>
                            </div>
                            <div className="p-2 rounded bg-yellow-500/10 text-center">
                                <p className="font-medium">&lt;₹5 Cr</p>
                                <p className="text-yellow-500">2.5</p>
                            </div>
                            <div className="p-2 rounded bg-orange-500/10 text-center">
                                <p className="font-medium">&lt;₹10 Cr</p>
                                <p className="text-orange-500">1.25</p>
                            </div>
                            <div className="p-2 rounded bg-red-500/10 text-center">
                                <p className="font-medium">≥₹10 Cr</p>
                                <p className="text-red-500">0</p>
                            </div>
                        </div>
                    </div>

                    {/* Q8: Debt/Equity Ratio */}
                    <div className="border-b border-foreground/10 pb-4">
                        <p className="font-medium text-sm mb-2">Q8: Enter your company&apos;s Debt–Equity Ratio.</p>
                        <p className="text-xs text-foreground/60 mb-3">Max: 7.5 points (lower is better)</p>
                        <div className="grid grid-cols-5 gap-2 text-xs">
                            <div className="p-2 rounded bg-green-500/10 text-center">
                                <p className="font-medium">&lt;0.5</p>
                                <p className="text-green-500 font-bold">7.5</p>
                            </div>
                            <div className="p-2 rounded bg-green-500/10 text-center">
                                <p className="font-medium">&lt;1.0</p>
                                <p className="text-green-500">5.625</p>
                            </div>
                            <div className="p-2 rounded bg-yellow-500/10 text-center">
                                <p className="font-medium">&lt;1.5</p>
                                <p className="text-yellow-500">3.75</p>
                            </div>
                            <div className="p-2 rounded bg-orange-500/10 text-center">
                                <p className="font-medium">&lt;2.0</p>
                                <p className="text-orange-500">1.875</p>
                            </div>
                            <div className="p-2 rounded bg-red-500/10 text-center">
                                <p className="font-medium">≥2.0</p>
                                <p className="text-red-500">0</p>
                            </div>
                        </div>
                    </div>

                    {/* Q9: Turnover */}
                    <div className="border-b border-foreground/10 pb-4">
                        <p className="font-medium text-sm mb-2">Q9: Enter your company&apos;s turnover for the last 3 years.</p>
                        <p className="text-xs text-foreground/60 mb-3">Max: 7.5 points</p>
                        <div className="p-3 rounded bg-foreground/5 text-sm">
                            <p className="text-foreground/70">Scoring is based on:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-foreground/60">
                                <li>All 3 years with positive turnover</li>
                                <li>Year-over-year growth trend</li>
                                <li>Consistency of revenue</li>
                            </ul>
                        </div>
                    </div>

                    {/* Q10: EBITDA */}
                    <div className="border-b border-foreground/10 pb-4">
                        <p className="font-medium text-sm mb-2">Q10: Enter your company&apos;s EBITDA for the last 3 years.</p>
                        <p className="text-xs text-foreground/60 mb-3">Max: 7.5 points</p>
                        <div className="p-3 rounded bg-foreground/5 text-sm">
                            <p className="text-foreground/70">Scoring is based on:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-foreground/60">
                                <li>All 3 years with positive EBITDA</li>
                                <li>Year-over-year EBITDA growth</li>
                                <li>Profitability consistency</li>
                            </ul>
                        </div>
                    </div>

                    {/* Q11: EPS */}
                    <div>
                        <p className="font-medium text-sm mb-2">Q11: Enter your company&apos;s Earnings Per Share (EPS).</p>
                        <p className="text-xs text-foreground/60 mb-3">Max: 5 points</p>
                        <div className="grid grid-cols-5 gap-2 text-xs">
                            <div className="p-2 rounded bg-green-500/10 text-center">
                                <p className="font-medium">≥₹10</p>
                                <p className="text-green-500 font-bold">5</p>
                            </div>
                            <div className="p-2 rounded bg-green-500/10 text-center">
                                <p className="font-medium">≥₹5</p>
                                <p className="text-green-500">3.75</p>
                            </div>
                            <div className="p-2 rounded bg-yellow-500/10 text-center">
                                <p className="font-medium">≥₹2</p>
                                <p className="text-yellow-500">2.5</p>
                            </div>
                            <div className="p-2 rounded bg-orange-500/10 text-center">
                                <p className="font-medium">≥₹0</p>
                                <p className="text-orange-500">1.25</p>
                            </div>
                            <div className="p-2 rounded bg-red-500/10 text-center">
                                <p className="font-medium">&lt;₹0</p>
                                <p className="text-red-500">0</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Example Calculation */}
            <div className="glass rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Example Calculation
                </h2>

                <div className="p-4 rounded-lg bg-foreground/5 text-sm space-y-2">
                    <p><strong>Company XYZ Assessment:</strong></p>
                    <ul className="space-y-1 text-foreground/70">
                        <li>• Q1 Investment Plan: Yes → <span className="text-green-500">5 pts</span></li>
                        <li>• Q2 Governance (3/4 yes): → <span className="text-green-500">7.5 pts</span></li>
                        <li>• Q3 Team (4/4 yes): → <span className="text-green-500">10 pts</span></li>
                        <li>• Q4 Paid-up Capital (₹8 Cr): → <span className="text-green-500">7.5 pts</span></li>
                        <li>• Q5 Outstanding Shares (75L): → <span className="text-green-500">3.75 pts</span></li>
                        <li>• Q6 Net Worth (₹12 Cr): → <span className="text-green-500">10 pts</span></li>
                        <li>• Q7 Borrowings (₹3 Cr): → <span className="text-yellow-500">2.5 pts</span></li>
                        <li>• Q8 D/E Ratio (0.8): → <span className="text-green-500">5.625 pts</span></li>
                        <li>• Q9 Turnover (positive trend): → <span className="text-green-500">7.5 pts</span></li>
                        <li>• Q10 EBITDA (positive trend): → <span className="text-green-500">7.5 pts</span></li>
                        <li>• Q11 EPS (₹8): → <span className="text-green-500">3.75 pts</span></li>
                    </ul>
                    <div className="border-t border-foreground/10 pt-2 mt-3">
                        <p><strong>Total:</strong> 71.125 / {MAX_POSSIBLE_SCORE} = <span className="text-green-500 font-bold">86.2%</span> → <span className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded text-xs font-medium">IPO Ready</span></p>
                    </div>
                </div>
            </div>
        </div>
    )
}
