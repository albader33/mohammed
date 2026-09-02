"use client";

import { useEffect, useState } from "react";
import { RotateCw } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { ResultCard } from "@/components/ResultCard";
import { PrivacyNote } from "@/components/PrivacyNote";
import { RotatablePageGrid } from "@/components/RotatablePageGrid";
import { getPdfPageCount } from "@/lib/pdf/core";
import { rotatePages, downloadBlob, baseName } from "@/lib/pdf/operations";

export function RotateTool() {
  const [file, setFile] = useState<File | null>(null);
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [rotations, setRotations] = useState<Record<number, number>>({});
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Blob | null>(null);

  useEffect(() => {
    if (!file) return;
    file.arrayBuffer().then(async (buf) => {
      setBuffer(buf);
      const count = await getPdfPageCount(buf.slice(0));
      setPageCount(count);
    });
  }, [file]);

  function rotateOne(page: number) {
    setRotations((prev) => ({ ...prev, [page]: ((prev[page] ?? 0) + 90) % 360 }));
  }

  function rotateAll() {
    if (!pageCount) return;
    setRotations((prev) => {
      const next = { ...prev };
      for (let p = 1; p <= pageCount; p++) next[p] = ((next[p] ?? 0) + 90) % 360;
      return next;
    });
  }

  async function handleApply() {
    if (!file) return;
    const changed = Object.entries(rotations).filter(([, deg]) => deg !== 0);
    if (changed.length === 0) {
      setError("دوّر صفحة واحدة على الأقل قبل الحفظ.");
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      let currentFile = file;
      for (const [page, deg] of changed) {
        const blob = await rotatePages(currentFile, [Number(page)], deg);
        currentFile = new File([blob], file.name, { type: "application/pdf" });
      }
      const finalBlob = new Blob([await currentFile.arrayBuffer()], {
        type: "application/pdf",
      });
      setResult(finalBlob);
    } catch {
      setError("تعذر تدوير الصفحات.");
    } finally {
      setProcessing(false);
    }
  }

  if (result && file) {
    const name = `${baseName(file.name)}_مدوّر.pdf`;
    return (
      <ResultCard
        files={[{ name, onDownload: () => downloadBlob(result, name) }]}
        onReset={() => {
          setResult(null);
          setFile(null);
          setRotations({});
        }}
      />
    );
  }

  if (!file || !buffer) {
    return (
      <div>
        <FileDropzone
          onFiles={(files) => setFile(files[0])}
          accept={{ "application/pdf": [".pdf"] }}
          label="اسحب وأفلت ملف PDF هنا"
          hint="اختر ملف PDF لتدوير صفحاته"
        />
        <PrivacyNote />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-5 py-4">
        <div>
          <p className="font-bold text-ink">{file.name}</p>
          <p className="text-sm text-ink-soft">{pageCount} صفحة</p>
        </div>
        <button
          onClick={rotateAll}
          className="flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-bold text-ink-soft transition hover:border-brand/40 hover:text-brand"
        >
          <RotateCw size={14} />
          تدوير الكل
        </button>
      </div>

      {pageCount && (
        <RotatablePageGrid
          buffer={buffer}
          pageCount={pageCount}
          rotations={rotations}
          onRotate={rotateOne}
        />
      )}

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <button
        onClick={handleApply}
        disabled={processing}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-4 font-bold text-white shadow-sm shadow-brand/30 transition hover:bg-brand-dark disabled:opacity-60"
      >
        <RotateCw size={18} />
        {processing ? "جاري الحفظ..." : "حفظ التدوير"}
      </button>
      <PrivacyNote />
    </div>
  );
}
