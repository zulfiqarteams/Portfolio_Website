import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck, Save } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { getLessonById } from "@/features/lessons";
import { SAVED_CONTENT_EVENT, loadBookmarkIds, loadSavedLaterIds, toggleBookmark, toggleSavedLater } from "@/features/library/services/savedContent";
import { useSEO } from "@/hooks/useSEO";
import { useLanguage } from "@/i18n/useLanguage";

/**
 * Bookmark/Save-for-Later already write real ids to localStorage (see
 * `savedContent.ts`) — but until now there was no page anywhere in the app
 * that actually read those ids back and showed the corresponding lessons,
 * so the feature had no visible effect after the button animation. This
 * page is that missing view.
 */
export default function Saved() {
  const { text } = useLanguage();
  useSEO({ title: "Saved Lessons", description: "Your bookmarked and saved-for-later lessons.", noIndex: true });

  const [bookmarkIds, setBookmarkIds] = useState<string[]>([]);
  const [savedLaterIds, setSavedLaterIds] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => {
      setBookmarkIds(loadBookmarkIds());
      setSavedLaterIds(loadSavedLaterIds());
    };

    sync();
    window.addEventListener(SAVED_CONTENT_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SAVED_CONTENT_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  function removeBookmark(id: string) {
    toggleBookmark(id);
    setBookmarkIds(loadBookmarkIds());
  }

  function removeSavedLater(id: string) {
    toggleSavedLater(id);
    setSavedLaterIds(loadSavedLaterIds());
  }

  const bookmarkedLessons = bookmarkIds.map((id) => getLessonById(id)).filter((l): l is NonNullable<typeof l> => Boolean(l));
  const savedLaterLessons = savedLaterIds.map((id) => getLessonById(id)).filter((l): l is NonNullable<typeof l> => Boolean(l));

  return (
    <PageContainer>
      <div className="py-8 sm:py-10">
        <PageHeader title={text("Saved Lessons")} description={text("Your bookmark and Save for Later history. Everything here is stored locally in this browser.")} />

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <a href="#bookmarked" className="rounded-lg border border-border bg-surface p-4 transition-colors hover:border-brand-300 hover:bg-brand-50">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 font-semibold"><BookmarkCheck size={18} aria-hidden="true" />{text("Bookmarks")}</span>
              <span className="numeric rounded-full bg-paper px-2.5 py-1 text-xs font-bold">{bookmarkIds.length}</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink-soft">{text("Bookmark = keep a lesson in your personal quick-access list so you can find it again easily.")}</p>
          </a>
          <a href="#saved-later" className="rounded-lg border border-border bg-surface p-4 transition-colors hover:border-brand-300 hover:bg-brand-50">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 font-semibold"><Save size={18} aria-hidden="true" />{text("Saved for Later")}</span>
              <span className="numeric rounded-full bg-paper px-2.5 py-1 text-xs font-bold">{savedLaterIds.length}</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink-soft">{text("Save for Later = put a lesson aside when you want to return to it and continue later.")}</p>
          </a>
        </div>

        <section id="bookmarked" className="mt-8 scroll-mt-24">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
            <BookmarkCheck size={18} className="text-brand-600" aria-hidden="true" />
            {text("Bookmarked")}
          </h2>
          {bookmarkedLessons.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {bookmarkedLessons.map((lesson) => (
                <Card key={lesson.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{text(lesson.title)}</p>
                    <Button to={`/lesson/${lesson.id}`} variant="ghost" size="sm" className="mt-2 px-0">
                      {text("Open lesson")}
                    </Button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeBookmark(lesson.id)}
                    aria-label={text("Remove bookmark")}
                    className="shrink-0 rounded-full border border-border p-2 text-ink-soft hover:border-error-300 hover:text-error-600"
                  >
                    <Bookmark size={14} fill="currentColor" />
                  </button>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState icon={Bookmark} title={text("No bookmarks yet")} description={text("Bookmark a lesson from its page to see it here.")} />
          )}
        </section>

        <section id="saved-later" className="mt-10 scroll-mt-24">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
            <Save size={18} className="text-brand-600" aria-hidden="true" />
            {text("Saved for Later")}
          </h2>
          {savedLaterLessons.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {savedLaterLessons.map((lesson) => (
                <Card key={lesson.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{text(lesson.title)}</p>
                    <Button to={`/lesson/${lesson.id}`} variant="ghost" size="sm" className="mt-2 px-0">
                      {text("Open lesson")}
                    </Button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSavedLater(lesson.id)}
                    aria-label={text("Remove from saved")}
                    className="shrink-0 rounded-full border border-border p-2 text-ink-soft hover:border-error-300 hover:text-error-600"
                  >
                    <Save size={14} fill="currentColor" />
                  </button>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState icon={Save} title={text("Nothing saved for later")} description={text("Use \"Save for Later\" on a lesson to see it here.")} />
          )}
        </section>
      </div>
    </PageContainer>
  );
}
