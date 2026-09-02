import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ToolCard } from "@/components/ToolCard";
import { CATEGORIES, TOOLS, type ToolCategory } from "@/lib/tools";

export const metadata: Metadata = {
  title: "مساحة العمل",
  description: "كل أدوات PDF في مكان واحد: دمج، تقسيم، تحويل، وتحرير الملفات مباشرة من متصفحك.",
};

const ORDER: ToolCategory[] = ["organize", "convert", "edit", "security"];

export default function WorkspacePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <div className="mb-12 text-center">
            <h1 className="text-3xl font-extrabold text-ink md:text-4xl">
              مساحة العمل
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-ink-soft">
              اختر الأداة التي تحتاجها. كل شي يشتغل مباشرة داخل متصفحك بدون
              رفع ملفاتك لأي سيرفر.
            </p>
          </div>

          <div className="space-y-14">
            {ORDER.map((cat) => {
              const tools = TOOLS.filter((t) => t.category === cat);
              return (
                <section key={cat}>
                  <h2 className="mb-5 text-xl font-bold text-ink">
                    {CATEGORIES[cat]}
                  </h2>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {tools.map((tool) => (
                      <ToolCard key={tool.slug} tool={tool} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
