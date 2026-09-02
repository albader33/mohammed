"use client";

import { useEffect, useState } from "react";
import { renderPageThumbnail } from "@/lib/pdf/core";

interface PdfPageThumbProps {
  buffer: ArrayBuffer;
  pageNumber: number;
  width?: number;
}

export function PdfPageThumb({ buffer, pageNumber, width = 200 }: PdfPageThumbProps) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    renderPageThumbnail(buffer.slice(0), pageNumber, width).then((url) => {
      if (!cancelled) setSrc(url);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, width]);

  if (!src) {
    return (
      <div
        className="flex aspect-[3/4] w-full animate-pulse items-center justify-center rounded-lg bg-line/60 text-xs text-ink-soft"
        style={{ width }}
      >
        ...
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`صفحة ${pageNumber}`}
      className="w-full rounded-lg border border-line bg-white shadow-sm"
    />
  );
}
