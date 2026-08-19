import { useEffect } from 'react';

export const useVisualViewport = () => {
  useEffect(() => {
    if (!window.visualViewport) return;
    const onResizeViewport = () => {
      const vh = window.innerHeight;
      const vv = window.visualViewport.height;
      const kbHeight = Math.max(0, vh - vv);
      document.documentElement.style.setProperty('--keyboard-height', `${kbHeight}px`);
    };
    window.visualViewport.addEventListener('resize', onResizeViewport);
    window.visualViewport.addEventListener('scroll', onResizeViewport);
    onResizeViewport();
    return () => {
      window.visualViewport.removeEventListener('resize', onResizeViewport);
      window.visualViewport.removeEventListener('scroll', onResizeViewport);
    };
  }, []);
};
