(() => {
  'use strict';
  const audio=document.getElementById('background-music');
  const toggle=document.getElementById('music-toggle');
  const slider=document.getElementById('music-volume');
  const value=document.getElementById('music-volume-value');
  if(!audio||!toggle||!slider)return;
  const next=document.getElementById('music-next');
  const credit=document.getElementById('music-credit');
  const menu=document.getElementById('music-menu');
  const card=document.getElementById('music-card');
  const close=document.getElementById('music-card-close');
  const cardPlay=document.getElementById('music-card-play');
  const cardNext=document.getElementById('music-card-next');
  const progress=document.getElementById('music-progress');
  const elapsed=document.getElementById('music-elapsed');
  const durationLabel=document.getElementById('music-duration');
  const cardStatus=document.getElementById('music-card-status');
  let scrubbing=false;
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
    if(card){
      document.getElementById('music-card-title').textContent=track.title;
      document.getElementById('music-card-artist').textContent=track.artist;
      document.getElementById('music-card-album').textContent=track.album;
      document.getElementById('music-card-number').textContent=`${String(trackIndex+1).padStart(2,'0')} / ${String(tracks.length).padStart(2,'0')}`;
      if(cardStatus)cardStatus.textContent='';
    }
    toggle.title=`${track.artist} — ${track.title}`;
    if(next)next.title=`下一首：${tracks[(trackIndex+1)%tracks.length].title}`;
    if(cardNext)cardNext.title=next?.title||'';
  }
  if(trackIndex!==0)audio.src=tracks[trackIndex].src;
  showTrack();
  slider.value=String(Math.round(volume*100));
  function save(){try{sessionStorage.setItem(key,JSON.stringify({enabled:wanted,volume,position:audio.readyState>0?audio.currentTime:position,trackIndex}));}catch{}}
  function clock(seconds){
    if(!Number.isFinite(seconds))return '--:--';
    const total=Math.max(0,Math.floor(seconds)),minutes=Math.floor(total/60);
    return `${String(minutes).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;
  }
  function updateProgress(){
    if(!progress)return;
    const duration=audio.duration,ready=Number.isFinite(duration)&&duration>0;
    const current=audio.readyState>0?audio.currentTime:position;
    progress.disabled=!ready;
    if(!scrubbing)progress.value=String(ready?Math.round(Math.min(1,current/duration)*1000):0);
    progress.style.setProperty('--music-progress',`${Number(progress.value)/10}%`);
    progress.setAttribute('aria-valuetext',ready?`${clock(current)}，共 ${clock(duration)}`:'正在读取音乐时长');
    elapsed.textContent=clock(current);
    durationLabel.textContent=ready?clock(duration):'--:--';
  }
  function update(){
    const playing=!audio.paused;
    toggle.classList.toggle('is-playing',playing);
    toggle.setAttribute('aria-pressed',String(playing));
    toggle.setAttribute('aria-label',playing?'暂停背景音乐':'播放背景音乐');
    value.textContent=`${Math.round(volume*100)}%`;
    slider.setAttribute('aria-valuetext',`${Math.round(volume*100)}%`);
    if(cardPlay){cardPlay.textContent=playing?'暂停':'播放';cardPlay.setAttribute('aria-label',playing?'暂停背景音乐':'播放背景音乐');cardPlay.setAttribute('aria-pressed',String(playing));}
    updateProgress();
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
    if(audio.readyState>0)position=audio.currentTime;
    audio.pause();save();update();
  }
  function advance(){
    const resume=wanted&&!audio.paused;
    request++;audio.pause();position=0;trackIndex=(trackIndex+1)%tracks.length;
    audio.src=tracks[trackIndex].src;audio.load();showTrack();save();update();
    updateProgress();if(resume)void play();
  }
  next?.addEventListener('click',advance);
  cardNext?.addEventListener('click',advance);
  audio.addEventListener('ended',()=>{
    request++;position=0;trackIndex=(trackIndex+1)%tracks.length;
    audio.src=tracks[trackIndex].src;audio.load();showTrack();save();update();
    if(wanted)void play();
  });
  audio.addEventListener('loadedmetadata',()=>{
    if(position>0&&Number.isFinite(audio.duration))audio.currentTime=Math.min(position,audio.duration);
    updateProgress();
  });
  audio.addEventListener('durationchange',updateProgress);
  audio.addEventListener('emptied',updateProgress);
  audio.addEventListener('seeked',updateProgress);
  audio.addEventListener('play',update);
  audio.addEventListener('pause',update);
  audio.addEventListener('error',()=>{pause(true);toggle.title='音乐暂时无法加载，点击重试';if(cardStatus)cardStatus.textContent='音乐暂时无法加载，请点击播放重试。';});
  function togglePlayback(){
    if(!audio.paused){pause(true);return;}
    wanted=true;
    if(cardStatus)cardStatus.textContent='';
    if(audio.error)audio.load();
    save();void play();
  }
  toggle.addEventListener('click',togglePlayback);
  cardPlay?.addEventListener('click',togglePlayback);
  slider.addEventListener('input',()=>{
    volume=Math.max(0,Math.min(1,Number(slider.value)/100));
    audio.volume=volume;save();update();
  });
  const options=document.querySelector('.music-options');
  function closeCard(restoreFocus=false){
    if(!card||card.hidden)return;
    card.hidden=true;menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','打开音乐卡片');menu.closest('.music-control').classList.remove('has-music-card');
    if(restoreFocus)menu.focus();
  }
  menu?.addEventListener('click',()=>{
    if(!card)return;
    if(!card.hidden){closeCard();return;}
    if(options)options.open=false;
    card.hidden=false;menu.setAttribute('aria-expanded','true');menu.setAttribute('aria-label','关闭音乐卡片');menu.closest('.music-control').classList.add('has-music-card');
    audio.preload='metadata';
    if(audio.readyState===0&&audio.paused&&!audio.error)audio.load();
    updateProgress();close?.focus({preventScroll:true});
  });
  close?.addEventListener('click',()=>closeCard(true));
  progress?.addEventListener('pointerdown',()=>{scrubbing=true;});
  progress?.addEventListener('input',()=>{
    if(!Number.isFinite(audio.duration)||audio.duration<=0)return;
    position=Math.max(0,Math.min(audio.duration,Number(progress.value)/1000*audio.duration));
    try{audio.currentTime=position;save();updateProgress();}catch{if(cardStatus)cardStatus.textContent='暂时无法跳转，请稍后重试。';}
  });
  function finishScrub(){if(scrubbing){scrubbing=false;updateProgress();}}
  document.addEventListener('pointerup',finishScrub);
  document.addEventListener('pointercancel',finishScrub);
  progress?.addEventListener('change',finishScrub);
  function closeOutside(event){
    if(!event.target.closest?.('.music-control')&&options)options.open=false;
    if(card&&!card.hidden&&!card.contains(event.target)&&!menu.contains(event.target))closeCard();
  }
  document.addEventListener('pointerdown',closeOutside);
  document.addEventListener('click',closeOutside);
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&card&&!card.hidden){event.preventDefault();closeCard(true);return;}
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
  audio.addEventListener('timeupdate',()=>{position=audio.currentTime;updateProgress();if(Math.floor(position)%5===0)save();});
  update();
  if(saved.enabled===true)void play();
})();
