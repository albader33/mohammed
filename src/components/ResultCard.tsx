import { CheckCircle2, Download, RotateCcw } from "lucide-react";

interface ResultFile {
  name: string;
  onDownload: () => void;
  meta?: string;
}

interface ResultCardProps {
  title?: string;
  files: ResultFile[];
  onReset: () => void;
  onDownloadAll?: () => void;
}

export function ResultCard({
  title = "تم بنجاح!",
  files,
  onReset,
  onDownloadAll,
}: ResultCardProps) {
  return (
    <div className="rounded-3xl border border-line bg-surface p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 size={24} />
        </span>
        <div>
          <h3 className="font-bold text-ink">{title}</h3>
          <p className="text-sm text-ink-soft">
            {files.length > 1
              ? `${files.length} ملفات جاهزة للتنزيل`
              : "ملفك جاهز للتنزيل"}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {files.map((f, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-xl border border-line bg-paper px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-ink">{f.name}</p>
              {f.meta && <p className="text-xs text-ink-soft">{f.meta}</p>}
            </div>
            <button
              onClick={f.onDownload}
              className="flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-dark"
            >
              <Download size={15} />
              تنزيل
            </button>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {onDownloadAll && files.length > 1 && (
          <button
            onClick={onDownloadAll}
            className="flex items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-dark"
          >
            <Download size={15} />
            تنزيل الكل
          </button>
        )}
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 rounded-full border border-line px-5 py-2.5 text-sm font-bold text-ink-soft transition hover:border-brand/40 hover:text-brand"
        >
          <RotateCcw size={15} />
          ابدأ من جديد
        </button>
      </div>
    </div>
  );
}
