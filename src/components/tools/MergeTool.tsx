"use client";

import { useState } from "react";
import { Plus, Combine } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { SortableFileList } from "@/components/SortableFileList";
import { ResultCard } from "@/components/ResultCard";
import { PrivacyNote } from "@/components/PrivacyNote";
import { mergePdfs, downloadBlob } from "@/lib/pdf/operations";

interface FileItem {
  id: string;
  file: File;
}

let uid = 0;
const nextId = () => `f${++uid}-${Date.now()}`;

export function MergeTool() {
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

  async function handleMerge() {
    if (items.length < 2) {
      setError("أضف ملفين على الأقل للدمج بينهم.");
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      const blob = await mergePdfs(items.map((i) => i.file));
      setResult(blob);
    } catch {
      setError("تعذر دمج الملفات. تأكد من أن جميع الملفات بصيغة PDF صحيحة.");
    } finally {
      setProcessing(false);
    }
  }

  if (result) {
    return (
      <ResultCard
        files={[
          {
            name: "ملف-مدمج.pdf",
            onDownload: () => downloadBlob(result, "ملف-مدمج.pdf"),
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
          accept={{ "application/pdf": [".pdf"] }}
          multiple
          label="اسحب وأفلت ملفات PDF هنا"
          hint="اختر ملفين أو أكثر لدمجهم في ملف واحد"
        />
      ) : (
        <div className="space-y-5">
          <SortableFileList items={items} onChange={setItems} onRemove={removeFile} />

          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line py-3.5 text-sm font-bold text-ink-soft transition hover:border-brand/40 hover:text-brand">
            <Plus size={16} />
            إضافة ملف آخر
            <input
              type="file"
              accept="application/pdf"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))}
            />
          </label>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <button
            onClick={handleMerge}
            disabled={processing}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-4 font-bold text-white shadow-sm shadow-brand/30 transition hover:bg-brand-dark disabled:opacity-60"
          >
            <Combine size={18} />
            {processing ? "جاري الدمج..." : `دمج ${items.length} ملفات`}
          </button>
        </div>
      )}
      <PrivacyNote />
    </div>
  );
}
