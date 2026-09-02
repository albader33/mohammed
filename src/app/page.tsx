import Link from "next/link";
import { ArrowLeft, ShieldCheck, Zap, Gift, MousePointerClick } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ToolCard } from "@/components/ToolCard";
import { TOOLS } from "@/lib/tools";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "خصوصية كاملة",
    desc: "كل المعالجة تتم داخل متصفحك مباشرة، ملفاتك لا تُرفع لأي سيرفر خارجي أبدًا.",
  },
  {
    icon: Zap,
    title: "سريع وفوري",
    desc: "بدون انتظار رفع أو تحميل من الإنترنت — النتيجة تظهر خلال ثوانٍ.",
  },
  {
    icon: Gift,
    title: "مجاني بالكامل",
    desc: "استخدم كل الأدوات بدون اشتراك أو تسجيل حساب أو حدود يومية.",
  },
  {
    icon: MousePointerClick,
    title: "سهل الاستخدام",
    desc: "واجهة عربية بسيطة وواضحة، لا تحتاج أي خبرة تقنية.",
  },
];

const STEPS = [
  { n: "١", title: "اختر الأداة", desc: "تصفح مساحة العمل واختر الأداة المناسبة لملفك." },
  { n: "٢", title: "ارفع الملف", desc: "اسحب وأفلت ملفك، أو اختره من جهازك مباشرة." },
  { n: "٣", title: "نزّل النتيجة", desc: "خلال ثوانٍ، حمّل ملفك الجاهز مباشرة على جهازك." },
];

const FAQ = [
  {
    q: "هل ملفاتي آمنة؟",
    a: "نعم. جميع الأدوات تعمل بالكامل داخل متصفحك باستخدام تقنيات JavaScript الحديثة، ولا يتم رفع ملفاتك لأي سيرفر خارجي في أي مرحلة من المعالجة.",
  },
  {
    q: "هل ورّاق مجاني فعلاً؟",
    a: "نعم، جميع الأدوات المتوفرة حاليًا مجانية بالكامل وبدون أي حدود على عدد الملفات أو حجمها.",
  },
  {
    q: "هل أحتاج إنشاء حساب لاستخدام الأدوات؟",
    a: "لا. يمكنك استخدام جميع الأدوات مباشرة بدون تسجيل أو إنشاء حساب.",
  },
  {
    q: "ما أقصى حجم ملف يمكنني رفعه؟",
    a: "بما أن المعالجة تتم داخل متصفحك، يعتمد الحد الأقصى على إمكانيات جهازك بدلاً من قيود سيرفر خارجي — عمومًا تعمل الأدوات بسلاسة مع ملفات حتى مئات الميجابايت.",
  },
];

export default function Home() {
  const highlighted = TOOLS.filter((t) => t.implemented).slice(0, 6);

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,_var(--color-brand-light)_0%,_transparent_70%)]" />
          <div className="mx-auto max-w-4xl px-5 pt-20 pb-16 text-center md:pt-28">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-1.5 text-xs font-bold text-brand">
              أدواتك لملفات PDF، بخصوصية تامة
            </span>
            <h1 className="text-4xl font-extrabold leading-tight text-ink md:text-6xl">
              نظّم ملفات <span className="text-brand">PDF</span>
              <br />
              بدون ما تغادر متصفحك
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-ink-soft">
              دمج، تقسيم، تحويل، وتحرير ملفات PDF بسهولة تامة — كل المعالجة
              تتم على جهازك مباشرة، بدون رفع، وبدون اشتراك.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/workspace"
                className="flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 font-bold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark"
              >
                ابدأ مجانًا الآن
                <ArrowLeft size={17} />
              </Link>
              <Link
                href="#features"
                className="rounded-full border border-line bg-surface px-7 py-3.5 font-bold text-ink-soft transition hover:border-brand/40 hover:text-brand"
              >
                تعرّف على المميزات
              </Link>
            </div>
          </div>

          <div className="mx-auto max-w-5xl px-5 pb-24">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {highlighted.map((tool, i) => {
                const Icon = tool.icon;
                return (
                  <div
                    key={tool.slug}
                    className="animate-float-slow rounded-2xl border border-line bg-surface p-4 shadow-sm"
                    style={{ animationDelay: `${i * 0.4}s` }}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-light text-brand">
                      <Icon size={18} />
                    </span>
                    <p className="mt-3 text-sm font-bold text-ink">{tool.name}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-t border-line/70 bg-surface py-20">
          <div className="mx-auto max-w-6xl px-5">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-extrabold text-ink">ليش ورّاق؟</h2>
              <p className="mt-3 text-ink-soft">كل ما تحتاجه من أدوات PDF، بدون تعقيد</p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((f) => (
                <div key={f.title} className="rounded-2xl border border-line bg-paper p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light text-brand">
                    <f.icon size={20} />
                  </span>
                  <h3 className="mt-4 font-bold text-ink">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-ink-soft">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tools preview */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-5">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-ink">الأدوات الأكثر استخدامًا</h2>
                <p className="mt-2 text-ink-soft">جزء بسيط من مساحة العمل الكاملة</p>
              </div>
              <Link
                href="/workspace"
                className="flex items-center gap-1.5 font-bold text-brand hover:underline"
              >
                عرض كل الأدوات
                <ArrowLeft size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {highlighted.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-line/70 bg-surface py-20">
          <div className="mx-auto max-w-5xl px-5">
            <div className="mb-14 text-center">
              <h2 className="text-3xl font-extrabold text-ink">تشتغل بثلاث خطوات فقط</h2>
            </div>
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
              {STEPS.map((s) => (
                <div key={s.n} className="text-center">
                  <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-xl font-extrabold text-white">
                    {s.n}
                  </span>
                  <h3 className="font-bold text-ink">{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-ink-soft">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20">
          <div className="mx-auto max-w-3xl px-5">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-extrabold text-ink">الأسئلة الشائعة</h2>
            </div>
            <div className="space-y-4">
              {FAQ.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-2xl border border-line bg-surface p-5 open:border-brand/30"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between font-bold text-ink">
                    {item.q}
                    <span className="text-brand transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-ink-soft">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-24">
          <div className="mx-auto max-w-4xl px-5">
            <div className="rounded-3xl bg-gradient-to-br from-brand to-brand-dark px-8 py-14 text-center text-white">
              <h2 className="text-3xl font-extrabold">جاهز تبدأ؟</h2>
              <p className="mx-auto mt-3 max-w-md text-white/85">
                جرّب مساحة العمل الآن، ونظّم ملفاتك في دقائق.
              </p>
              <Link
                href="/workspace"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-bold text-brand transition hover:bg-white/90"
              >
                افتح مساحة العمل
                <ArrowLeft size={17} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
