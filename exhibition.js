window.initOnyriaMuseum = () => {
  window.disposeOnyriaMuseum?.();
  const room=document.getElementById('exhibition-room');
  if(!room){window.disposeOnyriaMuseum=null;return;}
  const scope=window.createOnyriaScope();let frame=0;
  const reset=()=>{room.style.setProperty('--room-x','0deg');room.style.setProperty('--room-y','0deg');room.style.setProperty('--room-shift','0px');};
  for(const cover of room.querySelectorAll('.category-cover')){
    const warm=()=>window.preloadOnyriaCollection?.(cover.dataset.category);
    scope.listen(cover,'pointerenter',warm,{once:true});scope.listen(cover,'focus',warm,{once:true});
  }
  scope.listen(room,'pointermove',event=>{
    if(event.pointerType==='touch'||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const rect=room.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width-.5,y=(event.clientY-rect.top)/rect.height-.5;
    cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{if(scope.disposed)return;room.style.setProperty('--room-x',`${-y*.25}deg`);room.style.setProperty('--room-y',`${x*.45}deg`);});
  });
  scope.listen(room,'pointerleave',reset);scope.cleanup(()=>cancelAnimationFrame(frame));window.disposeOnyriaMuseum=()=>scope.dispose();
};
window.beginOnyriaProjection = source => {
  window.onyriaProjection?.cancel();
  const image=source?.querySelector('img');
  if(!image||window.matchMedia('(prefers-reduced-motion: reduce)').matches||!source.animate)return {ready:Promise.resolve(),finish:()=>Promise.resolve(),cancel(){}};
  const overlay=document.createElement('div');overlay.className='projection-transition';overlay.setAttribute('aria-hidden','true');
  const art=document.createElement('div');art.className='projection-art';const projected=document.createElement('img');projected.src=image.currentSrc||image.src;projected.alt='';art.append(projected);overlay.append(art);document.body.append(overlay);
  const rect=image.getBoundingClientRect(),width=Math.min(window.innerWidth*.72,900),ratio=image.naturalWidth?image.naturalHeight/image.naturalWidth:rect.height/rect.width,height=Math.min(width*ratio,window.innerHeight*.66),left=(window.innerWidth-width)/2,top=(window.innerHeight-height)/2;
  Object.assign(art.style,{width:width+'px',height:height+'px',left:left+'px',top:top+'px'});
  let removed=false;const animations=[];
  const cancel=()=>{if(removed)return;removed=true;animations.forEach(a=>a.cancel());overlay.remove();if(window.onyriaProjection===transition)window.onyriaProjection=null;};
  const rise=art.animate([{transform:`translate(${rect.left-left}px,${rect.top-top}px) scale(${rect.width/width},${rect.height/height})`,opacity:1},{transform:'translate(0,0) scale(1)',opacity:.82}],{duration:460,easing:'cubic-bezier(.2,.7,.25,1)',fill:'forwards'});
  const dim=overlay.animate([{backgroundColor:'#08121d00'},{backgroundColor:'#08121d99'}],{duration:460,fill:'forwards'});animations.push(rise,dim);
  const transition={ready:Promise.all([rise.finished,dim.finished]).catch(()=>{}),cancel,finish:async()=>{
    if(removed)return;
    const fade=overlay.animate([{opacity:1},{opacity:0}],{duration:320,easing:'ease-out',fill:'forwards'});animations.push(fade);try{await fade.finished;}catch{}cancel();
  }};
  window.onyriaProjection=transition;return transition;
};
