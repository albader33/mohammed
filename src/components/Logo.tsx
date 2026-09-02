import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2 font-extrabold text-xl text-ink ${className}`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-dark text-white shadow-sm">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 2.5H14L19.5 8V19.5C19.5 20.6 18.6 21.5 17.5 21.5H6.5C5.4 21.5 4.5 20.6 4.5 19.5V4.5C4.5 3.4 5.4 2.5 6.5 2.5H6Z"
            stroke="white"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M14 2.5V8H19.5" stroke="white" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M8 13.5H15.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M8 17H13" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </span>
      <span>ورّاق</span>
    </Link>
  );
}
