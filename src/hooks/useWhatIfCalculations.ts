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
  winnerElectoralVotes: {
    original: number;
    new: number;
  };
  runnerUpElectoralVotes: {
    original: number;
    new: number;
  };
  originalPartyTotals: Record<string, number>;
  newPartyTotals: Record<string, number>;
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
      },
      winnerElectoralVotes: {
        original: 0,
        new: 0
      },
      runnerUpElectoralVotes: {
        original: 0,
        new: 0
      },
      originalPartyTotals: {},
      newPartyTotals: {}
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
    // Find original winner and runner-up
    const sortedOriginalParties = Object.entries(originalPartyTotals)
      .sort(([,a], [,b]) => b - a);
    
    result.originalWinner = sortedOriginalParties.length > 0 ? sortedOriginalParties[0][0] : null;
    result.winnerElectoralVotes.original = sortedOriginalParties.length > 0 ? sortedOriginalParties[0][1] : 0;
    result.runnerUpElectoralVotes.original = sortedOriginalParties.length > 1 ? sortedOriginalParties[1][1] : 0;
    result.originalPartyTotals = originalPartyTotals;
    result.totalElectoralVotes.original = originalTotalEVs;

    // Calculate what-if scenario based on view mode
    if (viewMode === 'equal') {
      // Equal representation: preserve total EV count but distribute based on population
      const totalPopulation = statesInYear.reduce((sum, { data }) => 
        sum + (data.population || 0), 0);
      
      if (totalPopulation > 0 && originalTotalEVs > 0) {
        // Calculate national average population per electoral vote
        const avgPopPerEV = totalPopulation / originalTotalEVs;
        
        const newPartyTotals: Record<string, number> = {};
        let newTotalEVs = 0;
        const unroundedEVs: Array<{ name: string, data: any, exactEVs: number }> = [];

        // First pass: calculate exact EVs for each state
        statesInYear.forEach(({ name, data }) => {
          if (data.winner && data.population) {
            const exactEVs = data.population / avgPopPerEV;
            unroundedEVs.push({ name, data, exactEVs });
          }
        });

        // Use the Largest Remainder Method to allocate EVs fairly
        const roundedEVs = new Map<string, number>();
        let totalAllocated = 0;
        
        // First allocation: give each state the floor of their exact EVs, minimum 1
        const remainders: Array<{ name: string, remainder: number, data: any }> = [];
        
        unroundedEVs.forEach(({ name, data, exactEVs }) => {
          const floorEVs = Math.max(1, Math.floor(exactEVs)); // Ensure minimum 1 EV
          roundedEVs.set(name, floorEVs);
          totalAllocated += floorEVs;
          
          // Calculate remainder for states that got more than 1 EV (can be adjusted)
          const remainder = exactEVs > 1 ? exactEVs - Math.floor(exactEVs) : 0;
          remainders.push({ name, remainder, data });
        });

        // Distribute remaining EVs based on largest remainders
        const remaining = originalTotalEVs - totalAllocated;
        if (remaining > 0) {
          // Sort by remainder descending
          remainders.sort((a, b) => b.remainder - a.remainder);
          
          for (let i = 0; i < remaining && i < remainders.length; i++) {
            const name = remainders[i].name;
            const current = roundedEVs.get(name) || 1;
            roundedEVs.set(name, current + 1);
          }
        } else if (remaining < 0) {
          // Need to remove EVs - start with states that have lowest remainders but more than 1 EV
          remainders.sort((a, b) => a.remainder - b.remainder);
          
          let toRemove = Math.abs(remaining);
          for (let i = 0; i < remainders.length && toRemove > 0; i++) {
            const name = remainders[i].name;
            const current = roundedEVs.get(name) || 1;
            if (current > 1) {
              roundedEVs.set(name, current - 1);
              toRemove--;
            }
          }
        }

        // Calculate party totals with new EVs
        statesInYear.forEach(({ name, data }) => {
          if (data.winner && roundedEVs.has(name)) {
            const newEVs = roundedEVs.get(name)!;
            result.electoralVoteChanges[name] = {
              original: data.electoralVotes,
              new: newEVs,
              difference: newEVs - data.electoralVotes
            };
            
            newPartyTotals[data.winner] = (newPartyTotals[data.winner] || 0) + newEVs;
            newTotalEVs += newEVs;
          }
        });

        // Find new winner and runner-up
        const sortedNewParties = Object.entries(newPartyTotals)
          .sort(([,a], [,b]) => b - a);
        
        result.newWinner = sortedNewParties.length > 0 ? sortedNewParties[0][0] : null;
        result.winnerElectoralVotes.new = sortedNewParties.length > 0 ? sortedNewParties[0][1] : 0;
        result.runnerUpElectoralVotes.new = sortedNewParties.length > 1 ? sortedNewParties[1][1] : 0;
        result.newPartyTotals = newPartyTotals;
        result.totalElectoralVotes.new = newTotalEVs;
      }
    } else if (viewMode === 'normalized' && normalizeToState) {
      // Normalized representation: use selected state's pop/EV ratio for all states
      const normalizeData = statesInYear.find(({ name }) => name === normalizeToState)?.data;
      
      if (normalizeData?.population && normalizeData?.electoralVotes) {
        const targetRatio = normalizeData.population / normalizeData.electoralVotes;
        const newPartyTotals: Record<string, number> = {};
        let newTotalEVs = 0;
        const unroundedEVs: Array<{ name: string, data: any, exactEVs: number }> = [];

        // First pass: calculate exact EVs for each state using normalize ratio
        statesInYear.forEach(({ name, data }) => {
          if (data.winner && data.population) {
            const exactEVs = data.population / targetRatio;
            unroundedEVs.push({ name, data, exactEVs });
          }
        });

        // Use the Largest Remainder Method to allocate EVs fairly
        const roundedEVs = new Map<string, number>();
        let totalAllocated = 0;
        
        // First allocation: give each state the floor of their exact EVs, minimum 1
        const remainders: Array<{ name: string, remainder: number, data: any }> = [];
        
        unroundedEVs.forEach(({ name, data, exactEVs }) => {
          const floorEVs = Math.max(1, Math.floor(exactEVs)); // Ensure minimum 1 EV
          roundedEVs.set(name, floorEVs);
          totalAllocated += floorEVs;
          
          // Calculate remainder for states that got more than 1 EV (can be adjusted)
          const remainder = exactEVs > 1 ? exactEVs - Math.floor(exactEVs) : 0;
          remainders.push({ name, remainder, data });
        });

        // Distribute remaining EVs based on largest remainders
        const remaining = originalTotalEVs - totalAllocated;
        if (remaining > 0) {
          // Sort by remainder descending
          remainders.sort((a, b) => b.remainder - a.remainder);
          
          for (let i = 0; i < remaining && i < remainders.length; i++) {
            const name = remainders[i].name;
            const current = roundedEVs.get(name) || 1;
            roundedEVs.set(name, current + 1);
          }
        } else if (remaining < 0) {
          // Need to remove EVs - start with states that have lowest remainders but more than 1 EV
          remainders.sort((a, b) => a.remainder - b.remainder);
          
          let toRemove = Math.abs(remaining);
          for (let i = 0; i < remainders.length && toRemove > 0; i++) {
            const name = remainders[i].name;
            const current = roundedEVs.get(name) || 1;
            if (current > 1) {
              roundedEVs.set(name, current - 1);
              toRemove--;
            }
          }
        }

        // Calculate party totals with new EVs
        statesInYear.forEach(({ name, data }) => {
          if (data.winner && roundedEVs.has(name)) {
            const newEVs = roundedEVs.get(name)!;
            result.electoralVoteChanges[name] = {
              original: data.electoralVotes,
              new: newEVs,
              difference: newEVs - data.electoralVotes
            };
            
            newPartyTotals[data.winner] = (newPartyTotals[data.winner] || 0) + newEVs;
            newTotalEVs += newEVs;
          }
        });

        // Find new winner and runner-up
        const sortedNewParties = Object.entries(newPartyTotals)
          .sort(([,a], [,b]) => b - a);
        
        result.newWinner = sortedNewParties.length > 0 ? sortedNewParties[0][0] : null;
        result.winnerElectoralVotes.new = sortedNewParties.length > 0 ? sortedNewParties[0][1] : 0;
        result.runnerUpElectoralVotes.new = sortedNewParties.length > 1 ? sortedNewParties[1][1] : 0;
        result.newPartyTotals = newPartyTotals;
        result.totalElectoralVotes.new = newTotalEVs;
      }
    } else {
      // For other view modes, no changes
      result.newWinner = result.originalWinner;
      result.winnerElectoralVotes.new = result.winnerElectoralVotes.original;
      result.runnerUpElectoralVotes.new = result.runnerUpElectoralVotes.original;
      result.newPartyTotals = result.originalPartyTotals;
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