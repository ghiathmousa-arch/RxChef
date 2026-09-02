import Image from "next/image";
import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/#tool", label: "الأداة" },
  { href: "/#quick-start", label: "دليل الاستخدام" },
  { href: "/#how-it-works", label: "كيف يعمل" },
  { href: "/#algorithm", label: "الخوارزميات" },
  { href: "/#classes", label: "التصنيفات العلاجية" },
  { href: "/#about", label: "عن المشروع" },
  { href: "/#stats", label: "إحصائيات حية" },
  { href: "/#faq", label: "أسئلة شائعة" },
  { href: "/#testimonials", label: "آراء مجرّبين" },
  { href: "/#contact", label: "تواصل" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="print:hidden mx-auto mt-20 max-w-[1100px] sm:mt-28">
      <div className="rounded-[24px] border border-teal/15 bg-linear-to-l from-paper/85 to-[#F4F6F3]/80 px-6 py-9 shadow-[0_20px_46px_-34px_rgba(9,72,61,0.34)] backdrop-blur-md backdrop-saturate-150 sm:px-9 sm:py-11">
        <div className="flex flex-col gap-9 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="max-w-[34ch]">
            <Image
              src="/logo%20RxChef.jpg"
              alt="RxChef"
              width={140}
              height={40}
              className="h-9 w-auto mix-blend-multiply"
            />
            <p className="mt-4 text-[14.5px] leading-[1.9] text-ink/72">
              تجديد الوصفة الذكي — أداة دعم قرار تقرأ الوصفة كوحدة واحدة، لا سطرًا سطرًا.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2.5 text-[14.5px] sm:justify-end">
            {FOOTER_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="text-forest hover:text-teal">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-sand/30 pt-6 text-[13px] text-sand sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} RxChef · بحث تطبيقي في المعلوماتية الصيدلانية</p>
          <p dir="ltr" className="font-latin text-right">
            hello@rxchef.app
          </p>
        </div>
      </div>
    </footer>
  );
}
