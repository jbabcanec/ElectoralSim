import { StateTimeline, YearData } from '../types';

/**
 * Calculate electoral votes for all states based on a reference state's ratio
 */
export function calculateNormalizedElectoralVotes(
  stateTimelines: Record<string, StateTimeline>,
  year: number,
  referenceState: string
): Record<string, number> {
  const normalized: Record<string, number> = {};
  
  // Get reference state data
  const refStateData = getStateDataForYear(stateTimelines, referenceState, year);
  if (!refStateData || !refStateData.populationPerEV || !refStateData.population) {
    return normalized;
  }
  
  const referenceRatio = refStateData.populationPerEV;
  
  // Calculate for all states
  Object.entries(stateTimelines).forEach(([state, _timeline]) => {
    const stateData = getStateDataForYear(stateTimelines, state, year);
    if (stateData && stateData.population) {
      // Use reference state's population per EV ratio
      normalized[state] = Math.round(stateData.population / referenceRatio);
    }
  });
  
  return normalized;
}

/**
 * Get state data for a specific year
 */
export function getStateDataForYear(
  stateTimelines: Record<string, StateTimeline>,
  state: string,
  year: number
): YearData | null {
  const timeline = stateTimelines[state];
  if (!timeline) return null;
  
  const yearData = timeline.timeline.find(d => d.year === year);
  return yearData || null;
}

/**
 * Calculate total electoral votes for a given year
 */
export function getTotalElectoralVotes(
  stateTimelines: Record<string, StateTimeline>,
  year: number
): number {
  let total = 0;
  
  Object.values(stateTimelines).forEach(timeline => {
    const yearData = timeline.timeline.find(d => d.year === year);
    if (yearData && yearData.electoralVotes) {
      total += yearData.electoralVotes;
    }
  });
  
  return total;
}

/**
 * Get winner for a specific year based on electoral votes
 */
export function getElectionWinner(
  stateTimelines: Record<string, StateTimeline>,
  year: number
): { party: string; votes: number } | null {
  const partyVotes: Record<string, number> = {};
  
  Object.values(stateTimelines).forEach(timeline => {
    const yearData = timeline.timeline.find(d => d.year === year);
    if (yearData && yearData.winner && yearData.electoralVotes > 0) {
      partyVotes[yearData.winner] = (partyVotes[yearData.winner] || 0) + yearData.electoralVotes;
    }
  });
  
  let winner = null;
  let maxVotes = 0;
  
  Object.entries(partyVotes).forEach(([party, votes]) => {
    if (votes > maxVotes) {
      winner = party;
      maxVotes = votes;
    }
  });
  
  return winner ? { party: winner, votes: maxVotes } : null;
}

/**
 * Calculate statistics for representation disparities
 */
export function calculateRepresentationStats(
  stateTimelines: Record<string, StateTimeline>,
  year: number
): {
  giniCoefficient: number;
  standardDeviation: number;
  range: { min: number; max: number };
} | null {
  const popPerEVs: number[] = [];
  
  Object.values(stateTimelines).forEach(timeline => {
    const yearData = timeline.timeline.find(d => d.year === year);
    if (yearData && yearData.populationPerEV) {
      popPerEVs.push(yearData.populationPerEV);
    }
  });
  
  if (popPerEVs.length === 0) return null;
  
  // Sort for Gini calculation
  popPerEVs.sort((a, b) => a - b);
  
  // Calculate Gini coefficient
  let sumOfDifferences = 0;
  let sumOfValues = 0;
  
  for (let i = 0; i < popPerEVs.length; i++) {
    sumOfValues += popPerEVs[i];
    for (let j = 0; j < popPerEVs.length; j++) {
      sumOfDifferences += Math.abs(popPerEVs[i] - popPerEVs[j]);
    }
  }
  
  const giniCoefficient = sumOfDifferences / (2 * popPerEVs.length * sumOfValues);
  
  // Calculate standard deviation
  const mean = sumOfValues / popPerEVs.length;
  const squaredDifferences = popPerEVs.map(x => Math.pow(x - mean, 2));
  const variance = squaredDifferences.reduce((a, b) => a + b, 0) / popPerEVs.length;
  const standardDeviation = Math.sqrt(variance);
  
  return {
    giniCoefficient,
    standardDeviation,
    range: {
      min: Math.min(...popPerEVs),
      max: Math.max(...popPerEVs),
    },
  };
}

/**
 * Format large numbers with commas
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return 'N/A';
  return num.toLocaleString('en-US');
}

/**
 * Format population per EV with appropriate units
 */
export function formatPopulationPerEV(num: number | null | undefined): string {
  if (num === null || num === undefined) return 'N/A';
  
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}K`;
  }
  
  return formatNumber(num);
}

/**
 * Get color intensity based on value within range
 */
export function getIntensity(value: number, min: number, max: number): number {
  if (max === min) return 0.5;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}