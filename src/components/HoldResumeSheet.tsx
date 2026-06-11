import { useMemo, useState } from "react";
import type { Deal } from "../data/seed";
import { formatResumeDate } from "../lib/format";

interface HoldResumeSheetProps {
  deal: Deal;
  onClose: () => void;
  onHold: (reason: string, resumeDate: string) => void;
  onResume: () => void;
}

const reasons = [
  "Client budget freeze",
  "Decision-maker unavailable",
  "Procurement delay",
  "Site shutdown",
  "Other",
];

const defaultResumeDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().slice(0, 10);
};

const today = () => new Date().toISOString().slice(0, 10);

export function HoldResumeSheet({ deal, onClose, onHold, onResume }: HoldResumeSheetProps) {
  const [reason, setReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [resumeDate, setResumeDate] = useState(() => defaultResumeDate());
  const isHeld = deal.stage === "On Hold";
  const finalReason = useMemo(() => (reason === "Other" ? otherReason.trim() : reason), [otherReason, reason]);
  const canSave = Boolean(finalReason && resumeDate);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/35" role="dialog" aria-modal="true">
      <div className="safe-bottom w-full max-w-[420px] rounded-t-2xl bg-white p-4 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-950">{isHeld ? "Resume Deal" : "Put On Hold"}</h2>
            <p className="mt-1 text-sm text-slate-600">{deal.clientName}</p>
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

        {isHeld ? (
          <div className="mt-5">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-5 text-amber-900">
              <strong>{deal.hold?.reason}</strong>
              <br />
              Resume date: {deal.hold ? formatResumeDate(deal.hold.resumeDate) : "Not set"}
            </div>
            <button
              type="button"
              onClick={onResume}
              className="mt-4 min-h-12 w-full rounded-lg bg-syook-blue px-4 font-bold text-white"
            >
              Resume Deal
            </button>
          </div>
        ) : (
          <>
            <label className="mt-4 block text-sm font-bold text-slate-700" htmlFor="hold-reason">
              Reason
            </label>
            <select
              id="hold-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 outline-none focus:border-syook-blue"
            >
              <option value="">Select reason</option>
              {reasons.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            {reason === "Other" && (
              <>
                <label className="mt-4 block text-sm font-bold text-slate-700" htmlFor="other-reason">
                  Other reason
                </label>
                <input
                  id="other-reason"
                  value={otherReason}
                  onChange={(event) => setOtherReason(event.target.value)}
                  className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-syook-blue"
                  placeholder="Enter reason"
                />
              </>
            )}

            <label className="mt-4 block text-sm font-bold text-slate-700" htmlFor="resume-date">
              Resume date
            </label>
            <input
              id="resume-date"
              type="date"
              min={today()}
              value={resumeDate}
              onChange={(event) => setResumeDate(event.target.value)}
              className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-syook-blue"
            />

            <button
              type="button"
              disabled={!canSave}
              onClick={() => onHold(finalReason, resumeDate)}
              className="mt-4 min-h-12 w-full rounded-lg bg-syook-blue px-4 font-bold text-white disabled:bg-slate-300"
            >
              Put on Hold
            </button>
          </>
        )}
      </div>
    </div>
  );
}
