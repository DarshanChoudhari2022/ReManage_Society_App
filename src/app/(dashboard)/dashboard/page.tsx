"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  BellRing,
  BookOpen,
  Briefcase,
  Building2,
  CalendarCheck,
  Car,
  ChevronDown,
  ClipboardList,
  CreditCard,
  FileText,
  FolderOpen,
  HandCoins,
  HardDrive,
  IndianRupee,
  Megaphone,
  MessageSquare,
  MoreHorizontal,
  Package,
  Phone,
  PiggyBank,
  Receipt,
  RefreshCw,
  Scale,
  Settings,
  Shield,
  ShoppingBag,
  TrendingUp,
  User,
  UserCheck,
  UserPlus,
  Users,
  Vote,
  Wallet,
  Wrench,
} from "lucide-react";
import { useLiveData } from "@/lib/use-live-data";
import { useUser } from "@/lib/user-context";
import { formatCurrency } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import PersonaDashboardRouter from "@/components/ux/PersonaDashboardRouter";
import GuardDashboard from "./_personas/guard-dashboard";
import TreasurerDashboard from "./_personas/treasurer-dashboard";
import PlatformAdminDashboard from "./_personas/platform-admin-dashboard";

interface DashboardData {
  totalCollected: number;
  pendingAmount: number;
  totalExpenses: number;
  totalMembers: number;
  paidCount: number;
  partialCount: number;
  pendingCount: number;
  totalFlats: number;
  period: string;
  fundBalance: number;
  openComplaints: number;
  visitorsToday: number;
  activePolls: number;
  recentActivity?: Array<{
    id: string;
    flatNumber: string;
    ownerName: string;
    amount: number;
    status: string;
    paidVia?: string | null;
    paidAt?: string | null;
    updatedAt: string;
  }>;
}

interface AdminAnalyticsData {
  monthlyTrend: Array<{ period: string; label: string; collected: number; pending: number; expenses: number; collectionRate: number }>;
  expenseCategories: Array<{ category: string; amount: number }>;
  paymentMethods: Array<{ method: string; amount: number; count: number }>;
  aging: { current: number; days30: number; days60: number; days90Plus: number };
  topDefaulters: Array<{ flatNumber: string; ownerName: string; pending: number; billCount: number }>;
}

interface MyBillsData {
  stats: { totalPending: number; totalPaid: number };
}

interface ResidentBootstrapData {
  notices?: Array<{ id: string; title: string; category: string; createdAt: string }>;
  visitors?: Array<{ id: string; visitorName: string; purpose: string; status: string; expectedAt?: string | null; entryTime?: string | null; exitTime?: string | null }>;
  packages?: Array<{ id: string; courierName: string | null; status: string; receivedAt: string; collectedAt?: string | null }>;
  staff?: Array<{ id: string; name: string; category: string; phone: string; flatLinks?: Array<{ agreedMonthlyPay: number | null; schedule: string | null }> }>;
  forumThreads?: Array<{ id: string; title: string; author?: { name: string; role: string }; _count?: { replies: number } }>;
  events?: Array<{ id: string; title: string; venue: string | null; startDate: string; category: string }>;
  parkingSlots?: Array<{ id: string; slotNumber: string; slotType: string; level: string | null; wing: string | null; vehicleNo: string | null }>;
}

type Role = string;
type ModuleItem = {
  label: string;
  href: string;
  icon: typeof Shield;
  roles: Role[];
  note: string;
};
type Category = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof Shield;
  color: string;
  shadow: string;
  modules: ModuleItem[];
};

const admin = ["chairman", "secretary", "treasurer"];
const resident = ["member", "tenant"];
const everyone = [...admin, ...resident];

const categories: Category[] = [
  {
    id: "operations",
    title: "Operations",
    subtitle: "Daily Services",
    description: "Gate, staff, parcels, and daily movement.",
    icon: Shield,
    color: "from-violet-600 via-indigo-600 to-blue-700",
    shadow: "shadow-violet-500/20",
    modules: [
      { label: "Security Gate", href: "/visitors", icon: Shield, roles: [...admin, "guard", "watchman"], note: "Visitors and gate records" },
      { label: "My Visitors", href: "/my-visitors", icon: UserCheck, roles: resident, note: "Guests and approvals" },
      { label: "Staff & Daily Help", href: "/staff", icon: Briefcase, roles: everyone, note: "Daily help and attendance" },
      { label: "Parcel Desk", href: "/packages", icon: Package, roles: [...everyone, "guard", "watchman"], note: "Deliveries and pickups" },
    ],
  },
  {
    id: "finance",
    title: "Finance",
    subtitle: "Payments & Funds",
    description: "Bills, expenses, funds, payroll, and reports.",
    icon: IndianRupee,
    color: "from-emerald-700 via-teal-700 to-cyan-700",
    shadow: "shadow-emerald-500/20",
    modules: [
      { label: "Billing & Ledger", href: "/maintenance", icon: Receipt, roles: admin, note: "Raise and collect dues" },
      { label: "My Bills", href: "/my-bills", icon: CreditCard, roles: resident, note: "Dues, rent, staff payments" },
      { label: "Expenses", href: "/expenses", icon: Wallet, roles: ["chairman", "treasurer"], note: "Society spending" },
      { label: "Fund Accounts", href: "/funds", icon: PiggyBank, roles: ["chairman", "treasurer"], note: "Reserve and corpus" },
      { label: "Budget Planning", href: "/budgets", icon: TrendingUp, roles: ["chairman", "treasurer"], note: "Plan vs actuals" },
      { label: "Staff Payroll", href: "/salaries", icon: HandCoins, roles: ["chairman", "treasurer"], note: "Society staff salary" },
      { label: "Reports", href: "/reports", icon: FileText, roles: admin, note: "Financial summaries" },
    ],
  },
  {
    id: "legal",
    title: "Free Legal Advice",
    subtitle: "Legal Help",
    description: "Free legal guidance, adviser contact, and society compliance notes.",
    icon: Scale,
    color: "from-slate-800 via-zinc-800 to-stone-700",
    shadow: "shadow-slate-500/20",
    modules: [
      { label: "Legal Adviser Contact", href: "/settings", icon: Scale, roles: admin, note: "Advisor phone and profile" },
      { label: "Legal Documents", href: "/documents", icon: FolderOpen, roles: admin, note: "Bylaws and legal records" },
      { label: "Committee Guidance", href: "/meetings", icon: FileText, roles: admin, note: "AGM, notices, and resolutions" },
    ],
  },
  {
    id: "community",
    title: "Community",
    subtitle: "People & Shared Life",
    description: "Announcements, helpdesk, amenities, parking, and safety.",
    icon: Megaphone,
    color: "from-blue-700 via-indigo-600 to-violet-700",
    shadow: "shadow-blue-500/20",
    modules: [
      { label: "Announcements", href: "/notices", icon: Megaphone, roles: everyone, note: "Society updates" },
      { label: "Helpdesk", href: "/complaints", icon: AlertTriangle, roles: everyone, note: "Complaints and requests" },
      { label: "Resident Directory", href: "/directory", icon: BookOpen, roles: everyone, note: "Find residents" },
      { label: "Discussion Forum", href: "/forum", icon: MessageSquare, roles: everyone, note: "Neighbourhood discussions" },
      { label: "Events & Calendar", href: "/events", icon: CalendarCheck, roles: everyone, note: "Society events" },
      { label: "Amenity Booking", href: "/amenities", icon: Building2, roles: everyone, note: "Book shared spaces" },
      { label: "Buy & Sell", href: "/marketplace", icon: ShoppingBag, roles: everyone, note: "Resident marketplace" },
      { label: "Parking", href: "/parking", icon: Car, roles: everyone, note: "Slots and vehicles" },
      { label: "SOS & Safety", href: "/emergency", icon: Phone, roles: everyone, note: "Emergency help" },
    ],
  },
  {
    id: "governance",
    title: "Governance",
    subtitle: "Decisions & Records",
    description: "Meetings, voting, and documents.",
    icon: Vote,
    color: "from-fuchsia-700 via-purple-700 to-indigo-700",
    shadow: "shadow-fuchsia-500/20",
    modules: [
      { label: "Meetings", href: "/meetings", icon: FileText, roles: everyone, note: "Agenda and minutes" },
      { label: "Polls & Voting", href: "/polls", icon: Vote, roles: everyone, note: "Resident decisions" },
      { label: "Document Vault", href: "/documents", icon: FolderOpen, roles: everyone, note: "Society records" },
    ],
  },
  {
    id: "management",
    title: "Management",
    subtitle: "Setup & Control",
    description: "Residents, tenants, vendors, assets, audit, and settings.",
    icon: Settings,
    color: "from-rose-700 via-red-700 to-orange-700",
    shadow: "shadow-rose-500/20",
    modules: [
      { label: "Residents", href: "/members", icon: Users, roles: admin, note: "Owners and members" },
      { label: "Tenants", href: "/tenants", icon: UserPlus, roles: admin, note: "Tenant lifecycle" },
      { label: "Move In / Out", href: "/move-events", icon: ClipboardList, roles: admin, note: "Occupancy changes" },
      { label: "Vendor Hub", href: "/vendors", icon: Wrench, roles: admin, note: "Vendors and AMCs" },
      { label: "Asset Register", href: "/assets", icon: HardDrive, roles: admin, note: "Society assets" },
      { label: "Audit Trail", href: "/activity-log", icon: FileText, roles: admin, note: "Action history" },
      { label: "Settings", href: "/settings", icon: Settings, roles: ["chairman", "secretary"], note: "Society setup" },
    ],
  },
];

const roleLabels: Record<string, string> = {
  chairman: "Chairman",
  secretary: "Secretary",
  treasurer: "Treasurer",
  member: "Flat Member",
  tenant: "Tenant",
};

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function CategoryCard({ category, expanded, count, onClick }: { category: Category; expanded: boolean; count: number; onClick: () => void }) {
  const Icon = category.icon;
  const { t } = useI18n();
  return (
    <motion.button
      layout
      type="button"
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      className={`relative flex h-[176px] w-full overflow-hidden rounded-2xl bg-gradient-to-br ${category.color} p-4 text-left text-white transition-all duration-300 ${
        expanded
          ? `shadow-lg ${category.shadow} ring-2 ring-white/70`
          : "shadow-sm opacity-95 hover:opacity-100"
      }`}
    >
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/75">{t(category.subtitle)}</p>
            <h2 className="mt-1.5 text-2xl font-black tracking-tight">{t(category.title)}</h2>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div>
          <p className="line-clamp-2 max-w-md text-sm leading-5 text-white/85">{t(category.description)}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold">{count} {t("modules")}</span>
            <span className="flex items-center gap-1 text-xs font-black">
              {expanded ? t("Hide") : t("Open")} <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
            </span>
          </div>
        </div>
      </div>
      <Icon className="absolute -bottom-10 -right-8 h-40 w-40 text-white/10" />
    </motion.button>
  );
}

function ModuleCard({ module }: { module: ModuleItem }) {
  const Icon = module.icon;
  const { t } = useI18n();
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
      <Link href={module.href} className="group flex min-h-[104px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_4px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] dark:border-[#303030] dark:bg-[#1E1E1E] dark:shadow-black/20 dark:hover:border-primary/40">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/7 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
            <Icon className="h-4 w-4" />
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-black text-slate-950 dark:text-[#FAF7F5]">{t(module.label)}</h3>
          <p className="mt-1 line-clamp-1 text-xs font-medium text-slate-500">{t(module.note)}</p>
        </div>
      </Link>
    </motion.div>
  );
}

function CategoryWorkspace({ category, isAdmin }: { category: Category; isAdmin: boolean }) {
  const { t } = useI18n();
  const quickActions = {
    operations: [
      { label: isAdmin ? "Gate Activity" : "Approve Visitors", href: isAdmin ? "/visitors" : "/my-visitors", icon: Shield },
      { label: "Parcel Desk", href: "/packages", icon: Package },
      { label: "Emergency Contacts", href: "/emergency", icon: Phone },
    ],
    finance: [
      { label: isAdmin ? "Raise Invoice" : "Pay Dues", href: isAdmin ? "/maintenance" : "/my-bills", icon: Receipt },
      { label: "Record Expense", href: "/expenses", icon: Wallet },
      { label: "View Collections", href: "/reports", icon: TrendingUp },
    ],
    community: [
      { label: "Create Notice", href: "/notices", icon: Megaphone },
      { label: "Open Complaints", href: "/complaints", icon: AlertTriangle },
      { label: "Upcoming Events", href: "/events", icon: CalendarCheck },
    ],
    legal: [
      { label: "Update Adviser", href: "/settings", icon: Scale },
      { label: "Open Documents", href: "/documents", icon: FolderOpen },
      { label: "Meeting Records", href: "/meetings", icon: FileText },
    ],
    governance: [
      { label: "New Poll", href: "/polls", icon: Vote },
      { label: "Meeting Records", href: "/meetings", icon: FileText },
      { label: "Documents", href: "/documents", icon: FolderOpen },
    ],
    management: [
      { label: "Residents", href: "/members", icon: Users },
      { label: "Tenants", href: "/tenants", icon: UserPlus },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  }[category.id] || [];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: -8, height: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-b-2xl"
    >
      <div className="relative rounded-[1.75rem] border border-white/80 bg-white/95 p-5 shadow-md shadow-slate-900/5 backdrop-blur dark:border-[#303030] dark:bg-[#1E1E1E]/95 dark:shadow-black/20 sm:p-6">
        <div className={`absolute left-8 top-0 h-1.5 w-24 rounded-b-full bg-gradient-to-r ${category.color}`} />
        <div className="absolute -top-3 left-10 h-3 w-10 rounded-t-xl bg-white/95 dark:bg-[#1E1E1E]/95" />

        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">{t("Workspace")}</p>
            <h2 className="mt-1 text-xl font-black text-slate-950 dark:text-[#FAF7F5]">{t(category.title)}</h2>
            <p className="mt-1 text-xs font-medium text-slate-500">{t(category.description)}</p>
          </div>
          <span className="hidden rounded-full bg-slate-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:bg-slate-800 dark:text-slate-300 sm:inline">
            {t("No crowded menus")}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {category.modules.map((module) => <ModuleCard key={module.href} module={module} />)}
        </div>

        {quickActions.length > 0 && (
          <div className="mt-5">
            <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-500">{t("Quick Actions")}</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex min-h-[72px] flex-col justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-slate-950 shadow-[0_1px_4px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:text-primary hover:shadow-[0_8px_20px_rgba(15,23,42,0.07)] dark:border-[#303030] dark:bg-[#1E1E1E] dark:text-[#FAF7F5] dark:shadow-black/20 dark:hover:border-primary/40"
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    <span>{t(action.label)}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 dark:border-[#303030] dark:bg-[#303030]/40">
          <BellRing className="h-4 w-4 shrink-0 text-amber-600" />
          <div>
            <p className="text-xs font-black text-slate-950 dark:text-[#FAF7F5]">{t("Recent activity")}</p>
            <p className="mt-0.5 text-xs font-medium text-slate-500">{t("Latest updates from this area appear in notifications and module pages.")}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function formatShortDate(date: string | null | undefined, language: string) {
  if (!date) return "";
  const locale = language === "hi" ? "hi-IN" : language === "mr" ? "mr-IN" : "en-IN";
  return new Date(date).toLocaleDateString(locale, { day: "numeric", month: "short" });
}

function formatShortTime(date: string | null | undefined, language: string) {
  if (!date) return "";
  const locale = language === "hi" ? "hi-IN" : language === "mr" ? "mr-IN" : "en-IN";
  return new Date(date).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
}

function PriorityCard({
  href,
  label,
  value,
  icon: Icon,
  gradient,
  reverse = false,
}: {
  href: string;
  label: string;
  value: string;
  icon: typeof Shield;
  gradient: string;
  reverse?: boolean;
}) {
  return (
    <Link href={href} className="group block">
      <div className={`relative flex min-h-[112px] items-center overflow-hidden border border-white/40 bg-gradient-to-br ${gradient} p-4 shadow-sm transition-transform duration-300 hover:-translate-y-1 ${reverse ? "rounded-[2rem_1.5rem_2rem_1.5rem]" : "rounded-[1.5rem_2rem_1.5rem_2rem]"}`}>
        <Icon className="absolute -bottom-3 -right-3 h-20 w-20 text-white opacity-[0.08] transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110" />
        <div className="relative z-10 flex w-full items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/30 bg-white/20 shadow-sm backdrop-blur-md">
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="h-10 w-px shrink-0 bg-white/20" />
          <div className="min-w-0 flex-1">
            <h3 className="mb-1 truncate border-b border-white/20 pb-1 text-base font-black leading-tight text-white">{label}</h3>
            <p className="truncate text-xs font-semibold text-white/85">{value}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

function EmptyMiniState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-xs font-bold text-text-secondary dark:border-[#303030] dark:bg-[#303030]/40">
      {text}
    </div>
  );
}

function DashboardAccentIllustration({ type }: { type: "bill" | "visitor" | "parcel" | "safety" | "community" }) {
  return (
    <svg className="h-16 w-20 opacity-85 transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-2" viewBox="0 0 120 96" fill="none" aria-hidden="true">
      <rect x="16" y="20" width="72" height="58" rx="18" fill="currentColor" opacity="0.1" />
      <rect x="34" y="12" width="54" height="64" rx="14" fill="currentColor" opacity="0.08" stroke="currentColor" strokeOpacity="0.34" strokeWidth="4" />
      <path d="M45 30H76M45 44H69M45 58H74" stroke="currentColor" strokeOpacity="0.72" strokeWidth="5" strokeLinecap="round" />
      <circle cx="88" cy="64" r="18" fill="currentColor" opacity="0.16" />
      <path d={type === "visitor" ? "M84 64C84 58 92 58 92 64M82 70C86 75 94 75 98 70" : type === "parcel" ? "M80 59L88 54L96 59V69L88 74L80 69V59Z" : type === "safety" ? "M88 53L99 58V66C99 73 94 78 88 80C82 78 77 73 77 66V58L88 53Z" : "M88 54V74M80 64H96"} stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PremiumStatCard({
  href,
  title,
  value,
  note,
  icon: Icon,
  illustration,
  variant,
}: {
  href: string;
  title: string;
  value: string;
  note: string;
  icon: typeof Shield;
  illustration: "bill" | "visitor" | "parcel" | "safety" | "community";
  variant: "finance" | "visitor" | "parcel" | "helpdesk";
}) {
  const palette = {
    finance: {
      card: "border-[#FED7AA] bg-[#FFF7ED] hover:border-[#FDBA74] hover:bg-[#FFEDD5] dark:border-[#303030] dark:bg-[#1E1E1E] dark:hover:border-[#9A5A22] dark:hover:bg-[#241A12]",
      chip: "bg-[#FFEDD5] text-[#C2410C] dark:bg-[#7C2D12]/45 dark:text-[#FDBA74]",
      action: "bg-[#F97316] text-white",
      wash: "bg-[#F97316]/10",
      illustration: "text-[#F97316] dark:text-[#FDBA74]",
    },
    visitor: {
      card: "border-[#BFDBFE] bg-[#EFF6FF] hover:border-[#93C5FD] hover:bg-[#DBEAFE] dark:border-[#303030] dark:bg-[#1E1E1E] dark:hover:border-[#31558C] dark:hover:bg-[#141B25]",
      chip: "bg-[#DBEAFE] text-[#2563EB] dark:bg-[#1E3A8A]/42 dark:text-[#93C5FD]",
      action: "bg-[#2563EB] text-white",
      wash: "bg-[#2563EB]/10",
      illustration: "text-[#2563EB] dark:text-[#93C5FD]",
    },
    parcel: {
      card: "border-[#FDE68A] bg-[#FEFCE8] hover:border-[#FACC15] hover:bg-[#FEF9C3] dark:border-[#303030] dark:bg-[#1E1E1E] dark:hover:border-[#8A6A19] dark:hover:bg-[#24200E]",
      chip: "bg-[#FEF3C7] text-[#A16207] dark:bg-[#713F12]/42 dark:text-[#FDE68A]",
      action: "bg-[#CA8A04] text-white",
      wash: "bg-[#FACC15]/12",
      illustration: "text-[#CA8A04] dark:text-[#FDE68A]",
    },
    helpdesk: {
      card: "border-[#FECACA] bg-[#FEF2F2] hover:border-[#FCA5A5] hover:bg-[#FEE2E2] dark:border-[#303030] dark:bg-[#1E1E1E] dark:hover:border-[#7A3434] dark:hover:bg-[#271616]",
      chip: "bg-[#FEE2E2] text-[#DC2626] dark:bg-[#7F1D1D]/42 dark:text-[#FCA5A5]",
      action: "bg-[#DC2626] text-white",
      wash: "bg-[#EF4444]/10",
      illustration: "text-[#DC2626] dark:text-[#FCA5A5]",
    },
  }[variant];

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Link href={href} className={`group relative grid min-h-[124px] grid-cols-[minmax(0,1fr)_4.5rem] overflow-hidden rounded-[1.35rem] border p-3.5 shadow-[0_10px_34px_-28px_rgba(28,25,23,0.48)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_44px_-34px_rgba(28,25,23,0.58)] ${palette.card}`}>
        <div className={`absolute -right-10 -top-12 h-28 w-28 rounded-full ${palette.wash} blur-2xl transition-opacity group-hover:opacity-90`} />
        <div className="relative z-10 flex min-w-0 flex-col justify-between">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${palette.chip} ring-1 ring-inset ring-white/40 dark:ring-white/10`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="truncate text-sm font-bold text-[#1C1917] dark:text-[#FAF7F5]">{title}</p>
          </div>
          <div className="mt-3 min-w-0">
            <h3 className="truncate text-2xl font-bold tracking-tight text-[#1C1917] dark:text-[#FAF7F5]">{value}</h3>
            <p className="mt-0.5 line-clamp-1 text-xs font-semibold text-[#1C1917]/60 dark:text-[#D6D3D1]/82">{note}</p>
          </div>
        </div>
        <div className="relative z-10 flex flex-col items-end justify-between">
          <span className={`flex h-9 w-9 items-center justify-center rounded-full ${palette.action} shadow-sm transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5`}>
            <ArrowRight className="h-4 w-4" />
          </span>
          <div className={`opacity-50 transition-opacity group-hover:opacity-75 ${palette.illustration}`}>
            <DashboardAccentIllustration type={illustration} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function PremiumModuleTile({
  href,
  label,
  note,
  icon: Icon,
  accent,
  hover,
  wide = false,
}: {
  href: string;
  label: string;
  note: string;
  icon: typeof Shield;
  accent: string;
  hover: string;
  wide?: boolean;
}) {
  return (
    <Link href={href} className={`group relative min-h-[112px] overflow-hidden rounded-[1.25rem] border border-[#FED7AA] bg-white p-3 shadow-[0_8px_28px_-24px_rgba(28,25,23,0.42)] transition-all duration-300 hover:-translate-y-0.5 dark:border-[#303030] dark:bg-[#1E1E1E] ${hover} ${wide ? "md:col-span-2" : ""}`}>
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent} ring-1 ring-inset ring-[#1C1917]/5 transition-transform duration-300 group-hover:scale-105 dark:ring-white/10`}>
            <Icon className="h-5 w-5" />
          </div>
          <ArrowRight className="h-4 w-4 text-[#1C1917]/40 transition-transform group-hover:translate-x-1 dark:text-[#D6D3D1]/70" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#1C1917] dark:text-[#FAF7F5]">{label}</h3>
          <p className="mt-0.5 line-clamp-2 text-[11px] font-semibold leading-4 text-[#1C1917]/[0.55] dark:text-[#D6D3D1]">{note}</p>
        </div>
      </div>
    </Link>
  );
}

function DashboardLoadingShell() {
  return (
    <div className="-m-3 min-h-full overflow-hidden bg-[#FFFBEB] p-2 text-[#1C1917] dark:bg-[#141414] dark:text-[#FAF7F5] sm:-m-4 sm:p-3 lg:-m-6 lg:p-4 xl:p-5">
      <div className="pointer-events-none fixed inset-0 opacity-80 dark:opacity-45">
        <div className="absolute left-[18%] top-[-12rem] h-[30rem] w-[30rem] rounded-full bg-[#FDE047]/25 blur-3xl" />
        <div className="absolute right-[8%] top-[7rem] h-[24rem] w-[24rem] rounded-full bg-[#57534E]/[0.18] blur-3xl" />
        <div className="absolute bottom-[-12rem] right-[28%] h-[26rem] w-[26rem] rounded-full bg-[#F97316]/[0.16] blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-[1520px] space-y-3 pb-20 lg:pb-4">
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
          <div className="relative min-h-[260px] overflow-hidden rounded-[1.5rem] border border-white/80 bg-white/[0.88] p-4 shadow-[0_20px_64px_-54px_rgba(28,25,23,0.72)] dark:border-[#303030] dark:bg-[#1E1E1E]/[0.88] xl:col-span-8">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.95),rgba(255,255,255,0.72),rgba(245,245,247,0.28))] dark:bg-[linear-gradient(90deg,rgba(22,15,18,0.95),rgba(22,15,18,0.78),rgba(44,26,26,0.5))]" />
            <div className="relative z-10 flex h-full flex-col justify-center gap-3">
              <div className="h-9 w-44 animate-pulse rounded-full bg-[#F97316]/10 dark:bg-[#303030]/55" />
              <div className="h-12 w-full max-w-[720px] animate-pulse rounded-2xl bg-[#FED7AA]/60 dark:bg-[#303030]/55" />
              <div className="h-6 w-full max-w-[520px] animate-pulse rounded-full bg-[#FED7AA]/60 dark:bg-[#303030]/55" />
              <div className="flex gap-3">
                <div className="h-12 w-32 animate-pulse rounded-2xl bg-[#F97316]/18" />
                <div className="h-12 w-40 animate-pulse rounded-2xl bg-[#FED7AA]/60 dark:bg-[#303030]/55" />
                <div className="h-12 w-36 animate-pulse rounded-2xl bg-[#57534E]/12" />
              </div>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:col-span-4 xl:grid-cols-1">
            <div className="min-h-[160px] animate-pulse rounded-[1.5rem] bg-[#1C1917]/90 dark:bg-[#1E1E1E]" />
            <div className="min-h-[108px] animate-pulse rounded-[1.5rem] bg-white/80 dark:bg-[#1E1E1E]" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="min-h-[132px] animate-pulse rounded-[1.35rem] bg-white/85 dark:bg-[#1E1E1E]" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
          <div className="min-h-[340px] animate-pulse rounded-[1.5rem] bg-white/85 dark:bg-[#1E1E1E] xl:col-span-8" />
          <div className="min-h-[340px] animate-pulse rounded-[1.5rem] bg-white/85 dark:bg-[#1E1E1E] xl:col-span-4" />
        </div>
      </div>
    </div>
  );
}

function ResidentDashboard({
  user,
  data,
  myBills,
  bootstrap,
}: {
  user: ReturnType<typeof useUser>["user"];
  data: DashboardData | null;
  myBills: MyBillsData | null;
  bootstrap: ResidentBootstrapData | null;
}) {
  const { language, t } = useI18n();
  const notices = bootstrap?.notices || [];
  const visitors = bootstrap?.visitors || [];
  const packages = bootstrap?.packages || [];
  const staff = bootstrap?.staff || [];
  const forumThreads = bootstrap?.forumThreads || [];
  const events = bootstrap?.events || [];
  const parkingSlot = bootstrap?.parkingSlots?.[0];
  const pendingPackages = packages.filter((pkg) => !["collected", "returned"].includes(pkg.status)).length;
  const activeVisitors = visitors.filter((visitor) => ["pending_approval", "expected", "inside", "approved"].includes(visitor.status)).length;
  const openComplaints = data?.openComplaints || 0;
  const pendingDues = myBills?.stats?.totalPending || 0;
  const paidTotal = myBills?.stats?.totalPaid || 0;
  const roleLabel = user?.role === "tenant" ? t("Tenant") : t("Flat Member");
  const timelineItems = [
    ...visitors.slice(0, 2).map((visitor) => ({
      id: `visitor-${visitor.id}`,
      title: visitor.visitorName,
      meta: `${t("Visitor")} · ${visitor.purpose}`,
      time: formatShortTime(visitor.entryTime || visitor.expectedAt, language) || t("Today"),
      tone: "bg-[#57534E]",
      href: "/my-visitors",
    })),
    ...packages.slice(0, 2).map((pkg) => ({
      id: `package-${pkg.id}`,
      title: pkg.courierName || t("Parcel Desk"),
      meta: t(pkg.status),
      time: formatShortDate(pkg.receivedAt, language),
      tone: "bg-[#FDE047]",
      href: "/packages",
    })),
    ...notices.slice(0, 2).map((notice) => ({
      id: `notice-${notice.id}`,
      title: notice.title,
      meta: notice.category,
      time: formatShortDate(notice.createdAt, language),
      tone: "bg-[#F97316]",
      href: "/notices",
    })),
    ...events.slice(0, 2).map((event) => ({
      id: `event-${event.id}`,
      title: event.title,
      meta: event.venue || t("Society event"),
      time: formatShortDate(event.startDate, language),
      tone: "bg-[#10B981]",
      href: "/events",
    })),
  ].slice(0, 6);
  const premiumDashboard = true;

  if (premiumDashboard) {
    return (
    <div className="-m-3 min-h-full overflow-x-hidden bg-[#FFFBEB] p-2 text-[#1C1917] dark:bg-[#141414] dark:text-[#FAF7F5] sm:-m-4 sm:p-3 lg:-m-6 lg:p-4 xl:p-5">
        <div className="pointer-events-none fixed inset-0 opacity-80 dark:opacity-45">
          <div className="absolute left-[18%] top-[-12rem] h-[30rem] w-[30rem] rounded-full bg-[#FDE047]/25 blur-3xl" />
          <div className="absolute right-[8%] top-[7rem] h-[24rem] w-[24rem] rounded-full bg-[#57534E]/[0.18] blur-3xl" />
          <div className="absolute bottom-[-12rem] right-[28%] h-[26rem] w-[26rem] rounded-full bg-[#F97316]/[0.16] blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-[1520px] pb-20 lg:pb-4">
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="grid grid-cols-1 gap-3 xl:grid-cols-12">
            <div className="relative overflow-hidden rounded-[1.5rem] border border-white/80 bg-white/[0.88] p-4 shadow-[0_20px_64px_-54px_rgba(28,25,23,0.72)] backdrop-blur-xl dark:border-[#303030] dark:bg-[#1E1E1E]/[0.88] lg:p-5 xl:col-span-8">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-[0.46] saturate-[1.05] contrast-110 dark:opacity-[0.24]"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80')" }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.82)_42%,rgba(245,245,247,0.26)_100%)] dark:bg-[linear-gradient(90deg,rgba(22,15,18,0.98)_0%,rgba(22,15,18,0.88)_48%,rgba(44,26,26,0.54)_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_88%_18%,rgba(255,219,88,0.18),transparent_18rem),radial-gradient(circle_at_0%_100%,rgba(33,150,243,0.12),transparent_20rem)]" />
              <div className="relative z-10 flex min-h-[224px] items-center">
                <div className="w-full max-w-[1120px]">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex min-h-7 items-center rounded-full border border-[#F97316]/20 bg-[#F97316]/10 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[#F97316] dark:text-[#FB923C]">
                      {roleLabel}
                    </span>
                    {user?.flatNumber && (
                      <span className="inline-flex min-h-7 items-center rounded-full border border-[#57534E]/20 bg-[#57534E]/10 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[#57534E] dark:text-[#FDE047]">
                        {t("Flat")} {user.flatNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#F97316] dark:text-[#FB923C] sm:text-base">
                    {t(greeting().charAt(0).toUpperCase() + greeting().slice(1))}
                  </p>
                  <h1 className="mt-1.5 max-w-[min(100%,980px)] overflow-hidden text-ellipsis whitespace-nowrap text-3xl font-bold leading-[1.02] tracking-tight text-[#1C1917] dark:text-[#FAF7F5] sm:text-4xl xl:text-[3.4rem] 2xl:text-[3.8rem]">
                    {user?.name || t("Resident")}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[#1C1917]/[0.62] dark:text-[#D6D3D1]">
                    {user?.societyName || t("Your society")} {user?.societyAddress ? `· ${user.societyAddress}` : ""}
                  </p>
                  <div className="mt-5 flex flex-nowrap gap-2 overflow-x-auto pb-1">
                    <Link href="/my-bills" className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl bg-[#F97316] px-4 text-sm font-bold text-white shadow-lg shadow-[#F97316]/20 transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316]">
                      {t("Pay dues")} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                    <Link href="/my-visitors" className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl border border-[#FED7AA] bg-white px-4 text-sm font-bold text-[#1C1917] shadow-sm transition-transform hover:-translate-y-0.5 dark:border-white/[0.12] dark:bg-[#303030]/50 dark:text-[#FAF7F5]">
                      {t("Approve visitor")}
                    </Link>
                    <Link href="/complaints" className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl border border-[#57534E]/20 bg-[#57534E]/10 px-4 text-sm font-bold text-[#57534E] transition-transform hover:-translate-y-0.5 dark:text-[#FDE047]">
                      {t("Raise complaint")}
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <aside className="grid gap-3 md:grid-cols-2 xl:col-span-4 xl:grid-cols-1">
              <div className="relative overflow-hidden rounded-[1.5rem] border border-[#FED7AA] bg-[#1C1917] p-4 text-white shadow-[0_20px_64px_-54px_rgba(28,25,23,0.78)] dark:border-[#303030]">
                <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-[#FDE047]/25 blur-2xl" />
                <div className="relative z-10 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/55">{t("Society")}</p>
                    <h2 className="mt-1.5 line-clamp-2 text-xl font-bold">{user?.societyName || t("Your society")}</h2>
                    <p className="mt-1.5 text-xs font-semibold text-white/55">{user?.flatNumber ? `${t("Unit")} ${user.flatNumber}` : t("Resident profile")}</p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/12">
                    <Building2 className="h-6 w-6" />
                  </div>
                </div>
                <div className="relative z-10 mt-5 grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-white/10 p-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/45">{t("Role")}</p>
                    <p className="mt-1 truncate text-sm font-bold">{roleLabel}</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/45">{t("Parking")}</p>
                    <p className="mt-1 truncate text-sm font-bold">{parkingSlot?.slotNumber || "--"}</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/45">{t("Status")}</p>
                    <p className="mt-1 truncate text-sm font-bold text-[#10B981]">{t("Active")}</p>
                  </div>
                </div>
              </div>

              <Link href="/emergency" className="group relative overflow-hidden rounded-[1.5rem] border border-[#EF4444]/[0.18] bg-white p-4 shadow-[0_14px_42px_-34px_rgba(239,68,68,0.32)] transition-transform hover:-translate-y-0.5 dark:border-[#EF4444]/35 dark:bg-[#1E1E1E]">
                <div className="absolute -bottom-16 -right-10 h-32 w-32 rounded-full bg-[#EF4444]/[0.14] blur-2xl" />
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#EF4444]">{t("SOS & Safety")}</p>
                    <h3 className="mt-1.5 text-lg font-bold text-[#1C1917] dark:text-[#FAF7F5]">{t("Alert security")}</h3>
                    <p className="mt-1 text-sm font-semibold text-[#1C1917]/[0.55] dark:text-[#D6D3D1]/80">{t("Emergency contacts stay one tap away.")}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EF4444] text-white shadow-lg shadow-[#EF4444]/20">
                    <Phone className="h-6 w-6" />
                  </div>
                </div>
              </Link>
            </aside>
          </motion.section>

          <section className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <PremiumStatCard href="/my-bills" title={t("My Bills")} value={formatCurrency(pendingDues)} note={`${t("Paid")}: ${formatCurrency(paidTotal)}`} icon={CreditCard} illustration="bill" variant="finance" />
            <PremiumStatCard href="/my-visitors" title={t("Visitors")} value={String(activeVisitors)} note={t("Expected or active today")} icon={UserCheck} illustration="visitor" variant="visitor" />
            <PremiumStatCard href="/packages" title={t("Parcels")} value={String(pendingPackages)} note={t("Waiting for collection")} icon={Package} illustration="parcel" variant="parcel" />
            <PremiumStatCard href="/complaints" title={t("Helpdesk")} value={String(openComplaints)} note={t("Open society requests")} icon={AlertTriangle} illustration="safety" variant="helpdesk" />
          </section>

          <section className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-12">
            <div className="rounded-[1.5rem] border border-[#FED7AA] bg-white/90 p-4 shadow-[0_14px_48px_-40px_rgba(28,25,23,0.58)] backdrop-blur-xl dark:border-[#303030] dark:bg-[#1E1E1E]/92 lg:p-4 xl:col-span-8">
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-[#1C1917] dark:text-[#FAF7F5]">{t("Resident shortcuts")}</h2>
                  <p className="mt-0.5 text-xs font-semibold text-[#1C1917]/[0.55] dark:text-[#D6D3D1]/80">{t("High-frequency actions for daily society life.")}</p>
                </div>
                <Link href="/dashboard" className="hidden min-h-9 items-center rounded-xl bg-[#FFFBEB] px-3 text-xs font-bold text-[#1C1917]/60 dark:bg-[#303030]/50 dark:text-[#D6D3D1] sm:inline-flex">
                  {t("Command center")}
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <PremiumModuleTile href="/my-bills" label={t("My Bills")} note={t("Dues, receipts, rent, and staff payments.")} icon={Receipt} accent="bg-[#FFEDD5] text-[#F97316] dark:bg-[#7C2D12]/45 dark:text-[#FDBA74]" hover="hover:border-[#FDBA74] hover:bg-[#FFF7ED] dark:hover:border-[#9A5A22] dark:hover:bg-[#241A12]" wide />
                <PremiumModuleTile href="/my-visitors" label={t("My Visitors")} note={t("Approve gate requests and pre-authorize guests.")} icon={UserCheck} accent="bg-[#DBEAFE] text-[#2563EB] dark:bg-[#1E3A8A]/38 dark:text-[#93C5FD]" hover="hover:border-[#93C5FD] hover:bg-[#EFF6FF] dark:hover:border-[#31558C] dark:hover:bg-[#141B25]" />
                <PremiumModuleTile href="/complaints" label={t("Helpdesk")} note={t("Raise and track complaints.")} icon={AlertTriangle} accent="bg-[#FEE2E2] text-[#DC2626] dark:bg-[#7F1D1D]/38 dark:text-[#FCA5A5]" hover="hover:border-[#FCA5A5] hover:bg-[#FEF2F2] dark:hover:border-[#7A3434] dark:hover:bg-[#271616]" />
                <PremiumModuleTile href="/packages" label={t("Parcel Desk")} note={t("Delivery status and pickups.")} icon={Package} accent="bg-[#FEF3C7] text-[#B45309] dark:bg-[#713F12]/38 dark:text-[#FDE68A]" hover="hover:border-[#FACC15] hover:bg-[#FEFCE8] dark:hover:border-[#8A6A19] dark:hover:bg-[#24200E]" />
                <PremiumModuleTile href="/staff" label={t("Staff & Daily Help")} note={`${staff.length} ${t("linked profiles")}`} icon={Briefcase} accent="bg-[#F3E8FF] text-[#7E22CE] dark:bg-[#581C87]/38 dark:text-[#D8B4FE]" hover="hover:border-[#C084FC] hover:bg-[#FAF5FF] dark:hover:border-[#6B3A8F] dark:hover:bg-[#211329]" />
                <PremiumModuleTile href="/amenities" label={t("Amenities")} note={t("Book shared society spaces.")} icon={Building2} accent="bg-[#D1FAE5] text-[#059669] dark:bg-[#064E3B]/38 dark:text-[#6EE7B7]" hover="hover:border-[#6EE7B7] hover:bg-[#ECFDF5] dark:hover:border-[#25785D] dark:hover:bg-[#10231D]" />
                <PremiumModuleTile href="/parking" label={t("Parking")} note={parkingSlot ? `${parkingSlot.slotNumber} · ${parkingSlot.vehicleNo || t("Assigned")}` : t("Slot and vehicle details.")} icon={Car} accent="bg-[#E0E7FF] text-[#4F46E5] dark:bg-[#312E81]/38 dark:text-[#A5B4FC]" hover="hover:border-[#A5B4FC] hover:bg-[#EEF2FF] dark:hover:border-[#4E4A91] dark:hover:bg-[#17182A]" />
                <PremiumModuleTile href="/notices" label={t("Notices")} note={notices[0]?.title || t("Latest society communication.")} icon={Megaphone} accent="bg-[#FCE7F3] text-[#DB2777] dark:bg-[#831843]/38 dark:text-[#F9A8D4]" hover="hover:border-[#F9A8D4] hover:bg-[#FDF2F8] dark:hover:border-[#8B3B63] dark:hover:bg-[#281520]" wide />
                <PremiumModuleTile href="/events" label={t("Events")} note={events[0]?.title || t("Calendar and community moments.")} icon={CalendarCheck} accent="bg-[#FEF9C3] text-[#A16207] dark:bg-[#713F12]/38 dark:text-[#FEF08A]" hover="hover:border-[#FDE047] hover:bg-[#FEFCE8] dark:hover:border-[#8A6A19] dark:hover:bg-[#24200E]" />
                <PremiumModuleTile href="/marketplace" label={t("Buy & Sell")} note={t("Resident marketplace.")} icon={ShoppingBag} accent="bg-[#E0F2FE] text-[#0284C7] dark:bg-[#075985]/38 dark:text-[#7DD3FC]" hover="hover:border-[#7DD3FC] hover:bg-[#F0F9FF] dark:hover:border-[#2E6E8D] dark:hover:bg-[#101F29]" />
              </div>
            </div>

            <aside className="space-y-3 xl:col-span-4">
              <div className="rounded-[1.5rem] border border-[#FED7AA] bg-white/90 p-4 shadow-[0_14px_48px_-40px_rgba(28,25,23,0.58)] backdrop-blur-xl dark:border-[#303030] dark:bg-[#1E1E1E]/92 lg:p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[#1C1917] dark:text-[#FAF7F5]">{t("Today")}</h2>
                    <p className="mt-1 text-xs font-semibold text-[#1C1917]/[0.55] dark:text-[#D6D3D1]/80">{t("Visitors, parcels, notices, and events.")}</p>
                  </div>
                  <CalendarCheck className="h-5 w-5 text-[#F97316]" />
                </div>
                {timelineItems.length === 0 ? (
                  <EmptyMiniState text={t("No activity yet today.")} />
                ) : (
                  <div className="space-y-0.5 border-l border-[#FED7AA] pl-3 dark:border-[#303030]">
                    {timelineItems.map((item) => (
                      <Link key={item.id} href={item.href} className="group relative block rounded-xl px-2.5 py-2 transition-colors hover:bg-[#FFFBEB] dark:hover:bg-white/[0.08]">
                        <span className={`absolute -left-[21px] top-5 h-2.5 w-2.5 rounded-full ${item.tone} ring-4 ring-white dark:ring-[#1E1E1E]`} />
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-bold text-[#1C1917] dark:text-[#FAF7F5]">{item.title}</h3>
                            <p className="mt-1 truncate text-xs font-semibold text-[#1C1917]/50 dark:text-[#D6D3D1]/80">{item.meta}</p>
                          </div>
                          <span className="shrink-0 text-[11px] font-bold text-[#1C1917]/[0.45] dark:text-[#D6D3D1]/75">{item.time}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative overflow-hidden rounded-[1.5rem] border border-[#FED7AA] bg-white/90 p-4 shadow-[0_14px_48px_-40px_rgba(28,25,23,0.58)] backdrop-blur-xl dark:border-[#303030] dark:bg-[#1E1E1E]/92 lg:p-4">
                <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-[#57534E]/15 blur-2xl" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[#1C1917] dark:text-[#FAF7F5]">{t("Community pulse")}</h2>
                    <MessageSquare className="h-5 w-5 text-[#57534E]" />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <Link href="/forum" className="rounded-xl bg-[#FFFBEB] p-2.5 dark:bg-[#303030]/50">
                      <p className="text-2xl font-bold text-[#57534E]">{forumThreads.length}</p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#1C1917]/[0.45] dark:text-[#D6D3D1]/75">{t("Threads")}</p>
                    </Link>
                    <Link href="/notices" className="rounded-xl bg-[#FFFBEB] p-2.5 dark:bg-[#303030]/50">
                      <p className="text-2xl font-bold text-[#F97316]">{notices.length}</p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#1C1917]/[0.45] dark:text-[#D6D3D1]/75">{t("Notices")}</p>
                    </Link>
                    <Link href="/events" className="rounded-xl bg-[#FFFBEB] p-2.5 dark:bg-[#303030]/50">
                      <p className="text-2xl font-bold text-[#10B981]">{events.length}</p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#1C1917]/[0.45] dark:text-[#D6D3D1]/75">{t("Events")}</p>
                    </Link>
                  </div>
                  <Link href="/forum" className="mt-3 flex min-h-10 items-center justify-between rounded-xl border border-[#FED7AA] bg-white px-3 text-sm font-bold text-[#1C1917] transition-colors hover:border-[#57534E]/30 dark:border-[#303030] dark:bg-[#303030]/40 dark:text-[#FAF7F5]">
                    {forumThreads[0]?.title || t("Start a society discussion")}
                    <ArrowRight className="h-4 w-4 text-[#57534E]" />
                  </Link>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="-m-3 min-h-full bg-[#FFFBEB] p-3 dark:bg-[#141414] sm:-m-4 sm:p-4 lg:-m-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6 pb-24 lg:pb-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="w-full flex-1 space-y-6 lg:w-2/3 xl:w-[70%]">
            <section className="relative flex min-h-[210px] items-center justify-between overflow-hidden rounded-[2rem] bg-[#000328] p-6 shadow-sm lg:min-h-[230px] lg:p-8">
              <div className="absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80"
                  alt={t("Society building")}
                  className="h-full w-full object-cover opacity-60"
                />
              </div>
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,3,40,0.96)_0%,rgba(0,69,142,0.42)_100%)]" />
              <div className="relative z-10 max-w-xl">
                <h1 className="text-4xl font-black leading-[1.08] tracking-tight text-white drop-shadow-md lg:text-5xl">
                  {t(greeting().charAt(0).toUpperCase() + greeting().slice(1))}, <br className="hidden lg:block" />
                  <span className="text-emerald-400">{user?.name?.split(" ")[0] || t("Residents")}</span>
                </h1>
                <p className="mt-3 flex flex-wrap items-center gap-2 text-sm font-medium text-white/75 lg:text-base">
                  <Building2 className="h-4 w-4 text-white/50" />
                  <span>{user?.societyName || t("Your society")}</span>
                  {user?.flatNumber && <span className="h-1.5 w-1.5 rounded-full bg-white/25" />}
                  {user?.flatNumber && <span className="font-bold text-white">{t("Unit")} {user.flatNumber}</span>}
                </p>
              </div>
              <div className="relative z-10 hidden shrink-0 pr-2 sm:block lg:pr-6">
                <div className="relative h-32 w-32 rounded-full border border-white/40 bg-white/20 p-2 shadow-xl backdrop-blur-md lg:h-44 lg:w-44">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-[#F97316] text-4xl font-black text-white lg:text-6xl">
                    {user?.name?.slice(0, 1) || "R"}
                  </div>
                  <div className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-white/95 px-4 py-1.5 shadow-sm backdrop-blur-sm dark:bg-[#1E1E1E]/95">
                    <UserCheck className="h-4 w-4 text-emerald-600" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-text-primary">{user?.role === "tenant" ? t("Tenant") : t("Residents")}</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-3 lg:gap-4 xl:grid-cols-4">
              <PriorityCard href="/my-bills" label={t("My Bills")} value={`${t("Pending")}: ${formatCurrency(myBills?.stats?.totalPending || 0)}`} icon={CreditCard} gradient="from-emerald-500 to-emerald-700" />
              <PriorityCard href="/staff" label={t("Staff & Daily Help")} value={`${t("Scheduled")}: ${staff.length}`} icon={Wrench} gradient="from-blue-500 to-blue-700" reverse />
              <PriorityCard href="/packages" label={t("Parcel Desk")} value={`${t("Pending")}: ${pendingPackages}`} icon={Package} gradient="from-purple-500 to-purple-700" />
              <PriorityCard href="/emergency" label={t("SOS & Safety")} value={t("Alert security")} icon={Phone} gradient="from-rose-500 to-rose-700" reverse />
            </section>

            <section className="grid grid-cols-1 gap-4 lg:gap-6 xl:grid-cols-2">
              <div className="flex flex-col rounded-[2rem_2.5rem_2rem_2.5rem] border border-border bg-white p-5 shadow-sm dark:bg-[#1E1E1E] lg:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-lg font-black tracking-tight text-text-primary">{t("Visitors")}</h3>
                  <Link href="/my-visitors" className="rounded-full bg-primary/5 px-3 py-1.5 text-xs font-black text-primary">{t("Approve visitors")}</Link>
                </div>
                <div className="flex-1 space-y-3">
                  {visitors.length === 0 ? <EmptyMiniState text={t("No recent visitors.")} /> : visitors.slice(0, 3).map((visitor) => (
                    <Link key={visitor.id} href="/my-visitors" className="flex items-center justify-between rounded-2xl border border-border bg-surface p-3.5 transition-all hover:bg-white hover:shadow-sm dark:hover:bg-slate-800">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100">
                          <User className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-text-primary">{visitor.visitorName}</p>
                          <p className="truncate text-xs font-semibold text-text-secondary">{visitor.purpose} · {formatShortTime(visitor.entryTime || visitor.expectedAt, language)}</p>
                        </div>
                      </div>
                      <span className="ml-2 shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-amber-800">{t(visitor.status.replace("_", " "))}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex flex-col rounded-[2.5rem_2rem_2.5rem_2rem] border border-border bg-white p-5 shadow-sm dark:bg-[#1E1E1E] lg:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-lg font-black tracking-tight text-text-primary">{t("Discussion Forum")}</h3>
                  <Link href="/forum" className="text-xs font-black text-text-secondary hover:text-text-primary">{t("View All")}</Link>
                </div>
                <div className="flex-1 space-y-3">
                  {forumThreads.length === 0 ? <EmptyMiniState text={t("No discussions yet.")} /> : forumThreads.slice(0, 3).map((thread) => (
                    <Link key={thread.id} href="/forum" className="block rounded-2xl border border-border bg-surface p-3.5 transition-all hover:bg-white hover:shadow-sm dark:hover:bg-slate-800">
                      <h4 className="line-clamp-1 text-sm font-black text-text-primary">{thread.title}</h4>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="truncate text-xs font-semibold text-text-secondary">{thread.author?.name || t("Resident")}</span>
                        <span className="flex items-center gap-1.5 text-xs font-black text-text-secondary"><MessageSquare className="h-3.5 w-3.5" />{thread._count?.replies || 0}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-center justify-between px-1">
                <h3 className="text-xl font-black tracking-tight text-text-primary">{t("Community Quick Links")}</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6">
                {[
                  { href: "/amenities", label: "Amenities", icon: Building2, bg: "from-teal-400 to-emerald-500", shadow: "shadow-emerald-500/30" },
                  { href: "/complaints", label: "Helpdesk", icon: AlertTriangle, bg: "from-rose-400 to-pink-500", shadow: "shadow-rose-500/30" },
                  { href: "/events", label: "Events", icon: CalendarCheck, bg: "from-amber-400 to-orange-500", shadow: "shadow-orange-500/30" },
                  { href: "/marketplace", label: "Buy & Sell", icon: ShoppingBag, bg: "from-sky-400 to-blue-500", shadow: "shadow-blue-500/30" },
                  { href: "/parking", label: "Parking", icon: Car, bg: "from-lime-400 to-emerald-500", shadow: "shadow-lime-500/30" },
                  { href: "/polls", label: "Polls", icon: Vote, bg: "from-fuchsia-400 to-purple-500", shadow: "shadow-fuchsia-500/30" },
                  { href: "/documents", label: "Docs", icon: FolderOpen, bg: "from-slate-500 to-slate-700", shadow: "shadow-slate-500/30" },
                ].map((service, index) => {
                  const Icon = service.icon;
                  return (
                    <Link key={service.href} href={service.href} className={`group relative flex flex-col items-center justify-center gap-4 overflow-hidden border border-border bg-white p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-lg dark:bg-[#1E1E1E] ${index % 2 === 0 ? "rounded-[2rem_2.5rem_2rem_2.5rem]" : "rounded-[2.5rem_2rem_2.5rem_2rem]"}`}>
                      <div className={`absolute inset-0 bg-gradient-to-br ${service.bg} opacity-0 transition-opacity duration-300 group-hover:opacity-[0.04]`} />
                      <div className={`relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${service.bg} shadow-lg ${service.shadow} transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110`}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <span className="relative z-10 text-sm font-black text-text-primary">{t(service.label)}</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="flex w-full flex-col gap-6 lg:w-1/3 xl:w-[30%]">
            <div className="relative rounded-[2rem_2.5rem_2rem_2.5rem] border border-border bg-white p-5 shadow-sm dark:bg-[#1E1E1E] lg:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-black tracking-tight text-text-primary">{t("Announcements")}</h3>
                <Link href="/notices" className="flex h-8 w-8 items-center justify-center rounded-full bg-surface"><MoreHorizontal className="h-5 w-5 text-text-secondary" /></Link>
              </div>
              <div className="relative h-[170px] overflow-hidden">
                {notices.length === 0 ? <EmptyMiniState text={t("No notices posted yet.")} /> : (
                  <div className="space-y-4 border-l-2 border-border pl-4">
                    {notices.slice(0, 4).map((notice, index) => (
                      <div key={notice.id} className="relative">
                        <span className={`absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white dark:ring-slate-900 ${index === 0 ? "bg-primary" : "bg-slate-300"}`} />
                        <p className="mb-1 text-[11px] font-black uppercase tracking-wider text-primary">{formatShortDate(notice.createdAt, language)}</p>
                        <h4 className="line-clamp-1 text-sm font-black text-text-primary">{notice.title}</h4>
                        <p className="mt-1 text-xs font-semibold text-text-secondary">{notice.category}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-24 items-end justify-center rounded-b-[2rem] bg-gradient-to-t from-white via-white to-transparent pb-5 dark:from-slate-900 dark:via-slate-900">
                <Link href="/notices" className="pointer-events-auto text-sm font-black text-primary hover:underline">{t("View All Notices")}</Link>
              </div>
            </div>

            <div className="relative rounded-[2.5rem_2rem_2.5rem_2rem] border border-border bg-white p-5 shadow-sm dark:bg-[#1E1E1E] lg:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-black tracking-tight text-text-primary">{t("Events & Calendar")}</h3>
                <Link href="/events" className="flex h-8 w-8 items-center justify-center rounded-full bg-surface"><CalendarCheck className="h-5 w-5 text-text-secondary" /></Link>
              </div>
              <div className="relative h-[170px] overflow-hidden">
                {events.length === 0 ? <EmptyMiniState text={t("No upcoming events.")} /> : (
                  <div className="space-y-1">
                    {events.slice(0, 4).map((event) => (
                      <Link key={event.id} href="/events" className="group flex items-center gap-3 rounded-xl border border-transparent p-2 transition-colors hover:border-border hover:bg-surface">
                        <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                          <span className="text-[10px] font-black uppercase leading-tight text-primary">{new Date(event.startDate).toLocaleDateString(language === "hi" ? "hi-IN" : language === "mr" ? "mr-IN" : "en-IN", { month: "short" })}</span>
                          <span className="text-lg font-black leading-none text-primary">{new Date(event.startDate).getDate()}</span>
                        </div>
                        <div className="min-w-0">
                          <h4 className="truncate text-sm font-black text-text-primary">{event.title}</h4>
                          <p className="mt-0.5 truncate text-xs font-semibold text-text-secondary">{event.venue || t("Society")} · {formatShortTime(event.startDate, language)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-24 items-end justify-center rounded-b-[2rem] bg-gradient-to-t from-white via-white to-transparent pb-5 dark:from-slate-900 dark:via-slate-900">
                <Link href="/events" className="pointer-events-auto text-sm font-black text-primary hover:underline">{t("View All Events")}</Link>
              </div>
            </div>

            <Link href="/parking" className="group relative block h-[220px] overflow-hidden rounded-[2rem_2.5rem_2rem_2.5rem] border border-border bg-white shadow-sm transition-all duration-500 hover:border-emerald-200 dark:bg-[#1E1E1E]">
              <div className="absolute bottom-0 right-0 z-0 h-44 w-56">
                <img src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=600&q=80" alt={t("Parking")} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#fff_0%,#fff_30%,transparent_100%)] dark:bg-[linear-gradient(to_right,#1E1E1E_0%,#1E1E1E_30%,transparent_100%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_top,#fff_0%,transparent_60%)] dark:bg-[linear-gradient(to_top,#1E1E1E_0%,transparent_60%)]" />
              </div>
              <div className="absolute inset-0 z-10 flex flex-col justify-between p-6 lg:p-7">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col items-start gap-2">
                    <h3 className="text-xl font-black tracking-tight text-text-primary">{t("Parking")}</h3>
                    <div className="flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-3 py-1.5 shadow-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">{parkingSlot ? t("Assigned") : t("Not assigned")}</span>
                    </div>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-white shadow-sm transition-colors group-hover:border-emerald-200 group-hover:bg-emerald-50 dark:bg-slate-800 dark:group-hover:bg-emerald-950">
                    <Car className="h-5 w-5 text-text-secondary transition-colors group-hover:text-emerald-600" />
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-text-secondary">{t("Assigned Slot")}</p>
                  <div className="flex items-end gap-3">
                    <h3 className="font-mono text-4xl font-black tracking-tight text-text-primary lg:text-5xl">{parkingSlot?.slotNumber || "--"}</h3>
                    <span className="pb-1 text-sm font-black text-text-secondary lg:pb-1.5">{parkingSlot?.level || parkingSlot?.wing || t("Parking")}</span>
                  </div>
                </div>
              </div>
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}

function AdminMetricCard({
  href,
  label,
  value,
  note,
  icon: Icon,
  tone,
}: {
  href: string;
  label: string;
  value: string;
  note: string;
  icon: typeof Shield;
  tone: "orange" | "green" | "blue" | "red" | "yellow" | "purple";
}) {
  const styles = {
    orange: "border-[#FED7AA] bg-[#FFF7ED] hover:border-[#FDBA74] dark:border-[#303030] dark:bg-[#1E1E1E] dark:hover:border-[#9A5A22]",
    green: "border-[#BBF7D0] bg-[#F0FDF4] hover:border-[#86EFAC] dark:border-[#303030] dark:bg-[#1E1E1E] dark:hover:border-[#2F7958]",
    blue: "border-[#BFDBFE] bg-[#EFF6FF] hover:border-[#93C5FD] dark:border-[#303030] dark:bg-[#1E1E1E] dark:hover:border-[#31558C]",
    red: "border-[#FECACA] bg-[#FEF2F2] hover:border-[#FCA5A5] dark:border-[#303030] dark:bg-[#1E1E1E] dark:hover:border-[#7A3434]",
    yellow: "border-[#FDE68A] bg-[#FEFCE8] hover:border-[#FACC15] dark:border-[#303030] dark:bg-[#1E1E1E] dark:hover:border-[#8A6A19]",
    purple: "border-[#E9D5FF] bg-[#FAF5FF] hover:border-[#C084FC] dark:border-[#303030] dark:bg-[#1E1E1E] dark:hover:border-[#6B3A8F]",
  }[tone];
  const iconStyles = {
    orange: "bg-[#FFEDD5] text-[#F97316] dark:bg-[#7C2D12]/45 dark:text-[#FDBA74]",
    green: "bg-[#D1FAE5] text-[#059669] dark:bg-[#064E3B]/45 dark:text-[#6EE7B7]",
    blue: "bg-[#DBEAFE] text-[#2563EB] dark:bg-[#1E3A8A]/42 dark:text-[#93C5FD]",
    red: "bg-[#FEE2E2] text-[#DC2626] dark:bg-[#7F1D1D]/42 dark:text-[#FCA5A5]",
    yellow: "bg-[#FEF3C7] text-[#A16207] dark:bg-[#713F12]/42 dark:text-[#FDE68A]",
    purple: "bg-[#F3E8FF] text-[#7E22CE] dark:bg-[#581C87]/42 dark:text-[#D8B4FE]",
  }[tone];

  return (
    <Link href={href} className={`group relative min-h-[118px] overflow-hidden rounded-[1.35rem] border p-3.5 shadow-[0_8px_28px_-24px_rgba(28,25,23,0.42)] transition-all hover:-translate-y-0.5 ${styles}`}>
      <div className="flex h-full flex-col justify-between">
        <div className="flex items-center justify-between gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconStyles}`}>
            <Icon className="h-5 w-5" />
          </div>
          <ArrowRight className="h-4 w-4 text-[#1C1917]/35 transition-transform group-hover:translate-x-1 dark:text-[#D6D3D1]/70" />
        </div>
        <div>
          <p className="text-xs font-bold text-[#1C1917]/55 dark:text-[#D6D3D1]/80">{label}</p>
          <h3 className="mt-0.5 truncate text-2xl font-bold tracking-tight text-[#1C1917] dark:text-[#FAF7F5]">{value}</h3>
          <p className="mt-0.5 line-clamp-1 text-[11px] font-semibold text-[#1C1917]/50 dark:text-[#D6D3D1]/72">{note}</p>
        </div>
      </div>
    </Link>
  );
}

function AdminModuleTile({ module }: { module: ModuleItem }) {
  const Icon = module.icon;
  const { t } = useI18n();
  return (
    <Link href={module.href} className="group flex min-h-[94px] items-center gap-3 rounded-[1.2rem] border border-[#FED7AA] bg-white p-3 shadow-[0_8px_28px_-24px_rgba(28,25,23,0.38)] transition-all hover:-translate-y-0.5 hover:border-[#FDBA74] hover:bg-[#FFF7ED] dark:border-[#303030] dark:bg-[#1E1E1E] dark:hover:border-[#9A5A22] dark:hover:bg-[#241A12]">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFEDD5] text-[#F97316] transition-transform group-hover:scale-105 dark:bg-[#7C2D12]/42 dark:text-[#FDBA74]">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-bold text-[#1C1917] dark:text-[#FAF7F5]">{t(module.label)}</h3>
        <p className="mt-0.5 line-clamp-1 text-[11px] font-semibold text-[#1C1917]/50 dark:text-[#D6D3D1]/72">{t(module.note)}</p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-[#1C1917]/35 transition-transform group-hover:translate-x-1 dark:text-[#D6D3D1]/70" />
    </Link>
  );
}

function AdminDashboard({
  user,
  data,
  analytics,
  visibleCategories,
  loading,
  isStale,
}: {
  user: ReturnType<typeof useUser>["user"];
  data: DashboardData | null;
  analytics: AdminAnalyticsData | null;
  visibleCategories: Category[];
  loading: boolean;
  isStale: boolean;
}) {
  const { language, t } = useI18n();
  const collected = data?.totalCollected || 0;
  const pending = data?.pendingAmount || 0;
  const expenses = data?.totalExpenses || 0;
  const fundBalance = data?.fundBalance || 0;
  const totalFlow = collected + pending;
  const collectionRate = totalFlow > 0 ? Math.round((collected / totalFlow) * 100) : 0;
  const monthlyTrend = analytics?.monthlyTrend || [];
  const maxTrend = Math.max(...monthlyTrend.map((item) => item.collected + item.pending + item.expenses), 1);
  const recentActivity = data?.recentActivity || [];
  const adminModules = visibleCategories
    .flatMap((category) => category.modules)
    .filter((module, index, list) => list.findIndex((item) => item.href === module.href) === index);
  const primaryModules = adminModules.filter((module) => ["/maintenance", "/members", "/visitors", "/expenses", "/reports", "/complaints", "/notices", "/meetings", "/settings"].includes(module.href)).slice(0, 9);
  const topDefaulters = analytics?.topDefaulters || [];
  const aging = analytics?.aging || { current: 0, days30: 0, days60: 0, days90Plus: 0 };
  const riskTotal = aging.current + aging.days30 + aging.days60 + aging.days90Plus;

  return (
    <div className="-m-3 min-h-full overflow-x-hidden bg-[#FFFBEB] p-2 text-[#1C1917] dark:bg-[#141414] dark:text-[#FAF7F5] sm:-m-4 sm:p-3 lg:-m-6 lg:p-4 xl:p-5">
      <div className="relative mx-auto max-w-[1560px] pb-20 lg:pb-4">
        <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.42 }} className="grid grid-cols-1 gap-3 xl:grid-cols-12">
          <div className="relative overflow-hidden rounded-[1.5rem] border border-[#FED7AA] bg-white/90 p-4 shadow-[0_18px_58px_-50px_rgba(28,25,23,0.68)] dark:border-[#303030] dark:bg-[#1E1E1E]/92 lg:p-5 xl:col-span-8">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#F97316]/10 blur-3xl dark:bg-[#F97316]/8" />
            <div className="relative z-10 flex min-h-[220px] flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div className="max-w-3xl">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex min-h-7 items-center rounded-full border border-[#F97316]/20 bg-[#F97316]/10 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[#F97316] dark:text-[#FDBA74]">
                    {t("Admin command center")}
                  </span>
                  {isStale && <RefreshCw className="h-4 w-4 animate-spin text-[#F97316]" />}
                </div>
                <h1 className="max-w-[920px] truncate text-3xl font-bold tracking-tight text-[#1C1917] dark:text-[#FAF7F5] sm:text-4xl xl:text-[3.35rem]">
                  {user?.societyName || t("Society operations")}
                </h1>
                <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[#1C1917]/60 dark:text-[#D6D3D1]/82">
                  {t("Track collections, dues, gate movement, residents, and governance work from one focused admin dashboard.")}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href="/maintenance" className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[#F97316] px-4 text-sm font-bold text-white shadow-lg shadow-[#F97316]/18 transition-transform hover:-translate-y-0.5">
                    {t("Raise invoices")}
                  </Link>
                  <Link href="/reports" className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[#FED7AA] bg-white px-4 text-sm font-bold text-[#1C1917] transition-transform hover:-translate-y-0.5 dark:border-[#303030] dark:bg-[#303030]/50 dark:text-[#FAF7F5]">
                    {t("View reports")}
                  </Link>
                  <Link href="/notices" className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[#57534E]/20 bg-[#57534E]/10 px-4 text-sm font-bold text-[#57534E] transition-transform hover:-translate-y-0.5 dark:text-[#FDE68A]">
                    {t("Create notice")}
                  </Link>
                </div>
              </div>
              <div className="grid min-w-[min(100%,22rem)] grid-cols-2 gap-2">
                <div className="rounded-2xl border border-[#FED7AA] bg-[#FFFBEB] p-3 dark:border-[#303030] dark:bg-[#141414]">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#1C1917]/45 dark:text-[#D6D3D1]/70">{t("Collection rate")}</p>
                  <p className="mt-1 text-3xl font-bold text-[#F97316]">{collectionRate}%</p>
                </div>
                <div className="rounded-2xl border border-[#BBF7D0] bg-[#F0FDF4] p-3 dark:border-[#303030] dark:bg-[#141414]">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#1C1917]/45 dark:text-[#D6D3D1]/70">{t("Fund balance")}</p>
                  <p className="mt-1 truncate text-xl font-bold text-[#059669]">{formatCurrency(fundBalance)}</p>
                </div>
              </div>
            </div>
          </div>

          <aside className="grid gap-3 md:grid-cols-2 xl:col-span-4 xl:grid-cols-1">
            <div className="rounded-[1.5rem] border border-[#FED7AA] bg-[#1C1917] p-4 text-white shadow-[0_18px_58px_-50px_rgba(28,25,23,0.78)] dark:border-[#303030] dark:bg-[#1E1E1E]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/45">{t("This period")}</p>
                  <h2 className="mt-1.5 text-2xl font-bold">{data?.period || "--"}</h2>
                </div>
                <IndianRupee className="h-6 w-6 text-[#FDE68A]" />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-white/10 p-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/42">{t("Collected")}</p>
                  <p className="mt-1 truncate text-sm font-bold">{formatCurrency(collected)}</p>
                </div>
                <div className="rounded-xl bg-white/10 p-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/42">{t("Pending")}</p>
                  <p className="mt-1 truncate text-sm font-bold text-[#FDBA74]">{formatCurrency(pending)}</p>
                </div>
              </div>
            </div>
            <Link href="/complaints" className="group rounded-[1.5rem] border border-[#FECACA] bg-[#FEF2F2] p-4 shadow-[0_14px_42px_-34px_rgba(239,68,68,0.32)] transition-transform hover:-translate-y-0.5 dark:border-[#303030] dark:bg-[#1E1E1E] dark:hover:border-[#7A3434]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#DC2626] dark:text-[#FCA5A5]">{t("Action needed")}</p>
                  <h3 className="mt-1 text-xl font-bold text-[#1C1917] dark:text-[#FAF7F5]">{data?.openComplaints || 0} {t("open requests")}</h3>
                  <p className="mt-1 text-xs font-semibold text-[#1C1917]/55 dark:text-[#D6D3D1]/78">{t("Review resident complaints and service tickets.")}</p>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#DC2626] text-white">
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </aside>
        </motion.section>

        <section className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <AdminMetricCard href="/maintenance" label={t("Pending dues")} value={formatCurrency(pending)} note={`${data?.pendingCount || 0} ${t("pending bills")}`} icon={Receipt} tone="orange" />
          <AdminMetricCard href="/reports" label={t("Collected")} value={formatCurrency(collected)} note={`${data?.paidCount || 0} ${t("paid bills")}`} icon={TrendingUp} tone="green" />
          <AdminMetricCard href="/expenses" label={t("Expenses")} value={formatCurrency(expenses)} note={t("Society spending this period")} icon={Wallet} tone="blue" />
          <AdminMetricCard href="/members" label={t("Residents")} value={String(data?.totalMembers || 0)} note={`${data?.visitorsToday || 0} ${t("visitors today")}`} icon={Users} tone="purple" />
        </section>

        <section className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-12">
          <div className="rounded-[1.5rem] border border-[#FED7AA] bg-white/90 p-4 shadow-[0_14px_48px_-40px_rgba(28,25,23,0.58)] dark:border-[#303030] dark:bg-[#1E1E1E]/92 xl:col-span-8">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-[#1C1917] dark:text-[#FAF7F5]">{t("Collection performance")}</h2>
                <p className="mt-0.5 text-xs font-semibold text-[#1C1917]/55 dark:text-[#D6D3D1]/78">{t("Collected, pending dues, and expenses across recent months.")}</p>
              </div>
              <Link href="/reports" className="hidden min-h-9 items-center rounded-xl bg-[#FFFBEB] px-3 text-xs font-bold text-[#1C1917]/60 dark:bg-[#303030]/50 dark:text-[#D6D3D1] sm:inline-flex">
                {t("Reports")}
              </Link>
            </div>
            <div className="flex h-[260px] items-end gap-3 overflow-hidden rounded-2xl border border-[#FED7AA] bg-[#FFFBEB] p-4 dark:border-[#303030] dark:bg-[#141414]">
              {monthlyTrend.length === 0 ? (
                <EmptyMiniState text={t("Analytics will appear after bills and expenses are recorded.")} />
              ) : monthlyTrend.map((item) => {
                const collectedHeight = Math.max(8, Math.round((item.collected / maxTrend) * 190));
                const pendingHeight = Math.max(6, Math.round((item.pending / maxTrend) * 190));
                const expenseHeight = Math.max(4, Math.round((item.expenses / maxTrend) * 190));
                return (
                  <div key={item.period} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
                    <div className="flex h-[200px] w-full max-w-[54px] items-end justify-center gap-1 rounded-full bg-white/70 px-1.5 py-2 dark:bg-[#1E1E1E]">
                      <span className="w-2.5 rounded-full bg-[#10B981]" style={{ height: collectedHeight }} title={`${t("Collected")}: ${formatCurrency(item.collected)}`} />
                      <span className="w-2.5 rounded-full bg-[#F97316]" style={{ height: pendingHeight }} title={`${t("Pending")}: ${formatCurrency(item.pending)}`} />
                      <span className="w-2.5 rounded-full bg-[#60A5FA]" style={{ height: expenseHeight }} title={`${t("Expenses")}: ${formatCurrency(item.expenses)}`} />
                    </div>
                    <div className="text-center">
                      <p className="truncate text-[11px] font-bold text-[#1C1917] dark:text-[#FAF7F5]">{item.label}</p>
                      <p className="text-[10px] font-bold text-[#1C1917]/45 dark:text-[#D6D3D1]/70">{item.collectionRate}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="space-y-3 xl:col-span-4">
            <div className="rounded-[1.5rem] border border-[#FED7AA] bg-white/90 p-4 shadow-[0_14px_48px_-40px_rgba(28,25,23,0.58)] dark:border-[#303030] dark:bg-[#1E1E1E]/92">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#1C1917] dark:text-[#FAF7F5]">{t("Work queue")}</h2>
                  <p className="mt-0.5 text-xs font-semibold text-[#1C1917]/55 dark:text-[#D6D3D1]/78">{t("Tasks that need admin attention.")}</p>
                </div>
                <BellRing className="h-5 w-5 text-[#F97316]" />
              </div>
              <div className="space-y-2">
                {[
                  { href: "/maintenance", label: t("Pending collection"), value: formatCurrency(pending), icon: Receipt, tone: "bg-[#F97316]" },
                  { href: "/complaints", label: t("Open complaints"), value: String(data?.openComplaints || 0), icon: AlertTriangle, tone: "bg-[#EF4444]" },
                  { href: "/visitors", label: t("Gate activity today"), value: String(data?.visitorsToday || 0), icon: Shield, tone: "bg-[#60A5FA]" },
                  { href: "/polls", label: t("Active polls"), value: String(data?.activePolls || 0), icon: Vote, tone: "bg-[#A78BFA]" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-xl border border-[#FED7AA] bg-[#FFFBEB] p-2.5 transition-all hover:-translate-y-0.5 hover:border-[#FDBA74] dark:border-[#303030] dark:bg-[#141414] dark:hover:border-[#9A5A22]">
                      <span className={`h-2.5 w-2.5 rounded-full ${item.tone}`} />
                      <Icon className="h-4 w-4 text-[#1C1917]/50 dark:text-[#D6D3D1]/78" />
                      <span className="min-w-0 flex-1 truncate text-sm font-bold text-[#1C1917] dark:text-[#FAF7F5]">{item.label}</span>
                      <span className="shrink-0 text-sm font-bold text-[#F97316]">{item.value}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-[#FED7AA] bg-white/90 p-4 shadow-[0_14px_48px_-40px_rgba(28,25,23,0.58)] dark:border-[#303030] dark:bg-[#1E1E1E]/92">
              <h2 className="text-xl font-bold text-[#1C1917] dark:text-[#FAF7F5]">{t("Dues risk")}</h2>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {[
                  { label: t("Now"), value: aging.current, color: "bg-[#10B981]" },
                  { label: "30", value: aging.days30, color: "bg-[#FBBF24]" },
                  { label: "60", value: aging.days60, color: "bg-[#F97316]" },
                  { label: "90+", value: aging.days90Plus, color: "bg-[#EF4444]" },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-[#FFFBEB] p-2.5 dark:bg-[#141414]">
                    <div className={`mb-2 h-1.5 rounded-full ${item.color}`} style={{ opacity: riskTotal > 0 ? 1 : 0.35 }} />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#1C1917]/45 dark:text-[#D6D3D1]/70">{item.label}</p>
                    <p className="mt-1 truncate text-xs font-bold text-[#1C1917] dark:text-[#FAF7F5]">{formatCurrency(item.value)}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-12">
          <div className="rounded-[1.5rem] border border-[#FED7AA] bg-white/90 p-4 shadow-[0_14px_48px_-40px_rgba(28,25,23,0.58)] dark:border-[#303030] dark:bg-[#1E1E1E]/92 xl:col-span-8">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-[#1C1917] dark:text-[#FAF7F5]">{t("Admin shortcuts")}</h2>
                <p className="mt-0.5 text-xs font-semibold text-[#1C1917]/55 dark:text-[#D6D3D1]/78">{t("High-frequency controls for society operations.")}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {primaryModules.map((module) => <AdminModuleTile key={module.href} module={module} />)}
            </div>
          </div>

          <aside className="rounded-[1.5rem] border border-[#FED7AA] bg-white/90 p-4 shadow-[0_14px_48px_-40px_rgba(28,25,23,0.58)] dark:border-[#303030] dark:bg-[#1E1E1E]/92 xl:col-span-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#1C1917] dark:text-[#FAF7F5]">{t("Recent billing")}</h2>
                <p className="mt-0.5 text-xs font-semibold text-[#1C1917]/55 dark:text-[#D6D3D1]/78">{t("Latest invoices and payment updates.")}</p>
              </div>
              <Link href="/maintenance" className="rounded-xl bg-[#FFFBEB] px-3 py-2 text-xs font-bold text-[#1C1917]/60 dark:bg-[#303030]/50 dark:text-[#D6D3D1]">{t("Open")}</Link>
            </div>
            <div className="space-y-2">
              {recentActivity.length === 0 ? <EmptyMiniState text={t("No recent billing activity.")} /> : recentActivity.slice(0, 5).map((item) => (
                <Link key={item.id} href="/maintenance" className="flex items-center justify-between gap-3 rounded-xl border border-[#FED7AA] bg-[#FFFBEB] p-2.5 transition-all hover:border-[#FDBA74] dark:border-[#303030] dark:bg-[#141414] dark:hover:border-[#9A5A22]">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#1C1917] dark:text-[#FAF7F5]">{item.flatNumber} · {item.ownerName}</p>
                    <p className="mt-0.5 text-[11px] font-semibold text-[#1C1917]/50 dark:text-[#D6D3D1]/72">{formatShortDate(item.updatedAt, language)} · {t(item.status)}</p>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-[#F97316]">{formatCurrency(item.amount)}</span>
                </Link>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, loaded } = useUser();
  const isAdmin = admin.includes(user?.role || "");
  const { t } = useI18n();

  const { data, loading, isStale } = useLiveData<DashboardData>({ url: "/api/dashboard", interval: 60_000, enabled: true });
  const { data: myBills } = useLiveData<MyBillsData>({
    url: "/api/my-bills",
    interval: 60_000,
    enabled: loaded && !isAdmin && !!user?.flatNumber,
  });
  const { data: residentBootstrap } = useLiveData<ResidentBootstrapData>({
    url: "/api/mobile/bootstrap",
    interval: 120_000,
    enabled: loaded && !isAdmin,
  });
  const { data: adminAnalytics } = useLiveData<AdminAnalyticsData>({
    url: "/api/dashboard/analytics",
    interval: 120_000,
    enabled: loaded && isAdmin,
  });

  const visibleCategories = useMemo(() => {
    const role = user?.role || "member";
    const filtered = categories
      .map((category) => ({ ...category, modules: category.modules.filter((module) => module.roles.includes(role)) }))
      .filter((category) => category.modules.length > 0);
    if (!admin.includes(role)) return filtered;

    const adminOrder = ["management", "operations", "finance", "legal", "community", "governance"];
    return [...filtered].sort((a, b) => adminOrder.indexOf(a.id) - adminOrder.indexOf(b.id));
  }, [user?.role]);

  if (!loaded) {
    return <DashboardLoadingShell />;
  }

  return (
    <PersonaDashboardRouter
      role={user?.role || "member"}
      committee={
        <AdminDashboard
          user={user}
          data={data}
          analytics={adminAnalytics}
          visibleCategories={visibleCategories}
          loading={loading}
          isStale={isStale}
        />
      }
      treasurer={
        <TreasurerDashboard data={data} analytics={adminAnalytics} loading={loading} />
      }
      resident={
        <ResidentDashboard
          user={user}
          data={data}
          myBills={myBills}
          bootstrap={residentBootstrap}
        />
      }
      guard={<GuardDashboard data={data} loading={loading} />}
      platformAdmin={<PlatformAdminDashboard data={data} loading={loading} />}
    />
  );
}
