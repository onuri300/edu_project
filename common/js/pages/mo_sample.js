(() => {
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  window.renderCodingSample = (container, entry) => {
    container.replaceChildren();
    const explanation = element('section', 'manual-sample-explanation');
    explanation.append(element('h3', '', '영역별 설명'));
    const definitions = element('dl');
    explanation.append(definitions);

    const figure = element('figure', 'manual-sample-figure');
    const preview = element('div', 'manual-sample-screen');
    figure.append(element('figcaption', '', '템플릿 미리보기'), preview);
    for (const [index, [kind, label, lines, description, image]] of entry.areas.entries()) {
      const number = String(index + 1);
      definitions.append(element('dt', '', number + '. ' + label), element('dd', '', description));
      const region = element('div', 'sample-region sample-' + kind);
      region.append(element('span', 'sample-number', number));
      const content = element('div', 'sample-region-content');
      lines.forEach((line, position) => {
        const heading = position === 0 && ['header', 'hero', 'body'].includes(kind);
        content.append(element(heading ? 'strong' : 'span', '', line));
      });
      region.append(content);
      if (image) {
        const artwork = element('img');
        artwork.src = new URL(image, window.eduAuth.root).href;
        artwork.alt = '';
        region.append(artwork);
      }
      preview.append(region);
    }
    container.append(explanation, figure);
  };
})();
