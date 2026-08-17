import { useRef, useEffect } from 'react';

export const useDraggable = () => {
  const containerRef = useRef(null);
  const draggingRef = useRef(false);
  const offsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!draggingRef.current || !containerRef.current) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      
      if (clientX === undefined || clientY === undefined) return;
      
      const pipWidth = 96;
      const pipHeight = 128;
      
      const maxX = window.innerWidth - pipWidth - 12;
      const maxY = window.innerHeight - pipHeight - 12; 
      
      let newX = clientX - offsetRef.current.x;
      let newY = clientY - offsetRef.current.y;
      
      newX = Math.max(12, Math.min(maxX, newX));
      newY = Math.max(12, Math.min(maxY, newY));
      
      containerRef.current.style.right = 'auto';
      containerRef.current.style.bottom = 'auto';
      containerRef.current.style.left = `${newX}px`;
      containerRef.current.style.top = `${newY}px`;
      containerRef.current.style.transform = 'none';
    };
    
    const onMouseUp = () => {
      draggingRef.current = false;
    };
    
    const onResize = () => {
       if (window.innerWidth >= 768 && containerRef.current) {
          containerRef.current.style.left = '';
          containerRef.current.style.top = '';
          containerRef.current.style.right = '';
          containerRef.current.style.bottom = '';
       }
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchmove', onMouseMove, { passive: false });
    document.addEventListener('touchend', onMouseUp);
    window.addEventListener('resize', onResize);
    
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchmove', onMouseMove);
      document.removeEventListener('touchend', onMouseUp);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const onMouseDown = (e) => {
    if (window.innerWidth >= 768) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    if (clientX === undefined || clientY === undefined) return;
    if (e.type === 'mousedown' && e.button !== 0) return;
    
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      draggingRef.current = true;
      offsetRef.current = {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    }
  };

  return { containerRef, onMouseDown };
};
