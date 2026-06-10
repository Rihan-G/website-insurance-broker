import { useState, useEffect, type CSSProperties } from "react";

/**
 * Homepage colour rail under the nav — sliding cyan / champagne / silver track,
 * with a fill that grows left-to-right as you scroll the page.
 */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="home-color-shift-bar fixed top-16 left-0 z-[51] h-2 w-full overflow-hidden"
      role="progressbar"
      aria-label="Page scroll progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      style={{ "--scroll-progress": `${progress}%` } as CSSProperties}
    >
      <div className="home-color-shift-bar__track" aria-hidden>
        <div className="home-color-shift-bar__gradient home-color-shift-bar__gradient--track" />
      </div>
      <div className="home-color-shift-bar__fill" aria-hidden>
        <div className="home-color-shift-bar__gradient home-color-shift-bar__gradient--fill" />
      </div>
    </div>
  );
}
