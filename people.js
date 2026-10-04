(() => {
  'use strict';
  const catalog = window.STORY_CATALOG;
  const map = window.YECHEON_MAP;
  const $ = id => document.getElementById(id);
  const normalize = window.StorySearch.normalize;
  const places = new Map(map.sources.map(source => [source.sourceId, source]));
  const counts = new Map();
  catalog.episodes.forEach(episode => counts.set(episode.sourceId, (counts.get(episode.sourceId) || 0) + 1));
  const people = catalog.people.map(person => {
    const place = places.get(person.id);
    return {...person, count: counts.get(person.id) || 0, region: place?.region || 'unknown', placeLabel: place?.placeLabel || '읍·면의 원문 근거 미확인', searchable: normalize([person.label, ...(person.names || []), ...(person.aliases || [])].join(' '))};
  });
  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }
  const total = people.length + '건의 채록 · ' + catalog.episodes.length + '편';
  $('directoryCount').append(node('strong', '', people.length + '건'), node('span', '', '채록 · 만화 ' + catalog.episodes.length + '편'));
  $('directoryFooterCount').textContent = total;
  map.regions.forEach(region => {
    const option = node('option', '', region.name);
    option.value = region.name;
    $('peopleRegion').append(option);
  });
  const unknown = node('option', '', '지역 미확인');
  unknown.value = 'unknown';
  $('peopleRegion').append(unknown);
  function render() {
    const tokens = $('peopleSearch').value.trim().split(/\s+/).map(normalize).filter(Boolean);
    const region = $('peopleRegion').value;
    const selected = people.filter(person => (!region || person.region === region) && tokens.every(token => person.searchable.includes(token)));
    const cards = document.createDocumentFragment();
    selected.forEach(person => {
      const card = node('a', 'directory-person' + (!person.count ? ' no-stories' : ''));
      card.href = 'person.html?person=' + encodeURIComponent(person.id);
      card.setAttribute('aria-label', person.label + ', ' + person.count + '편, 인물 이야기 페이지 열기');
      const head = node('div', 'directory-person-heading');
      head.append(node('h2', '', person.label), node('span', 'directory-person-count', person.count + '편'));
      card.append(head, node('p', 'directory-place', person.placeLabel));
      if (person.names.length > 1) card.append(node('p', 'directory-joint', '공동 채록'));
      card.append(node('span', 'directory-person-link', person.count ? '이야기 읽기 →' : '선별 기록 보기 →'));
      cards.append(card);
    });
    $('directoryGrid').replaceChildren(cards);
    $('directoryResultCount').textContent = selected.length + '건의 채록';
    $('directoryEmpty').hidden = selected.length !== 0;
  }
  $('peopleSearch').addEventListener('input', render);
  $('peopleRegion').addEventListener('change', render);
  $('peopleReset').addEventListener('click', () => {
    $('peopleSearch').value = '';
    $('peopleRegion').value = '';
    render();
  });
  render();
})();
