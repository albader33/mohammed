import type { LucideIcon } from "lucide-react";
import {
  Combine,
  Scissors,
  BookmarkPlus,
  Trash2,
  ArrowDownUp,
  RotateCw,
  ImagePlus,
  FileImage,
  Shrink,
  Stamp,
  Hash,
  Lock,
  LockOpen,
  FileType2,
  FileOutput,
  PenLine,
  PenSquare,
} from "lucide-react";

export type ToolCategory = "organize" | "convert" | "edit" | "security";

export interface ToolDef {
  slug: string;
  name: string;
  short: string;
  description: string;
  icon: LucideIcon;
  category: ToolCategory;
  implemented: boolean;
  accept: "pdf" | "image" | "pdf-multi" | "image-multi";
}

export const CATEGORIES: Record<ToolCategory, string> = {
  organize: "تنظيم الصفحات",
  convert: "التحويل",
  edit: "التحرير",
  security: "الأمان",
};

export const TOOLS: ToolDef[] = [
  {
    slug: "merge",
    name: "دمج ملفات PDF",
    short: "ادمج عدة ملفات في ملف واحد",
    description:
      "ادمج عدة ملفات PDF في ملف واحد، ورتّبها بالسحب والإفلات قبل الدمج.",
    icon: Combine,
    category: "organize",
    implemented: true,
    accept: "pdf-multi",
  },
  {
    slug: "split",
    name: "تقسيم PDF",
    short: "قسّم الملف إلى عدة أجزاء",
    description: "قسّم ملف PDF إلى عدة ملفات حسب نطاقات صفحات تحددها.",
    icon: Scissors,
    category: "organize",
    implemented: true,
    accept: "pdf",
  },
  {
    slug: "extract-pages",
    name: "استخراج صفحات",
    short: "استخرج صفحات محددة كملف جديد",
    description: "اختر صفحات معينة من ملف PDF واستخرجها في ملف مستقل.",
    icon: BookmarkPlus,
    category: "organize",
    implemented: true,
    accept: "pdf",
  },
  {
    slug: "delete-pages",
    name: "حذف صفحات",
    short: "احذف صفحات غير مرغوبة",
    description: "احذف صفحة أو أكثر من ملف PDF بضغطة زر.",
    icon: Trash2,
    category: "organize",
    implemented: true,
    accept: "pdf",
  },
  {
    slug: "reorder",
    name: "إعادة ترتيب الصفحات",
    short: "رتّب الصفحات بالسحب والإفلات",
    description: "أعد ترتيب صفحات ملف PDF بسهولة عن طريق السحب والإفلات.",
    icon: ArrowDownUp,
    category: "organize",
    implemented: true,
    accept: "pdf",
  },
  {
    slug: "rotate",
    name: "تدوير الصفحات",
    short: "دوّر صفحة واحدة أو الكل",
    description: "دوّر أي صفحة من ملف PDF بزاوية 90 أو 180 أو 270 درجة.",
    icon: RotateCw,
    category: "organize",
    implemented: true,
    accept: "pdf",
  },
  {
    slug: "images-to-pdf",
    name: "الصور إلى PDF",
    short: "حوّل الصور إلى ملف PDF",
    description: "حوّل صور JPG أو PNG إلى ملف PDF واحد بالترتيب الذي تريده.",
    icon: ImagePlus,
    category: "convert",
    implemented: true,
    accept: "image-multi",
  },
  {
    slug: "pdf-to-images",
    name: "PDF إلى صور",
    short: "حوّل كل صفحة إلى صورة PNG",
    description: "حوّل كل صفحة من ملف PDF إلى صورة PNG بجودة عالية، ونزّلها كأرشيف.",
    icon: FileImage,
    category: "convert",
    implemented: true,
    accept: "pdf",
  },
  {
    slug: "compress",
    name: "ضغط PDF",
    short: "قلّل حجم الملف",
    description: "قلّل حجم ملف PDF لتسهيل مشاركته عبر البريد أو الواتساب.",
    icon: Shrink,
    category: "edit",
    implemented: true,
    accept: "pdf",
  },
  {
    slug: "watermark",
    name: "علامة مائية",
    short: "أضف نص كعلامة مائية",
    description: "أضف نصًا كعلامة مائية شفافة على كل صفحات ملف PDF.",
    icon: Stamp,
    category: "edit",
    implemented: true,
    accept: "pdf",
  },
  {
    slug: "page-numbers",
    name: "ترقيم الصفحات",
    short: "رقّم صفحات الملف تلقائيًا",
    description: "أضف أرقام الصفحات تلقائيًا في أسفل كل صفحة من ملف PDF.",
    icon: Hash,
    category: "edit",
    implemented: true,
    accept: "pdf",
  },
  {
    slug: "edit-content",
    name: "تعديل محتوى PDF",
    short: "احذف فقرات وأضف نصوصًا جديدة",
    description:
      "غطِّ أي فقرة أو جزء من محتوى الملف، وأضف فقرات نصية جديدة في أي مكان تريده — بالعربي أو الإنجليزي.",
    icon: PenSquare,
    category: "edit",
    implemented: true,
    accept: "pdf",
  },
  {
    slug: "protect",
    name: "حماية بكلمة مرور",
    short: "أضف كلمة مرور لملفك",
    description: "احمِ ملف PDF بكلمة مرور لمنع فتحه دون إذن.",
    icon: Lock,
    category: "security",
    implemented: false,
    accept: "pdf",
  },
  {
    slug: "unlock",
    name: "فك الحماية",
    short: "أزل كلمة المرور من الملف",
    description: "أزل كلمة مرور معروفة من ملف PDF محمي.",
    icon: LockOpen,
    category: "security",
    implemented: false,
    accept: "pdf",
  },
  {
    slug: "pdf-to-word",
    name: "PDF إلى Word",
    short: "حوّل الملف إلى مستند قابل للتحرير",
    description: "حوّل ملف PDF إلى مستند Word قابل للتحرير.",
    icon: FileType2,
    category: "convert",
    implemented: false,
    accept: "pdf",
  },
  {
    slug: "word-to-pdf",
    name: "Word إلى PDF",
    short: "حوّل مستند Word إلى PDF",
    description: "حوّل مستند Word إلى ملف PDF جاهز للمشاركة.",
    icon: FileOutput,
    category: "convert",
    implemented: false,
    accept: "pdf",
  },
  {
    slug: "esign",
    name: "التوقيع الإلكتروني",
    short: "وقّع الملف إلكترونيًا",
    description: "أضف توقيعك الإلكتروني على ملف PDF مباشرة من متصفحك.",
    icon: PenLine,
    category: "edit",
    implemented: false,
    accept: "pdf",
  },
];

export function getTool(slug: string): ToolDef | undefined {
  return TOOLS.find((t) => t.slug === slug);
}
