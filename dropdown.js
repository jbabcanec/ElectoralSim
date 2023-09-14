document.addEventListener('DOMContentLoaded', () => {
  const dropdown = document.getElementById('year-selector');
  let currentYear = '2020';

  dropdown.addEventListener('change', () => {
    currentYear = dropdown.value;

    const oldScript = document.getElementById('sourceFile');
    if (oldScript) {
      oldScript.remove();
    }

    const newScript = document.createElement('script');
    newScript.id = 'sourceFile';
    newScript.src = `${currentYear}vote.js`;
    document.body.appendChild(newScript);
  });
});
