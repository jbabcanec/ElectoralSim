const fs = require('fs');
const path = require('path');

// Load the current data
const timelineData = JSON.parse(fs.readFileSync('./src/data/stateTimelines.json', 'utf8'));
const summaryData = JSON.parse(fs.readFileSync('./src/data/yearSummaries.json', 'utf8'));
const configData = JSON.parse(fs.readFileSync('./src/data/config.json', 'utf8'));

// Update American Independent color to orange (not grey)
configData.partyColors['American Independent'] = '#FF8C00';

let fixCount = 0;

console.log('Starting comprehensive data fix...');

// Fix all critical recent election issues (12 fixes)
const criticalFixes = [
  // 2020 fixes
  { state: 'Arizona', year: 2020, candidate: 'Joe Biden', correctParty: 'Democratic' },
  { state: 'Georgia', year: 2020, candidate: 'Joe Biden', correctParty: 'Democratic' },
  { state: 'Michigan', year: 2020, candidate: 'Joe Biden', correctParty: 'Democratic' },
  { state: 'Nevada', year: 2020, candidate: 'Joe Biden', correctParty: 'Democratic' },
  { state: 'Pennsylvania', year: 2020, candidate: 'Joe Biden', correctParty: 'Democratic' },
  { state: 'Wisconsin', year: 2020, candidate: 'Joe Biden', correctParty: 'Democratic' },
  
  // 2016 fixes
  { state: 'Michigan', year: 2016, candidate: 'Donald Trump', correctParty: 'Republican' },
  { state: 'Pennsylvania', year: 2016, candidate: 'Donald Trump', correctParty: 'Republican' },
  { state: 'Wisconsin', year: 2016, candidate: 'Donald Trump', correctParty: 'Republican' },
  
  // 2000 fixes
  { state: 'Florida', year: 2000, candidate: 'George W. Bush', correctParty: 'Republican' },
  
  // 1984 fixes
  { state: 'Minnesota', year: 1984, candidate: 'Walter Mondale', correctParty: 'Democratic' },
  
  // 1980 fixes
  { state: 'Georgia', year: 1980, candidate: 'Jimmy Carter', correctParty: 'Democratic' }
];

criticalFixes.forEach(fix => {
  if (timelineData[fix.state] && timelineData[fix.state][fix.year]) {
    const entry = timelineData[fix.state][fix.year];
    if (entry.winner === fix.candidate && entry.party !== fix.correctParty) {
      console.log(`Fixing ${fix.state} ${fix.year}: ${fix.candidate} (${entry.party}) → ${fix.correctParty}`);
      entry.party = fix.correctParty;
      entry.color = configData.partyColors[fix.correctParty];
      fixCount++;
    }
  }
});

// Fix historical placeholder party names (56 fixes)
const historicalFixes = [
  // Replace year-based party names with proper historical parties
  { oldParty: '1789', newParty: 'None', color: '#D3D3D3' },
  { oldParty: '1792', newParty: 'None', color: '#D3D3D3' },
  { oldParty: '1796', newParty: 'Federalist', color: '#EA9978' },
  { oldParty: '1800', newParty: 'Democratic-Republican', color: '#008000' },
  { oldParty: '1804', newParty: 'Democratic-Republican', color: '#008000' },
  { oldParty: '1808', newParty: 'Democratic-Republican', color: '#008000' },
  { oldParty: '1812', newParty: 'Democratic-Republican', color: '#008000' },
  { oldParty: '1816', newParty: 'Democratic-Republican', color: '#008000' },
  { oldParty: '1820', newParty: 'Democratic-Republican', color: '#008000' },
  { oldParty: '1824', newParty: 'Democratic-Republican', color: '#008000' },
  { oldParty: '1828', newParty: 'Democratic', color: '#3333FF' },
  { oldParty: '1832', newParty: 'Democratic', color: '#3333FF' },
  { oldParty: '1836', newParty: 'Democratic', color: '#3333FF' },
  { oldParty: '1840', newParty: 'Whig', color: '#F0DC82' },
  { oldParty: '1844', newParty: 'Democratic', color: '#3333FF' },
  { oldParty: '1848', newParty: 'Whig', color: '#F0DC82' },
  { oldParty: '1852', newParty: 'Democratic', color: '#3333FF' },
  { oldParty: '1856', newParty: 'Democratic', color: '#3333FF' },
  { oldParty: '1860', newParty: 'Republican', color: '#E81B23' },
  { oldParty: '1864', newParty: 'Republican', color: '#E81B23' },
  { oldParty: '1868', newParty: 'Republican', color: '#E81B23' },
  { oldParty: '1872', newParty: 'Republican', color: '#E81B23' },
  { oldParty: '1876', newParty: 'Republican', color: '#E81B23' },
  { oldParty: '1880', newParty: 'Republican', color: '#E81B23' },
  { oldParty: '1884', newParty: 'Democratic', color: '#3333FF' },
  { oldParty: '1888', newParty: 'Republican', color: '#E81B23' },
  { oldParty: '1892', newParty: 'Democratic', color: '#3333FF' },
  { oldParty: '1896', newParty: 'Republican', color: '#E81B23' },
  { oldParty: '1900', newParty: 'Republican', color: '#E81B23' },
  { oldParty: '1904', newParty: 'Republican', color: '#E81B23' },
  { oldParty: '1908', newParty: 'Republican', color: '#E81B23' },
  { oldParty: '1912', newParty: 'Democratic', color: '#3333FF' },
  { oldParty: '1916', newParty: 'Democratic', color: '#3333FF' },
  { oldParty: '1920', newParty: 'Republican', color: '#E81B23' },
  { oldParty: '1924', newParty: 'Republican', color: '#E81B23' },
  { oldParty: '1928', newParty: 'Republican', color: '#E81B23' },
  { oldParty: '1932', newParty: 'Democratic', color: '#3333FF' },
  { oldParty: '1936', newParty: 'Democratic', color: '#3333FF' },
  { oldParty: '1940', newParty: 'Democratic', color: '#3333FF' },
  { oldParty: '1944', newParty: 'Democratic', color: '#3333FF' },
  { oldParty: '1948', newParty: 'Democratic', color: '#3333FF' },
  { oldParty: '1952', newParty: 'Republican', color: '#E81B23' },
  { oldParty: '1956', newParty: 'Republican', color: '#E81B23' },
  { oldParty: '1960', newParty: 'Democratic', color: '#3333FF' },
  { oldParty: '1964', newParty: 'Democratic', color: '#3333FF' },
  { oldParty: '1968', newParty: 'Republican', color: '#E81B23' },
  { oldParty: '1972', newParty: 'Republican', color: '#E81B23' },
  { oldParty: '1976', newParty: 'Democratic', color: '#3333FF' },
  { oldParty: '1980', newParty: 'Republican', color: '#E81B23' },
  { oldParty: '1984', newParty: 'Republican', color: '#E81B23' },
  { oldParty: '1988', newParty: 'Republican', color: '#E81B23' },
  { oldParty: '1992', newParty: 'Democratic', color: '#3333FF' },
  { oldParty: '1996', newParty: 'Democratic', color: '#3333FF' },
  { oldParty: '2000', newParty: 'Republican', color: '#E81B23' },
  { oldParty: '2004', newParty: 'Republican', color: '#E81B23' },
  { oldParty: '2008', newParty: 'Democratic', color: '#3333FF' },
  { oldParty: '2012', newParty: 'Democratic', color: '#3333FF' },
  { oldParty: '2016', newParty: 'Republican', color: '#E81B23' },
  { oldParty: '2020', newParty: 'Democratic', color: '#3333FF' }
];

// Apply historical fixes
Object.keys(timelineData).forEach(state => {
  Object.keys(timelineData[state]).forEach(year => {
    const entry = timelineData[state][year];
    historicalFixes.forEach(fix => {
      if (entry.party === fix.oldParty) {
        console.log(`Fixing ${state} ${year}: ${fix.oldParty} → ${fix.newParty}`);
        entry.party = fix.newParty;
        entry.color = fix.color;
        fixCount++;
      }
    });
  });
});

// Fix third party consistency (3 fixes)
const thirdPartyFixes = [
  // Strom Thurmond states (1948)
  { states: ['Alabama', 'Louisiana', 'Mississippi', 'South Carolina'], year: 1948, candidate: 'Strom Thurmond', correctParty: 'States Rights', color: '#F4C430' },
  // George Wallace states (1968) - Use orange for American Independent (not grey)
  { states: ['Alabama', 'Arkansas', 'Georgia', 'Louisiana', 'Mississippi'], year: 1968, candidate: 'George Wallace', correctParty: 'American Independent', color: '#FF8C00' }
];

thirdPartyFixes.forEach(fix => {
  fix.states.forEach(state => {
    if (timelineData[state] && timelineData[state][fix.year]) {
      const entry = timelineData[state][fix.year];
      if (entry.winner === fix.candidate && entry.party !== fix.correctParty) {
        console.log(`Fixing ${state} ${fix.year}: ${fix.candidate} (${entry.party}) → ${fix.correctParty}`);
        entry.party = fix.correctParty;
        entry.color = fix.color;
        fixCount++;
      }
    }
  });
});

// Fix grey color violations (56 fixes)
Object.keys(timelineData).forEach(state => {
  Object.keys(timelineData[state]).forEach(year => {
    const entry = timelineData[state][year];
    if (entry.color === '#808080' && entry.party !== 'American Independent' && entry.party !== 'Did Not Vote') {
      // Replace grey with appropriate party color
      if (configData.partyColors[entry.party]) {
        console.log(`Fixing ${state} ${year}: Replacing grey color for ${entry.party}`);
        entry.color = configData.partyColors[entry.party];
        fixCount++;
      }
    }
  });
});

console.log(`Applied ${fixCount} fixes to timeline data`);

// Save the corrected timeline data
fs.writeFileSync('./src/data/stateTimelines.json', JSON.stringify(timelineData, null, 2));

// Save the updated config with corrected party colors
fs.writeFileSync('./src/data/config.json', JSON.stringify(configData, null, 2));

// Recalculate year summaries (52 fixes)
console.log('Recalculating year summaries...');
const configYears = configData.years;
const configStates = configData.states;
let summaryFixCount = 0;

configYears.forEach(year => {
  const yearData = {
    year: year,
    totalStates: 0,
    totalElectoralVotes: 0,
    totalPopulation: 0,
    averagePopPerEV: 0,
    minPopPerEV: { state: null, value: null },
    maxPopPerEV: { state: null, value: null },
    parties: {
      winner: {},
      runnerUp: {},
      stateCount: {
        winner: {},
        runnerUp: {}
      }
    }
  };

  let totalPop = 0;
  let totalEV = 0;
  let minPop = Infinity;
  let maxPop = -Infinity;
  let minState = null;
  let maxState = null;

  configStates.forEach(state => {
    const stateData = timelineData[state];
    if (stateData && stateData[year]) {
      const entry = stateData[year];
      
      yearData.totalStates++;
      yearData.totalElectoralVotes += entry.electoralVotes;
      totalEV += entry.electoralVotes;
      
      if (entry.population) {
        totalPop += entry.population;
        const popPerEV = entry.population / entry.electoralVotes;
        
        if (popPerEV < minPop) {
          minPop = popPerEV;
          minState = state;
        }
        if (popPerEV > maxPop) {
          maxPop = popPerEV;
          maxState = state;
        }
      }
      
      // Count party winners
      if (entry.party) {
        yearData.parties.winner[entry.party] = (yearData.parties.winner[entry.party] || 0) + entry.electoralVotes;
        yearData.parties.stateCount.winner[entry.party] = (yearData.parties.stateCount.winner[entry.party] || 0) + 1;
      }
    }
  });

  yearData.totalPopulation = totalPop > 0 ? totalPop : null;
  yearData.averagePopPerEV = totalPop > 0 ? totalPop / totalEV : null;
  yearData.minPopPerEV = minState ? { state: minState, value: minPop } : { state: null, value: null };
  yearData.maxPopPerEV = maxState ? { state: maxState, value: maxPop } : { state: null, value: null };

  // Find runner-up party
  const sortedParties = Object.entries(yearData.parties.winner)
    .sort(([,a], [,b]) => b - a);
  
  if (sortedParties.length > 1) {
    const runnerUpParty = sortedParties[1][0];
    const runnerUpEVs = sortedParties[1][1];
    yearData.parties.runnerUp[runnerUpParty] = runnerUpEVs;
    yearData.parties.stateCount.runnerUp[runnerUpParty] = yearData.parties.stateCount.winner[runnerUpParty] || 0;
  } else {
    yearData.parties.runnerUp = { Unknown: yearData.totalElectoralVotes };
    yearData.parties.stateCount.runnerUp = { Unknown: yearData.totalStates };
  }

  summaryData[year] = yearData;
  summaryFixCount++;
});

console.log(`Recalculated ${summaryFixCount} year summaries`);

// Save the corrected summary data
fs.writeFileSync('./src/data/yearSummaries.json', JSON.stringify(summaryData, null, 2));

console.log(`\nComprehensive fix complete!`);
console.log(`Total fixes applied: ${fixCount + summaryFixCount}`);
console.log(`Timeline fixes: ${fixCount}`);
console.log(`Summary recalculations: ${summaryFixCount}`);