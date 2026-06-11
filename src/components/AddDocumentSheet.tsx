import { useState } from "react";
import type { DocType } from "../data/seed";
import { formatSize } from "../lib/format";

interface AddDocumentSheetProps {
  onClose: () => void;
  onAttach: (name: string, docType: DocType, sizeKB: number) => void;
}

const docTypes: DocType[] = ["Proposal", "BOQ", "Site Survey", "PO", "Contract", "Other"];

const photoFiles = [
  { name: "Site_Photo_Entrance.jpg", sizeKB: 1860 },
  { name: "Forklift_Aisle_Scan.jpg", sizeKB: 2420 },
];

const documentFiles = [
  { name: "Commercial_Proposal.pdf", sizeKB: 980 },
  { name: "Updated_BOQ.pdf", sizeKB: 760 },
  { name: "PO_Signed_Copy.pdf", sizeKB: 430 },
];

type FakeFile = (typeof photoFiles)[number];

export function AddDocumentSheet({ onClose, onAttach }: AddDocumentSheetProps) {
  const [file, setFile] = useState<FakeFile | null>(null);
  const [source, setSource] = useState<"photo" | "file" | null>(null);
  const [docType, setDocType] = useState<DocType>("Proposal");
  const visibleFiles = source === "photo" ? photoFiles : source === "file" ? documentFiles : [];

  const selectSource = (nextSource: "photo" | "file") => {
    setSource(nextSource);
    setFile(nextSource === "photo" ? photoFiles[0] : documentFiles[0]);
    if (nextSource === "photo") setDocType("Site Survey");
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/35" role="dialog" aria-modal="true">
      <div className="safe-bottom w-full max-w-[420px] rounded-t-2xl bg-white p-4 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Add Document</h2>
            <p className="mt-1 text-sm text-slate-600">Metadata only for this prototype.</p>
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

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => selectSource("photo")}
            className={`min-h-12 rounded-lg border px-3 text-sm font-bold ${
              source === "photo" ? "border-syook-blue bg-blue-50 text-syook-blue" : "border-slate-200 text-slate-800"
            }`}
          >
            Take Photo
          </button>
          <button
            type="button"
            onClick={() => selectSource("file")}
            className={`min-h-12 rounded-lg border px-3 text-sm font-bold ${
              source === "file" ? "border-syook-blue bg-blue-50 text-syook-blue" : "border-slate-200 text-slate-800"
            }`}
          >
            Choose File
          </button>
        </div>

        {visibleFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            {visibleFiles.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => setFile(item)}
                className={`flex min-h-12 w-full items-center justify-between rounded-lg border px-3 text-left ${
                  file?.name === item.name ? "border-syook-blue bg-blue-50" : "border-slate-200"
                }`}
              >
                <span className="truncate text-sm font-semibold text-slate-900">{item.name}</span>
                <span className="ml-3 shrink-0 text-xs font-semibold text-slate-500">{formatSize(item.sizeKB)}</span>
              </button>
            ))}
          </div>
        )}

        <div className="mt-4">
          <p className="text-sm font-bold text-slate-700">Doc type</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {docTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setDocType(type)}
                className={`min-h-11 rounded-full border px-3 text-sm font-bold ${
                  docType === type ? "border-syook-blue bg-syook-blue text-white" : "border-slate-200 text-slate-700"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          disabled={!file}
          onClick={() => file && onAttach(file.name, docType, file.sizeKB)}
          className="mt-4 min-h-12 w-full rounded-lg bg-syook-blue px-4 font-bold text-white disabled:bg-slate-300"
        >
          Attach
        </button>
      </div>
    </div>
  );
}
