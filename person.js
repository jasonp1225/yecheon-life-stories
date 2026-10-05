(() => {
  'use strict';

  const catalog = window.STORY_CATALOG;
  const map = window.YECHEON_MAP;
  const $ = id => document.getElementById(id);
  const requestedId = new URLSearchParams(window.location.search).get('person');
  const requestedMember = new URLSearchParams(window.location.search).get('member');
  const sourcePerson = catalog.people.find(item => item.id === requestedId);
  const person = sourcePerson && (!requestedMember || sourcePerson.names.includes(requestedMember)) ? sourcePerson : null;
  const memberName = person?.names.includes(requestedMember) ? requestedMember : '';
  const displayedNames = person?.names || [];
  const displayName = memberName || displayedNames.join(' · ');
  const episodes = person ? catalog.episodes.filter(item => item.sourceId === person.id && (!memberName || item.names.includes(memberName))) : [];
  let readingIndex = -1;
  let lastTrigger = null;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function makeCard(episode, index) {
    const card = element('article', 'story');
    card.dataset.story = episode.id;
    const imageButton = element('button', 'image-button');
    imageButton.type = 'button';
    imageButton.setAttribute('aria-label', episode.title + ' 크게 읽기');
    const image = element('img');
    image.src = episode.image;
    image.alt = episode.names.join(' · ') + '의 「' + episode.title + '」 4컷 만화';
    image.loading = 'lazy';
    image.decoding = 'async';
    image.width = episode.width;
    image.height = episode.height;
    imageButton.append(image);
    imageButton.addEventListener('click', () => openReader(index, imageButton));

    const text = element('div', 'card-text');
    const metadata = element('div', 'card-meta');
    metadata.append(element('span', 'topic-label', episode.topics[0]), element('span', '', episode.displayPerson || episode.names.join(' · ')));
    const title = element('button', 'card-title', episode.title);
    title.type = 'button';
    title.addEventListener('click', () => openReader(index, title));
    text.append(metadata, title, element('p', '', episode.message));
    card.append(imageButton, text);
    return card;
  }

  function openReader(index, trigger) {
    const episode = episodes[index];
    if (!episode) return;
    readingIndex = index;
    if (trigger) lastTrigger = trigger;
    $('readerTitle').textContent = episode.title;
    $('readerPerson').textContent = episode.sourceLabel;
    $('readerTopic').textContent = episode.topics.join(' · ');
    $('readerMessage').textContent = episode.message;
    $('readerImage').src = episode.image;
    $('readerImage').alt = episode.names.join(' · ') + '의 「' + episode.title + '」 4컷 만화';
    $('downloadImage').href = episode.image;
    $('downloadImage').download = episode.title + '.png';
    $('sourceFile').textContent = episode.sourceFiles.join(' · ');
    $('evidenceList').replaceChildren(...episode.evidence.map(reference => {
      const block = element('div', 'evidence');
      const citation = [
        ...(episode.sourceFiles.length > 1 ? [reference.sourceFile] : []),
        reference.paragraph, reference.speaker, reference.time
      ].filter(Boolean).join(' · ');
      block.append(element('cite', '', citation), element('blockquote', '', reference.quote));
      return block;
    }));
    window.StoryContextUI?.renderEpisode(episode);
    $('readerPosition').textContent = (index + 1) + ' / ' + episodes.length;
    $('previousStory').disabled = index === 0;
    $('nextStory').disabled = index === episodes.length - 1;
    if (!$('reader').open) $('reader').showModal();
    $('reader').scrollTop = 0;
  }

  $('closeReader').addEventListener('click', () => $('reader').close());
  $('reader').addEventListener('close', () => lastTrigger?.focus());
  $('reader').addEventListener('click', event => {
    if (event.target !== $('reader')) return;
    const bounds = $('reader').getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) $('reader').close();
  });
  $('previousStory').addEventListener('click', () => openReader(readingIndex - 1));
  $('nextStory').addEventListener('click', () => openReader(readingIndex + 1));
  $('reader').addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      openReader(readingIndex + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });

  if (!person) {
    document.title = '인물을 찾을 수 없습니다 · 예천의 장면들';
    $('personTitle').textContent = '인물을 찾을 수 없습니다';
    $('storiesHeading').hidden = true;
    $('empty').hidden = false;
    $('emptyTitle').textContent = '선택한 인물 정보가 없습니다.';
    $('emptyText').textContent = '주소가 바뀌었거나 인물이 선택되지 않았습니다. 지도로 돌아가 이름을 다시 선택해 주세요.';
    return;
  }

  document.title = displayName + ' · 예천의 장면들';
  $('personTitle').textContent = displayName;
  window.StoryContextUI?.renderProfile(person, memberName);
  $('storiesHeading').textContent = !memberName && displayedNames.length > 1 ? '함께 들려준 이야기' : '이분의 이야기';
  $('personCount').append(element('strong', '', episodes.length ? episodes.length + '편' : '인물 소개'), element('span', '', episodes.length ? '선별한 이야기' : '채록에 남은 삶'));
  $('storyCount').textContent = episodes.length ? '만화 ' + episodes.length + '편' : '인적사항과 생애사';
  $('footerCount').textContent = displayName + (episodes.length ? ' · 만화 ' + episodes.length + '편' : ' · 인물 소개');

  const source = map?.sources.find(item => item.sourceId === person.id);
  const region = source?.region || 'unknown';
  const returnUrl = 'index.html?region=' + encodeURIComponent(region) + '#mapHeading';
  $('backToMap').href = returnUrl;
  $('emptyBack').href = returnUrl;

  const sourceLabel = episodes[0]?.sourceLabel;
  if (sourceLabel && !sourceLabel.includes('채록') && sourceLabel !== person.label) {
    $('personSource').textContent = sourceLabel;
    $('personSource').hidden = false;
  }
  $('stories').replaceChildren(...episodes.map(makeCard));
  if (!episodes.length) {
    $('empty').hidden = false;
    $('storiesHeading').textContent = '수록 만화 안내';
    $('emptyTitle').textContent = '현재 수록한 만화가 없습니다.';
    $('emptyText').textContent = '이분의 인적사항과 간략한 생애사는 위의 인물 소개와 삶의 발자취에서 읽으실 수 있습니다.';
  }
})();
