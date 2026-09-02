import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/#tool", label: "الأداة" },
  { href: "/#how-it-works", label: "كيف يعمل" },
  { href: "/#about", label: "عن المشروع" },
  { href: "/#faq", label: "أسئلة شائعة" },
  { href: "/#contact", label: "تواصل" },
];

export function SiteHeader() {
  return (
    <div className="print:hidden fixed inset-x-0 top-4 z-50 px-5 sm:px-8 lg:px-10 xl:px-14">
      <header className="mx-auto flex max-w-[1100px] items-center justify-between gap-6 rounded-[20px] border border-teal/15 bg-linear-to-l from-paper/85 to-[#F4F6F3]/80 px-5 py-3 shadow-[0_12px_30px_-22px_rgba(9,72,61,0.4)] backdrop-blur-md backdrop-saturate-150">
        <Link href="/#top" className="flex items-center">
          <Image
            src="/logo%20RxChef.jpg"
            alt="RxChef"
            width={140}
            height={40}
            className="h-10 w-auto mix-blend-multiply"
            priority
          />
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-3 text-[14.5px] sm:gap-5 whitespace-nowrap">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-forest hover:text-teal">
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
    </div>
  );
}
