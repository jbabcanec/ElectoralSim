import { useState, useEffect, useCallback } from 'react';
import Map from './components/Map';
import Timeline from './components/Timeline';
import Controls from './components/Controls';
import InfoPanel from './components/InfoPanel';
import RightPanel from './components/RightPanel';
import { MapState, StateTimeline, YearSummary, Config } from './types';
import { loadData } from './utils/dataLoader';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data
  const [stateTimelines, setStateTimelines] = useState<Record<string, StateTimeline>>({});
  const [yearSummaries, setYearSummaries] = useState<Record<number, YearSummary>>({});
  const [config, setConfig] = useState<Config | null>(null);
  
  // Map state
  const [mapState, setMapState] = useState<MapState>({
    year: 2020,
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
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold mb-2">Error loading data</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const currentYearSummary = yearSummaries[mapState.year];

  return (
    <div className="h-screen flex flex-col bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-neutral-900">
            Electoral Representation Visualizer
          </h1>
          <p className="text-sm text-neutral-600 mt-1">
            Exploring the relationship between population and electoral votes (1789-2024)
          </p>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-80 bg-white border-r border-neutral-200 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Controls */}
            <Controls
              viewMode={mapState.viewMode}
              onViewModeChange={handleViewModeChange}
              normalizeToState={mapState.normalizeToState}
              onNormalizeToState={handleNormalizeToState}
              states={config?.states || []}
              yearSummary={currentYearSummary}
              year={mapState.year}
            />

            {/* Info Panel */}
            <InfoPanel
              hoveredState={mapState.hoveredState}
              selectedState={mapState.selectedState}
              year={mapState.year}
              stateTimelines={stateTimelines}
              yearSummary={currentYearSummary}
            />
          </div>
        </aside>

        {/* Map container */}
        <main className="flex-1 relative">
          <Map
            year={mapState.year}
            viewMode={mapState.viewMode}
            hoveredState={mapState.hoveredState}
            selectedState={mapState.selectedState}
            normalizeToState={mapState.normalizeToState}
            stateTimelines={stateTimelines}
            onStateHover={handleStateHover}
            onStateClick={handleStateClick}
            showDataAudit={false}
          />
        </main>

        {/* Right Panel - What-If Analysis */}
        <RightPanel
          stateTimelines={stateTimelines}
          year={mapState.year}
          viewMode={mapState.viewMode}
          normalizeToState={mapState.normalizeToState}
          selectedState={mapState.selectedState}
          yearSummary={currentYearSummary}
        />
      </div>

      {/* Timeline */}
      <footer className="bg-white border-t border-neutral-200 px-6 py-4">
        <Timeline
          years={config?.years || []}
          currentYear={mapState.year}
          isPlaying={mapState.isPlaying}
          onYearChange={handleYearChange}
          onPlayPause={handlePlayPause}
        />
      </footer>
    </div>
  );
}

export default App;