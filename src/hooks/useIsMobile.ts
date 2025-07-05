import { useState, useEffect } from 'react';

export function useIsMobile(breakpoint: number = 768) {
  // Check for forced mobile mode via URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const forceMobile = urlParams.get('mobile') === 'true';
  
  const [isMobile, setIsMobile] = useState(forceMobile);

  useEffect(() => {
    // If forced mobile, always return true
    if (forceMobile) {
      setIsMobile(true);
      return;
    }

    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Check on mount
    checkIsMobile();

    // Add resize listener
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, [breakpoint, forceMobile]);

  return isMobile;
}