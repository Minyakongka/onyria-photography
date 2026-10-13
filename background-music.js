(() => {
  'use strict';
  const audio=document.getElementById('background-music');
  const toggle=document.getElementById('music-toggle');
  const slider=document.getElementById('music-volume');
  const value=document.getElementById('music-volume-value');
  if(!audio||!toggle||!slider)return;
  const next=document.getElementById('music-next');
  const credit=document.getElementById('music-credit');
  const tracks=[
    {src:'https://onyria-photography.smokymaple16.chatgpt.site/assets/onyria-resilience.mp3',title:'Resilience',artist:'Ivan Torrent',album:'Onyria'},
    {src:'https://onyria-photography.smokymaple16.chatgpt.site/assets/onyria-power-of-will.mp3',title:'The Power of Will (feat. Gaby Koss)',artist:'Ivan Torrent',album:'Reverie'}
  ];
  const key='onyria-background-music-v1';
  let saved={};
  try{saved=JSON.parse(sessionStorage.getItem(key)||'{}')||{};}catch{}
  let wanted=saved.enabled!==false,started=false,request=0;
  let volume=Number.isFinite(saved.volume)?Math.max(0,Math.min(1,saved.volume)):.25;
  let position=Number.isFinite(saved.position)?Math.max(0,saved.position):0;
  let trackIndex=Number.isInteger(saved.trackIndex)&&saved.trackIndex>=0&&saved.trackIndex<tracks.length?saved.trackIndex:0;
  audio.volume=volume;audio.loop=false;
  function showTrack(){
    const track=tracks[trackIndex];
    if(credit){credit.querySelector('strong').textContent=track.title;credit.querySelector('span:last-child').textContent=`${track.artist} · 专辑《${track.album}》`;}
    toggle.title=`${track.artist} — ${track.title}`;
    if(next)next.title=`下一首：${tracks[(trackIndex+1)%tracks.length].title}`;
  }
  if(trackIndex!==0)audio.src=tracks[trackIndex].src;
  showTrack();
  slider.value=String(Math.round(volume*100));
  function save(){try{sessionStorage.setItem(key,JSON.stringify({enabled:wanted,volume,position:audio.currentTime||position,trackIndex}));}catch{}}
  function update(){
    const playing=!audio.paused;
    toggle.classList.toggle('is-playing',playing);
    toggle.setAttribute('aria-pressed',String(playing));
    toggle.setAttribute('aria-label',playing?'暂停背景音乐':'播放背景音乐');
    value.textContent=`${Math.round(volume*100)}%`;
    slider.setAttribute('aria-valuetext',`${Math.round(volume*100)}%`);
  }
  async function play(){
    if(!wanted||document.hidden)return;
    const version=++request;
    try{
      await audio.play();
      if(version!==request)return;
      if(!wanted||document.hidden){audio.pause();return;}
      started=true;save();update();
    }catch{
      // Audible playback may require a direct user gesture; keep the play button available.
      if(version===request)update();
    }
  }
  function pause(permanent){
    request++;
    if(permanent)wanted=false;
    position=audio.currentTime||position;
    audio.pause();save();update();
  }
  function advance(){
    const resume=wanted&&!audio.paused;
    request++;audio.pause();position=0;trackIndex=(trackIndex+1)%tracks.length;
    audio.src=tracks[trackIndex].src;audio.load();showTrack();save();update();
    if(resume)void play();
  }
  next?.addEventListener('click',advance);
  audio.addEventListener('ended',()=>{
    request++;position=0;trackIndex=(trackIndex+1)%tracks.length;
    audio.src=tracks[trackIndex].src;audio.load();showTrack();save();update();
    if(wanted)void play();
  });
  audio.addEventListener('loadedmetadata',()=>{
    if(position>0&&Number.isFinite(audio.duration))audio.currentTime=position%audio.duration;
  });
  audio.addEventListener('play',update);
  audio.addEventListener('pause',update);
  audio.addEventListener('error',()=>{pause(true);toggle.title='音乐暂时无法加载，点击重试';});
  toggle.addEventListener('click',()=>{
    if(!audio.paused){pause(true);return;}
    wanted=true;
    if(audio.error)audio.load();
    save();void play();
  });
  slider.addEventListener('input',()=>{
    volume=Math.max(0,Math.min(1,Number(slider.value)/100));
    audio.volume=volume;save();update();
  });
  const options=document.querySelector('.music-options');
  function closeOutside(event){if(!event.target.closest?.('.music-control')&&options)options.open=false;}
  document.addEventListener('pointerdown',closeOutside);
  document.addEventListener('click',closeOutside);
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&options?.open){options.open=false;options.querySelector('summary').focus();}
  });
  // A film owns the soundtrack until the visitor explicitly restarts the music.
  document.addEventListener('click',event=>{
    if(event.target.closest?.('.documentary-poster,.documentary-fullscreen')){pause(true);return;}
    if(event.target.closest?.('.music-control'))return;
    if(wanted&&audio.paused)void play();
  },true);
  document.addEventListener('keydown',event=>{
    if(event.repeat||!['Enter',' '].includes(event.key)||event.target.closest?.('.music-control,.documentary-poster,.documentary-fullscreen'))return;
    if(wanted&&audio.paused)void play();
  });
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden)pause(false);
    else if(started&&wanted)void play();
  });
  window.addEventListener('pagehide',()=>pause(false));
  window.addEventListener('pageshow',event=>{if(event.persisted&&started&&wanted)void play();});
  audio.addEventListener('timeupdate',()=>{position=audio.currentTime;if(Math.floor(position)%5===0)save();});
  update();
  if(saved.enabled===true)void play();
})();
