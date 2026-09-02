import type { Metadata } from "next";
import { getTool } from "@/lib/tools";
import { ToolPageHeader } from "@/components/ToolPageHeader";
import { PageNumbersTool } from "@/components/tools/PageNumbersTool";

const tool = getTool("page-numbers")!;

export const metadata: Metadata = { title: tool.name, description: tool.description };

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <ToolPageHeader tool={tool} />
      <PageNumbersTool />
    </div>
  );
}
