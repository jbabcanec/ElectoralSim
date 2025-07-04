import React, { useMemo } from 'react';
import clsx from 'clsx';

interface TimelineProps {
  years: number[];
  currentYear: number;
  isPlaying: boolean;
  onYearChange: (year: number) => void;
  onPlayPause: () => void;
}

const Timeline: React.FC<TimelineProps> = ({
  years,
  currentYear,
  isPlaying,
  onYearChange,
  onPlayPause,
}) => {
  const currentIndex = useMemo(() => {
    return years.indexOf(currentYear);
  }, [years, currentYear]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = parseInt(e.target.value);
    onYearChange(years[index]);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onYearChange(years[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < years.length - 1) {
      onYearChange(years[currentIndex + 1]);
    }
  };

  // Key historical events for context
  const historicalEvents: Record<number, string> = {
    1789: 'First presidential election',
    1804: 'First election after 12th Amendment',
    1824: 'First election decided by House',
    1860: 'Last election before Civil War',
    1864: 'Civil War election',
    1876: 'Disputed election (Hayes-Tilden)',
    1912: 'Three-way race (TR splits GOP)',
    1932: 'New Deal coalition begins',
    1964: 'Civil Rights era',
    1968: 'Southern strategy begins',
    2000: 'Bush v. Gore',
    2016: 'Trump era begins',
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        {/* Play/Pause button */}
        <button
          onClick={onPlayPause}
          className="control-button"
          aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
        >
          {isPlaying ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </button>

        {/* Previous button */}
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className={clsx('control-button', {
            'opacity-50 cursor-not-allowed': currentIndex === 0,
          })}
          aria-label="Previous election"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Year display */}
        <div className="text-center min-w-[100px]">
          <div className="text-2xl font-bold text-neutral-900">{currentYear}</div>
          {historicalEvents[currentYear] && (
            <div className="text-xs text-neutral-600">{historicalEvents[currentYear]}</div>
          )}
        </div>

        {/* Next button */}
        <button
          onClick={handleNext}
          disabled={currentIndex === years.length - 1}
          className={clsx('control-button', {
            'opacity-50 cursor-not-allowed': currentIndex === years.length - 1,
          })}
          aria-label="Next election"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Timeline slider */}
        <div className="flex-1">
          <input
            type="range"
            min="0"
            max={years.length - 1}
            value={currentIndex}
            onChange={handleSliderChange}
            className="timeline-slider"
            aria-label="Election year selector"
          />
          <div className="flex justify-between mt-1 text-xs text-neutral-500">
            <span>{years[0]}</span>
            <span>{years[Math.floor(years.length / 2)]}</span>
            <span>{years[years.length - 1]}</span>
          </div>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="text-xs text-neutral-500">
          Use ← → keys
        </div>
      </div>
    </div>
  );
};

export default Timeline;