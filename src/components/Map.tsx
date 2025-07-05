import React, { useEffect, useRef, useState, useCallback } from 'react';
import { StateTimeline, ViewMode } from '../types';
import Tooltip from './Tooltip';
import DataAudit from './DataAudit';
import { ColorCalculator } from '../utils/colorUtils';

// Party colors for split state patterns
const PARTY_COLORS: Record<string, string> = {
  'Republican': '#E81B23',
  'Democratic': '#3333FF',
  'Democratic-Republican': '#008000',
  'Federalist': '#EA9978',
  'Whig': '#F0DC82',
  'National Republican': '#E0CDA9',
  'Progressive': '#FF6347',
  'American Independent': '#808080',
  'States Rights': '#F4C430',
  'Liberal Republican': '#FFD700',
  'Populist': '#ACE1AF',
  'Liberal Republican/Democratic': '#4682B4',
  'None': '#D3D3D3',
  'Did Not Vote': '#808080',
  'Unknown': '#C0C0C0',
};

// State abbreviation mapping for class to full name conversion
const STATE_ABBREV_MAP: Record<string, string> = {
  'al': 'Alabama', 'ak': 'Alaska', 'az': 'Arizona', 'ar': 'Arkansas', 'ca': 'California',
  'co': 'Colorado', 'ct': 'Connecticut', 'de': 'Delaware', 'fl': 'Florida', 'ga': 'Georgia',
  'hi': 'Hawaii', 'id': 'Idaho', 'il': 'Illinois', 'in': 'Indiana', 'ia': 'Iowa',
  'ks': 'Kansas', 'ky': 'Kentucky', 'la': 'Louisiana', 'me': 'Maine', 'md': 'Maryland',
  'ma': 'Massachusetts', 'mi': 'Michigan', 'mn': 'Minnesota', 'ms': 'Mississippi', 'mo': 'Missouri',
  'mt': 'Montana', 'ne': 'Nebraska', 'nv': 'Nevada', 'nh': 'New Hampshire', 'nj': 'New Jersey',
  'nm': 'New Mexico', 'ny': 'New York', 'nc': 'North Carolina', 'nd': 'North Dakota', 'oh': 'Ohio',
  'ok': 'Oklahoma', 'or': 'Oregon', 'pa': 'Pennsylvania', 'ri': 'Rhode Island', 'sc': 'South Carolina',
  'sd': 'South Dakota', 'tn': 'Tennessee', 'tx': 'Texas', 'ut': 'Utah', 'vt': 'Vermont',
  'va': 'Virginia', 'wa': 'Washington', 'wv': 'West Virginia', 'wi': 'Wisconsin', 'wy': 'Wyoming',
  'dc': 'District of Columbia'
};

interface MapProps {
  year: number;
  viewMode: ViewMode;
  hoveredState: string | null;
  selectedState: string | null;
  normalizeToState: string | null;
  stateTimelines: Record<string, StateTimeline>;
  onStateHover: (state: string | null) => void;
  onStateClick: (state: string | null) => void;
  showDataAudit?: boolean;
}

interface MousePosition {
  x: number;
  y: number;
}

const Map: React.FC<MapProps> = ({
  year,
  viewMode,
  hoveredState,
  selectedState,
  stateTimelines,
  onStateHover,
  onStateClick,
  showDataAudit = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [svgElement, setSvgElement] = useState<SVGSVGElement | null>(null);
  const [mousePos, setMousePos] = useState<MousePosition>({ x: 0, y: 0 });
  const [tooltipState, setTooltipState] = useState<string | null>(null);
  
  // Store references to all interactive elements to prevent memory leaks
  const stateElementsRef = useRef<globalThis.Map<string, SVGElement>>(new globalThis.Map());

  // Get state data for a specific year (kept for potential future use)
  // const getStateData = useCallback((stateName: string) => {
  //   const timeline = stateTimelines[stateName];
  //   if (!timeline) return null;
  //   return timeline.timeline.find(entry => entry.year === year) || null;
  // }, [stateTimelines, year]);

  // Use enhanced color calculator
  const colorCalculator = useCallback(() => {
    return new ColorCalculator(stateTimelines, year);
  }, [stateTimelines, year]);
  
  // Check if a state has split electoral votes
  const isStateElectoralSplit = useCallback((stateName: string) => {
    const timeline = stateTimelines[stateName];
    if (!timeline) return false;
    
    const data = timeline.timeline.find(entry => entry.year === year);
    return data && data.isSplitState === true;
  }, [stateTimelines, year]);
  
  const getStateColor = useCallback((stateName: string) => {
    const calculator = colorCalculator();
    return calculator.calculateColor(stateName, viewMode);
  }, [colorCalculator, viewMode]);

  // Create proportional striped pattern for split states and faithless electors
  const createProportionalStripedPattern = useCallback((svg: SVGSVGElement, stateName: string, stateData: any) => {
    const patternId = `stripe-${stateName.replace(/\s+/g, '-').toLowerCase()}-${year}`;
    
    // Check if pattern already exists
    if (svg.querySelector(`#${patternId}`)) {
      return `url(#${patternId})`;
    }
    
    // Get split vote data
    const winnerEV = stateData.winnerEV || 0;
    const runnerUpEV = stateData.runnerUpEV || 0;
    const totalEV = stateData.electoralVotes;
    const othersEV = totalEV - winnerEV - runnerUpEV;
    
    // Check if we need a pattern (split state or faithless electors)
    if (winnerEV === totalEV || (winnerEV === 0 && runnerUpEV === 0)) {
      // No split or all votes to winner - use solid color
      return stateData.winnerColor;
    }
    
    // Calculate proportions based on total electoral votes
    const winnerPercent = winnerEV / totalEV;
    const runnerUpPercent = runnerUpEV / totalEV;
    const othersPercent = othersEV / totalEV;
    
    // Get party colors
    const winnerColor = stateData.winnerColor;
    const runnerUpColor = PARTY_COLORS[stateData.runnerUp] || '#808080';
    const othersColor = '#FCD34D'; // Yellow/amber for faithless electors
    
    // Get or create defs element
    let defs = svg.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      svg.insertBefore(defs, svg.firstChild);
    }
    
    // Create the pattern with proportional stripes
    const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
    pattern.setAttribute('id', patternId);
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');
    pattern.setAttribute('width', '20');
    pattern.setAttribute('height', '20');
    
    let currentX = 0;
    
    // Create winner section
    if (winnerEV > 0) {
      const winnerRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      winnerRect.setAttribute('x', currentX.toString());
      winnerRect.setAttribute('y', '0');
      winnerRect.setAttribute('width', (winnerPercent * 20).toString());
      winnerRect.setAttribute('height', '20');
      winnerRect.setAttribute('fill', winnerColor);
      pattern.appendChild(winnerRect);
      currentX += winnerPercent * 20;
    }
    
    // Create runner-up section
    if (runnerUpEV > 0) {
      const runnerUpRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      runnerUpRect.setAttribute('x', currentX.toString());
      runnerUpRect.setAttribute('y', '0');
      runnerUpRect.setAttribute('width', (runnerUpPercent * 20).toString());
      runnerUpRect.setAttribute('height', '20');
      runnerUpRect.setAttribute('fill', runnerUpColor);
      pattern.appendChild(runnerUpRect);
      currentX += runnerUpPercent * 20;
    }
    
    // Create faithless electors section
    if (othersEV > 0) {
      const othersRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      othersRect.setAttribute('x', currentX.toString());
      othersRect.setAttribute('y', '0');
      othersRect.setAttribute('width', (othersPercent * 20).toString());
      othersRect.setAttribute('height', '20');
      othersRect.setAttribute('fill', othersColor);
      pattern.appendChild(othersRect);
    }
    
    defs.appendChild(pattern);
    
    return `url(#${patternId})`;
  }, [year]);

  // Load SVG with better error handling
  useEffect(() => {
    let mounted = true;
    
    const loadSVG = async () => {
      try {
        console.log('🔍 Loading Blank_USA.svg...');
        
        const response = await fetch('/assets/Blank_USA.svg');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const svgText = await response.text();
        if (!mounted) return;
        
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
        
        if (svgDoc.documentElement.tagName === 'parsererror') {
          throw new Error('SVG parsing failed');
        }
        
        const svg = svgDoc.documentElement;
        if (svg.tagName !== 'svg') {
          throw new Error('Not an SVG element');
        }
        
        const svgElement = svg as unknown as SVGSVGElement;
        svgElement.setAttribute('width', '100%');
        svgElement.setAttribute('height', '100%');
        svgElement.setAttribute('viewBox', '0 0 959 593');
        svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        
        if (mounted) {
          setSvgElement(svgElement);
          setIsLoading(false);
          setError(null);
          console.log('✅ SVG loaded successfully');
        }
      } catch (err) {
        console.error('❌ Error loading SVG:', err);
        if (mounted) {
          setError(`Failed to load map: ${err instanceof Error ? err.message : 'Unknown error'}`);
          setIsLoading(false);
        }
      }
    };

    loadSVG();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Clear all event listeners and reset elements (currently unused but kept for potential future use)
  // const clearInteractions = useCallback(() => {
  //   stateElementsRef.current.forEach((element, stateName) => {
  //     // Clone element to remove all event listeners
  //     const newElement = element.cloneNode(true) as SVGElement;
  //     element.parentNode?.replaceChild(newElement, element);
  //     stateElementsRef.current.set(stateName, newElement);
  //   });
  // }, []);

  // Setup interactions with proper event handling
  useEffect(() => {
    if (!svgElement || !containerRef.current) return;
    
    console.log(`🎨 Setting up map for year ${year}, mode ${viewMode}`);
    
    // Clear container and add fresh SVG
    containerRef.current.innerHTML = '';
    const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
    containerRef.current.appendChild(clonedSvg);
    
    // Clear previous element references
    stateElementsRef.current.clear();
    
    // Find all state elements
    const statePaths = Array.from(clonedSvg.querySelectorAll('path[class]'));
    const dcCircles = Array.from(clonedSvg.querySelectorAll('circle'));
    
    console.log(`Found ${statePaths.length} state paths and ${dcCircles.length} circles`);
    
    // Setup state paths
    statePaths.forEach((pathElement) => {
      const elementClass = pathElement.getAttribute('class') || '';
      const stateAbbrev = elementClass.split(' ').find(cls => STATE_ABBREV_MAP[cls.toLowerCase()]);
      
      if (!stateAbbrev) return;
      
      const stateName = STATE_ABBREV_MAP[stateAbbrev.toLowerCase()];
      if (!stateName) return;
      
      const element = pathElement as SVGPathElement;
      stateElementsRef.current.set(stateName, element);
      
      // Set initial styles using enhanced color calculator
      const colorResult = getStateColor(stateName);
      
      // Use proportional striped pattern for split states or faithless electors
      const timeline = stateTimelines[stateName];
      const stateData = timeline?.timeline.find(entry => entry.year === year);
      
      if (viewMode === 'standard' && stateData) {
        // Check if state has split votes or faithless electors
        const hasSpecialVoting = stateData.isSplitState || 
          (stateData.winnerEV !== null && stateData.winnerEV !== undefined && 
           stateData.runnerUpEV !== null && stateData.runnerUpEV !== undefined && 
           (stateData.winnerEV + stateData.runnerUpEV) !== stateData.electoralVotes);
        
        if (hasSpecialVoting) {
          element.style.fill = createProportionalStripedPattern(clonedSvg, stateName, stateData);
        } else {
          element.style.fill = colorResult.fill;
        }
      } else {
        element.style.fill = colorResult.fill;
      }
      
      element.style.stroke = colorResult.stroke;
      element.style.strokeWidth = colorResult.strokeWidth;
      element.style.cursor = 'pointer';
      element.style.transition = 'all 0.2s ease';
      
      // Mouse events with proper cleanup
      const handleMouseEnter = (e: MouseEvent) => {
        setMousePos({ x: e.clientX, y: e.clientY });
        setTooltipState(stateName);
        onStateHover(stateName);
        
        element.style.strokeWidth = '2';
        element.style.stroke = '#333333';
      };
      
      const handleMouseMove = (e: MouseEvent) => {
        setMousePos({ x: e.clientX, y: e.clientY });
      };
      
      const handleMouseLeave = () => {
        setTooltipState(null);
        onStateHover(null);
        
        element.style.strokeWidth = selectedState === stateName ? '2' : '0.5';
        element.style.stroke = selectedState === stateName ? '#000000' : '#FFFFFF';
      };
      
      const handleClick = (e: MouseEvent) => {
        e.stopPropagation();
        onStateClick(selectedState === stateName ? null : stateName);
      };
      
      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mousemove', handleMouseMove);
      element.addEventListener('mouseleave', handleMouseLeave);
      element.addEventListener('click', handleClick);
    });
    
    // Setup DC circles
    dcCircles.forEach((circleElement) => {
      const elementClass = circleElement.getAttribute('class') || '';
      
      if (!elementClass.includes('dc') && !elementClass.includes('dccircle')) return;
      
      const stateName = 'District of Columbia';
      const element = circleElement as SVGCircleElement;
      stateElementsRef.current.set(stateName, element);
      
      // Set initial styles using enhanced color calculator
      const colorResult = getStateColor(stateName);
      
      // Use proportional striped pattern for split states (DC shouldn't split, but keeping consistent)
      if (isStateElectoralSplit(stateName) && viewMode === 'standard') {
        const timeline = stateTimelines[stateName];
        const stateData = timeline?.timeline.find(entry => entry.year === year);
        if (stateData) {
          element.style.fill = createProportionalStripedPattern(clonedSvg, stateName, stateData);
        } else {
          element.style.fill = colorResult.fill;
        }
      } else {
        element.style.fill = colorResult.fill;
      }
      
      element.style.stroke = colorResult.stroke;
      element.style.strokeWidth = colorResult.strokeWidth;
      element.style.cursor = 'pointer';
      element.style.display = 'block';
      element.style.transition = 'all 0.2s ease';
      
      // Mouse events
      const handleMouseEnter = (e: MouseEvent) => {
        setMousePos({ x: e.clientX, y: e.clientY });
        setTooltipState(stateName);
        onStateHover(stateName);
        
        element.style.strokeWidth = '2';
        element.style.stroke = '#333333';
      };
      
      const handleMouseMove = (e: MouseEvent) => {
        setMousePos({ x: e.clientX, y: e.clientY });
      };
      
      const handleMouseLeave = () => {
        setTooltipState(null);
        onStateHover(null);
        
        element.style.strokeWidth = selectedState === stateName ? '2' : '0.5';
        element.style.stroke = selectedState === stateName ? '#000000' : '#FFFFFF';
      };
      
      const handleClick = (e: MouseEvent) => {
        e.stopPropagation();
        onStateClick(selectedState === stateName ? null : stateName);
      };
      
      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mousemove', handleMouseMove);
      element.addEventListener('mouseleave', handleMouseLeave);
      element.addEventListener('click', handleClick);
    });
    
    // Cleanup function
    return () => {
      // Event listeners are automatically removed when elements are replaced
    };
  }, [svgElement, year, viewMode, getStateColor, onStateHover, onStateClick, selectedState]);

  // Update visual states when selection/hover changes
  useEffect(() => {
    stateElementsRef.current.forEach((element: SVGElement, stateName: string) => {
      // Reset opacity
      element.style.opacity = '1';
      
      // Handle selection highlighting
      if (selectedState === stateName) {
        element.style.strokeWidth = '2';
        element.style.stroke = '#000000';
      } else if (tooltipState !== stateName) {
        element.style.strokeWidth = '0.5';
        element.style.stroke = '#FFFFFF';
      }
      
      // Handle hover dimming
      if (hoveredState && hoveredState !== stateName) {
        element.style.opacity = '0.6';
      }
    });
  }, [selectedState, hoveredState, tooltipState]);

  if (isLoading) {
    return (
      <div className="w-full h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600">Loading interactive map...</div>
          <div className="text-xs text-gray-500 mt-2">Year: {year} | Mode: {viewMode}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full bg-red-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <div className="text-lg font-semibold mb-2">Map Error</div>
          <div className="text-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white relative">
      {showDataAudit && (
        <div className="absolute top-4 left-4 z-10 max-w-sm">
          <DataAudit
            stateTimelines={stateTimelines}
            year={year}
            viewMode={viewMode}
          />
        </div>
      )}
      
      <div 
        ref={containerRef} 
        className="w-full h-full flex items-center justify-center"
        style={{ minHeight: '400px' }}
      />
      
      <Tooltip
        stateName={tooltipState || ''}
        year={year}
        viewMode={viewMode}
        stateTimelines={stateTimelines}
        mouseX={mousePos.x}
        mouseY={mousePos.y}
        visible={!!tooltipState}
      />
    </div>
  );
};

export default Map;