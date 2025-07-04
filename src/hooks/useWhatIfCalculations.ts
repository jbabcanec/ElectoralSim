import { useMemo } from 'react';
import { StateTimeline, ViewMode } from '../types';

interface WhatIfResult {
  originalWinner: string | null;
  newWinner: string | null;
  outcomeChanged: boolean;
  electoralVoteChanges: Record<string, {
    original: number;
    new: number;
    difference: number;
  }>;
  totalElectoralVotes: {
    original: number;
    new: number;
  };
}

export const useWhatIfCalculations = (
  stateTimelines: Record<string, StateTimeline>,
  year: number,
  viewMode: ViewMode,
  normalizeToState: string | null
): WhatIfResult => {
  return useMemo(() => {
    const result: WhatIfResult = {
      originalWinner: null,
      newWinner: null,
      outcomeChanged: false,
      electoralVoteChanges: {},
      totalElectoralVotes: {
        original: 0,
        new: 0
      }
    };

    // Get all states that existed in the given year
    const statesInYear = Object.entries(stateTimelines)
      .map(([stateName, timeline]) => {
        const yearData = timeline.timeline.find(entry => entry.year === year);
        return yearData?.exists ? { name: stateName, data: yearData } : null;
      })
      .filter(Boolean) as Array<{ name: string; data: any }>;

    if (statesInYear.length === 0) return result;

    // Calculate original electoral votes and determine winner
    const originalPartyTotals: Record<string, number> = {};
    let originalTotalEVs = 0;

    statesInYear.forEach(({ data }) => {
      if (data.winner && data.electoralVotes) {
        originalPartyTotals[data.winner] = (originalPartyTotals[data.winner] || 0) + data.electoralVotes;
        originalTotalEVs += data.electoralVotes;
      }
    });

    // Find original winner (candidate with most EVs)
    const firstParty = Object.keys(originalPartyTotals)[0];
    result.originalWinner = firstParty ? Object.entries(originalPartyTotals)
      .reduce((winner, [party, votes]) => 
        votes > (originalPartyTotals[winner] || 0) ? party : winner, 
        firstParty
      ) : null;

    result.totalElectoralVotes.original = originalTotalEVs;

    // Calculate what-if scenario based on view mode
    if (viewMode === 'equal') {
      // Equal representation: redistribute EVs based on population
      const totalPopulation = statesInYear.reduce((sum, { data }) => 
        sum + (data.population || 0), 0);
      
      if (totalPopulation > 0) {
        const newPartyTotals: Record<string, number> = {};
        let newTotalEVs = 0;

        statesInYear.forEach(({ name, data }) => {
          if (data.winner && data.population && data.hypotheticalEVs) {
            const newEVs = data.hypotheticalEVs;
            result.electoralVoteChanges[name] = {
              original: data.electoralVotes,
              new: newEVs,
              difference: newEVs - data.electoralVotes
            };
            
            newPartyTotals[data.winner] = (newPartyTotals[data.winner] || 0) + newEVs;
            newTotalEVs += newEVs;
          }
        });

        const firstNewParty = Object.keys(newPartyTotals)[0];
        result.newWinner = firstNewParty ? Object.entries(newPartyTotals)
          .reduce((winner, [party, votes]) => 
            votes > (newPartyTotals[winner] || 0) ? party : winner, 
            firstNewParty
          ) : null;

        result.totalElectoralVotes.new = newTotalEVs;
      }
    } else if (viewMode === 'normalized' && normalizeToState) {
      // Normalized representation: use selected state's pop/EV ratio for all states
      const normalizeData = statesInYear.find(({ name }) => name === normalizeToState)?.data;
      
      if (normalizeData?.populationPerEV) {
        const targetRatio = normalizeData.populationPerEV;
        const newPartyTotals: Record<string, number> = {};
        let newTotalEVs = 0;

        statesInYear.forEach(({ name, data }) => {
          if (data.winner && data.population) {
            const newEVs = Math.round(data.population / targetRatio);
            result.electoralVoteChanges[name] = {
              original: data.electoralVotes,
              new: newEVs,
              difference: newEVs - data.electoralVotes
            };
            
            newPartyTotals[data.winner] = (newPartyTotals[data.winner] || 0) + newEVs;
            newTotalEVs += newEVs;
          }
        });

        const firstNewParty = Object.keys(newPartyTotals)[0];
        result.newWinner = firstNewParty ? Object.entries(newPartyTotals)
          .reduce((winner, [party, votes]) => 
            votes > (newPartyTotals[winner] || 0) ? party : winner, 
            firstNewParty
          ) : null;

        result.totalElectoralVotes.new = newTotalEVs;
      }
    } else {
      // For other view modes, no changes
      result.newWinner = result.originalWinner;
      result.totalElectoralVotes.new = originalTotalEVs;
      
      statesInYear.forEach(({ name, data }) => {
        result.electoralVoteChanges[name] = {
          original: data.electoralVotes,
          new: data.electoralVotes,
          difference: 0
        };
      });
    }

    result.outcomeChanged = result.originalWinner !== result.newWinner;

    return result;
  }, [stateTimelines, year, viewMode, normalizeToState]);
};