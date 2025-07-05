const fs = require('fs');

// Load the current data
const timelineData = JSON.parse(fs.readFileSync('./src/data/stateTimelines.json', 'utf8'));
const configData = JSON.parse(fs.readFileSync('./src/data/config.json', 'utf8'));

// Historical electoral data verification - this will be built systematically
// Starting with key elections that are well documented

const historicalCorrections = {
  // 1789 - First election, Washington unanimous
  1789: {
    // All electors voted for Washington, no formal parties yet
    correctResults: {
      'Delaware': { winner: 'George Washington', party: 'None', evs: 3 },
      'Pennsylvania': { winner: 'George Washington', party: 'None', evs: 10 },
      'New Jersey': { winner: 'George Washington', party: 'None', evs: 6 },
      'Georgia': { winner: 'George Washington', party: 'None', evs: 5 },
      'Connecticut': { winner: 'George Washington', party: 'None', evs: 7 },
      'Massachusetts': { winner: 'George Washington', party: 'None', evs: 10 },
      'Maryland': { winner: 'George Washington', party: 'None', evs: 6 },
      'South Carolina': { winner: 'George Washington', party: 'None', evs: 7 },
      'New Hampshire': { winner: 'George Washington', party: 'None', evs: 5 },
      'Virginia': { winner: 'George Washington', party: 'None', evs: 10 }
    }
  },
  
  // 1792 - Washington's second term
  1792: {
    correctResults: {
      'Delaware': { winner: 'George Washington', party: 'None', evs: 3 },
      'Pennsylvania': { winner: 'George Washington', party: 'None', evs: 15 },
      'New Jersey': { winner: 'George Washington', party: 'None', evs: 7 },
      'Georgia': { winner: 'George Washington', party: 'None', evs: 4 },
      'Connecticut': { winner: 'George Washington', party: 'None', evs: 9 },
      'Massachusetts': { winner: 'George Washington', party: 'None', evs: 16 },
      'Maryland': { winner: 'George Washington', party: 'None', evs: 8 },
      'South Carolina': { winner: 'George Washington', party: 'None', evs: 8 },
      'New Hampshire': { winner: 'George Washington', party: 'None', evs: 6 },
      'Virginia': { winner: 'George Washington', party: 'None', evs: 21 },
      'New York': { winner: 'George Washington', party: 'None', evs: 12 },
      'North Carolina': { winner: 'George Washington', party: 'None', evs: 12 },
      'Rhode Island': { winner: 'George Washington', party: 'None', evs: 4 },
      'Vermont': { winner: 'George Washington', party: 'None', evs: 3 },
      'Kentucky': { winner: 'George Washington', party: 'None', evs: 4 }
    }
  },

  // 2020 - Most recent, well-documented
  2020: {
    correctResults: {
      'Alabama': { winner: 'Donald Trump', party: 'Republican', evs: 9 },
      'Alaska': { winner: 'Donald Trump', party: 'Republican', evs: 3 },
      'Arizona': { winner: 'Joe Biden', party: 'Democratic', evs: 11 },
      'Arkansas': { winner: 'Donald Trump', party: 'Republican', evs: 6 },
      'California': { winner: 'Joe Biden', party: 'Democratic', evs: 55 },
      'Colorado': { winner: 'Joe Biden', party: 'Democratic', evs: 9 },
      'Connecticut': { winner: 'Joe Biden', party: 'Democratic', evs: 7 },
      'Delaware': { winner: 'Joe Biden', party: 'Democratic', evs: 3 },
      'District of Columbia': { winner: 'Joe Biden', party: 'Democratic', evs: 3 },
      'Florida': { winner: 'Donald Trump', party: 'Republican', evs: 29 },
      'Georgia': { winner: 'Joe Biden', party: 'Democratic', evs: 16 },
      'Hawaii': { winner: 'Joe Biden', party: 'Democratic', evs: 4 },
      'Idaho': { winner: 'Donald Trump', party: 'Republican', evs: 4 },
      'Illinois': { winner: 'Joe Biden', party: 'Democratic', evs: 20 },
      'Indiana': { winner: 'Donald Trump', party: 'Republican', evs: 11 },
      'Iowa': { winner: 'Donald Trump', party: 'Republican', evs: 6 },
      'Kansas': { winner: 'Donald Trump', party: 'Republican', evs: 6 },
      'Kentucky': { winner: 'Donald Trump', party: 'Republican', evs: 8 },
      'Louisiana': { winner: 'Donald Trump', party: 'Republican', evs: 8 },
      'Maine': { winner: 'Joe Biden', party: 'Democratic', evs: 4 }, // Maine splits, but overall Biden
      'Maryland': { winner: 'Joe Biden', party: 'Democratic', evs: 10 },
      'Massachusetts': { winner: 'Joe Biden', party: 'Democratic', evs: 11 },
      'Michigan': { winner: 'Joe Biden', party: 'Democratic', evs: 16 },
      'Minnesota': { winner: 'Joe Biden', party: 'Democratic', evs: 10 },
      'Mississippi': { winner: 'Donald Trump', party: 'Republican', evs: 6 },
      'Missouri': { winner: 'Donald Trump', party: 'Republican', evs: 10 },
      'Montana': { winner: 'Donald Trump', party: 'Republican', evs: 3 },
      'Nebraska': { winner: 'Donald Trump', party: 'Republican', evs: 5 }, // Nebraska splits, but overall Trump
      'Nevada': { winner: 'Joe Biden', party: 'Democratic', evs: 6 },
      'New Hampshire': { winner: 'Joe Biden', party: 'Democratic', evs: 4 },
      'New Jersey': { winner: 'Joe Biden', party: 'Democratic', evs: 14 },
      'New Mexico': { winner: 'Joe Biden', party: 'Democratic', evs: 5 },
      'New York': { winner: 'Joe Biden', party: 'Democratic', evs: 29 },
      'North Carolina': { winner: 'Donald Trump', party: 'Republican', evs: 15 },
      'North Dakota': { winner: 'Donald Trump', party: 'Republican', evs: 3 },
      'Ohio': { winner: 'Donald Trump', party: 'Republican', evs: 18 },
      'Oklahoma': { winner: 'Donald Trump', party: 'Republican', evs: 7 },
      'Oregon': { winner: 'Joe Biden', party: 'Democratic', evs: 7 },
      'Pennsylvania': { winner: 'Joe Biden', party: 'Democratic', evs: 20 },
      'Rhode Island': { winner: 'Joe Biden', party: 'Democratic', evs: 4 },
      'South Carolina': { winner: 'Donald Trump', party: 'Republican', evs: 9 },
      'South Dakota': { winner: 'Donald Trump', party: 'Republican', evs: 3 },
      'Tennessee': { winner: 'Donald Trump', party: 'Republican', evs: 11 },
      'Texas': { winner: 'Donald Trump', party: 'Republican', evs: 38 },
      'Utah': { winner: 'Donald Trump', party: 'Republican', evs: 6 },
      'Vermont': { winner: 'Joe Biden', party: 'Democratic', evs: 3 },
      'Virginia': { winner: 'Joe Biden', party: 'Democratic', evs: 13 },
      'Washington': { winner: 'Joe Biden', party: 'Democratic', evs: 12 },
      'West Virginia': { winner: 'Donald Trump', party: 'Republican', evs: 5 },
      'Wisconsin': { winner: 'Joe Biden', party: 'Democratic', evs: 10 },
      'Wyoming': { winner: 'Donald Trump', party: 'Republican', evs: 3 }
    }
  },

  // 1968 - George Wallace election (already partially fixed)
  1968: {
    correctResults: {
      'Alabama': { winner: 'George Wallace', party: 'American Independent', evs: 10 },
      'Arkansas': { winner: 'George Wallace', party: 'American Independent', evs: 6 },
      'Georgia': { winner: 'George Wallace', party: 'American Independent', evs: 12 },
      'Louisiana': { winner: 'George Wallace', party: 'American Independent', evs: 10 },
      'Mississippi': { winner: 'George Wallace', party: 'American Independent', evs: 7 },
      'Alaska': { winner: 'Richard Nixon', party: 'Republican', evs: 3 },
      'Arizona': { winner: 'Richard Nixon', party: 'Republican', evs: 5 },
      'California': { winner: 'Richard Nixon', party: 'Republican', evs: 40 },
      'Colorado': { winner: 'Richard Nixon', party: 'Republican', evs: 6 },
      'Delaware': { winner: 'Richard Nixon', party: 'Republican', evs: 3 },
      'Florida': { winner: 'Richard Nixon', party: 'Republican', evs: 14 },
      'Hawaii': { winner: 'Hubert Humphrey', party: 'Democratic', evs: 4 },
      'Idaho': { winner: 'Richard Nixon', party: 'Republican', evs: 4 },
      'Illinois': { winner: 'Richard Nixon', party: 'Republican', evs: 26 },
      'Indiana': { winner: 'Richard Nixon', party: 'Republican', evs: 13 },
      'Iowa': { winner: 'Richard Nixon', party: 'Republican', evs: 8 },
      'Kansas': { winner: 'Richard Nixon', party: 'Republican', evs: 7 },
      'Kentucky': { winner: 'Richard Nixon', party: 'Republican', evs: 9 },
      'Maine': { winner: 'Hubert Humphrey', party: 'Democratic', evs: 4 },
      'Maryland': { winner: 'Hubert Humphrey', party: 'Democratic', evs: 10 },
      'Massachusetts': { winner: 'Hubert Humphrey', party: 'Democratic', evs: 14 },
      'Michigan': { winner: 'Hubert Humphrey', party: 'Democratic', evs: 21 },
      'Minnesota': { winner: 'Hubert Humphrey', party: 'Democratic', evs: 10 },
      'Missouri': { winner: 'Richard Nixon', party: 'Republican', evs: 12 },
      'Montana': { winner: 'Richard Nixon', party: 'Republican', evs: 4 },
      'Nebraska': { winner: 'Richard Nixon', party: 'Republican', evs: 5 },
      'Nevada': { winner: 'Richard Nixon', party: 'Republican', evs: 3 },
      'New Hampshire': { winner: 'Richard Nixon', party: 'Republican', evs: 4 },
      'New Jersey': { winner: 'Richard Nixon', party: 'Republican', evs: 17 },
      'New Mexico': { winner: 'Richard Nixon', party: 'Republican', evs: 4 },
      'New York': { winner: 'Hubert Humphrey', party: 'Democratic', evs: 43 },
      'North Carolina': { winner: 'Richard Nixon', party: 'Republican', evs: 12 }, // One elector was faithless
      'North Dakota': { winner: 'Richard Nixon', party: 'Republican', evs: 4 },
      'Ohio': { winner: 'Richard Nixon', party: 'Republican', evs: 26 },
      'Oklahoma': { winner: 'Richard Nixon', party: 'Republican', evs: 8 },
      'Oregon': { winner: 'Richard Nixon', party: 'Republican', evs: 6 },
      'Pennsylvania': { winner: 'Hubert Humphrey', party: 'Democratic', evs: 29 },
      'Rhode Island': { winner: 'Hubert Humphrey', party: 'Democratic', evs: 4 },
      'South Carolina': { winner: 'Richard Nixon', party: 'Republican', evs: 8 },
      'South Dakota': { winner: 'Richard Nixon', party: 'Republican', evs: 4 },
      'Tennessee': { winner: 'Richard Nixon', party: 'Republican', evs: 11 },
      'Texas': { winner: 'Hubert Humphrey', party: 'Democratic', evs: 25 },
      'Utah': { winner: 'Richard Nixon', party: 'Republican', evs: 4 },
      'Vermont': { winner: 'Richard Nixon', party: 'Republican', evs: 3 },
      'Virginia': { winner: 'Richard Nixon', party: 'Republican', evs: 12 },
      'Washington': { winner: 'Hubert Humphrey', party: 'Democratic', evs: 9 },
      'West Virginia': { winner: 'Hubert Humphrey', party: 'Democratic', evs: 7 },
      'Wisconsin': { winner: 'Richard Nixon', party: 'Republican', evs: 12 },
      'Wyoming': { winner: 'Richard Nixon', party: 'Republican', evs: 3 },
      'Connecticut': { winner: 'Hubert Humphrey', party: 'Democratic', evs: 8 }
    }
  },

  // 2000 - Bush v Gore, well documented
  2000: {
    correctResults: {
      'Alabama': { winner: 'George W. Bush', party: 'Republican', evs: 9 },
      'Alaska': { winner: 'George W. Bush', party: 'Republican', evs: 3 },
      'Arizona': { winner: 'George W. Bush', party: 'Republican', evs: 8 },
      'Arkansas': { winner: 'George W. Bush', party: 'Republican', evs: 6 },
      'California': { winner: 'Al Gore', party: 'Democratic', evs: 54 },
      'Colorado': { winner: 'George W. Bush', party: 'Republican', evs: 8 },
      'Connecticut': { winner: 'Al Gore', party: 'Democratic', evs: 8 },
      'Delaware': { winner: 'Al Gore', party: 'Democratic', evs: 3 },
      'District of Columbia': { winner: 'Al Gore', party: 'Democratic', evs: 3 }, // But had faithless elector
      'Florida': { winner: 'George W. Bush', party: 'Republican', evs: 25 },
      'Georgia': { winner: 'George W. Bush', party: 'Republican', evs: 13 },
      'Hawaii': { winner: 'Al Gore', party: 'Democratic', evs: 4 },
      'Idaho': { winner: 'George W. Bush', party: 'Republican', evs: 4 },
      'Illinois': { winner: 'Al Gore', party: 'Democratic', evs: 22 },
      'Indiana': { winner: 'George W. Bush', party: 'Republican', evs: 12 },
      'Iowa': { winner: 'Al Gore', party: 'Democratic', evs: 7 },
      'Kansas': { winner: 'George W. Bush', party: 'Republican', evs: 6 },
      'Kentucky': { winner: 'George W. Bush', party: 'Republican', evs: 8 },
      'Louisiana': { winner: 'George W. Bush', party: 'Republican', evs: 9 },
      'Maine': { winner: 'Al Gore', party: 'Democratic', evs: 4 },
      'Maryland': { winner: 'Al Gore', party: 'Democratic', evs: 10 },
      'Massachusetts': { winner: 'Al Gore', party: 'Democratic', evs: 12 },
      'Michigan': { winner: 'Al Gore', party: 'Democratic', evs: 18 },
      'Minnesota': { winner: 'Al Gore', party: 'Democratic', evs: 10 },
      'Mississippi': { winner: 'George W. Bush', party: 'Republican', evs: 7 },
      'Missouri': { winner: 'George W. Bush', party: 'Republican', evs: 11 },
      'Montana': { winner: 'George W. Bush', party: 'Republican', evs: 3 },
      'Nebraska': { winner: 'George W. Bush', party: 'Republican', evs: 5 },
      'Nevada': { winner: 'George W. Bush', party: 'Republican', evs: 4 },
      'New Hampshire': { winner: 'George W. Bush', party: 'Republican', evs: 4 },
      'New Jersey': { winner: 'Al Gore', party: 'Democratic', evs: 15 },
      'New Mexico': { winner: 'Al Gore', party: 'Democratic', evs: 5 },
      'New York': { winner: 'Al Gore', party: 'Democratic', evs: 33 },
      'North Carolina': { winner: 'George W. Bush', party: 'Republican', evs: 14 },
      'North Dakota': { winner: 'George W. Bush', party: 'Republican', evs: 3 },
      'Ohio': { winner: 'George W. Bush', party: 'Republican', evs: 21 },
      'Oklahoma': { winner: 'George W. Bush', party: 'Republican', evs: 8 },
      'Oregon': { winner: 'Al Gore', party: 'Democratic', evs: 7 },
      'Pennsylvania': { winner: 'Al Gore', party: 'Democratic', evs: 23 },
      'Rhode Island': { winner: 'Al Gore', party: 'Democratic', evs: 4 },
      'South Carolina': { winner: 'George W. Bush', party: 'Republican', evs: 8 },
      'South Dakota': { winner: 'George W. Bush', party: 'Republican', evs: 3 },
      'Tennessee': { winner: 'George W. Bush', party: 'Republican', evs: 11 },
      'Texas': { winner: 'George W. Bush', party: 'Republican', evs: 32 },
      'Utah': { winner: 'George W. Bush', party: 'Republican', evs: 5 },
      'Vermont': { winner: 'Al Gore', party: 'Democratic', evs: 3 },
      'Virginia': { winner: 'George W. Bush', party: 'Republican', evs: 13 },
      'Washington': { winner: 'Al Gore', party: 'Democratic', evs: 11 },
      'West Virginia': { winner: 'George W. Bush', party: 'Republican', evs: 5 },
      'Wisconsin': { winner: 'Al Gore', party: 'Democratic', evs: 11 },
      'Wyoming': { winner: 'George W. Bush', party: 'Republican', evs: 3 }
    }
  }
};

let corrections = 0;

console.log('Starting comprehensive electoral data verification...');

// Function to verify and correct data for a specific year
function verifyYear(year) {
  if (!historicalCorrections[year]) {
    console.log(`No verification data available for ${year}`);
    return;
  }

  const correctResults = historicalCorrections[year].correctResults;
  let yearCorrections = 0;

  Object.keys(correctResults).forEach(state => {
    if (timelineData[state] && timelineData[state][year]) {
      const current = timelineData[state][year];
      const correct = correctResults[state];
      
      // Check if winner candidate matches
      if (current.winnerCandidate !== correct.winner) {
        console.log(`${state} ${year}: Winner candidate "${current.winnerCandidate}" → "${correct.winner}"`);
        current.winnerCandidate = correct.winner;
        yearCorrections++;
      }
      
      // Check if party matches
      if (current.winner !== correct.party) {
        console.log(`${state} ${year}: Party "${current.winner}" → "${correct.party}"`);
        current.winner = correct.party;
        current.winnerColor = configData.partyColors[correct.party] || '#808080';
        yearCorrections++;
      }
      
      // Check if electoral votes match
      if (current.electoralVotes !== correct.evs) {
        console.log(`${state} ${year}: Electoral votes ${current.electoralVotes} → ${correct.evs}`);
        current.electoralVotes = correct.evs;
        current.winnerEV = correct.evs;
        yearCorrections++;
      }
    }
  });

  console.log(`Year ${year}: ${yearCorrections} corrections made`);
  corrections += yearCorrections;
}

// Verify the years we have data for
[1789, 1792, 1968, 2000, 2020].forEach(year => {
  verifyYear(year);
});

console.log(`\nTotal corrections made: ${corrections}`);

// Save the corrected data
if (corrections > 0) {
  fs.writeFileSync('./src/data/stateTimelines.json', JSON.stringify(timelineData, null, 2));
  console.log('Corrected data saved to stateTimelines.json');
} else {
  console.log('No corrections needed');
}