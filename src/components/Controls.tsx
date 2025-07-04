import React from 'react';
import clsx from 'clsx';
import { ViewMode } from '../types';

interface ControlsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  normalizeToState: string | null;
  onNormalizeToState: (state: string | null) => void;
  states: string[];
  yearSummary: any;
  year: number;
}

const Controls: React.FC<ControlsProps> = ({
  viewMode,
  onViewModeChange,
  normalizeToState,
  onNormalizeToState,
  states,
  yearSummary,
  year,
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
  
  // Get top candidates for this year
  const getTopCandidates = () => {
    if (!yearSummary?.parties?.winner) return [];
    
    return Object.entries(yearSummary.parties.winner)
      .filter(([, states]) => (states as number) > 0)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([party, states]) => ({ party, states: states as number }));
  };
  
  const topCandidates = getTopCandidates();

  return (
    <div className="space-y-4">
      {/* Election Candidates */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-700 mb-3">{year} Candidates</h3>
        {topCandidates.length > 0 ? (
          <div className="space-y-2">
            {topCandidates.map((candidate, index) => (
              <div key={candidate.party} className="bg-white border border-neutral-200 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ 
                        backgroundColor: index === 0 ? '#22C55E' : index === 1 ? '#F59E0B' : '#6B7280' 
                      }}
                    ></div>
                    <span className="font-medium text-sm">{candidate.party}</span>
                  </div>
                  <span className="text-sm text-neutral-600">{candidate.states} states</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-sm text-neutral-500">
            No candidate data available for {year}
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-sm font-semibold text-neutral-700 mb-3">View Mode</h3>
        <div className="space-y-2">
          {viewModes.map(({ mode, label, description }) => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              className={clsx(
                'w-full text-left px-4 py-3 rounded-lg border transition-all duration-200',
                {
                  'bg-blue-50 border-blue-300 text-blue-900': viewMode === mode,
                  'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50':
                    viewMode !== mode,
                }
              )}
            >
              <div className="font-medium">{label}</div>
              <div className="text-xs mt-1 opacity-75">{description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* State normalization selector */}
      {viewMode === 'normalized' && (
        <div className="animate-slide-up">
          <h3 className="text-sm font-semibold text-neutral-700 mb-3">
            Normalize to State
          </h3>
          <select
            value={normalizeToState || ''}
            onChange={(e) => onNormalizeToState(e.target.value || null)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a state...</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          {normalizeToState && (
            <p className="text-xs text-neutral-600 mt-2">
              All electoral votes are recalculated using {normalizeToState}'s
              population-to-electoral vote ratio.
            </p>
          )}
        </div>
      )}

      {/* View descriptions */}
      <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-900">
        <p className="font-medium mb-1">💡 Tip:</p>
        <p>
          {viewMode === 'standard' &&
            'Hover over states to see detailed information. Colors represent the winning party.'}
          {viewMode === 'representation' &&
            'Green states are overrepresented (fewer people per EV), red states are underrepresented.'}
          {viewMode === 'scaled' &&
            'State sizes are proportional to their electoral vote count.'}
          {viewMode === 'equal' &&
            'Shows how many EVs each state would gain or lose with perfectly equal representation.'}
          {viewMode === 'normalized' &&
            'Select a state to see what would happen if all states had the same people-per-EV ratio.'}
        </p>
      </div>
    </div>
  );
};

export default Controls;