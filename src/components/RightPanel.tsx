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
    for (const [party, evs] of Object.entries(yearSummary.parties.winner)) {
      const electoralVotes = typeof evs === 'number' ? evs : 0;
      const stateCount = yearSummary.parties?.stateCount?.winner?.[party] || 0;
      if (electoralVotes > 0) {
        candidates.push({
          party,
          evs: electoralVotes,
          states: stateCount,
          type: 'winner'
        });
      }
    }
    
    return candidates.sort((a, b) => b.evs - a.evs);
  };
  
  const candidates = getElectionCandidates();

  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-4 space-y-6">
        
        {/* Election Candidates - Major Contenders */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">{year} Election - Major Contenders</h3>
          {candidates.length > 0 ? (
            <div className="space-y-3">
              {/* Winner and Runner-up */}
              {candidates.slice(0, 2).map((candidate, index) => (
                <div key={candidate.party} className="flex justify-between items-center p-2 rounded" style={{
                  backgroundColor: index === 0 ? '#E8F5E8' : '#FFF3E0'
                }}>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded mr-2" style={{ 
                      backgroundColor: index === 0 ? '#4CAF50' : '#FF9800'
                    }}></div>
                    <div>
                      <span className="font-medium text-sm">{candidate.party}</span>
                      <div className="text-xs text-gray-600">{index === 0 ? 'Winner' : 'Runner-up'}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{candidate.evs} EVs</div>
                    <div className="text-xs text-gray-600">{candidate.states} states</div>
                  </div>
                </div>
              ))}
              
              {/* Other candidates */}
              {candidates.slice(2).length > 0 && (
                <div className="pt-2 border-t border-gray-300">
                  <div className="text-xs text-gray-500 mb-1">Other candidates:</div>
                  {candidates.slice(2).map((candidate) => (
                    <div key={candidate.party} className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">{candidate.party}</span>
                      <span className="text-gray-500">{candidate.evs} EVs</span>
                    </div>
                  ))}
                </div>
              )}
              
              {yearSummary && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    Total States: {yearSummary.totalStates} | 
                    Total EVs: {yearSummary.totalElectoralVotes}
                    {yearSummary.totalPopulation && (
                      <><br />Population: {yearSummary.totalPopulation.toLocaleString()}</>
                    )}
                    {yearSummary.averagePopPerEV && (
                      <><br />Avg Pop/EV: {Math.round(yearSummary.averagePopPerEV).toLocaleString()}</>
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
              {/* State Weighting Information */}
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-1">
                  Representation Method
                </div>
                {viewMode === 'equal' && (
                  <div className="text-sm text-blue-800">
                    <div className="font-medium">Equal Population Representation</div>
                    <div className="text-xs text-blue-600 mt-1">
                      All states have the same population-to-EV ratio
                      {yearSummary?.averagePopPerEV && (
                        <><br />Target: {Math.round(yearSummary.averagePopPerEV).toLocaleString()} people per EV</>
                      )}
                    </div>
                  </div>
                )}
                {viewMode === 'normalized' && normalizeToState && (
                  <div className="text-sm text-blue-800">
                    <div className="font-medium">Normalized to {normalizeToState}</div>
                    <div className="text-xs text-blue-600 mt-1">
                      All states use {normalizeToState}'s population-to-EV ratio
                    </div>
                  </div>
                )}
              </div>

              {/* Winner Comparison */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Original Winner</div>
                  <div className="font-semibold text-gray-800">{whatIfResult.originalWinner || 'Unknown'}</div>
                  <div className="text-sm text-gray-600">{whatIfResult.winnerElectoralVotes.original} EVs</div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    {viewMode === 'equal' ? 'Equal Pop Winner' : 'Normalized Winner'}
                  </div>
                  <div className="font-semibold text-gray-800">{whatIfResult.newWinner || 'Unknown'}</div>
                  <div className="text-sm text-gray-600">{whatIfResult.winnerElectoralVotes.new} EVs</div>
                </div>
              </div>

              {/* Runner-up Comparison */}
              {whatIfResult.runnerUpElectoralVotes.original > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-orange-50 p-3 rounded border border-orange-200">
                    <div className="text-xs text-orange-600 uppercase tracking-wide">Original Runner-up</div>
                    <div className="font-semibold text-orange-800">
                      {candidates.length > 1 ? candidates[1].party : 'Unknown'}
                    </div>
                    <div className="text-sm text-orange-700">{whatIfResult.runnerUpElectoralVotes.original} EVs</div>
                  </div>
                  
                  <div className="bg-orange-50 p-3 rounded border border-orange-200">
                    <div className="text-xs text-orange-600 uppercase tracking-wide">
                      {viewMode === 'equal' ? 'Equal Pop Runner-up' : 'Normalized Runner-up'}
                    </div>
                    <div className="font-semibold text-orange-800">
                      {/* Find the runner-up in new scenario */}
                      {Object.entries(whatIfResult.newPartyTotals || {})
                        .sort(([,a], [,b]) => b - a)
                        .slice(1, 2)
                        .map(([party]) => party)[0] || 'Unknown'}
                    </div>
                    <div className="text-sm text-orange-700">{whatIfResult.runnerUpElectoralVotes.new} EVs</div>
                  </div>
                </div>
              )}

              {/* Complete Party Breakdown */}
              {Object.keys(whatIfResult.newPartyTotals || {}).length > 0 && (
                <div className="border-t pt-3">
                  <div className="text-sm font-medium text-gray-700 mb-2">Complete Electoral Vote Breakdown</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Original</div>
                      {Object.entries(whatIfResult.originalPartyTotals || {})
                        .sort(([,a], [,b]) => b - a)
                        .map(([party, evs]) => (
                          <div key={party} className="flex justify-between text-sm">
                            <span className="text-gray-700">{party}</span>
                            <span className="font-medium">{evs}</span>
                          </div>
                        ))}
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        {viewMode === 'equal' ? 'Equal Pop' : 'Normalized'}
                      </div>
                      {Object.entries(whatIfResult.newPartyTotals || {})
                        .sort(([,a], [,b]) => b - a)
                        .map(([party, evs]) => (
                          <div key={party} className="flex justify-between text-sm">
                            <span className="text-gray-700">{party}</span>
                            <span className="font-medium">{evs}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

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