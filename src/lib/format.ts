import type { Country, Deal, Stage } from "../data/seed";

const DAY_MS = 24 * 60 * 60 * 1000;

const currencyLocales: Record<string, string> = {
  INR: "en-IN",
  AED: "en-US",
  GBP: "en-US",
  MYR: "en-US",
  BRL: "en-US",
  AUD: "en-US",
};

export const countryFlags: Record<Country, string> = {
  India: "🇮🇳",
  UAE: "🇦🇪",
  England: "🇬🇧",
  Malaysia: "🇲🇾",
  Brazil: "🇧🇷",
  Australia: "🇦🇺",
};

export const stageStyles: Record<Stage, string> = {
  New: "bg-slate-100 text-slate-700 ring-slate-200",
  "In Progress": "bg-blue-50 text-blue-700 ring-blue-200",
  "On Hold": "bg-amber-50 text-amber-700 ring-amber-200",
  Closing: "bg-violet-50 text-violet-700 ring-violet-200",
  Won: "bg-green-50 text-green-700 ring-green-200",
  Lost: "bg-gray-100 text-gray-700 ring-gray-200",
};

export function formatCurrency(value: number, currency: string) {
  const locale = currencyLocales[currency] ?? "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: currency === "INR" ? "narrowSymbol" : "code",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function wholeDaysSince(iso: string, now = Date.now()) {
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / DAY_MS));
}

export function stalenessLabel(iso: string) {
  const days = wholeDaysSince(iso);
  if (days === 0) return "Updated today";
  if (days === 1) return "Updated 1d ago";
  return `Updated ${days}d ago`;
}

export function stalenessTone(iso: string) {
  const days = wholeDaysSince(iso);
  if (days < 3) return "green";
  if (days <= 7) return "amber";
  return "red";
}

export function stalenessClasses(iso: string) {
  const tone = stalenessTone(iso);
  if (tone === "green") return "bg-green-50 text-green-700 ring-green-200";
  if (tone === "amber") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-red-50 text-red-700 ring-red-200";
}

export function isResumeOverdue(deal: Deal) {
  if (deal.stage !== "On Hold" || !deal.hold?.resumeDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const resumeDate = new Date(`${deal.hold.resumeDate}T00:00:00`);
  return resumeDate < today;
}

export function formatResumeDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${dateString}T00:00:00`));
}

export function relativeTime(iso: string) {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / (60 * 1000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "1d ago";
  return `${days}d ago`;
}

export function formatSize(sizeKB: number) {
  if (sizeKB < 1024) return `${sizeKB} KB`;
  return `${(sizeKB / 1024).toFixed(sizeKB >= 10240 ? 0 : 1)} MB`;
}
