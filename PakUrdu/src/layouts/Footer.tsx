import { Link } from "react-router-dom";
import { Keyboard } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { primaryNav } from "@/data/navigation";
import { useSettings } from "@/features/settings";
import { navigationLabels } from "@/data/localization";

// Footer surfaces the core learning-flow routes only — no lesson/test
// detail links, no social links, per the "keep it minimal" brief.
const footerLinks = primaryNav.filter((item) => item.path !== "/");

export function Footer() {
  const { language } = useSettings();
  const labels = navigationLabels[language];

  return (
    <footer className="border-t border-border">
      <PageContainer className="py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 font-display text-base font-bold text-ink">
              <span className="flex h-7 w-7 items-center justify-center rounded bg-brand-500 text-white">
                <Keyboard size={15} strokeWidth={2.25} aria-hidden="true" />
              </span>
              PAKURDU
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Learn Urdu typing step by step — from your first character to confident speed.
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
                    {labels[item.label] ?? item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-sm text-ink-faint sm:flex-row">
          <p>© {new Date().getFullYear()} PAKURDU.</p>
          <p className="urdu-text text-base text-ink-soft">
            سیکھیں، مشق کریں، بہتر بنیں
          </p>
        </div>
      </PageContainer>
    </footer>
  );
}
