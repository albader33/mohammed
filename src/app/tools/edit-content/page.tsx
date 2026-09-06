import type { Metadata } from "next";
import { getTool } from "@/lib/tools";
import { ToolPageHeader } from "@/components/ToolPageHeader";
import { EditTool } from "@/components/tools/EditTool";

const tool = getTool("edit-content")!;

export const metadata: Metadata = { title: tool.name, description: tool.description };

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <ToolPageHeader tool={tool} />
      <EditTool />
    </div>
  );
}
