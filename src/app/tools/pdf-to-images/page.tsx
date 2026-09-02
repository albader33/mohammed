import type { Metadata } from "next";
import { getTool } from "@/lib/tools";
import { ToolPageHeader } from "@/components/ToolPageHeader";
import { PdfToImagesTool } from "@/components/tools/PdfToImagesTool";

const tool = getTool("pdf-to-images")!;

export const metadata: Metadata = { title: tool.name, description: tool.description };

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <ToolPageHeader tool={tool} />
      <PdfToImagesTool />
    </div>
  );
}
