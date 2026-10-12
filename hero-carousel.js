window.initOnyriaHero = () => {
  window.disposeOnyriaHero?.();
  const scope=window.createOnyriaScope(),listen=scope.listen;
  window.disposeOnyriaHero=()=>scope.dispose();
  'use strict';
  const home = document.getElementById('home');
  if(!home)return;
  const firstImage = home.querySelector('.hero-image');
  const reveal=()=>{if(scope.disposed)return;home.classList.add('is-revealed');window.onyriaHeroRevealed=true;};
  const beginReveal=()=>requestAnimationFrame(()=>requestAnimationFrame(reveal));
  if(window.onyriaHeroRevealed||window.matchMedia('(prefers-reduced-motion: reduce)').matches) reveal();
  else if(firstImage.decode) firstImage.decode().catch(()=>{}).then(beginReveal);
  else if(firstImage.complete) beginReveal();
  else {listen(firstImage,'load',beginReveal,{once:true});listen(firstImage,'error',beginReveal,{once:true});}
  const title = document.getElementById('hero-title');
  const subtitle = home.querySelector('.hero-line');
  const previous = document.getElementById('hero-previous');
  const next = document.getElementById('hero-next');
  const play = document.getElementById('hero-play');
  const position = document.getElementById('hero-position');
  const status = document.getElementById('hero-status');
  const slides = Array.isArray(window.onyriaHeroSlides) ? window.onyriaHeroSlides.filter(s => s && typeof s.src === 'string' && s.src) : [];
  if (!slides.length) return;
  const mobile = window.matchMedia('(max-width: 600px)');
  const secondImage = firstImage.cloneNode(false);
  secondImage.removeAttribute('fetchpriority');
  secondImage.alt = '';secondImage.setAttribute('aria-hidden','true');
  secondImage.classList.add('hero-image-inactive');
  firstImage.after(secondImage);
  const layers = [firstImage,secondImage];
  const imageCache = new Map();
  let current = 0,desired = 0,activeLayer = 0,playing = false,timer = 0,request = 0;
  scope.cleanup(()=>{request++;clearTimeout(timer);secondImage.remove();});
  const homeVisible = () => home.getBoundingClientRect().bottom > window.innerHeight * .5;
  const focalPosition = slide => mobile.matches ? (slide.mobilePosition || slide.position || 'center') : (slide.position || 'center');
  function setCopy(slide) {
    title.textContent = slide.title || '无尽山河';
    subtitle.textContent = slide.subtitle === undefined ? '行走，攀登，记录永恒' : slide.subtitle;
  }
  function updateControls() {
    position.textContent = `${String(current+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
    play.setAttribute('aria-pressed',String(playing));
    play.setAttribute('aria-label',playing ? '暂停自动播放，固定当前封面' : '自动播放首页封面');
    for (const button of [previous,next,play]) {
      button.disabled = slides.length < 2;
      button.title = slides.length < 2 ? '当前仅有一张封面' : button.getAttribute('aria-label');
    }
    play.classList.toggle('is-playing',playing);
  }
  function schedule() {
    clearTimeout(timer);timer = 0;
    if (!playing || slides.length < 2 || document.hidden || !homeVisible() || document.querySelector('dialog[open]')) return;
    timer = scope.later(() => {
      // Do not interrupt the transition from the homepage to the works section.
      if (document.hidden || !homeVisible() || document.querySelector('dialog[open]') || document.body.classList.contains('is-page-turning')) {schedule();return;}
      void select(current+1);
    },8000);
  }
  function loadImage(src) {
    if (imageCache.has(src)) return imageCache.get(src);
    const loading = new Promise((resolve,reject) => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = async () => {
        try {if (image.decode) await image.decode();resolve(image);}
        catch (error) {reject(error);}
      };
      image.onerror = () => reject(new Error('Cover could not be loaded'));
      image.src = src;
      if (image.complete && image.naturalWidth) image.onload();
    });
    imageCache.set(src,loading);
    loading.catch(() => {if (imageCache.get(src) === loading) imageCache.delete(src);});
    return loading;
  }
  async function select(index) {
    clearTimeout(timer);timer = 0;
    desired = (index + slides.length) % slides.length;
    const ticket = ++request,selected = desired,slide = slides[selected];
    if (selected === current) {schedule();return;}
    try {
      await loadImage(slide.src);
      if (ticket !== request) return;
      const incoming = layers[1-activeLayer],outgoing = layers[activeLayer];
      incoming.src = slide.src;
      incoming.width = slide.width || firstImage.width;
      incoming.height = slide.height || firstImage.height;
      incoming.style.objectPosition = focalPosition(slide);
      // Keep the visible cover until the actual display layer is decoded.
      if (incoming.decode) await incoming.decode();
      if (ticket !== request) return;
      incoming.alt = slide.alt || '';
      incoming.removeAttribute('aria-hidden');
      outgoing.alt = '';outgoing.setAttribute('aria-hidden','true');
      incoming.classList.remove('hero-image-inactive');outgoing.classList.add('hero-image-inactive');
      activeLayer = 1-activeLayer;current = selected;
      setCopy(slide);status.textContent = '';
      updateControls();schedule();
    } catch {
      if (ticket !== request) return;
      desired = current;playing = false;
      status.textContent = '这张封面暂时无法加载，请稍后再试。';
      updateControls();schedule();
    }
  }
  listen(previous,'click',() => void select(desired-1));
  listen(next,'click',() => void select(desired+1));
  listen(play,'click',() => {
    playing = !playing;
    // Pausing also invalidates an automatic change that is still loading.
    if (!playing) {request++;desired = current;}
    updateControls();schedule();
  });
  listen(window,'keydown',event => {
    if (event.defaultPrevented || event.ctrlKey || event.altKey || event.metaKey || !homeVisible() || document.querySelector('dialog[open]')) return;
    if (event.target.closest?.('input,textarea,select,[contenteditable="true"]')) return;
    if (slides.length > 1 && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      event.preventDefault();void select(desired + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  listen(document,'visibilitychange',schedule);
  listen(document,'close',schedule,true);
  listen(window,'scroll',schedule,{passive:true});
  const resize = () => {layers[activeLayer].style.objectPosition = focalPosition(slides[current]);};
  if (mobile.addEventListener) listen(mobile,'change',resize);
  else if (mobile.addListener) {mobile.addListener(resize);scope.cleanup(()=>mobile.removeListener(resize));}
  listen(window,'pagehide',() => {clearTimeout(timer);request++;});
  listen(window,'pageshow',schedule);
  firstImage.style.objectPosition = focalPosition(slides[0]);
  setCopy(slides[0]);updateControls();
  // Load one cover at a time after the first cover is visible, sharing work
  // with manual navigation and retaining decoded images for later cycles.
  const warmCovers = async () => {
    try {if (firstImage.decode) await firstImage.decode();} catch {}
    for (const slide of slides) {
      if (document.hidden || scope.disposed) break;
      try {await loadImage(slide.src);} catch {}
    }
  };
  const startWarmup = () => {
    if (window.requestIdleCallback) {const idle=window.requestIdleCallback(() => {if(!scope.disposed)void warmCovers();},{timeout:1500});scope.cleanup(()=>window.cancelIdleCallback?.(idle));}
    else scope.later(() => void warmCovers(),1000);
  };
  if (document.readyState === 'complete') startWarmup();
  else listen(window,'load',startWarmup,{once:true});
};
window.initOnyriaHero();
