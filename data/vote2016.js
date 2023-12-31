const stateData2016 = {
  AL: { population: 4863300, electoralVotes: 9, votes: { Clinton: 0, Trump: 9 } },
  AK: { population: 741894, electoralVotes: 3, votes: { Clinton: 0, Trump: 3 } },
  AZ: { population: 6931071, electoralVotes: 11, votes: { Clinton: 0, Trump: 11 } },
  AR: { population: 2988248, electoralVotes: 6, votes: { Clinton: 0, Trump: 6 } },
  CA: { population: 39250017, electoralVotes: 55, votes: { Clinton: 55, Trump: 0 } },
  CO: { population: 5540545, electoralVotes: 9, votes: { Clinton: 9, Trump: 0 } },
  CT: { population: 3576452, electoralVotes: 7, votes: { Clinton: 7, Trump: 0 } },
  DE: { population: 952065, electoralVotes: 3, votes: { Clinton: 3, Trump: 0 } },
  DC: { population: 681170, electoralVotes: 3, votes: { Clinton: 3, Trump: 0 } },
  FL: { population: 20612439, electoralVotes: 29, votes: { Clinton: 0, Trump: 29 } },
  GA: { population: 10310371, electoralVotes: 16, votes: { Clinton: 0, Trump: 16 } },
  HI: { population: 1428557, electoralVotes: 4, votes: { Clinton: 3, Trump: 0, Sanders: 1 } },
  ID: { population: 1683140, electoralVotes: 4, votes: { Clinton: 0, Trump: 4 } },
  IL: { population: 12801539, electoralVotes: 20, votes: { Clinton: 20, Trump: 0 } },
  IN: { population: 6633053, electoralVotes: 11, votes: { Clinton: 0, Trump: 11 } },
  IA: { population: 3134693, electoralVotes: 6, votes: { Clinton: 0, Trump: 6 } },
  KS: { population: 2907289, electoralVotes: 6, votes: { Clinton: 0, Trump: 6 } },
  KY: { population: 4436974, electoralVotes: 8, votes: { Clinton: 0, Trump: 8 } },
  LA: { population: 4681666, electoralVotes: 8, votes: { Clinton: 0, Trump: 8 } },
  ME: { population: 1331479, electoralVotes: 4, votes: { Clinton: 3, Trump: 1 } },
  MD: { population: 6016447, electoralVotes: 10, votes: { Clinton: 10, Trump: 0 } },
  MA: { population: 6811779, electoralVotes: 11, votes: { Clinton: 11, Trump: 0 } },
  MI: { population: 9928300, electoralVotes: 16, votes: { Clinton: 0, Trump: 16 } },
  MN: { population: 5519952, electoralVotes: 10, votes: { Clinton: 10, Trump: 0 } },
  MS: { population: 2988726, electoralVotes: 6, votes: { Clinton: 0, Trump: 6 } },
  MO: { population: 6093000, electoralVotes: 10, votes: { Clinton: 0, Trump: 10 } },
  MT: { population: 1042520, electoralVotes: 3, votes: { Clinton: 0, Trump: 3 } },
  NE: { population: 1907116, electoralVotes: 5, votes: { Clinton: 0, Trump: 5 } },
  NV: { population: 2940058, electoralVotes: 6, votes: { Clinton: 6, Trump: 0 } },
  NH: { population: 1334795, electoralVotes: 4, votes: { Clinton: 4, Trump: 0 } },
  NJ: { population: 8944469, electoralVotes: 14, votes: { Clinton: 14, Trump: 0 } },
  NM: { population: 2081015, electoralVotes: 5, votes: { Clinton: 5, Trump: 0 } },
  NY: { population: 19745289, electoralVotes: 29, votes: { Clinton: 29, Trump: 0 } },
  NC: { population: 10146788, electoralVotes: 15, votes: { Clinton: 0, Trump: 15 } },
  ND: { population: 757953, electoralVotes: 3, votes: { Clinton: 0, Trump: 3 } },
  OH: { population: 11614373, electoralVotes: 18, votes: { Clinton: 0, Trump: 18 } },
  OK: { population: 3923561, electoralVotes: 7, votes: { Clinton: 0, Trump: 7 } },
  OR: { population: 4093465, electoralVotes: 7, votes: { Clinton: 7, Trump: 0 } },
  PA: { population: 12784227, electoralVotes: 20, votes: { Clinton: 0, Trump: 20 } },
  RI: { population: 1056426, electoralVotes: 4, votes: { Clinton: 4, Trump: 0 } },
  SC: { population: 4961119, electoralVotes: 9, votes: { Clinton: 0, Trump: 9 } },
  SD: { population: 865454, electoralVotes: 3, votes: { Clinton: 0, Trump: 3 } },
  TN: { population: 6651194, electoralVotes: 11, votes: { Clinton: 0, Trump: 11 } },
  TX: { population: 27862596, electoralVotes: 38, votes: { Clinton: 0, Trump: 36, Paul: 1, Kasich: 1 } },
  UT: { population: 3051217, electoralVotes: 6, votes: { Clinton: 0, Trump: 6 } },
  VT: { population: 624594, electoralVotes: 3, votes: { Clinton: 3, Trump: 0 } },
  VA: { population: 8411808, electoralVotes: 13, votes: { Clinton: 13, Trump: 0 } },
  WA: { population: 7288000, electoralVotes: 12, votes: { Clinton: 8, Trump: 0, Powell: 3, "Spotted Eagle": 1 } },
  WV: { population: 1831102, electoralVotes: 5, votes: { Clinton: 0, Trump: 5 } },
  WI: { population: 5778708, electoralVotes: 10, votes: { Clinton: 0, Trump: 10 } },
  WY: { population: 585501, electoralVotes: 3, votes: { Clinton: 0, Trump: 3 } },
};

window.stateData2016 = stateData2016;

if (window.updateStateData) {
  window.updateStateData(stateData2016);
}

console.log('vote2016.js script loaded');
