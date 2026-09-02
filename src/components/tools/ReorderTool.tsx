"use client";

import { useEffect, useState } from "react";
import { ArrowDownUp } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { ResultCard } from "@/components/ResultCard";
import { PrivacyNote } from "@/components/PrivacyNote";
import { SortablePageGrid } from "@/components/SortablePageGrid";
import { getPdfPageCount } from "@/lib/pdf/core";
import { reorderPages, downloadBlob, baseName } from "@/lib/pdf/operations";

export function ReorderTool() {
  const [file, setFile] = useState<File | null>(null);
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [order, setOrder] = useState<number[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Blob | null>(null);

  useEffect(() => {
    if (!file) return;
    file.arrayBuffer().then(async (buf) => {
      setBuffer(buf);
      const count = await getPdfPageCount(buf.slice(0));
      setOrder(Array.from({ length: count }, (_, i) => i + 1));
    });
  }, [file]);

  async function handleReorder() {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const blob = await reorderPages(file, order);
      setResult(blob);
    } catch {
      setError("تعذرت إعادة ترتيب الصفحات.");
    } finally {
      setProcessing(false);
    }
  }

  if (result && file) {
    const name = `${baseName(file.name)}_مرتب.pdf`;
    return (
      <ResultCard
        files={[{ name, onDownload: () => downloadBlob(result, name) }]}
        onReset={() => {
          setResult(null);
          setFile(null);
          setOrder([]);
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
          hint="اختر ملف PDF لإعادة ترتيب صفحاته"
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
          {order.length} صفحة — اسحب الصفحات لإعادة ترتيبها
        </p>
      </div>

      {order.length > 0 && (
        <SortablePageGrid buffer={buffer} order={order} onChange={setOrder} />
      )}

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <button
        onClick={handleReorder}
        disabled={processing}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-4 font-bold text-white shadow-sm shadow-brand/30 transition hover:bg-brand-dark disabled:opacity-60"
      >
        <ArrowDownUp size={18} />
        {processing ? "جاري الحفظ..." : "حفظ الترتيب الجديد"}
      </button>
      <PrivacyNote />
    </div>
  );
}
