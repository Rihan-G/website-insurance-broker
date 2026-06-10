import { useState, useEffect } from "react";

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="scroll-progress-root fixed top-16 left-0 z-50 h-1 w-full"
      role="progressbar"
      aria-label="Page scroll progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
    >
      <div className="scroll-progress-rail absolute inset-0" aria-hidden />
      <div
        className="absolute inset-y-0 left-0 overflow-hidden transition-[width] duration-150"
        style={{ width: `${progress}%` }}
      >
        <div className="scroll-progress-fill h-full w-[100vw]" />
      </div>
    </div>
  );
}
