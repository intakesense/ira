"use client";
import { useState, useEffect, CSSProperties, useRef } from "react";
import { useRouter } from "next/navigation";
import { pusherClient } from "@/lib/pusher";
// ─── Lead Data Type ───────────────────────────────────────────────────────────
interface LeadData {
  leadDbId: string;
  reviewerName: string;
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
    q5OutstandingShares: number | null;
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
    remarks: Record<string, string> | null;
  } | null;
  documents: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
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
  logoText: string;
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
  id: string;
  content: string;
  senderType: string;
  senderName: string;
  createdAt: string | Date;
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
    logoText: "#ffffff",
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
    logoText: "#ffffff",
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
    logoText: "#ffffff",
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
    logoText: "#ffffff",
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
    logoText: "#000000",
    textDim: "#94a3b8",
    sidebar: "#0369a130",
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
    logoText: "#000000",
    textDim: "#a8a29e",
    sidebar: "#b4530930",
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
  type SectionKey =
    | "overview"
    | "checklist"
    | "report"
    | "documents"
    | "chat"
    | "timeline"
    | "advisors";
  const [activeNav, setActiveNav] = useState<SectionKey>("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [themeKey, setThemeKey] = useState("Navy Pro");
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatLoading, setChatLoading] = useState(true);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const t: Theme = themes[themeKey];
  const a = lead.assessment;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch message history
  useEffect(() => {
    fetch(`/api/chat/messages?leadId=${lead.leadDbId}`)
      .then((r) => r.json())
      .then((data) => {
        setMessages(data.messages || []);
        setChatLoading(false);
      })
      .catch(() => setChatLoading(false));
  }, [lead.leadDbId]);

  // Subscribe to Pusher
  useEffect(() => {
    const channel = pusherClient.subscribe(`lead-${lead.leadDbId}`);
    channel.bind("new-message", (data: Message) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === data.id)) return prev;
        const hasTempMatch = prev.find(
          (m) =>
            m.id.startsWith("temp-") &&
            m.content === data.content &&
            m.senderName === data.senderName,
        );
        if (hasTempMatch) {
          return prev.map((m) =>
            m.id.startsWith("temp-") &&
            m.content === data.content &&
            m.senderName === data.senderName
              ? data
              : m,
          );
        }
        return [...prev, data];
      });
    });
    return () => {
      pusherClient.unsubscribe(`lead-${lead.leadDbId}`);
    };
  }, [lead.leadDbId]);

  // Auto scroll
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    const sentContent = chatInput.trim();

    // Optimistically add to UI
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      content: sentContent,
      senderType: "CLIENT",
      senderName: lead.contactPerson,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, tempMessage]);
    setChatInput("");

    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: lead.leadDbId,
          content: sentContent,
          senderType: "CLIENT",
          senderName: lead.contactPerson,
        }),
      });
      const data = await res.json();
      // Replace temp with real message
      setMessages((prev) =>
        prev.map((m) => (m.id === tempMessage.id ? data.message : m)),
      );
    } catch (err) {
      console.error("Send failed:", err);
      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
    }
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

  const downloadReportPDF = () => {
    if (!a) return;
    import("jspdf").then(({ default: jsPDF }) => {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let y = 20;

      const addText = (
        text: string,
        size: number,
        bold = false,
        color: [number, number, number] = [30, 30, 30],
      ) => {
        doc.setFontSize(size);
        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.setTextColor(...color);
        const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
        doc.text(lines, margin, y);
        y += (size * 0.4 + 2) * (lines as string[]).length;
      };

      const addLine = () => {
        doc.setDrawColor(220, 220, 220);
        doc.line(margin, y, pageWidth - margin, y);
        y += 6;
      };

      const checkNewPage = () => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      };

      // Header
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, pageWidth, 40, "F");
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("IPO Readiness Assessment Report", margin, 25);
      y = 55;

      // Company Info
      addText(lead.companyName, 16, true, [37, 99, 235]);
      y += 2;
      addText(`CIN: ${lead.cin}`, 10, false, [100, 100, 100]);
      addText(
        `Prepared for: ${lead.contactPerson}`,
        10,
        false,
        [100, 100, 100],
      );
      addText(
        `Date: ${new Date().toLocaleDateString("en-IN")}`,
        10,
        false,
        [100, 100, 100],
      );
      y += 4;
      addLine();

      // Score Summary
      addText("Assessment Score Summary", 13, true);
      y += 2;
      addText(`Overall Score: ${score}/100`, 11);
      addText(`Rating: ${ratingLabel}`, 11);
      if (a.q9TurnoverYear1)
        addText(`Revenue (Latest): Rs ${a.q9TurnoverYear1.toFixed(1)} Cr`, 11);
      if (a.q10EbitdaYear1)
        addText(`EBITDA (Latest): Rs ${a.q10EbitdaYear1.toFixed(1)} Cr`, 11);
      y += 4;
      addLine();

      // Financial Overview
      addText("Financial Overview", 13, true);
      y += 2;
      if (a.q4PaidUpCapital)
        addText(`Paid-up Capital: Rs ${a.q4PaidUpCapital.toFixed(2)} Cr`, 11);
      if (a.q6NetWorth)
        addText(`Net Worth: Rs ${a.q6NetWorth.toFixed(2)} Cr`, 11);
      if (a.q7Borrowings)
        addText(`Borrowings: Rs ${a.q7Borrowings.toFixed(2)} Cr`, 11);
      if (a.q8DebtEquityRatio)
        addText(`Debt-Equity Ratio: ${a.q8DebtEquityRatio.toFixed(2)}x`, 11);
      if (a.q11Eps) addText(`EPS: Rs ${a.q11Eps.toFixed(2)}`, 11);
      y += 4;
      addLine();

      // Q&A with Remarks
      addText("Assessment Q&A", 13, true);
      y += 4;
      const remarks = (a.remarks as Record<string, string>) || {};
      const questions = [
        {
          id: "hasInvestmentPlan",
          q: "1. Are you ready with your investment plan?",
        },
        {
          id: "q2aGovernancePlan",
          q: "2. Is the corporate governance plan in place with Indian listing norms?",
        },
        {
          id: "q2bFinancialReporting",
          q: "3. Does your financial reporting comply with statutory laws?",
        },
        {
          id: "q2cControlSystems",
          q: "4. Does your company have robust financial and internal control systems?",
        },
        {
          id: "q2dShareholdingClear",
          q: "5. Is your shareholding clear and transparent?",
        },
        {
          id: "q3aSeniorManagement",
          q: "6. Does the company have a professional senior management team?",
        },
        {
          id: "q3bIndependentBoard",
          q: "7. Are there credible independent members on the board?",
        },
        {
          id: "q3cMidManagement",
          q: "8. Is there experienced staff at the mid-management level?",
        },
        {
          id: "q3dKeyPersonnel",
          q: "9. Are key personnel recognized per corporate governance norms?",
        },
        {
          id: "q4PaidUpCapital",
          q: `10. Paid-up Capital: ${a.q4PaidUpCapital ? `Rs ${a.q4PaidUpCapital.toFixed(2)} Cr` : "N/A"}`,
        },
        {
          id: "q5OutstandingShares",
          q: `11. Outstanding Shares: ${a.q5OutstandingShares ?? "N/A"}`,
        },
        {
          id: "q6NetWorth",
          q: `12. Net Worth: ${a.q6NetWorth ? `Rs ${a.q6NetWorth.toFixed(2)} Cr` : "N/A"}`,
        },
        {
          id: "q7Borrowings",
          q: `13. Total Borrowings: ${a.q7Borrowings ? `Rs ${a.q7Borrowings.toFixed(2)} Cr` : "N/A"}`,
        },
        {
          id: "q8DebtEquityRatio",
          q: `14. Debt-Equity Ratio: ${a.q8DebtEquityRatio?.toFixed(2) ?? "N/A"}`,
        },
        {
          id: "q9Turnover",
          q: `15. Turnover (Last 3 Years): Year1: ${a.q9TurnoverYear1 ?? "N/A"} Cr | Year2: ${a.q9TurnoverYear2 ?? "N/A"} Cr | Year3: ${a.q9TurnoverYear3 ?? "N/A"} Cr`,
        },
        {
          id: "q10Turnover",
          q: `16. EBITDA (Last 3 Years): Year1: ${a.q10EbitdaYear1 ?? "N/A"} Cr | Year2: ${a.q10EbitdaYear2 ?? "N/A"} Cr | Year3: ${a.q10EbitdaYear3 ?? "N/A"} Cr`,
        },
        {
          id: "q11Eps",
          q: `17. Earnings Per Share (EPS): ${a.q11Eps ? `Rs ${a.q11Eps.toFixed(2)}` : "N/A"}`,
        },
      ];

      questions.forEach(({ id, q }) => {
        checkNewPage();
        addText(q, 10, true);
        if (remarks[id])
          addText(`Reason: ${remarks[id]}`, 9, false, [80, 80, 80]);
        y += 4;
      });

      addLine();
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(
        "This report is confidential and prepared by IPO Ready Advisory.",
        margin,
        285,
      );

      doc.save(`IPO_Report_${lead.companyName.replace(/\s+/g, "_")}.pdf`);
    });
  };
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
      <button
        onClick={downloadReportPDF}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 20px",
          borderRadius: 10,
          background: t.gradient,
          color: "#fff",
          fontSize: 13,
          fontWeight: 600,
          border: "none",
          cursor: "pointer",
          marginBottom: 20,
        }}
      >
        <Icon d={icons.download} size={15} /> Download PDF Report
      </button>
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
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const allowed = [
      "application/pdf",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (!allowed.includes(file.type)) {
      setUploadError("Only PDF and Excel files are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File too large. Max 10MB.");
      return;
    }
    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("leadId", lead.leadDbId);

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      router.refresh();
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };
  const renderDocuments = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          ...card,
          border: `2px dashed ${dragOver ? t.accent : t.accentBorder}`,
          background: dragOver ? t.accentSoft : t.bgCard,
          transition: "all 0.2s",
          cursor: "pointer",
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleUpload(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.xls,.xlsx"
          style={{ display: "none" }}
          onChange={(e) => handleUpload(e.target.files)}
        />
        <div style={{ textAlign: "center", padding: "8px 0" }}>
          <div style={{ color: t.accent, marginBottom: 8 }}>
            <Icon d={icons.upload} size={32} />
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: t.text,
              marginBottom: 4,
            }}
          >
            {uploading ? "Uploading..." : "Drop file here or click to browse"}
          </div>
          <div style={{ fontSize: 12, color: t.textMuted }}>
            PDF or Excel · Max 10MB
          </div>
          {uploading && (
            <div
              style={{
                marginTop: 12,
                height: 4,
                borderRadius: 2,
                background: t.bgHover,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: "60%",
                  background: t.gradient,
                  borderRadius: 2,
                }}
              />
            </div>
          )}
          {uploadError && (
            <div
              style={{
                marginTop: 10,
                fontSize: 12,
                color: t.danger,
                padding: "6px 12px",
                borderRadius: 8,
                background: `${t.danger}15`,
              }}
            >
              {uploadError}
            </div>
          )}
        </div>
      </div>

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
            Uploaded Documents
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
                    background:
                      doc.fileType === "PDF"
                        ? `${t.danger}20`
                        : `${t.success}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: doc.fileType === "PDF" ? t.danger : t.success,
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  {doc.fileType === "PDF" ? "PDF" : "XLS"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>
                    {doc.fileName}
                  </div>
                  <div style={{ fontSize: 11, color: t.textDim }}>
                    {formatFileSize(doc.fileSize)} ·{" "}
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
                <button
                  onClick={() => handleDelete(doc.id)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    border: `1px solid ${t.danger}40`,
                    background: "transparent",
                    color: t.danger,
                    fontSize: 12,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const handleDelete = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      const res = await fetch("/api/documents/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, leadId: lead.leadDbId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      router.refresh();
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    }
  };

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
          ? `Your advisor: ${lead.reviewerName}`
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
        {chatLoading ? (
          <div
            style={{
              textAlign: "center",
              padding: 32,
              color: t.textMuted,
              fontSize: 13,
            }}
          >
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: 32,
              color: t.textMuted,
              fontSize: 13,
            }}
          >
            No messages yet. Send a message to your advisor!
          </div>
        ) : (
          messages.map((msg) => {
            const isClient = msg.senderType === "CLIENT";
            return (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  justifyContent: isClient ? "flex-end" : "flex-start",
                  gap: 10,
                }}
              >
                {!isClient && (
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
                    {msg.senderName
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </div>
                )}
                <div
                  style={{
                    maxWidth: "70%",
                    padding: "10px 14px",
                    borderRadius: 14,
                    background: isClient ? t.accent : t.bgHover,
                    border: `1px solid ${isClient ? t.accent : t.accentBorder}`,
                    borderBottomRightRadius: isClient ? 4 : 14,
                    borderBottomLeftRadius: isClient ? 14 : 4,
                  }}
                >
                  {!isClient && (
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: t.accent,
                        marginBottom: 4,
                      }}
                    >
                      {msg.senderName}
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: 13,
                      color: isClient ? "#fff" : t.text,
                      lineHeight: 1.5,
                    }}
                  >
                    {msg.content}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: isClient ? "rgba(255,255,255,0.6)" : t.textDim,
                      marginTop: 4,
                      textAlign: "right",
                    }}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatBottomRef} />
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

  const sections = {
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
                    color: t.logoText,
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
                onClick={() => setActiveNav(item.id as SectionKey)}
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
            right: "-12px", // pushes it outside the sidebar
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
            zIndex: 10,
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
              <Icon d={icons.palette} size={14} /> Theme
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
