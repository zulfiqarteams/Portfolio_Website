import { useSearchParams } from "react-router-dom";
import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import { ContentSidebar } from "@/components/ContentSidebar";
import { Badge } from "@/components/Badge";
import { LessonCard } from "@/components/LessonCard";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import {
  getCourse,
  getLevels,
  getModulesForLevel,
  getLessonsForModule,
} from "@/features/lessons";
import { useProgress } from "@/features/progress";

export default function Learn() {
  useDocumentTitle("Learn");

  const course = getCourse();
  const allLevels = getLevels();
  const [searchParams] = useSearchParams();
  const track = searchParams.get("track");
  const trackLevels =
    track === "basic" ? allLevels.filter((level) => level.order <= 2) :
    track === "intermediate" ? allLevels.filter((level) => level.order >= 3 && level.order <= 5) :
    track === "advanced" ? allLevels.filter((level) => level.order >= 6) :
    allLevels;
  const { getLessonUiStatus } = useProgress();

  return (
    <PageContainer>
      <div className="py-8 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
          <ContentSidebar />

          <div className="min-w-0">
            <PageHeader title={course.title} description={course.description} />

            <div className="divide-y divide-border">
        {trackLevels.map((level) => {
          const levelModules = getModulesForLevel(level.id);

          return (
            <section key={level.id} aria-labelledby={`level-${level.id}`} className="py-10">
              <div className="mb-1 flex flex-wrap items-center gap-3">
                <h2 id={`level-${level.id}`} className="text-lg font-semibold">
                  {level.title}
                </h2>
                {level.locked && <Badge tone="neutral">Locked</Badge>}
              </div>
              <p className="mb-6 max-w-2xl text-sm text-ink-soft">{level.description}</p>

              <div className="space-y-8">
                {levelModules.map((module) => {
                  const moduleLessons = getLessonsForModule(module.id);
                  if (moduleLessons.length === 0) return null;

                  return (
                    <div key={module.id}>
                      <h3 className="mb-3 text-sm font-semibold text-ink-soft">
                        {module.title}
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {moduleLessons.map((lesson) => {
                          const status = level.locked ? "locked" : getLessonUiStatus(lesson);
                          return (
                            <LessonCard
                              key={lesson.id}
                              index={lesson.order}
                              title={lesson.title}
                              description={lesson.description}
                              difficulty={lesson.difficulty}
                              status={status}
                              to={status === "locked" ? undefined : `/lesson/${lesson.id}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
