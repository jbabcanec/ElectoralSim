import React from 'react';
import { StateTimeline, ViewMode } from '../types';

interface TooltipProps {
  stateName: string;
  year: number;
  viewMode: ViewMode;
  stateTimelines: Record<string, StateTimeline>;
  mouseX: number;
  mouseY: number;
  visible: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({
  stateName,
  year,
  viewMode,
  stateTimelines,
  mouseX,
  mouseY,
  visible
}) => {
  if (!visible || !stateName) return null;

  const timeline = stateTimelines[stateName];
  if (!timeline) return null;

  const data = timeline.timeline.find(entry => entry.year === year);
  if (!data) return null;

  const formatNumber = (num: number | null) => {
    if (num === null) return 'N/A';
    return num.toLocaleString();
  };

  return (
    <div
      className="fixed bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-sm z-50 pointer-events-none"
      style={{
        left: `${mouseX + 10}px`,
        top: `${mouseY - 10}px`,
        maxWidth: '250px'
      }}
    >
      <div className="font-bold text-gray-800 mb-2">{stateName}</div>
      
      {data.exists ? (
        <div className="space-y-1 text-gray-600">
          <div>Year: <span className="font-medium">{year}</span></div>
          <div>Electoral Votes: <span className="font-medium">{data.electoralVotes}</span></div>
          
          {data.population && (
            <div>Population: <span className="font-medium">{formatNumber(data.population)}</span></div>
          )}
          
          {data.populationPerEV && (
            <div>Pop/EV Ratio: <span className="font-medium">{formatNumber(Math.round(data.populationPerEV))}</span></div>
          )}
          
          {data.winner && (
            <div>Winner: <span className="font-medium" style={{ color: data.winnerColor }}>{data.winner}</span></div>
          )}
          
          {data.runnerUp && (
            <div>Runner-up: <span className="font-medium">{data.runnerUp}</span></div>
          )}
          
          {viewMode === 'equal' && data.hypotheticalEVs && (
            <div>
              <div className="border-t pt-1 mt-1">
                <div className="text-xs text-gray-500 mb-1">Equal Representation:</div>
                <div>Would have: <span className="font-medium">{data.hypotheticalEVs} EVs</span></div>
                {data.evDifference && (
                  <div>
                    Difference: <span className={`font-medium ${data.evDifference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {data.evDifference > 0 ? '+' : ''}{data.evDifference}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-gray-500 text-xs">
          {stateName} was not a state in {year}
        </div>
      )}
    </div>
  );
};

export default Tooltip;