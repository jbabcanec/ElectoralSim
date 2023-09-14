document.addEventListener('DOMContentLoaded', () => {
  // Ensure to link this script after the vote2020.js script in your HTML file to have access to the stateData object
  document.querySelectorAll('.state path, #dc-circle').forEach(element => {
    element.addEventListener('click', () => {
      // Get the state abbreviation from the element's data attribute
      const stateAbbreviation = element.getAttribute('data-state');
      const stateInfo = stateData[stateAbbreviation];

      if (stateInfo) {
        // Populate the side panel with the state data
        document.getElementById('state-name').textContent = stateAbbreviation;
        document.getElementById('population').textContent = `Population: ${stateInfo.population.toLocaleString()}`;
        document.getElementById('electoral-votes').textContent = `Electoral Votes: ${stateInfo.electoralVotes}`;
        
        // Get the candidate names and votes from the state data and create a formatted string
        const votesText = Object.entries(stateInfo.votes)
          .map(([candidate, votes]) => `${candidate}: ${votes}`)
          .join(', ');

        document.getElementById('votes').textContent = `Votes: ${votesText}`;
      } else {
        // Populate the side panel with 'No Data' for US territories
        document.getElementById('state-name').textContent = 'No Data';
        document.getElementById('population').textContent = 'No Data';
        document.getElementById('electoral-votes').textContent = 'No Data';
        document.getElementById('votes').textContent = 'No Data';
      }
    });
  });
});
