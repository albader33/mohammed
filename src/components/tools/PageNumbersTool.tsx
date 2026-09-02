"use client";

import { useState } from "react";
import { Hash } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { ResultCard } from "@/components/ResultCard";
import { PrivacyNote } from "@/components/PrivacyNote";
import {
  addPageNumbers,
  downloadBlob,
  baseName,
  type PageNumberPosition,
} from "@/lib/pdf/operations";

const POSITIONS: { value: PageNumberPosition; label: string }[] = [
  { value: "bottom-center", label: "أسفل الوسط" },
  { value: "bottom-right", label: "أسفل اليمين" },
  { value: "bottom-left", label: "أسفل اليسار" },
];

export function PageNumbersTool() {
  const [file, setFile] = useState<File | null>(null);
  const [position, setPosition] = useState<PageNumberPosition>("bottom-center");
  const [startAt, setStartAt] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Blob | null>(null);

  async function handleApply() {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const blob = await addPageNumbers(file, { position, startAt });
      setResult(blob);
    } catch {
      setError("تعذرت إضافة الترقيم.");
    } finally {
      setProcessing(false);
    }
  }

  if (result && file) {
    const name = `${baseName(file.name)}_مرقّم.pdf`;
    return (
      <ResultCard
        files={[{ name, onDownload: () => downloadBlob(result, name) }]}
        onReset={() => {
          setResult(null);
          setFile(null);
        }}
      />
    );
  }

  if (!file) {
    return (
      <div>
        <FileDropzone
          onFiles={(files) => setFile(files[0])}
          accept={{ "application/pdf": [".pdf"] }}
          label="اسحب وأفلت ملف PDF هنا"
          hint="اختر ملف PDF لإضافة ترقيم الصفحات"
        />
        <PrivacyNote />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-line bg-surface px-5 py-4">
        <p className="font-bold text-ink">{file.name}</p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-ink">موقع الرقم</label>
        <div className="flex flex-wrap gap-2">
          {POSITIONS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPosition(p.value)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                position === p.value
                  ? "bg-brand text-white"
                  : "border border-line text-ink-soft hover:border-brand/40"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-ink">البدء من رقم</label>
        <input
          type="number"
          min={1}
          value={startAt}
          onChange={(e) => setStartAt(Number(e.target.value))}
          className="w-28 rounded-xl border border-line px-4 py-2.5 text-center outline-none focus:border-brand"
        />
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <button
        onClick={handleApply}
        disabled={processing}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-4 font-bold text-white shadow-sm shadow-brand/30 transition hover:bg-brand-dark disabled:opacity-60"
      >
        <Hash size={18} />
        {processing ? "جاري الترقيم..." : "إضافة ترقيم الصفحات"}
      </button>
      <PrivacyNote />
    </div>
  );
}
