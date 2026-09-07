"use client";

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { Eraser, GripVertical, Move, PenSquare, Trash2, Type } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { ResultCard } from "@/components/ResultCard";
import { PrivacyNote } from "@/components/PrivacyNote";
import { renderPageToCanvas, getPdfPageCount, getPageTextBlocks, type PageTextBlock } from "@/lib/pdf/core";
import { containsArabic } from "@/lib/pdf/arabicText";
import {
  applyPdfEdits,
  downloadBlob,
  baseName,
  type PdfEdit,
  type RedactEdit,
} from "@/lib/pdf/operations";

type Mode = "text" | "redact" | "move";

const FONT_SIZES = [14, 18, 24, 32];

function newId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function EditTool() {
  const [file, setFile] = useState<File | null>(null);
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pageReady, setPageReady] = useState(false);
  const [textBlocks, setTextBlocks] = useState<PageTextBlock[]>([]);
  const [mode, setMode] = useState<Mode>("text");
  const [edits, setEdits] = useState<PdfEdit[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Blob | null>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingId = useRef<{ id: string; startX: number; startY: number } | null>(null);

  useEffect(() => {
    if (!file) return;
    file.arrayBuffer().then(async (buf) => {
      setBuffer(buf);
      const count = await getPdfPageCount(buf.slice(0));
      setPageCount(count);
    });
  }, [file]);

  useEffect(() => {
    if (!buffer) return;
    let cancelled = false;
    renderPageToCanvas(buffer.slice(0), page, 900).then((rendered) => {
      if (cancelled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = rendered.width;
      canvas.height = rendered.height;
      canvas.getContext("2d")!.drawImage(rendered, 0, 0);
      setPageReady(true);
    });
    getPageTextBlocks(buffer.slice(0), page).then((blocks) => {
      if (!cancelled) setTextBlocks(blocks);
    });
    return () => {
      cancelled = true;
    };
  }, [buffer, page]);

  function findTextBlockAt(x: number, y: number): PageTextBlock | undefined {
    return textBlocks.find(
      (b) => x >= b.xPct && x <= b.xPct + b.widthPct && y >= b.yPct && y <= b.yPct + b.heightPct
    );
  }

  /**
   * Samples the page background behind a box instead of always filling
   * redactions white, so a colored background (a table cell, a tinted
   * field, ...) isn't left with a stark white patch. Sampling just
   * outside the box misses backgrounds sized to exactly match the
   * text, so this reads a handful of spots just inside its corners
   * (where glyph ink rarely reaches) and keeps the brightest one, on
   * the assumption that ink is darker than whatever is behind it.
   */
  function sampleBackgroundColor(
    xPct: number,
    yPct: number,
    widthPct: number,
    heightPct: number
  ): [number, number, number] | undefined {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    try {
      const ctx = canvas.getContext("2d")!;
      const toPx = (px: number, py: number): [number, number] => [
        Math.min(canvas.width - 1, Math.max(0, Math.round(px * canvas.width))),
        Math.min(canvas.height - 1, Math.max(0, Math.round(py * canvas.height))),
      ];
      const corners: [number, number][] = [
        [xPct + widthPct * 0.02, yPct + heightPct * 0.1],
        [xPct + widthPct * 0.98, yPct + heightPct * 0.1],
        [xPct + widthPct * 0.02, yPct + heightPct * 0.9],
        [xPct + widthPct * 0.98, yPct + heightPct * 0.9],
      ];
      let best: [number, number, number] | undefined;
      let bestLuma = -1;
      for (const [x, y] of corners) {
        const [px, py] = toPx(x, y);
        const [r, g, b] = ctx.getImageData(px, py, 1, 1).data;
        const luma = r * 0.299 + g * 0.587 + b * 0.114;
        if (luma > bestLuma) {
          bestLuma = luma;
          best = [r / 255, g / 255, b / 255];
        }
      }
      return best;
    } catch {
      return undefined;
    }
  }

  function relativePoint(clientX: number, clientY: number) {
    const rect = stageRef.current!.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (clientY - rect.top) / rect.height)),
    };
  }

  function handleStageMouseDown(e: ReactMouseEvent<HTMLDivElement>) {
    const { x, y } = relativePoint(e.clientX, e.clientY);
    const id = newId();

    if (mode === "redact") {
      const block = findTextBlockAt(x, y);
      if (block) {
        // A detected line of text: redact its exact bounds instead of
        // whatever the user could hand-draw, so nothing beyond that
        // line (a watermark passing behind it, e.g.) gets covered.
        setEdits((prev) => [
          ...prev,
          {
            id,
            type: "redact",
            page,
            xPct: block.xPct,
            yPct: block.yPct,
            widthPct: block.widthPct,
            heightPct: block.heightPct,
            color: sampleBackgroundColor(block.xPct, block.yPct, block.widthPct, block.heightPct),
          },
        ]);
        setActiveId(id);
        return;
      }
      const edit: RedactEdit = {
        id,
        type: "redact",
        page,
        xPct: x,
        yPct: y,
        widthPct: 0,
        heightPct: 0,
      };
      setEdits((prev) => [...prev, edit]);
      drawingId.current = { id, startX: x, startY: y };
      setActiveId(id);
    } else if (mode === "move") {
      const block = findTextBlockAt(x, y);
      if (!block) return;
      // "Moving" existing text isn't a real PDF operation, so this
      // covers the original spot (like the redact tool) and drops an
      // editable, pre-filled, draggable text box in its place —
      // reusing the same font size so it doesn't look out of place.
      const redactId = newId();
      setEdits((prev) => [
        ...prev,
        {
          id: redactId,
          type: "redact",
          page,
          xPct: block.xPct,
          yPct: block.yPct,
          widthPct: block.widthPct,
          heightPct: block.heightPct,
          color: sampleBackgroundColor(block.xPct, block.yPct, block.widthPct, block.heightPct),
        },
        {
          id,
          type: "text",
          page,
          xPct: block.xPct,
          yPct: block.yPct,
          widthPct: Math.min(1 - block.xPct, block.widthPct * 1.2),
          fontSize: Math.round(block.fontSize),
          color: [0.06, 0.06, 0.1],
          text: block.text,
        },
      ]);
      setActiveId(id);
    } else {
      setEdits((prev) => [
        ...prev,
        {
          id,
          type: "text",
          page,
          xPct: x,
          yPct: y,
          widthPct: 0.4,
          fontSize: 18,
          color: [0.06, 0.06, 0.1],
          text: "",
        },
      ]);
      setActiveId(id);
    }
  }

  function handleStageMouseMove(e: ReactMouseEvent<HTMLDivElement>) {
    if (!drawingId.current) return;
    const { x, y } = relativePoint(e.clientX, e.clientY);
    const { id, startX, startY } = drawingId.current;
    setEdits((prev) =>
      prev.map((ed) =>
        ed.id === id && ed.type === "redact"
          ? {
              ...ed,
              xPct: Math.min(startX, x),
              yPct: Math.min(startY, y),
              widthPct: Math.abs(x - startX),
              heightPct: Math.abs(y - startY),
            }
          : ed
      )
    );
  }

  function handleStageMouseUp() {
    if (!drawingId.current) return;
    const { id } = drawingId.current;
    drawingId.current = null;
    setEdits((prev) =>
      prev
        .filter((ed) => {
          if (ed.id !== id || ed.type !== "redact") return true;
          return ed.widthPct > 0.008 && ed.heightPct > 0.008;
        })
        .map((ed) =>
          ed.id === id && ed.type === "redact"
            ? { ...ed, color: sampleBackgroundColor(ed.xPct, ed.yPct, ed.widthPct, ed.heightPct) }
            : ed
        )
    );
  }

  function startDrag(e: ReactMouseEvent, id: string) {
    e.stopPropagation();
    e.preventDefault();
    setActiveId(id);
    const current = edits.find((ed) => ed.id === id);
    if (!current) return;
    const rect = stageRef.current!.getBoundingClientRect();
    const offsetX = (e.clientX - rect.left) / rect.width - current.xPct;
    const offsetY = (e.clientY - rect.top) / rect.height - current.yPct;

    function onMove(ev: MouseEvent) {
      const r = stageRef.current!.getBoundingClientRect();
      const x = Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width - offsetX));
      const y = Math.min(1, Math.max(0, (ev.clientY - r.top) / r.height - offsetY));
      setEdits((prev) => prev.map((it) => (it.id === id ? { ...it, xPct: x, yPct: y } : it)));
    }
    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  function removeEdit(id: string) {
    setEdits((prev) => prev.filter((e) => e.id !== id));
    if (activeId === id) setActiveId(null);
  }

  function updateText(id: string, text: string) {
    setEdits((prev) => prev.map((e) => (e.id === id && e.type === "text" ? { ...e, text } : e)));
  }

  function updateFontSize(id: string, fontSize: number) {
    setEdits((prev) => prev.map((e) => (e.id === id && e.type === "text" ? { ...e, fontSize } : e)));
  }

  async function handleApply() {
    if (!file) return;
    if (edits.length === 0) {
      setError("أضف تعديلاً واحدًا على الأقل قبل الحفظ.");
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      const blob = await applyPdfEdits(file, edits);
      setResult(blob);
    } catch {
      setError("تعذر تطبيق التعديلات على الملف.");
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
          setEdits([]);
          setPage(1);
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
          hint="اختر ملف PDF لتعديل محتواه"
        />
        <PrivacyNote />
      </div>
    );
  }

  const pageEdits = edits.filter((e) => e.page === page);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-5 py-4">
        <div>
          <p className="font-bold text-ink">{file.name}</p>
          <p className="text-sm text-ink-soft">
            صفحة {page} من {pageCount ?? "…"}
            {edits.length > 0 && ` · ${edits.length} تعديل`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMode("text")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition ${
              mode === "text" ? "bg-brand text-white" : "border border-line text-ink-soft hover:border-brand/40"
            }`}
          >
            <Type size={14} /> إضافة نص
          </button>
          <button
            onClick={() => setMode("redact")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition ${
              mode === "redact" ? "bg-brand text-white" : "border border-line text-ink-soft hover:border-brand/40"
            }`}
          >
            <Eraser size={14} /> حذف فقرة
          </button>
          <button
            onClick={() => setMode("move")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition ${
              mode === "move" ? "bg-brand text-white" : "border border-line text-ink-soft hover:border-brand/40"
            }`}
          >
            <Move size={14} /> نقل نص
          </button>
        </div>
      </div>

      <p className="text-sm text-ink-soft">
        {mode === "text" &&
          "اضغط في أي مكان بالصفحة لإضافة صندوق نص جديد، ثم اكتب فيه. اسحب من المقبض بالأعلى لتحريكه."}
        {mode === "redact" &&
          "اضغط على أي سطر نص (محدّد بإطار منقّط) لحذفه بحدوده الدقيقة تلقائيًا، أو اسحب يدويًا لتغطية أي جزء آخر من الصفحة."}
        {mode === "move" &&
          "اضغط على أي سطر نص (محدّد بإطار منقّط) لالتقاطه — ينحذف من مكانه ويطلع بصندوق قابل للتحريك والتعديل، اسحبه لمكانه الجديد."}
      </p>

      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <div
          ref={stageRef}
          onMouseDown={handleStageMouseDown}
          onMouseMove={handleStageMouseMove}
          onMouseUp={handleStageMouseUp}
          className="relative w-full select-none"
          style={{ cursor: mode === "text" ? "text" : "crosshair" }}
        >
          <canvas
            ref={canvasRef}
            className={`pointer-events-none block w-full ${pageReady ? "" : "invisible"}`}
          />
          {!pageReady && (
            <div className="absolute inset-0 flex aspect-[3/4] w-full items-center justify-center text-sm text-ink-soft">
              جاري التحميل...
            </div>
          )}

          {(mode === "redact" || mode === "move") &&
            textBlocks.map((b, i) => (
              <div
                key={i}
                className="pointer-events-none absolute border border-dashed border-brand/50"
                style={{
                  left: `${b.xPct * 100}%`,
                  top: `${b.yPct * 100}%`,
                  width: `${b.widthPct * 100}%`,
                  height: `${b.heightPct * 100}%`,
                }}
              />
            ))}

          {pageEdits.map((ed) =>
            ed.type === "redact" ? (
              <div
                key={ed.id}
                onMouseDown={(e) => startDrag(e, ed.id)}
                className={`absolute cursor-move border-2 ${
                  activeId === ed.id ? "border-brand" : "border-brand/40"
                }`}
                style={{
                  left: `${ed.xPct * 100}%`,
                  top: `${ed.yPct * 100}%`,
                  width: `${ed.widthPct * 100}%`,
                  height: `${ed.heightPct * 100}%`,
                  // Match the exported fill exactly, sampled color and
                  // all, so what's shown while editing can be trusted.
                  backgroundColor: ed.color
                    ? `rgb(${ed.color.map((c) => Math.round(c * 255)).join(",")})`
                    : "white",
                }}
              >
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => removeEdit(ed.id)}
                  className="absolute -end-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow"
                  aria-label="حذف"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ) : (
              <div
                key={ed.id}
                className="absolute z-10"
                style={{
                  left: `${ed.xPct * 100}%`,
                  top: `${ed.yPct * 100}%`,
                  width: `${ed.widthPct * 100}%`,
                }}
              >
                <div
                  className={`overflow-hidden rounded-md border-2 bg-white/95 shadow-sm ${
                    activeId === ed.id ? "border-brand" : "border-brand/30"
                  }`}
                >
                  <div
                    onMouseDown={(e) => startDrag(e, ed.id)}
                    className="flex cursor-move items-center justify-between bg-brand-light px-1.5 py-0.5 text-brand-dark"
                  >
                    <GripVertical size={12} />
                    <button
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={() => removeEdit(ed.id)}
                      aria-label="حذف"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                  <textarea
                    autoFocus
                    value={ed.text}
                    onChange={(e) => updateText(ed.id, e.target.value)}
                    onFocus={() => setActiveId(ed.id)}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setActiveId(ed.id);
                    }}
                    placeholder="اكتب النص هنا..."
                    dir={containsArabic(ed.text) ? "rtl" : "ltr"}
                    rows={2}
                    style={{ fontSize: ed.fontSize }}
                    className="w-full resize-none bg-transparent px-2 py-1.5 text-ink outline-none"
                  />
                </div>
                {activeId === ed.id && (
                  <div
                    onMouseDown={(e) => e.stopPropagation()}
                    className="mt-1 flex w-fit items-center gap-1 rounded-full border border-line bg-white px-2 py-1 shadow-sm"
                  >
                    {FONT_SIZES.map((size) => (
                      <button
                        key={size}
                        onClick={() => updateFontSize(ed.id, size)}
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          ed.fontSize === size ? "bg-brand text-white" : "text-ink-soft"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="rounded-full border border-line px-4 py-2 text-sm font-bold text-ink-soft disabled:opacity-40"
        >
          السابقة
        </button>
        <button
          onClick={() => setPage((p) => Math.min(pageCount ?? p, p + 1))}
          disabled={!pageCount || page >= pageCount}
          className="rounded-full border border-line px-4 py-2 text-sm font-bold text-ink-soft disabled:opacity-40"
        >
          التالية
        </button>
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <button
        onClick={handleApply}
        disabled={processing}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-4 font-bold text-white shadow-sm shadow-brand/30 transition hover:bg-brand-dark disabled:opacity-60"
      >
        <PenSquare size={18} />
        {processing ? "جاري الحفظ..." : "حفظ التعديلات وتنزيل الملف"}
      </button>
      <PrivacyNote />
    </div>
  );
}
