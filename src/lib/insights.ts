import type { Activity, Deal, Doc } from "../data/seed";
import { formatResumeDate, isResumeOverdue, wholeDaysSince } from "./format";

type SheetAction = "stage" | "hold" | "doc" | "note";

export interface FocusItem {
  deal: Deal;
  label: string;
  tone: "red" | "amber" | "blue";
}

export interface SuggestedAction {
  label: string;
  sheet: SheetAction;
  tone: "red" | "amber" | "blue";
}

export function docsForDeal(docs: Doc[], dealId: string) {
  return docs.filter((doc) => doc.dealId === dealId);
}

export function activitiesForDeal(activities: Activity[], dealId: string) {
  return activities.filter((activity) => activity.dealId === dealId);
}

export function getSuggestedAction(deal: Deal, docs: Doc[]): SuggestedAction {
  if (isResumeOverdue(deal)) {
    return { label: "Resume overdue", sheet: "hold", tone: "red" };
  }

  if (deal.stage === "On Hold") {
    return {
      label: deal.hold ? `Resume ${formatResumeDate(deal.hold.resumeDate)}` : "Resume",
      sheet: "hold",
      tone: "amber",
    };
  }

  if (wholeDaysSince(deal.lastActivityAt) > 7) {
    return { label: "Update stage", sheet: "stage", tone: "red" };
  }

  if (docsForDeal(docs, deal.id).length === 0) {
    return { label: "Add document", sheet: "doc", tone: "blue" };
  }

  if (deal.stage === "Closing") {
    return { label: "Add follow-up note", sheet: "note", tone: "blue" };
  }

  return { label: "Add note", sheet: "note", tone: "blue" };
}

export function buildFocusQueue(deals: Deal[], docs: Doc[]) {
  const openDeals = deals.filter((deal) => deal.stage !== "Won" && deal.stage !== "Lost");
  const queue: FocusItem[] = [];
  const used = new Set<string>();

  const add = (deal: Deal, label: string, tone: FocusItem["tone"]) => {
    if (used.has(deal.id)) return;
    used.add(deal.id);
    queue.push({ deal, label, tone });
  };

  openDeals
    .filter(isResumeOverdue)
    .sort((a, b) => new Date(a.hold?.resumeDate ?? "").getTime() - new Date(b.hold?.resumeDate ?? "").getTime())
    .forEach((deal) => add(deal, "Resume overdue", "red"));

  openDeals
    .filter((deal) => wholeDaysSince(deal.lastActivityAt) > 7)
    .sort((a, b) => wholeDaysSince(b.lastActivityAt) - wholeDaysSince(a.lastActivityAt))
    .forEach((deal) => add(deal, `${wholeDaysSince(deal.lastActivityAt)}d stale`, "red"));

  openDeals
    .filter((deal) => docsForDeal(docs, deal.id).length === 0)
    .sort((a, b) => wholeDaysSince(b.lastActivityAt) - wholeDaysSince(a.lastActivityAt))
    .forEach((deal) => add(deal, "No documents", "amber"));

  openDeals
    .filter((deal) => deal.stage === "Closing")
    .sort((a, b) => wholeDaysSince(b.lastActivityAt) - wholeDaysSince(a.lastActivityAt))
    .forEach((deal) => add(deal, "Closing follow-up", "blue"));

  return queue.slice(0, 3);
}
