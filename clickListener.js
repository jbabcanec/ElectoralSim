let stateData = {};
let selectedState = null;
let viewOption = "Default";  // New addition: Variable to store the current view option


function removePreviousFill() {
  document.querySelectorAll('.state path, #dc-circle').forEach(element => {
    element.style.fill = "";
    element.removeAttribute('fill');
  });
}

function updateStateColors() {
  const existingPatterns = document.querySelectorAll('pattern');
  existingPatterns.forEach(pattern => pattern.remove());

  let partyColors = (window.partyColors2020 || window.partyColors2016) || {};

  const svgElement = document.querySelector("svg");
  const defs = svgElement.querySelector("defs") || document.createElementNS("http://www.w3.org/2000/svg", "defs");
  svgElement.appendChild(defs);

  Object.keys(stateData).forEach(state => {
    const stateInfo = stateData[state];
    const selector = state === 'DC' ? 'circle[data-state="DC"]' : `path[data-state="${state}"]`;
    const stateElement = document.querySelector(selector);
    let patternIdToUse = null;
    let color;

    if (stateInfo && stateElement) {
      if (viewOption === "Electoral Votes") {
        let maxVotes = 0;
        let winningCandidate = "";

        for (const [candidate, votes] of Object.entries(stateInfo.votes)) {
          if (votes > maxVotes) {
            maxVotes = votes;
            winningCandidate = candidate;
          }
        }
        color = partyColors[winningCandidate] || "#D0D0D0";

        if (Object.keys(stateInfo.votes).length > 1) {
          patternIdToUse = `pattern${state}`;
          const newPattern = createMixedPattern(patternIdToUse, stateInfo.votes, partyColors);
          defs.appendChild(newPattern);
        }
      } else {
        color = "#D0D0D0";
      }

      stateElement.setAttribute("data-original-color", color);

      if (patternIdToUse) {
        stateElement.setAttribute("fill", `url(#${patternIdToUse})`);
      } else {
        stateElement.style.fill = color;
      }

      stateElement.addEventListener("mouseenter", function() {
        if (viewOption === "Electoral Votes") {
          this.style.fill = shadeColor(color, -40);
        } else {
          this.style.fill = "#800080";
        }
      });

      stateElement.addEventListener("mouseleave", function() {
        const originalColor = this.getAttribute("data-original-color");
        this.style.fill = originalColor;
      });
    }
  });

  if (viewOption === "Electoral Votes" && stateData['DC']) {
    const dcElement = document.querySelector('circle[data-state="DC"]');
    const dcInfo = stateData['DC'];
    const dcMaxVotes = Math.max(...Object.values(dcInfo.votes));
    const dcWinningCandidate = Object.keys(dcInfo.votes).find(candidate => dcInfo.votes[candidate] === dcMaxVotes);
    const dcColor = partyColors[dcWinningCandidate] || "#D0D0D0";
    dcElement.style.fill = dcColor;
  }
}

// Function to darken or lighten a color
function shadeColor(color, percent) {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = parseInt(R * (100 + percent) / 100);
  G = parseInt(G * (100 + percent) / 100);
  B = parseInt(B * (100 + percent) / 100);

  R = (R < 255) ? R : 255;
  G = (G < 255) ? G : 255;
  B = (B < 255) ? B : 255;

  const RR = ((R.toString(16).length === 1) ? "0" + R.toString(16) : R.toString(16));
  const GG = ((G.toString(16).length === 1) ? "0" + G.toString(16) : G.toString(16));
  const BB = ((B.toString(16).length === 1) ? "0" + B.toString(16) : B.toString(16));

  return "#" + RR + GG + BB;
}

function createMixedPattern(id, votesInfo, partyColors) {
  const pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
  pattern.setAttribute("id", id);
  pattern.setAttribute("patternUnits", "userSpaceOnUse");
  pattern.setAttribute("width", "10");
  pattern.setAttribute("height", "10");

  let yOffset = 0;
  const totalVotes = Object.values(votesInfo).reduce((a, b) => a + b, 0);

  for (const [candidate, votes] of Object.entries(votesInfo)) {
    const rectHeight = (votes / totalVotes) * 10;
    const color = partyColors[candidate];

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", "0");
    rect.setAttribute("y", yOffset.toString());
    rect.setAttribute("width", "10");
    rect.setAttribute("height", rectHeight.toString());
    rect.setAttribute("fill", color);

    yOffset += rectHeight;
    pattern.appendChild(rect);
  }

  return pattern;
}

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

function setupViewOptionListener() {
  const viewOptions = document.querySelectorAll('input[name="view"]');
  viewOptions.forEach(option => {
    option.addEventListener("change", function() {
      // Remove previous fills or patterns
      removePreviousFill();
      // Update the view option
      viewOption = this.value;
      // Update the state colors
      updateStateColors();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupClickListener();
  // New addition: Call the function to set up the view option listener
  setupViewOptionListener();
});