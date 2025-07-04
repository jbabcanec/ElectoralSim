import React, { useState, useEffect } from 'react';
import { StateTimeline, ViewMode } from '../types';

interface DataAuditProps {
  stateTimelines: Record<string, StateTimeline>;
  year: number;
  viewMode: ViewMode;
}

interface AuditResult {
  state: string;
  data: any;
  issues: string[];
  warnings: string[];
}

const DataAudit: React.FC<DataAuditProps> = ({ stateTimelines, year, viewMode }) => {
  const [auditResults, setAuditResults] = useState<AuditResult[]>([]);
  const [selectedTest, setSelectedTest] = useState<string>('1860'); // Start with a known election
  const [showDetails, setShowDetails] = useState(false);

  // Known historical election results for verification
  const KNOWN_RESULTS = {
    1860: {
      'California': { winner: 'Republican', electoralVotes: 4, population: 379994 },
      'Texas': { winner: 'Democratic', electoralVotes: 4, population: 604215 },
      'New York': { winner: 'Republican', electoralVotes: 35, population: 3880735 },
      'South Carolina': { winner: 'Democratic', electoralVotes: 8, population: 703708 }
    },
    1976: {
      'California': { winner: 'Democratic', electoralVotes: 45 },
      'Texas': { winner: 'Democratic', electoralVotes: 26 },
      'New York': { winner: 'Democratic', electoralVotes: 41 },
      'Florida': { winner: 'Democratic', electoralVotes: 17 }
    },
    2020: {
      'California': { winner: 'Democratic', electoralVotes: 55 },
      'Texas': { winner: 'Republican', electoralVotes: 38 },
      'New York': { winner: 'Democratic', electoralVotes: 29 },
      'Florida': { winner: 'Republican', electoralVotes: 29 }
    }
  };

  const auditData = () => {
    console.log('🔍 STARTING DATA AUDIT FOR YEAR:', year);
    console.log('🔍 VIEW MODE:', viewMode);
    
    const results: AuditResult[] = [];
    const testStates = ['California', 'Texas', 'New York', 'Florida', 'South Carolina', 'District of Columbia'];
    
    testStates.forEach(stateName => {
      const timeline = stateTimelines[stateName];
      const issues: string[] = [];
      const warnings: string[] = [];
      
      console.log(`\n📊 AUDITING: ${stateName} for ${year}`);
      
      if (!timeline) {
        issues.push('Timeline not found');
        console.error(`❌ No timeline for ${stateName}`);
        return;
      }
      
      const data = timeline.timeline.find(entry => entry.year === year);
      
      if (!data) {
        issues.push(`No data for year ${year}`);
        console.error(`❌ No data for ${stateName} in ${year}`);
        return;
      }
      
      console.log(`   📋 Raw data:`, {
        exists: data.exists,
        electoralVotes: data.electoralVotes,
        population: data.population,
        winner: data.winner,
        winnerColor: data.winnerColor,
        populationPerEV: data.populationPerEV,
        hypotheticalEVs: data.hypotheticalEVs,
        evDifference: data.evDifference
      });
      
      // Check if state should exist
      if (year >= 1789 && !data.exists && stateName !== 'District of Columbia') {
        if ((stateName === 'California' && year >= 1850) ||
            (stateName === 'Texas' && year >= 1845) ||
            (stateName === 'Florida' && year >= 1845) ||
            (stateName === 'New York' && year >= 1789) ||
            (stateName === 'South Carolina' && year >= 1789)) {
          issues.push(`State should exist in ${year} but marked as not existing`);
        }
      }
      
      // Check DC special case
      if (stateName === 'District of Columbia') {
        if (year >= 1961 && !data.exists) {
          issues.push('DC should have electoral votes after 1961');
        }
        if (year < 1961 && data.exists && data.electoralVotes > 0) {
          issues.push('DC should not have electoral votes before 1961');
        }
      }
      
      // Verify against known results
      const knownYear = KNOWN_RESULTS[year as keyof typeof KNOWN_RESULTS];
      if (knownYear && knownYear[stateName as keyof typeof knownYear]) {
        const known = knownYear[stateName as keyof typeof knownYear];
        
        if (data.electoralVotes !== known.electoralVotes) {
          issues.push(`Electoral votes mismatch: got ${data.electoralVotes}, expected ${known.electoralVotes}`);
        }
        
        if (data.winner !== known.winner) {
          issues.push(`Winner mismatch: got ${data.winner}, expected ${known.winner}`);
        }
        
        if ('population' in known && known.population && Math.abs((data.population || 0) - known.population) > known.population * 0.1) {
          warnings.push(`Population seems off: got ${data.population}, expected ~${known.population}`);
        }
      }
      
      // Check data consistency
      if (data.exists) {
        if (!data.electoralVotes || data.electoralVotes <= 0) {
          issues.push('Missing or invalid electoral votes');
        }
        
        if (year >= 1790 && (!data.population || data.population <= 0)) {
          warnings.push('Missing population data');
        }
        
        if (data.population && data.electoralVotes && !data.populationPerEV) {
          warnings.push('Missing population per EV calculation');
        }
        
        if (data.populationPerEV && data.population && data.electoralVotes) {
          const calculated = data.population / data.electoralVotes;
          if (Math.abs(calculated - data.populationPerEV) > 100) {
            issues.push(`Population per EV calculation error: ${data.populationPerEV} vs calculated ${calculated.toFixed(0)}`);
          }
        }
        
        if (!data.winner && year >= 1789) {
          warnings.push('Missing winner information');
        }
        
        if (!data.winnerColor || data.winnerColor === '#D3D3D3') {
          warnings.push('Using default/gray color - may indicate missing party data');
        }
      }
      
      // Log results
      if (issues.length > 0) {
        console.error(`❌ ISSUES for ${stateName}:`, issues);
      }
      if (warnings.length > 0) {
        console.warn(`⚠️  WARNINGS for ${stateName}:`, warnings);
      }
      if (issues.length === 0 && warnings.length === 0) {
        console.log(`✅ ${stateName} data looks good`);
      }
      
      results.push({
        state: stateName,
        data,
        issues,
        warnings
      });
    });
    
    setAuditResults(results);
    
    // Summary
    const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
    const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);
    
    console.log(`\n📊 AUDIT SUMMARY for ${year}:`);
    console.log(`   ❌ Total Issues: ${totalIssues}`);
    console.log(`   ⚠️  Total Warnings: ${totalWarnings}`);
    console.log(`   ✅ States audited: ${results.length}`);
  };

  useEffect(() => {
    auditData();
  }, [year, viewMode, stateTimelines]);

  const testYears = [1789, 1860, 1912, 1976, 2000, 2020];

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-yellow-800">🔍 Data Audit</h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-yellow-600 hover:text-yellow-800"
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
      </div>
      
      <div className="flex gap-2 mb-3">
        {testYears.map(testYear => (
          <button
            key={testYear}
            onClick={() => setSelectedTest(testYear.toString())}
            className={`px-2 py-1 text-xs rounded ${
              selectedTest === testYear.toString()
                ? 'bg-yellow-200 text-yellow-800'
                : 'bg-white text-yellow-600 hover:bg-yellow-100'
            }`}
          >
            {testYear}
          </button>
        ))}
      </div>
      
      {showDetails && (
        <div className="space-y-2">
          <div className="text-sm text-yellow-700">
            Current Year: <strong>{year}</strong> | 
            Issues: <strong className="text-red-600">{auditResults.reduce((sum, r) => sum + r.issues.length, 0)}</strong> | 
            Warnings: <strong className="text-yellow-600">{auditResults.reduce((sum, r) => sum + r.warnings.length, 0)}</strong>
          </div>
          
          {auditResults.map(result => (
            <div key={result.state} className="bg-white p-2 rounded text-xs">
              <div className="font-medium">{result.state}</div>
              {result.issues.length > 0 && (
                <div className="text-red-600 mt-1">
                  Issues: {result.issues.join('; ')}
                </div>
              )}
              {result.warnings.length > 0 && (
                <div className="text-yellow-600 mt-1">
                  Warnings: {result.warnings.join('; ')}
                </div>
              )}
              {result.data && (
                <div className="text-gray-600 mt-1">
                  EVs: {result.data.electoralVotes} | 
                  Winner: {result.data.winner || 'Unknown'} | 
                  Pop: {result.data.population?.toLocaleString() || 'N/A'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DataAudit;