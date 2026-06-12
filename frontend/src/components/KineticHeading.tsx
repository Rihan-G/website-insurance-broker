/**
 * KineticHeading — word-by-word staggered reveal
 * ui-ux-pro-max-skill #30: Kinetic Typography
 */
import { useEffect, useState } from "react";

interface KineticHeadingProps {
  text: string;
  className?: string;
  highlightWords?: string[];
  delay?: number; // ms before animation starts
}

export function KineticHeading({
  text,
  className = "",
  highlightWords = [],
  delay = 200,
}: KineticHeadingProps) {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const words = text.split(" ");

  return (
    <span className={`kinetic-heading ${started ? "kinetic-heading--started" : ""} ${className}`.trim()}>
      {words.map((word, i) => {
        const isHighlight = highlightWords.includes(word);
        return (
          <span key={i} className="inline-block mr-[0.25em] kinetic-word-wrap">
            <span className={`word-animate ${isHighlight ? "text-accent-600 dark:text-accent-200" : ""}`}>{word}</span>
          </span>
        );
      })}
    </span>
  );
}

/* ── Typewriter component ── */
interface TypewriterProps {
  words: string[];
  className?: string;
  speed?: number;
}

export function Typewriter({ words, className = "", speed = 90 }: TypewriterProps) {
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx] ?? "";
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && charIdx < current.length) {
      timeout = setTimeout(() => setCharIdx((c) => c + 1), speed);
    } else if (!deleting && charIdx === current.length) {
      timeout = setTimeout(() => setDeleting(true), 1800);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => setCharIdx((c) => c - 1), speed / 2);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setWordIdx((w) => (w + 1) % words.length);
    }

    return () => clearTimeout(timeout);
  }, [charIdx, deleting, wordIdx, words, speed]);

  const current = words[wordIdx] ?? "";

  return (
    <span className={className}>
      {current.slice(0, charIdx)}
      <span className="typewriter-cursor" />
    </span>
  );
}
