import { ShieldCheck } from "lucide-react";

export function PrivacyNote() {
  return (
    <div className="mt-6 flex items-start gap-3 rounded-2xl bg-brand-light/60 px-4 py-3.5 text-sm text-ink-soft">
      <ShieldCheck size={18} className="mt-0.5 shrink-0 text-brand" />
      <p>
        ملفاتك تُعالج بالكامل داخل متصفحك، ولا تُرفع لأي سيرفر خارجي — خصوصيتك
        محفوظة 100%.
      </p>
    </div>
  );
}
