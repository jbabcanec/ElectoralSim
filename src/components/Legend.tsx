import React from 'react';
import { ViewMode } from '../types';
import { getLegendData } from '../utils/colorScales';

interface LegendProps {
  viewMode: ViewMode;
}

const Legend: React.FC<LegendProps> = ({ viewMode }) => {
  const legendData = getLegendData(viewMode);

  if (legendData.length === 0) {
    return null;
  }

  const getTitle = () => {
    switch (viewMode) {
      case 'standard':
        return 'Political Parties';
      case 'representation':
        return 'Representation Level';
      case 'equal':
        return 'Electoral Vote Change';
      default:
        return 'Legend';
    }
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-neutral-700 mb-3">{getTitle()}</h3>
      <div className="space-y-2">
        {legendData.map((item, index) => (
          <div key={index} className="legend-item">
            <div
              className="legend-swatch"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-neutral-700">{item.label}</span>
          </div>
        ))}
        
        {/* Special cases */}
        {(viewMode === 'standard' || viewMode === 'representation') && (
          <>
            <div className="legend-item">
              <div
                className="legend-swatch"
                style={{ backgroundColor: '#F0F0F0' }}
              />
              <span className="text-neutral-500">State didn't exist</span>
            </div>
            <div className="legend-item">
              <div
                className="legend-swatch"
                style={{ backgroundColor: '#808080' }}
              />
              <span className="text-neutral-500">Didn't participate</span>
            </div>
          </>
        )}
      </div>
      
      {/* Additional context for complex views */}
      {viewMode === 'representation' && (
        <div className="mt-3 p-2 bg-neutral-100 rounded text-xs text-neutral-600">
          <p>Representation ratio compares state's people-per-EV to national average.</p>
        </div>
      )}
      
      {viewMode === 'equal' && (
        <div className="mt-3 p-2 bg-neutral-100 rounded text-xs text-neutral-600">
          <p>Based on perfectly equal population per electoral vote nationwide.</p>
        </div>
      )}
    </div>
  );
};

export default Legend;