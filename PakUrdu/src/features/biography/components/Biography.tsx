import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, Bookmark, CheckCircle2, Clock, Search, Star, Users, Volume2 } from "lucide-react";
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
import { cn } from "@/lib/cn";
import { useLanguage } from "@/i18n/useLanguage";

function speak(text: string) { if (!("speechSynthesis" in window)) return false; window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = "ur-PK"; u.rate = .78; window.speechSynthesis.speak(u); return true; }

function Dashboard() {
  const { t } = useLanguage();
  const p = loadBiographyProgress();
  const viewed = Object.values(p.items).filter(x => x.viewed).length;
  const completed = Object.values(p.items).filter(x => x.completedChapters.length > 0).length;
  return <>
    <PageHeader title={t.biography.title} description="مستند سوانح، اسلامی تاریخ اور مسلم علمی روایت کو پڑھیں، سنیں، ٹائپ کریں اور کوئز کے ذریعے دہرائیں۔" />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {([
        ['کل شخصیات', biographies.length, Users],
        ['دیکھی گئی', viewed, BookOpen],
        ['مطالعہ شروع', completed, CheckCircle2],
        ['XP', p.xp, Star],
      ] as [string, number, typeof Users][]).map(([label, value, Icon]) => <Card key={String(label)}><div className="flex items-center justify-between"><div><p className="text-sm text-ink-soft">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div><Icon size={23} className="text-brand-500" /></div></Card>)}
    </div>
    <Card className="mt-6" dir="rtl">
      <div className="rounded-md border border-brand-100 bg-brand-50 p-6 text-center"><Badge>The Greatest Man in History</Badge><h2 className="urdu-text mt-4 text-4xl font-bold text-brand-900">حضرت محمد مصطفیٰ ﷺ</h2><p className="mt-3 leading-8 text-ink">سیرتِ نبوی ﷺ کو مرحلہ وار پڑھیں، سنیں، ٹائپ کریں اور مستند ماخذ کی طرف رجوع کرتے ہوئے سیکھیں۔</p><Button to="/biography/muhammad" className="mt-5" variant="primary">سیرت شروع کریں <ArrowRight size={16}/></Button></div>
    </Card>
    <section className="mt-8"><div className="mb-4 flex items-end justify-between"><div><h2 className="text-xl font-bold">{t.biography.title}</h2><p className="text-sm text-ink-soft">اسلامی شخصیات، خلفائے راشدین اور مسلم سائنس دان۔</p></div><Button to="/biography/library" variant="ghost" size="sm">تمام شخصیات <ArrowRight size={15}/></Button></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{biographies.slice(0,6).map(b => <BiographyCard key={b.id} bio={b}/>)}</div></section>
  </>;
}

function BiographyCard({ bio }: { bio: BiographyEntry }) { const p = loadBiographyProgress().items[bio.id]; return <Link to={`/biography/${bio.id}`}><Card hover className="h-full"><div className="flex items-start justify-between gap-3"><div dir="rtl"><p className="urdu-text text-2xl font-bold">{bio.respectfulName}</p><p dir="ltr" className="mt-1 text-xs text-ink-faint">{bio.aliases[0]}</p></div>{p?.completedChapters.length ? <CheckCircle2 className="text-success-600" size={20}/> : null}</div><p dir="rtl" className="mt-4 leading-7 text-ink-soft">{bio.summary}</p><div className="mt-4 flex flex-wrap gap-2"><Badge>{bio.subcategory}</Badge><Badge>{bio.difficulty}</Badge></div></Card></Link>; }

function Library() {
  const location=useLocation(); const params=new URLSearchParams(location.search); const [q,setQ]=useState(""); const [cat,setCat]=useState(params.get("category") ?? "all"); const [difficulty,setDifficulty]=useState("all");
  const filtered = useMemo(() => biographies.filter(b => { const hay=[b.name,b.respectfulName,...b.aliases,b.summary,b.subcategory].join(" ").toLowerCase(); return (!q || hay.includes(q.toLowerCase())) && (cat==='all'||b.category===cat) && (difficulty==='all'||b.difficulty===difficulty); }),[q,cat,difficulty]);
  return <><PageHeader title="Biography Library" description="English names، اردو نام، Roman aliases، category اور difficulty سے تلاش کریں۔"/><Card className="mb-6"><div className="grid gap-3 md:grid-cols-[1fr_auto_auto]"><Input value={q} onChange={e=>setQ(e.target.value)} placeholder="مثلاً Abu Bakr، ابوبکر، Al-Khwarizmi"/><select value={cat} onChange={e=>setCat(e.target.value)} className="rounded-sm border border-border bg-surface px-3 py-2 text-sm"><option value="all">تمام categories</option>{biographyCategories.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}</select><select value={difficulty} onChange={e=>setDifficulty(e.target.value)} className="rounded-sm border border-border bg-surface px-3 py-2 text-sm"><option value="all">ہر سطح</option><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option><option value="expert">Expert</option></select></div><p className="mt-3 flex items-center gap-2 text-xs text-ink-faint"><Search size={14}/>{filtered.length} biographies</p></Card>{filtered.length?<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map(b=><BiographyCard key={b.id} bio={b}/>)}</div>:<Card><div className="py-12 text-center"><Search className="mx-auto text-ink-faint"/><p className="mt-3 font-semibold">کوئی سوانح نہیں ملی</p></div></Card>}</>;
}

function Sources({ bio }: { bio: BiographyEntry }) { return <details className="mt-6 rounded-md border border-border bg-paper p-4"><summary className="cursor-pointer font-semibold">Sources & References</summary><div className="mt-4 space-y-3">{bio.sources.map((s,i)=><a key={i} href={s.url} target="_blank" rel="noreferrer" className="block rounded border border-border p-3 hover:bg-surface"><p className="font-medium">{s.title}</p><p className="text-xs text-ink-soft">{s.institution ?? s.author ?? s.sourceType}</p></a>)}</div></details>; }

function BiographyDetail({ bio }: { bio: BiographyEntry }) {
  const { t } = useLanguage();
  const p=loadBiographyProgress(); const state=p.items[bio.id]; const [bookmarked,setBookmarked]=useState(p.bookmarks.includes(bio.id)); const [tab,setTab]=useState<'learn'|'read'|'type'|'quiz'>('learn'); const [chapter,setChapter]=useState(0); const [quizIndex,setQuizIndex]=useState(0); const [quizDone,setQuizDone]=useState(false); const [quizCorrect,setQuizCorrect]=useState(0); const nav=useNavigate();
  const { showKeyboard, typingFeedback, soundEnabled } = useSettings();
  useEffect(()=>{ markBiographyViewed(bio.id); },[bio.id]);
  const current=bio.chapters[chapter]; const typing=useTypingEngine({targetText:current.text});
  const [isCaptureActive,setIsCaptureActive]=useState(false);
  const pressed=usePressedKey(isCaptureActive); const expected=getExpectedKey(typing.targetText[typing.currentIndex]); const finger=expected?.key && expected.key!=="space"?fingerForKey(expected.key):null;
  const keyboardTapInput=useKeyboardTapInput(typing,soundEnabled);
  const timer=useTypingTimer({hasStarted:typing.currentIndex>0,isComplete:typing.isComplete,resetKey:`${bio.id}-${current.id}`});
  const wpm=calculateWPM(typing.currentIndex,timer.elapsedMs);
  const hasRecordedTypingRef=useRef<string|null>(null);
  useEffect(()=>{if(typing.isComplete && hasRecordedTypingRef.current!==current.id){hasRecordedTypingRef.current=current.id;markTypingComplete(bio.id,current.id)}},[typing.isComplete,bio.id,current.id]);
  function nextChapter(){ markChapterComplete(bio.id,current.id); if(chapter<bio.chapters.length-1){setChapter(x=>x+1);setTab('learn')} else setTab('quiz'); }
  // Same advance as nextChapter, but stays on the Type tab so the
  // learner can keep typing chapter after chapter without being
  // bounced back through Learn/Read for each one (continuous
  // Type -> Next -> Type practice flow).
  function nextChapterKeepTyping(){ markChapterComplete(bio.id,current.id); if(chapter<bio.chapters.length-1){setChapter(x=>x+1)} else setTab('quiz'); }
  useEffect(()=>{
    if(tab!=='type' || !typing.isComplete) return;
    const timerId=window.setTimeout(()=>{ nextChapterKeepTyping(); }, 900);
    return ()=>window.clearTimeout(timerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[tab,typing.isComplete,chapter]);
  function answer(i:number){ if(quizDone) return; const q=bio.quiz[quizIndex]; const ok=i===q.answer; if(ok)setQuizCorrect(x=>x+1); recordBiographyQuiz(bio.id,ok); if(quizIndex<bio.quiz.length-1)setQuizIndex(x=>x+1); else setQuizDone(true); }
  const quiz=bio.quiz[quizIndex];
  return <>
    <button onClick={()=>nav(-1)} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-600"><ArrowLeft size={16}/> واپس</button>
    <div className="flex flex-wrap items-center justify-between gap-3"><div><Badge>{bio.subcategory}</Badge><h1 className="mt-3 text-3xl font-bold">{bio.respectfulName}</h1><p className="mt-2 text-sm text-ink-soft">{bio.era}{bio.region?` · ${bio.region}`:''}</p></div><Button variant="outline" onClick={()=>setBookmarked(toggleBookmark(bio.id))}><Bookmark size={16} fill={bookmarked?'currentColor':'none'}/>{bookmarked?'محفوظ':'Save for Later'}</Button></div>
    <Card className="mt-6"><div className="grid gap-4 md:grid-cols-4">{[['Learn','learn'],['Read','read'],['Type','type'],['Quiz','quiz']].map(([label,value])=><button key={value} onClick={()=>setTab(value as typeof tab)} className={cn('rounded-md border px-4 py-3 text-sm font-semibold',tab===value?'border-brand-500 bg-brand-50 text-brand-700':'border-border hover:bg-surface')}>{label}</button>)}</div></Card>
    {tab==='learn' && <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_.7fr]"><Card dir="rtl"><CardHeader><CardTitle>تعارف</CardTitle><CardDescription>{bio.summary}</CardDescription></CardHeader><p className="leading-8 text-ink">{bio.biography}</p><div className="mt-6 grid gap-3">{bio.achievements.map(x=><div key={x} className="rounded-md bg-paper p-3">{x}</div>)}</div></Card><Card><CardHeader><CardTitle>{t.biography.chapters}</CardTitle><CardDescription>ایک ہی reusable biography engine سے chapter-based learning۔</CardDescription></CardHeader><div className="space-y-2">{bio.chapters.map((c,i)=><button key={c.id} onClick={()=>{setChapter(i);setTab('read')}} className={cn('w-full rounded-md border p-3 text-left',chapter===i?'border-brand-400 bg-brand-50':'border-border hover:bg-surface')}><div className="flex justify-between"><span>{i+1}. {c.title}</span>{state?.completedChapters.includes(c.id)&&<CheckCircle2 size={16} className="text-success-600"/>}</div><p className="mt-1 text-xs text-ink-soft">{c.summary}</p></button>)}</div></Card></div>}
    {tab==='read' && <Card className="mt-6" dir="rtl"><div className="flex flex-wrap items-center justify-between gap-3"><div><Badge>Chapter {chapter+1}/{bio.chapters.length}</Badge><h2 className="urdu-text mt-3 text-2xl font-bold">{current.title}</h2></div><Button variant="outline" onClick={()=>speak(current.text)}><Volume2 size={16}/> سنیں</Button></div><p className="urdu-text mt-6 whitespace-pre-line text-lg leading-10">{current.text}</p><div className="mt-6 flex flex-wrap justify-between gap-2"><Button variant="outline" disabled={chapter===0} onClick={()=>setChapter(x=>Math.max(0,x-1))}><ArrowLeft size={15}/> پچھلا</Button><Button onClick={nextChapter}>{chapter===bio.chapters.length-1?'Quiz شروع کریں':'اگلا باب'} <ArrowRight size={15}/></Button></div><Sources bio={bio}/></Card>}
    {tab==='type' && <Card className="mt-6 overflow-hidden">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>{t.biography.typeChapter}</CardTitle>
            <CardDescription>موجودہ باب کو موجودہ Urdu typing engine، keyboard، finger guidance اور typing sounds کے ساتھ مشق کریں۔</CardDescription>
          </div>
          <Badge>Chapter {chapter+1}/{bio.chapters.length}</Badge>
        </div>
      </CardHeader>

      <div className="typing-workspace min-w-0">
        <div className="typing-display flex min-h-[190px] w-full min-w-0 flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border border-border bg-paper p-3 sm:p-4">
          <TypingCaptureArea typing={typing} onActiveChange={setIsCaptureActive} suppressNativeKeyboardOnTouch={showKeyboard}>
            <div className="w-full min-w-0 overflow-hidden px-2 sm:px-4">
              <TypingText
                characters={typing.characters}
                statusSummary={`${typing.correctCharacters} درست · ${typing.currentIndex}/${typing.totalCharacters}`}
                showFeedback={typingFeedback}
                layout="scroll"
                resetKey={`${bio.id}-${current.id}`}
              />
            </div>
          </TypingCaptureArea>
        </div>

        {showKeyboard && (
          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div className="min-w-0 space-y-3">
              <VirtualKeyboard pressedKey={pressed} expectedKey={expected} onKeyPress={keyboardTapInput.onKeyPress} onBackspace={keyboardTapInput.onBackspace}/>
              <HandFingerGuide activeGuide={finger}/>
            </div>
            <TypingStats accuracy={typing.accuracy} currentIndex={typing.currentIndex} totalCharacters={typing.totalCharacters} incorrectCharacters={typing.incorrectCharacters} wpm={wpm} elapsedMs={timer.elapsedMs}/>
          </div>
        )}
      </div>

      {typing.isComplete && (
        <div className="mt-4 flex flex-col items-center gap-2 rounded-md bg-brand-50 p-4 text-center text-brand-800">
          <p className="font-semibold">باب کی typing مکمل!</p>
          <p className="text-sm">+20 XP · progress محفوظ ہو گیا۔ {chapter<bio.chapters.length-1 ? "اگلا باب شروع ہو رہا ہے…" : "کوئز کی طرف بڑھ رہے ہیں…"}</p>
          <Button className="mt-1" onClick={()=>{nextChapterKeepTyping();}}>{chapter<bio.chapters.length-1?"ابھی اگلا باب":"ابھی کوئز شروع کریں"} <ArrowRight size={15}/></Button>
        </div>
      )}
    </Card>}
    {tab==='quiz' && <Card className="mt-6" dir="rtl"><CardHeader><CardTitle>{t.biography.quiz}</CardTitle><CardDescription>سوالات صرف اسی biography کے structured content سے آتے ہیں۔</CardDescription></CardHeader>{quizDone?<div className="py-8 text-center"><CheckCircle2 className="mx-auto text-success-600" size={42}/><h2 className="mt-3 text-2xl font-bold">کوئز مکمل!</h2><p className="mt-2 text-ink-soft">آپ کے درست جوابات: {quizCorrect}/{bio.quiz.length}</p><ProgressBar value={(quizCorrect/bio.quiz.length)*100} label="Score"/><div className="mt-5 flex justify-center gap-2"><Button onClick={()=>{setQuizIndex(0);setQuizCorrect(0);setQuizDone(false)}} variant="outline">دوبارہ</Button><Button to="/biography/library">مزید سوانح</Button></div></div>:<><p className="text-lg font-semibold">{quiz.question}</p><div className="mt-5 grid gap-3 sm:grid-cols-2">{quiz.options.map((o,i)=><button key={o} onClick={()=>answer(i)} className="rounded-md border border-border p-4 text-right hover:border-brand-400 hover:bg-brand-50">{o}</button>)}</div><p className="mt-5 text-xs text-ink-faint">سوال {quizIndex+1} / {bio.quiz.length}</p></>}</Card>}
    <Card className="mt-6" dir="rtl"><CardHeader><CardTitle>{t.biography.timeline}</CardTitle><CardDescription>اہم واقعات کو ترتیب کے ساتھ دیکھیں۔ اختلافی تاریخوں کو جہاں ضروری ہو محتاط انداز میں بیان کیا گیا ہے۔</CardDescription></CardHeader><div className="space-y-3">{bio.timeline.map(e=><div key={e.id} className="flex gap-4 rounded-md border border-border p-4"><div className="mt-1 rounded-full bg-brand-50 p-2 text-brand-600"><Clock size={16}/></div><div><p className="font-semibold">{e.label}{e.date?` · ${e.date}`:''}</p><p className="mt-1 text-sm leading-7 text-ink-soft">{e.description}</p></div></div>)}</div></Card>
    {bio.relatedIds.length>0&&<section className="mt-6"><h2 className="mb-3 text-xl font-bold">Related Topics</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{bio.relatedIds.map(id=>{const r=getBiography(id);return r?<Link key={id} to={`/biography/${id}`} className="rounded-md border border-border p-4 hover:bg-surface"><span className="urdu-text text-lg font-semibold">{r.respectfulName}</span><span className="mt-1 block text-xs text-ink-faint">{r.subcategory}</span></Link>:null})}</div></section>}
  </>;
}

export default function Biography() {
  const location=useLocation(); const segments=location.pathname.replace(/^\/biography\/?/,"").split("/").filter(Boolean); const id=segments[0]; const bio=id&&id!=='library'?getBiography(id):undefined;
  return <PageContainer><div className="py-8 sm:py-10"><div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start"><ContentSidebar/><main className="min-w-0">{!id?<Dashboard/>:id==='library'?<Library/>:bio?<BiographyDetail bio={bio}/>:<Library/>}</main></div></div></PageContainer>;
}
