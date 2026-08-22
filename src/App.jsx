import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "./supabaseClient";

/**
 * E-commerce Team Management Portal
 * ----------------------------------
 * Single-file React app (Tailwind CSS for styling).
 * Data is seeded with sample records and persisted to localStorage
 * so changes survive a page refresh. No backend / external libraries required.
 *
 * Demo accounts (see LoginScreen):
 *   Admin -> admin@agency.com / admin123
 *   Team  -> sarah@agency.com / team123 (and other team members, same password)
 */

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = "ecom_team_portal_v1";

const TASK_TYPES = [
  "Build Shopify Store",
  "Setup Facebook Ads",
  "Setup TikTok Ads",
  "Product Upload",
  "Store Customization",
  "Pixel/Tracking Setup",
  "Marketing Work",
  "Other",
];

const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
const TASK_STATUSES = ["Pending", "In Progress", "Completed"];
const CLIENT_STATUSES = ["New", "Active", "On Hold", "Completed"];
const PLATFORMS = ["Shopify", "WooCommerce", "TikTok Shop", "Amazon", "Other"];

const AVATAR_COLORS = [
  "bg-blue-600",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-pink-500",
  "bg-amber-500",
  "bg-cyan-600",
  "bg-indigo-500",
];

/* ------------------------------------------------------------------ */
/*  Sample data                                                        */
/* ------------------------------------------------------------------ */

const DEFAULT_USERS = [
  { id: "u1", name: "Hassan Sheikh", email: "admin@agency.com", password: "admin123", role: "admin", title: "Agency Owner", color: "bg-blue-600" },
  { id: "u2", name: "Sarah Malik", email: "sarah@agency.com", password: "team123", role: "team", title: "Shopify Developer", color: "bg-violet-500" },
  { id: "u3", name: "Ali Raza", email: "ali@agency.com", password: "team123", role: "team", title: "Facebook Ads Specialist", color: "bg-emerald-500" },
  { id: "u4", name: "Ayesha Khan", email: "ayesha@agency.com", password: "team123", role: "team", title: "TikTok Ads Specialist", color: "bg-pink-500" },
  { id: "u5", name: "Bilal Ahmed", email: "bilal@agency.com", password: "team123", role: "team", title: "Store Designer", color: "bg-amber-500" },
];

const DEFAULT_CLIENTS = [
  { id: "c1", name: "Glow Beauty Co", email: "contact@glowbeauty.com", password: "glow@2024", platform: "Shopify", storeUrl: "glowbeauty.myshopify.com", adsAccount: "FB Ads ID: 1234567890", monthlySpend: 1500, status: "Active", notes: "Focus on skincare line launch this month." },
  { id: "c2", name: "Urban Threads", email: "hello@urbanthreads.pk", password: "urban#456", platform: "WooCommerce", storeUrl: "urbanthreads.pk", adsAccount: "FB Ads ID: 2233445566, TikTok ID: 9988776655", monthlySpend: 2200, status: "Active", notes: "Running BFCM prep, needs new creatives weekly." },
  { id: "c3", name: "PetCare Essentials", email: "info@petcareessentials.com", password: "pet$secure1", platform: "Shopify", storeUrl: "petcareessentials.myshopify.com", adsAccount: "TikTok Ads ID: 5647382910", monthlySpend: 900, status: "On Hold", notes: "Paused spend until new product photos arrive." },
  { id: "c4", name: "FitGear Pro", email: "team@fitgearpro.com", password: "fit!gear99", platform: "Shopify", storeUrl: "fitgearpro.myshopify.com", adsAccount: "FB Ads ID: 4455667788", monthlySpend: 3000, status: "Active", notes: "Scaling winning ad sets, watch CPA closely." },
  { id: "c5", name: "Home Bliss Decor", email: "support@homeblissdecor.com", password: "bliss@home1", platform: "WooCommerce", storeUrl: "homeblissdecor.com", adsAccount: "Pending setup", monthlySpend: 0, status: "New", notes: "Onboarding call scheduled, store build not started." },
];

const DEFAULT_TASKS = [
  { id: "t1", clientId: "c1", assignedTo: "u3", title: "Setup Facebook Ads", type: "Setup Facebook Ads", description: "Launch prospecting campaign for new skincare line.", priority: "High", deadline: "2026-08-28", status: "In Progress", createdAt: "2026-08-18" },
  { id: "t2", clientId: "c2", assignedTo: "u2", title: "Build Shopify Store", type: "Build Shopify Store", description: "Rebuild homepage with new BFCM theme sections.", priority: "Urgent", deadline: "2026-08-25", status: "In Progress", createdAt: "2026-08-15" },
  { id: "t3", clientId: "c2", assignedTo: "u4", title: "Setup TikTok Ads", type: "Setup TikTok Ads", description: "Create spark ads using latest UGC creatives.", priority: "Medium", deadline: "2026-08-30", status: "Pending", createdAt: "2026-08-19" },
  { id: "t4", clientId: "c3", assignedTo: "u5", title: "Store Customization", type: "Store Customization", description: "Update product page layout and add trust badges.", priority: "Low", deadline: "2026-09-05", status: "Pending", createdAt: "2026-08-20" },
  { id: "t5", clientId: "c4", assignedTo: "u3", title: "Marketing Work", type: "Marketing Work", description: "Draft new ad copy variations for testing.", priority: "High", deadline: "2026-08-24", status: "Pending", createdAt: "2026-08-19" },
  { id: "t6", clientId: "c4", assignedTo: "u3", title: "Pixel/Tracking Setup", type: "Pixel/Tracking Setup", description: "Verify Meta pixel events and fix mismatched conversions.", priority: "Urgent", deadline: "2026-08-23", status: "Completed", createdAt: "2026-08-12" },
  { id: "t7", clientId: "c1", assignedTo: "u2", title: "Product Upload", type: "Product Upload", description: "Upload 15 new SKUs with descriptions and images.", priority: "Medium", deadline: "2026-08-27", status: "Completed", createdAt: "2026-08-10" },
  { id: "t8", clientId: "c5", assignedTo: "u5", title: "Build Shopify Store", type: "Build Shopify Store", description: "Set up store structure, theme and navigation.", priority: "High", deadline: "2026-09-02", status: "Pending", createdAt: "2026-08-21" },
  { id: "t9", clientId: "c2", assignedTo: "u2", title: "Pixel/Tracking Setup", type: "Pixel/Tracking Setup", description: "Install TikTok pixel and test events tool.", priority: "Medium", deadline: "2026-08-26", status: "Completed", createdAt: "2026-08-14" },
  { id: "t10", clientId: "c3", assignedTo: "u4", title: "Marketing Work", type: "Marketing Work", description: "Plan content calendar for September.", priority: "Low", deadline: "2026-09-08", status: "Pending", createdAt: "2026-08-21" },
];

/* ------------------------------------------------------------------ */
/*  Storage helpers                                                     */
/* ------------------------------------------------------------------ */

/* Data is now stored in Supabase (table "portal_data", single row keyed
   by STORAGE_KEY) instead of localStorage, so every team member sees the
   same live data from anywhere. See supabaseClient.js + README. */

async function loadData() {
  const { data, error } = await supabase
    .from("portal_data")
    .select("payload")
    .eq("id", STORAGE_KEY)
    .maybeSingle();
  if (error) {
    console.error("Supabase load error:", error.message);
    return null;
  }
  return data ? data.payload : null;
}

async function saveData(data) {
  const { error } = await supabase
    .from("portal_data")
    .upsert({ id: STORAGE_KEY, payload: data, updated_at: new Date().toISOString() });
  if (error) {
    console.error("Supabase save error:", error.message);
  }
}

function uid(prefix) {
  return prefix + "_" + Math.random().toString(36).slice(2, 10);
}

function formatDate(d) {
  if (!d) return "-";
  const date = new Date(d + "T00:00:00");
  if (isNaN(date.getTime())) return d;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function daysUntil(d) {
  if (!d) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d + "T00:00:00");
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

function initials(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function currency(n) {
  return "$" + Number(n || 0).toLocaleString();
}

/* ------------------------------------------------------------------ */
/*  Icons (inline SVG, no external dependency)                         */
/* ------------------------------------------------------------------ */

const ICON_PATHS = {
  grid: "M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z",
  users: "M17 21v-2a4 4 0 00-3-3.87M7 21v-2a4 4 0 013-3.87M12 7a4 4 0 100 8 4 4 0 000-8zM21 21v-2a4 4 0 00-3-3.87",
  team: "M9 7a3 3 0 100 6 3 3 0 000-6zm7 6a3 3 0 100-6 3 3 0 000 6zM2 21v-1a5 5 0 015-5h4a5 5 0 015 5v1M14 15h1a5 5 0 015 5v1",
  tasks: "M9 11l3 3L22 4M3 11l3 3 3-3M3 19h8",
  chart: "M4 20V10m6 10V4m6 16v-7m6 7V8",
  settings: "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z",
  search: "M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35",
  plus: "M12 5v14M5 12h14",
  edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  trash: "M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z",
  x: "M18 6L6 18M6 6l12 12",
  menu: "M3 12h18M3 6h18M3 18h18",
  logout: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
  chevronDown: "M6 9l6 6 6-6",
  store: "M3 9l1-5h16l1 5M3 9v10a1 1 0 001 1h16a1 1 0 001-1V9M3 9h18M9 21v-6h6v6",
  dollar: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  calendar: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
  alert: "M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z",
  check: "M20 6L9 17l-5-5",
  filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  mail: "M4 4h16v16H4V4zM22 6l-10 7L2 6",
  building: "M6 22V4a1 1 0 011-1h10a1 1 0 011 1v18M9 22V16h6v6M9 8h1M14 8h1M9 12h1M14 12h1",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 100-6 3 3 0 000 6z",
};

function Icon({ name, className = "w-5 h-5", strokeWidth = 2 }) {
  const d = ICON_PATHS[name];
  if (!d) return null;
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={d} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Small shared UI pieces                                             */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }) {
  const map = {
    Pending: "bg-slate-100 text-slate-600 ring-slate-200",
    "In Progress": "bg-blue-50 text-blue-700 ring-blue-200",
    Completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    New: "bg-violet-50 text-violet-700 ring-violet-200",
    Active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    "On Hold": "bg-amber-50 text-amber-700 ring-amber-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${map[status] || "bg-slate-100 text-slate-600 ring-slate-200"}`}>
      {status}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const map = {
    Low: "bg-slate-100 text-slate-600",
    Medium: "bg-blue-50 text-blue-700",
    High: "bg-amber-50 text-amber-700",
    Urgent: "bg-red-50 text-red-700",
  };
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${map[priority] || "bg-slate-100 text-slate-600"}`}>{priority}</span>;
}

function Avatar({ name, color = "bg-blue-600", size = "w-9 h-9" }) {
  return (
    <div className={`${size} ${color} rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}>
      {initials(name)}
    </div>
  );
}

function Card({ children, className = "" }) {
  return <div className={`bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}>{children}</div>;
}

function StatCard({ label, value, icon, accent = "bg-blue-50 text-blue-600", sub }) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-800 mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={`${accent} w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon name={icon} className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
}

function EmptyState({ title, subtitle, icon = "search" }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-4">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
        <Icon name={icon} className="w-6 h-6 text-slate-400" />
      </div>
      <p className="text-slate-700 font-medium">{title}</p>
      {subtitle && <p className="text-slate-400 text-sm mt-1 max-w-sm">{subtitle}</p>}
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700 mb-1">{label}</span>
      {children}
      {hint && <span className="block text-xs text-slate-400 mt-1">{hint}</span>}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";

function TextInput(props) {
  return <input {...props} className={inputCls + " " + (props.className || "")} />;
}
function Select(props) {
  return <select {...props} className={inputCls + " bg-white " + (props.className || "")} />;
}
function TextArea(props) {
  return <textarea {...props} className={inputCls + " resize-none " + (props.className || "")} />;
}

function PrimaryButton({ children, className = "", ...rest }) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition shadow-sm ${className}`}
    >
      {children}
    </button>
  );
}
function SecondaryButton({ children, className = "", ...rest }) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg transition border border-slate-300 ${className}`}
    >
      {children}
    </button>
  );
}
function DangerButton({ children, className = "", ...rest }) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition shadow-sm ${className}`}
    >
      {children}
    </button>
  );
}
function IconButton({ icon, className = "", label, ...rest }) {
  return (
    <button {...rest} aria-label={label} title={label} className={`inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-500 transition ${className}`}>
      <Icon name={icon} className="w-4 h-4" />
    </button>
  );
}

function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white w-full ${wide ? "sm:max-w-2xl" : "sm:max-w-lg"} sm:rounded-2xl shadow-xl min-h-screen sm:min-h-0 sm:my-8`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 sticky top-0 bg-white sm:rounded-t-2xl z-10">
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          <IconButton icon="x" label="Close" onClick={onClose} />
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-xl p-5">
        <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-3">
          <Icon name="alert" className="w-5 h-5" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        <p className="text-sm text-slate-500 mt-1">{message}</p>
        <div className="flex justify-end gap-2 mt-5">
          <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
          <DangerButton onClick={onConfirm}>Delete</DangerButton>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Login screen                                                       */
/* ------------------------------------------------------------------ */

function LoginScreen({ users, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);
    if (user) {
      setError("");
      onLogin(user);
    } else {
      setError("Incorrect email or password. Try one of the demo accounts below.");
    }
  }

  function quickLogin(user) {
    setEmail(user.email);
    setPassword(user.password);
    onLogin(user);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-white">
        {/* Brand panel */}
        <div className="hidden md:flex flex-col justify-between bg-blue-600 text-white p-8">
          <div>
            <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center mb-6">
              <Icon name="store" className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold leading-tight">Team Management Portal</h1>
            <p className="text-blue-100 mt-2 text-sm">Manage clients, assign tasks and track every store build and ad launch in one place.</p>
          </div>
          <ul className="space-y-3 text-sm text-blue-100">
            <li className="flex items-center gap-2"><Icon name="check" className="w-4 h-4" /> Track client stores &amp; ad accounts</li>
            <li className="flex items-center gap-2"><Icon name="check" className="w-4 h-4" /> Assign and follow up on tasks</li>
            <li className="flex items-center gap-2"><Icon name="check" className="w-4 h-4" /> See progress at a glance</li>
          </ul>
        </div>

        {/* Form panel */}
        <div className="p-6 sm:p-8">
          <h2 className="text-xl font-bold text-slate-800">Sign in</h2>
          <p className="text-sm text-slate-500 mt-1">Welcome back, enter your details to continue.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field label="Email">
              <TextInput type="email" required placeholder="you@agency.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label="Password">
              <TextInput type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Field>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <PrimaryButton type="submit" className="w-full py-2.5">Sign in</PrimaryButton>
          </form>

          <div className="mt-6">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Demo accounts</p>
            <div className="grid grid-cols-2 gap-2">
              {users.slice(0, 4).map((u) => (
                <button key={u.id} onClick={() => quickLogin(u)} className="flex items-center gap-2 border border-slate-200 hover:border-blue-300 hover:bg-blue-50 rounded-lg px-2.5 py-2 text-left transition">
                  <Avatar name={u.name} color={u.color} size="w-7 h-7" />
                  <span className="min-w-0">
                    <span className="block text-xs font-medium text-slate-700 truncate">{u.name.split(" ")[0]}</span>
                    <span className="block text-[10px] text-slate-400 truncate">{u.role === "admin" ? "Admin" : u.title}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sidebar & Topbar                                                    */
/* ------------------------------------------------------------------ */

function NAV_ITEMS(role) {
  if (role === "admin") {
    return [
      { id: "dashboard", label: "Dashboard", icon: "grid" },
      { id: "clients", label: "Clients", icon: "store" },
      { id: "team", label: "Team", icon: "team" },
      { id: "tasks", label: "Tasks", icon: "tasks" },
      { id: "analytics", label: "Analytics", icon: "chart" },
      { id: "settings", label: "Settings", icon: "settings" },
    ];
  }
  return [
    { id: "dashboard", label: "Dashboard", icon: "grid" },
    { id: "clients", label: "My Clients", icon: "store" },
    { id: "tasks", label: "My Tasks", icon: "tasks" },
    { id: "settings", label: "Settings", icon: "settings" },
  ];
}

function Sidebar({ currentUser, activeView, setActiveView, open, setOpen, onLogout }) {
  const items = NAV_ITEMS(currentUser.role);
  return (
    <>
      {open && <div className="fixed inset-0 bg-slate-900/40 z-30 md:hidden" onClick={() => setOpen(false)} />}
      <aside
        className={`fixed md:static z-40 top-0 left-0 h-full w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-slate-200 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm shadow-blue-200">
            <Icon name="store" className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-bold text-slate-800 text-sm leading-tight tracking-tight">Team Portal</span>
          <button className="ml-auto md:hidden text-slate-400" onClick={() => setOpen(false)}>
            <Icon name="x" className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {items.map((item) => {
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  active ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-200" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon name={item.icon} className={`w-4.5 h-4.5 ${active ? "text-white" : "text-slate-400"}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-200">
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar name={currentUser.name} color={currentUser.color} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{currentUser.name}</p>
              <p className="text-xs text-slate-400 truncate">{currentUser.role === "admin" ? "Administrator" : currentUser.title}</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full mt-1 flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-red-600 transition">
            <Icon name="logout" className="w-4.5 h-4.5" />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}

function Topbar({ title, subtitle, onMenuClick, currentUser }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center gap-3 px-4 sm:px-6 flex-shrink-0 sticky top-0 z-20">
      <button className="md:hidden text-slate-500" onClick={onMenuClick}>
        <Icon name="menu" className="w-6 h-6" />
      </button>
      <div className="min-w-0">
        <h1 className="text-base sm:text-lg font-bold text-slate-800 truncate">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400 truncate hidden sm:block">{subtitle}</p>}
      </div>
      <div className="ml-auto flex items-center gap-3">
        <Avatar name={currentUser.name} color={currentUser.color} size="w-8 h-8" />
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Dashboard views                                                     */
/* ------------------------------------------------------------------ */

function AdminDashboard({ clients, tasks, users, setActiveView }) {
  const teamMembers = users.filter((u) => u.role === "team");
  const pending = tasks.filter((t) => t.status === "Pending").length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const activeClients = clients.filter((c) => c.status === "Active").length;
  const totalSpend = clients.reduce((s, c) => s + Number(c.monthlySpend || 0), 0);
  const progressPct = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  const upcoming = [...tasks]
    .filter((t) => t.status !== "Completed")
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);

  const byMember = teamMembers.map((m) => {
    const mTasks = tasks.filter((t) => t.assignedTo === m.id);
    return { member: m, total: mTasks.length, completed: mTasks.filter((t) => t.status === "Completed").length };
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total Clients" value={clients.length} icon="store" sub={`${activeClients} active`} />
        <StatCard label="Team Members" value={teamMembers.length} icon="team" accent="bg-violet-50 text-violet-600" />
        <StatCard label="Open Tasks" value={pending + inProgress} icon="tasks" accent="bg-amber-50 text-amber-600" sub={`${pending} pending · ${inProgress} in progress`} />
        <StatCard label="Monthly Ad Spend" value={currency(totalSpend)} icon="dollar" accent="bg-emerald-50 text-emerald-600" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Overall Progress</h3>
            <span className="text-sm text-slate-400">{completed}/{tasks.length} tasks completed</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { label: "Pending", value: pending, color: "text-slate-500" },
              { label: "In Progress", value: inProgress, color: "text-blue-600" },
              { label: "Completed", value: completed, color: "text-emerald-600" },
            ].map((s) => (
              <div key={s.label} className="text-center border border-slate-100 rounded-lg py-3">
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <h4 className="font-semibold text-slate-800 mt-6 mb-3 text-sm">Team workload</h4>
          <div className="space-y-3">
            {byMember.map(({ member, total, completed }) => (
              <div key={member.id} className="flex items-center gap-3">
                <Avatar name={member.name} color={member.color} size="w-7 h-7" />
                <span className="text-sm text-slate-600 w-28 truncate flex-shrink-0">{member.name}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: total ? `${(completed / total) * 100}%` : "0%" }} />
                </div>
                <span className="text-xs text-slate-400 w-14 text-right flex-shrink-0">{completed}/{total}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Upcoming Deadlines</h3>
            <button onClick={() => setActiveView("tasks")} className="text-xs text-blue-600 font-medium hover:underline">View all</button>
          </div>
          <div className="space-y-3">
            {upcoming.length === 0 && <p className="text-sm text-slate-400">Nothing due — you're all caught up.</p>}
            {upcoming.map((t) => {
              const client = clients.find((c) => c.id === t.clientId);
              const days = daysUntil(t.deadline);
              return (
                <div key={t.id} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Icon name="calendar" className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-700 truncate">{t.title}</p>
                    <p className="text-xs text-slate-400 truncate">{client?.name || "—"}</p>
                  </div>
                  <span className={`text-xs font-medium flex-shrink-0 ${days < 0 ? "text-red-600" : days <= 2 ? "text-amber-600" : "text-slate-400"}`}>
                    {days < 0 ? `${Math.abs(days)}d late` : days === 0 ? "Today" : `${days}d left`}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

function TeamDashboard({ currentUser, clients, tasks, setActiveView }) {
  const myTasks = tasks.filter((t) => t.assignedTo === currentUser.id);
  const myClientIds = [...new Set(myTasks.map((t) => t.clientId))];
  const myClients = clients.filter((c) => myClientIds.includes(c.id));
  const pending = myTasks.filter((t) => t.status === "Pending").length;
  const inProgress = myTasks.filter((t) => t.status === "In Progress").length;
  const completed = myTasks.filter((t) => t.status === "Completed").length;

  const upcoming = [...myTasks]
    .filter((t) => t.status !== "Completed")
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="My Clients" value={myClients.length} icon="store" />
        <StatCard label="Pending" value={pending} icon="tasks" accent="bg-slate-100 text-slate-500" />
        <StatCard label="In Progress" value={inProgress} icon="tasks" accent="bg-blue-50 text-blue-600" />
        <StatCard label="Completed" value={completed} icon="check" accent="bg-emerald-50 text-emerald-600" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Upcoming Deadlines</h3>
            <button onClick={() => setActiveView("tasks")} className="text-xs text-blue-600 font-medium hover:underline">View all</button>
          </div>
          <div className="space-y-3">
            {upcoming.length === 0 && <p className="text-sm text-slate-400">Nothing due — you're all caught up.</p>}
            {upcoming.map((t) => {
              const client = clients.find((c) => c.id === t.clientId);
              const days = daysUntil(t.deadline);
              return (
                <div key={t.id} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Icon name="calendar" className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-700 truncate">{t.title}</p>
                    <p className="text-xs text-slate-400 truncate">{client?.name || "—"}</p>
                  </div>
                  <span className={`text-xs font-medium flex-shrink-0 ${days < 0 ? "text-red-600" : days <= 2 ? "text-amber-600" : "text-slate-400"}`}>
                    {days < 0 ? `${Math.abs(days)}d late` : days === 0 ? "Today" : `${days}d left`}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">My Clients</h3>
            <button onClick={() => setActiveView("clients")} className="text-xs text-blue-600 font-medium hover:underline">View all</button>
          </div>
          <div className="space-y-3">
            {myClients.length === 0 && <p className="text-sm text-slate-400">No clients assigned yet.</p>}
            {myClients.slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                <Avatar name={c.name} color="bg-slate-400" size="w-8 h-8" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-700 truncate">{c.name}</p>
                  <p className="text-xs text-slate-400 truncate">{c.platform}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Clients view                                                        */
/* ------------------------------------------------------------------ */

function ClientForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(
    initial || { name: "", email: "", password: "", platform: "Shopify", storeUrl: "", adsAccount: "", monthlySpend: "", status: "New", notes: "" }
  );
  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({ ...form, monthlySpend: Number(form.monthlySpend) || 0 });
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Client name">
          <TextInput required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Glow Beauty Co" />
        </Field>
        <Field label="Email">
          <TextInput type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="contact@client.com" />
        </Field>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Password" hint="Store/account login the team may need.">
          <TextInput value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="••••••••" />
        </Field>
        <Field label="Status">
          <Select value={form.status} onChange={(e) => set("status", e.target.value)}>
            {CLIENT_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Platform">
          <Select value={form.platform} onChange={(e) => set("platform", e.target.value)}>
            {PLATFORMS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </Select>
        </Field>
        <Field label="Store URL">
          <TextInput value={form.storeUrl} onChange={(e) => set("storeUrl", e.target.value)} placeholder="store.myshopify.com" />
        </Field>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Ads account details">
          <TextInput value={form.adsAccount} onChange={(e) => set("adsAccount", e.target.value)} placeholder="FB Ads ID / TikTok Ads ID" />
        </Field>
        <Field label="Monthly ad spend (USD)">
          <TextInput type="number" min="0" value={form.monthlySpend} onChange={(e) => set("monthlySpend", e.target.value)} placeholder="0" />
        </Field>
      </div>
      <Field label="Notes">
        <TextArea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Anything the team should know..." />
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <SecondaryButton type="button" onClick={onCancel}>Cancel</SecondaryButton>
        <PrimaryButton type="submit">Save client</PrimaryButton>
      </div>
    </form>
  );
}

function ClientDetailModal({ client, tasks, users, open, onClose }) {
  if (!open || !client) return null;
  const clientTasks = tasks.filter((t) => t.clientId === client.id);
  return (
    <Modal open={open} onClose={onClose} title={client.name} wide>
      <div className="grid sm:grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2 text-slate-600"><Icon name="mail" className="w-4 h-4 text-slate-400" /> {client.email}</div>
        <div className="flex items-center gap-2 text-slate-600"><Icon name="building" className="w-4 h-4 text-slate-400" /> {client.platform} — {client.storeUrl || "no URL set"}</div>
        <div className="flex items-center gap-2 text-slate-600"><Icon name="chart" className="w-4 h-4 text-slate-400" /> {client.adsAccount || "No ads account on file"}</div>
        <div className="flex items-center gap-2 text-slate-600"><Icon name="dollar" className="w-4 h-4 text-slate-400" /> {currency(client.monthlySpend)}/mo ad spend</div>
      </div>
      {client.notes && (
        <div className="mt-4 bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm text-slate-600">{client.notes}</div>
      )}
      <h4 className="font-semibold text-slate-800 text-sm mt-5 mb-2">Tasks for this client ({clientTasks.length})</h4>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {clientTasks.length === 0 && <p className="text-sm text-slate-400">No tasks yet.</p>}
        {clientTasks.map((t) => {
          const member = users.find((u) => u.id === t.assignedTo);
          return (
            <div key={t.id} className="flex items-center gap-2 border border-slate-100 rounded-lg px-3 py-2">
              <span className="text-sm text-slate-700 flex-1 truncate">{t.title}</span>
              <span className="text-xs text-slate-400 truncate hidden sm:inline">{member?.name}</span>
              <StatusBadge status={t.status} />
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

function ClientsView({ currentUser, clients, tasks, users, updateClients, isAdmin }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const visibleClients = useMemo(() => {
    // Team members can see every client the admin has added (read-only) so
    // they always have store/context info handy, not just clients they
    // currently have a task on.
    let list = clients;
    if (statusFilter !== "All") list = list.filter((c) => c.status === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.platform.toLowerCase().includes(q));
    }
    return list;
  }, [clients, tasks, search, statusFilter, isAdmin, currentUser.id]);

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }
  function openEdit(c) {
    setEditing(c);
    setModalOpen(true);
  }
  function handleSave(data) {
    if (editing) {
      updateClients((list) => list.map((c) => (c.id === editing.id ? { ...editing, ...data } : c)));
    } else {
      updateClients((list) => [...list, { id: uid("c"), ...data }]);
    }
    setModalOpen(false);
  }
  function handleDelete() {
    updateClients((list) => list.filter((c) => c.id !== confirmDelete.id));
    setConfirmDelete(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Icon name="search" className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <TextInput placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-44">
          <option>All</option>
          {CLIENT_STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>
        {isAdmin && (
          <PrimaryButton onClick={openAdd} className="sm:ml-auto">
            <Icon name="plus" className="w-4 h-4" /> Add client
          </PrimaryButton>
        )}
      </div>

      <Card className="overflow-hidden">
        {visibleClients.length === 0 ? (
          <EmptyState title="No clients found" subtitle="Try adjusting your search or filters." icon="store" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-slate-400 text-xs uppercase tracking-wide">
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Platform</th>
                  <th className="px-5 py-3 font-medium">Ad spend</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleClients.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition">
                    <td className="px-5 py-3 cursor-pointer" onClick={() => setViewing(c)}>
                      <div className="flex items-center gap-3">
                        <Avatar name={c.name} color="bg-slate-400" size="w-8 h-8" />
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 truncate">{c.name}</p>
                          <p className="text-xs text-slate-400 truncate">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{c.platform}</td>
                    <td className="px-5 py-3 text-slate-600">{currency(c.monthlySpend)}</td>
                    <td className="px-5 py-3">
                      {isAdmin ? (
                        <select
                          value={c.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateClients((list) => list.map((x) => (x.id === c.id ? { ...x, status: e.target.value } : x)))}
                          className={`text-xs font-medium rounded-full px-2.5 py-1 border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                            { New: "bg-violet-50 text-violet-700", Active: "bg-emerald-50 text-emerald-700", "On Hold": "bg-amber-50 text-amber-700", Completed: "bg-slate-100 text-slate-600" }[c.status] ||
                            "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {CLIENT_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      ) : (
                        <StatusBadge status={c.status} />
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <IconButton icon="eye" label="View" onClick={() => setViewing(c)} />
                        {isAdmin && <IconButton icon="edit" label="Edit" onClick={() => openEdit(c)} />}
                        {isAdmin && <IconButton icon="trash" label="Delete" className="hover:text-red-600 hover:bg-red-50" onClick={() => setConfirmDelete(c)} />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit client" : "Add client"} wide>
        <ClientForm initial={editing} onSave={handleSave} onCancel={() => setModalOpen(false)} />
      </Modal>

      <ClientDetailModal client={viewing} tasks={tasks} users={users} open={!!viewing} onClose={() => setViewing(null)} />

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete client?"
        message={`This will permanently remove ${confirmDelete?.name}. Related tasks will remain but lose their client link.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Team view                                                           */
/* ------------------------------------------------------------------ */

function TeamForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || { name: "", email: "", password: "", title: "", color: AVATAR_COLORS[0] });
  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  function submit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    onSave(form);
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Full name">
          <TextInput required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Sarah Malik" />
        </Field>
        <Field label="Role / title">
          <TextInput required value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Facebook Ads Specialist" />
        </Field>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Email (login)">
          <TextInput type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="name@agency.com" />
        </Field>
        <Field label="Password">
          <TextInput required value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Set a login password" />
        </Field>
      </div>
      <Field label="Avatar color">
        <div className="flex gap-2 mt-1">
          {AVATAR_COLORS.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => set("color", c)}
              className={`w-7 h-7 rounded-full ${c} ${form.color === c ? "ring-2 ring-offset-2 ring-blue-500" : ""}`}
            />
          ))}
        </div>
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <SecondaryButton type="button" onClick={onCancel}>Cancel</SecondaryButton>
        <PrimaryButton type="submit">Save member</PrimaryButton>
      </div>
    </form>
  );
}

function TeamView({ users, tasks, updateUsers }) {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const members = users.filter((u) => u.role === "team" && u.name.toLowerCase().includes(search.toLowerCase()));

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }
  function openEdit(m) {
    setEditing(m);
    setModalOpen(true);
  }
  function handleSave(data) {
    if (editing) {
      updateUsers((list) => list.map((u) => (u.id === editing.id ? { ...editing, ...data } : u)));
    } else {
      updateUsers((list) => [...list, { id: uid("u"), role: "team", ...data }]);
    }
    setModalOpen(false);
  }
  function handleDelete() {
    updateUsers((list) => list.filter((u) => u.id !== confirmDelete.id));
    setConfirmDelete(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Icon name="search" className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <TextInput placeholder="Search team members..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <PrimaryButton onClick={openAdd} className="sm:ml-auto">
          <Icon name="plus" className="w-4 h-4" /> Add team member
        </PrimaryButton>
      </div>

      {members.length === 0 ? (
        <Card><EmptyState title="No team members found" icon="team" /></Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m) => {
            const mTasks = tasks.filter((t) => t.assignedTo === m.id);
            const completed = mTasks.filter((t) => t.status === "Completed").length;
            const active = mTasks.filter((t) => t.status !== "Completed").length;
            return (
              <Card key={m.id} className="p-5">
                <div className="flex items-start gap-3">
                  <Avatar name={m.name} color={m.color} size="w-11 h-11" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-800 truncate">{m.name}</p>
                    <p className="text-xs text-slate-400 truncate">{m.title}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{m.email}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <IconButton icon="edit" label="Edit" onClick={() => openEdit(m)} />
                    <IconButton icon="trash" label="Delete" className="hover:text-red-600 hover:bg-red-50" onClick={() => setConfirmDelete(m)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-slate-50 rounded-lg py-2 text-center">
                    <p className="text-lg font-bold text-slate-700">{active}</p>
                    <p className="text-xs text-slate-400">Active tasks</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg py-2 text-center">
                    <p className="text-lg font-bold text-emerald-600">{completed}</p>
                    <p className="text-xs text-slate-400">Completed</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit team member" : "Add team member"}>
        <TeamForm initial={editing} onSave={handleSave} onCancel={() => setModalOpen(false)} />
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Remove team member?"
        message={`${confirmDelete?.name} will lose portal access. Their existing tasks will remain but stay assigned to them.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tasks view                                                          */
/* ------------------------------------------------------------------ */

function TaskForm({ initial, clients, teamMembers, onSave, onCancel }) {
  const [form, setForm] = useState(
    initial || {
      clientId: clients[0]?.id || "",
      assignedTo: teamMembers[0]?.id || "",
      title: TASK_TYPES[0],
      type: TASK_TYPES[0],
      description: "",
      priority: "Medium",
      deadline: "",
      status: "Pending",
    }
  );
  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  function submit(e) {
    e.preventDefault();
    if (!form.clientId || !form.assignedTo || !form.deadline) return;
    onSave(form);
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Client">
          <Select required value={form.clientId} onChange={(e) => set("clientId", e.target.value)}>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Assign to">
          <Select required value={form.assignedTo} onChange={(e) => set("assignedTo", e.target.value)}>
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>{m.name} — {m.title}</option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Task type">
        <Select
          value={form.type}
          onChange={(e) => {
            set("type", e.target.value);
            set("title", e.target.value);
          }}
        >
          {TASK_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </Select>
      </Field>
      <Field label="Task title">
        <TextInput required value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Short task title" />
      </Field>
      <Field label="Description">
        <TextArea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What needs to be done..." />
      </Field>
      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Priority">
          <Select value={form.priority} onChange={(e) => set("priority", e.target.value)}>
            {PRIORITIES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </Select>
        </Field>
        <Field label="Deadline">
          <TextInput type="date" required value={form.deadline} onChange={(e) => set("deadline", e.target.value)} />
        </Field>
        <Field label="Status">
          <Select value={form.status} onChange={(e) => set("status", e.target.value)}>
            {TASK_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <SecondaryButton type="button" onClick={onCancel}>Cancel</SecondaryButton>
        <PrimaryButton type="submit">Save task</PrimaryButton>
      </div>
    </form>
  );
}

function TaskRow({ task, client, member, isAdmin, onEdit, onDelete, onStatusChange, onView }) {
  const days = daysUntil(task.deadline);
  const overdue = days !== null && days < 0 && task.status !== "Completed";
  return (
    <tr className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition">
      <td className="px-5 py-3">
        <button className="text-left" onClick={onView}>
          <p className="font-medium text-slate-800 truncate max-w-[220px]">{task.title}</p>
          <p className="text-xs text-slate-400 truncate max-w-[220px]">{client?.name || "No client"}</p>
        </button>
      </td>
      <td className="px-5 py-3">
        <div className="flex items-center gap-2">
          <Avatar name={member?.name || "?"} color={member?.color || "bg-slate-400"} size="w-6 h-6" />
          <span className="text-slate-600 truncate max-w-[120px]">{member?.name || "Unassigned"}</span>
        </div>
      </td>
      <td className="px-5 py-3"><PriorityBadge priority={task.priority} /></td>
      <td className="px-5 py-3">
        <span className={overdue ? "text-red-600 font-medium" : "text-slate-600"}>{formatDate(task.deadline)}</span>
      </td>
      <td className="px-5 py-3">
        {isAdmin ? (
          <Select value={task.status} onChange={(e) => onStatusChange(e.target.value)} className="!py-1 !text-xs w-[130px]">
            {TASK_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        ) : (
          <Select value={task.status} onChange={(e) => onStatusChange(e.target.value)} className="!py-1 !text-xs w-[130px]">
            {TASK_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        )}
      </td>
      <td className="px-5 py-3">
        <div className="flex justify-end gap-1">
          {isAdmin && <IconButton icon="edit" label="Edit" onClick={onEdit} />}
          {isAdmin && <IconButton icon="trash" label="Delete" className="hover:text-red-600 hover:bg-red-50" onClick={onDelete} />}
        </div>
      </td>
    </tr>
  );
}

function TaskDetailModal({ task, client, member, open, onClose }) {
  if (!open || !task) return null;
  return (
    <Modal open={open} onClose={onClose} title={task.title}>
      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
        </div>
        {task.description && <p className="text-slate-600">{task.description}</p>}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div>
            <p className="text-xs text-slate-400">Client</p>
            <p className="text-slate-700 font-medium">{client?.name || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Assigned to</p>
            <p className="text-slate-700 font-medium">{member?.name || "Unassigned"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Deadline</p>
            <p className="text-slate-700 font-medium">{formatDate(task.deadline)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Task type</p>
            <p className="text-slate-700 font-medium">{task.type}</p>
          </div>
        </div>
        {client && (
          <div className="bg-slate-50 rounded-lg p-3 mt-3">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Client info</p>
            <p className="text-slate-600">{client.platform} — {client.storeUrl}</p>
            <p className="text-slate-600">{client.adsAccount}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

function TasksView({ currentUser, clients, tasks, users, updateTasks, isAdmin }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [memberFilter, setMemberFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const teamMembers = users.filter((u) => u.role === "team");

  const visibleTasks = useMemo(() => {
    let list = isAdmin ? tasks : tasks.filter((t) => t.assignedTo === currentUser.id);
    if (statusFilter !== "All") list = list.filter((t) => t.status === statusFilter);
    if (priorityFilter !== "All") list = list.filter((t) => t.priority === priorityFilter);
    if (isAdmin && memberFilter !== "All") list = list.filter((t) => t.assignedTo === memberFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  }, [tasks, search, statusFilter, priorityFilter, memberFilter, isAdmin, currentUser.id]);

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }
  function openEdit(t) {
    setEditing(t);
    setModalOpen(true);
  }
  function handleSave(data) {
    if (editing) {
      updateTasks((list) => list.map((t) => (t.id === editing.id ? { ...editing, ...data } : t)));
    } else {
      updateTasks((list) => [...list, { id: uid("t"), createdAt: new Date().toISOString().slice(0, 10), ...data }]);
    }
    setModalOpen(false);
  }
  function handleDelete() {
    updateTasks((list) => list.filter((t) => t.id !== confirmDelete.id));
    setConfirmDelete(null);
  }
  function handleStatusChange(task, status) {
    updateTasks((list) => list.map((t) => (t.id === task.id ? { ...t, status } : t)));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Icon name="search" className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <TextInput placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-40">
          <option>All</option>
          {TASK_STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>
        <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="sm:w-40">
          <option>All</option>
          {PRIORITIES.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </Select>
        {isAdmin && (
          <Select value={memberFilter} onChange={(e) => setMemberFilter(e.target.value)} className="sm:w-48">
            <option value="All">All team members</option>
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </Select>
        )}
        {isAdmin && (
          <PrimaryButton onClick={openAdd} className="sm:ml-auto">
            <Icon name="plus" className="w-4 h-4" /> New task
          </PrimaryButton>
        )}
      </div>

      <Card className="overflow-hidden">
        {visibleTasks.length === 0 ? (
          <EmptyState title="No tasks found" subtitle="Try adjusting your search or filters." icon="tasks" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-slate-400 text-xs uppercase tracking-wide">
                  <th className="px-5 py-3 font-medium">Task</th>
                  <th className="px-5 py-3 font-medium">Assigned</th>
                  <th className="px-5 py-3 font-medium">Priority</th>
                  <th className="px-5 py-3 font-medium">Deadline</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleTasks.map((t) => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    client={clients.find((c) => c.id === t.clientId)}
                    member={users.find((u) => u.id === t.assignedTo)}
                    isAdmin={isAdmin}
                    onEdit={() => openEdit(t)}
                    onDelete={() => setConfirmDelete(t)}
                    onView={() => setViewing(t)}
                    onStatusChange={(status) => handleStatusChange(t, status)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit task" : "Create task"} wide>
        <TaskForm initial={editing} clients={clients} teamMembers={teamMembers} onSave={handleSave} onCancel={() => setModalOpen(false)} />
      </Modal>

      <TaskDetailModal
        task={viewing}
        client={clients.find((c) => c.id === viewing?.clientId)}
        member={users.find((u) => u.id === viewing?.assignedTo)}
        open={!!viewing}
        onClose={() => setViewing(null)}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete task?"
        message={`This will permanently remove "${confirmDelete?.title}".`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Analytics view (admin only)                                         */
/* ------------------------------------------------------------------ */

function Bar({ label, value, max, color = "bg-blue-500" }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-600 w-32 truncate flex-shrink-0">{label}</span>
      <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm text-slate-500 w-10 text-right flex-shrink-0">{value}</span>
    </div>
  );
}

function AnalyticsView({ clients, tasks, users }) {
  const teamMembers = users.filter((u) => u.role === "team");
  const maxTasksByMember = Math.max(1, ...teamMembers.map((m) => tasks.filter((t) => t.assignedTo === m.id).length));
  const maxSpend = Math.max(1, ...clients.map((c) => c.monthlySpend));

  const byStatus = TASK_STATUSES.map((s) => ({ label: s, value: tasks.filter((t) => t.status === s).length }));
  const byPriority = PRIORITIES.map((p) => ({ label: p, value: tasks.filter((t) => t.priority === p).length }));
  const byClientStatus = CLIENT_STATUSES.map((s) => ({ label: s, value: clients.filter((c) => c.status === s).length }));
  const totalSpend = clients.reduce((s, c) => s + Number(c.monthlySpend || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total Tasks" value={tasks.length} icon="tasks" />
        <StatCard label="Completion Rate" value={`${tasks.length ? Math.round((tasks.filter((t) => t.status === "Completed").length / tasks.length) * 100) : 0}%`} icon="check" accent="bg-emerald-50 text-emerald-600" />
        <StatCard label="Active Clients" value={clients.filter((c) => c.status === "Active").length} icon="store" accent="bg-violet-50 text-violet-600" />
        <StatCard label="Total Ad Spend" value={currency(totalSpend)} icon="dollar" accent="bg-amber-50 text-amber-600" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Tasks by status</h3>
          <div className="space-y-3">
            {byStatus.map((s) => (
              <Bar key={s.label} label={s.label} value={s.value} max={tasks.length} color={s.label === "Completed" ? "bg-emerald-500" : s.label === "In Progress" ? "bg-blue-500" : "bg-slate-400"} />
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Tasks by priority</h3>
          <div className="space-y-3">
            {byPriority.map((p) => (
              <Bar key={p.label} label={p.label} value={p.value} max={tasks.length} color={p.label === "Urgent" ? "bg-red-500" : p.label === "High" ? "bg-amber-500" : p.label === "Medium" ? "bg-blue-500" : "bg-slate-400"} />
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Tasks completed per team member</h3>
          <div className="space-y-3">
            {teamMembers.map((m) => (
              <Bar key={m.id} label={m.name} value={tasks.filter((t) => t.assignedTo === m.id).length} max={maxTasksByMember} />
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Clients by status</h3>
          <div className="space-y-3">
            {byClientStatus.map((s) => (
              <Bar key={s.label} label={s.label} value={s.value} max={clients.length} color="bg-violet-500" />
            ))}
          </div>
        </Card>
        <Card className="p-5 lg:col-span-2">
          <h3 className="font-semibold text-slate-800 mb-4">Monthly ad spend by client</h3>
          <div className="space-y-3">
            {clients.map((c) => (
              <Bar key={c.id} label={c.name} value={c.monthlySpend} max={maxSpend} color="bg-emerald-500" />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Settings view                                                       */
/* ------------------------------------------------------------------ */

function SettingsView({ currentUser, updateUsers, onResetData }) {
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [password, setPassword] = useState(currentUser.password);
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  function submit(e) {
    e.preventDefault();
    updateUsers((list) => list.map((u) => (u.id === currentUser.id ? { ...u, name, email, password } : u)));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6 max-w-xl">
      <Card className="p-5">
        <h3 className="font-semibold text-slate-800 mb-1">Profile</h3>
        <p className="text-sm text-slate-400 mb-4">Update your account details.</p>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Full name">
            <TextInput value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Email">
            <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Password">
            <TextInput value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          <div className="flex items-center gap-3">
            <PrimaryButton type="submit">Save changes</PrimaryButton>
            {saved && <span className="text-sm text-emerald-600 flex items-center gap-1"><Icon name="check" className="w-4 h-4" /> Saved</span>}
          </div>
        </form>
      </Card>

      {currentUser.role === "admin" && (
        <Card className="p-5">
          <h3 className="font-semibold text-slate-800 mb-1">Data</h3>
          <p className="text-sm text-slate-400 mb-4">Reset the portal back to its original sample data. This clears all clients, tasks and team members you've added or changed.</p>
          <SecondaryButton onClick={() => setConfirmReset(true)} className="text-red-600 border-red-200 hover:bg-red-50">
            Reset to sample data
          </SecondaryButton>
        </Card>
      )}

      <ConfirmDialog
        open={confirmReset}
        title="Reset all data?"
        message="This restores the original demo clients, tasks and team members and cannot be undone."
        onConfirm={() => {
          setConfirmReset(false);
          onResetData();
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Root App                                                            */
/* ------------------------------------------------------------------ */

const VIEW_META = {
  dashboard: { title: "Dashboard", subtitle: "Overview of clients, tasks and team progress" },
  clients: { title: "Clients", subtitle: "Manage client accounts and store details" },
  team: { title: "Team", subtitle: "Manage your team members" },
  tasks: { title: "Tasks", subtitle: "Create, assign and track task progress" },
  analytics: { title: "Analytics", subtitle: "Performance across clients and team" },
  settings: { title: "Settings", subtitle: "Manage your account" },
};

const SESSION_KEY = "ecom_team_portal_session_v1";

export default function App() {
  const [data, setData] = useState({ users: DEFAULT_USERS, clients: DEFAULT_CLIENTS, tasks: DEFAULT_TASKS });
  const [loading, setLoading] = useState(true);
  // Restore the logged-in user's id from localStorage so a page refresh
  // doesn't log them out. We only store the id, and re-resolve the full
  // user record once data has loaded from Supabase (below).
  const [currentUser, setCurrentUser] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function login(user) {
    setCurrentUser(user);
    try {
      localStorage.setItem(SESSION_KEY, user.id);
    } catch (e) {
      /* ignore storage errors */
    }
  }
  function logout() {
    setCurrentUser(null);
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {
      /* ignore storage errors */
    }
  }

  // Initial load from Supabase. If no row exists yet, seed it with the
  // sample data so the portal has something to show on first run.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const remote = await loadData();
      if (cancelled) return;
      let finalData;
      if (remote) {
        finalData = remote;
        setData(remote);
      } else {
        finalData = { users: DEFAULT_USERS, clients: DEFAULT_CLIENTS, tasks: DEFAULT_TASKS };
        setData(finalData);
        await saveData(finalData);
      }
      // Re-log the user in from the saved session id, now that we have
      // the real user list loaded from Supabase.
      try {
        const savedId = localStorage.getItem(SESSION_KEY);
        if (savedId) {
          const match = finalData.users.find((u) => u.id === savedId);
          if (match) setCurrentUser(match);
          else localStorage.removeItem(SESSION_KEY);
        }
      } catch (e) {
        /* ignore storage errors */
      }
      setSessionChecked(true);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist to Supabase whenever data changes (skip the very first render
  // while we're still loading).
  useEffect(() => {
    if (loading) return;
    saveData(data);
  }, [data, loading]);

  // Keep currentUser in sync if their own record is edited
  useEffect(() => {
    if (currentUser) {
      const fresh = data.users.find((u) => u.id === currentUser.id);
      if (fresh && JSON.stringify(fresh) !== JSON.stringify(currentUser)) setCurrentUser(fresh);
      if (!fresh) setCurrentUser(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.users]);

  function updateUsers(fn) {
    setData((d) => ({ ...d, users: fn(d.users) }));
  }
  function updateClients(fn) {
    setData((d) => ({ ...d, clients: fn(d.clients) }));
  }
  function updateTasks(fn) {
    setData((d) => ({ ...d, tasks: fn(d.tasks) }));
  }
  function resetData() {
    const fresh = { users: DEFAULT_USERS, clients: DEFAULT_CLIENTS, tasks: DEFAULT_TASKS };
    setData(fresh);
  }

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50 text-slate-500">
        Loading portal...
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen users={data.users} onLogin={login} />;
  }

  const isAdmin = currentUser.role === "admin";
  // Non-admins can't be on admin-only views
  const view = !isAdmin && (activeView === "team" || activeView === "analytics") ? "dashboard" : activeView;
  const meta = VIEW_META[view] || VIEW_META.dashboard;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 antialiased overflow-hidden">
      <Sidebar currentUser={currentUser} activeView={view} setActiveView={setActiveView} open={sidebarOpen} setOpen={setSidebarOpen} onLogout={logout} />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={meta.title} subtitle={meta.subtitle} onMenuClick={() => setSidebarOpen(true)} currentUser={currentUser} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {view === "dashboard" &&
            (isAdmin ? (
              <AdminDashboard clients={data.clients} tasks={data.tasks} users={data.users} setActiveView={setActiveView} />
            ) : (
              <TeamDashboard currentUser={currentUser} clients={data.clients} tasks={data.tasks} setActiveView={setActiveView} />
            ))}

          {view === "clients" && (
            <ClientsView currentUser={currentUser} clients={data.clients} tasks={data.tasks} users={data.users} updateClients={updateClients} isAdmin={isAdmin} />
          )}

          {view === "team" && isAdmin && <TeamView users={data.users} tasks={data.tasks} updateUsers={updateUsers} />}

          {view === "tasks" && (
            <TasksView currentUser={currentUser} clients={data.clients} tasks={data.tasks} users={data.users} updateTasks={updateTasks} isAdmin={isAdmin} />
          )}

          {view === "analytics" && isAdmin && <AnalyticsView clients={data.clients} tasks={data.tasks} users={data.users} />}

          {view === "settings" && <SettingsView currentUser={currentUser} updateUsers={updateUsers} onResetData={resetData} />}
        </main>
      </div>
    </div>
  );
}
