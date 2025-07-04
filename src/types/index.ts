// Type definitions for the Electoral Visualizer

export interface StateData {
  name: string;
  abbreviation: string;
  admissionYear: number;
  firstElection: number;
}

export interface YearData {
  year: number;
  electoralVotes: number;
  population: number | null;
  populationPerEV: number | null;
  representationRatio: number | null;
  hypotheticalEVs: number | null;
  evDifference: number | null;
  winner: string | null;
  runnerUp: string | null;
  winnerColor: string;
  exists: boolean;
  isSplitState?: boolean;
  winnerCandidate?: string | null;
  runnerUpCandidate?: string | null;
  winnerEV?: number | null;
  runnerUpEV?: number | null;
}

export interface StateTimeline {
  name: string;
  timeline: YearData[];
}

export interface YearSummary {
  year: number;
  totalStates: number;
  totalElectoralVotes: number;
  totalPopulation: number | null;
  averagePopPerEV: number | null;
  minPopPerEV: {
    state: string | null;
    value: number | null;
  };
  maxPopPerEV: {
    state: string | null;
    value: number | null;
  };
  parties: {
    winner: Record<string, number>;
    runnerUp: Record<string, number>;
  };
}

export type ViewMode = 
  | 'standard'           // Traditional electoral map
  | 'representation'     // Color by population per EV
  | 'scaled'            // Size by electoral votes
  | 'equal'             // Hypothetical equal representation
  | 'normalized';       // Normalized to selected state

export interface MapState {
  year: number;
  viewMode: ViewMode;
  selectedState: string | null;
  hoveredState: string | null;
  normalizeToState: string | null;
  isPlaying: boolean;
}

export interface TooltipData {
  state: string;
  year: number;
  electoralVotes: number;
  population: number | null;
  populationPerEV: number | null;
  representationRatio: number | null;
  winner: string | null;
  runnerUp: string | null;
  hypotheticalEVs: number | null;
  evDifference: number | null;
}

export interface ColorScale {
  domain: [number, number];
  range: string[];
  type: 'linear' | 'sequential' | 'diverging';
}

export interface Config {
  years: number[];
  states: string[];
  partyColors: Record<string, string>;
  metadata: Record<string, StateData>;
}