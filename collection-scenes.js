window.initOnyriaScene = () => {
  window.disposeOnyriaScene?.();
  const scene=document.querySelector('.collection-backdrop');
  if(!scene){window.disposeOnyriaScene=null;return;}
  const scope=window.createOnyriaScope(),kind=scene.dataset.scene;
  const canvas=scene.querySelector('.scene-environment'),ctx=canvas?.getContext('2d',{alpha:true});
  const photo=scene.querySelector('.scene-photo'),motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const cloud=['landscape','sunset'].includes(kind)?new Image():null;
  if(cloud){cloud.decoding='async';cloud.src='https://onyria-photography.smokymaple16.chatgpt.site/assets/scenes/cloud-wisp.webp';}
  let frame=0,last=0,elapsed=0,width=0,height=0,paused=true;
  function resize(){
    width=window.innerWidth;height=window.innerHeight;
    const density=Math.min(window.devicePixelRatio||1,1.25);
    if(canvas){canvas.width=Math.round(width*density);canvas.height=Math.round(height*density);ctx?.setTransform(density,0,0,density,0,0);}
  }
  function draw(time){
    if(paused||scope.disposed){frame=0;return;}
    frame=requestAnimationFrame(draw);
    if(time-last<40)return;
    elapsed+=Math.min((time-last)/1000,.08);last=time;
    if(!ctx)return;
    ctx.clearRect(0,0,width,height);
    if(!photo?.complete||!photo.naturalWidth)return;
    const pw=photo.naturalWidth,ph=photo.naturalHeight,scale=Math.max(width/pw,height/ph);
    const left=(width-pw*scale)*(width<=600||kind==='stars'?1:.5),top=(height-ph*scale)*.5;
    const point=(x,y)=>[left+x*pw*scale,top+y*ph*scale];
    function clip(points){
      ctx.beginPath();points.forEach(([x,y],i)=>{const p=point(x,y);i?ctx.lineTo(...p):ctx.moveTo(...p);});ctx.closePath();ctx.clip();
    }
    function glow(x,y,radius,color,alpha){
      const [px,py]=point(x,y),r=radius*scale;
      const g=ctx.createRadialGradient(px,py,0,px,py,r);
      g.addColorStop(0,`rgba(${color},${alpha})`);g.addColorStop(1,`rgba(${color},0)`);
      ctx.fillStyle=g;ctx.fillRect(px-r,py-r,2*r,2*r);
    }
    // Only the atmosphere is advected. The background photo is never re-sampled,
    // displaced, split into strips or drawn to this canvas, keeping every body intact.
    if(cloud?.complete&&cloud.naturalWidth){
      const warm=kind==='sunset';
      const zone=warm?[[0,.42],[.58,.4],[.98,.63],[.93,.71],[.35,.65],[0,.67]]:[[0,.40],[.52,.46],[.80,.59],[.76,.69],[.35,.66],[0,.64]];
      ctx.save();clip(zone);ctx.globalCompositeOperation='screen';
      ctx.filter=warm?'grayscale(1) sepia(.65) saturate(.45)':'grayscale(1)';
      const w=pw*scale*.67,h=ph*scale*.18,shift=(elapsed*.0025%1)*w;
      ctx.globalAlpha=warm?.13:.12;
      for(let i=-1;i<3;i++)ctx.drawImage(cloud,left+i*w+shift,top+ph*scale*.44,w,h);
      ctx.restore();
    }
    // Light is anchored to actual emissive features. Small slow changes evoke
    // power fluctuations and moving traffic without free-floating sprites.
    if(kind==='city'){
      glow(.34,.16,18,'136,206,219',.019+.007*Math.sin(elapsed*.7));
      glow(.65,.31,14,'222,138,195',.019+.006*Math.sin(elapsed*.46+1));
      const p=(elapsed%23)/23,[x,y]=point(.28+p*.52,.625-p*.03);
      ctx.fillStyle='rgba(235,225,197,.27)';ctx.beginPath();ctx.ellipse(x,y,1.6*scale,.65*scale,0,0,Math.PI*2);ctx.fill();
    }
    // Surface ripples are clipped to water; no solids, pedestrians or fabric move.
    if(kind==='city'||kind==='stars'){
      ctx.save();
      clip(kind==='city'?[[0,.715],[.7,.71],[.66,.76],[.20,1],[0,1]]:[[.05,.85],[.37,.853],[.375,.89],[.05,.90]]);
      for(let i=0;i<12;i++){
        const near=i/12,y=(kind==='city'?.76:.854)+near*(kind==='city'?.20:.033);
        const base=.045+((i*37)%47)/100,span=.018+near*.047;
        const [x1,yy]=point(base+Math.sin(elapsed*.24+i)*.003,y);
        const [x2]=point(base+span,y);
        ctx.strokeStyle=`rgba(157,196,211,${.045+.035*(1+Math.sin(elapsed*.9+i*1.6))/2})`;
        ctx.lineWidth=(.35+near*.35)*scale;ctx.beginPath();ctx.moveTo(x1,yy);
        ctx.quadraticCurveTo((x1+x2)/2,yy+Math.sin(elapsed*.55+i)*.55*scale,x2,yy);ctx.stroke();
      }
      ctx.restore();
    }
    if(kind==='stars'){
      const points=[[0.2811,0.06695],[0.95036,0.23273],[0.08553,0.08608],[0.08612,0.26886],[0.85287,0.33262],[0.37201,0.16472]];
      points.forEach(([x,y],i)=>glow(x,y,2,'211,227,242',.02+.018*(1+Math.sin(elapsed*.45+i*2.7))/2));
      glow(.879,.807,23,'255,191,118',.017+.003*Math.sin(elapsed*.23));
    }
  }
  function refresh(){
    paused=motion.matches||document.hidden||document.body.classList.contains('modal-open');
    if(paused){cancelAnimationFrame(frame);frame=0;ctx?.clearRect(0,0,width,height);}
    else if(!frame){last=performance.now();frame=requestAnimationFrame(draw);}
  }
  scope.listen(window,'resize',resize,{passive:true});scope.listen(document,'visibilitychange',refresh);
  if(motion.addEventListener)scope.listen(motion,'change',refresh);
  const observer=new MutationObserver(refresh);observer.observe(document.body,{attributes:true,attributeFilter:['class']});
  scope.cleanup(()=>{cancelAnimationFrame(frame);observer.disconnect();});
  window.disposeOnyriaScene=()=>scope.dispose();resize();refresh();
};
