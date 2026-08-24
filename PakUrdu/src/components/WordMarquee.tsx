import { cn } from "@/lib/cn";

interface WordMarqueeProps {
  words: string[];
  label?: string;
  className?: string;
}

export function WordMarquee({ words, label, className }: WordMarqueeProps) {
  const safeWords = words.filter(Boolean);
  const track = [...safeWords, ...safeWords];

  return (
    <section
      className={cn("word-marquee overflow-hidden rounded-xl border border-border bg-paper", className)}
      aria-label={label}
      dir="rtl"
    >
      {label && <p className="sr-only">{label}</p>}
      <div className="word-marquee__viewport overflow-hidden">
        <div className="word-marquee__track flex w-max items-center gap-5 whitespace-nowrap py-4">
          {track.map((word, index) => (
            <span
              key={`${word}-${index}`}
              className="word-marquee__word inline-flex shrink-0 items-center rounded-full border border-border bg-surface px-5 py-2.5 text-xl font-semibold leading-none sm:text-2xl"
              lang="ur"
            >
              {word}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
