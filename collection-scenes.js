window.initOnyriaScene = () => {
  window.disposeOnyriaScene?.();
  const scene=document.querySelector('.collection-backdrop');
  if(!scene){window.disposeOnyriaScene=null;return;}
  const scope=window.createOnyriaScope(),kind=scene.dataset.scene;
  const canvas=scene.querySelector('.scene-particles'),context=canvas?.getContext('2d',{alpha:true});
  const details=scene.querySelector('.scene-details'),detail=details?.getContext('2d',{alpha:true});
  const photo=scene.querySelector('.scene-photo');
  const vehicle=kind==='city'?new Image():null;
  if(vehicle){vehicle.decoding='async';vehicle.src='https://onyria-photography.smokymaple16.chatgpt.site/assets/scenes/air-vehicle.webp';}
  const control=document.getElementById('scene-toggle'),motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  let wanted=!(window.onyriaScenePaused ?? motion.matches),paused=true,frame=0,width=0,height=0,last=0,elapsed=0;
  let seed=kind.split('').reduce((s,c)=>s+c.charCodeAt(0),37);
  const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const particles=Array.from({length:kind==='stars'?65:kind==='city'?46:24},()=>({x:random(),y:random(),size:.4+random()*1.4,speed:.3+random(),phase:random()*Math.PI*2}));
  function resize(){
    width=window.innerWidth;height=window.innerHeight;
    const density=Math.min(window.devicePixelRatio||1,1.25);
    for(const layer of [canvas,details])if(layer){layer.width=Math.round(width*density);layer.height=Math.round(height*density);layer.getContext('2d')?.setTransform(density,0,0,density,0,0);}
  }
  // Animate only small regions of the generated scene; real photography stays untouched.
  const regions={
    landscape:[{x:.89,y:.695,w:.023,h:.065,amount:1.2}],
    sunset:[{x:.883,y:.54,w:.027,h:.065,amount:1.2}],
    city:[{x:.9,y:.50,w:.095,h:.24,amount:1.5},{x:0,y:.79,w:.77,h:.21,amount:1.2,water:true}],
    stars:[{x:.775,y:.79,w:.034,h:.06,amount:1},{x:.86,y:.77,w:.1,h:.09,amount:.65},{x:.02,y:.90,w:.58,h:.10,amount:.8,water:true}]
  }[kind]||[];
  function drawDetails(time){
    if(!detail)return;
    detail.clearRect(0,0,width,height);
    if(!photo?.complete||!photo.naturalWidth)return;
    const pw=photo.naturalWidth,ph=photo.naturalHeight,scale=Math.max(width/pw,height/ph);
    const left=(width-pw*scale)*(width<=600||kind==='stars'?1:.5),top=(height-ph*scale)*.5;
    const point=(x,y)=>[left+x*pw*scale,top+y*ph*scale];
    // Feather each thin source band into the still image. Sub-pixel motion evokes wind and water.
    for(const r of regions){
      const sx=r.x*pw,sy=r.y*ph,sw=r.w*pw,sh=r.h*ph,bands=r.water?22:16;
      for(let i=0;i<bands;i++){
        const t=i/(bands-1),bh=sh/bands,dy=sy+i*bh;
        const offset=Math.sin(time*(r.water?1.8:2.4)+i*(r.water?.52:.16))*r.amount*scale;
        detail.globalAlpha=Math.sin(t*Math.PI)*(r.water?.54:.84);
        detail.drawImage(photo,sx,dy,sw,bh,left+sx*scale+offset,top+dy*scale,sw*scale,bh*scale+.2);
      }
    }
    detail.globalAlpha=1;
    function glow(x,y,radius,color,alpha){
      const [px,py]=point(x,y),g=detail.createRadialGradient(px,py,0,px,py,radius*scale);
      g.addColorStop(0,`rgba(${color},${alpha})`);g.addColorStop(1,`rgba(${color},0)`);
      detail.fillStyle=g;detail.fillRect(px-radius*scale,py-radius*scale,radius*scale*2,radius*scale*2);
    }
    if(kind==='city'){
      glow(.58,.37,34,'93,214,229',.035+.026*(1+Math.sin(time*1.2)));
      glow(.72,.55,38,'232,128,204',.026+.019*(1+Math.sin(time*.84+2)));
      if(vehicle?.complete&&vehicle.naturalWidth){
        const routes=[{period:27,offset:0,y:.45,rise:-.09,size:32,alpha:.7,reverse:false},{period:39,offset:13,y:.32,rise:.04,size:20,alpha:.47,reverse:true}];
        for(const route of routes){
          const progress=((time+route.offset)%route.period)/route.period,x=route.reverse?1.08-progress*1.16:-.08+progress*1.16;
          const [vx,vy]=point(x,route.y+route.rise*progress),vw=Math.min(44,route.size*scale);
          detail.globalAlpha=Math.min(1,progress*10,(1-progress)*10)*route.alpha;detail.save();
          detail.translate(vx,vy);if(route.reverse)detail.scale(-1,1);
          detail.drawImage(vehicle,0,0,vw,vw*vehicle.naturalHeight/vehicle.naturalWidth);detail.restore();
        }
        detail.globalAlpha=1;
      }
    }else if(kind==='stars')glow(.91,.82,43,'255,190,112',.025+.015*(1+Math.sin(time*.9)));
  }
  function draw(time){
    if(paused||scope.disposed){frame=0;return;}
    frame=requestAnimationFrame(draw);
    if(time-last<33)return;
    const delta=Math.min((time-last)/1000,.06);last=time;elapsed+=delta;
    drawDetails(elapsed);
    if(!context)return;
    context.clearRect(0,0,width,height);
    for(const particle of particles){
      if(kind==='stars'){
        const alpha=.2+.36*(1+Math.sin(elapsed*particle.speed+particle.phase))/2;
        context.fillStyle=`rgba(221,234,255,${alpha})`;context.beginPath();context.arc(particle.x*width,particle.y*height*.66,particle.size*.75,0,Math.PI*2);context.fill();
      }else if(kind==='city'){
        particle.y=(particle.y+delta*.22*particle.speed)%1;const x=particle.x*width,y=particle.y*height;
        context.strokeStyle='rgba(184,219,239,.16)';context.lineWidth=.6;context.beginPath();context.moveTo(x,y);context.lineTo(x-3,y+11*particle.speed);context.stroke();
      }else{
        particle.y=(particle.y+delta*.025*particle.speed)%1;particle.x=(particle.x+delta*.006+1)%1;
        context.fillStyle=kind==='sunset'?'rgba(255,225,191,.24)':'rgba(228,239,255,.28)';context.beginPath();context.arc(particle.x*width,particle.y*height,particle.size*.65,0,Math.PI*2);context.fill();
      }
    }
    if(kind==='stars'){
      const progress=elapsed%38;
      if(progress<1.2){const x=width*(.25+progress*.2),y=height*(.08+progress*.12);context.strokeStyle=`rgba(220,235,255,${Math.sin(progress/1.2*Math.PI)*.42})`;context.lineWidth=1;context.beginPath();context.moveTo(x,y);context.lineTo(x-42,y-24);context.stroke();}
    }
  }
  function refresh(){
    paused=!wanted||document.hidden||document.body.classList.contains('modal-open');
    scene.classList.toggle('is-paused',paused);
    control?.setAttribute('aria-pressed',String(!wanted));
    control?.setAttribute('aria-label',wanted?'暂停背景动画':'播放背景动画');
    if(control)control.title=wanted?'暂停背景动画':'播放背景动画';
    control?.classList.toggle('is-paused',!wanted);
    if(paused){cancelAnimationFrame(frame);frame=0;}
    else if(!frame){last=performance.now();frame=requestAnimationFrame(draw);}
  }
  scope.listen(control,'click',()=>{wanted=!wanted;window.onyriaScenePaused=!wanted;refresh();});
  scope.listen(window,'resize',resize,{passive:true});scope.listen(document,'visibilitychange',refresh);
  if(motion.addEventListener)scope.listen(motion,'change',()=>{wanted=!motion.matches;window.onyriaScenePaused=!wanted;refresh();});
  const observer=new MutationObserver(refresh);observer.observe(document.body,{attributes:true,attributeFilter:['class']});
  scope.cleanup(()=>{cancelAnimationFrame(frame);observer.disconnect();});
  window.disposeOnyriaScene=()=>scope.dispose();resize();refresh();
};
