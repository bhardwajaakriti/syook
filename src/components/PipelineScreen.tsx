import { useMemo, useState } from "react";
import type { CRMState, Deal, Stage } from "../data/seed";
import {
  countryFlags,
  formatCurrency,
  formatResumeDate,
  isResumeOverdue,
  stageStyles,
  stalenessClasses,
  stalenessLabel,
  wholeDaysSince,
} from "../lib/format";

type StageFilter = "All" | Exclude<Stage, "Won" | "Lost">;
type SummaryFilter = "open" | "hold" | "stale";

interface PipelineScreenProps {
  state: CRMState;
  syncing: boolean;
  onOpenDeal: (dealId: string) => void;
  onToggleOffline: () => void;
  onResetDemo: () => void;
}

const stageFilters: StageFilter[] = ["All", "New", "In Progress", "On Hold", "Closing"];

export function PipelineScreen({
  state,
  syncing,
  onOpenDeal,
  onToggleOffline,
  onResetDemo,
}: PipelineScreenProps) {
  const [stageFilter, setStageFilter] = useState<StageFilter>("All");
  const [summaryFilter, setSummaryFilter] = useState<SummaryFilter>("open");
  const [closedOpen, setClosedOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const openDeals = useMemo(
    () => state.deals.filter((deal) => deal.stage !== "Won" && deal.stage !== "Lost"),
    [state.deals],
  );
  const closedDeals = useMemo(
    () => state.deals.filter((deal) => deal.stage === "Won" || deal.stage === "Lost"),
    [state.deals],
  );

  const counts = {
    open: openDeals.length,
    hold: openDeals.filter((deal) => deal.stage === "On Hold").length,
    stale: openDeals.filter((deal) => wholeDaysSince(deal.lastActivityAt) > 7).length,
  };

  const filteredDeals = openDeals
    .filter((deal) => {
      if (stageFilter !== "All") return deal.stage === stageFilter;
      if (summaryFilter === "hold") return deal.stage === "On Hold";
      if (summaryFilter === "stale") return wholeDaysSince(deal.lastActivityAt) > 7;
      return true;
    })
    .sort((a, b) => {
      const aOverdue = isResumeOverdue(a);
      const bOverdue = isResumeOverdue(b);
      if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
      return wholeDaysSince(b.lastActivityAt) - wholeDaysSince(a.lastActivityAt);
    });

  const chooseSummary = (filter: SummaryFilter) => {
    setSummaryFilter(filter);
    setStageFilter(filter === "hold" ? "On Hold" : "All");
  };

  const chooseStage = (filter: StageFilter) => {
    setStageFilter(filter);
    setSummaryFilter(filter === "On Hold" ? "hold" : "open");
  };

  return (
    <main className="safe-bottom flex flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white px-4 pb-3 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-normal text-slate-950">My Deals</h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                RM
              </span>
              <span>Rohan Mehta</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleOffline}
              disabled={syncing}
              className={`min-h-11 rounded-full border px-3 text-sm font-semibold ${
                state.offline
                  ? "border-amber-200 bg-amber-50 text-amber-800"
                  : "border-green-200 bg-green-50 text-green-700"
              } disabled:opacity-60`}
            >
              {state.offline ? "✈️ Offline" : "📶 Online"}
            </button>
            <div className="relative">
              <button
                type="button"
                aria-label="More options"
                onClick={() => setMenuOpen((open) => !open)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-xl font-bold text-slate-700"
              >
                ⋯
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-12 z-30 w-48 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onResetDemo();
                    }}
                    className="min-h-11 w-full rounded-md px-3 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    Reset demo data
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <SummaryButton
            label="Open"
            count={counts.open}
            active={summaryFilter === "open" && stageFilter === "All"}
            onClick={() => chooseSummary("open")}
          />
          <SummaryButton
            label="On Hold"
            count={counts.hold}
            active={summaryFilter === "hold"}
            onClick={() => chooseSummary("hold")}
          />
          <SummaryButton
            label="Stale >7d"
            count={counts.stale}
            active={summaryFilter === "stale"}
            onClick={() => chooseSummary("stale")}
          />
        </div>
      </header>

      <section className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {stageFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => chooseStage(filter)}
              className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold ${
                stageFilter === filter
                  ? "border-syook-blue bg-syook-blue text-white"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs font-semibold uppercase tracking-normal text-slate-500">
          Sorted by needs attention
        </p>
      </section>

      <section className="flex-1 space-y-3 px-4 py-4">
        {filteredDeals.map((deal) => (
          <DealCard key={deal.id} deal={deal} onOpen={() => onOpenDeal(deal.id)} />
        ))}

        {filteredDeals.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-5 text-center text-sm text-slate-600">
            No deals match this view.
          </div>
        )}

        <div className="pt-2">
          <button
            type="button"
            onClick={() => setClosedOpen((open) => !open)}
            className="flex min-h-12 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-4 text-left"
          >
            <span className="font-semibold text-slate-900">Closed ({closedDeals.length})</span>
            <span className="text-xl text-slate-500">{closedOpen ? "⌃" : "⌄"}</span>
          </button>
          {closedOpen && (
            <div className="mt-3 space-y-3">
              {closedDeals.map((deal) => (
                <DealCard key={deal.id} deal={deal} onOpen={() => onOpenDeal(deal.id)} closed />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function SummaryButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-16 rounded-lg border p-3 text-left ${
        active ? "border-syook-blue bg-blue-50" : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="text-xl font-bold text-slate-950">{count}</div>
      <div className="mt-1 text-xs font-semibold text-slate-600">{label}</div>
    </button>
  );
}

function DealCard({ deal, onOpen, closed = false }: { deal: Deal; onOpen: () => void; closed?: boolean }) {
  const overdue = isResumeOverdue(deal);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="block min-h-28 w-full rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold text-slate-950">{deal.clientName}</h2>
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600">{deal.product}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${stageStyles[deal.stage]}`}>
          {deal.stage}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="font-bold text-slate-950">{formatCurrency(deal.value, deal.currency)}</span>
        <span className="text-slate-500">
          {countryFlags[deal.country]} {deal.country}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {!closed && overdue ? (
          <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 ring-1 ring-red-200">
            Resume overdue
          </span>
        ) : (
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${stalenessClasses(deal.lastActivityAt)}`}>
            {stalenessLabel(deal.lastActivityAt)}
          </span>
        )}

        {deal.stage === "On Hold" && deal.hold && !overdue && (
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
            Resume {formatResumeDate(deal.hold.resumeDate)}
          </span>
        )}
      </div>
    </button>
  );
}
