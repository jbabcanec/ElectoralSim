const stateData2020 = {
  AL: { population: 5024279, electoralVotes: 9, votes: { Biden: 0, Trump: 9 } },
  AK: { population: 731545, electoralVotes: 3, votes: { Biden: 0, Trump: 3 } },
  AZ: { population: 7151502, electoralVotes: 11, votes: { Biden: 11, Trump: 0 } },
  AR: { population: 3011524, electoralVotes: 6, votes: { Biden: 0, Trump: 6 } },
  CA: { population: 39538223, electoralVotes: 55, votes: { Biden: 55, Trump: 0 } },
  CO: { population: 5773714, electoralVotes: 9, votes: { Biden: 9, Trump: 0 } },
  CT: { population: 3605944, electoralVotes: 7, votes: { Biden: 7, Trump: 0 } },
  DE: { population: 989948, electoralVotes: 3, votes: { Biden: 3, Trump: 0 } },
  DC: { population: 689545, electoralVotes: 3, votes: { Biden: 3, Trump: 0 } },
  FL: { population: 21538187, electoralVotes: 29, votes: { Biden: 0, Trump: 29 } },
  GA: { population: 10711908, electoralVotes: 16, votes: { Biden: 16, Trump: 0 } },
  HI: { population: 1455271, electoralVotes: 4, votes: { Biden: 4, Trump: 0 } },
  ID: { population: 1839106, electoralVotes: 4, votes: { Biden: 0, Trump: 4 } },
  IL: { population: 12812508, electoralVotes: 20, votes: { Biden: 20, Trump: 0 } },
  IN: { population: 6785528, electoralVotes: 11, votes: { Biden: 0, Trump: 11 } },
  IA: { population: 3190369, electoralVotes: 6, votes: { Biden: 0, Trump: 6 } },
  KS: { population: 2937880, electoralVotes: 6, votes: { Biden: 0, Trump: 6 } },
  KY: { population: 4505836, electoralVotes: 8, votes: { Biden: 0, Trump: 8 } },
  LA: { population: 4657757, electoralVotes: 8, votes: { Biden: 0, Trump: 8 } },
  ME: { population: 1362359, electoralVotes: 4, votes: { Biden: 3, Trump: 1 } }, // Maine splits its votes
  MD: { population: 6177224, electoralVotes: 10, votes: { Biden: 10, Trump: 0 } },
  MA: { population: 7029917, electoralVotes: 11, votes: { Biden: 11, Trump: 0 } },
  MI: { population: 10077331, electoralVotes: 16, votes: { Biden: 16, Trump: 0 } },
  MN: { population: 5706494, electoralVotes: 10, votes: { Biden: 10, Trump: 0 } },
  MS: { population: 2963914, electoralVotes: 6, votes: { Biden: 0, Trump: 6 } },
  MO: { population: 6154913, electoralVotes: 10, votes: { Biden: 0, Trump: 10 } },
  MT: { population: 1084225, electoralVotes: 3, votes: { Biden: 0, Trump: 3 } },
  NE: { population: 1961504, electoralVotes: 5, votes: { Biden: 1, Trump: 4 } }, // Nebraska splits its votes
  NV: { population: 3104614, electoralVotes: 6, votes: { Biden: 6, Trump: 0 } },
  NH: { population: 1371246, electoralVotes: 4, votes: { Biden: 4, Trump: 0 } },
  NJ: { population: 9288994, electoralVotes: 14, votes: { Biden: 14, Trump: 0 } },
  NM: { population: 2117522, electoralVotes: 5, votes: { Biden: 5, Trump: 0 } },
  NY: { population: 20201249, electoralVotes: 29, votes: { Biden: 29, Trump: 0 } },
  NC: { population: 10439388, electoralVotes: 15, votes: { Biden: 0, Trump: 15 } },
  ND: { population: 779094, electoralVotes: 3, votes: { Biden: 0, Trump: 3 } },
  OH: { population: 11799448, electoralVotes: 18, votes: { Biden: 0, Trump: 18 } },
  OK: { population: 3959353, electoralVotes: 7, votes: { Biden: 0, Trump: 7 } },
  OR: { population: 4237256, electoralVotes: 7, votes: { Biden: 7, Trump: 0 } },
  PA: { population: 13002700, electoralVotes: 20, votes: { Biden: 20, Trump: 0 } },
  RI: { population: 1097379, electoralVotes: 4, votes: { Biden: 4, Trump: 0 } },
  SC: { population: 5118425, electoralVotes: 9, votes: { Biden: 0, Trump: 9 } },
  SD: { population: 886667, electoralVotes: 3, votes: { Biden: 0, Trump: 3 } },
  TN: { population: 6910840, electoralVotes: 11, votes: { Biden: 0, Trump: 11 } },
  TX: { population: 29145505, electoralVotes: 38, votes: { Biden: 0, Trump: 38 } },
  UT: { population: 3271616, electoralVotes: 6, votes: { Biden: 0, Trump: 6 } },
  VT: { population: 643077, electoralVotes: 3, votes: { Biden: 3, Trump: 0 } },
  VA: { population: 8631393, electoralVotes: 13, votes: { Biden: 13, Trump: 0 } },
  WA: { population: 7705281, electoralVotes: 12, votes: { Biden: 12, Trump: 0 } },
  WV: { population: 1793716, electoralVotes: 5, votes: { Biden: 0, Trump: 5 } },
  WI: { population: 5893718, electoralVotes: 10, votes: { Biden: 10, Trump: 0 } },
  WY: { population: 576851, electoralVotes: 3, votes: { Biden: 0, Trump: 3 } },
};

window.stateData2020 = stateData2020;

if (window.updateStateData) {
  window.updateStateData(stateData2020);
}

console.log('vote2020.js script loaded');
