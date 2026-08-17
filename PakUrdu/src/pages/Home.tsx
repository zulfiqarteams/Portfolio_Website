import { BookOpen, Keyboard, LineChart, Timer, Gauge, Target, ListChecks } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Section } from "@/components/Section";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { ProgressBar } from "@/components/ProgressBar";
import { StatCard } from "@/components/StatCard";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useProfiles } from "@/features/profiles/context/ProfileContext";
import { useProgress } from "@/features/progress";
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
  {
    label: "Learn",
    body: "Understand where each sound sits on the phonetic keyboard.",
  },
  {
    label: "Practice",
    body: "Repeat guided exercises until the keys feel familiar.",
  },
  {
    label: "Improve",
    body: "Take tests to measure real progress and build speed.",
  },
];

export default function Home() {
  const { language } = useSettings();
  const content = homeContent[language];
  useDocumentTitle(language === "ur" ? "PAKURDU — اردو ٹائپنگ" : language === "roman" ? "PAKURDU — Urdu Typing" : "PAKURDU — Urdu Typing");
  const { activeProfile } = useProfiles();
  const { overallStats } = useProgress();
  const hasStarted = activeProfile && overallStats.completedLessons > 0;

  return (
    <div dir={language === "ur" ? "rtl" : "ltr"}>
      {/* Hero */}
      <section className="border-b border-border bg-surface">
        <PageContainer className="grid gap-12 py-16 sm:py-24 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
          {activeProfile ? (
            <div>
              <Badge tone="brand" className="mb-5">
                {hasStarted ? content.welcomeBack : content.gettingStarted}
              </Badge>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                {hasStarted ? content.welcomeName(activeProfile.name) : content.heroTitle}
              </h1>
              {hasStarted && overallStats.currentLesson ? (
                <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-soft">
                  {content.continueWith}{" "}
                  <span className="font-semibold text-ink">{overallStats.currentLesson.title}</span>.
                </p>
              ) : (
                <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-soft">
                  {content.heroDescription}
                </p>
              )}

              {hasStarted && (
                <div className="mt-6 max-w-sm">
                  <ProgressBar
                    value={overallStats.percentComplete}
                    label={content.courseProgress}
                    showLabel
                  />
                </div>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button
                  to={
                    overallStats.currentLesson
                      ? `/practice?lesson=${overallStats.currentLesson.id}`
                      : "/learn"
                  }
                  size="lg"
                >
                  {hasStarted ? content.continueLearning : content.startLearning}
                </Button>
                <Button to="/learn" variant="secondary" size="lg">
                  {content.learningPath}
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <Badge tone="brand" className="mb-5">{content.badge}</Badge>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                {content.heroTitle}
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-soft">
                {content.heroDescription}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button to="/profile" size="lg">
                  {content.startLearning}
                </Button>
                <Button to="/practice" variant="secondary" size="lg">
                  {content.learningPath}
                </Button>
              </div>
            </div>
          )}

          {/* Signature element: a large Nastaliq word with a blinking
              typing caret, evoking the moment of typing itself. */}
          <div className="flex items-center justify-center rounded-lg border border-border bg-paper py-12">
            <div className="flex items-center gap-3">
              <span className="urdu-text text-6xl font-bold text-ink sm:text-7xl">
                اردو
              </span>
              <span
                aria-hidden="true"
                className="h-12 w-[3px] animate-caret bg-brand-500 sm:h-14"
              />
            </div>
          </div>
        </PageContainer>
      </section>

      {hasStarted && (
        <PageContainer className="py-10">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              icon={ListChecks}
              label={content.completed}
              value={`${overallStats.completedLessons}/${overallStats.totalLessons}`}
            />
            <StatCard icon={Gauge} label={content.bestWpm} value={String(overallStats.bestWpm)} />
            <StatCard icon={Target} label={content.bestAccuracy} value={`${overallStats.bestAccuracy}%`} />
            <StatCard icon={LineChart} label={content.progress} value={`${overallStats.percentComplete}%`} />
          </div>
        </PageContainer>
      )}

      <PageContainer>
        {/* Feature preview */}
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

        {/* Learning philosophy */}
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
