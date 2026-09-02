"use client";

import { Check } from "lucide-react";
import { PdfPageThumb } from "./PdfPageThumb";

interface SelectablePageGridProps {
  buffer: ArrayBuffer;
  pageCount: number;
  selected: Set<number>;
  onToggle: (page: number) => void;
}

export function SelectablePageGrid({
  buffer,
  pageCount,
  selected,
  onToggle,
}: SelectablePageGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => {
        const isSelected = selected.has(page);
        return (
          <button
            key={page}
            type="button"
            onClick={() => onToggle(page)}
            className={`group relative rounded-xl p-1.5 text-start transition ${
              isSelected ? "bg-brand-light ring-2 ring-brand" : "hover:bg-line/40"
            }`}
          >
            <PdfPageThumb buffer={buffer} pageNumber={page} />
            <span
              className={`absolute end-3 top-3 flex h-6 w-6 items-center justify-center rounded-full border-2 text-white transition ${
                isSelected
                  ? "border-brand bg-brand"
                  : "border-white bg-black/30 opacity-0 group-hover:opacity-100"
              }`}
            >
              {isSelected && <Check size={14} />}
            </span>
            <p className="mt-1.5 text-center text-xs font-medium text-ink-soft">
              صفحة {page}
            </p>
          </button>
        );
      })}
    </div>
  );
}
