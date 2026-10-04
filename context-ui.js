(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  function node(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function referenceKey(reference) {
    return [reference.sourceFile, reference.paragraph, reference.quote].join('\u0000');
  }
  function references(items) {
    const seen = new Set();
    return items.filter(reference => {
      const key = referenceKey(reference);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).map(reference => {
      const block = node('div', 'evidence');
      block.append(node('cite', '', [reference.sourceFile, reference.paragraph, reference.speaker, reference.time].filter(Boolean).join(' · ')), node('blockquote', '', reference.quote));
      return block;
    });
  }
  function renderProfile(person, memberName) {
    const profile = window.STORY_CONTEXT?.profiles[person.id];
    const metadata = $('personMetadata'), biography = $('personBiography');
    if (!profile || !metadata || !biography) return;
    const facts = [], biographies = [], allReferences = [];
    for (const member of profile.members.filter(member => (!memberName || member.name === memberName) && window.STORY_CATALOG.episodes.some(episode => episode.sourceId === person.id && episode.names.includes(member.name)))) {
      const group = node('div', 'profile-facts');
      if (profile.members.length > 1) group.append(node('strong', 'profile-facts-name', member.name));
      const list = node('dl', 'profile-facts-list');
      for (const [label, value] of [['성별', member.gender], ['나이', member.age]]) {
        const item = node('div', 'profile-fact');
        item.append(node('dt', '', label), node('dd', '', value));
        list.append(item);
      }
      group.append(list);
      facts.push(group);
      const section = node('section', 'biography-member');
      if (profile.members.length > 1) section.append(node('h3', '', member.name));
      section.append(...member.biography.map(text => node('p', '', text)));
      biographies.push(section);
      allReferences.push(...member.evidence);
    }
    metadata.replaceChildren(...facts);
    metadata.hidden = false;
    const heading = node('h2', '', '삶의 발자취');
    const ageNote = node('p', 'profile-basis', '나이는 채록 당시의 기록을 기준으로 표시했습니다. 출생 연도만 확인되는 경우에는 기준 연도의 만 나이 범위를 적었습니다.');
    const evidence = node('details', 'profile-evidence');
    evidence.append(node('summary', '', '인물 정보와 생애사 근거'));
    if (profile.note) evidence.append(node('p', 'profile-basis profile-caveat', profile.note));
    evidence.append(...references(allReferences));
    biography.replaceChildren(heading, ...biographies, ageNote);
    biography.append(evidence);
    biography.hidden = false;
  }
  function renderEpisode(episode) {
    const context = window.STORY_CONTEXT?.episodes[episode.id];
    const container = $('readerContext');
    if (!container) return;
    container.replaceChildren();
    container.hidden = !context;
    if (!context) return;
    for (const [heading, paragraphs] of [['이야기의 배경', context.background], ['장면 해설', context.commentary]]) {
      const section = node('section', 'reader-context-section');
      section.append(node('h3', '', heading), ...paragraphs.map(text => node('p', '', text)));
      container.append(section);
    }
    const original = new Set(episode.evidence.map(referenceKey));
    const extra = context.evidence.filter(reference => !original.has(referenceKey(reference)));
    if (extra.length) {
      $('evidenceList').append(node('p', 'context-evidence-heading', '배경과 해설의 원문 근거'), ...references(extra));
    }
  }
  window.StoryContextUI = {renderProfile, renderEpisode};
})();
