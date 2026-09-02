import Link from "next/link";
import { Logo } from "./Logo";
import { CATEGORIES, TOOLS } from "@/lib/tools";

export function Footer() {
  const organize = TOOLS.filter((t) => t.category === "organize").slice(0, 5);
  const convert = TOOLS.filter((t) => t.category === "convert").slice(0, 5);

  return (
    <footer className="border-t border-line/70 bg-surface">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 px-5 py-14 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-6 text-ink-soft">
            أدوات PDF تشتغل بالكامل داخل متصفحك، بدون رفع ملفاتك لأي سيرفر
            خارجي.
          </p>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-bold text-ink">{CATEGORIES.organize}</h3>
          <ul className="space-y-2.5">
            {organize.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/tools/${t.slug}`}
                  className="text-sm text-ink-soft hover:text-brand"
                >
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-bold text-ink">{CATEGORIES.convert}</h3>
          <ul className="space-y-2.5">
            {convert.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/tools/${t.slug}`}
                  className="text-sm text-ink-soft hover:text-brand"
                >
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-bold text-ink">روابط</h3>
          <ul className="space-y-2.5">
            <li>
              <Link href="/workspace" className="text-sm text-ink-soft hover:text-brand">
                كل الأدوات
              </Link>
            </li>
            <li>
              <Link href="/#features" className="text-sm text-ink-soft hover:text-brand">
                المميزات
              </Link>
            </li>
            <li>
              <Link href="/#faq" className="text-sm text-ink-soft hover:text-brand">
                الأسئلة الشائعة
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line/70 py-6 text-center text-xs text-ink-soft">
        © {new Date().getFullYear()} ورّاق. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}
