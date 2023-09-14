const partyColors2016 = {
  Clinton: '#0000FF', // Democrat (Blue)
  Trump: '#FF0000', // Republican (Red)
  "Spotted Eagle": '#00FF00', // Faith Spotted Eagle was an independent candidate; we'll assign Green
  Powell: '#00FF00', // Colin Powell was not officially a candidate; we'll assign Green
  Sanders: '#00FF00', // Bernie Sanders was running in the democratic party but we'll assign Green as he identifies as independent
  Paul: '#00FF00', // Rand Paul is a Republican but since it was a protest vote we'll assign Green
  Kasich: '#00FF00', // John Kasich is a Republican but since it was a protest vote we'll assign Green
};

if (window.updatePartyColors) {
  window.updatePartyColors(partyColors2016);
}

console.log('party2016.js script loaded');
