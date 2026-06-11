import { useMemo, useState } from "react";
import type { Deal, Stage } from "../data/seed";
import { stageStyles } from "../lib/format";

interface UpdateStageSheetProps {
  deal: Deal;
  onClose: () => void;
  onSave: (stage: Stage, note: string, openedAt: number) => void;
}

const stageOptions: Stage[] = ["New", "In Progress", "Closing", "Won", "Lost"];

export function UpdateStageSheet({ deal, onClose, onSave }: UpdateStageSheetProps) {
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [note, setNote] = useState("");
  const openedAt = useMemo(() => Date.now(), []);
  const options = stageOptions.filter((stage) => stage !== deal.stage);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/35 px-0" role="dialog" aria-modal="true">
      <div className="safe-bottom w-full max-w-[420px] rounded-t-2xl bg-white p-4 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Update Stage</h2>
            <p className="mt-1 text-sm text-slate-600">Use Hold for halt reason and resume date.</p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-xl font-bold text-slate-700"
          >
            ×
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {options.map((stage) => (
            <button
              key={stage}
              type="button"
              onClick={() => setSelectedStage(stage)}
              className={`flex min-h-14 w-full items-center justify-between rounded-lg border px-4 text-left ${
                selectedStage === stage ? "border-syook-blue bg-blue-50" : "border-slate-200 bg-white"
              }`}
            >
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${stageStyles[stage]}`}>{stage}</span>
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                  selectedStage === stage ? "border-syook-blue bg-syook-blue" : "border-slate-300"
                }`}
              >
                {selectedStage === stage && <span className="h-2 w-2 rounded-full bg-white" />}
              </span>
            </button>
          ))}
        </div>

        <label className="mt-4 block text-sm font-bold text-slate-700" htmlFor="stage-note">
          Note
        </label>
        <input
          id="stage-note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Optional context"
          className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-syook-blue"
        />

        <button
          type="button"
          disabled={!selectedStage}
          onClick={() => selectedStage && onSave(selectedStage, note, openedAt)}
          className="mt-4 min-h-12 w-full rounded-lg bg-syook-blue px-4 font-bold text-white disabled:bg-slate-300"
        >
          Save
        </button>
      </div>
    </div>
  );
}
