import { useEffect, useMemo, useState } from "react";
import { AddDocumentSheet } from "./components/AddDocumentSheet";
import { DealScreen } from "./components/DealScreen";
import { HoldResumeSheet } from "./components/HoldResumeSheet";
import { PipelineScreen } from "./components/PipelineScreen";
import { QuickNoteSheet } from "./components/QuickNoteSheet";
import { UpdateStageSheet } from "./components/UpdateStageSheet";
import type { Activity, CRMState, Doc, DocType, Stage } from "./data/seed";
import { clearPendingSync, loadState, queuedCount, resetState, saveState } from "./lib/store";

type View = "pipeline" | "deal";
type Sheet = "stage" | "hold" | "doc" | "note" | null;
type Tab = "Activity" | "Documents";

interface Toast {
  id: number;
  message: string;
}

const actor = "Rohan Mehta" as const;

const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

export default function App() {
  const [state, setState] = useState<CRMState>(() => loadState());
  const [view, setView] = useState<View>("pipeline");
  const [activeDealId, setActiveDealId] = useState<string | null>(null);
  const [activeSheet, setActiveSheet] = useState<Sheet>(null);
  const [activeTab, setActiveTab] = useState<Tab>("Activity");
  const [toast, setToast] = useState<Toast | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncingCount, setSyncingCount] = useState(0);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const activeDeal = useMemo(
    () => state.deals.find((deal) => deal.id === activeDealId) ?? null,
    [activeDealId, state.deals],
  );

  const activeActivities = useMemo(
    () =>
      activeDealId
        ? state.activities
            .filter((activity) => activity.dealId === activeDealId)
            .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
        : [],
    [activeDealId, state.activities],
  );

  const activeDocs = useMemo(
    () =>
      activeDealId
        ? state.docs
            .filter((doc) => doc.dealId === activeDealId)
            .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
        : [],
    [activeDealId, state.docs],
  );

  const queueTotal = queuedCount(state);

  const showToast = (message: string) => {
    setToast({ id: Date.now(), message });
  };

  const openDeal = (dealId: string) => {
    setActiveDealId(dealId);
    setActiveTab("Activity");
    setView("deal");
  };

  const goBackToPipeline = () => {
    setActiveSheet(null);
    setView("pipeline");
  };

  const resetDemo = () => {
    const confirmed = window.confirm("Reset demo data and return to the pipeline?");
    if (!confirmed) return;
    const seeded = resetState();
    setState(seeded);
    setActiveDealId(null);
    setActiveSheet(null);
    setView("pipeline");
    showToast("Demo data reset");
  };

  const toggleOffline = () => {
    if (syncing) return;

    if (!state.offline) {
      setState((current) => ({ ...current, offline: true }));
      showToast("Offline mode on");
      return;
    }

    const queued = queuedCount(state);
    setSyncingCount(queued);
    setSyncing(true);
    setState((current) => ({ ...current, offline: false }));
    window.setTimeout(() => {
      setState((current) => clearPendingSync(current));
      setSyncing(false);
      showToast(queued > 0 ? `Synced ${queued} updates` : "Back online");
    }, 1500);
  };

  const appendActivity = (activity: Activity, dealId: string, now: string) => {
    setState((current) => ({
      ...current,
      deals: current.deals.map((deal) => (deal.id === dealId ? { ...deal, lastActivityAt: now } : deal)),
      activities: [...current.activities, activity],
    }));
  };

  const updateStage = (stage: Stage, note: string, openedAt: number) => {
    if (!activeDeal) return;
    const now = new Date().toISOString();
    const pendingSync = state.offline;
    const activity: Activity = {
      id: makeId("act"),
      dealId: activeDeal.id,
      type: "stage_change",
      summary: `Moved to ${stage}`,
      detail: note.trim() || undefined,
      actor,
      ts: now,
      pendingSync,
    };

    setState((current) => ({
      ...current,
      deals: current.deals.map((deal) =>
        deal.id === activeDeal.id ? { ...deal, stage, hold: undefined, lastActivityAt: now } : deal,
      ),
      activities: [...current.activities, activity],
    }));
    setActiveSheet(null);

    if (pendingSync) {
      showToast("Queued - will sync");
    } else {
      const elapsedSeconds = Math.max(1, Math.round((Date.now() - openedAt) / 1000));
      showToast(`Updated in ${elapsedSeconds}s ⚡`);
    }
  };

  const putOnHold = (reason: string, resumeDate: string) => {
    if (!activeDeal) return;
    const now = new Date().toISOString();
    const pendingSync = state.offline;
    const activity: Activity = {
      id: makeId("act"),
      dealId: activeDeal.id,
      type: "hold",
      summary: "Put on hold",
      detail: `${reason}; resume ${resumeDate}`,
      actor,
      ts: now,
      pendingSync,
    };

    setState((current) => ({
      ...current,
      deals: current.deals.map((deal) =>
        deal.id === activeDeal.id
          ? {
              ...deal,
              stage: "On Hold",
              hold: { reason, resumeDate },
              lastActivityAt: now,
            }
          : deal,
      ),
      activities: [...current.activities, activity],
    }));
    setActiveSheet(null);
    showToast(pendingSync ? "Queued - will sync" : "Deal put on hold");
  };

  const resumeDeal = () => {
    if (!activeDeal) return;
    const now = new Date().toISOString();
    const pendingSync = state.offline;
    const activity: Activity = {
      id: makeId("act"),
      dealId: activeDeal.id,
      type: "resume",
      summary: "Resumed deal",
      detail: "Returned to In Progress",
      actor,
      ts: now,
      pendingSync,
    };

    setState((current) => ({
      ...current,
      deals: current.deals.map((deal) =>
        deal.id === activeDeal.id
          ? { ...deal, stage: "In Progress", hold: undefined, lastActivityAt: now }
          : deal,
      ),
      activities: [...current.activities, activity],
    }));
    setActiveSheet(null);
    showToast(pendingSync ? "Queued - will sync" : "Deal resumed");
  };

  const attachDoc = (name: string, docType: DocType, sizeKB: number) => {
    if (!activeDeal) return;
    const now = new Date().toISOString();
    const pendingSync = state.offline;
    const doc: Doc = {
      id: makeId("doc"),
      dealId: activeDeal.id,
      name,
      docType,
      sizeKB,
      uploadedBy: actor,
      ts: now,
      pendingSync,
    };
    const activity: Activity = {
      id: makeId("act"),
      dealId: activeDeal.id,
      type: "document",
      summary: `Attached ${name}`,
      detail: `${docType} - ${sizeKB.toLocaleString("en-US")} KB`,
      actor,
      ts: now,
      pendingSync,
    };

    setState((current) => ({
      ...current,
      deals: current.deals.map((deal) => (deal.id === activeDeal.id ? { ...deal, lastActivityAt: now } : deal)),
      docs: [...current.docs, doc],
      activities: [...current.activities, activity],
    }));
    setActiveSheet(null);
    setActiveTab("Documents");
    showToast(pendingSync ? "Queued - will sync" : "Document attached");
  };

  const saveNote = (note: string) => {
    if (!activeDeal) return;
    const now = new Date().toISOString();
    const pendingSync = state.offline;
    const activity: Activity = {
      id: makeId("act"),
      dealId: activeDeal.id,
      type: "note",
      summary: "Added note",
      detail: note.trim(),
      actor,
      ts: now,
      pendingSync,
    };

    appendActivity(activity, activeDeal.id, now);
    setActiveSheet(null);
    showToast(pendingSync ? "Queued - will sync" : "Note saved");
  };

  return (
    <div className="phone-page">
      <div className="phone-frame">
        <div className="phone-scroll relative flex min-h-screen flex-col overflow-hidden bg-syook-bg text-slate-950">
          {(state.offline || queueTotal > 0 || syncing) && (
            <div className="sticky top-0 z-30 border-b border-slate-200 bg-white px-4 py-2 text-center text-sm font-semibold text-slate-800">
              {syncing ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-syook-blue" />
                  Syncing {syncingCount} updates
                </span>
              ) : (
                `${queueTotal} updates queued`
              )}
            </div>
          )}

          {view === "pipeline" ? (
            <PipelineScreen
              state={state}
              syncing={syncing}
              onOpenDeal={openDeal}
              onToggleOffline={toggleOffline}
              onResetDemo={resetDemo}
            />
          ) : activeDeal ? (
            <DealScreen
              deal={activeDeal}
              activities={activeActivities}
              docs={activeDocs}
              activeTab={activeTab}
              onBack={goBackToPipeline}
              onOpenSheet={setActiveSheet}
              onSetTab={setActiveTab}
            />
          ) : null}

          {activeDeal && activeSheet === "stage" && (
            <UpdateStageSheet deal={activeDeal} onClose={() => setActiveSheet(null)} onSave={updateStage} />
          )}
          {activeDeal && activeSheet === "hold" && (
            <HoldResumeSheet
              deal={activeDeal}
              onClose={() => setActiveSheet(null)}
              onHold={putOnHold}
              onResume={resumeDeal}
            />
          )}
          {activeDeal && activeSheet === "doc" && (
            <AddDocumentSheet onClose={() => setActiveSheet(null)} onAttach={attachDoc} />
          )}
          {activeDeal && activeSheet === "note" && (
            <QuickNoteSheet onClose={() => setActiveSheet(null)} onSave={saveNote} />
          )}

          {toast && (
            <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 mx-auto flex max-w-[420px] justify-center px-4">
              <div className="rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-xl">
                {toast.message}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
