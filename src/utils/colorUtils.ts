import { StateTimeline } from '../types';

export interface ColorResult {
  fill: string;
  stroke: string;
  strokeWidth: string;
  description: string;
}

/**
 * Enhanced color calculation with better visibility and contrast
 */
export class ColorCalculator {
  private stateTimelines: Record<string, StateTimeline>;
  private year: number;
  
  constructor(stateTimelines: Record<string, StateTimeline>, year: number) {
    this.stateTimelines = stateTimelines;
    this.year = year;
  }

  /**
   * Convert RGB to HSL for better color manipulation
   */
  private rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return [h * 360, s * 100, l * 100];
  }

  /**
   * Convert HSL back to RGB
   */
  private hslToRgb(h: number, s: number, l: number): [number, number, number] {
    h /= 360;
    s /= 100;
    l /= 100;
    
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  /**
   * Create a readable color with minimum contrast
   */
  private ensureContrast(baseColor: string, minLightness: number = 30, maxLightness: number = 80): string {
    // Parse hex color
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Convert to HSL
    const [h, s, l] = this.rgbToHsl(r, g, b);
    
    // Ensure lightness is in readable range
    let newL = l;
    if (l < minLightness) newL = minLightness;
    if (l > maxLightness) newL = maxLightness;
    
    // Convert back to RGB
    const [newR, newG, newB] = this.hslToRgb(h, s, newL);
    
    return `rgb(${newR}, ${newG}, ${newB})`;
  }

  /**
   * Create intensity-based color with good visibility
   */
  private createIntensityColor(
    intensity: number,
    baseHue: number,
    type: 'sequential' | 'diverging' = 'sequential'
  ): string {
    // Clamp intensity
    intensity = Math.max(0, Math.min(1, intensity));
    
    if (type === 'sequential') {
      // Sequential: light to dark
      const lightness = 85 - (intensity * 45); // 85% to 40%
      const saturation = 40 + (intensity * 40); // 40% to 80%
      const [r, g, b] = this.hslToRgb(baseHue, saturation, lightness);
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // Diverging: neutral to intense
      const lightness = 70 - (intensity * 30); // 70% to 40%
      const saturation = intensity * 80; // 0% to 80%
      const [r, g, b] = this.hslToRgb(baseHue, saturation, lightness);
      return `rgb(${r}, ${g}, ${b})`;
    }
  }

  /**
   * Get state data with error handling
   */
  private getStateData(stateName: string) {
    const timeline = this.stateTimelines[stateName];
    if (!timeline) {
      console.warn(`No timeline found for ${stateName}`);
      return null;
    }
    
    const data = timeline.timeline.find(entry => entry.year === this.year);
    if (!data) {
      console.warn(`No data found for ${stateName} in ${this.year}`);
      return null;
    }
    
    return data;
  }

  /**
   * Calculate color for standard view (party winners)
   */
  private calculateStandardColor(stateName: string): ColorResult {
    const data = this.getStateData(stateName);
    
    if (!data || !data.exists) {
      return {
        fill: '#F5F5F5',
        stroke: '#CCCCCC',
        strokeWidth: '0.5',
        description: 'Not a state'
      };
    }
    
    if (!data.winner || !data.winnerColor) {
      return {
        fill: '#E0E0E0',
        stroke: '#CCCCCC',
        strokeWidth: '0.5',
        description: 'No winner data'
      };
    }
    
    // Ensure party color has good contrast
    const adjustedColor = this.ensureContrast(data.winnerColor, 25, 75);
    
    return {
      fill: adjustedColor,
      stroke: '#FFFFFF',
      strokeWidth: '0.5',
      description: `${data.winner} victory`
    };
  }

  /**
   * Calculate color for representation view (population per EV)
   */
  private calculateRepresentationColor(stateName: string): ColorResult {
    const data = this.getStateData(stateName);
    
    if (!data || !data.exists || !data.populationPerEV) {
      return {
        fill: '#F0F0F0',
        stroke: '#CCCCCC',
        strokeWidth: '0.5',
        description: 'No representation data'
      };
    }
    
    // Get all valid ratios for normalization
    const allRatios = Object.values(this.stateTimelines)
      .map(st => st.timeline.find(e => e.year === this.year)?.populationPerEV)
      .filter(ratio => ratio && ratio > 0) as number[];
    
    if (allRatios.length === 0) {
      return {
        fill: '#F0F0F0',
        stroke: '#CCCCCC',
        strokeWidth: '0.5',
        description: 'No ratio data available'
      };
    }
    
    const minRatio = Math.min(...allRatios);
    const maxRatio = Math.max(...allRatios);
    
    // Normalize intensity (0 = well represented, 1 = poorly represented)
    const intensity = (data.populationPerEV - minRatio) / (maxRatio - minRatio);
    
    // Use orange-red scale for representation (green is confusing)
    const color = this.createIntensityColor(intensity, 25); // Orange hue
    
    return {
      fill: color,
      stroke: '#FFFFFF',
      strokeWidth: '0.5',
      description: `${Math.round(data.populationPerEV).toLocaleString()} people per EV`
    };
  }

  /**
   * Calculate color for scaled view (electoral vote count)
   */
  private calculateScaledColor(stateName: string): ColorResult {
    const data = this.getStateData(stateName);
    
    if (!data || !data.exists || !data.electoralVotes) {
      return {
        fill: '#F0F0F0',
        stroke: '#CCCCCC',
        strokeWidth: '0.5',
        description: 'No electoral vote data'
      };
    }
    
    // Get all valid EV counts for normalization
    const allEVs = Object.values(this.stateTimelines)
      .map(st => st.timeline.find(e => e.year === this.year)?.electoralVotes)
      .filter(ev => ev && ev > 0) as number[];
    
    if (allEVs.length === 0) {
      return {
        fill: '#F0F0F0',
        stroke: '#CCCCCC',
        strokeWidth: '0.5',
        description: 'No EV data available'
      };
    }
    
    const maxEV = Math.max(...allEVs);
    const intensity = data.electoralVotes / maxEV;
    
    // Use blue scale for electoral votes
    const color = this.createIntensityColor(intensity, 240); // Blue hue
    
    return {
      fill: color,
      stroke: '#FFFFFF',
      strokeWidth: '0.5',
      description: `${data.electoralVotes} electoral votes`
    };
  }

  /**
   * Calculate color for equal representation view
   */
  private calculateEqualColor(stateName: string): ColorResult {
    const data = this.getStateData(stateName);
    
    if (!data || !data.exists || data.evDifference === null || data.evDifference === undefined) {
      return {
        fill: '#F0F0F0',
        stroke: '#CCCCCC',
        strokeWidth: '0.5',
        description: 'No equal representation data'
      };
    }
    
    // Get all valid differences for normalization
    const allDiffs = Object.values(this.stateTimelines)
      .map(st => st.timeline.find(e => e.year === this.year)?.evDifference)
      .filter(diff => diff !== null && diff !== undefined) as number[];
    
    if (allDiffs.length === 0) {
      return {
        fill: '#F0F0F0',
        stroke: '#CCCCCC',
        strokeWidth: '0.5',
        description: 'No difference data available'
      };
    }
    
    const maxAbsDiff = Math.max(...allDiffs.map(Math.abs));
    const intensity = Math.abs(data.evDifference) / maxAbsDiff;
    
    // Diverging color scheme: green for gains, red for losses
    const hue = data.evDifference > 0 ? 120 : 0; // Green or red
    const color = this.createIntensityColor(intensity, hue, 'diverging');
    
    const changeText = data.evDifference > 0 ? `+${data.evDifference}` : `${data.evDifference}`;
    
    return {
      fill: color,
      stroke: '#FFFFFF',
      strokeWidth: '0.5',
      description: `${changeText} EV change`
    };
  }

  /**
   * Calculate color for normalized view
   */
  private calculateNormalizedColor(stateName: string): ColorResult {
    const data = this.getStateData(stateName);
    
    if (!data || !data.exists || !data.population) {
      return {
        fill: '#F0F0F0',
        stroke: '#CCCCCC',
        strokeWidth: '0.5',
        description: 'No population data'
      };
    }
    
    // Get all valid populations for normalization
    const allPops = Object.values(this.stateTimelines)
      .map(st => st.timeline.find(e => e.year === this.year)?.population)
      .filter(pop => pop && pop > 0) as number[];
    
    if (allPops.length === 0) {
      return {
        fill: '#F0F0F0',
        stroke: '#CCCCCC',
        strokeWidth: '0.5',
        description: 'No population data available'
      };
    }
    
    const maxPop = Math.max(...allPops);
    const intensity = data.population / maxPop;
    
    // Use purple scale for population
    const color = this.createIntensityColor(intensity, 270); // Purple hue
    
    return {
      fill: color,
      stroke: '#FFFFFF',
      strokeWidth: '0.5',
      description: `${data.population.toLocaleString()} population`
    };
  }

  /**
   * Main color calculation method
   */
  public calculateColor(stateName: string, viewMode: string): ColorResult {
    console.log(`🎨 Calculating color for ${stateName} in ${viewMode} mode (${this.year})`);
    
    try {
      switch (viewMode) {
        case 'standard':
          return this.calculateStandardColor(stateName);
        case 'representation':
          return this.calculateRepresentationColor(stateName);
        case 'scaled':
          return this.calculateScaledColor(stateName);
        case 'equal':
          return this.calculateEqualColor(stateName);
        case 'normalized':
          return this.calculateNormalizedColor(stateName);
        default:
          console.warn(`Unknown view mode: ${viewMode}`);
          return {
            fill: '#D3D3D3',
            stroke: '#CCCCCC',
            strokeWidth: '0.5',
            description: 'Unknown view mode'
          };
      }
    } catch (error) {
      console.error(`Error calculating color for ${stateName}:`, error);
      return {
        fill: '#FFB6C1',
        stroke: '#FF69B4',
        strokeWidth: '0.5',
        description: 'Color calculation error'
      };
    }
  }
}