import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { ContentSidebar } from "@/components/ContentSidebar";
import { cn } from "@/lib/cn";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { readingSections, type ReadingLanguage } from "@/features/reading/data/content";

const LANGUAGE_KEY = "urduTypingTutorial:readingLanguage";

const languages: Array<{ id: ReadingLanguage; label: string }> = [
  { id: "ur", label: "اردو" },
  { id: "en", label: "English" },
  { id: "roman", label: "Roman Urdu" },
];

export default function Reading() {
  useDocumentTitle("Learn by Reading");

  const [language, setLanguage] = useState<ReadingLanguage>(() => {
    if (typeof window === "undefined") return "en";
    const saved = window.localStorage.getItem(LANGUAGE_KEY);
    return saved === "ur" || saved === "roman" || saved === "en" ? saved : "en";
  });

  const [activeReadingId, setActiveReadingId] = useState<string>(() => {
    if (typeof window === "undefined") return readingSections[0]?.id ?? "";
    return window.location.hash.replace("#", "") || readingSections[0]?.id || "";
  });

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_KEY, language);
  }, [language]);

  useEffect(() => {
    const updateFromHash = () => {
      const id = window.location.hash.replace("#", "");
      if (id) setActiveReadingId(id);
    };

    window.addEventListener("hashchange", updateFromHash);
    return () => window.removeEventListener("hashchange", updateFromHash);
  }, []);

  useEffect(() => {
    const sections = readingSections
      .map((section) => document.getElementById(section.id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

        if (visible?.target.id) setActiveReadingId(visible.target.id);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [language]);

  const isUrdu = language === "ur";

  return (
    <PageContainer>
      <div className="py-8 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
          <ContentSidebar activeReadingId={activeReadingId} />

          <div className="min-w-0">
            <PageHeader
              title="Learn by Reading"
              description="A structured reading course for understanding Urdu phonetic typing before and alongside practice."
            />

            <Card className="sticky top-[4.5rem] z-20 mb-8 border-brand-100 bg-surface/95 backdrop-blur">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-ink-faint">Read in</p>
                  <p className="mt-1 text-sm text-ink-soft">
                    Switch the complete educational content, not just the headings.
                  </p>
                </div>
                <div
                  className="grid grid-cols-3 gap-1 rounded-md border border-border bg-paper p-1"
                  role="tablist"
                  aria-label="Reading language"
                >
                  {languages.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      role="tab"
                      aria-selected={language === item.id}
                      onClick={() => setLanguage(item.id)}
                      className={cn(
                        "min-h-10 rounded-sm px-3 py-2 text-sm font-medium transition-colors",
                        language === item.id
                          ? "bg-brand-500 text-white"
                          : "text-ink-soft hover:bg-surface hover:text-ink",
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            <main
              className={cn("space-y-8", isUrdu && "urdu-body")}
              dir={isUrdu ? "rtl" : "ltr"}
              lang={language === "ur" ? "ur" : "en"}
            >
              {readingSections.map((section, index) => (
                <section id={section.id} key={section.id} className="scroll-mt-36">
                  <Card>
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-brand-50 text-sm font-bold text-brand-600">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-xl font-bold text-ink sm:text-2xl">
                          {section.title[language]}
                        </h2>
                        <p className="mt-4 text-base leading-8 text-ink">
                          {section.explanation[language]}
                        </p>

                        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                          {section.points[language].map((point) => (
                            <li
                              key={point}
                              className="flex gap-2 rounded-md border border-border bg-paper p-3 text-sm leading-7 text-ink-soft"
                            >
                              <CheckCircle2
                                size={16}
                                className="mt-1 shrink-0 text-brand-500"
                                aria-hidden="true"
                              />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>

                        {section.example && (
                          <div className="mt-5 rounded-md border border-gold-300 bg-gold-100 p-5 text-center">
                            <p className="urdu-text text-3xl text-ink">{section.example.urdu}</p>
                            <p className="mt-2 text-sm text-ink-soft">
                              {language === "ur"
                                ? section.example.urdu
                                : language === "roman"
                                  ? section.example.roman
                                  : section.example.en}
                            </p>
                          </div>
                        )}

                        <div className="mt-5 border-t border-border pt-5">
                          <p className="text-xs font-semibold uppercase tracking-widest text-ink-faint">
                            Practice
                          </p>
                          <p className="mt-2 text-sm leading-7 text-ink">
                            {section.practice[language]}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </section>
              ))}
            </main>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
