"use client";
import { useState, useEffect, CSSProperties, useRef } from "react";

// ─── Lead Data Type ───────────────────────────────────────────────────────────
interface LeadData {
  companyName: string;
  contactPerson: string;
  cin: string;
  assessment: {
    totalScore: number | null;
    percentage: number | null;
    rating: string | null;
    q9TurnoverYear1: number | null;
    q9TurnoverYear2: number | null;
    q9TurnoverYear3: number | null;
    q10EbitdaYear1: number | null;
    q10EbitdaYear2: number | null;
    q10EbitdaYear3: number | null;
    q4PaidUpCapital: number | null;
    q6NetWorth: number | null;
    q7Borrowings: number | null;
    q8DebtEquityRatio: number | null;
    q11Eps: number | null;
    hasInvestmentPlan: boolean | null;
    q2aGovernancePlan: boolean | null;
    q2bFinancialReporting: boolean | null;
    q2cControlSystems: boolean | null;
    q2dShareholdingClear: boolean | null;
    q3aSeniorManagement: boolean | null;
    q3bIndependentBoard: boolean | null;
    q3cMidManagement: boolean | null;
    q3dKeyPersonnel: boolean | null;
  } | null;
  documents: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    uploadedAt: Date;
  }>;
  assignedAssessor: {
    id: string;
    name: string;
    email: string;
  } | null;
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Theme {
  id: string;
  bg: string;
  bgCard: string;
  bgHover: string;
  accent: string;
  accentSoft: string;
  accentBorder: string;
  text: string;
  textMuted: string;
  textDim: string;
  sidebar: string;
  badge: string;
  success: string;
  warning: string;
  danger: string;
  gradient: string;
}

interface ChecklistItem {
  id: number;
  label: string;
  done: boolean;
  category: string;
}

interface Financial {
  year: string;
  revenue: string;
  profit: string;
  ebitda: string;
}

interface TimelineItem {
  label: string;
  date: string;
  done: boolean;
  active: boolean;
}

interface Message {
  from: string;
  text: string;
  time: string;
  mine: boolean;
}

// ─── Theme Definitions ────────────────────────────────────────────────────────
const LIGHT_BASE = {
  bg: "#f5f6fa",
  bgCard: "#ffffff",
  bgHover: "#f0f2f8",
  text: "#111827",
  textMuted: "#6b7280",
  // textDim: "#9ca3af",
  accentBorder: "#e2e8f0",
  success: "#16a34a",
  warning: "#d97706",
  danger: "#dc2626",
};
const themes: Record<string, Theme> = {
  "Navy Pro": {
    id: "navy",
    ...LIGHT_BASE,
    accent: "#2563eb",
    accentSoft: "#1d4ed820",
    accentBorder: "#2563eb40",
    // text: "#111827",
    // textMuted: "#7a9cc4",
    textDim: "#3d6190",
    sidebar: "#1e293b",
    badge: "#1d4ed8",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    gradient: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
  },
  "Midnight Slate": {
    id: "slate",
    ...LIGHT_BASE,
    accent: "#818cf8",
    accentSoft: "#818cf820",
    accentBorder: "#818cf840",
    // text: "#e2e8f0",
    // textMuted: "#94a3b8",
    textDim: "#475569",
    sidebar: "#0b0d14",
    badge: "#6366f1",
    success: "#34d399",
    warning: "#fbbf24",
    danger: "#f87171",
    gradient: "linear-gradient(135deg, #818cf8 0%, #6366f1 100%)",
  },
  "Emerald Dark": {
    id: "emerald",
    ...LIGHT_BASE,
    accent: "#10b981",
    accentSoft: "#10b98120",
    accentBorder: "#10b98140",
    // text: "#d1fae5",
    // textMuted: "#6ee7b7",
    textDim: "#2d6a4f",
    sidebar: "#050f0b",
    badge: "#059669",
    success: "#34d399",
    warning: "#fbbf24",
    danger: "#f87171",
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  },
  "Rose Gold": {
    id: "rose",
    ...LIGHT_BASE,
    accent: "#fb7185",
    accentSoft: "#fb718520",
    accentBorder: "#fb718540",
    // text: "#ffe4e6",
    // textMuted: "#fda4af",
    textDim: "#9f1239",
    sidebar: "#110508",
    badge: "#e11d48",
    success: "#34d399",
    warning: "#fbbf24",
    danger: "#f87171",
    gradient: "linear-gradient(135deg, #fb7185 0%, #e11d48 100%)",
  },
  "Arctic Light": {
    id: "arctic",
    ...LIGHT_BASE,
    accent: "#0369a1",
    accentSoft: "#0369a115",
    accentBorder: "#0369a130",
    // text: "#0f172a",
    // textMuted: "#475569",
    textDim: "#94a3b8",
    sidebar: "#ffffff",
    badge: "#0369a1",
    success: "#059669",
    warning: "#d97706",
    danger: "#dc2626",
    gradient: "linear-gradient(135deg, #0369a1 0%, #0284c7 100%)",
  },
  "Warm Ivory": {
    id: "ivory",
    ...LIGHT_BASE,
    accent: "#b45309",
    accentSoft: "#b4530915",
    accentBorder: "#b4530930",
    // text: "#1c1917",
    // textMuted: "#78716c",
    textDim: "#a8a29e",
    sidebar: "#ffffff",
    badge: "#b45309",
    success: "#15803d",
    warning: "#d97706",
    danger: "#dc2626",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)",
  },
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({
  d,
  size = 20,
  stroke = 1.5,
}: {
  d: string | string[];
  size?: number;
  stroke?: number;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {Array.isArray(d) ? (
      d.map((path, i) => <path key={i} d={path} />)
    ) : (
      <path d={d} />
    )}
  </svg>
);

const icons: Record<string, string | string[]> = {
  home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  checklist: [
    "M9 11l3 3L22 4",
    "M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  ],
  report: [
    "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
    "M14 2v6h6",
    "M16 13H8",
    "M16 17H8",
    "M10 9H8",
  ],
  docs: [
    "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z",
  ],
  chat: ["M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"],
  timeline: [
    "M12 2v20",
    "M2 12h20",
    "M12 2a10 10 0 0 1 10 10",
    "M12 2a10 10 0 0 0-10 10",
  ],
  advisors: [
    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2",
    "M23 21v-2a4 4 0 0 0-3-3.87",
    "M16 3.13a4 4 0 0 1 0 7.75",
    "M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  ],
  chevronLeft: "M15 18l-6-6 6-6",
  chevronRight: "M9 18l6-6-6-6",
  download: [
    "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",
    "M7 10l5 5 5-5",
    "M12 15V3",
  ],
  palette:
    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 8 6.5 8 8 8.67 8 9.5 7.33 11 6.5 11zm3-4C8.67 7 8 6.33 8 5.5S8.67 4 9.5 4s1.5.67 1.5 1.5S10.33 7 9.5 7zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4s1.5.67 1.5 1.5S15.33 7 14.5 7zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 8 17.5 8s1.5.67 1.5 1.5S18.33 11 17.5 11z",
  check: "M20 6L9 17l-5-5",
  trending: ["M23 6l-9.5 9.5-5-5L1 18", "M17 6h6v6"],
  alert: [
    "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z",
    "M12 9v4",
    "M12 17h.01",
  ],
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  upload: [
    "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",
    "M17 8l-5-5-5 5",
    "M12 3v12",
  ],
  send: ["M22 2L11 13", "M22 2L15 22 11 13 2 9l20-7z"],
  file: [
    "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
    "M14 2v6h6",
  ],
};

const navItems = [
  { id: "overview", label: "Overview", icon: "home" },
  { id: "checklist", label: "IPO Checklist", icon: "checklist" },
  { id: "report", label: "Report", icon: "report" },
  { id: "documents", label: "Documents", icon: "docs" },
  { id: "chat", label: "Chat", icon: "chat" },
  { id: "timeline", label: "Timeline", icon: "timeline" },
  { id: "advisors", label: "Advisors", icon: "advisors" },
];

// ─── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({
  score,
  accent,
  size = 140,
}: {
  score: number;
  accent: string;
  size?: number;
}) {
  const r = 52,
    c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        opacity="0.1"
      />
      <circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        stroke={accent}
        strokeWidth="8"
        strokeDasharray={`${dash} ${c}`}
        strokeLinecap="round"
        transform="rotate(-90 60 60)"
        style={{
          transition: "stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)",
        }}
      />
      <text
        x="60"
        y="55"
        textAnchor="middle"
        fontSize="22"
        fontWeight="700"
        fill={accent}
      >
        {score}
      </text>
      <text
        x="60"
        y="72"
        textAnchor="middle"
        fontSize="10"
        fill="currentColor"
        opacity="0.5"
      >
        / 100
      </text>
    </svg>
  );
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────
function BarChart({ data, accent }: { data: Financial[]; accent: string }) {
  const values = data
    .map((d) => parseFloat(d.revenue))
    .filter((v) => !isNaN(v));
  const max = values.length > 0 ? Math.max(...values) : 1;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 16,
        height: 100,
        padding: "0 4px",
      }}
    >
      {data.map((d, i) => {
        const h = max > 0 ? (parseFloat(d.revenue) / max) * 80 : 0;
        return (
          <div
            key={i}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <div style={{ fontSize: 10, opacity: 0.6 }}>₹{d.revenue} Cr</div>
            <div
              style={{
                width: "100%",
                height: h || 4,
                borderRadius: 6,
                background: accent,
                opacity: 0.7 + i * 0.15,
                transition: `height 0.8s cubic-bezier(0.4,0,0.2,1) ${i * 0.1}s`,
              }}
            />
            <div style={{ fontSize: 10, opacity: 0.5 }}>{d.year}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Helper: format file size ─────────────────────────────────────────────────
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Theme Picker Component ───────────────────────────────────────────────────
function ThemePicker({
  t,
  themeKey,
  onSelect,
  onClose,
}: {
  t: Theme;
  themeKey: string;
  onSelect: (key: string) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Use capture phase so we get the event before anything else
    document.addEventListener("mousedown", handler, true);
    return () => document.removeEventListener("mousedown", handler, true);
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        right: 0,
        top: 44,
        zIndex: 200,
        background: t.bgCard,
        border: `1px solid ${t.accentBorder}`,
        borderRadius: 14,
        padding: 14,
        width: 220,
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: t.textDim,
          marginBottom: 10,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        Choose Theme
      </div>
      {Object.entries(themes).map(([key, theme]) => (
        <button
          key={key}
          onClick={() => {
            onSelect(key);
            onClose();
          }}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 10px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            background: themeKey === key ? t.accentSoft : "transparent",
            color: t.text,
            marginBottom: 4,
            transition: "background 0.15s",
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 6,
              background: theme.gradient,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 12,
              fontWeight: themeKey === key ? 600 : 400,
            }}
          >
            {key}
          </span>
          {themeKey === key && (
            <span style={{ marginLeft: "auto" }}>
              <Icon d={icons.check} size={13} />
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function ClientDashboard({ lead }: { lead: LeadData }) {
  const [activeNav, setActiveNav] = useState("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [themeKey, setThemeKey] = useState("Navy Pro");
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    lead.assignedAssessor
      ? {
          from: lead.assignedAssessor.name,
          text: "Welcome to your IPO Readiness Portal! Feel free to reach out with any questions.",
          time: "Today",
          mine: false,
        }
      : {
          from: "IRA Team",
          text: "Welcome to your IPO Readiness Portal!",
          time: "Today",
          mine: false,
        },
  ]);
  const [mounted, setMounted] = useState(false);

  const t: Theme = themes[themeKey];
  const a = lead.assessment;

  useEffect(() => {
    setMounted(true);
  }, []);

  // ─── Derived Real Data ────────────────────────────────────────────────────

  const score = a?.percentage ? Math.round(a.percentage) : 0;
  const ratingLabel = a?.rating ? a.rating.replace(/_/g, " ") : "Not Rated";

  const financials: Financial[] = [
    {
      year: "Year 3",
      revenue: a?.q9TurnoverYear3?.toFixed(1) ?? "0",
      profit: "N/A",
      ebitda: a?.q10EbitdaYear3 ? `₹${a.q10EbitdaYear3.toFixed(1)} Cr` : "N/A",
    },
    {
      year: "Year 2",
      revenue: a?.q9TurnoverYear2?.toFixed(1) ?? "0",
      profit: "N/A",
      ebitda: a?.q10EbitdaYear2 ? `₹${a.q10EbitdaYear2.toFixed(1)} Cr` : "N/A",
    },
    {
      year: "Year 1 (Latest)",
      revenue: a?.q9TurnoverYear1?.toFixed(1) ?? "0",
      profit: "N/A",
      ebitda: a?.q10EbitdaYear1 ? `₹${a.q10EbitdaYear1.toFixed(1)} Cr` : "N/A",
    },
  ];

  const latestRevenue = a?.q9TurnoverYear1
    ? `₹${a.q9TurnoverYear1.toFixed(1)} Cr`
    : "N/A";

  const revenueGrowth =
    a?.q9TurnoverYear1 && a?.q9TurnoverYear2 && a.q9TurnoverYear2 > 0
      ? `+${(((a.q9TurnoverYear1 - a.q9TurnoverYear2) / a.q9TurnoverYear2) * 100).toFixed(0)}% YoY`
      : "Latest year";

  const checklist: ChecklistItem[] = [
    {
      id: 1,
      label: "Investment Plan Ready",
      done: a?.hasInvestmentPlan === true,
      category: "Planning",
    },
    {
      id: 2,
      label: "Corporate Governance Plan in Place",
      done: a?.q2aGovernancePlan === true,
      category: "Governance",
    },
    {
      id: 3,
      label: "Financial Reporting Compliance",
      done: a?.q2bFinancialReporting === true,
      category: "Governance",
    },
    {
      id: 4,
      label: "Robust Control Systems",
      done: a?.q2cControlSystems === true,
      category: "Governance",
    },
    {
      id: 5,
      label: "Clear & Transparent Shareholding",
      done: a?.q2dShareholdingClear === true,
      category: "Governance",
    },
    {
      id: 6,
      label: "Professional Senior Management Team",
      done: a?.q3aSeniorManagement === true,
      category: "Team",
    },
    {
      id: 7,
      label: "Credible Independent Board Members",
      done: a?.q3bIndependentBoard === true,
      category: "Team",
    },
    {
      id: 8,
      label: "Experienced Mid-Management Staff",
      done: a?.q3cMidManagement === true,
      category: "Team",
    },
    {
      id: 9,
      label: "Key Personnel Recognized",
      done: a?.q3dKeyPersonnel === true,
      category: "Team",
    },
    {
      id: 10,
      label: "Financial Data Submitted (Q4–Q11)",
      done: !!(a?.q4PaidUpCapital && a?.q9TurnoverYear1),
      category: "Financial",
    },
  ];

  const checklistDone = checklist.filter((c) => c.done).length;

  const timeline: TimelineItem[] = [
    {
      label: "Assessment Complete",
      date: "Completed",
      done: true,
      active: false,
    },
    { label: "Payment Received", date: "Completed", done: true, active: false },
    {
      label: "Portal Access Granted",
      date: "Active",
      done: false,
      active: true,
    },
    { label: "DRHP Preparation", date: "Upcoming", done: false, active: false },
    { label: "SEBI Review", date: "Upcoming", done: false, active: false },
    { label: "IPO Listing", date: "Upcoming", done: false, active: false },
  ];

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages((prev) => [
      ...prev,
      { from: "You", text: chatInput, time: "Now", mine: true },
    ]);
    setChatInput("");
  };

  const card: CSSProperties = {
    background: t.bgCard,
    border: `1px solid ${t.accentBorder}`,
    borderRadius: 16,
    padding: 24,
    transition: "all 0.3s ease",
  };

  const statCard = (
    label: string,
    value: string,
    sub: string,
    color: string,
  ) => (
    <div style={{ ...card, flex: 1, minWidth: 140 }}>
      <div
        style={{
          fontSize: 12,
          color: t.textMuted,
          marginBottom: 8,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 700,
          color,
          fontFamily: "'Playfair Display', Georgia, serif",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 12, color: t.textDim, marginTop: 4 }}>{sub}</div>
    </div>
  );

  // ── Overview ──────────────────────────────────────────────────────────────
  const renderOverview = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div
        style={{
          ...card,
          background: `linear-gradient(135deg, ${t.bgHover} 0%, ${t.bgCard} 100%)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: t.accent,
            opacity: 0.05,
          }}
        />
        <div
          style={{
            fontSize: 12,
            color: t.textMuted,
            marginBottom: 6,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Welcome back
        </div>
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: t.badge,
            fontFamily: "'Playfair Display', Georgia, serif",
          }}
        >
          {lead.contactPerson}
        </div>
        <div style={{ fontSize: 14, color: t.textMuted, marginTop: 4 }}>
          {lead.companyName}
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginTop: 14,
            padding: "6px 14px",
            borderRadius: 20,
            background: t.accentSoft,
            border: `1px solid ${t.accentBorder}`,
            fontSize: 12,
            color: t.accent,
            fontWeight: 600,
          }}
        >
          <Icon d={icons.star} size={13} /> {ratingLabel}
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {statCard("Assessment Score", `${score}%`, ratingLabel, t.accent)}
        {statCard(
          "Checklist",
          `${checklistDone}/${checklist.length}`,
          "Items completed",
          t.success,
        )}
        {statCard("Revenue (Latest)", latestRevenue, revenueGrowth, t.warning)}
        {statCard(
          "EBITDA (Latest)",
          a?.q10EbitdaYear1 ? `₹${a.q10EbitdaYear1.toFixed(1)} Cr` : "N/A",
          "Latest year",
          t.text,
        )}
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div
          style={{
            ...card,
            flex: 1,
            minWidth: 220,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: t.textMuted,
              alignSelf: "flex-start",
            }}
          >
            IPO Readiness Score
          </div>
          <ScoreRing score={score} accent={t.accent} />
          <div
            style={{ fontSize: 12, color: t.textMuted, textAlign: "center" }}
          >
            {a?.totalScore?.toFixed(1) ?? "0"} / {a ? "100" : "100"} points
          </div>
        </div>
        <div style={{ ...card, flex: 2, minWidth: 240 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: t.textMuted,
              marginBottom: 16,
            }}
          >
            Revenue Trend (₹ Cr)
          </div>
          {financials.some((f) => parseFloat(f.revenue) > 0) ? (
            <BarChart data={financials} accent={t.accent} />
          ) : (
            <div
              style={{
                fontSize: 13,
                color: t.textDim,
                textAlign: "center",
                padding: 20,
              }}
            >
              No financial data available
            </div>
          )}
          <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
            {financials.map((f, i) => (
              <div key={i} style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: t.textDim }}>{f.year}</div>
                <div style={{ fontSize: 12, color: t.accent }}>
                  EBITDA: {f.ebitda}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={card}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: t.textMuted,
            marginBottom: 14,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Icon d={icons.alert} size={15} /> Action Required
        </div>
        {checklist.filter((c) => !c.done).length === 0 ? (
          <div
            style={{
              fontSize: 13,
              color: t.success,
              padding: "10px 14px",
              borderRadius: 10,
              background: `${t.success}15`,
              border: `1px solid ${t.success}30`,
            }}
          >
            ✓ All checklist items completed!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {checklist
              .filter((c) => !c.done)
              .map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: t.bgHover,
                    border: `1px solid ${t.accentBorder}`,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: t.warning,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: 13, color: t.text, flex: 1 }}>
                    {item.label}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: t.textDim,
                      padding: "2px 8px",
                      borderRadius: 6,
                      background: t.accentSoft,
                    }}
                  >
                    {item.category}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>

      {a && (
        <div style={card}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: t.textMuted,
              marginBottom: 14,
            }}
          >
            Financial Summary
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            {[
              {
                label: "Paid-up Capital",
                value: a.q4PaidUpCapital
                  ? `₹${a.q4PaidUpCapital.toFixed(2)} Cr`
                  : "N/A",
              },
              {
                label: "Net Worth",
                value: a.q6NetWorth ? `₹${a.q6NetWorth.toFixed(2)} Cr` : "N/A",
              },
              {
                label: "Borrowings",
                value: a.q7Borrowings
                  ? `₹${a.q7Borrowings.toFixed(2)} Cr`
                  : "N/A",
              },
              {
                label: "Debt-Equity Ratio",
                value: a.q8DebtEquityRatio
                  ? `${a.q8DebtEquityRatio.toFixed(2)}x`
                  : "N/A",
              },
              {
                label: "EPS",
                value: a.q11Eps ? `₹${a.q11Eps.toFixed(2)}` : "N/A",
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: t.bgHover,
                  border: `1px solid ${t.accentBorder}`,
                }}
              >
                <div
                  style={{ fontSize: 11, color: t.textDim, marginBottom: 4 }}
                >
                  {item.label}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: t.text }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ── Checklist ─────────────────────────────────────────────────────────────
  const renderChecklist = () => {
    const categories = [...new Set(checklist.map((c) => c.category))];
    return (
      <div style={card}>
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: t.text,
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            IPO Readiness Checklist
          </div>
          <div style={{ fontSize: 13, color: t.textMuted, marginTop: 4 }}>
            {checklistDone} of {checklist.length} items completed
          </div>
          <div
            style={{
              marginTop: 12,
              height: 6,
              borderRadius: 3,
              background: t.bgHover,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: 3,
                background: t.gradient,
                width: `${(checklistDone / checklist.length) * 100}%`,
                transition: "width 1s ease",
              }}
            />
          </div>
        </div>
        {categories.map((cat) => (
          <div key={cat} style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: t.accent,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              {cat}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {checklist
                .filter((c) => c.category === cat)
                .map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "12px 16px",
                      borderRadius: 10,
                      background: item.done ? t.accentSoft : t.bgHover,
                      border: `1px solid ${item.done ? t.accentBorder : "transparent"}`,
                      transition: "all 0.2s",
                    }}
                  >
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 6,
                        flexShrink: 0,
                        background: item.done ? t.accent : "transparent",
                        border: `2px solid ${item.done ? t.accent : t.textDim}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: item.done ? "#fff" : "transparent",
                      }}
                    >
                      {item.done && (
                        <Icon d={icons.check} size={12} stroke={2.5} />
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: 13,
                        color: item.done ? t.text : t.textMuted,
                      }}
                    >
                      {item.label}
                    </span>
                    {!item.done && (
                      <span
                        style={{
                          marginLeft: "auto",
                          fontSize: 11,
                          color: t.warning,
                          padding: "2px 8px",
                          borderRadius: 6,
                          background: `${t.warning}20`,
                        }}
                      >
                        Pending
                      </span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ── Report ────────────────────────────────────────────────────────────────
  const renderReport = () => (
    <div style={card}>
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: t.text,
          fontFamily: "'Playfair Display', Georgia, serif",
          marginBottom: 6,
        }}
      >
        Assessment Report
      </div>
      <div style={{ fontSize: 13, color: t.textMuted, marginBottom: 20 }}>
        IPO Readiness Score: {score}/100
      </div>
      <div
        style={{
          padding: 24,
          borderRadius: 12,
          background: t.bgHover,
          border: `2px dashed ${t.accentBorder}`,
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        <Icon d={icons.report} size={40} />
        <div
          style={{
            marginTop: 12,
            fontSize: 16,
            fontWeight: 600,
            color: t.text,
          }}
        >
          IPO Readiness Assessment Report
        </div>
        <div style={{ fontSize: 13, color: t.textMuted, marginTop: 4 }}>
          {lead.companyName} • Score: {score}/100
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 13,
            color: t.accent,
            fontWeight: 600,
          }}
        >
          {ratingLabel}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {[
          {
            label: "Investment & Planning",
            score: a?.hasInvestmentPlan ? 100 : 0,
          },
          {
            label: "Corporate Governance",
            score: a
              ? Math.round(
                  ([
                    a.q2aGovernancePlan,
                    a.q2bFinancialReporting,
                    a.q2cControlSystems,
                    a.q2dShareholdingClear,
                  ].filter(Boolean).length /
                    4) *
                    100,
                )
              : 0,
          },
          {
            label: "Team Readiness",
            score: a
              ? Math.round(
                  ([
                    a.q3aSeniorManagement,
                    a.q3bIndependentBoard,
                    a.q3cMidManagement,
                    a.q3dKeyPersonnel,
                  ].filter(Boolean).length /
                    4) *
                    100,
                )
              : 0,
          },
          {
            label: "Financial Health",
            score: a?.q9TurnoverYear1
              ? Math.min(100, Math.round((a.q9TurnoverYear1 / 50) * 100))
              : 0,
          },
        ].map((s, i) => {
          const color =
            s.score >= 75 ? t.success : s.score >= 50 ? t.warning : t.danger;
          return (
            <div key={i}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 13, color: t.text }}>{s.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color }}>
                  {s.score}%
                </span>
              </div>
              <div
                style={{ height: 6, borderRadius: 3, background: t.bgHover }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: 3,
                    background: color,
                    width: `${s.score}%`,
                    opacity: 0.85,
                    transition: "width 1s ease",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── Documents ─────────────────────────────────────────────────────────────
  const renderDocuments = () => (
    <div style={card}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: t.text,
            fontFamily: "'Playfair Display', Georgia, serif",
          }}
        >
          Documents
        </div>
        <span style={{ fontSize: 12, color: t.textMuted }}>
          {lead.documents.length} files
        </span>
      </div>

      {lead.documents.length === 0 ? (
        <div
          style={{
            padding: 32,
            borderRadius: 12,
            background: t.bgHover,
            border: `2px dashed ${t.accentBorder}`,
            textAlign: "center",
          }}
        >
          <Icon d={icons.docs} size={32} />
          <div style={{ marginTop: 10, fontSize: 13, color: t.textMuted }}>
            No documents uploaded yet
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {lead.documents.map((doc) => (
            <div
              key={doc.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "12px 16px",
                borderRadius: 10,
                background: t.bgHover,
                border: `1px solid ${t.accentBorder}`,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: t.accentSoft,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: t.accent,
                }}
              >
                <Icon d={icons.file} size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>
                  {doc.fileName}
                </div>
                <div style={{ fontSize: 11, color: t.textDim }}>
                  {formatFileSize(doc.fileSize)} •{" "}
                  {new Date(doc.uploadedAt).toLocaleDateString("en-IN")}
                </div>
              </div>
              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: `1px solid ${t.accentBorder}`,
                  background: "transparent",
                  color: t.accent,
                  fontSize: 12,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  textDecoration: "none",
                }}
              >
                <Icon d={icons.download} size={13} />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ── Chat ──────────────────────────────────────────────────────────────────
  const renderChat = () => (
    <div
      style={{
        ...card,
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 160px)",
        minHeight: 400,
      }}
    >
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: t.text,
          fontFamily: "'Playfair Display', Georgia, serif",
          marginBottom: 4,
        }}
      >
        Chat with Advisors
      </div>
      <div
        style={{
          fontSize: 13,
          color: t.textMuted,
          marginBottom: 20,
          paddingBottom: 16,
          borderBottom: `1px solid ${t.accentBorder}`,
        }}
      >
        {lead.assignedAssessor
          ? `Your advisor: ${lead.assignedAssessor.name}`
          : "Direct line to your IPO advisory team"}
      </div>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          paddingBottom: 16,
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: msg.mine ? "flex-end" : "flex-start",
              gap: 10,
            }}
          >
            {!msg.mine && (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: t.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {msg.from
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
            )}
            <div
              style={{
                maxWidth: "70%",
                padding: "10px 14px",
                borderRadius: 14,
                background: msg.mine ? t.accent : t.bgHover,
                border: `1px solid ${msg.mine ? t.accent : t.accentBorder}`,
                borderBottomRightRadius: msg.mine ? 4 : 14,
                borderBottomLeftRadius: msg.mine ? 14 : 4,
              }}
            >
              {!msg.mine && (
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: t.accent,
                    marginBottom: 4,
                  }}
                >
                  {msg.from}
                </div>
              )}
              <div
                style={{
                  fontSize: 13,
                  color: msg.mine ? "#fff" : t.text,
                  lineHeight: 1.5,
                }}
              >
                {msg.text}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: msg.mine ? "rgba(255,255,255,0.6)" : t.textDim,
                  marginTop: 4,
                  textAlign: "right",
                }}
              >
                {msg.time}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          gap: 10,
          paddingTop: 16,
          borderTop: `1px solid ${t.accentBorder}`,
        }}
      >
        <input
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "10px 16px",
            borderRadius: 10,
            background: t.bgHover,
            border: `1px solid ${t.accentBorder}`,
            color: t.text,
            fontSize: 13,
            outline: "none",
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            background: t.gradient,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Icon d={icons.send} size={15} />
        </button>
      </div>
    </div>
  );

  // ── Timeline ──────────────────────────────────────────────────────────────
  const renderTimeline = () => (
    <div style={card}>
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: t.text,
          fontFamily: "'Playfair Display', Georgia, serif",
          marginBottom: 24,
        }}
      >
        IPO Journey Timeline
      </div>
      <div style={{ position: "relative", paddingLeft: 32 }}>
        <div
          style={{
            position: "absolute",
            left: 10,
            top: 0,
            bottom: 0,
            width: 2,
            background: t.accentBorder,
          }}
        />
        {timeline.map((item, i) => (
          <div key={i} style={{ position: "relative", marginBottom: 32 }}>
            <div
              style={{
                position: "absolute",
                left: -27,
                top: 2,
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: item.done
                  ? t.success
                  : item.active
                    ? t.accent
                    : t.bgHover,
                border: `3px solid ${item.done ? t.success : item.active ? t.accent : t.textDim}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s",
              }}
            >
              {item.done && <Icon d={icons.check} size={9} stroke={3} />}
              {item.active && (
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#fff",
                  }}
                />
              )}
            </div>
            <div
              style={{
                padding: "14px 18px",
                borderRadius: 12,
                background: item.active ? t.accentSoft : t.bgHover,
                border: `1px solid ${item.active ? t.accentBorder : "transparent"}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: item.done
                      ? t.success
                      : item.active
                        ? t.accent
                        : t.text,
                  }}
                >
                  {item.label}
                </span>
                <span style={{ fontSize: 12, color: t.textDim }}>
                  {item.date}
                </span>
              </div>
              {item.active && (
                <div style={{ fontSize: 12, color: t.textMuted, marginTop: 4 }}>
                  ← Currently here · You have portal access
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Advisors ──────────────────────────────────────────────────────────────
  const renderAdvisors = () => (
    <div style={card}>
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: t.text,
          fontFamily: "'Playfair Display', Georgia, serif",
          marginBottom: 20,
        }}
      >
        Your Advisory Team
      </div>
      {lead.assignedAssessor ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "16px 18px",
              borderRadius: 12,
              background: t.bgHover,
              border: `1px solid ${t.accentBorder}`,
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: "50%",
                background: t.gradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
                fontWeight: 700,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {lead.assignedAssessor.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>
                {lead.assignedAssessor.name}
              </div>
              <div style={{ fontSize: 12, color: t.accent }}>Lead Assessor</div>
              <div style={{ fontSize: 12, color: t.textDim }}>
                {lead.assignedAssessor.email}
              </div>
            </div>
            <a
              href={`mailto:${lead.assignedAssessor.email}`}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: `1px solid ${t.accentBorder}`,
                background: t.accentSoft,
                color: t.accent,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                textDecoration: "none",
              }}
            >
              Email
            </a>
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: 24,
            borderRadius: 12,
            background: t.bgHover,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 13, color: t.textMuted }}>
            No advisor assigned yet. Please contact support.
          </div>
        </div>
      )}
    </div>
  );

  const sections: Record<string, () => React.ReactElement> = {
    overview: renderOverview,
    checklist: renderChecklist,
    report: renderReport,
    documents: renderDocuments,
    chat: renderChat,
    timeline: renderTimeline,
    advisors: renderAdvisors,
  };

  if (!mounted) return null;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: t.bg,
        color: t.text,
        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
        transition: "background 0.4s ease, color 0.4s ease",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${t.textDim}; border-radius: 2px; }
        input::placeholder { color: ${t.textDim}; }
      `}</style>

      {/* Sidebar */}
      <div
        style={{
          width: collapsed ? 64 : 220,
          background: t.sidebar,
          borderRight: `1px solid ${t.accentBorder}`,
          display: "flex",
          flexDirection: "column",
          transition: "width 0.35s cubic-bezier(0.4,0,0.2,1)",
          flexShrink: 0,
          position: "relative",
          /* FIX: lower z-index so theme picker dropdown (z:200) appears above */
          zIndex: 5,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: collapsed ? "20px 16px" : "24px 20px",
            borderBottom: `1px solid ${t.accentBorder}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: t.gradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon d={icons.trending} size={16} stroke={2} />
            </div>
            {!collapsed && (
              <div style={{ overflow: "hidden" }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: t.bg,
                    whiteSpace: "nowrap",
                  }}
                >
                  IPO Ready
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: t.textMuted,
                    whiteSpace: "nowrap",
                  }}
                >
                  Client Portal
                </div>
              </div>
            )}
          </div>
        </div>
        <nav style={{ flex: 1, padding: "12px 8px" }}>
          {navItems.map((item) => {
            const active = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                title={collapsed ? item.label : undefined}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  marginBottom: 4,
                  background: active ? t.accentSoft : "transparent",
                  color: active ? t.accent : t.textMuted,
                  justifyContent: collapsed ? "center" : "flex-start",
                  transition: "all 0.2s",
                  position: "relative",
                }}
              >
                <Icon d={icons[item.icon]} size={17} />
                {!collapsed && (
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: active ? 600 : 400,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.label}
                  </span>
                )}
                {active && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "20%",
                      height: "60%",
                      width: 3,
                      borderRadius: 2,
                      background: t.accent,
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* FIX: collapse toggle — moved inside sidebar, no negative right offset */}
        <button
  onClick={() => setCollapsed(!collapsed)}
  style={{
    position: "absolute",
    top: "500px",
    right: "-12px",   // pushes it outside the sidebar
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    border: `1px solid ${t.accent}`,
    background: t.bg,
    color: t.textMuted,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    zIndex: 10
  }}
>
  <Icon
    d={collapsed ? icons.chevronRight : icons.chevronLeft}
    size={14}
  />
</button>
      </div>

      {/* Main */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* Header */}
        <div
          style={{
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            borderBottom: `1px solid ${t.accentBorder}`,
            background: t.bg,
            position: "sticky",
            top: 0,
            /* FIX: header z-index above sidebar but below theme picker */
            zIndex: 100,
          }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: t.text }}>
              {navItems.find((n) => n.id === activeNav)?.label}
            </div>
            <div style={{ fontSize: 11, color: t.textDim }}>
              {lead.companyName}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              position: "relative",
            }}
          >
            {/* Theme button */}
            <button
              onClick={() => setShowThemePicker((prev) => !prev)}
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                border: `1px solid ${t.accentBorder}`,
                background: showThemePicker ? t.accentSoft : t.bgHover,
                color: showThemePicker ? t.accent : t.textMuted,
                fontSize: 12,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.15s",
              }}
            >
              <Icon d={icons.palette} size={14}  /> Theme
            </button>

            {/* Theme picker dropdown — rendered as sibling, uses ref-based outside-click */}
            {showThemePicker && (
              <ThemePicker
                t={t}
                themeKey={themeKey}
                onSelect={(key) => setThemeKey(key)}
                onClose={() => setShowThemePicker(false)}
              />
            )}

            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: t.gradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                color: "#fff",
                cursor: "pointer",
              }}
            >
              {lead.contactPerson
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
          {sections[activeNav] ? sections[activeNav]() : renderOverview()}
        </div>
      </div>
    </div>
  );
}