export function renderResourceHero(template, {
  eyebrow = 'Class Resources', title, description, image, variant = '',
  width = 1536, height = 1024, imageAlt = '', topics = [],
}, rootPrefix = '../') {
  const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;');
  const values = {
    eyebrow, title, description, image: rootPrefix + image,
    variant: variant ? ' ' + variant : '', width, height, imageAlt,
  };
  const topicList = topics.length
    ? '\n    <ul class="resource-hero-topics" aria-label="다루는 주제" role="list">' +
      topics.map(topic => '<li>' + escape(topic) + '</li>').join('') + '</ul>'
    : '';
  return template.replace(/\{\{(\w+)\}\}/g, (_, field) => field === 'topics' ? topicList : escape(values[field]));
}
