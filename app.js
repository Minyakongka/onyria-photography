(() => {
  'use strict';
  const gallery = document.getElementById('gallery');
  const filters = [...document.querySelectorAll('.filter')];
  const lightbox = document.getElementById('lightbox');
  const articleDialog = document.getElementById('article-dialog');
  let currentFilter = document.body.dataset.category || 'all', currentIndex = 0, opener = null;
  const isFullRow = photo => photo.featured || photo.width * 9 > photo.height * 16;
  function galleryRows(photos){
    const categories=new Map();
    photos.forEach(photo=>{
      if(!categories.has(photo.category))categories.set(photo.category,[]);
      categories.get(photo.category).push(photo);
    });
    const rows=[];
    for(const group of categories.values()){
      const remaining=[...group.filter(p=>p.featured),...group.filter(p=>!p.featured)];
      while(remaining.length){
        const photo=remaining.shift(),row=[photo];
        if(!isFullRow(photo)){
          const portrait=photo.height>photo.width;
          const partner=remaining.findIndex(p=>!isFullRow(p)&&(p.height>p.width)===portrait);
          if(partner>=0)row.push(remaining.splice(partner,1)[0]);
        }
        rows.push(row);
      }
    }
    return rows;
  }
  const filteredPhotos = () => galleryRows(siteContent.photos.filter(p => currentFilter === 'all' || p.category === currentFilter)).flat();
  const make = (tag, className, text) => { const e = document.createElement(tag); if(className)e.className=className; if(text !== undefined)e.textContent=text; return e; };
  const lock = () => document.body.classList.add('modal-open');
  const unlock = () => {document.body.classList.remove('modal-open');if(opener?.isConnected)opener.focus();};
  function renderGallery(){
    if(!gallery)return;
    gallery.replaceChildren();
    const photos = filteredPhotos();
    galleryRows(photos).forEach((row,rowIndex) => row.forEach((photo,columnIndex) => {
      const figure = make('figure','photo-card');
      if(photo.featured)figure.classList.add('photo-featured');
      if(isFullRow(photo))figure.classList.add('photo-panorama');
      if(photo.height>photo.width)figure.classList.add('photo-portrait');
      figure.style.gridRow=String(rowIndex+1);
      figure.style.gridColumn=isFullRow(photo)?'1 / -1':String(columnIndex+1);
      const button = make('button','photo-image-button');button.type='button';button.setAttribute('aria-label',`放大查看：${photo.title || photo.alt}`);
      const img = make('img');img.src=photo.src;img.alt=photo.alt;img.loading='lazy';img.decoding='async';
      if(photo.width && photo.height){img.width=photo.width;img.height=photo.height;}
      img.addEventListener('error',()=>{img.classList.add('image-error');},{once:true});
      button.append(img,make('span','photo-open','全屏观看'));
      button.addEventListener('click',()=>{opener=button;currentIndex=photos.indexOf(photo);updateLightbox();lightbox.showModal();lock();});
      figure.append(button);
      if(photo.title || photo.description){
        const caption = make('figcaption','photo-caption'), info = make('div');
        if(photo.title)info.append(make('h3','',photo.title));
        if(photo.description)info.append(make('p','',photo.description));
        caption.append(info);figure.append(caption);
      }
      gallery.append(figure);
    }));
    document.getElementById('photo-count').textContent=`${photos.length} 幅影像`;
    if(!photos.length)gallery.append(make('p','empty-message','这个分类暂时还没有作品。'));
  }
  function updateLightbox(){
    const photos=filteredPhotos(),photo=photos[currentIndex],img=document.getElementById('lightbox-image');
    img.src=photo.src;img.alt=photo.alt;
    document.getElementById('lightbox-title').textContent=photo.title;
    document.getElementById('lightbox-category').textContent=photo.description;
    document.getElementById('lightbox-position').textContent=`${String(currentIndex+1).padStart(2,'0')} / ${String(photos.length).padStart(2,'0')}`;
    document.getElementById('photo-prev').disabled=photos.length<2;
    document.getElementById('photo-next').disabled=photos.length<2;
  }
  function step(direction){const n=filteredPhotos().length;currentIndex=(currentIndex+direction+n)%n;updateLightbox();}
  document.querySelectorAll('.documentary-card').forEach(card=>{
    const poster=card.querySelector('.documentary-poster'),player=card.querySelector('.documentary-player');
    function startFilm(){
      if(player.querySelector('iframe'))return;
      const iframe=document.createElement('iframe');
      const url=new URL(`https://www.youtube.com/embed/${encodeURIComponent(card.dataset.youtubeId)}`);
      url.search=new URLSearchParams({autoplay:'1',playsinline:'1',rel:'0',controls:'1',fs:'1'}).toString();
      iframe.src=url.href;iframe.title=`${card.querySelector('h3').textContent} · YouTube播放器`;
      iframe.allow='autoplay; fullscreen; picture-in-picture; encrypted-media';iframe.allowFullscreen=true;
      iframe.referrerPolicy='strict-origin-when-cross-origin';
      player.replaceChildren(iframe);player.hidden=false;poster.hidden=true;
      iframe.focus({preventScroll:true});
    }
    poster.addEventListener('click',startFilm);
    card.querySelector('.documentary-fullscreen')?.addEventListener('click',()=>{
      startFilm();
      const media=card.querySelector('.documentary-media');
      const fallback=()=>{card.querySelector('.film-status').textContent='可使用播放器右下角的全屏按钮。';};
      if(!media.requestFullscreen){fallback();return;}
      try{Promise.resolve(media.requestFullscreen()).catch(fallback);}catch{fallback();}
    });
  });
  const reducedMotion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coverPhotos={landscape:'mountains',sunset:'onyria-dsc01023',city:'onyria-city-pano-2',stars:'onyria-stars-dsc07557'};
  const covers=document.getElementById('category-covers');
  const orderedCovers=Object.entries(coverPhotos);
  if(covers)for(const [category,id] of orderedCovers){
    const photo=siteContent.photos.find(p=>p.id===id);
    const count=siteContent.photos.filter(p=>p.category===category).length;
    const button=make('a','category-cover');button.href=category+'.html';button.dataset.category=category;
    button.setAttribute('aria-label',`打开${photo.label}，${count}幅影像`);
    const media=make('div','category-cover-image'),img=make('img');
    img.src=photo.src;img.alt=photo.alt;img.width=photo.width;img.height=photo.height;img.loading='lazy';img.decoding='async';media.append(img);
    const caption=make('div','category-cover-caption'),copy=make('div','category-cover-copy');
    copy.append(make('span','category-cover-name',photo.label),make('span','category-cover-count',`${count} 幅影像`));
    const hint=make('span','category-cover-hint');hint.setAttribute('aria-hidden','true');
    hint.innerHTML='<svg width="23" height="23" viewBox="0 0 24 24" fill="none"><path d="M5 19 19 5M6 5h13v13" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    caption.append(copy,hint);media.append(caption);
    button.append(media);covers.append(button);
  }
  document.getElementById('lightbox-close').addEventListener('click',()=>lightbox.close());
  document.getElementById('photo-prev').addEventListener('click',()=>step(-1));
  document.getElementById('photo-next').addEventListener('click',()=>step(1));
  lightbox.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();step(-1);}if(e.key==='ArrowRight'){e.preventDefault();step(1);}});
  lightbox.addEventListener('close',unlock);
  let touchX=null,touchY=null;
  const lightboxImage=document.getElementById('lightbox-image');
  lightboxImage.addEventListener('touchstart',e=>{touchX=e.changedTouches[0].clientX;touchY=e.changedTouches[0].clientY;},{passive:true});
  lightboxImage.addEventListener('touchend',e=>{if(touchX===null)return;const dx=e.changedTouches[0].clientX-touchX,dy=e.changedTouches[0].clientY-touchY;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy))step(dx<0?1:-1);touchX=null;},{passive:true});
  document.querySelectorAll('[data-article]').forEach(button=>button.addEventListener('click',()=>{
    const article=siteContent.articles[Number(button.dataset.article)];opener=button;
    document.getElementById('article-title').textContent=article.title;
    document.getElementById('article-tag').textContent=article.tag;
    document.getElementById('article-body').replaceChildren(...article.paragraphs.map(text=>make('p','',text)));
    articleDialog.showModal();articleDialog.scrollTop=0;lock();
  }));
  document.getElementById('article-close').addEventListener('click',()=>articleDialog.close());
  articleDialog.addEventListener('close',unlock);
  articleDialog.addEventListener('click',e=>{if(e.target===articleDialog){const r=articleDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)articleDialog.close();}});
  const header=document.getElementById('header');
  const onScroll=()=>header.classList.toggle('scrolled',window.scrollY>60);
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();
  // The real content rises over the stationary cover, then hands back to normal scrolling.
  const home=document.getElementById('home'),works=document.getElementById('works');
  const pageContent=document.getElementById('page-content');
  if(home && works && pageContent){
  const dimmer=make('div','page-turn-dimmer');
  dimmer.setAttribute('aria-hidden','true');home.append(dimmer);
  let turningPage=false,wheelQuietUntil=0,settleTimer=0,touchOrigin=null;
  // offsetTop is unaffected by the temporary animation transform.
  const worksTop=()=>pageContent.offsetTop;
  const atHome=()=>window.scrollY<worksTop()-4;
  const atWorksStart=()=>Math.abs(window.scrollY-worksTop())<8;
  const transitionDirection=delta=>delta>0&&atHome()?1:delta<0&&atWorksStart()?-1:0;
  const activeDialog=()=>Boolean(document.querySelector('dialog[open]'));
  async function turnPage(direction){
    if(turningPage||activeDialog())return;
    turningPage=true;clearTimeout(settleTimer);
    const target=direction>0?works:home,animations=[];
    const move=()=>{
      window.scrollTo({top:direction>0?worksTop():0,behavior:'instant'});
      history.replaceState(history.state,'',direction>0?'#works':'#home');
      target.setAttribute('tabindex','-1');target.focus({preventScroll:true});
    };
    try{
      if(reducedMotion()||!pageContent.animate){move();return;}
      // Begin at an exact boundary so trackpads, touch and scrollbar settling agree.
      window.scrollTo({top:direction>0?0:worksTop(),behavior:'instant'});
      const distance=worksTop();
      home.style.transform=`translateY(${window.scrollY}px)`;
      document.body.classList.add('is-page-turning');
      header.classList.add('scrolled');
      const down=direction>0;
      const contentAnimation=pageContent.animate([
        {transform:'translateY(0)',filter:down?'brightness(.9)':'brightness(1)'},
        {transform:`translateY(${down?-distance:distance}px)`,filter:down?'brightness(1)':'brightness(.9)'}
      ],{duration:620,easing:'cubic-bezier(.22,.75,.25,1)',fill:'forwards'});
      const shadeAnimation=dimmer.animate([{opacity:down ? 0 : .2},{opacity:down ? .2 : 0}],
        {duration:620,easing:'ease-in-out',fill:'forwards'});
      animations.push(contentAnimation,shadeAnimation);
      await contentAnimation.finished;
    }catch{
      // A cancelled animation must still end on a usable page.
    }finally{
      // These synchronous operations happen together before the next paint.
      animations.forEach(animation=>animation.cancel());
      home.style.transform='';document.body.classList.remove('is-page-turning');
      move();onScroll();
      turningPage=false;wheelQuietUntil=performance.now()+180;
    }
  }
  window.addEventListener('wheel',event=>{
    if(activeDialog()||event.ctrlKey||event.metaKey||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;
    if(turningPage||performance.now()<wheelQuietUntil){event.preventDefault();return;}
    if(Math.abs(event.deltaY)<2)return;
    const direction=transitionDirection(event.deltaY);
    if(direction){event.preventDefault();void turnPage(direction);}
  },{passive:false});
  window.addEventListener('keydown',event=>{
    if(activeDialog()||event.defaultPrevented||event.altKey||event.ctrlKey||event.metaKey)return;
    if(event.target.closest?.('input,textarea,select,button,a,[contenteditable="true"]'))return;
    const down=['ArrowDown','PageDown',' '].includes(event.key)&&!event.shiftKey;
    const up=['ArrowUp','PageUp'].includes(event.key)||(event.key===' '&&event.shiftKey);
    const direction=down?transitionDirection(1):up?transitionDirection(-1):0;
    if(turningPage&&(down||up)){event.preventDefault();return;}
    if(direction){event.preventDefault();void turnPage(direction);}
  });
  window.addEventListener('touchstart',event=>{
    if(event.touches.length!==1||activeDialog()){touchOrigin=null;return;}
    touchOrigin={x:event.touches[0].clientX,y:event.touches[0].clientY};
  },{passive:true});
  window.addEventListener('touchmove',event=>{
    if(!touchOrigin||event.touches.length!==1||activeDialog())return;
    const dx=touchOrigin.x-event.touches[0].clientX,dy=touchOrigin.y-event.touches[0].clientY;
    if(Math.abs(dy)<24||Math.abs(dx)>Math.abs(dy))return;
    const direction=transitionDirection(dy);
    if(turningPage||direction){event.preventDefault();if(!turningPage)void turnPage(direction);}
  },{passive:false});
  window.addEventListener('touchend',()=>{touchOrigin=null;},{passive:true});
  window.addEventListener('touchcancel',()=>{touchOrigin=null;},{passive:true});
  window.addEventListener('scroll',()=>{
    clearTimeout(settleTimer);
    if(turningPage||activeDialog())return;
    settleTimer=setTimeout(()=>{
      const top=worksTop(),y=window.scrollY;
      if(!turningPage&&!activeDialog()&&y>4&&y<top-4)void turnPage(y>=top/2?1:-1);
    },180);
  },{passive:true});
  document.querySelectorAll('a[href="#works"],a[href="#home"]').forEach(link=>{
    link.addEventListener('click',async event=>{
      if(event.defaultPrevented||activeDialog()||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      const toHome=link.getAttribute('href')==='#home';
      if((toHome&&window.scrollY>4)||(!toHome&&atHome())){
        event.preventDefault();

        void turnPage(toHome?-1:1);
      }
    });
  });
  }
  document.getElementById('year').textContent=new Date().getFullYear();
  siteContent.credits.forEach(c=>{const li=make('li'),link=make('a','',c.author),license=make('a','',c.license);link.href=c.url;license.href=c.licenseUrl;for(const a of [link,license]){a.target='_blank';a.rel='noopener noreferrer';}li.append(make('span','',`${c.title} · `),link,make('span','',' · '),license,make('span','','；已缩放并转为 WebP，页面按版式裁切显示。'));document.getElementById('credits-list').append(li);});
  renderGallery();
})();
