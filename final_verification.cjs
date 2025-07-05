const fs = require('fs');

// Load the current data
const timelineData = JSON.parse(fs.readFileSync('./src/data/stateTimelines.json', 'utf8'));
const configData = JSON.parse(fs.readFileSync('./src/data/config.json', 'utf8'));

let issues = [];
let fixes = 0;

console.log('Starting final comprehensive electoral data verification...\n');

// Function to find year entry in state timeline
function findYearEntry(state, year) {
  if (!timelineData[state] || !timelineData[state].timeline) {
    return null;
  }
  return timelineData[state].timeline.find(entry => entry.year === year);
}

// Function to check and report issues
function checkState(state, year, expectedWinner, expectedParty, expectedCandidate) {
  const entry = findYearEntry(state, year);
  
  if (!entry) {
    issues.push(`MISSING: ${state} ${year} - No data found`);
    return false;
  }

  let hasIssue = false;

  // Check winner candidate
  if (entry.winnerCandidate !== expectedCandidate) {
    issues.push(`CANDIDATE: ${state} ${year} - Expected "${expectedCandidate}", found "${entry.winnerCandidate}"`);
    hasIssue = true;
  }

  // Check party
  if (entry.winner !== expectedParty) {
    issues.push(`PARTY: ${state} ${year} - Expected "${expectedParty}", found "${entry.winner}"`);
    hasIssue = true;
  }

  return hasIssue;
}

// Function to fix issues
function fixState(state, year, expectedParty, expectedCandidate) {
  const entry = findYearEntry(state, year);
  
  if (!entry) {
    console.log(`Cannot fix ${state} ${year} - No data found`);
    return;
  }

  let changed = false;

  if (entry.winnerCandidate !== expectedCandidate) {
    console.log(`Fixing ${state} ${year}: Candidate "${entry.winnerCandidate}" → "${expectedCandidate}"`);
    entry.winnerCandidate = expectedCandidate;
    changed = true;
  }

  if (entry.winner !== expectedParty) {
    console.log(`Fixing ${state} ${year}: Party "${entry.winner}" → "${expectedParty}"`);
    entry.winner = expectedParty;
    entry.winnerColor = configData.partyColors[expectedParty] || '#808080';
    changed = true;
  }

  if (changed) fixes++;
}

// 1984 - Reagan landslide, Mondale won only Minnesota and DC
console.log('=== Checking 1984 Election ===');
Object.keys(timelineData).forEach(state => {
  if (state === 'Minnesota') {
    checkState(state, 1984, 'Walter Mondale', 'Democratic', 'Walter Mondale');
  } else if (state === 'District of Columbia') {
    checkState(state, 1984, 'Walter Mondale', 'Democratic', 'Walter Mondale');
  } else {
    // All other states should have gone to Reagan
    checkState(state, 1984, 'Ronald Reagan', 'Republican', 'Ronald Reagan');
  }
});

// 1968 - Check George Wallace states
console.log('\n=== Checking 1968 Election (George Wallace) ===');
const wallaceStates = ['Alabama', 'Arkansas', 'Georgia', 'Louisiana', 'Mississippi'];
wallaceStates.forEach(state => {
  checkState(state, 1968, 'George Wallace', 'American Independent', 'George Wallace');
});

// Check Humphrey states in 1968
const humphreyStates1968 = [
  'Connecticut', 'Hawaii', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 
  'Minnesota', 'New York', 'Pennsylvania', 'Rhode Island', 'Texas', 'Washington', 'West Virginia'
];
humphreyStates1968.forEach(state => {
  checkState(state, 1968, 'Hubert Humphrey', 'Democratic', 'Hubert Humphrey');
});

// Check some key Nixon states in 1968
const nixonStates1968Sample = [
  'California', 'Florida', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Missouri', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'North Carolina',
  'Ohio', 'Oklahoma', 'Oregon', 'South Carolina', 'Tennessee', 'Utah', 'Vermont',
  'Virginia', 'Wisconsin', 'Wyoming'
];
nixonStates1968Sample.forEach(state => {
  checkState(state, 1968, 'Richard Nixon', 'Republican', 'Richard Nixon');
});

// 2000 - Bush vs Gore (sampling key states)
console.log('\n=== Checking 2000 Election (Key States) ===');
checkState('Florida', 2000, 'George W. Bush', 'Republican', 'George W. Bush');
checkState('California', 2000, 'Al Gore', 'Democratic', 'Al Gore');
checkState('Texas', 2000, 'George W. Bush', 'Republican', 'George W. Bush');
checkState('New York', 2000, 'Al Gore', 'Democratic', 'Al Gore');
checkState('Pennsylvania', 2000, 'Al Gore', 'Democratic', 'Al Gore');
checkState('Illinois', 2000, 'Al Gore', 'Democratic', 'Al Gore');
checkState('Ohio', 2000, 'George W. Bush', 'Republican', 'George W. Bush');
checkState('Michigan', 2000, 'Al Gore', 'Democratic', 'Al Gore');

// 2020 - Biden vs Trump (sampling key states)
console.log('\n=== Checking 2020 Election (Key States) ===');
checkState('Georgia', 2020, 'Joe Biden', 'Democratic', 'Joe Biden');
checkState('Arizona', 2020, 'Joe Biden', 'Democratic', 'Joe Biden');
checkState('Pennsylvania', 2020, 'Joe Biden', 'Democratic', 'Joe Biden');
checkState('Michigan', 2020, 'Joe Biden', 'Democratic', 'Joe Biden');
checkState('Wisconsin', 2020, 'Joe Biden', 'Democratic', 'Joe Biden');
checkState('Nevada', 2020, 'Joe Biden', 'Democratic', 'Joe Biden');
checkState('Florida', 2020, 'Donald Trump', 'Republican', 'Donald Trump');
checkState('Texas', 2020, 'Donald Trump', 'Republican', 'Donald Trump');
checkState('Ohio', 2020, 'Donald Trump', 'Republican', 'Donald Trump');
checkState('North Carolina', 2020, 'Donald Trump', 'Republican', 'Donald Trump');

// Check some historical elections for obvious errors
console.log('\n=== Checking Historical Elections ===');

// 1789 - Washington unanimous
checkState('Virginia', 1789, 'George Washington', 'None', 'George Washington');
checkState('Massachusetts', 1789, 'George Washington', 'None', 'George Washington');
checkState('Pennsylvania', 1789, 'George Washington', 'None', 'George Washington');

// 1860 - Lincoln
checkState('Illinois', 1860, 'Abraham Lincoln', 'Republican', 'Abraham Lincoln');
checkState('New York', 1860, 'Abraham Lincoln', 'Republican', 'Abraham Lincoln');

// Report all issues found
console.log('\n=== VERIFICATION RESULTS ===');
if (issues.length === 0) {
  console.log('✅ No issues found in verified elections!');
} else {
  console.log(`❌ Found ${issues.length} issues:`);
  issues.forEach(issue => console.log(`  ${issue}`));
  
  console.log('\n=== APPLYING FIXES ===');
  
  // Apply fixes for 1984
  Object.keys(timelineData).forEach(state => {
    if (state === 'Minnesota') {
      fixState(state, 1984, 'Democratic', 'Walter Mondale');
    } else if (state === 'District of Columbia') {
      fixState(state, 1984, 'Democratic', 'Walter Mondale');
    } else {
      fixState(state, 1984, 'Republican', 'Ronald Reagan');
    }
  });

  // Apply fixes for 1968
  wallaceStates.forEach(state => {
    fixState(state, 1968, 'American Independent', 'George Wallace');
  });

  humphreyStates1968.forEach(state => {
    fixState(state, 1968, 'Democratic', 'Hubert Humphrey');
  });

  nixonStates1968Sample.forEach(state => {
    fixState(state, 1968, 'Republican', 'Richard Nixon');
  });

  // Apply key 2000 fixes
  fixState('Florida', 2000, 'Republican', 'George W. Bush');
  fixState('California', 2000, 'Democratic', 'Al Gore');
  fixState('Texas', 2000, 'Republican', 'George W. Bush');
  fixState('New York', 2000, 'Democratic', 'Al Gore');
  fixState('Pennsylvania', 2000, 'Democratic', 'Al Gore');
  fixState('Illinois', 2000, 'Democratic', 'Al Gore');
  fixState('Ohio', 2000, 'Republican', 'George W. Bush');
  fixState('Michigan', 2000, 'Democratic', 'Al Gore');

  // Apply key 2020 fixes
  fixState('Georgia', 2020, 'Democratic', 'Joe Biden');
  fixState('Arizona', 2020, 'Democratic', 'Joe Biden');
  fixState('Pennsylvania', 2020, 'Democratic', 'Joe Biden');
  fixState('Michigan', 2020, 'Democratic', 'Joe Biden');
  fixState('Wisconsin', 2020, 'Democratic', 'Joe Biden');
  fixState('Nevada', 2020, 'Democratic', 'Joe Biden');
  fixState('Florida', 2020, 'Republican', 'Donald Trump');
  fixState('Texas', 2020, 'Republican', 'Donald Trump');
  fixState('Ohio', 2020, 'Republican', 'Donald Trump');
  fixState('North Carolina', 2020, 'Republican', 'Donald Trump');

  // Fix historical
  fixState('Virginia', 1789, 'None', 'George Washington');
  fixState('Massachusetts', 1789, 'None', 'George Washington');
  fixState('Pennsylvania', 1789, 'None', 'George Washington');
  fixState('Illinois', 1860, 'Republican', 'Abraham Lincoln');
  fixState('New York', 1860, 'Republican', 'Abraham Lincoln');
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