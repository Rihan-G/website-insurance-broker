import { useState, useEffect, type CSSProperties } from "react";

/**
 * Homepage colour rail under the nav — cyan / champagne / silver sheen slides continuously.
 * Scroll depth adds a brighter highlight on the left portion.
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
      className="home-color-shift-bar fixed top-16 left-0 z-50 h-2 w-full overflow-hidden"
      role="progressbar"
      aria-label="Page scroll progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      style={{ "--scroll-progress": `${progress}%` } as CSSProperties}
    >
      <div className="home-color-shift-bar__track" aria-hidden>
        <div className="home-color-shift-bar__gradient" />
      </div>
      <div className="home-color-shift-bar__scroll-glow" aria-hidden />
    </div>
  );
}
