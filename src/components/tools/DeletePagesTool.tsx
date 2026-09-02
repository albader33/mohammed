"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { ResultCard } from "@/components/ResultCard";
import { PrivacyNote } from "@/components/PrivacyNote";
import { SelectablePageGrid } from "@/components/SelectablePageGrid";
import { getPdfPageCount } from "@/lib/pdf/core";
import { deletePages, downloadBlob, baseName } from "@/lib/pdf/operations";

export function DeletePagesTool() {
  const [file, setFile] = useState<File | null>(null);
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
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

  function toggle(page: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(page)) {
        next.delete(page);
      } else {
        next.add(page);
      }
      return next;
    });
  }

  async function handleDelete() {
    if (!file || !pageCount) return;
    if (selected.size === 0) {
      setError("اختر صفحة واحدة على الأقل لحذفها.");
      return;
    }
    if (selected.size === pageCount) {
      setError("لا يمكنك حذف كل صفحات الملف.");
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      const blob = await deletePages(file, Array.from(selected));
      setResult(blob);
    } catch {
      setError("تعذر حذف الصفحات المحددة.");
    } finally {
      setProcessing(false);
    }
  }

  if (result && file) {
    const name = `${baseName(file.name)}_معدّل.pdf`;
    return (
      <ResultCard
        files={[{ name, onDownload: () => downloadBlob(result, name) }]}
        onReset={() => {
          setResult(null);
          setFile(null);
          setSelected(new Set());
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
          hint="اختر ملف PDF لحذف صفحات منه"
        />
        <PrivacyNote />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-2xl border border-line bg-surface px-5 py-4">
        <div>
          <p className="font-bold text-ink">{file.name}</p>
          <p className="text-sm text-ink-soft">
            {pageCount
              ? `${pageCount} صفحة — تم اختيار ${selected.size} للحذف`
              : "جاري القراءة..."}
          </p>
        </div>
      </div>

      {pageCount && (
        <SelectablePageGrid
          buffer={buffer}
          pageCount={pageCount}
          selected={selected}
          onToggle={toggle}
        />
      )}

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <button
        onClick={handleDelete}
        disabled={processing}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 py-4 font-bold text-white shadow-sm shadow-red-600/30 transition hover:bg-red-700 disabled:opacity-60"
      >
        <Trash2 size={18} />
        {processing ? "جاري الحذف..." : `حذف ${selected.size || ""} صفحة`}
      </button>
      <PrivacyNote />
    </div>
  );
}
