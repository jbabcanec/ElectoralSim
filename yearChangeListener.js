function updatePartyColors(year) {
  if (year === '2016') {
    const script = document.createElement('script');
    script.src = 'data/party2016.js';  // Updated path
    document.head.appendChild(script);
  } else if (year === '2020') {
    const script = document.createElement('script');
    script.src = 'data/party2020.js';  // Updated path
    document.head.appendChild(script);
  }
}


function updateStateData(newData) {
  stateData = newData;
  console.log('State data updated');
  updateSummaryPanel();
  updateStatePanel();
}

function setupYearChangeListener() {
  document.getElementById('election-year').addEventListener('change', () => {
    const selectedYear = document.getElementById('election-year').value;
    // New addition: Update party colors when the year changes
    updatePartyColors(selectedYear);

    if (selectedYear === '2020') {
      updateStateData(window.stateData2020);
    } else if (selectedYear === '2016') {
      updateStateData(window.stateData2016);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupYearChangeListener();
  updateStateData(window.stateData2020); // Set initial data to 2020 data
  // New addition: Set initial party colors to 2020
  updatePartyColors('2020');
});
