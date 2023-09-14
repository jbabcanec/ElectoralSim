function updateStateData(newData) {
  stateData = newData;
  console.log('State data updated');
}

function setupYearChangeListener() {
  document.getElementById('election-year').addEventListener('change', () => {
    const selectedYear = document.getElementById('election-year').value;
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
});
