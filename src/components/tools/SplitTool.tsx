"use client";

import { useEffect, useState } from "react";
import { Plus, Scissors, Trash2 } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { ResultCard } from "@/components/ResultCard";
import { PrivacyNote } from "@/components/PrivacyNote";
import { getPdfPageCount } from "@/lib/pdf/core";
import { splitPdf, downloadBlob, type PageRange } from "@/lib/pdf/operations";
import JSZip from "jszip";

export function SplitTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [ranges, setRanges] = useState<PageRange[]>([{ from: 1, to: 1 }]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{ blob: Blob; name: string }[] | null>(null);

  useEffect(() => {
    if (!file) return;
    file.arrayBuffer().then(async (buf) => {
      const count = await getPdfPageCount(buf);
      setPageCount(count);
      setRanges([{ from: 1, to: count }]);
    });
  }, [file]);

  function updateRange(idx: number, patch: Partial<PageRange>) {
    setRanges((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }

  function addRange() {
    setRanges((prev) => [...prev, { from: 1, to: pageCount ?? 1 }]);
  }

  function removeRange(idx: number) {
    setRanges((prev) => prev.filter((_, i) => i !== idx));
  }

  function splitEveryPage() {
    if (!pageCount) return;
    setRanges(Array.from({ length: pageCount }, (_, i) => ({ from: i + 1, to: i + 1 })));
  }

  async function handleSplit() {
    if (!file || !pageCount) return;
    const invalid = ranges.some(
      (r) => r.from < 1 || r.to > pageCount || r.from > r.to
    );
    if (invalid) {
      setError(`تأكد أن كل نطاق بين 1 و ${pageCount} وأن رقم البداية أصغر أو يساوي النهاية.`);
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      const out = await splitPdf(file, ranges);
      setResults(out);
    } catch {
      setError("تعذر تقسيم الملف. تأكد من أنه ملف PDF صحيح.");
    } finally {
      setProcessing(false);
    }
  }

  async function downloadAll() {
    if (!results) return;
    const zip = new JSZip();
    results.forEach((r) => zip.file(r.name, r.blob));
    const zipBlob = await zip.generateAsync({ type: "blob" });
    downloadBlob(zipBlob, "ملفات-مقسمة.zip");
  }

  if (results) {
    return (
      <ResultCard
        files={results.map((r) => ({
          name: r.name,
          onDownload: () => downloadBlob(r.blob, r.name),
        }))}
        onDownloadAll={downloadAll}
        onReset={() => {
          setResults(null);
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
          hint="اختر ملف PDF واحد للتقسيم"
        />
        <PrivacyNote />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-line bg-surface px-5 py-4">
        <p className="font-bold text-ink">{file.name}</p>
        <p className="text-sm text-ink-soft">
          {pageCount ? `${pageCount} صفحة` : "جاري القراءة..."}
        </p>
      </div>

      {pageCount && (
        <>
          <button
            onClick={splitEveryPage}
            className="text-sm font-bold text-brand hover:underline"
          >
            تقسيم كل صفحة إلى ملف منفصل
          </button>

          <div className="space-y-3">
            {ranges.map((r, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3"
              >
                <span className="text-sm font-medium text-ink-soft">من صفحة</span>
                <input
                  type="number"
                  min={1}
                  max={pageCount}
                  value={r.from}
                  onChange={(e) => updateRange(idx, { from: Number(e.target.value) })}
                  className="w-20 rounded-lg border border-line px-2 py-1.5 text-center"
                />
                <span className="text-sm font-medium text-ink-soft">إلى</span>
                <input
                  type="number"
                  min={1}
                  max={pageCount}
                  value={r.to}
                  onChange={(e) => updateRange(idx, { to: Number(e.target.value) })}
                  className="w-20 rounded-lg border border-line px-2 py-1.5 text-center"
                />
                {ranges.length > 1 && (
                  <button
                    onClick={() => removeRange(idx)}
                    className="ms-auto flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={addRange}
            className="flex items-center gap-2 text-sm font-bold text-brand hover:underline"
          >
            <Plus size={15} />
            إضافة نطاق آخر
          </button>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <button
            onClick={handleSplit}
            disabled={processing}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-4 font-bold text-white shadow-sm shadow-brand/30 transition hover:bg-brand-dark disabled:opacity-60"
          >
            <Scissors size={18} />
            {processing ? "جاري التقسيم..." : "تقسيم الملف"}
          </button>
        </>
      )}
      <PrivacyNote />
    </div>
  );
}
