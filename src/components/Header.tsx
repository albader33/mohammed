import Link from "next/link";
import { Logo } from "./Logo";

const NAV = [
  { href: "/workspace", label: "مساحة العمل" },
  { href: "/#features", label: "المميزات" },
  { href: "/#faq", label: "الأسئلة الشائعة" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-ink-soft transition hover:text-brand"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/workspace"
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-brand/30 transition hover:bg-brand-dark"
        >
          ابدأ الآن
        </Link>
      </div>
    </header>
  );
}
