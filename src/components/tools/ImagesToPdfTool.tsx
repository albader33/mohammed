"use client";

import { useState } from "react";
import { Plus, ImagePlus } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { SortableFileList } from "@/components/SortableFileList";
import { ResultCard } from "@/components/ResultCard";
import { PrivacyNote } from "@/components/PrivacyNote";
import { imagesToPdf, downloadBlob } from "@/lib/pdf/operations";

interface FileItem {
  id: string;
  file: File;
}

let uid = 0;
const nextId = () => `img${++uid}-${Date.now()}`;

export function ImagesToPdfTool() {
  const [items, setItems] = useState<FileItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Blob | null>(null);

  function addFiles(files: File[]) {
    setResult(null);
    setError(null);
    setItems((prev) => [...prev, ...files.map((file) => ({ id: nextId(), file }))]);
  }

  function removeFile(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleConvert() {
    if (items.length === 0) {
      setError("أضف صورة واحدة على الأقل.");
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      const blob = await imagesToPdf(items.map((i) => i.file));
      setResult(blob);
    } catch {
      setError("تعذر تحويل الصور. تأكد من أنها بصيغة JPG أو PNG.");
    } finally {
      setProcessing(false);
    }
  }

  if (result) {
    return (
      <ResultCard
        files={[
          {
            name: "صور-إلى-PDF.pdf",
            onDownload: () => downloadBlob(result, "صور-إلى-PDF.pdf"),
          },
        ]}
        onReset={() => {
          setResult(null);
          setItems([]);
        }}
      />
    );
  }

  return (
    <div>
      {items.length === 0 ? (
        <FileDropzone
          onFiles={addFiles}
          accept={{ "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] }}
          multiple
          label="اسحب وأفلت الصور هنا"
          hint="يدعم صيغ JPG و PNG، اختر صورة أو أكثر"
        />
      ) : (
        <div className="space-y-5">
          <SortableFileList items={items} onChange={setItems} onRemove={removeFile} />

          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line py-3.5 text-sm font-bold text-ink-soft transition hover:border-brand/40 hover:text-brand">
            <Plus size={16} />
            إضافة صورة أخرى
            <input
              type="file"
              accept="image/jpeg,image/png"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))}
            />
          </label>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <button
            onClick={handleConvert}
            disabled={processing}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-4 font-bold text-white shadow-sm shadow-brand/30 transition hover:bg-brand-dark disabled:opacity-60"
          >
            <ImagePlus size={18} />
            {processing ? "جاري التحويل..." : `تحويل ${items.length} صور إلى PDF`}
          </button>
        </div>
      )}
      <PrivacyNote />
    </div>
  );
}
