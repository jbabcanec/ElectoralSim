import React from 'react';
import { ViewMode } from '../types';
import { useWhatIfCalculations } from '../hooks/useWhatIfCalculations';

interface RightPanelProps {
  stateTimelines: Record<string, any>;
  year: number;
  viewMode: ViewMode;
  normalizeToState: string | null;
  selectedState: string | null;
  yearSummary: any;
}

const RightPanel: React.FC<RightPanelProps> = ({
  stateTimelines,
  year,
  viewMode,
  normalizeToState,
  selectedState,
  yearSummary
}) => {
  const whatIfResult = useWhatIfCalculations(stateTimelines, year, viewMode, normalizeToState);

  // Get election candidates and results
  const getElectionCandidates = () => {
    if (!yearSummary?.parties) return [];
    
    const candidates = [];
    
    // Winner parties
    for (const [party, states] of Object.entries(yearSummary.parties.winner)) {
      const stateCount = typeof states === 'number' ? states : 0;
      if (stateCount > 0) {
        candidates.push({
          party,
          states: stateCount,
          type: 'winner'
        });
      }
    }
    
    return candidates.sort((a, b) => b.states - a.states);
  };
  
  const candidates = getElectionCandidates();

  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-4 space-y-6">
        
        {/* Election Candidates */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">{year} Election</h3>
          {candidates.length > 0 ? (
            <div className="space-y-2">
              {candidates.map((candidate, index) => (
                <div key={candidate.party} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded mr-2" style={{ 
                      backgroundColor: index === 0 ? '#4CAF50' : index === 1 ? '#FF9800' : '#757575' 
                    }}></div>
                    <span className="font-medium text-sm">{candidate.party}</span>
                  </div>
                  <span className="text-sm text-gray-600">{candidate.states} states</span>
                </div>
              ))}
              
              {yearSummary && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    Total States: {yearSummary.totalStates} | 
                    Total EVs: {yearSummary.totalElectoralVotes}
                    {yearSummary.totalPopulation && (
                      <><br />Population: {yearSummary.totalPopulation.toLocaleString()}</>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500">No election data available</div>
          )}
        </div>

        {/* What-If Analysis */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">What-If Analysis</h3>
          
          {(viewMode === 'equal' || viewMode === 'normalized') ? (
            <div className="space-y-4">
              {/* Outcome Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Original</div>
                  <div className="font-semibold text-gray-800">{whatIfResult.originalWinner || 'Unknown'}</div>
                  <div className="text-sm text-gray-600">{whatIfResult.totalElectoralVotes.original} EVs</div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    {viewMode === 'equal' ? 'Equal Pop' : 'Normalized'}
                  </div>
                  <div className="font-semibold text-gray-800">{whatIfResult.newWinner || 'Unknown'}</div>
                  <div className="text-sm text-gray-600">{whatIfResult.totalElectoralVotes.new} EVs</div>
                </div>
              </div>

              {/* Outcome Change Alert */}
              {whatIfResult.outcomeChanged ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">🚨</span>
                    <div>
                      <div className="font-medium text-yellow-800">Election outcome would change!</div>
                      <div className="text-sm text-yellow-700">
                        From <strong>{whatIfResult.originalWinner}</strong> to <strong>{whatIfResult.newWinner}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">✅</span>
                    <div>
                      <div className="font-medium text-green-800">Same winner</div>
                      <div className="text-sm text-green-700">
                        {whatIfResult.originalWinner} wins in both scenarios
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Selected State Details */}
              {selectedState && whatIfResult.electoralVoteChanges[selectedState] && (
                <div className="border-t pt-3">
                  <div className="font-medium text-gray-700 mb-2">{selectedState}</div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <div className="text-gray-500">Original</div>
                      <div className="font-medium">{whatIfResult.electoralVoteChanges[selectedState].original} EVs</div>
                    </div>
                    <div>
                      <div className="text-gray-500">New</div>
                      <div className="font-medium">{whatIfResult.electoralVoteChanges[selectedState].new} EVs</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Change</div>
                      <div className={`font-medium ${
                        whatIfResult.electoralVoteChanges[selectedState].difference > 0 
                          ? 'text-green-600' 
                          : whatIfResult.electoralVoteChanges[selectedState].difference < 0 
                            ? 'text-red-600' 
                            : 'text-gray-600'
                      }`}>
                        {whatIfResult.electoralVoteChanges[selectedState].difference > 0 ? '+' : ''}
                        {whatIfResult.electoralVoteChanges[selectedState].difference}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Methodology */}
              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                {viewMode === 'equal' && (
                  <p>Shows results if electoral votes were distributed proportionally to state populations.</p>
                )}
                {viewMode === 'normalized' && normalizeToState && (
                  <p>Shows results if all states had the same population-to-EV ratio as {normalizeToState}.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <div className="text-2xl mb-2">📊</div>
              <p className="text-sm">Select "Equal Representation" or "Normalized View" to see what-if scenarios.</p>
            </div>
          )}
        </div>

        {/* Top 5 Biggest Changes (for what-if modes) */}
        {(viewMode === 'equal' || viewMode === 'normalized') && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-700 mb-3">Biggest EV Changes</h4>
            <div className="space-y-2">
              {Object.entries(whatIfResult.electoralVoteChanges)
                .sort(([,a], [,b]) => Math.abs(b.difference) - Math.abs(a.difference))
                .slice(0, 5)
                .map(([state, change]) => (
                  <div key={state} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700">{state}</span>
                    <span className={`font-medium ${
                      change.difference > 0 ? 'text-green-600' : 
                      change.difference < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {change.difference > 0 ? '+' : ''}{change.difference}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Legend for current view */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-700 mb-3">Color Legend</h4>
          <div className="space-y-2 text-sm">
            {viewMode === 'standard' && (
              <div>Colors represent the winning political party in each state for {year}.</div>
            )}
            {viewMode === 'representation' && (
              <div>
                <div className="mb-2">Green intensity shows population per electoral vote:</div>
                <div className="text-xs text-gray-500">Dark green = More people per EV (less represented)</div>
                <div className="text-xs text-gray-500">Light green = Fewer people per EV (more represented)</div>
              </div>
            )}
            {viewMode === 'scaled' && (
              <div>
                <div className="mb-2">Red intensity shows electoral vote count:</div>
                <div className="text-xs text-gray-500">Dark red = More electoral votes</div>
                <div className="text-xs text-gray-500">Light red = Fewer electoral votes</div>
              </div>
            )}
            {viewMode === 'equal' && (
              <div>
                <div className="mb-2">Shows electoral vote changes under equal representation:</div>
                <div className="text-xs text-gray-500">Green = Would gain electoral votes</div>
                <div className="text-xs text-gray-500">Red = Would lose electoral votes</div>
              </div>
            )}
            {viewMode === 'normalized' && (
              <div>Blue intensity shows population relative to other states.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;