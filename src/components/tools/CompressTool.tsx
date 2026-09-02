"use client";

import { useState } from "react";
import { FileDropzone } from "@/components/FileDropzone";
import { ResultCard } from "@/components/ResultCard";
import { PrivacyNote } from "@/components/PrivacyNote";
import { compressPdf, downloadBlob, baseName } from "@/lib/pdf/operations";

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} كيلوبايت`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} ميجابايت`;
}

export function CompressTool() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; originalSize: number; newSize: number } | null>(
    null
  );

  async function handleCompress(selected: File) {
    setFile(selected);
    setProcessing(true);
    setError(null);
    try {
      const out = await compressPdf(selected);
      setResult(out);
    } catch {
      setError("تعذر ضغط الملف.");
    } finally {
      setProcessing(false);
    }
  }

  if (result && file) {
    const saved = Math.max(0, result.originalSize - result.newSize);
    const percent = result.originalSize
      ? Math.round((saved / result.originalSize) * 100)
      : 0;
    const name = `${baseName(file.name)}_مضغوط.pdf`;
    return (
      <ResultCard
        title={percent > 0 ? `تم تقليل الحجم بنسبة ${percent}%` : "تم معالجة الملف"}
        files={[
          {
            name,
            onDownload: () => downloadBlob(result.blob, name),
            meta: `${formatSize(result.originalSize)} ← ${formatSize(result.newSize)}`,
          },
        ]}
        onReset={() => {
          setResult(null);
          setFile(null);
        }}
      />
    );
  }

  return (
    <div>
      <FileDropzone
        onFiles={(files) => handleCompress(files[0])}
        accept={{ "application/pdf": [".pdf"] }}
        label={processing ? "جاري الضغط..." : "اسحب وأفلت ملف PDF هنا"}
        hint="سيتم تقليل حجم الملف مع الحفاظ على المحتوى"
      />
      {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
      <PrivacyNote />
    </div>
  );
}
