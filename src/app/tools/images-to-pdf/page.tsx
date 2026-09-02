import type { Metadata } from "next";
import { getTool } from "@/lib/tools";
import { ToolPageHeader } from "@/components/ToolPageHeader";
import { ImagesToPdfTool } from "@/components/tools/ImagesToPdfTool";

const tool = getTool("images-to-pdf")!;

export const metadata: Metadata = { title: tool.name, description: tool.description };

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <ToolPageHeader tool={tool} />
      <ImagesToPdfTool />
    </div>
  );
}
