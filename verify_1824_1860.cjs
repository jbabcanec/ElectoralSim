const fs = require('fs');

// Load the current data
const timelineData = JSON.parse(fs.readFileSync('./src/data/stateTimelines.json', 'utf8'));
const configData = JSON.parse(fs.readFileSync('./src/data/config.json', 'utf8'));

let issues = [];
let fixes = 0;

console.log('Verifying Pre-Civil War Electoral Data (1824-1860)...\n');

// Function to find year entry in state timeline
function findYearEntry(state, year) {
  if (!timelineData[state] || !timelineData[state].timeline) {
    return null;
  }
  return timelineData[state].timeline.find(entry => entry.year === year);
}

// Function to check and report issues
function checkState(state, year, expectedParty, expectedCandidate) {
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

// 1824 - John Quincy Adams won via House of Representatives
console.log('=== Checking 1824 Election ===');
// Adams won New England states
const adamsStates1824 = ['Massachusetts', 'Connecticut', 'Rhode Island', 'Vermont', 'New Hampshire', 'Maine'];
adamsStates1824.forEach(state => {
  checkState(state, 1824, 'Democratic-Republican', 'John Quincy Adams');
});

// Jackson won most Southern and Western states
const jacksonStates1824 = ['Tennessee', 'Alabama', 'Mississippi', 'Indiana', 'Illinois'];
jacksonStates1824.forEach(state => {
  checkState(state, 1824, 'Democratic-Republican', 'Andrew Jackson');
});

// Crawford won Virginia, Georgia, Delaware
const crawfordStates1824 = ['Virginia', 'Georgia', 'Delaware'];
crawfordStates1824.forEach(state => {
  checkState(state, 1824, 'Democratic-Republican', 'William Crawford');
});

// Clay won Kentucky, Ohio, Missouri
const clayStates1824 = ['Kentucky', 'Ohio', 'Missouri'];
clayStates1824.forEach(state => {
  checkState(state, 1824, 'Democratic-Republican', 'Henry Clay');
});

// 1856 - Buchanan vs Fremont vs Fillmore
console.log('\n=== Checking 1856 Election ===');
// Buchanan (Democrat) won most states
const buchananStates1856 = [
  'Alabama', 'Arkansas', 'California', 'Delaware', 'Florida', 'Georgia', 
  'Illinois', 'Indiana', 'Kentucky', 'Louisiana', 'Mississippi', 'Missouri', 
  'New Jersey', 'North Carolina', 'Pennsylvania', 'South Carolina', 'Tennessee', 
  'Texas', 'Virginia'
];
buchananStates1856.forEach(state => {
  checkState(state, 1856, 'Democratic', 'James Buchanan');
});

// Fremont (Republican) won Northern states
const fremontStates1856 = [
  'Connecticut', 'Iowa', 'Maine', 'Massachusetts', 'Michigan', 'New Hampshire', 
  'New York', 'Ohio', 'Rhode Island', 'Vermont', 'Wisconsin'
];
fremontStates1856.forEach(state => {
  checkState(state, 1856, 'Republican', 'John Fremont');
});

// Fillmore (Know-Nothing) won only Maryland
checkState('Maryland', 1856, 'American', 'Millard Fillmore');

// 1860 - Lincoln vs Douglas vs Breckinridge vs Bell
console.log('\n=== Checking 1860 Election ===');
// Lincoln (Republican) won all free states
const lincolnStates1860 = [
  'California', 'Connecticut', 'Illinois', 'Indiana', 'Iowa', 'Maine', 
  'Massachusetts', 'Michigan', 'Minnesota', 'New Hampshire', 'New York', 
  'Ohio', 'Oregon', 'Pennsylvania', 'Rhode Island', 'Vermont', 'Wisconsin'
];
lincolnStates1860.forEach(state => {
  checkState(state, 1860, 'Republican', 'Abraham Lincoln');
});

// Breckinridge (Southern Democrat) won Deep South
const breckinridgeStates1860 = [
  'Alabama', 'Arkansas', 'Delaware', 'Florida', 'Georgia', 'Louisiana', 
  'Maryland', 'Mississippi', 'North Carolina', 'South Carolina', 'Texas'
];
breckinridgeStates1860.forEach(state => {
  checkState(state, 1860, 'Democratic', 'John Breckinridge');
});

// Bell (Constitutional Union) won border states
const bellStates1860 = ['Kentucky', 'Tennessee', 'Virginia'];
bellStates1860.forEach(state => {
  checkState(state, 1860, 'Constitutional Union', 'John Bell');
});

// Douglas (Northern Democrat) won Missouri and New Jersey
checkState('Missouri', 1860, 'Democratic', 'Stephen Douglas');
checkState('New Jersey', 1860, 'Democratic', 'Stephen Douglas');

// Additional key elections to verify
console.log('\n=== Checking Other Key Elections 1824-1860 ===');

// 1828 - Jackson's revenge
checkState('Tennessee', 1828, 'Democratic', 'Andrew Jackson');
checkState('New York', 1828, 'Democratic', 'Andrew Jackson');
checkState('Massachusetts', 1828, 'National Republican', 'John Quincy Adams');

// 1840 - "Tippecanoe and Tyler too"
checkState('Ohio', 1840, 'Whig', 'William Henry Harrison');
checkState('Indiana', 1840, 'Whig', 'William Henry Harrison');
checkState('Virginia', 1840, 'Democratic', 'Martin Van Buren');

// 1844 - Polk's victory
checkState('Tennessee', 1844, 'Democratic', 'James Polk');
checkState('New York', 1844, 'Democratic', 'James Polk');
checkState('Kentucky', 1844, 'Whig', 'Henry Clay');

// Report all issues found
console.log('\n=== VERIFICATION RESULTS ===');
if (issues.length === 0) {
  console.log('✅ No issues found in Pre-Civil War elections!');
} else {
  console.log(`❌ Found ${issues.length} issues:`);
  issues.forEach(issue => console.log(`  ${issue}`));
  
  console.log('\n=== APPLYING FIXES ===');
  
  // Apply fixes for 1824
  adamsStates1824.forEach(state => {
    fixState(state, 1824, 'Democratic-Republican', 'John Quincy Adams');
  });
  
  jacksonStates1824.forEach(state => {
    fixState(state, 1824, 'Democratic-Republican', 'Andrew Jackson');
  });
  
  crawfordStates1824.forEach(state => {
    fixState(state, 1824, 'Democratic-Republican', 'William Crawford');
  });
  
  clayStates1824.forEach(state => {
    fixState(state, 1824, 'Democratic-Republican', 'Henry Clay');
  });

  // Apply fixes for 1856
  buchananStates1856.forEach(state => {
    fixState(state, 1856, 'Democratic', 'James Buchanan');
  });
  
  fremontStates1856.forEach(state => {
    fixState(state, 1856, 'Republican', 'John Fremont');
  });
  
  fixState('Maryland', 1856, 'American', 'Millard Fillmore');

  // Apply fixes for 1860
  lincolnStates1860.forEach(state => {
    fixState(state, 1860, 'Republican', 'Abraham Lincoln');
  });
  
  breckinridgeStates1860.forEach(state => {
    fixState(state, 1860, 'Democratic', 'John Breckinridge');
  });
  
  bellStates1860.forEach(state => {
    fixState(state, 1860, 'Constitutional Union', 'John Bell');
  });
  
  fixState('Missouri', 1860, 'Democratic', 'Stephen Douglas');
  fixState('New Jersey', 1860, 'Democratic', 'Stephen Douglas');

  // Apply other fixes
  fixState('Tennessee', 1828, 'Democratic', 'Andrew Jackson');
  fixState('New York', 1828, 'Democratic', 'Andrew Jackson');
  fixState('Massachusetts', 1828, 'National Republican', 'John Quincy Adams');
  
  fixState('Ohio', 1840, 'Whig', 'William Henry Harrison');
  fixState('Indiana', 1840, 'Whig', 'William Henry Harrison');
  fixState('Virginia', 1840, 'Democratic', 'Martin Van Buren');
  
  fixState('Tennessee', 1844, 'Democratic', 'James Polk');
  fixState('New York', 1844, 'Democratic', 'James Polk');
  fixState('Kentucky', 1844, 'Whig', 'Henry Clay');
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