import { useState, useEffect, useCallback } from 'react';
import MapMobile from './components/MapMobile';
import Timeline from './components/Timeline';
import Controls from './components/Controls';
import InfoPanel from './components/InfoPanel';
import { MapState, StateTimeline, YearSummary, Config } from './types';
import { loadData } from './utils/dataLoader';

function AppMobile() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'info' | 'timeline'>('map');
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [panelHeight, setPanelHeight] = useState(40); // percentage of screen height
  
  // Data
  const [stateTimelines, setStateTimelines] = useState<Record<string, StateTimeline>>({});
  const [yearSummaries, setYearSummaries] = useState<Record<number, YearSummary>>({});
  const [config, setConfig] = useState<Config | null>(null);
  
  // Map state
  const [mapState, setMapState] = useState<MapState>({
    year: 2024,
    viewMode: 'standard',
    selectedState: null,
    hoveredState: null,
    normalizeToState: null,
    isPlaying: false,
  });

  // Load data on mount
  useEffect(() => {
    loadData()
      .then(({ stateTimelines, yearSummaries, config }) => {
        setStateTimelines(stateTimelines);
        setYearSummaries(yearSummaries);
        setConfig(config);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  // Animation effect
  useEffect(() => {
    if (!mapState.isPlaying || !config) return;

    const interval = setInterval(() => {
      setMapState(prev => {
        const currentIndex = config.years.indexOf(prev.year);
        const nextIndex = (currentIndex + 1) % config.years.length;
        return { ...prev, year: config.years[nextIndex] };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [mapState.isPlaying, config]);

  // Event handlers
  const handleYearChange = useCallback((year: number) => {
    setMapState(prev => ({ ...prev, year }));
  }, []);

  const handleViewModeChange = useCallback((viewMode: MapState['viewMode']) => {
    setMapState(prev => ({ ...prev, viewMode }));
  }, []);

  const handleStateHover = useCallback((state: string | null) => {
    setMapState(prev => ({ ...prev, hoveredState: state }));
  }, []);

  const handleStateClick = useCallback((state: string | null) => {
    setMapState(prev => ({ ...prev, selectedState: state }));
    if (state) {
      setActiveTab('info');
      setIsPanelExpanded(true);
      setPanelHeight(50); // Open to medium height for info
    }
  }, []);

  const handleNormalizeToState = useCallback((state: string | null) => {
    setMapState(prev => ({ 
      ...prev, 
      normalizeToState: state,
      viewMode: state ? 'normalized' : 'standard'
    }));
  }, []);

  const handlePlayPause = useCallback(() => {
    setMapState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading electoral data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-600 px-4">
          <p className="text-xl font-semibold mb-2">Error loading data</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const currentYearSummary = yearSummaries[mapState.year];

  return (
    <div className="h-screen flex flex-col bg-neutral-50 relative">
      {/* Map Container - Full Screen */}
      <div className="mobile-map-container">
        <MapMobile
          year={mapState.year}
          viewMode={mapState.viewMode}
          hoveredState={mapState.hoveredState}
          selectedState={mapState.selectedState}
          normalizeToState={mapState.normalizeToState}
          stateTimelines={stateTimelines}
          onStateHover={handleStateHover}
          onStateClick={handleStateClick}
        />
      </div>

      {/* Year Display Overlay */}
      <div className="fixed top-4 left-4 bg-white rounded-lg shadow-lg px-4 py-2 z-30">
        <div className="text-2xl font-bold">{mapState.year}</div>
        <div className="text-sm text-neutral-600">
          {currentYearSummary?.totalElectoralVotes || 0} Total EVs
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="fixed top-4 right-4 z-30">
        <select
          value={mapState.viewMode}
          onChange={(e) => handleViewModeChange(e.target.value as MapState['viewMode'])}
          className="px-3 py-2 bg-white rounded-lg shadow-lg border border-neutral-200 text-sm"
        >
          <option value="standard">Electoral Map</option>
          <option value="representation">Representation</option>
          <option value="equal">Equal States</option>
        </select>
      </div>

      {/* Bottom Panel */}
      <div 
        className="mobile-panel"
        style={{
          height: isPanelExpanded ? `${panelHeight}vh` : '60px',
          transform: 'translateY(0)',
        }}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <div 
            className="flex items-center justify-center cursor-pointer flex-1"
            onTouchStart={(e) => {
              const startY = e.touches[0].clientY;
              const startHeight = panelHeight;
              
              const handleTouchMove = (e: TouchEvent) => {
                const currentY = e.touches[0].clientY;
                const deltaY = startY - currentY;
                const viewportHeight = window.innerHeight;
                const deltaPercent = (deltaY / viewportHeight) * 100;
                const newHeight = Math.max(15, Math.min(80, startHeight + deltaPercent));
                setPanelHeight(newHeight);
                
                // Auto-expand if dragging up
                if (newHeight > 20 && !isPanelExpanded) {
                  setIsPanelExpanded(true);
                }
              };
              
              const handleTouchEnd = () => {
                document.removeEventListener('touchmove', handleTouchMove);
                document.removeEventListener('touchend', handleTouchEnd);
                
                // Auto-collapse if very small
                if (panelHeight < 25) {
                  setIsPanelExpanded(false);
                  setPanelHeight(40);
                }
              };
              
              document.addEventListener('touchmove', handleTouchMove);
              document.addEventListener('touchend', handleTouchEnd);
            }}
          >
            <div className="w-12 h-1 bg-neutral-300 rounded-full"></div>
          </div>
          
          {/* Close button */}
          <button
            onClick={() => {
              setIsPanelExpanded(false);
              setMapState(prev => ({ ...prev, selectedState: null }));
            }}
            className="p-1 text-neutral-500 hover:text-neutral-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-20">
          {activeTab === 'map' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Electoral Map Controls</h3>
              <Controls
                viewMode={mapState.viewMode}
                onViewModeChange={handleViewModeChange}
                normalizeToState={mapState.normalizeToState}
                onNormalizeToState={handleNormalizeToState}
                states={config?.states || []}
                yearSummary={currentYearSummary}
                year={mapState.year}
                stateTimelines={stateTimelines}
              />
            </div>
          )}

          {activeTab === 'info' && (
            <InfoPanel
              year={mapState.year}
              selectedState={mapState.selectedState}
              hoveredState={mapState.hoveredState}
              stateTimelines={stateTimelines}
              yearSummary={currentYearSummary}
            />
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Timeline</h3>
              <Timeline
                currentYear={mapState.year}
                years={config?.years || []}
                isPlaying={mapState.isPlaying}
                onYearChange={handleYearChange}
                onPlayPause={handlePlayPause}
              />
              <div className="mt-4">
                <p className="text-sm text-neutral-600">
                  Swipe or use the timeline to explore different election years
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Tab Bar */}
      <div className="mobile-tab-bar">
        <button
          className={`mobile-tab ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('map');
            if (!isPanelExpanded) {
              setIsPanelExpanded(true);
              setPanelHeight(40);
            }
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span>Controls</span>
        </button>
        
        <button
          className={`mobile-tab ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('info');
            if (!isPanelExpanded) {
              setIsPanelExpanded(true);
              setPanelHeight(50);
            }
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Info</span>
        </button>
        
        <button
          className={`mobile-tab ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('timeline');
            if (!isPanelExpanded) {
              setIsPanelExpanded(true);
              setPanelHeight(45);
            }
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Timeline</span>
        </button>
      </div>
    </div>
  );
}

export default AppMobile;