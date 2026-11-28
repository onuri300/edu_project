export function renderResourceHero(template, {
  eyebrow = 'ONURI / CLASS RESOURCES', title, description, image, variant = '',
  width = 1536, height = 1024, imageAlt = '', topics = [],
}, rootPrefix = '../') {
  const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;');
  const values = {
    eyebrow, title, description,
    variant: variant ? ' ' + variant : '',
  };
  const images = Array.isArray(image) ? image : [image];
  const art = '<div class="resource-hero-art' + (images.length > 1 ? ' resource-hero-art-strip' : '') + '">\n    ' +
    images.map(path => '<img class="page-art resource-hero-image" data-page-image src="' +
      escape(rootPrefix + path) + '" width="' + escape(width) + '" height="' + escape(height) +
      '" decoding="async" alt="' + escape(imageAlt) + '">').join('\n    ') + '\n  </div>';
  const topicList = topics.length
    ? '\n<ul class="resource-hero-topics content-frame" aria-label="다루는 주제" role="list">' +
      topics.map(topic => '<li>' + escape(topic) + '</li>').join('') + '</ul>'
    : '';
  const markup = { art, topics: topicList };
  return template.replace(/\{\{(\w+)\}\}/g, (_, field) => markup[field] ?? escape(values[field]));
}
