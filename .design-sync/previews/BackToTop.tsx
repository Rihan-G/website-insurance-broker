import { useEffect } from 'react';
import { BackToTop } from 'frontend';

export const Default = () => {
  useEffect(() => {
    // Force scrollY to > 400 so the button becomes visible
    try {
      Object.defineProperty(window, 'scrollY', { get: () => 500, configurable: true });
    } catch {}
    window.dispatchEvent(new Event('scroll'));
  }, []);

  return (
    <div style={{ position: 'relative', height: '120px', background: 'var(--color-background)', borderRadius: '8px', overflow: 'hidden' }}>
      <div style={{ padding: '16px', color: 'var(--color-muted-foreground)', fontSize: '13px' }}>
        Scroll-triggered back-to-top button (visible when page is scrolled)
      </div>
      <BackToTop />
    </div>
  );
};
