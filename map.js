(() => {
  'use strict';
  const map=window.YECHEON_MAP;
  if(!map)return;
  const svg=document.getElementById('yecheonMap'),select=document.getElementById('regionSelect');
  let chosenRegion='';
  const ns='http://www.w3.org/2000/svg';
  for(const region of map.regions){
    const group=document.createElementNS(ns,'g');
    group.classList.add('map-region');group.dataset.region=region.name;
    group.setAttribute('tabindex','0');group.setAttribute('role','button');
    group.setAttribute('aria-label',region.name+' 채록 인물 보기');group.setAttribute('aria-pressed','false');
    group.setAttribute('aria-controls','regionPeople');
    const path=document.createElementNS(ns,'path');path.setAttribute('d',region.path);
    const label=document.createElementNS(ns,'text');label.setAttribute('x',region.label[0]);label.setAttribute('y',region.label[1]);label.textContent=region.name;
    group.append(path,label);svg.append(group);
    const choose=()=>show(region.name);
    const activate=()=>{choose();if(window.matchMedia('(max-width:780px)').matches)document.querySelector('.region-panel').scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});};
    group.addEventListener('pointermove',event=>{if(event.pointerType!=='touch')choose();});
    group.addEventListener('focus',choose);group.addEventListener('click',activate);
    group.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();activate();}});
    select.add(new Option(region.name,region.name));
  }
  function show(name){
    if(chosenRegion===name)return;
    chosenRegion=name;
    const address=new URL(window.location.href);address.searchParams.set('region',name);
    try{window.history.replaceState(null,'',address);}catch{/* Some offline browsers limit history changes. The return link still restores the region. */}
    const unknown=name==='unknown';
    const sources=map.sources.filter(source=>unknown?!source.region:source.region===name);
    svg.querySelectorAll('[data-region]').forEach(group=>{const chosen=group.dataset.region===name;group.classList.toggle('selected',chosen);group.setAttribute('aria-pressed',chosen?'true':'false');});
    select.value=unknown?'':name;
    const total=sources.reduce((n,source)=>n+window.STORY_CATALOG.episodes.filter(e=>e.sourceId===source.sourceId).length,0);
    document.getElementById('regionTitle').textContent=unknown?'지역 미확인':name;
    document.getElementById('regionCount').textContent=sources.length+'건의 채록 · '+total+'편';
    const list=document.getElementById('regionPeople');list.replaceChildren();
    for(const source of sources){
      const person=window.STORY_CATALOG.people.find(p=>p.id===source.sourceId);
      if(!person)continue;
      const count=window.STORY_CATALOG.episodes.filter(e=>e.sourceId===person.id).length;
      const button=document.createElement('a');button.href='person.html?person='+encodeURIComponent(person.id);button.className='region-person';
      button.setAttribute('aria-label',person.label+' 작품 보기, '+count+'편');
      const body=document.createElement('span'),title=document.createElement('strong'),detail=document.createElement('small'),badge=document.createElement('span');
      title.textContent=person.label;
      detail.textContent=!count?'채록 확인 · 이번 선별에 수록한 작품 없음':source.placeLabel||'채록 인물';
      badge.className='region-person-count';badge.textContent=count?'만화 '+count+'편 →':'선별 이유 →';
      body.append(title,detail);button.append(body,badge);
      list.append(button);
    }
    const empty=document.getElementById('regionEmpty');empty.hidden=!!sources.length;
    document.getElementById('regionEmptyText').textContent=unknown?'모든 채록의 지역이 확인되었습니다.':'이 지역에 연결할 수 있는 채록이 현재 모음에는 없습니다. 전체 목록에서는 다른 지역의 이야기를 볼 수 있습니다.';
  }
  select.addEventListener('change',()=>{if(select.value)show(select.value);});
  const unknown=map.sources.filter(source=>!source.region);
  const unknownButton=document.getElementById('unknownRegion');
  unknownButton.hidden=!unknown.length;unknownButton.textContent='지역 미확인 채록 '+unknown.length+'건 보기';unknownButton.onclick=()=>show('unknown');
  const requestedRegion=new URLSearchParams(window.location.search).get('region');
  show(requestedRegion==='unknown'||map.regions.some(region=>region.name===requestedRegion)?requestedRegion:'예천읍');
})();
