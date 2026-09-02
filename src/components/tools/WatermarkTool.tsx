"use client";

import { useState } from "react";
import { Stamp } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { ResultCard } from "@/components/ResultCard";
import { PrivacyNote } from "@/components/PrivacyNote";
import { addWatermark, downloadBlob, baseName } from "@/lib/pdf/operations";

export function WatermarkTool() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("سري");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Blob | null>(null);

  async function handleApply() {
    if (!file) return;
    if (!text.trim()) {
      setError("اكتب نص العلامة المائية أولاً.");
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      const blob = await addWatermark(file, text.trim());
      setResult(blob);
    } catch {
      setError("تعذر إضافة العلامة المائية.");
    } finally {
      setProcessing(false);
    }
  }

  if (result && file) {
    const name = `${baseName(file.name)}_موسوم.pdf`;
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
          hint="اختر ملف PDF لإضافة علامة مائية عليه"
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
        <label className="mb-2 block text-sm font-bold text-ink">نص العلامة المائية</label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="مثال: سري، مسودة، نسخة تجريبية..."
          className="w-full rounded-xl border border-line px-4 py-3 text-ink outline-none focus:border-brand"
        />
      </div>

      {text && (
        <div className="flex aspect-[3/4] max-w-[220px] items-center justify-center overflow-hidden rounded-xl border border-line bg-white">
          <span
            className="rotate-45 text-2xl font-extrabold text-brand/25"
            style={{ whiteSpace: "nowrap" }}
          >
            {text}
          </span>
        </div>
      )}

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <button
        onClick={handleApply}
        disabled={processing}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-4 font-bold text-white shadow-sm shadow-brand/30 transition hover:bg-brand-dark disabled:opacity-60"
      >
        <Stamp size={18} />
        {processing ? "جاري الإضافة..." : "إضافة العلامة المائية"}
      </button>
      <PrivacyNote />
    </div>
  );
}
