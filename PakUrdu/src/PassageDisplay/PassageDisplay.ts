import React, { useRef, useEffect, useMemo } from 'react';
import './PassageDisplay.css';

interface PassageDisplayProps {
  passage: string;
  typedText: string;
}

export const PassageDisplay: React.FC<PassageDisplayProps> = ({ passage, typedText }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLSpanElement>(null);

  // Fix 3: Passage ki extra spaces/tabs ko pehle hi normalize kar diya
  const normalizedPassage = useMemo(() => {
    return passage.replace(/\s+/g, ' ').trim();
  }, [passage]);

  const words = useMemo(() => {
    return normalizedPassage.split(' ').filter(Boolean);
  }, [normalizedPassage]);

  // Fix 1: Single source of truth for typedWords (No duplicate splitting)
  const typedWords = useMemo(() => {
    return typedText.trim().split(/\s+/).filter(Boolean);
  }, [typedText]);

  // Fix 1: Reusing typedWords directly inside currentIndex calculation
  const currentIndex = useMemo(() => {
    if (typedWords.length === 0) return 0;
    return typedText.endsWith(' ') ? typedWords.length : typedWords.length - 1;
  }, [typedWords, typedText]);

  // Fix 2 & Scroll Fix: Smooth, container-bound scroll without affecting whole page viewport
  useEffect(() => {
    if (activeWordRef.current && containerRef.current) {
      const container = containerRef.current;
      const word = activeWordRef.current;

      const wordOffsetTop = word.offsetTop;
      const containerHeight = container.clientHeight;

      container.scrollTo({
        top: wordOffsetTop - containerHeight / 2 + word.clientHeight / 2,
        behavior: 'smooth',
      });
    }
  }, [currentIndex]);

  return (
    <div className="urdu-passage-wrapper" dir="rtl">
      <div className="urdu-passage-container" ref={containerRef}>
        {words.map((word, index) => {
          let statusClass = 'pending';
          if (index < currentIndex) {
            statusClass = typedWords[index] === word ? 'correct' : 'incorrect';
          } else if (index === currentIndex) {
            statusClass = 'active';
          }

          return (
            <span
              key={index}
              ref={index === currentIndex ? activeWordRef : null}
              className={`word ${statusClass}`}
            >
              {word}{' '}
            </span>
          );
        })}
      </div>
    </div>
  );
};