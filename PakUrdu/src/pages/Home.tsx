import { BookOpen, Keyboard, LineChart, Timer } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Section } from "@/components/Section";
import { Card } from "@/components/Card";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { TypingTestExperience } from "@/features/tests/components/TypingTestExperience";
import { useSettings } from "@/features/settings";
import { homeContent } from "@/data/localization";
import type { FeaturePreview } from "@/types";

const featurePreviews: FeaturePreview[] = [
  {
    id: "learn",
    icon: BookOpen,
    title: "Learn Urdu Typing",
    description:
      "Structured lessons that introduce the phonetic keyboard one sound at a time, from single letters to full words.",
  },
  {
    id: "practice",
    icon: Keyboard,
    title: "Practice",
    description:
      "Guided practice sessions that build muscle memory at a pace that matches your current level.",
  },
  {
    id: "progress",
    icon: LineChart,
    title: "Track Progress",
    description:
      "See how your speed and accuracy improve over time, lesson by lesson.",
  },
  {
    id: "tests",
    icon: Timer,
    title: "Take Typing Tests",
    description:
      "Timed tests that measure your real-world typing speed and accuracy in Urdu.",
  },
];

const philosophySteps = [
  { label: "Learn", body: "Understand where each sound sits on the phonetic keyboard." },
  { label: "Practice", body: "Repeat guided exercises until the keys feel familiar." },
  { label: "Improve", body: "Take tests to measure real progress and build speed." },
];

export default function Home() {
  const { language } = useSettings();
  const content = homeContent[language];

  useDocumentTitle(
    language === "ur"
      ? "PAKURDU — اردو ٹائپنگ"
      : "PAKURDU — Urdu Typing",
  );

  return (
    <div dir={language === "ur" ? "rtl" : "ltr"}>
      <section className="border-b border-border bg-surface">
        <PageContainer className="py-10 sm:py-14 lg:py-16">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
                Urdu typing
              </p>
              <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                {language === "ur" ? "اردو ٹائپنگ ٹیسٹ" : "Urdu Typing Test"}
              </h1>
              <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
                {language === "ur"
                  ? "اپنی اردو ٹائپنگ کی رفتار اور درستگی جانچیں۔ 60 سیکنڈ کا ٹیسٹ فوراً شروع کریں۔"
                  : "Measure your Urdu typing speed and accuracy. Your default 60-second test starts immediately."}
              </p>
            </div>

            <TypingTestExperience />
          </div>
        </PageContainer>
      </section>

      <PageContainer>
        <Section
          align="center"
          eyebrow={content.whatsAhead}
          title={content.sectionTitle}
          description={content.sectionDescription}
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featurePreviews.map((feature, index) => (
              <Card key={feature.id} hover className="text-left">
                <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-sm bg-brand-50 text-brand-600">
                  <feature.icon size={20} aria-hidden="true" />
                </span>
                <h3 className="text-base font-semibold">{content.features[index][0]}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {content.features[index][1]}
                </p>
              </Card>
            ))}
          </div>
        </Section>

        <Section
          align="center"
          eyebrow={content.philosophy}
          title={content.philosophy}
          description={content.sectionDescription}
          className="border-t border-border"
        >
          <div className="grid gap-5 sm:grid-cols-3">
            {philosophySteps.map((step, index) => (
              <div
                key={step.label}
                className="rounded-lg border border-border bg-surface p-6 text-left"
              >
                <span className="numeric text-sm font-semibold text-brand-500">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-base font-semibold">{content.steps[index][0]}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {content.steps[index][1]}
                </p>
              </div>
            ))}
          </div>
        </Section>
      </PageContainer>
    </div>
  );
}
