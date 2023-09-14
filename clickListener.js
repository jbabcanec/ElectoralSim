let stateData = {};

function setupClickListener() {
  document.querySelectorAll('.state path, #dc-circle').forEach(element => {
    element.addEventListener('click', () => {
      const stateAbbreviation = element.getAttribute('data-state');
      const stateInfo = stateData[stateAbbreviation];
      
      if (stateInfo) {
        document.getElementById('state-name').textContent = stateAbbreviation;
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
    });
  });
}

document.addEventListener('DOMContentLoaded', setupClickListener);
