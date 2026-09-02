import Link from "next/link";
import type { ToolDef } from "@/lib/tools";

export function ToolCard({ tool }: { tool: ToolDef }) {
  const Icon = tool.icon;
  const card = (
    <div
      className={`group relative flex h-full flex-col gap-4 rounded-2xl border border-line bg-surface p-5 transition ${
        tool.implemented
          ? "hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg hover:shadow-brand/10"
          : "opacity-70"
      }`}
    >
      {!tool.implemented && (
        <span className="absolute left-4 top-4 rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-bold text-accent-dark">
          قريبًا
        </span>
      )}
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light text-brand transition group-hover:bg-brand group-hover:text-white">
        <Icon size={22} strokeWidth={2} />
      </span>
      <div>
        <h3 className="font-bold text-ink">{tool.name}</h3>
        <p className="mt-1 text-sm leading-6 text-ink-soft">{tool.short}</p>
      </div>
    </div>
  );

  if (!tool.implemented) {
    return <div className="cursor-not-allowed">{card}</div>;
  }

  return (
    <Link href={`/tools/${tool.slug}`} className="block h-full">
      {card}
    </Link>
  );
}
