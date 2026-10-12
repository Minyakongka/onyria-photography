window.initOnyriaScene = () => {
  window.disposeOnyriaScene?.();
  const scene=document.querySelector('.collection-backdrop');
  if(!scene){window.disposeOnyriaScene=null;return;}
  const scope=window.createOnyriaScope(),kind=scene.dataset.scene;
  const canvas=scene.querySelector('canvas'),context=canvas.getContext('2d',{alpha:true});
  const control=document.getElementById('scene-toggle'),motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  let wanted=!(window.onyriaScenePaused ?? motion.matches),paused=true,frame=0,width=0,height=0,last=0;
  let seed=kind.split('').reduce((s,c)=>s+c.charCodeAt(0),37);
  const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const particles=Array.from({length:kind==='stars'?65:kind==='city'?46:24},()=>({x:random(),y:random(),size:.4+random()*1.4,speed:.3+random(),phase:random()*Math.PI*2}));
  function resize(){
    width=window.innerWidth;height=window.innerHeight;
    const density=Math.min(window.devicePixelRatio||1,1.25);
    canvas.width=Math.round(width*density);canvas.height=Math.round(height*density);context?.setTransform(density,0,0,density,0,0);
  }
  function draw(time){
    if(paused||scope.disposed){frame=0;return;}
    frame=requestAnimationFrame(draw);
    if(time-last<33)return;
    const delta=Math.min((time-last)/1000,.06);last=time;
    if(!context)return;
    context.clearRect(0,0,width,height);
    for(const particle of particles){
      if(kind==='stars'){
        const alpha=.2+.36*(1+Math.sin(time*.001*particle.speed+particle.phase))/2;
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
      const progress=(time/1000)%38;
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
