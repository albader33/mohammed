import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock3 } from "lucide-react";
import { getTool, TOOLS } from "@/lib/tools";
import { ToolPageHeader } from "@/components/ToolPageHeader";

export function generateStaticParams() {
  return TOOLS.filter((t) => !t.implemented).map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  return { title: tool?.name ?? "أداة" };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getTool(slug);

  if (!tool || tool.implemented) notFound();

  return (
    <div className="mx-auto max-w-2xl px-5 py-14">
      <ToolPageHeader tool={tool} />
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-line bg-surface px-6 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent-dark">
          <Clock3 size={26} />
        </span>
        <h2 className="text-lg font-bold text-ink">هذه الأداة قيد التطوير</h2>
        <p className="max-w-sm text-sm text-ink-soft">
          نعمل حاليًا على إضافة أداة {tool.name}. تابعنا وسنطلقها قريبًا ضمن
          مساحة العمل.
        </p>
        <Link
          href="/workspace"
          className="mt-2 rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-dark"
        >
          استكشف الأدوات المتاحة
        </Link>
      </div>
    </div>
  );
}
