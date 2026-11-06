(() => {
  function render(axes) {
    const graph = document.getElementById('axisGraph');
    graph.replaceChildren();
    for (const { a, b, pctA } of axes) {
      const row = document.createElement('div');
      row.className = 'axis-row';
      const labels = document.createElement('div');
      labels.className = 'axis-labels';
      const bar = document.createElement('div');
      bar.className = 'axis-bar';
      bar.setAttribute('aria-hidden', 'true');
      for (const [index, [letter, pct]] of [[a, pctA], [b, 100 - pctA]].entries()) {
        const label = document.createElement('span');
        label.textContent = letter + ' ' + pct + '%';
        labels.append(label);
        const segment = document.createElement('div');
        segment.className = index === 0 ? 'seg-a' : 'seg-b';
        segment.style.flexBasis = pct + '%';
        bar.append(segment);
      }
      row.append(labels, bar);
      graph.append(row);
    }
  }
  window.eduMbtiGraph = { render };
})();
