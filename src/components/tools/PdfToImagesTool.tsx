"use client";

import { useState } from "react";
import { FileDropzone } from "@/components/FileDropzone";
import { ResultCard } from "@/components/ResultCard";
import { PrivacyNote } from "@/components/PrivacyNote";
import { pdfToImagesZip } from "@/lib/pdf/pdfToImages";
import { downloadBlob, baseName } from "@/lib/pdf/operations";

export function PdfToImagesTool() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Blob | null>(null);

  async function handleConvert(selected: File) {
    setFile(selected);
    setProcessing(true);
    setError(null);
    try {
      const zip = await pdfToImagesZip(selected, (done, total) =>
        setProgress({ done, total })
      );
      setResult(zip);
    } catch {
      setError("تعذر تحويل الملف إلى صور.");
    } finally {
      setProcessing(false);
    }
  }

  if (result && file) {
    const name = `${baseName(file.name)}_صور.zip`;
    return (
      <ResultCard
        title="تم التحويل بنجاح!"
        files={[{ name, onDownload: () => downloadBlob(result, name), meta: "أرشيف ZIP يحتوي صور PNG" }]}
        onReset={() => {
          setResult(null);
          setFile(null);
          setProgress(null);
        }}
      />
    );
  }

  if (processing) {
    return (
      <div className="rounded-3xl border border-line bg-surface p-10 text-center">
        <div className="mx-auto mb-4 h-2 w-full max-w-xs overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-brand transition-all"
            style={{
              width: progress ? `${(progress.done / progress.total) * 100}%` : "10%",
            }}
          />
        </div>
        <p className="font-bold text-ink">
          {progress ? `جاري تحويل الصفحة ${progress.done} من ${progress.total}` : "جاري التحضير..."}
        </p>
      </div>
    );
  }

  return (
    <div>
      <FileDropzone
        onFiles={(files) => handleConvert(files[0])}
        accept={{ "application/pdf": [".pdf"] }}
        label="اسحب وأفلت ملف PDF هنا"
        hint="سيتم تحويل كل صفحة إلى صورة PNG منفصلة"
      />
      {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
      <PrivacyNote />
    </div>
  );
}
