import React, { useEffect, useRef, useState } from 'react';
import { StateTimeline, ViewMode } from '../types';
import Map from './Map';

interface MapMobileProps {
  year: number;
  viewMode: ViewMode;
  hoveredState: string | null;
  selectedState: string | null;
  normalizeToState: string | null;
  stateTimelines: Record<string, StateTimeline>;
  onStateHover: (state: string | null) => void;
  onStateClick: (state: string | null) => void;
}

const MapMobile: React.FC<MapMobileProps> = (props) => {
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isPinching = false;
    let initialDistance = 0;
    let initialScale = 1;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        isPinching = true;
        initialScale = scale;
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        initialDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isPinching && e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        const newScale = Math.max(0.5, Math.min(3, initialScale * (currentDistance / initialDistance)));
        setScale(newScale);
      }
    };

    const handleTouchEnd = () => {
      isPinching = false;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [scale]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full overflow-hidden relative"
      style={{
        touchAction: 'none',
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          transition: 'transform 0.1s',
        }}
      >
        <Map {...props} />
      </div>
    </div>
  );
};

export default MapMobile;