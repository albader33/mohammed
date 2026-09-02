"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";

interface FileDropzoneProps {
  onFiles: (files: File[]) => void;
  accept: Record<string, string[]>;
  multiple?: boolean;
  label?: string;
  hint?: string;
}

export function FileDropzone({
  onFiles,
  accept,
  multiple = false,
  label = "اسحب وأفلت الملف هنا",
  hint = "أو اضغط للاختيار من جهازك",
}: FileDropzoneProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length) onFiles(accepted);
    },
    [onFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
  });

  return (
    <div
      {...getRootProps()}
      className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed px-6 py-16 text-center transition ${
        isDragActive
          ? "border-brand bg-brand-light"
          : "border-line bg-surface hover:border-brand/50 hover:bg-brand-light/40"
      }`}
    >
      <input {...getInputProps()} />
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-light text-brand">
        <UploadCloud size={26} />
      </span>
      <p className="font-bold text-ink">{label}</p>
      <p className="text-sm text-ink-soft">{hint}</p>
    </div>
  );
}
