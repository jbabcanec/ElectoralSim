let stateData = {};
let selectedState = null;

function updateStatePanel() {
  if (selectedState) {
    const stateInfo = stateData[selectedState];
    
    if (stateInfo) {
      document.getElementById('state-name').textContent = selectedState;
      document.getElementById('population').textContent = `Population: ${stateInfo.population.toLocaleString()}`;
      document.getElementById('electoral-votes').textContent = `Electoral Votes: ${stateInfo.electoralVotes}`;
      
      const votesText = Object.entries(stateInfo.votes)
        .map(([candidate, votes]) => `${candidate}: ${votes}`)
        .join(', ');

      document.getElementById('votes').textContent = `Votes: ${votesText}`;
    } else {
      document.getElementById('state-name').textContent = 'No Data';
      document.getElementById('population').textContent = 'No Data';
      document.getElementById('electoral-votes').textContent = 'No Data';
      document.getElementById('votes').textContent = 'No Data';
    }
  }
}

function updateSummaryPanel() {
  const totalVotes = {};

  for (const stateInfo of Object.values(stateData)) {
    for (const [candidate, votes] of Object.entries(stateInfo.votes)) {
      totalVotes[candidate] = (totalVotes[candidate] || 0) + votes;
    }
  }

  const summaryPanel = document.getElementById('summary-panel');
  summaryPanel.innerHTML = '<h2>Summary Stats</h2>';

  for (const [candidate, votes] of Object.entries(totalVotes)) {
    if (votes > 0) {
      const p = document.createElement('p');
      p.textContent = `Total Votes (${candidate}): ${votes}`;
      summaryPanel.appendChild(p);
    }
  }
}

function setupClickListener() {
  document.querySelectorAll('.state path, #dc-circle').forEach(element => {
    element.addEventListener('click', () => {
      selectedState = element.getAttribute('data-state');
      updateStatePanel();
      updateSummaryPanel();
    });
  });
}

document.addEventListener('DOMContentLoaded', setupClickListener);
