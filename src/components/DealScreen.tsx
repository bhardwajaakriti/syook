import type { Activity, Deal, Doc } from "../data/seed";
import {
  countryFlags,
  formatCurrency,
  formatSize,
  relativeTime,
  stageStyles,
  stalenessClasses,
  stalenessLabel,
  wholeDaysSince,
} from "../lib/format";
import { getSuggestedAction } from "../lib/insights";

type Sheet = "stage" | "hold" | "doc" | "note";
type Tab = "Activity" | "Documents";

interface DealScreenProps {
  deal: Deal;
  activities: Activity[];
  docs: Doc[];
  activeTab: Tab;
  onBack: () => void;
  onOpenSheet: (sheet: Sheet) => void;
  onSetTab: (tab: Tab) => void;
}

const activityIcon: Record<Activity["type"], string> = {
  stage_change: "↗",
  hold: "Ⅱ",
  resume: "▶",
  document: "▣",
  note: "✎",
};

export function DealScreen({
  deal,
  activities,
  docs,
  activeTab,
  onBack,
  onOpenSheet,
  onSetTab,
}: DealScreenProps) {
  const staleDays = wholeDaysSince(deal.lastActivityAt);
  const suggestedAction = getSuggestedAction(deal, docs);

  return (
    <main className="safe-bottom flex flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white px-4 pb-4 pt-3">
        <div className="flex items-start gap-3">
          <button
            type="button"
            aria-label="Back to pipeline"
            onClick={onBack}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 text-2xl font-semibold text-slate-800"
          >
            ‹
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="line-clamp-2 text-xl font-bold leading-6 text-slate-950">{deal.clientName}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-slate-950">{formatCurrency(deal.value, deal.currency)}</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${stageStyles[deal.stage]}`}>
                {deal.stage}
              </span>
              <span className="text-sm text-slate-600">
                {countryFlags[deal.country]} {deal.country}
              </span>
            </div>
          </div>
        </div>
      </header>

      <section className="space-y-4 px-4 py-4">
        {staleDays > 7 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold leading-5 text-amber-900">
            No update in {staleDays} days - a 30-second update keeps your pipeline clean.
          </div>
        )}

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm leading-5 text-slate-600">{deal.product}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${stalenessClasses(deal.lastActivityAt)}`}>
              {stalenessLabel(deal.lastActivityAt)}
            </span>
            {deal.hold && (
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                {deal.hold.reason}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <HealthTile label="Docs" value={String(docs.length)} />
          <HealthTile label="Activity" value={String(activities.length)} />
          <button
            type="button"
            onClick={() => onOpenSheet(suggestedAction.sheet)}
            className={`min-h-16 rounded-lg border p-3 text-left ${suggestedToneClass(suggestedAction.tone)}`}
          >
            <span className="block text-xs font-bold text-slate-600">Next</span>
            <span className="mt-1 block text-sm font-bold leading-4 text-slate-950">{suggestedAction.label}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <ActionButton label="Update Stage" icon="↗" onClick={() => onOpenSheet("stage")} />
          <ActionButton label="Add Doc" icon="▣" onClick={() => onOpenSheet("doc")} />
          <ActionButton label="Note" icon="✎" onClick={() => onOpenSheet("note")} />
          <ActionButton
            label={deal.stage === "On Hold" ? "Resume" : "Hold"}
            icon={deal.stage === "On Hold" ? "▶" : "Ⅱ"}
            onClick={() => onOpenSheet("hold")}
          />
        </div>

        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="grid grid-cols-2 border-b border-slate-200 p-1">
            {(["Activity", "Documents"] as Tab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => onSetTab(tab)}
                className={`min-h-11 rounded-md text-sm font-bold ${
                  activeTab === tab ? "bg-syook-blue text-white" : "text-slate-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "Activity" ? (
            <div className="divide-y divide-slate-100">
              {activities.map((activity) => (
                <div key={activity.id} className="flex gap-3 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                    {activityIcon[activity.type]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold leading-5 text-slate-950">{activity.summary}</p>
                      {activity.pendingSync && (
                        <span className="shrink-0 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700 ring-1 ring-amber-200">
                          queued
                        </span>
                      )}
                    </div>
                    {activity.detail && <p className="mt-1 text-sm leading-5 text-slate-600">{activity.detail}</p>}
                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      {activity.actor} · {relativeTime(activity.ts)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <DocumentsTab docs={docs} onAddDoc={() => onOpenSheet("doc")} />
          )}
        </div>
      </section>
    </main>
  );
}

function HealthTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-h-16 rounded-lg border border-slate-200 bg-white p-3">
      <span className="block text-xs font-bold text-slate-500">{label}</span>
      <span className="mt-1 block text-xl font-bold text-slate-950">{value}</span>
    </div>
  );
}

function suggestedToneClass(tone: "red" | "amber" | "blue") {
  if (tone === "red") return "border-red-200 bg-red-50";
  if (tone === "amber") return "border-amber-200 bg-amber-50";
  return "border-blue-200 bg-blue-50";
}

function ActionButton({ label, icon, onClick }: { label: string; icon: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-16 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 text-left shadow-sm"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-lg font-bold text-syook-blue">
        {icon}
      </span>
      <span className="text-sm font-bold leading-5 text-slate-950">{label}</span>
    </button>
  );
}

function DocumentsTab({ docs, onAddDoc }: { docs: Doc[]; onAddDoc: () => void }) {
  if (docs.length === 0) {
    return (
      <div className="p-5 text-center">
        <p className="text-sm font-semibold text-slate-700">No documents yet</p>
        <button
          type="button"
          onClick={onAddDoc}
          className="mt-4 min-h-11 rounded-lg bg-syook-blue px-4 text-sm font-bold text-white"
        >
          Add Doc
        </button>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {docs.map((doc) => (
        <div key={doc.id} className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">
            PDF
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-700 ring-1 ring-blue-200">
                {doc.docType}
              </span>
              {doc.pendingSync && (
                <span className="rounded-full bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700 ring-1 ring-amber-200">
                  queued
                </span>
              )}
            </div>
            <p className="mt-2 truncate font-semibold text-slate-950">{doc.name}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              {formatSize(doc.sizeKB)} · {relativeTime(doc.ts)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
