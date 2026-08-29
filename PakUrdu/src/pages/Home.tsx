import { BookOpen, Gauge, Keyboard, LineChart, Target, Timer } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Section } from "@/components/Section";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { StatCard } from "@/components/StatCard";
import { HeroTypingWidget } from "@/components/home/HeroTypingWidget";
import { WordMarquee } from "@/components/WordMarquee";
import { useSEO } from "@/hooks/useSEO";
import { useProfiles } from "@/features/profiles/context/ProfileContext";
import { useProgress, getContinueLearningCta } from "@/features/progress";
import type { Profile } from "@/features/profiles";
import { useLanguage } from "@/i18n/useLanguage";

const featureIcons = [BookOpen, Keyboard, LineChart, Timer];

function MarketingHero() {
  const { t, isUrdu, direction } = useLanguage();
  const copy = t.home;

  return (
    <PageContainer
      dir={direction}
      className="grid gap-10 py-14 sm:py-20 lg:grid-cols-[1.08fr,0.92fr] lg:items-center"
    >
      <div className={isUrdu ? "urdu-body" : ""}>
        <Badge tone="brand" className="mb-5">
          {copy.badge}
        </Badge>
        <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl">
          {copy.title}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-ink-soft sm:text-lg">
          {copy.description}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button to="/profile" size="lg">
            {copy.primary}
          </Button>
          <Button to="/learn" variant="secondary" size="lg">
            {copy.secondary}
          </Button>
        </div>
      </div>

      <div className="relative flex min-h-64 items-center justify-center overflow-hidden rounded-2xl border border-border bg-paper px-6 py-12 shadow-card sm:min-h-80">
        <div aria-hidden="true" className="absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_center,var(--color-brand-100)_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="relative text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink-faint">{copy.wordLabel}</p>
          <div className="flex items-center justify-center gap-3">
            <span className="urdu-text text-7xl font-bold text-ink sm:text-8xl">{copy.heroWord}</span>
            <span aria-hidden="true" className="h-14 w-[3px] animate-caret rounded-full bg-brand-500 sm:h-16" />
          </div>
          <p className="mx-auto mt-4 max-w-xs text-sm leading-6 text-ink-soft">
{copy.heroHint}
          </p>
        </div>
      </div>
    </PageContainer>
  );
}

function DashboardHero({ profile }: { profile: Profile }) {
  const { currentLesson, coursePercentage, completedLessonCount, totalLessonCount, bestWpm, bestAccuracy } = useProgress();
  const { t, isUrdu, direction } = useLanguage();
  const copy = t.home;
  const cta = getContinueLearningCta({ currentLesson, completedLessonCount });
  const isNewProfile = completedLessonCount === 0;

  const heading = isNewProfile
    ? copy.newProfileHeading
    : copy.returningHeading.replace("{name}", profile.name);

  const subheading = cta.isCourseComplete
    ? copy.completeDescription
    : isNewProfile
      ? copy.newProfileDescription
      : copy.returningDescription.replace("{lesson}", currentLesson?.title ?? (isUrdu ? "اگلا سبق" : "your next lesson"));

  return (
    <PageContainer dir={direction} className="grid gap-10 py-14 sm:py-20 lg:grid-cols-[1.08fr,0.92fr] lg:items-center">
      <div className={isUrdu ? "urdu-body" : ""}>
        <Badge tone="brand" className="mb-5">
          {isNewProfile ? copy.newProfileBadge : copy.returningBadge}
        </Badge>
        <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl">
          {heading}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-ink-soft sm:text-lg">{subheading}</p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button to={cta.to} size="lg">{cta.label}</Button>
          <Button to="/progress" variant="secondary" size="lg">{copy.viewProgress}</Button>
        </div>
      </div>

      <div aria-labelledby="home-progress-heading" dir="ltr">
        <h2 id="home-progress-heading" className="text-sm font-semibold uppercase tracking-wide text-ink-faint">
          {copy.progressTitle}
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <StatCard icon={LineChart} label={copy.courseProgress} value={`${coursePercentage}%`} />
          <StatCard icon={BookOpen} label={copy.completedLessons} value={`${completedLessonCount} / ${totalLessonCount}`} />
          {bestWpm !== null && <StatCard icon={Gauge} label={copy.bestWpm} value={String(bestWpm)} />}
          {bestAccuracy !== null && <StatCard icon={Target} label={copy.bestAccuracy} value={`${bestAccuracy}%`} />}
        </div>
      </div>
    </PageContainer>
  );
}

export default function Home() {
  useSEO({
    title: "Urdu Typing Tutorial — Learn Urdu Typing Online Free",
    description:
      "Learn Urdu typing online free with PAKURDU. Phonetic Urdu keyboard lessons, guided practice, typing tests, and progress tracking for beginners to professionals.",
  });
  const { activeProfile } = useProfiles();
  const { t, direction, isUrdu } = useLanguage();
  const copy = t.home;

  return (
    <>
      <HeroTypingWidget />

      <section className="border-b border-border bg-surface">
        {activeProfile ? <DashboardHero profile={activeProfile} /> : <MarketingHero />}
      </section>

      <PageContainer dir={direction}>
        <Section
          align="center"
          eyebrow={copy.aheadEyebrow}
          title={copy.aheadTitle}
          description={copy.aheadDescription}
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {copy.features.map(([title, description], index) => {
              const Icon = featureIcons[index];
              return (
                <Card key={title} hover className={`text-start ${isUrdu ? "urdu-body" : ""}`}>
                  <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-sm bg-brand-50 text-brand-600">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <h3 className="text-base font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-ink-soft">{description}</p>
                </Card>
              );
            })}
          </div>
        </Section>

        <Section
          align="center"
          eyebrow={copy.philosophyEyebrow}
          title={copy.philosophyTitle}
          description={copy.philosophyDescription}
          className="border-t border-border"
        >
          <div className="grid gap-5 sm:grid-cols-3">
            {copy.philosophy.map(([label, body], index) => (
              <div key={label} className={`rounded-lg border border-border bg-surface p-6 text-start ${isUrdu ? "urdu-body" : ""}`}>
                <span className="numeric text-sm font-semibold text-brand-500">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 text-base font-semibold">{label}</h3>
                <p className="mt-2 text-sm leading-7 text-ink-soft">{body}</p>
              </div>
            ))}
          </div>
        </Section>

        <section className="border-t border-border py-8 sm:py-10">
          <WordMarquee
            words={["پاکستان", "کتاب", "قلم", "تعلیم", "خوشی", "مشق", "رفتار", "کامیابی"]}
            label={copy.marqueeLabel}
          />
        </section>
      </PageContainer>
    </>
  );
}
