import React from 'react';
import { StateTimeline, YearSummary } from '../types';
import { getStateDataForYear } from '../utils/calculations';
import { formatNumber, formatPopulationPerEV } from '../utils/calculations';

interface InfoPanelProps {
  hoveredState: string | null;
  selectedState: string | null;
  year: number;
  stateTimelines: Record<string, StateTimeline>;
  yearSummary: YearSummary | undefined;
}

const InfoPanel: React.FC<InfoPanelProps> = ({
  hoveredState,
  selectedState,
  year,
  stateTimelines,
  yearSummary,
}) => {
  // If a state is selected, show that. Otherwise show hovered state.
  const displayState = selectedState || hoveredState;
  const stateData = displayState ? getStateDataForYear(stateTimelines, displayState, year) : null;

  return (
    <div className="space-y-4">
      {/* State Information */}
      {displayState && stateData ? (
        <div className="bg-white border border-neutral-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-neutral-900 mb-3">
            {displayState} ({year})
          </h3>
          
          {stateData.exists ? (
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-neutral-600">Electoral Votes:</span>
                  <div className="font-semibold">{stateData.electoralVotes}</div>
                </div>
                <div>
                  <span className="text-neutral-600">Population:</span>
                  <div className="font-semibold">
                    {formatNumber(stateData.population)}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-neutral-600">People per EV:</span>
                  <div className="font-semibold">
                    {formatPopulationPerEV(stateData.populationPerEV)}
                  </div>
                </div>
                <div>
                  <span className="text-neutral-600">Representation:</span>
                  <div className="font-semibold">
                    {stateData.representationRatio ? 
                      `${stateData.representationRatio.toFixed(2)}x` : 'N/A'}
                  </div>
                </div>
              </div>
              
              {stateData.winner && (
                <div className="pt-2 border-t border-neutral-200">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: stateData.winnerColor }}
                    />
                    <span className="text-neutral-600">Winner:</span>
                    <span className="font-semibold">{stateData.winner}</span>
                    {stateData.isSplitState && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded">
                        Split EVs
                      </span>
                    )}
                  </div>
                  {stateData.runnerUp && (
                    <div className="text-xs text-neutral-500 mt-1">
                      Runner-up: {stateData.runnerUp}
                    </div>
                  )}
                </div>
              )}
              
              {stateData.hypotheticalEVs && (
                <div className="pt-2 border-t border-neutral-200">
                  <span className="text-neutral-600">Equal representation:</span>
                  <div className="font-semibold">
                    {stateData.hypotheticalEVs} EVs 
                    {stateData.evDifference !== 0 && (
                      <span className={`ml-1 text-sm ${
                        stateData.evDifference! > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ({stateData.evDifference! > 0 ? '+' : ''}{stateData.evDifference})
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-neutral-500 italic">
              {displayState} was not yet a state in {year}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-neutral-100 border border-neutral-200 rounded-lg p-4 text-center text-neutral-500">
          Hover over or click a state to see details
        </div>
      )}

      {/* Year Summary */}
      {yearSummary && (
        <div className="bg-white border border-neutral-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-neutral-900 mb-3">
            {year} Election Summary
          </h3>
          
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-neutral-600">Participating States:</span>
                <div className="font-semibold">{yearSummary.totalStates}</div>
              </div>
              <div>
                <span className="text-neutral-600">Total EVs:</span>
                <div className="font-semibold">{yearSummary.totalElectoralVotes}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-neutral-600">Total Population:</span>
                <div className="font-semibold">
                  {formatNumber(yearSummary.totalPopulation)}
                </div>
              </div>
              <div>
                <span className="text-neutral-600">Avg People/EV:</span>
                <div className="font-semibold">
                  {formatPopulationPerEV(yearSummary.averagePopPerEV)}
                </div>
              </div>
            </div>
            
            {yearSummary.minPopPerEV.state && yearSummary.maxPopPerEV.state && (
              <div className="pt-2 border-t border-neutral-200">
                <div className="text-xs text-neutral-600 mb-1">Representation Range:</div>
                <div className="text-xs">
                  <div className="text-green-700">
                    Most represented: {yearSummary.minPopPerEV.state} 
                    ({formatPopulationPerEV(yearSummary.minPopPerEV.value)})
                  </div>
                  <div className="text-red-700">
                    Least represented: {yearSummary.maxPopPerEV.state} 
                    ({formatPopulationPerEV(yearSummary.maxPopPerEV.value)})
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoPanel;