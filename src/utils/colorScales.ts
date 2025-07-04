import * as d3 from 'd3';

// Party colors from our data
export const PARTY_COLORS: Record<string, string> = {
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

// Color scale for representation ratio
// Green = overrepresented, Red = underrepresented
export const representationScale = d3.scaleSequential()
  .domain([0.5, 1.5]) // 0.5x to 1.5x representation
  .interpolator(d3.interpolateRdYlGn);

// Color scale for population per EV
// Blue = fewer people per EV (more power), Red = more people per EV (less power)
export const populationPerEVScale = d3.scaleSequential()
  .domain([200000, 800000])
  .interpolator(d3.interpolateRdBu)
  .clamp(true);

// Scale for electoral vote sizes
export const electoralVoteScale = d3.scaleSqrt()
  .domain([3, 55]) // Min and max electoral votes
  .range([20, 100]); // Size range in pixels

// Color for non-existent states
export const NON_EXISTENT_COLOR = '#F0F0F0';
export const NON_EXISTENT_BORDER = '#D0D0D0';

// Get state color based on view mode
export function getStateColor(
  viewMode: string,
  data: any,
  normalizeValue?: number
): string {
  if (!data || !data.exists) {
    return NON_EXISTENT_COLOR;
  }

  switch (viewMode) {
    case 'standard':
      return data.winnerColor || PARTY_COLORS[data.winner] || '#D3D3D3';
    
    case 'representation':
      if (!data.representationRatio) return '#D3D3D3';
      return representationScale(data.representationRatio);
    
    case 'scaled':
      return data.winnerColor || PARTY_COLORS[data.winner] || '#D3D3D3';
    
    case 'equal':
      if (!data.evDifference) return '#D3D3D3';
      // Green for gains, red for losses
      const diffScale = d3.scaleSequential()
        .domain([-5, 5])
        .interpolator(d3.interpolateRdYlGn)
        .clamp(true);
      return diffScale(data.evDifference);
    
    case 'normalized':
      if (!data.populationPerEV || !normalizeValue) return '#D3D3D3';
      const ratio = normalizeValue / data.populationPerEV;
      return representationScale(ratio);
    
    default:
      return '#D3D3D3';
  }
}

// Get state opacity based on various factors
export function getStateOpacity(
  data: any,
  isHovered: boolean,
  isSelected: boolean
): number {
  if (!data || !data.exists) {
    return 0.3;
  }
  
  if (isHovered) {
    return 1.0;
  }
  
  if (isSelected) {
    return 0.9;
  }
  
  return 0.8;
}

// Get stroke width for state borders
export function getStateStrokeWidth(
  isHovered: boolean,
  isSelected: boolean
): number {
  if (isHovered) return 3;
  if (isSelected) return 2;
  return 1;
}

// Get stroke color for state borders
export function getStateStrokeColor(
  data: any,
  isHovered: boolean,
  isSelected: boolean
): string {
  if (!data || !data.exists) {
    return NON_EXISTENT_BORDER;
  }
  
  if (isHovered) return '#000000';
  if (isSelected) return '#333333';
  return '#666666';
}

// Create legend data for different view modes
export function getLegendData(viewMode: string): any[] {
  switch (viewMode) {
    case 'standard':
      return Object.entries(PARTY_COLORS)
        .filter(([party]) => !['Unknown', 'Did Not Vote'].includes(party))
        .map(([party, color]) => ({ label: party, color }));
    
    case 'representation':
      return [
        { label: 'Overrepresented (0.5x)', color: representationScale(0.5) },
        { label: 'Equal (1.0x)', color: representationScale(1.0) },
        { label: 'Underrepresented (1.5x)', color: representationScale(1.5) },
      ];
    
    case 'equal':
      const diffScale = d3.scaleSequential()
        .domain([-5, 5])
        .interpolator(d3.interpolateRdYlGn)
        .clamp(true);
      return [
        { label: 'Would lose 5+ EVs', color: diffScale(-5) },
        { label: 'No change', color: diffScale(0) },
        { label: 'Would gain 5+ EVs', color: diffScale(5) },
      ];
    
    default:
      return [];
  }
}