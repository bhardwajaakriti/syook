import { useState } from "react";

interface QuickNoteSheetProps {
  onClose: () => void;
  onSave: (note: string) => void;
}

export function QuickNoteSheet({ onClose, onSave }: QuickNoteSheetProps) {
  const [note, setNote] = useState("");
  const canSave = note.trim().length > 0;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/35" role="dialog" aria-modal="true">
      <div className="safe-bottom w-full max-w-[420px] rounded-t-2xl bg-white p-4 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Quick Note</h2>
            <p className="mt-1 text-sm text-slate-600">Add context to the deal ticket.</p>
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

        <label className="mt-4 block text-sm font-bold text-slate-700" htmlFor="quick-note">
          Note
        </label>
        <textarea
          id="quick-note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={4}
          placeholder="Client asked for updated commercials after site walk-through."
          className="mt-2 w-full resize-none rounded-lg border border-slate-300 p-3 outline-none focus:border-syook-blue"
        />

        <button
          type="button"
          disabled={!canSave}
          onClick={() => onSave(note)}
          className="mt-4 min-h-12 w-full rounded-lg bg-syook-blue px-4 font-bold text-white disabled:bg-slate-300"
        >
          Save
        </button>
      </div>
    </div>
  );
}
