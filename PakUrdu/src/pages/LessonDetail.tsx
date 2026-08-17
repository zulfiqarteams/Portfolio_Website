import { Link, useParams } from "react-router-dom";
import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import { ContentSidebar } from "@/components/ContentSidebar";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import {
  useLesson,
  LessonPageHeader,
  LessonObjectives,
  LessonExplanation,
  LessonExamples,
  LessonPractice,
  LessonNavigation,
  LessonNotFound,
} from "@/features/lessons";

export default function LessonDetail() {
  const { id } = useParams<{ id: string }>();
  const result = useLesson(id);

  const title =
    result.status === "ok" ? result.context.lesson.title : "Lesson not found";
  useDocumentTitle(title);

  if (result.status !== "ok") {
    return (
      <PageContainer>
        <PageHeader
          title="Lesson"
          breadcrumb={[{ label: "Learn", to: "/learn" }, { label: id ?? "Lesson" }]}
        />
        <LessonNotFound malformed={result.status === "malformed"} />
      </PageContainer>
    );
  }

  const { lesson, level, previous, next, position, total } = result.context;

  return (
    <PageContainer>
      <div className="grid gap-8 py-8 sm:py-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
        <ContentSidebar activeLessonId={lesson.id} />

        <div className="min-w-0">
          <div className="border-b border-border pb-8 pt-2 sm:pt-4">
        <nav aria-label="Breadcrumb" className="mb-3">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink-faint">
            <li>
              <Link to="/learn" className="hover:text-ink hover:underline">
                Learn
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-ink-soft">
              {level.title}
            </li>
          </ol>
        </nav>
            <LessonPageHeader lesson={lesson} level={level} position={position} total={total} />
          </div>

          <div className="mx-auto max-w-2xl space-y-10 py-10">
        <LessonObjectives objectives={lesson.objectives} />
        <LessonExplanation explanation={lesson.content.explanation} />
        {lesson.content.examples && <LessonExamples examples={lesson.content.examples} />}
        <LessonPractice lesson={lesson} />
            <LessonNavigation previous={previous} next={next} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
