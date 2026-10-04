(function(root){
  function normalize(s){return String(s||'').normalize('NFC').toLocaleLowerCase('ko').replace(/[\s·ㆍ_—–\-.,!?「」『』“”‘’'"()\[\]]/g,'');}
  function searchText(e){return normalize([e.title,e.message,e.sourceLabel,...(e.names||[]),...(e.aliases||[]),...(e.topics||[])].join(' '));}
  function filter(episodes,state){const tokens=String(state.query||'').trim().split(/\s+/).map(normalize).filter(Boolean);const query=normalize(state.query);const namedQuery=state.names?.find(name=>normalize(name)===query);return episodes.filter(e=>(!namedQuery||(e.names||[]).includes(namedQuery))&&(!state.person||e.sourceId===state.person)&&(!state.topic||(e.topics||[]).includes(state.topic))&&tokens.every(t=>searchText(e).includes(t)));}
  const api={normalize,filter,searchText};if(typeof module==='object'&&module.exports)module.exports=api;else root.StorySearch=api;
})(typeof window!=='undefined'?window:globalThis);
