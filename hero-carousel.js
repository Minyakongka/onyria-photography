(() => {
  'use strict';
  const home = document.getElementById('home');
  const firstImage = home.querySelector('.hero-image');
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
  let current = 0,desired = 0,activeLayer = 0,playing = false,timer = 0,request = 0;
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
    play.querySelector('.hero-play-label').textContent = playing ? '暂停' : '自动播放';
    play.classList.toggle('is-playing',playing);
  }
  function schedule() {
    clearTimeout(timer);timer = 0;
    if (!playing || slides.length < 2 || document.hidden || !homeVisible() || document.querySelector('dialog[open]')) return;
    timer = window.setTimeout(() => {
      // Do not interrupt the transition from the homepage to the works section.
      if (document.hidden || !homeVisible() || document.querySelector('dialog[open]') || document.body.classList.contains('is-page-turning')) {schedule();return;}
      void select(current+1);
    },8000);
  }
  function loadImage(src) {
    return new Promise((resolve,reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Cover could not be loaded'));
      image.src = src;
      if (image.complete && image.naturalWidth) resolve(image);
    });
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
  previous.addEventListener('click',() => void select(desired-1));
  next.addEventListener('click',() => void select(desired+1));
  play.addEventListener('click',() => {
    playing = !playing;
    // Pausing also invalidates an automatic change that is still loading.
    if (!playing) {request++;desired = current;}
    updateControls();schedule();
  });
  window.addEventListener('keydown',event => {
    if (event.defaultPrevented || event.ctrlKey || event.altKey || event.metaKey || !homeVisible() || document.querySelector('dialog[open]')) return;
    if (event.target.closest?.('input,textarea,select,[contenteditable="true"]')) return;
    if (slides.length > 1 && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      event.preventDefault();void select(desired + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  document.addEventListener('visibilitychange',schedule);
  document.addEventListener('close',schedule,true);
  window.addEventListener('scroll',schedule,{passive:true});
  const resize = () => {layers[activeLayer].style.objectPosition = focalPosition(slides[current]);};
  if (mobile.addEventListener) mobile.addEventListener('change',resize);
  else if (mobile.addListener) mobile.addListener(resize);
  window.addEventListener('pagehide',() => {clearTimeout(timer);request++;});
  window.addEventListener('pageshow',schedule);
  firstImage.style.objectPosition = focalPosition(slides[0]);
  setCopy(slides[0]);updateControls();
})();
