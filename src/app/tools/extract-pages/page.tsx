import type { Metadata } from "next";
import { getTool } from "@/lib/tools";
import { ToolPageHeader } from "@/components/ToolPageHeader";
import { ExtractPagesTool } from "@/components/tools/ExtractPagesTool";

const tool = getTool("extract-pages")!;

export const metadata: Metadata = { title: tool.name, description: tool.description };

export default function Page() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-14">
      <ToolPageHeader tool={tool} />
      <ExtractPagesTool />
    </div>
  );
}
