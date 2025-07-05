const fs = require('fs');

// Load the current data
const timelineData = JSON.parse(fs.readFileSync('./src/data/stateTimelines.json', 'utf8'));
const configData = JSON.parse(fs.readFileSync('./src/data/config.json', 'utf8'));

let issues = [];
let fixes = 0;

console.log('Starting comprehensive electoral data verification...\n');

// Function to check and report issues
function checkState(state, year, expectedWinner, expectedParty, expectedEVs, expectedCandidate) {
  if (!timelineData[state] || !timelineData[state][year]) {
    issues.push(`MISSING: ${state} ${year} - No data found`);
    return;
  }

  const current = timelineData[state][year];
  let hasIssue = false;

  // Check winner candidate
  if (current.winnerCandidate !== expectedCandidate) {
    issues.push(`CANDIDATE: ${state} ${year} - Expected "${expectedCandidate}", found "${current.winnerCandidate}"`);
    hasIssue = true;
  }

  // Check party
  if (current.winner !== expectedParty) {
    issues.push(`PARTY: ${state} ${year} - Expected "${expectedParty}", found "${current.winner}"`);
    hasIssue = true;
  }

  // Check electoral votes
  if (current.electoralVotes !== expectedEVs) {
    issues.push(`EVS: ${state} ${year} - Expected ${expectedEVs}, found ${current.electoralVotes}`);
    hasIssue = true;
  }

  return hasIssue;
}

// Function to fix issues
function fixState(state, year, expectedWinner, expectedParty, expectedEVs, expectedCandidate) {
  if (!timelineData[state] || !timelineData[state][year]) {
    console.log(`Cannot fix ${state} ${year} - No data found`);
    return;
  }

  const current = timelineData[state][year];
  let changed = false;

  if (current.winnerCandidate !== expectedCandidate) {
    console.log(`Fixing ${state} ${year}: Candidate "${current.winnerCandidate}" → "${expectedCandidate}"`);
    current.winnerCandidate = expectedCandidate;
    changed = true;
  }

  if (current.winner !== expectedParty) {
    console.log(`Fixing ${state} ${year}: Party "${current.winner}" → "${expectedParty}"`);
    current.winner = expectedParty;
    current.winnerColor = configData.partyColors[expectedParty] || '#808080';
    changed = true;
  }

  if (current.electoralVotes !== expectedEVs) {
    console.log(`Fixing ${state} ${year}: EVs ${current.electoralVotes} → ${expectedEVs}`);
    current.electoralVotes = expectedEVs;
    current.winnerEV = expectedEVs;
    // Recalculate population per EV
    if (current.population) {
      current.populationPerEV = current.population / expectedEVs;
    }
    changed = true;
  }

  if (changed) fixes++;
}

// 1984 - Reagan landslide, Mondale won only Minnesota and DC
console.log('=== Checking 1984 Election ===');
// Check that Mondale only won Minnesota and DC
const states1984 = Object.keys(timelineData);
states1984.forEach(state => {
  if (timelineData[state][1984]) {
    if (state === 'Minnesota') {
      checkState(state, 1984, 'Walter Mondale', 'Democratic', 10, 'Walter Mondale');
    } else if (state === 'District of Columbia') {
      checkState(state, 1984, 'Walter Mondale', 'Democratic', 3, 'Walter Mondale');
    } else {
      // All other states should have gone to Reagan
      checkState(state, 1984, 'Ronald Reagan', 'Republican', timelineData[state][1984].electoralVotes, 'Ronald Reagan');
    }
  }
});

// 1968 - Check George Wallace states
console.log('\n=== Checking 1968 Election (George Wallace) ===');
const wallaceStates = ['Alabama', 'Arkansas', 'Georgia', 'Louisiana', 'Mississippi'];
wallaceStates.forEach(state => {
  const evs = timelineData[state][1968] ? timelineData[state][1968].electoralVotes : 0;
  checkState(state, 1968, 'George Wallace', 'American Independent', evs, 'George Wallace');
});

// Check that Nixon won the remaining states (except those that went to Humphrey)
const humphreyStates1968 = [
  'Connecticut', 'Hawaii', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 
  'Minnesota', 'New York', 'Pennsylvania', 'Rhode Island', 'Texas', 'Washington', 'West Virginia'
];
const nixonStates1968 = Object.keys(timelineData).filter(state => 
  !wallaceStates.includes(state) && 
  !humphreyStates1968.includes(state) && 
  state !== 'District of Columbia' &&
  timelineData[state][1968]
);

nixonStates1968.forEach(state => {
  const evs = timelineData[state][1968] ? timelineData[state][1968].electoralVotes : 0;
  checkState(state, 1968, 'Richard Nixon', 'Republican', evs, 'Richard Nixon');
});

humphreyStates1968.forEach(state => {
  const evs = timelineData[state][1968] ? timelineData[state][1968].electoralVotes : 0;
  checkState(state, 1968, 'Hubert Humphrey', 'Democratic', evs, 'Hubert Humphrey');
});

// 2000 - Bush vs Gore
console.log('\n=== Checking 2000 Election ===');
const bushStates2000 = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'Colorado', 'Florida', 'Georgia', 
  'Idaho', 'Indiana', 'Kansas', 'Kentucky', 'Louisiana', 'Mississippi', 'Missouri', 
  'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'North Carolina', 'North Dakota', 
  'Ohio', 'Oklahoma', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 
  'Utah', 'Virginia', 'West Virginia', 'Wyoming'
];
const goreStates2000 = [
  'California', 'Connecticut', 'Delaware', 'District of Columbia', 'Hawaii', 
  'Illinois', 'Iowa', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 
  'Minnesota', 'New Jersey', 'New Mexico', 'New York', 'Oregon', 'Pennsylvania', 
  'Rhode Island', 'Vermont', 'Washington', 'Wisconsin'
];

bushStates2000.forEach(state => {
  const evs = timelineData[state][2000] ? timelineData[state][2000].electoralVotes : 0;
  checkState(state, 2000, 'George W. Bush', 'Republican', evs, 'George W. Bush');
});

goreStates2000.forEach(state => {
  const evs = timelineData[state][2000] ? timelineData[state][2000].electoralVotes : 0;
  checkState(state, 2000, 'Al Gore', 'Democratic', evs, 'Al Gore');
});

// 2020 - Biden vs Trump
console.log('\n=== Checking 2020 Election ===');
const bidenStates2020 = [
  'Arizona', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District of Columbia',
  'Georgia', 'Hawaii', 'Illinois', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'Oregon', 'Pennsylvania', 'Rhode Island', 'Vermont', 'Virginia', 'Washington', 'Wisconsin'
];
const trumpStates2020 = [
  'Alabama', 'Alaska', 'Arkansas', 'Florida', 'Idaho', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Mississippi', 'Missouri', 'Montana',
  'Nebraska', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'South Carolina',
  'South Dakota', 'Tennessee', 'Texas', 'Utah', 'West Virginia', 'Wyoming'
];

bidenStates2020.forEach(state => {
  const evs = timelineData[state][2020] ? timelineData[state][2020].electoralVotes : 0;
  checkState(state, 2020, 'Joe Biden', 'Democratic', evs, 'Joe Biden');
});

trumpStates2020.forEach(state => {
  const evs = timelineData[state][2020] ? timelineData[state][2020].electoralVotes : 0;
  checkState(state, 2020, 'Donald Trump', 'Republican', evs, 'Donald Trump');
});

// Report all issues found
console.log('\n=== VERIFICATION RESULTS ===');
if (issues.length === 0) {
  console.log('✅ No issues found in verified elections!');
} else {
  console.log(`❌ Found ${issues.length} issues:`);
  issues.forEach(issue => console.log(`  ${issue}`));
  
  console.log('\n=== APPLYING FIXES ===');
  
  // Apply fixes for 1984
  states1984.forEach(state => {
    if (timelineData[state][1984]) {
      if (state === 'Minnesota') {
        fixState(state, 1984, 'Walter Mondale', 'Democratic', 10, 'Walter Mondale');
      } else if (state === 'District of Columbia') {
        fixState(state, 1984, 'Walter Mondale', 'Democratic', 3, 'Walter Mondale');
      } else {
        const evs = timelineData[state][1984].electoralVotes;
        fixState(state, 1984, 'Ronald Reagan', 'Republican', evs, 'Ronald Reagan');
      }
    }
  });

  // Apply fixes for 1968
  wallaceStates.forEach(state => {
    const evs = timelineData[state][1968] ? timelineData[state][1968].electoralVotes : 0;
    fixState(state, 1968, 'George Wallace', 'American Independent', evs, 'George Wallace');
  });

  nixonStates1968.forEach(state => {
    const evs = timelineData[state][1968] ? timelineData[state][1968].electoralVotes : 0;
    fixState(state, 1968, 'Richard Nixon', 'Republican', evs, 'Richard Nixon');
  });

  humphreyStates1968.forEach(state => {
    const evs = timelineData[state][1968] ? timelineData[state][1968].electoralVotes : 0;
    fixState(state, 1968, 'Hubert Humphrey', 'Democratic', evs, 'Hubert Humphrey');
  });

  // Apply fixes for 2000
  bushStates2000.forEach(state => {
    const evs = timelineData[state][2000] ? timelineData[state][2000].electoralVotes : 0;
    fixState(state, 2000, 'George W. Bush', 'Republican', evs, 'George W. Bush');
  });

  goreStates2000.forEach(state => {
    const evs = timelineData[state][2000] ? timelineData[state][2000].electoralVotes : 0;
    fixState(state, 2000, 'Al Gore', 'Democratic', evs, 'Al Gore');
  });

  // Apply fixes for 2020
  bidenStates2020.forEach(state => {
    const evs = timelineData[state][2020] ? timelineData[state][2020].electoralVotes : 0;
    fixState(state, 2020, 'Joe Biden', 'Democratic', evs, 'Joe Biden');
  });

  trumpStates2020.forEach(state => {
    const evs = timelineData[state][2020] ? timelineData[state][2020].electoralVotes : 0;
    fixState(state, 2020, 'Donald Trump', 'Republican', evs, 'Donald Trump');
  });
}

console.log(`\n=== SUMMARY ===`);
console.log(`Issues found: ${issues.length}`);
console.log(`Fixes applied: ${fixes}`);

// Save the corrected data
if (fixes > 0) {
  fs.writeFileSync('./src/data/stateTimelines.json', JSON.stringify(timelineData, null, 2));
  console.log('✅ Corrected data saved to stateTimelines.json');
} else {
  console.log('✅ No fixes needed - data is accurate');
}