import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { ToolDef } from "@/lib/tools";

export function ToolPageHeader({ tool }: { tool: ToolDef }) {
  const Icon = tool.icon;
  return (
    <div className="mb-10">
      <Link
        href="/workspace"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-brand"
      >
        <ChevronLeft size={16} className="rotate-180" />
        العودة لمساحة العمل
      </Link>
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-light text-brand">
          <Icon size={26} />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold text-ink md:text-3xl">
            {tool.name}
          </h1>
          <p className="mt-1 text-ink-soft">{tool.description}</p>
        </div>
      </div>
    </div>
  );
}
