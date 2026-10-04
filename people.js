(() => {
  'use strict';
  const catalog = window.STORY_CATALOG;
  const map = window.YECHEON_MAP;
  const $ = id => document.getElementById(id);
  const normalize = window.StorySearch.normalize;
  const places = new Map(map.sources.map(source => [source.sourceId, source]));
  const people = catalog.people.flatMap(person => {
    const place = places.get(person.id);
    return person.names.map(name => ({...person, label:name, memberName:name,
      count:catalog.episodes.filter(episode=>episode.sourceId===person.id && episode.names.includes(name)).length,
      region:place?.region || 'unknown', placeLabel:place?.placeLabel || '읍·면의 원문 근거 미확인',
      searchable:normalize([name, ...(person.aliases || [])].join(' '))
    })).filter(person=>person.count>0);
  });
  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }
  const total = people.length + '명의 인물 · ' + catalog.episodes.length + '편';
  $('directoryCount').append(node('strong', '', people.length + '명'), node('span', '', '인물 · 만화 ' + catalog.episodes.length + '편'));
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
    const query = normalize($('peopleSearch').value);
    const namedQuery = [...catalog.people, ...(catalog.excludedPeople || [])].flatMap(person => person.names).find(name => normalize(name) === query);
    const region = $('peopleRegion').value;
    const selected = people.filter(person => (!namedQuery || person.memberName === namedQuery) && (!region || person.region === region) && tokens.every(token => person.searchable.includes(token)));
    const cards = document.createDocumentFragment();
    selected.forEach(person => {
      const card = node('a', 'directory-person' + (!person.count ? ' no-stories' : ''));
      card.href = 'person.html?person=' + encodeURIComponent(person.id) + '&member=' + encodeURIComponent(person.memberName);
      card.setAttribute('aria-label', person.label + ', ' + person.count + '편, 인물 이야기 페이지 열기');
      const head = node('div', 'directory-person-heading');
      head.append(node('h2', '', person.label), node('span', 'directory-person-count', person.count + '편'));
      card.append(head, node('p', 'directory-place', person.placeLabel));
      if (person.names.length > 1) card.append(node('p', 'directory-joint', '공동 채록 · 이분의 경험으로 선별'));
      card.append(node('span', 'directory-person-link', person.count ? '이야기 읽기 →' : '선별 기록 보기 →'));
      cards.append(card);
    });
    $('directoryGrid').replaceChildren(cards);
    $('directoryResultCount').textContent = selected.length + '명의 인물';
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
