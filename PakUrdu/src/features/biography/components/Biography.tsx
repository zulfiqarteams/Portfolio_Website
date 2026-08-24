import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Bookmark, CheckCircle2, Clock, Search, Users, Volume2, Trash2, TimerReset, Play, Pause } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import { ContentSidebar } from "@/components/ContentSidebar";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Badge } from "@/components/Badge";
import { ProgressBar } from "@/components/ProgressBar";
import { useTypingEngine } from "@/features/typing/hooks/useTypingEngine";
import { TypingCaptureArea } from "@/features/typing/components/TypingCaptureArea";
import { TypingText } from "@/features/typing/components/TypingText";
import { TypingStats } from "@/features/typing/components/TypingStats";
import { useKeyboardTapInput } from "@/features/typing/hooks/useKeyboardTapInput";
import { HandFingerGuide, VirtualKeyboard, fingerForKey, getExpectedKey, usePressedKey } from "@/features/keyboard";
import { useTypingTimer, calculateWPM } from "@/features/statistics";
import { useSettings } from "@/features/settings";
import { biographies, biographyCategories, getBiography } from "@/features/biography";
import type { BiographyEntry } from "@/features/biography/types";
import { loadBiographyProgress, markBiographyViewed, markChapterComplete, markTypingComplete, recordBiographyQuiz, toggleBookmark } from "@/features/biography/services/progress";
import { isReadLater, loadReadLaterIds, removeReadLater, toggleReadLater } from "@/features/biography/services/readLater";
import { cn } from "@/lib/cn";
import { useSEO } from "@/hooks/useSEO";

const LEVELS = ["beginner", "intermediate", "advanced", "expert"] as const;
const TIMER_OPTIONS = [60, 120, 300, 600, 0] as const;
type Level = typeof LEVELS[number];
type TimerSeconds = typeof TIMER_OPTIONS[number];

function speak(text: string) {
  if (!("speechSynthesis" in window)) return false;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ur-PK";
  u.rate = 0.78;
  window.speechSynthesis.speak(u);
  return true;
}

function formatTime(seconds: number) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function Dashboard() {
  const p = loadBiographyProgress();
  const saved = loadReadLaterIds().length;
  const viewed = Object.values(p.items).filter((x) => x.viewed).length;
  const completed = Object.values(p.items).filter((x) => x.completedChapters.length > 0).length;
  return <>
    <PageHeader title="Biography" description="مستند سوانح، اسلامی تاریخ اور مسلم علمی روایت کو پڑھیں، محفوظ کریں، ٹائپ کریں اور کوئز کے ذریعے دہرائیں۔" />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {([['کل شخصیات', biographies.length, Users], ['دیکھی گئی', viewed, BookOpen], ['مطالعہ شروع', completed, CheckCircle2], ['Read Later', saved, Bookmark]] as [string, number, typeof Users][]).map(([label, value, Icon]) => <Card key={label}><div className="flex items-center justify-between"><div><p className="text-sm text-ink-soft">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div><Icon size={23} className="text-brand-500" /></div></Card>)}
    </div>
    <Card className="mt-6" dir="rtl"><div className="rounded-md border border-brand-100 bg-brand-50 p-6 text-center"><Badge>Read → Learn → Practice</Badge><h2 className="urdu-text mt-4 text-4xl font-bold text-brand-900">حضرت محمد مصطفیٰ ﷺ</h2><p className="mt-3 leading-8 text-ink">سیرتِ نبوی ﷺ کو مرحلہ وار پڑھیں، خاندان اور اہم واقعات سمجھیں، پھر اسی متن سے writing practice کریں۔</p><Button to="/biography/muhammad" className="mt-5">سیرت شروع کریں <ArrowRight size={16}/></Button></div></Card>
    <section className="mt-8"><div className="mb-4 flex items-end justify-between gap-3"><div><h2 className="text-xl font-bold">Featured biographies</h2><p className="text-sm text-ink-soft">اسلامی شخصیات، خاندانِ رسول ﷺ، خلفائے راشدین اور مسلم علمی روایت۔</p></div><div className="flex gap-2"><Button to="/biography/read-later" variant="ghost" size="sm">Read Later <Bookmark size={15}/></Button><Button to="/biography/library" variant="ghost" size="sm">تمام شخصیات <ArrowRight size={15}/></Button></div></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{biographies.slice(0, 6).map((b) => <BiographyCard key={b.id} bio={b}/>)}</div></section>
  </>;
}

function BiographyCard({ bio }: { bio: BiographyEntry }) {
  const p = loadBiographyProgress().items[bio.id];
  const saved = isReadLater(bio.id);
  return <Link to={`/biography/${bio.id}`}><Card hover className="h-full"><div className="flex items-start justify-between gap-3"><div dir="rtl"><p className="urdu-text text-2xl font-bold">{bio.respectfulName}</p><p dir="ltr" className="mt-1 text-xs text-ink-faint">{bio.aliases[0]}</p></div><div className="flex gap-1">{saved && <Bookmark size={18} className="text-brand-500" fill="currentColor"/>}{p?.completedChapters.length ? <CheckCircle2 className="text-success-600" size={20}/> : null}</div></div><p dir="rtl" className="mt-4 leading-7 text-ink-soft">{bio.summary}</p><div className="mt-4 flex flex-wrap gap-2"><Badge>{bio.subcategory}</Badge><Badge>{bio.difficulty}</Badge><Badge>{bio.chapters.length} chapters</Badge></div></Card></Link>;
}

function Library({ readLaterOnly = false }: { readLaterOnly?: boolean }) {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState(params.get("category") ?? "all");
  const [difficulty, setDifficulty] = useState("all");
  const savedIds = loadReadLaterIds();
  const filtered = useMemo(() => biographies.filter((b) => {
    const hay = [b.name, b.respectfulName, ...b.aliases, b.summary, b.subcategory].join(" ").toLowerCase();
    return (!q || hay.includes(q.toLowerCase())) && (cat === "all" || b.category === cat) && (difficulty === "all" || b.difficulty === difficulty) && (!readLaterOnly || savedIds.includes(b.id));
  }), [q, cat, difficulty, readLaterOnly, savedIds.join("|")]);
  return <>
    <PageHeader title={readLaterOnly ? "Read Later" : "Biography Library"} description={readLaterOnly ? "آپ کی محفوظ سوانح؛ یہ فہرست browser میں مستقل طور پر محفوظ رہتی ہے۔" : "English names، اردو نام، Roman aliases، category اور difficulty سے تلاش کریں۔"}/>
    {!readLaterOnly && <Card className="mb-6"><div className="grid gap-3 md:grid-cols-[1fr_auto_auto]"><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="مثلاً Abu Bakr، ابوبکر، Al-Khwarizmi"/><select value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-sm border border-border bg-surface px-3 py-2 text-sm"><option value="all">تمام categories</option>{biographyCategories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select><select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="rounded-sm border border-border bg-surface px-3 py-2 text-sm"><option value="all">ہر سطح</option>{LEVELS.map((x) => <option key={x} value={x}>{x[0].toUpperCase()+x.slice(1)}</option>)}</select></div><p className="mt-3 flex items-center gap-2 text-xs text-ink-faint"><Search size={14}/>{filtered.length} biographies</p></Card>}
    {readLaterOnly && <div className="mb-6 flex items-center justify-between gap-3"><p className="text-sm text-ink-soft">Saved IDs: {savedIds.length}</p><Button to="/biography/library" variant="outline" size="sm">Library</Button></div>}
    {filtered.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map((b) => <div key={b.id} className="relative"><BiographyCard bio={b}/>{readLaterOnly && <button type="button" title="Remove" onClick={() => { removeReadLater(b.id); window.location.reload(); }} className="absolute right-3 top-3 rounded-full border border-border bg-paper p-2 text-ink-soft hover:text-error-600"><Trash2 size={14}/></button>}</div>)}</div> : <Card><div className="py-12 text-center"><Bookmark className="mx-auto text-ink-faint"/><p className="mt-3 font-semibold">{readLaterOnly ? "No saved biographies yet." : "کوئی سوانح نہیں ملی"}</p><p className="mt-2 text-sm text-ink-soft">{readLaterOnly ? "کسی biography پر Read Later دبائیں، پھر وہ یہاں refresh کے بعد بھی موجود رہے گی۔" : "Search یا filters بدل کر دوبارہ کوشش کریں۔"}</p></div></Card>}
  </>;
}

function Sources({ bio }: { bio: BiographyEntry }) {
  return <details className="mt-6 rounded-md border border-border bg-paper p-4"><summary className="cursor-pointer font-semibold">Sources & References</summary><div className="mt-4 space-y-3">{bio.sources.map((s, i) => <a key={i} href={s.url} target="_blank" rel="noreferrer" className="block rounded border border-border p-3 hover:bg-surface"><p className="font-medium">{s.title}</p><p className="text-xs text-ink-soft">{s.institution ?? s.author ?? s.sourceType}</p>{s.note && <p className="mt-1 text-xs text-ink-faint">{s.note}</p>}</a>)}</div></details>;
}

function TimedTypingPractice({ bio, chapterIndex, level, onComplete }: { bio: BiographyEntry; chapterIndex: number; level: Level; onComplete: () => void }) {
  const { showKeyboard, typingFeedback, soundEnabled } = useSettings();
  const current = bio.chapters[chapterIndex];
  const levelText = bio.levelContent?.[level]?.text;
  const targetText = levelText && chapterIndex === 0 ? levelText : current.text;
  const typing = useTypingEngine({ targetText });
  const [selectedTimer, setSelectedTimer] = useState<TimerSeconds>(300);
  const [started, setStarted] = useState(false);
  const [expired, setExpired] = useState(false);
  const [remaining, setRemaining] = useState<number>(300);
  const startRef = useRef<number | null>(null);
  const [isCaptureActive, setIsCaptureActive] = useState(false);
  const pressed = usePressedKey(isCaptureActive);
  const expected = getExpectedKey(typing.targetText ? typing.targetText[typing.currentIndex] : "");
  const finger = expected?.key && expected.key !== "space" ? fingerForKey(expected.key) : null;
  const keyboardTapInput = useKeyboardTapInput(typing, soundEnabled);
  const elapsedTimer = useTypingTimer({ hasStarted: started && typing.currentIndex > 0, isComplete: typing.isComplete || expired, resetKey: `${bio.id}-${current.id}-${level}-${started}` });
  const elapsedSeconds = elapsedTimer.elapsedMs / 1000;
  const wpm = calculateWPM(typing.currentIndex, elapsedTimer.elapsedMs);

  useEffect(() => {
    setStarted(false); setExpired(false); setRemaining(selectedTimer || 0); startRef.current = null;
    typing.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.id, level, targetText]);

  useEffect(() => {
    if (!started || selectedTimer === 0 || expired || typing.isComplete) return;
    const tick = () => {
      // The countdown starts on the first accepted keystroke, not when
      // the practice panel opens. This keeps the selected time fair.
      if (typing.currentIndex <= 0) {
        setRemaining(selectedTimer);
        return;
      }
      if (startRef.current === null) startRef.current = performance.now();
      const left = Math.max(0, selectedTimer - (performance.now() - startRef.current) / 1000);
      setRemaining(left);
      if (left <= 0) setExpired(true);
    };
    tick();
    const id = window.setInterval(tick, 200);
    return () => window.clearInterval(id);
  }, [started, selectedTimer, expired, typing.isComplete, typing.currentIndex]);

  useEffect(() => {
    if (typing.isComplete && started) onComplete();
  }, [typing.isComplete, started, onComplete]);

  function start() { typing.reset(); setExpired(false); setRemaining(selectedTimer || 0); startRef.current = null; setStarted(true); }
  function reset() { typing.reset(); setExpired(false); setStarted(false); startRef.current = null; setRemaining(selectedTimer || 0); }
  const sessionFinished = expired || typing.isComplete;
  const visibleElapsed = selectedTimer === 0 ? elapsedTimer.elapsedMs : Math.min(elapsedTimer.elapsedMs, selectedTimer * 1000);

  return <div className="mt-6 rounded-xl border border-border bg-surface p-4 sm:p-6">
    {!started && !sessionFinished && <div className="space-y-4" dir="rtl"><div><h3 className="text-lg font-bold">Writing Practice</h3><p className="mt-1 text-sm text-ink-soft">پہلے سطح اور timer منتخب کریں، پھر اسی biography/chapter کے اصل متن سے typing شروع کریں۔</p></div><div className="grid gap-4 md:grid-cols-2"><div><p className="mb-2 text-sm font-semibold">Difficulty</p><div className="flex flex-wrap gap-2">{LEVELS.map((x) => <button key={x} type="button" onClick={() => { /* level is controlled by parent */ }} className={cn("rounded-md border px-3 py-2 text-sm", x === level ? "border-brand-500 bg-brand-50 text-brand-700" : "border-border text-ink-soft")}>{x[0].toUpperCase()+x.slice(1)}</button>)}</div></div><div><p className="mb-2 text-sm font-semibold">Timer</p><div className="flex flex-wrap gap-2">{TIMER_OPTIONS.map((x) => <button key={x} type="button" onClick={() => { setSelectedTimer(x); setRemaining(x); }} className={cn("rounded-md border px-3 py-2 text-sm", selectedTimer === x ? "border-brand-500 bg-brand-50 text-brand-700" : "border-border text-ink-soft")}>{x === 0 ? "No Limit" : `${x / 60} min`}</button>)}</div></div></div><div className="flex flex-wrap gap-2"><Button onClick={start}><Play size={15}/> Start Writing Practice</Button><Button variant="outline" onClick={reset}><TimerReset size={15}/> Reset</Button></div></div>}

    {started && !sessionFinished && <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><Badge>{level}</Badge><p className="mt-1 text-sm text-ink-soft">Chapter {chapterIndex + 1} / {bio.chapters.length}</p></div><div className="flex items-center gap-2 rounded-full border border-border bg-paper px-4 py-2 font-mono text-lg font-bold"><Clock size={16}/>{selectedTimer === 0 ? formatTime(elapsedSeconds) : formatTime(remaining)}</div></div>
      <div className="typing-workspace min-w-0"><div className="typing-display flex min-h-[210px] w-full min-w-0 flex-col items-center justify-center overflow-hidden rounded-xl border border-border bg-paper p-3 sm:p-4"><TypingCaptureArea typing={typing} onActiveChange={setIsCaptureActive} suppressNativeKeyboardOnTouch={showKeyboard}><div className="w-full min-w-0 overflow-hidden px-2 sm:px-4"><TypingText characters={typing.characters} statusSummary={`${typing.correctCharacters} درست · ${typing.currentIndex}/${typing.totalCharacters}`} showFeedback={typingFeedback} layout="scroll" resetKey={`${bio.id}-${current.id}-${level}`}/></div></TypingCaptureArea></div>{showKeyboard && <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]"><div className="min-w-0 space-y-3"><VirtualKeyboard pressedKey={pressed} expectedKey={expected} onKeyPress={keyboardTapInput.onKeyPress} onBackspace={keyboardTapInput.onBackspace}/><HandFingerGuide activeGuide={finger}/></div><TypingStats accuracy={typing.accuracy} currentIndex={typing.currentIndex} totalCharacters={typing.totalCharacters} incorrectCharacters={typing.incorrectCharacters} wpm={wpm} elapsedMs={visibleElapsed}/></div>}</div>
    </>}

    {sessionFinished && <div className="space-y-5" dir="rtl"><div className="flex flex-wrap items-center justify-between gap-3"><div><Badge>{expired ? "Time Up" : "Completed"}</Badge><h3 className="mt-2 text-xl font-bold">{bio.respectfulName}</h3><p className="mt-1 text-sm text-ink-soft">{current.title} · {level}</p></div><Button variant="outline" onClick={reset}><TimerReset size={15}/> دوبارہ</Button></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Card><p className="text-xs text-ink-faint">WPM</p><p className="mt-1 text-2xl font-bold">{wpm}</p></Card><Card><p className="text-xs text-ink-faint">Accuracy</p><p className="mt-1 text-2xl font-bold">{typing.sessionAccuracy}%</p></Card><Card><p className="text-xs text-ink-faint">Characters</p><p className="mt-1 text-2xl font-bold">{typing.currentIndex}</p></Card><Card><p className="text-xs text-ink-faint">Time</p><p className="mt-1 text-2xl font-bold">{formatTime(visibleElapsed / 1000)}</p></Card></div><ProgressBar value={(typing.currentIndex / Math.max(typing.totalCharacters, 1)) * 100} label="Biography progress"/><div className="flex flex-wrap gap-2"><Button onClick={reset}><Pause size={15}/> Restart Practice</Button><Button variant="outline" onClick={onComplete}>Done</Button></div></div>}
  </div>;
}

function BiographyDetail({ bio }: { bio: BiographyEntry }) {
  const p = loadBiographyProgress();
  const state = p.items[bio.id];
  const [bookmarked, setBookmarked] = useState(p.bookmarks.includes(bio.id));
  const [saved, setSaved] = useState(isReadLater(bio.id));
  const [tab, setTab] = useState<"learn" | "read" | "type" | "quiz">("learn");
  const [chapter, setChapter] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [level, setLevel] = useState<Level>((bio.difficulty === "expert" ? "expert" : bio.difficulty) as Level);
  const nav = useNavigate();
  const current = bio.chapters[chapter];

  useEffect(() => { markBiographyViewed(bio.id); }, [bio.id]);

  function answer(i: number) { if (quizDone) return; const q = bio.quiz[quizIndex]; const ok = i === q.answer; if (ok) setQuizCorrect((x) => x + 1); recordBiographyQuiz(bio.id, ok); if (quizIndex < bio.quiz.length - 1) setQuizIndex((x) => x + 1); else setQuizDone(true); }
  function nextChapter() { markChapterComplete(bio.id, current.id); if (chapter < bio.chapters.length - 1) { setChapter((x) => x + 1); setTab("read"); } else setTab("quiz"); }
  function changeChapter(i: number, mode: "read" | "type" = "read") { setChapter(i); setTab(mode); }
  const selectedLevelText = bio.levelContent?.[level];
  const readingText = selectedLevelText && chapter === 0 ? selectedLevelText.text : current.text;
  const quiz = bio.quiz[quizIndex];

  return <>
    <button onClick={() => nav(-1)} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-600"><ArrowLeft size={16}/> واپس</button>
    <div className="flex flex-wrap items-center justify-between gap-3"><div><Badge>{bio.subcategory}</Badge><h1 className="mt-3 text-3xl font-bold">{bio.respectfulName}</h1><p className="mt-2 text-sm text-ink-soft">{bio.era}{bio.region ? ` · ${bio.region}` : ""}</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => setBookmarked(toggleBookmark(bio.id))}><Bookmark size={16} fill={bookmarked ? "currentColor" : "none"}/>{bookmarked ? "Bookmarked" : "Bookmark"}</Button><Button variant="outline" onClick={() => { const next = toggleReadLater(bio.id); setSaved(next); }}>{saved ? "Saved ✓" : "Read Later"}</Button></div></div>

    <Card className="mt-6"><div className="grid gap-2 sm:grid-cols-4">{([['Learn','learn'],['Read','read'],['Type','type'],['Quiz','quiz']] as const).map(([label, value]) => <button key={value} onClick={() => setTab(value)} className={cn("rounded-md border px-4 py-3 text-sm font-semibold", tab === value ? "border-brand-500 bg-brand-50 text-brand-700" : "border-border hover:bg-surface")}>{label}</button>)}</div></Card>

    {tab === "learn" && <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_.7fr]">
      <Card dir="rtl"><CardHeader><CardTitle>تعارف اور جامع مطالعہ</CardTitle><CardDescription>{bio.summary}</CardDescription></CardHeader><p className="urdu-text text-lg leading-10">{bio.biography}</p>{bio.levelContent && <div className="mt-6 rounded-lg border border-brand-100 bg-brand-50 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-bold">Learner level</p><p className="text-sm text-ink-soft">ہر سطح کے لیے اندازِ بیان الگ رکھا گیا ہے۔</p></div><div className="flex flex-wrap gap-2">{LEVELS.map((x) => <button key={x} onClick={() => setLevel(x)} className={cn("rounded-md border px-3 py-1.5 text-xs font-semibold", level === x ? "border-brand-500 bg-paper text-brand-700" : "border-border bg-paper")}>{x[0].toUpperCase()+x.slice(1)}</button>)}</div></div><p className="mt-3 urdu-text leading-8">{bio.levelContent[level]?.summary ?? bio.summary}</p></div>}
      <div className="mt-6 grid gap-3">{bio.achievements.map((x) => <div key={x} className="rounded-md bg-paper p-3">{x}</div>)}</div></Card>
      <Card><CardHeader><CardTitle>Chapters</CardTitle><CardDescription>{bio.chapters.length} structured reading/writing sections۔</CardDescription></CardHeader><div className="max-h-[720px] space-y-2 overflow-auto pr-1">{bio.chapters.map((c, i) => <div key={c.id} className={cn("rounded-md border p-3", chapter === i ? "border-brand-400 bg-brand-50" : "border-border")}><button onClick={() => changeChapter(i, "read")} className="w-full text-left"><div className="flex justify-between gap-2"><span>{i + 1}. {c.title}</span>{state?.completedChapters.includes(c.id) && <CheckCircle2 size={16} className="text-success-600"/>}</div><p className="mt-1 text-xs text-ink-soft">{c.summary}</p></button><div className="mt-2 flex gap-2"><button onClick={() => changeChapter(i, "read")} className="text-xs font-semibold text-brand-600">Read</button><button onClick={() => changeChapter(i, "type")} className="text-xs font-semibold text-brand-600">Practice</button></div></div>)}</div></Card>
    </div>}

    {tab === "read" && <Card className="mt-6" dir="rtl"><div className="flex flex-wrap items-center justify-between gap-3"><div><Badge>Chapter {chapter + 1}/{bio.chapters.length}</Badge><h2 className="urdu-text mt-3 text-2xl font-bold">{current.title}</h2><p className="mt-1 text-sm text-ink-soft">{current.summary}</p></div><div className="flex gap-2"><Button variant="outline" onClick={() => speak(readingText)}><Volume2 size={16}/> سنیں</Button><Button onClick={() => setTab("type")}><Play size={15}/> Start Writing Practice</Button></div></div><ProgressBar value={((chapter + 1) / bio.chapters.length) * 100} label={`Chapter ${chapter + 1} / ${bio.chapters.length}`}/><p className="urdu-text mt-6 whitespace-pre-line text-lg leading-10">{readingText}</p><div className="mt-6 flex flex-wrap justify-between gap-2"><Button variant="outline" disabled={chapter === 0} onClick={() => setChapter((x) => Math.max(0, x - 1))}><ArrowLeft size={15}/> پچھلا</Button><Button onClick={nextChapter}>{chapter === bio.chapters.length - 1 ? "Quiz شروع کریں" : "اگلا باب"} <ArrowRight size={15}/></Button></div><Sources bio={bio}/></Card>}

    {tab === "type" && <Card className="mt-6 overflow-hidden"><CardHeader><CardTitle>Read → Type Practice</CardTitle><CardDescription>آپ جو متن پڑھ رہے ہیں، اسی کو موجودہ Urdu typing engine، virtual keyboard اور finger guidance کے ساتھ ٹائپ کریں۔</CardDescription></CardHeader><div dir="rtl" className="flex flex-wrap items-center gap-2"><span className="text-sm font-semibold">Difficulty:</span>{LEVELS.map((x) => <button key={x} onClick={() => setLevel(x)} className={cn("rounded-full border px-3 py-1.5 text-xs", level === x ? "border-brand-500 bg-brand-50 text-brand-700" : "border-border")}>{x}</button>)}</div><TimedTypingPractice bio={bio} chapterIndex={chapter} level={level} onComplete={() => markTypingComplete(bio.id, current.id)}/></Card>}

    {tab === "quiz" && <Card className="mt-6" dir="rtl"><CardHeader><CardTitle>Quiz</CardTitle><CardDescription>سوالات اسی biography کے structured content سے آتے ہیں۔</CardDescription></CardHeader>{quizDone ? <div className="py-8 text-center"><CheckCircle2 className="mx-auto text-success-600" size={42}/><h2 className="mt-3 text-2xl font-bold">کوئز مکمل!</h2><p className="mt-2 text-ink-soft">آپ کے درست جوابات: {quizCorrect}/{bio.quiz.length}</p><ProgressBar value={(quizCorrect / Math.max(bio.quiz.length, 1)) * 100} label="Score"/><div className="mt-5 flex justify-center gap-2"><Button onClick={() => { setQuizIndex(0); setQuizCorrect(0); setQuizDone(false); }} variant="outline">دوبارہ</Button><Button to="/biography/library">مزید سوانح</Button></div></div> : <><p className="text-lg font-semibold">{quiz.question}</p><div className="mt-5 grid gap-3 sm:grid-cols-2">{quiz.options.map((o, i) => <button key={o} onClick={() => answer(i)} className="rounded-md border border-border p-4 text-right hover:border-brand-400 hover:bg-brand-50">{o}</button>)}</div><p className="mt-5 text-xs text-ink-faint">سوال {quizIndex + 1} / {bio.quiz.length}</p></>}</Card>}

    <Card className="mt-6" dir="rtl"><CardHeader><CardTitle>{"timeline"}</CardTitle><CardDescription>اہم واقعات کو ترتیب کے ساتھ دیکھیں؛ اختلافی امور کو جہاں ضروری ہو محتاط انداز میں بیان کیا گیا ہے۔</CardDescription></CardHeader><div className="space-y-3">{bio.timeline.map((e) => <div key={e.id} className="flex gap-4 rounded-md border border-border p-4"><div className="mt-1 rounded-full bg-brand-50 p-2 text-brand-600"><Clock size={16}/></div><div><p className="font-semibold">{e.label}{e.date ? ` · ${e.date}` : ""}</p><p className="mt-1 text-sm leading-7 text-ink-soft">{e.description}</p></div></div>)}</div></Card>

    {bio.id === "muhammad" && <Card className="mt-6" dir="rtl"><CardHeader><CardTitle>اولادِ رسول ﷺ</CardTitle><CardDescription>سات بچوں کی بنیادی نسبت؛ چھ حضرت خدیجہ رضی اللہ عنہا سے اور حضرت ابراہیم رضی اللہ عنہ حضرت ماریہ قبطیہ رضی اللہ عنہا سے۔</CardDescription></CardHeader><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{["qasim","abdullah","zaynab-daughter","ruqayyah","umm-kulthum","fatimah","ibrahim"].map((id) => { const child = getBiography(id); return child ? <Link key={id} to={`/biography/${id}`} className="rounded-md border border-border p-3 hover:bg-surface"><p className="urdu-text font-semibold">{child.respectfulName}</p><p className="mt-1 text-xs text-ink-soft">{child.summary}</p></Link> : null; })}</div></Card>}
    {bio.id === "muhammad" && <Card className="mt-6" dir="rtl"><CardHeader><CardTitle>ازواجِ مطہرات / امہات المؤمنین</CardTitle><CardDescription>عام طور پر بیان کی جانے والی گیارہ ازواج کے الگ profiles؛ تاریخی مآخذ میں ریحانہ رضی اللہ عنہا اور بعض دیگر تفصیلات کے بارے میں اختلاف موجود ہے، اس لیے اسے الگ note کے ساتھ رکھا گیا ہے۔</CardDescription></CardHeader><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{["khadijah","sawdah","aisha","hafsah","zaynab-khuzaymah","umm-salamah","juwayriyah","zaynab-jahsh","umm-habibah","safiyyah","maymunah"].map((id) => { const wife = getBiography(id); return wife ? <Link key={id} to={`/biography/${id}`} className="rounded-md border border-border p-3 hover:bg-surface"><p className="urdu-text font-semibold">{wife.respectfulName}</p><p className="mt-1 text-xs text-ink-soft">{wife.summary}</p></Link> : null; })}</div><Link to="/biography/mariyah" className="mt-4 block rounded-md border border-brand-100 bg-brand-50 p-4"><p className="urdu-text font-semibold">حضرت ماریہ قبطیہ رضی اللہ عنہا — الگ پروفائل</p><p className="mt-1 text-sm text-ink-soft">حضرت ابراہیم رضی اللہ عنہ کی والدہ؛ ان کی حیثیت کو ازواجِ مطہرات کی فہرست سے الگ محتاط انداز میں بیان کیا گیا ہے۔</p></Link></Card>}

    {bio.relatedIds.length > 0 && <section className="mt-6"><h2 className="mb-3 text-xl font-bold">Related Topics</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{bio.relatedIds.map((id) => { const r = getBiography(id); return r ? <Link key={id} to={`/biography/${id}`} className="rounded-md border border-border p-4 hover:bg-surface"><span className="urdu-text text-lg font-semibold">{r.respectfulName}</span><span className="mt-1 block text-xs text-ink-faint">{r.subcategory}</span></Link> : null; })}</div></section>}
  </>;
}

export default function Biography() {
  const location = useLocation();
  const segments = location.pathname.replace(/^\/biography\/?/, "").split("/").filter(Boolean);
  const id = segments[0];
  const bio = id && id !== "library" && id !== "read-later" ? getBiography(id) : undefined;
  useSEO({
    title: bio ? `${bio.name} — Biography` : id === "read-later" ? "Biography Read Later" : id === "library" ? "Biography Library" : "Biography — Islamic History & Learning",
    description: bio ? `${bio.summary} Read, learn and practise through PAKURDU.` : "Explore biographies, Islamic history and learning resources in PAKURDU.",
    noIndex: id === "read-later",
  });
  return <PageContainer><div className="py-8 sm:py-10"><div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start"><ContentSidebar/><main className="min-w-0">{!id ? <Dashboard/> : id === "library" ? <Library/> : id === "read-later" ? <Library readLaterOnly/> : bio ? <BiographyDetail bio={bio}/> : <Library/>}</main></div></div></PageContainer>;
}
