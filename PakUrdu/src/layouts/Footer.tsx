import { Link } from "react-router-dom";
import { Keyboard } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { primaryNav } from "@/data/navigation";
import { useLanguage } from "@/i18n/useLanguage";

// Footer surfaces the core learning-flow routes only — no lesson/test
// detail links, no social links, per the "keep it minimal" brief.
const footerLinks = primaryNav.filter((item) => item.path !== "/");

export function Footer() {
  const { t } = useLanguage();
  const labelFor = (path: string) => {
    if (path === "/learn") return t.nav.learn;
    if (path === "/practice") return t.nav.practice;
    if (path === "/test") return t.nav.tests;
    return t.nav.progress;
  };

  return (
    <footer className="border-t border-border">
      <PageContainer className="py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 font-display text-base font-bold text-ink">
              <span className="flex h-7 w-7 items-center justify-center rounded bg-brand-500 text-white">
                <Keyboard size={15} strokeWidth={2.25} aria-hidden="true" />
              </span>
              PakUrdu Typing Tutorial
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              {t.footer.description}
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-8 gap-y-2 sm:flex sm:gap-8">
              {footerLinks.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="text-sm text-ink-soft hover:text-ink hover:underline"
                  >
                    {labelFor(item.path)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-sm text-ink-faint sm:flex-row">
          <p>© {new Date().getFullYear()} PakUrdu Typing Tutorial.</p>
          <p className="urdu-text text-base text-ink-soft">
            {t.footer.slogan}
          </p>
        </div>
      </PageContainer>
    </footer>
  );
}
