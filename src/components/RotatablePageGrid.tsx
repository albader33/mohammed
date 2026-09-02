"use client";

import { RotateCw } from "lucide-react";
import { PdfPageThumb } from "./PdfPageThumb";

interface RotatablePageGridProps {
  buffer: ArrayBuffer;
  pageCount: number;
  rotations: Record<number, number>;
  onRotate: (page: number) => void;
}

export function RotatablePageGrid({
  buffer,
  pageCount,
  rotations,
  onRotate,
}: RotatablePageGridProps) {
  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
      {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => {
        const angle = rotations[page] ?? 0;
        return (
          <div key={page} className="flex flex-col items-center gap-2">
            <div className="flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-lg border border-line bg-white p-2">
              <div
                className="transition-transform duration-300"
                style={{ transform: `rotate(${angle}deg)` }}
              >
                <PdfPageThumb buffer={buffer} pageNumber={page} width={160} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-ink-soft">
                صفحة {page}
              </span>
              <button
                type="button"
                onClick={() => onRotate(page)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-light text-brand transition hover:bg-brand hover:text-white"
                aria-label={`تدوير صفحة ${page}`}
              >
                <RotateCw size={13} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
