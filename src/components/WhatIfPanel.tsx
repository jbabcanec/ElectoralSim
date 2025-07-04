import React from 'react';
import { ViewMode } from '../types';
import { useWhatIfCalculations } from '../hooks/useWhatIfCalculations';

interface WhatIfPanelProps {
  stateTimelines: Record<string, any>;
  year: number;
  viewMode: ViewMode;
  normalizeToState: string | null;
}

const WhatIfPanel: React.FC<WhatIfPanelProps> = ({
  stateTimelines,
  year,
  viewMode,
  normalizeToState
}) => {
  const whatIfResult = useWhatIfCalculations(stateTimelines, year, viewMode, normalizeToState);

  if (viewMode === 'standard' || viewMode === 'representation' || viewMode === 'scaled') {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-2">What-If Analysis</h3>
        <p className="text-gray-600">
          Select "Equal Representation" or "Normalized" view to see what-if scenarios.
        </p>
      </div>
    );
  }

  const { originalWinner, newWinner, outcomeChanged, totalElectoralVotes } = whatIfResult;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-3">What-If Analysis: {year}</h3>
      
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-700">Original Result</h4>
            <p className="text-sm">
              Winner: <span className="font-semibold">{originalWinner || 'Unknown'}</span>
            </p>
            <p className="text-sm">
              Total EVs: <span className="font-semibold">{totalElectoralVotes.original}</span>
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700">
              {viewMode === 'equal' ? 'Equal Population' : 'Normalized'} Result
            </h4>
            <p className="text-sm">
              Winner: <span className="font-semibold">{newWinner || 'Unknown'}</span>
            </p>
            <p className="text-sm">
              Total EVs: <span className="font-semibold">{totalElectoralVotes.new}</span>
            </p>
          </div>
        </div>

        {outcomeChanged && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-yellow-800 font-medium">
              🚨 Election outcome would change!
            </p>
            <p className="text-sm text-yellow-700">
              From {originalWinner} to {newWinner}
            </p>
          </div>
        )}

        {!outcomeChanged && originalWinner && newWinner && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <p className="text-green-800 font-medium">
              ✅ Same winner in both scenarios
            </p>
          </div>
        )}

        <div className="text-xs text-gray-500">
          {viewMode === 'equal' && (
            <p>Shows results if electoral votes were distributed proportionally to population.</p>
          )}
          {viewMode === 'normalized' && normalizeToState && (
            <p>Shows results if all states had the same population-to-EV ratio as {normalizeToState}.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatIfPanel;