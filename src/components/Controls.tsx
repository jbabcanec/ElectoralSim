import React, { useState } from 'react';
import clsx from 'clsx';
import { ViewMode } from '../types';
import { useWhatIfCalculations } from '../hooks/useWhatIfCalculations';

interface ControlsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  normalizeToState: string | null;
  onNormalizeToState: (state: string | null) => void;
  states: string[];
  yearSummary: any;
  year: number;
  stateTimelines: Record<string, any>;
}

const Controls: React.FC<ControlsProps> = ({
  viewMode,
  onViewModeChange,
  normalizeToState,
  onNormalizeToState,
  states,
  yearSummary,
  year,
  stateTimelines,
}) => {
  const viewModes: { mode: ViewMode; label: string; description: string }[] = [
    {
      mode: 'standard',
      label: 'Party Winners',
      description: 'Show winning party in each state',
    },
    {
      mode: 'representation',
      label: 'Population/EV Ratio',
      description: 'Color by representation fairness',
    },
    {
      mode: 'scaled',
      label: 'Electoral Vote Count',
      description: 'Color by number of electoral votes',
    },
    {
      mode: 'equal',
      label: 'Equal Representation',
      description: 'What if EVs matched population?',
    },
    {
      mode: 'normalized',
      label: 'Normalized View',
      description: 'Match selected state\'s ratio',
    },
  ];
  
  // Get what-if calculations
  const whatIfResult = useWhatIfCalculations(stateTimelines, year, viewMode, normalizeToState);
  
  // Modal state for distribution chart
  const [showDistribution, setShowDistribution] = useState(false);
  
  // Get top candidates for this year based on view mode
  const getTopCandidates = () => {
    if (viewMode === 'standard') {
      // Show historical results for standard view
      if (!yearSummary?.parties?.winner) return [];
      
      return Object.entries(yearSummary.parties.winner)
        .filter(([, evs]) => (evs as number) > 0)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 3)
        .map(([party, evs]) => ({ 
          party, 
          evs: evs as number,
          states: yearSummary.parties?.stateCount?.winner?.[party] || 0
        }));
    } else if (viewMode === 'equal' || viewMode === 'normalized') {
      // Calculate results based on what-if scenarios
      const statesInYear = Object.entries(stateTimelines)
        .map(([stateName, timeline]) => {
          const yearData = timeline.timeline.find((entry: any) => entry.year === year);
          return yearData?.exists ? { name: stateName, data: yearData } : null;
        })
        .filter(Boolean) as Array<{ name: string; data: any }>;

      if (statesInYear.length === 0) return [];

      // Calculate new electoral vote totals by party
      const newPartyTotals: Record<string, number> = {};
      const stateCountTotals: Record<string, number> = {};

      statesInYear.forEach(({ name, data }) => {
        if (data.winner && whatIfResult.electoralVoteChanges[name]) {
          const newEVs = whatIfResult.electoralVoteChanges[name].new;
          newPartyTotals[data.winner] = (newPartyTotals[data.winner] || 0) + newEVs;
          stateCountTotals[data.winner] = (stateCountTotals[data.winner] || 0) + 1;
        }
      });

      return Object.entries(newPartyTotals)
        .filter(([, evs]) => evs > 0)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([party, evs]) => ({
          party,
          evs,
          states: stateCountTotals[party] || 0
        }));
    } else {
      // For representation, scaled, and other view modes, 
      // the electoral distribution doesn't change but we can still show historical results
      if (!yearSummary?.parties?.winner) return [];
      
      return Object.entries(yearSummary.parties.winner)
        .filter(([, evs]) => (evs as number) > 0)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 3)
        .map(([party, evs]) => ({ 
          party, 
          evs: evs as number,
          states: yearSummary.parties?.stateCount?.winner?.[party] || 0
        }));
    }
  };
  
  const topCandidates = getTopCandidates();


  return (
    <>
      <div className="space-y-4">
        {/* Election Results Row */}
        <div className="flex flex-wrap items-center gap-6">
          {/* Election Candidates - Compact horizontal display */}
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-neutral-700">
              {year} Results
              {(viewMode === 'equal' || viewMode === 'normalized') && (
                <span className="text-xs text-blue-600 ml-1">
                  ({viewMode === 'equal' ? 'Equal Rep' : 'Normalized'})
                </span>
              )}:
            </h3>
          {topCandidates.length > 0 ? (
            <div className="flex items-center gap-3">
              {topCandidates.map((candidate, index) => (
                <div key={candidate.party} className="flex items-center gap-2 bg-white border border-neutral-200 rounded px-3 py-1">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ 
                      backgroundColor: index === 0 ? '#22C55E' : index === 1 ? '#F59E0B' : '#6B7280' 
                    }}
                  />
                  <span className="text-sm font-medium">{candidate.party}</span>
                  <span className="text-xs text-neutral-600">({candidate.evs} EVs, {candidate.states} states)</span>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-sm text-neutral-500">No data available</span>
          )}
        </div>
        
        {/* View Mode - Horizontal buttons */}
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-neutral-700">View:</h3>
          <div className="flex gap-2">
            {viewModes.map(({ mode, label, description }) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className={clsx(
                  'px-3 py-2 text-sm rounded-lg border transition-all duration-200',
                  {
                    'bg-blue-50 border-blue-300 text-blue-900': viewMode === mode,
                    'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50':
                      viewMode !== mode,
                  }
                )}
                title={description}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* State normalization selector - Compact */}
        {viewMode === 'normalized' && (
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-neutral-700">Normalize to:</label>
            <select
              value={normalizeToState || ''}
              onChange={(e) => onNormalizeToState(e.target.value || null)}
              className="px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a state...</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Distribution Chart Button - Only show for equal/normalized views */}
        {(viewMode === 'equal' || viewMode === 'normalized') && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDistribution(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View EV Distribution
            </button>
            <span className="text-xs text-neutral-600">
              {Object.keys(whatIfResult.electoralVoteChanges).filter(state => 
                whatIfResult.electoralVoteChanges[state].difference !== 0
              ).length} states with changes
            </span>
          </div>
        )}
      </div>

        {/* Distribution Modal */}
        {showDistribution && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                  <h2 className="text-xl font-bold text-neutral-900">
                    Electoral Vote Distribution Changes
                  </h2>
                  <span className="px-3 py-1 bg-white text-sm font-medium text-blue-700 rounded-full border border-blue-200">
                    {viewMode === 'equal' ? 'Equal Representation' : 'Normalized View'}
                  </span>
                </div>
                <button
                  onClick={() => setShowDistribution(false)}
                  className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-white rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="text-2xl font-bold text-green-700">
                      {Object.values(whatIfResult.electoralVoteChanges).filter(c => c.difference > 0).length}
                    </div>
                    <div className="text-sm text-green-600">States Gaining EVs</div>
                    <div className="text-xs text-green-500 mt-1">
                      +{Object.values(whatIfResult.electoralVoteChanges)
                        .filter(c => c.difference > 0)
                        .reduce((sum, c) => sum + c.difference, 0)} total gain
                    </div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <div className="text-2xl font-bold text-red-700">
                      {Object.values(whatIfResult.electoralVoteChanges).filter(c => c.difference < 0).length}
                    </div>
                    <div className="text-sm text-red-600">States Losing EVs</div>
                    <div className="text-xs text-red-500 mt-1">
                      {Object.values(whatIfResult.electoralVoteChanges)
                        .filter(c => c.difference < 0)
                        .reduce((sum, c) => sum + c.difference, 0)} total loss
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="text-2xl font-bold text-blue-700">
                      {Object.values(whatIfResult.electoralVoteChanges).filter(c => c.difference === 0).length}
                    </div>
                    <div className="text-sm text-blue-600">States Unchanged</div>
                    <div className="text-xs text-blue-500 mt-1">
                      {Object.values(whatIfResult.electoralVoteChanges)
                        .filter(c => c.difference === 0)
                        .reduce((sum, c) => sum + c.original, 0)} EVs preserved
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="text-2xl font-bold text-purple-700">
                      {Object.values(whatIfResult.electoralVoteChanges)
                        .reduce((sum, c) => sum + Math.abs(c.difference), 0)}
                    </div>
                    <div className="text-sm text-purple-600">Total EV Shifts</div>
                    <div className="text-xs text-purple-500 mt-1">
                      {Math.round(
                        (Object.values(whatIfResult.electoralVoteChanges)
                          .reduce((sum, c) => sum + Math.abs(c.difference), 0) / 
                         Object.values(whatIfResult.electoralVoteChanges)
                          .reduce((sum, c) => sum + c.original, 0)) * 100
                      )}% of total EVs
                    </div>
                  </div>
                </div>

                {/* Sorted Bar Graph Distribution */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-neutral-800">Electoral Vote Change Distribution</h3>
                    <div className="text-sm text-neutral-600">
                      Sorted by magnitude of change
                    </div>
                  </div>
                  
                  {/* Bar Chart */}
                  <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    {/* Chart Container */}
                    <div className="space-y-1">
                      {/* Y-axis label */}
                      <div className="text-xs text-neutral-500 mb-2">Electoral Vote Change</div>
                      
                      {/* Chart bars */}
                      <div className="space-y-1">
                        {Object.entries(whatIfResult.electoralVoteChanges)
                          .sort(([, a], [, b]) => b.difference - a.difference) // Sort by difference, largest gains first
                          .map(([state, change]) => {
                            const maxAbsChange = Math.max(
                              ...Object.values(whatIfResult.electoralVoteChanges)
                                .map(c => Math.abs(c.difference))
                            );
                            const barWidth = Math.abs(change.difference) / Math.max(maxAbsChange, 1) * 100;
                            const isGain = change.difference > 0;
                            const isLoss = change.difference < 0;
                            const isNoChange = change.difference === 0;
                            
                            return (
                              <div key={state} className="flex items-center group hover:bg-neutral-50 p-1 rounded transition-colors">
                                {/* State name */}
                                <div className="w-32 text-sm font-medium text-neutral-700 truncate">
                                  {state}
                                </div>
                                
                                {/* Bar container */}
                                <div className="flex-1 mx-4 relative">
                                  <div className="flex items-center h-6">
                                    {/* Center line (zero point) */}
                                    <div className="absolute left-1/2 w-px h-full bg-neutral-300 transform -translate-x-px"></div>
                                    
                                    {/* Bar */}
                                    {isGain && (
                                      <div 
                                        className="bg-gradient-to-r from-green-400 to-green-500 h-4 rounded-r border-l-2 border-neutral-300"
                                        style={{ 
                                          width: `${barWidth / 2}%`,
                                          marginLeft: '50%'
                                        }}
                                      ></div>
                                    )}
                                    {isLoss && (
                                      <div 
                                        className="bg-gradient-to-l from-red-400 to-red-500 h-4 rounded-l border-r-2 border-neutral-300 ml-auto"
                                        style={{ 
                                          width: `${barWidth / 2}%`,
                                          marginRight: '50%'
                                        }}
                                      ></div>
                                    )}
                                    {isNoChange && (
                                      <div className="absolute left-1/2 w-2 h-4 bg-neutral-400 rounded transform -translate-x-1"></div>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Value and details */}
                                <div className="w-24 text-right">
                                  <div className={`text-sm font-bold ${
                                    isGain ? 'text-green-700' : 
                                    isLoss ? 'text-red-700' : 
                                    'text-neutral-600'
                                  }`}>
                                    {change.difference > 0 ? '+' : ''}{change.difference}
                                  </div>
                                  <div className="text-xs text-neutral-500">
                                    {change.original} → {change.new}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                      
                      {/* X-axis labels */}
                      <div className="flex items-center mt-4 px-32">
                        <div className="flex-1 text-center">
                          <div className="text-xs text-red-600 font-medium">Losses</div>
                        </div>
                        <div className="w-px h-4 bg-neutral-300 mx-4"></div>
                        <div className="flex-1 text-center">
                          <div className="text-xs text-green-600 font-medium">Gains</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Breakdown Tables */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Top Gainers */}
                    <div className="space-y-3">
                      <h4 className="text-md font-semibold text-green-700 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        Top Gainers
                      </h4>
                      <div className="bg-green-50 rounded-lg border border-green-200 overflow-hidden">
                        <div className="max-h-48 overflow-y-auto">
                          {Object.entries(whatIfResult.electoralVoteChanges)
                            .filter(([, change]) => change.difference > 0)
                            .sort(([, a], [, b]) => b.difference - a.difference)
                            .slice(0, 10)
                            .map(([state, change], index) => (
                              <div key={state} className={`flex items-center justify-between p-3 ${
                                index % 2 === 0 ? 'bg-green-50' : 'bg-white'
                              }`}>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-green-600 font-medium w-6">#{index + 1}</span>
                                  <span className="font-medium text-green-800">{state}</span>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-green-700">+{change.difference}</div>
                                  <div className="text-xs text-green-600">{change.original} → {change.new}</div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>

                    {/* Top Losers */}
                    <div className="space-y-3">
                      <h4 className="text-md font-semibold text-red-700 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        Top Losers
                      </h4>
                      <div className="bg-red-50 rounded-lg border border-red-200 overflow-hidden">
                        <div className="max-h-48 overflow-y-auto">
                          {Object.entries(whatIfResult.electoralVoteChanges)
                            .filter(([, change]) => change.difference < 0)
                            .sort(([, a], [, b]) => a.difference - b.difference)
                            .slice(0, 10)
                            .map(([state, change], index) => (
                              <div key={state} className={`flex items-center justify-between p-3 ${
                                index % 2 === 0 ? 'bg-red-50' : 'bg-white'
                              }`}>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-red-600 font-medium w-6">#{index + 1}</span>
                                  <span className="font-medium text-red-800">{state}</span>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-red-700">{change.difference}</div>
                                  <div className="text-xs text-red-600">{change.original} → {change.new}</div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Controls;